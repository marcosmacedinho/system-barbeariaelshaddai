<template>
    <div class="feedback-view">
      <h2>Feedback</h2>
      <CommentSection :comments="comments" @addComment="addComment" />
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import CommentSection from '@/components/CommentSection.vue';
  
  const comments = ref([]); // Certifique-se de que isso é um ref
  
  const addComment = (newComment) => {
    comments.value.push(newComment); // Adiciona o novo comentário
  };
  </script>
  
  <style scoped>
  .feedback-view {
    padding: 20px;
  }
  </style>
    