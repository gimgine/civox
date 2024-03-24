<template>
  <div class="flex items-center justify-center h-screen">
    <prime-card>
      <template #title>
        <div class="flex items-center justify-center w-full">
          <prime-button class="flex-1" icon="pi pi-arrow-left" text rounded @click="$router.push({ name: 'home' })" />
          <span class="flex-[4] text-center">Sign In</span>
          <span class="flex-1"></span>
        </div>
      </template>
      <template #content>
        <div class="flex flex-col gap-3 px-8">
          <div class="flex flex-col gap-2">
            <label for="loginUsername">Username</label>
            <input-text id="loginUsername" v-model="usernameText" :invalid="usernameInvalid" />
            <p class="text-red-500 text-sm italic">{{ usernameErrorText }}</p>
          </div>

          <div class="flex flex-col gap-2">
            <label for="loginPassword">Password</label>
            <prime-password id="loginPassword" :feedback="false" toggle-mask v-model="passwordText" :invalid="passwordInvalid" />
            <p class="text-red-500 text-sm italic">{{ passwordErrorText }}</p>
          </div>

          <div class="flex flex-col items-center justify-center w-full">
            <prime-button class="w-full mt-2" label="Submit" @click="login" :loading="loginLoading" />
            <p class="mt-1 text-red-500 text-sm italic self-start">{{ errorText }}</p>
          </div>

          <a
            class="mt-2 hover:underline cursor-pointer text-sm text-center text-[var(--primary-color)]"
            @click="$router.push({ name: 'createAccount' })"
          >
            Create an Account
          </a>
        </div>
      </template>
    </prime-card>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import pb from '@/util/pocketbase';
import PrimeButton from 'primevue/button';
import PrimeCard from 'primevue/card';
import InputText from 'primevue/inputtext';
import PrimePassword from 'primevue/password';
import { ref } from 'vue';

const usernameInvalid = ref(false);
const passwordInvalid = ref(false);
const loginLoading = ref(false);

const usernameErrorText = ref('');
const passwordErrorText = ref('');

const usernameText = ref('');
const passwordText = ref('');
const errorText = ref('');

const login = async () => {
  pb.authStore.clear();

  errorText.value = '';

  passwordErrorText.value = '';
  usernameErrorText.value = '';

  usernameInvalid.value = false;
  passwordInvalid.value = false;

  if (usernameText.value.length === 0) {
    usernameErrorText.value = 'Username is required.';
    usernameInvalid.value = true;
    return;
  }

  if (passwordText.value.length === 0) {
    passwordErrorText.value = 'Password is required.';
    passwordInvalid.value = true;
    return;
  }

  loginLoading.value = true;
  try {
    await pb.collection('users').authWithPassword(usernameText.value, passwordText.value);
  } catch {
    errorText.value = 'Username/password was incorrect.';
    return;
  } finally {
    loginLoading.value = false;
  }

  if (pb.authStore.isValid) {
    router.push({ name: 'home' });
  } else {
    errorText.value = 'Something went wrong. Please try again.';
  }
};
</script>
