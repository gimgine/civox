<template>
  <div class="flex items-center justify-center h-screen">
    <prime-card>
      <template #title>
        <div class="flex items-center justify-center w-full">
          <prime-button class="flex-1" icon="pi pi-arrow-left" text rounded @click="$router.push({ name: 'login' })" />
          <span class="flex-[4] text-center">Create Account</span>
          <span class="flex-1"></span>
        </div>
      </template>
      <template #content>
        <div class="flex flex-col gap-3 px-8">
          <div class="flex flex-col gap-2">
            <label for="createUsername">Username</label>
            <input-text id="createUsername" v-model="usernameText" :invalid="usernameInvalid" />
            <p class="text-red-500 text-sm italic">{{ usernameErrorText }}</p>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center">
              <label for="createPassword">Password</label>
              <p class="text-xs italic pt-1" for="createPassword">>= 8 characters</p>
            </div>
            <prime-password id="createPassword" toggle-mask v-model="passwordText" :invalid="passwordInvalid" />
            <p class="text-red-500 text-sm italic">{{ passwordErrorText }}</p>
          </div>

          <div class="flex flex-col gap-2">
            <label for="createConfirmPassword">Confirm Password</label>
            <prime-password
              id="createConfirmPassword"
              :feedback="false"
              toggle-mask
              v-model="confirmPasswordText"
              :invalid="confirmPasswordInvalid"
            />
            <p class="text-red-500 text-sm italic">{{ confirmPasswordErrorText }}</p>
          </div>

          <div class="flex flex-col items-center justify-center">
            <prime-button class="mt-4 w-full" label="Create" @click="create" :loading="createLoading" />
            <p class="mt-1 text-red-500 text-sm italic text-center">{{ errorText }}</p>
          </div>
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
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

const toast = useToast();

const usernameInvalid = ref(false);
const passwordInvalid = ref(false);
const confirmPasswordInvalid = ref(false);

const usernameErrorText = ref('');
const passwordErrorText = ref('');
const confirmPasswordErrorText = ref('');

const usernameText = ref('');
const passwordText = ref('');
const confirmPasswordText = ref('');
const errorText = ref('');
const createLoading = ref(false);

const create = async () => {
  pb.authStore.clear();

  errorText.value = '';

  passwordErrorText.value = '';
  usernameErrorText.value = '';
  confirmPasswordErrorText.value = '';

  usernameInvalid.value = false;
  passwordInvalid.value = false;
  confirmPasswordInvalid.value = false;

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

  if (passwordText.value.length < 8) {
    passwordErrorText.value = 'Must be 8 or more characters.';
    passwordInvalid.value = true;
    return;
  }

  if (confirmPasswordText.value.length === 0) {
    confirmPasswordErrorText.value = 'Confirm password is required.';
    confirmPasswordInvalid.value = true;
    return;
  }

  if (passwordText.value !== confirmPasswordText.value) {
    confirmPasswordErrorText.value = 'Passwords do not match.';
    confirmPasswordInvalid.value = true;
    return;
  }

  createLoading.value = true;
  pb.collection('users')
    .create({ username: usernameText.value, password: passwordText.value, passwordConfirm: confirmPasswordText.value })
    .then(() => {
      toast.add({ severity: 'success', summary: 'Success', detail: 'Your account was created successfully.', life: 3000 });
      router.push({ name: 'login' });
    })
    .catch((err) => {
      if (err.data.data.username.code === 'validation_invalid_username') {
        usernameErrorText.value = 'Username is already in use.';
        usernameInvalid.value = true;
      } else {
        errorText.value = 'Something went wrong.';
      }
    })
    .finally(() => (createLoading.value = false));
};
</script>

<style>
.p-password-input {
  width: 100%;
}
</style>
