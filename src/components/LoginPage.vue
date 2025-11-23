<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>TripSync</h1>
        <p class="subtitle">Collaborative travel planning made easy</p>
      </div>

      <div class="login-tabs">
        <button
          :class="['tab', { active: activeTab === 'login' }]"
          @click="activeTab = 'login'"
        >
          Login
        </button>
        <button
          :class="['tab', { active: activeTab === 'register' }]"
          @click="activeTab = 'register'"
        >
          Sign Up
        </button>
      </div>

      <!-- Login Form -->
      <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Username</label>
          <input
            v-model="loginForm.username"
            type="text"
            required
            placeholder="Enter your username"
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input
            v-model="loginForm.password"
            type="password"
            required
            placeholder="Enter your password"
            :disabled="loading"
          />
        </div>
        <div v-if="loginError" class="error-message">
          {{ loginError }}
        </div>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <!-- Register Form -->
      <form v-if="activeTab === 'register'" @submit.prevent="handleRegister" class="login-form">
        <div class="form-group">
          <label>Username</label>
          <input
            v-model="registerForm.username"
            type="text"
            required
            placeholder="Choose a username"
            :disabled="loading"
          />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>First Name</label>
            <input
              v-model="registerForm.firstName"
              type="text"
              required
              placeholder="First name"
              :disabled="loading"
            />
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input
              v-model="registerForm.lastName"
              type="text"
              required
              placeholder="Last name"
              :disabled="loading"
            />
          </div>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input
            v-model="registerForm.password"
            type="password"
            required
            placeholder="Choose a password"
            :disabled="loading"
          />
        </div>
        <div v-if="registerError" class="error-message">
          {{ registerError }}
        </div>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Sign Up' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';

const emit = defineEmits<{
  (e: 'authenticated'): void;
}>();

const { login, register } = useAuth();
const activeTab = ref<'login' | 'register'>('login');
const loading = ref(false);
const loginError = ref('');
const registerError = ref('');

const loginForm = ref({
  username: '',
  password: '',
});

const registerForm = ref({
  username: '',
  firstName: '',
  lastName: '',
  password: '',
});

async function handleLogin() {
  loading.value = true;
  loginError.value = '';
  
  const result = await login(loginForm.value.username, loginForm.value.password);
  
  if (result.success) {
    emit('authenticated');
  } else {
    loginError.value = result.error || 'Login failed';
  }
  
  loading.value = false;
}

async function handleRegister() {
  loading.value = true;
  registerError.value = '';
  
  const result = await register(
    registerForm.value.username,
    registerForm.value.password,
    registerForm.value.firstName,
    registerForm.value.lastName
  );
  
  if (result.success) {
    emit('authenticated');
  } else {
    registerError.value = result.error || 'Registration failed';
  }
  
  loading.value = false;
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-container {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 2.5rem;
  color: #42b983;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1rem;
}

.login-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
}

.tab {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: #333;
}

.tab.active {
  color: #42b983;
  border-bottom-color: #42b983;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.form-group input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #42b983;
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  border: 1px solid #fcc;
}

.btn-primary {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background: #35a372;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>

