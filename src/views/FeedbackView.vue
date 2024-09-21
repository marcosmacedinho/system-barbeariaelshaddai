<script setup>
import { ref, onMounted } from 'vue';
import { db } from '@/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import CommentSection from '@/components/CommentSection.vue'; // Import do componente de comentários

// Referências para os dados
const comments = ref([]);

// Função para configurar a escuta em tempo real
const fetchCommentsRealTime = () => {
    const commentsCollection = collection(db, 'comments');

    // Adicionando a escuta em tempo real com onSnapshot
    onSnapshot(commentsCollection, (snapshot) => {
        comments.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    });
};

onMounted(() => {
    fetchCommentsRealTime(); // Inicia a escuta quando o componente é montado
});
</script>

<template>
    <div>
        <!-- Componente de Comentários -->
        <CommentSection :comments="comments" />
    </div>
</template>
