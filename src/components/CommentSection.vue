<script setup>
import { ref, onMounted } from 'vue';
import { auth, db } from '@/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useAlert } from '@/stores/alert';

const emit = defineEmits(['addComment']);
const alert = useAlert();

const newComment = ref('');
const comments = ref([]);
const currentUser = ref(null);
const isAdmin = ref(false);

const fetchUserRole = async () => {
    const user = auth.currentUser;
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            currentUser.value = userData; // Armazena os dados do usuário
            isAdmin.value = userData.role === 'admin'; // Verifica se é admin
        }
    }
};

const submitComment = async () => {
    if (newComment.value.trim()) {
        const commentData = {
            text: newComment.value,
            author: currentUser.value.name,
            authorId: currentUser.value.uid,
            createdAt: new Date().toISOString()
        };
        emit('addComment', commentData);
        comments.value.push(commentData); // Adiciona o comentário localmente
        newComment.value = '';
        alert.show("Comentário feito. Muito obrigado por nos ajudar!", 200);
    }
};

const deleteComment = (commentId) => {
    comments.value = comments.value.filter(comment => comment.id !== commentId); // Remove o comentário localmente
};

const isAuthorOrAdmin = (authorId) => {
    return currentUser.value && (currentUser.value.uid === authorId || isAdmin.value);
};

onMounted(() => {
    fetchUserRole(); // Carrega o papel do usuário ao montar o componente
});
</script>

<template>
    <div class="comment-section">
        <h3>Comentários</h3>
        <div class="comments-list">
            <div v-for="comment in comments" :key="comment.id" class="comment">
                <p><strong>{{ comment.author }}</strong> - {{ new Date(comment.createdAt).toLocaleString() }}</p>
                <p>{{ comment.text }}</p>
                <button v-if="isAuthorOrAdmin(comment.authorId)" @click="deleteComment(comment.id)"
                    class="delete-button">
                    <span class="material-symbols-rounded">delete</span>
                </button>
            </div>
        </div>
        <div class="input-container">
            <input v-model="newComment" @keyup.enter="submitComment" placeholder="Adicionar um comentário..."
                class="comment-input" />
            <button @click="submitComment" class="submit-button">Enviar</button>
        </div>
    </div>
</template>

<style scoped>
.comment-section {
    margin-top: 20px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
}

.comments-list {
    max-height: 300px;
    overflow-y: auto;
}

.comment {
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background-color: #f9f9f9;
    position: relative;
}

.delete-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: #dc3545;
}

.delete-button:hover {
    color: #c82333;
}

.input-container {
    display: flex;
    margin-top: 10px;
}

.comment-input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.comment-input:focus {
    border-color: #007bff;
    outline: none;
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

.submit-button:hover {
    background-color: #0056b3;
}
</style>
