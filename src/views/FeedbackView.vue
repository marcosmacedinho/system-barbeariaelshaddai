<script setup>
import { ref, onMounted } from 'vue';
import { useAlert } from '@/stores/alert';
import { useUserStore } from '@/stores/userStore';
import { db } from '@/firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

import LOCAL_AVATAR_MALE from '@/assets/avatars/avatar-boy.png';
import LOCAL_AVATAR_FEMALE from '@/assets/avatars/avatar-girl.png';

const AVATAR_BASE_URL_MALE = 'https://avatar.iran.liara.run/public/boy?username=';
const AVATAR_BASE_URL_FEMALE = 'https://avatar.iran.liara.run/public/girl?username=';

const emit = defineEmits(['addComment']);
const alert = useAlert();
const userStore = useUserStore();

const newComment = ref('');
const comments = ref([]);
const currentUser = ref(null);
const isAdmin = ref(false);
const activeMenuId = ref(null); // Ref para armazenar o ID do comentário com o menu ativo

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

const getAvatarUrl = (authorId) => {
    const username = authorId; // Use o ID do autor como username
    return username.endsWith('male')
        ? `${AVATAR_BASE_URL_MALE}${username}`
        : `${AVATAR_BASE_URL_FEMALE}${username}`;
};

// Alternar a visibilidade do menu de ações
const toggleActions = (commentId) => {
    if (activeMenuId.value === commentId) {
        activeMenuId.value = null; // Fechar o menu se já estiver aberto
    } else {
        activeMenuId.value = commentId; // Abrir o menu para o comentário clicado
    }
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
            <div v-for="comment in comments" :key="comment.id" class="comment-bubble" :class="{ 'my-comment': comment.authorId === currentUser.id, 'other-comment': comment.authorId !== currentUser.id }">
                <div class="comment-header">
                    <img :src="getAvatarUrl(comment.authorId)" alt="Avatar" class="avatar"
                         @error="(e) => { e.target.src = comment.authorId.endsWith('male') ? LOCAL_AVATAR_MALE : LOCAL_AVATAR_FEMALE }" />
                    <div class="comment-info">
                        <strong class="comment-author">{{ comment.author }}</strong>
                        <span class="comment-date">{{ new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
                    </div>
                </div>
                <p class="comment-text">{{ comment.text }}</p>

                <!-- Mostrar ações apenas para o autor ou o admin -->
                <div v-if="isAuthorOrAdmin(comment.id)" class="actions">
                    <span @click="toggleActions(comment.id)" class="material-symbols-rounded">more_vert</span>
                    <div v-if="activeMenuId === comment.id" class="action-menu">
                        <button @click="deleteComment(comment.id)" class="action-button">Excluir</button>
                        <button @click="editComment(comment.id, prompt('Edite seu comentário:', comment.text))" class="action-button">Editar</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Campo de novo comentário -->
        <div class="input-container">
            <input v-model="newComment" @keyup.enter="submitComment" placeholder="Digite uma mensagem..." class="comment-input" :disabled="!currentUser" />
            <button @click="submitComment" class="submit-button" :disabled="!currentUser">Enviar</button>
        </div>

        <!-- Alerta de login -->
        <div v-if="!currentUser" class="alert alert-warning mt-2">Faça login para comentar.</div>
    </div>
</template>



<style scoped>
.comment-section {
    margin-top: 20px;
    padding: 20px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-family: 'Arial', sans-serif;
}

.section-title {
    margin-bottom: 15px;
    font-size: 1.5rem;
    color: #007bff;
    text-align: center;
}

.comments-container {
    max-height: 400px;
    overflow-y: auto;
    padding: 10px;
}

.comment-bubble {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
    padding: 12px 16px;
    border-radius: 20px;
    background-color: #f0f0f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: background-color 0.3s;
    position: relative;
}

.my-comment {
    background-color: #dcf8c6; /* Mensagens do usuário */
    align-self: flex-end;
}

.other-comment {
    background-color: #ffffff; /* Mensagens de outros usuários */
    align-self: flex-start;
}

.comment-header {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
}

.avatar {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    margin-right: 10px;
    border: 2px solid #007bff; /* Borda ao redor do avatar */
}

.comment-info {
    display: flex;
    flex-direction: column;
}

.comment-author {
    font-weight: bold;
    font-size: 1rem;
    color: #333;
}

.comment-date {
    font-size: 0.8rem;
    color: #777;
}

.comment-text {
    margin: 5px 0;
    line-height: 1.5;
    font-size: 1rem;
}

.actions {
    position: relative;
    display: flex;
    justify-content: flex-end;
}

.action-menu {
    position: absolute;
    top: 20px;
    right: 0;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    z-index: 10;
}

.action-button {
    padding: 10px 15px;
    cursor: pointer;
    border: none;
    background: none;
    text-align: left;
    color: #007bff;
}

.action-button:hover {
    background-color: #f0f0f0;
}


.input-container {
    display: flex;
    margin-top: 15px;
}

.comment-input {
    flex: 1;
    padding: 10px;
    border: 1px solid #007bff;
    border-radius: 20px;
    background-color: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.submit-button {
    margin-left: 10px;
    padding: 10px 15px;
    border: none;
    border-radius: 20px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s;
}

.submit-button:hover {
    background-color: #0056b3; /* Efeito hover */
}

.alert {
    font-size: 0.8rem;
    color: #d9534f; /* Cor de alerta */
    text-align: center;
}
</style>
