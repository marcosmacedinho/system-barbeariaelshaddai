// src/plugins/mask.js
import { mask } from 'vue-the-mask';

const maskDirective = {
  beforeMount(el, binding) {
    mask(el, binding); // Aplica a máscara quando o elemento é montado
  },
  updated(el, binding) {
    mask(el, binding); // Atualiza a máscara sempre que necessário
  }
};

export default maskDirective;
