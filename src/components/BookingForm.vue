<template>
    <div>
        <form v-if="selectedTime" @submit.prevent="submitForm">
            <div class="mb-3">
                <label for="name" class="form-label">Nome</label>
                <input v-model="formData.name" type="text" class="form-control" id="name" required />
            </div>
            <div class="mb-3">
                <label for="phone" class="form-label">Telefone</label>
                <input v-model="formData.phone" type="text" class="form-control" id="phone" required />
            </div>
            <div class="mb-3">
                <label for="selectedTime" class="form-label">Horário Selecionado</label>
                <input v-model="selectedTime" type="text" class="form-control" id="selectedTime" disabled />
            </div>
            <button type="submit" class="btn btn-primary">Confirmar Agendamento</button>
        </form>
        <p v-else>Selecione um horário para agendar.</p>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { auth, db } from '@/firebaseConfig';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { useAlert } from '@/stores/alert';

const props = defineProps(['selectedTime']);
const alert = useAlert();

const formData = ref({
    name: '',
    phone: ''
});

const selectedTime = ref(props.selectedTime);

const fetchUserData = async (userId) => {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            formData.value.name = userData.name || '';
            formData.value.phone = userData.phone || '';
        } else {
            console.log('Usuário não encontrado no Firestore.');
        }
    } catch (error) {
        alert.show('Erro ao buscar dados do usuário.', 500);
        console.error('Erro ao buscar dados do usuário:', error);
    }
};

const submitForm = async () => {
    if (selectedTime.value) {
        try {
            const user = auth.currentUser;
            if (user) {
                await setDoc(doc(db, 'bookings', user.uid), {
                    ...formData.value,
                    time: selectedTime.value,
                    userId: user.uid
                });

                const docRef = doc(db, 'barbershop', 'dailySchedule');
                const docSnapshot = await getDoc(docRef);
                const schedule = docSnapshot.data().schedule || [];
                const updatedTimes = schedule.flatMap(day => [day.startTime, day.endTime]).filter(time => time !== selectedTime.value);

                await updateDoc(docRef, {
                    availableTimes: updatedTimes
                });

                alert.show('Agendamento confirmado!', 200);

                formData.value = {
                    name: '',
                    phone: ''
                };
                selectedTime.value = null;
            } else {
                alert.show('Usuário não autenticado.', 300);
            }
        } catch (error) {
            alert.show('Erro ao confirmar agendamento.', 500);
        }
    } else {
        alert.show('Por favor, selecione um horário.', 300);
    }
};

watch(() => props.selectedTime, (newValue) => {
    selectedTime.value = newValue;
});

onMounted(() => {
    const user = auth.currentUser;
    if (user) {
        fetchUserData(user.uid);
    } else {
        console.log('Usuário não autenticado.');
    }
});

watch(() => auth.currentUser, (newUser) => {
    if (newUser) {
        fetchUserData(newUser.uid);
    }
});
</script>

<style scoped>
form {
    margin-top: 20px;
}
</style>
