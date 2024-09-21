<script setup>
import { ref, onMounted } from 'vue';
import { useAlert } from '@/stores/alert';
import { useUserStore } from '@/stores/userStore'; 
import { db } from '@/firebaseConfig'; 
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const emit = defineEmits(['addComment']);
const alert = useAlert();
const userStore = useUserStore();

const newComment = ref('');
const comments = ref([]);
const currentUser = ref(null);
const isAdmin = ref(false);
const defaultAvatars = [
  '@/assets/avatars/avatar-boy.png', // Substitua com os caminhos das suas imagens
  '@/assets/avatars/avatar-girl.png'
];

const fetchUserRole = async () => {
  const user = userStore.user;
  if (user) {
    currentUser.value = user;
    isAdmin.value = user.role === 'admin';
  }
};

const fetchComments = async () => {
  const commentsCollection = collection(db, 'comments');
  const commentsSnapshot = await getDocs(commentsCollection);
  comments.value = commentsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

const submitComment = async () => {
  if (newComment.value.trim() && currentUser.value) {
    const commentData = {
      text: newComment.value,
      author: currentUser.value.name,
      authorId: currentUser.value.id,
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'comments'), commentData);
      emit('addComment', commentData);
      comments.value.push(commentData);
      newComment.value = '';
      alert.show("Comentário feito. Muito obrigado por nos ajudar!", 200);
    } catch (error) {
      alert.show("Erro ao enviar comentário. Tente novamente.", 200);
    }
  }
};

const deleteComment = async (commentId) => {
  if (isAuthorOrAdmin(commentId)) {
    await deleteDoc(doc(db, 'comments', commentId));
    comments.value = comments.value.filter(comment => comment.id !== commentId);
    alert.show("Comentário excluído com sucesso!", 200);
  }
};

const editComment = async (commentId, updatedText) => {
  if (isAuthorOrAdmin(commentId)) {
    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, { text: updatedText });
    const commentToUpdate = comments.value.find(comment => comment.id === commentId);
    commentToUpdate.text = updatedText;
    alert.show("Comentário editado com sucesso!", 200);
  }
};

const isAuthorOrAdmin = (commentId) => {
  const comment = comments.value.find(comment => comment.id === commentId);
  return currentUser.value && (currentUser.value.id === comment.authorId || isAdmin.value);
};

onMounted(async () => {
  await fetchUserRole();
  await fetchComments();
});
</script>

<template>
  <div class="comment-section">
    <h3 class="section-title">Comentários</h3>
    <div class="comments-container">
      <div class="comments-list">
        <div v-for="comment in comments" :key="comment.id" class="comment">
          <div class="comment-header">
            <img :src="defaultAvatars[comment.authorId % defaultAvatars.length]" alt="Avatar" class="avatar" />
            <div class="comment-info">
              <strong>{{ comment.author }}</strong>
              <p class="comment-text">{{ comment.text }}</p>
              <span class="comment-date">{{ new Date(comment.createdAt).toLocaleString() }}</span>
            </div>
            <div class="actions">
              <span @click="toggleActions(comment.id)" class="material-symbols-rounded">more_vert</span>
              <div v-if="isAuthorOrAdmin(comment.id)" class="action-menu">
                <button @click="deleteComment(comment.id)" class="action-button">Excluir</button>
                <button @click="editComment(comment.id, prompt('Edite seu comentário:', comment.text))" class="action-button">Editar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="input-container">
        <input v-model="newComment" @keyup.enter="submitComment" placeholder="Adicionar um comentário..." class="comment-input" :disabled="!currentUser" />
        <button @click="submitComment" class="submit-button" :disabled="!currentUser">Enviar</button>
      </div>
    </div>
    <div v-if="!currentUser" class="alert alert-warning mt-2">Faça login para comentar.</div>
  </div>
</template>

<style scoped>
.comment-section {
  margin-top: 20px;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin-bottom: 15px;
  color: #007bff;
}

.comments-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 15px;
}

.comment {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.comment-info {
  flex-grow: 1;
}

.comment-text {
  margin: 5px 0;
}

.comment-date {
  font-size: 0.8rem;
  color: #888;
}

.actions {
  position: relative;
  margin-left: 10px;
}

.action-menu {
  position: absolute;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  z-index: 10;
}

.action-button {
  background: none;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.input-container {
  display: flex;
}

.comment-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.submit-button {
  margin-left: 10px;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

.alert {
  font-size: 0.8rem;
}
</style>
