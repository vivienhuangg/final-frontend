<template>
  <div class="costs-tab">
    <div class="costs-grid">
      <!-- Member Balances -->
      <div class="card">
        <div class="card-header">
          <h2>Member Balances</h2>
        </div>
        <div class="balances-list">
          <div
            v-for="balance in memberBalances"
            :key="balance.travelerId"
            class="balance-item"
            :class="{ positive: balance.balance > 0, negative: balance.balance < 0 }"
          >
            <div class="balance-info">
              <p class="balance-name">{{ getTravelerName(balance.travelerId) }}</p>
              <p class="balance-amount" :class="{ positive: balance.balance > 0, negative: balance.balance < 0 }">
                {{ formatBalance(balance.balance) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Expenses -->
      <div class="card">
        <div class="card-header">
          <h2>Recent Expenses</h2>
          <button class="btn-primary" @click="showAddExpenseDialog = true">
            + Add Expense
          </button>
        </div>
        <div class="expenses-list">
          <div
            v-for="expense in expenses"
            :key="expense.id"
            class="expense-item"
          >
            <div class="expense-info">
              <h3>{{ expense.title }}</h3>
              <p class="expense-details">
                Paid by {{ getTravelerName(expense.paidBy) }} • 
                Split between {{ expense.splitBetween.length }} people
                <span v-if="expense.splitType === 'percentage'"> ({{ expense.splitType }})</span>
              </p>
              <p class="expense-date">{{ formatDate(expense.date) }}</p>
            </div>
            <div class="expense-amount">
              ${{ expense.totalCost.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Expense Dialog -->
    <div v-if="showAddExpenseDialog" class="dialog-overlay" @click="showAddExpenseDialog = false">
      <div class="dialog" @click.stop>
        <h2>Add Expense</h2>
        <form @submit.prevent="addExpense">
          <div class="form-group">
            <label>Title</label>
            <input v-model="newExpense.title" type="text" required placeholder="e.g., Dinner at Joe's" />
          </div>
          <div class="form-group">
            <label>Total Amount</label>
            <input v-model.number="newExpense.totalCost" type="number" step="0.01" required placeholder="0.00" />
          </div>
          <div class="form-group">
            <label>Split Type</label>
            <select v-model="newExpense.splitType">
              <option value="money">Money-based (exact amounts)</option>
              <option value="percentage">Percentage-based</option>
            </select>
          </div>
          <div class="form-group">
            <label>Paid By</label>
            <select v-model="newExpense.paidBy" required>
              <option v-for="traveler in travelers" :key="traveler.id" :value="traveler.id">
                {{ traveler.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Split Between</label>
            <div class="checkbox-group">
              <label v-for="traveler in travelers" :key="traveler.id" class="checkbox-label">
                <input
                  type="checkbox"
                  :value="traveler.id"
                  v-model="newExpense.splitBetween"
                />
                {{ traveler.name }}
              </label>
            </div>
          </div>

          <!-- Advanced Settings Toggle -->
          <div class="form-group">
            <button
              type="button"
              class="btn-link"
              @click="showAdvancedSettings = !showAdvancedSettings"
            >
              {{ showAdvancedSettings ? '▼' : '▶' }} Advanced Settings
            </button>
          </div>

          <!-- Advanced Settings -->
          <div v-if="showAdvancedSettings" class="advanced-settings">
            <div class="form-group">
              <label>Custom Split Amounts</label>
              <p class="help-text">
                <span v-if="newExpense.splitType === 'money'">
                  Enter exact amounts for each person. Total must equal ${{ newExpense.totalCost.toFixed(2) }}
                </span>
                <span v-else>
                  Enter percentages for each person. Total must equal 100%
                </span>
              </p>
              <div class="custom-splits">
                <div
                  v-for="travelerId in newExpense.splitBetween"
                  :key="travelerId"
                  class="custom-split-item"
                >
                  <label class="split-label">
                    {{ getTravelerName(travelerId) }}
                    <span v-if="newExpense.splitType === 'money'">($)</span>
                    <span v-else>(%)</span>
                  </label>
                  <input
                    v-model.number="customSplits[travelerId]"
                    type="number"
                    :step="newExpense.splitType === 'money' ? '0.01' : '0.1'"
                    :placeholder="newExpense.splitType === 'money' ? '0.00' : '0'"
                    class="split-input"
                    @input="validateSplits"
                  />
                </div>
              </div>
              <div v-if="splitError" class="error-message">
                {{ splitError }}
              </div>
              <div v-if="splitTotal" class="split-total">
                Total: 
                <span :class="{ valid: isSplitValid, invalid: !isSplitValid }">
                  {{ splitTotal }}
                  <span v-if="newExpense.splitType === 'money'">$</span>
                  <span v-else>%</span>
                </span>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="showAddExpenseDialog = false">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="!canSubmit">Add Expense</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Expense, Traveler, MemberBalance } from '../../types/trip';

const props = defineProps<{
  expenses: Expense[];
  travelers: Traveler[];
}>();

const emit = defineEmits<{
  (e: 'add-expense', expense: Expense): void;
}>();

const showAddExpenseDialog = ref(false);
const showAdvancedSettings = ref(false);
const customSplits = ref<Record<string, number>>({});
const splitError = ref('');
const newExpense = ref({
  title: '',
  totalCost: 0,
  paidBy: '',
  splitBetween: [] as string[],
  splitType: 'money' as 'money' | 'percentage',
});

const memberBalances = computed<MemberBalance[]>(() => {
  const balances: Record<string, number> = {};
  
  // Initialize all travelers with 0 balance
  props.travelers.forEach(t => {
    balances[t.id] = 0;
  });

  // Calculate balances from expenses
  props.expenses.forEach(expense => {
    // Person who paid gets positive balance (owed money)
    balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.totalCost;
    
    // People who split get negative balance (owe money)
    expense.splitBetween.forEach(splitUser => {
      const cost = splitUser.cost || 0;
      balances[splitUser.userId] = (balances[splitUser.userId] || 0) - cost;
    });
  });

  return Object.entries(balances).map(([travelerId, balance]) => ({
    travelerId,
    balance,
  }));
});

function getTravelerName(travelerId: string): string {
  return props.travelers.find(t => t.id === travelerId)?.name || 'Unknown';
}

function formatBalance(balance: number): string {
  if (balance > 0) {
    return `+$${balance.toFixed(2)}`;
  } else if (balance < 0) {
    return `-$${Math.abs(balance).toFixed(2)}`;
  }
  return '$0.00';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const splitTotal = computed(() => {
  if (!showAdvancedSettings.value || newExpense.value.splitBetween.length === 0) {
    return null;
  }
  const total = newExpense.value.splitBetween.reduce((sum, id) => {
    return sum + (customSplits.value[id] || 0);
  }, 0);
  return total.toFixed(2);
});

const isSplitValid = computed(() => {
  if (!showAdvancedSettings.value || newExpense.value.splitBetween.length === 0) {
    return true; // Valid if not using advanced settings
  }
  const total = parseFloat(splitTotal.value || '0');
  if (newExpense.value.splitType === 'money') {
    return Math.abs(total - newExpense.value.totalCost) < 0.01;
  } else {
    return Math.abs(total - 100) < 0.1;
  }
});

const canSubmit = computed(() => {
  if (newExpense.value.splitBetween.length === 0) return false;
  if (showAdvancedSettings.value) {
    return isSplitValid.value && !splitError.value;
  }
  return true;
});

function validateSplits() {
  splitError.value = '';
  if (!showAdvancedSettings.value) return;

  const total = parseFloat(splitTotal.value || '0');
  
  if (newExpense.value.splitType === 'money') {
    const diff = Math.abs(total - newExpense.value.totalCost);
    if (diff >= 0.01) {
      splitError.value = `Total must equal $${newExpense.value.totalCost.toFixed(2)}. Current: $${total.toFixed(2)}`;
    }
  } else {
    const diff = Math.abs(total - 100);
    if (diff >= 0.1) {
      splitError.value = `Total must equal 100%. Current: ${total.toFixed(1)}%`;
    }
  }
}

// Reset custom splits when splitBetween changes
watch(() => newExpense.value.splitBetween, () => {
  if (showAdvancedSettings.value) {
    customSplits.value = {};
    splitError.value = '';
  }
});

function addExpense() {
  if (newExpense.value.splitBetween.length === 0) {
    alert('Please select at least one person to split with');
    return;
  }

  if (showAdvancedSettings.value && !isSplitValid.value) {
    alert('Please fix the split amounts before submitting');
    return;
  }

  // Calculate split amounts
  let splitBetween;
  if (showAdvancedSettings.value) {
    // Use custom splits
    splitBetween = newExpense.value.splitBetween.map(userId => ({
      userId,
      cost: newExpense.value.splitType === 'money' ? (customSplits.value[userId] || 0) : undefined,
      percentage: newExpense.value.splitType === 'percentage' ? (customSplits.value[userId] || 0) : undefined,
    }));
  } else {
    // Equal split
    const splitAmount = newExpense.value.totalCost / newExpense.value.splitBetween.length;
    splitBetween = newExpense.value.splitBetween.map(userId => ({
      userId,
      cost: newExpense.value.splitType === 'money' ? splitAmount : undefined,
      percentage: newExpense.value.splitType === 'percentage' ? 100 / newExpense.value.splitBetween.length : undefined,
    }));
  }

  const expense: Expense = {
    id: Date.now().toString(),
    title: newExpense.value.title,
    totalCost: newExpense.value.totalCost,
    paidBy: newExpense.value.paidBy,
    splitBetween,
    date: new Date().toISOString().split('T')[0],
    splitType: newExpense.value.splitType,
  };

  emit('add-expense', expense);
  showAddExpenseDialog.value = false;
  showAdvancedSettings.value = false;
  customSplits.value = {};
  splitError.value = '';
  newExpense.value = {
    title: '',
    totalCost: 0,
    paidBy: '',
    splitBetween: [],
    splitType: 'money',
  };
}
</script>

<style scoped>
.costs-tab {
  width: 100%;
}

.costs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-header h2 {
  font-size: 1.25rem;
  color: #333;
}

.balances-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.balance-item {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #e0e0e0;
}

.balance-item.positive {
  border-left-color: #42b983;
}

.balance-item.negative {
  border-left-color: #ff9800;
}

.balance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-name {
  font-weight: 500;
  color: #333;
}

.balance-amount {
  font-size: 1.1rem;
  font-weight: 600;
}

.balance-amount.positive {
  color: #42b983;
}

.balance-amount.negative {
  color: #ff9800;
}

.expenses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.expense-info {
  flex: 1;
}

.expense-info h3 {
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.expense-details {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.expense-date {
  font-size: 0.8rem;
  color: #888;
}

.expense-amount {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.btn-primary {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #35a372;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.dialog h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: normal;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-link {
  background: none;
  border: none;
  color: #42b983;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 0;
  text-align: left;
  transition: color 0.2s;
}

.btn-link:hover {
  color: #35a372;
}

.advanced-settings {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
  border: 1px solid #e0e0e0;
}

.help-text {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 1rem;
}

.custom-splits {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.custom-split-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.split-label {
  min-width: 120px;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.split-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.split-total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  font-weight: 600;
  color: #333;
}

.split-total .valid {
  color: #42b983;
}

.split-total .invalid {
  color: #ff9800;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  border: 1px solid #fcc;
  margin-top: 1rem;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>

