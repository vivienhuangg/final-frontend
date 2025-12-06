<template>
  <div class="costs-tab">
    <div class="space-y-6">
      <!-- Trip Expenses Card -->
      <div class="card">
        <div class="card-gradient-gold"></div>
        <div class="card-header">
          <div>
            <h2 class="card-title">Trip Expenses</h2>
            <p class="card-description">Track costs and split them among the group</p>
          </div>
          <button class="btn-add-expense" @click="showAddExpenseDialog = true">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Expense
          </button>
        </div>
      </div>

      <div class="costs-grid">
        <!-- Member Balances -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Member Balances</h2>
            <p class="card-description">Who owes and who's owed</p>
          </div>
          <div class="card-content">
            <div class="balances-list">
              <div
                v-for="(balance, index) in memberBalances"
                :key="balance.travelerId"
                class="balance-item"
                :class="{ positive: balance.balance > 0, negative: balance.balance < 0, zero: Math.abs(balance.balance) < 0.01 }"
              >
                <div class="balance-avatar" :style="{ backgroundColor: getAvatarColor(index) }">
                  {{ getTravelerInitial(balance.travelerId) }}
                </div>
                <div class="balance-info">
                  <p class="balance-name">{{ getTravelerDisplayName(balance.travelerId) }}</p>
                  <p class="balance-status">
                    <span v-if="Math.abs(balance.balance) < 0.01" class="status-settled">All settled up</span>
                    <span v-else-if="balance.balance > 0" class="status-owed">is owed money</span>
                    <span v-else class="status-owes">owes money</span>
                  </p>
                </div>
                <div class="balance-amount-wrapper">
                  <span v-if="Math.abs(balance.balance) < 0.01" class="badge-settled">✓</span>
                  <div v-else class="balance-amount" :class="{ positive: balance.balance > 0, negative: balance.balance < 0 }">
                    <span class="amount-label">{{ balance.balance > 0 ? 'gets back' : 'owes' }}</span>
                    <span class="amount-value">{{ formatBalance(Math.abs(balance.balance)) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Settlement Suggestions -->
            <div v-if="settlementSuggestions.length > 0" class="settlement-section">
              <h3 class="settlement-title">How to Settle Up</h3>
              <div class="settlement-list">
                <div v-for="(suggestion, idx) in settlementSuggestions" :key="idx" class="settlement-item">
                  <span class="settlement-from">{{ getTravelerDisplayName(suggestion.from) }}</span>
                  <span class="settlement-arrow">→</span>
                  <span class="settlement-to">{{ getTravelerDisplayName(suggestion.to) }}</span>
                  <span class="settlement-amount">{{ formatBalance(suggestion.amount) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Expenses -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Recent Expenses</h2>
            <p class="card-description">All trip expenses</p>
          </div>
          <div class="card-content">
            <div class="expenses-list">
              <div v-if="expenses.length === 0" class="empty-state">
                <p>No expenses yet</p>
              </div>
              <div
                v-for="expense in expenses"
                :key="expense.id"
                class="expense-item"
              >
                <div class="expense-info">
                  <div class="expense-header">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3>{{ expense.title }}</h3>
                  </div>
                  <p class="expense-details">
                    Paid by {{ getTravelerDisplayName(expense.paidBy) }} · Split {{ expense.splitBetween?.length || 1 }} ways
                  </p>
                  <p class="expense-per-person">
                    {{ getSplitDescription(expense) }}
                  </p>
                </div>
                <div class="expense-amount-wrapper">
                  <span class="expense-amount">{{ formatCurrency(expense.totalCost) }}</span>
                  <button class="btn-delete-expense" @click="handleDeleteExpense(expense.id)">
                    <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
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
                    {{ getTravelerDisplayName(travelerId) }}
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
  (e: 'delete-expense', id: string): void;
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
    // Guard against invalid totalCost
    const validTotalCost = typeof expense.totalCost === 'number' && !isNaN(expense.totalCost) ? expense.totalCost : 0;

    // Person who paid gets positive balance (owed money)
    balances[expense.paidBy] = (balances[expense.paidBy] || 0) + validTotalCost;

    // People who split get negative balance (owe money)
    if (Array.isArray(expense.splitBetween)) {
      expense.splitBetween.forEach(splitUser => {
        // Handle both object shape and ensure userId exists
        const userId = typeof splitUser === 'string' ? splitUser : splitUser.userId;
        const cost = typeof splitUser === 'object' && splitUser.cost ? splitUser.cost : (validTotalCost / expense.splitBetween.length);
        if (userId && balances[userId] !== undefined) {
          balances[userId] = (balances[userId] || 0) - cost;
        }
      });
    }
  });

  return Object.entries(balances).map(([travelerId, balance]) => ({
    travelerId,
    balance,
  }));
});

// Calculate simplified settlement suggestions (who should pay who)
const settlementSuggestions = computed(() => {
  const suggestions: Array<{ from: string; to: string; amount: number }> = [];

  // Get people who owe (negative balance) and people who are owed (positive balance)
  const debtors = memberBalances.value
    .filter(b => b.balance < -0.01)
    .map(b => ({ id: b.travelerId, amount: Math.abs(b.balance) }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending

  const creditors = memberBalances.value
    .filter(b => b.balance > 0.01)
    .map(b => ({ id: b.travelerId, amount: b.balance }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending

  // Simple greedy algorithm to minimize transactions
  let debtorIdx = 0;
  let creditorIdx = 0;

  while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
    const debtor = debtors[debtorIdx];
    const creditor = creditors[creditorIdx];

    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0.01) {
      suggestions.push({
        from: debtor.id,
        to: creditor.id,
        amount: Math.round(amount * 100) / 100,
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) debtorIdx++;
    if (creditor.amount < 0.01) creditorIdx++;
  }

  return suggestions;
});

function getTravelerDisplayName(travelerId: string): string {
  const t = props.travelers.find(t => t.id === travelerId);
  if (!t) return 'Unknown';

  // Prefer first and last name if available
  if (t.firstName && t.lastName) {
    return `${t.firstName} ${t.lastName}`;
  }

  // Fallback to username or id
  return t.username || t.id || 'Unknown';
}

function getTravelerUsername(travelerId: string): string {
  // Keep for backward compatibility, but use display name
  return getTravelerDisplayName(travelerId);
}

function getTravelerInitial(travelerId: string): string {
  const t = props.travelers.find(t => t.id === travelerId);
  if (!t) return '?';

  // Prefer first letter of first name if available
  if (t.firstName) {
    return t.firstName.charAt(0).toUpperCase();
  }

  // Fallback to first letter of display name
  const displayName = getTravelerDisplayName(travelerId);
  return displayName.charAt(0).toUpperCase();
}

function formatBalance(balance: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(balance);
}

function formatCurrency(amount: number): string {
  // Guard against NaN, null, undefined
  const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(validAmount);
}

function getAvatarColor(index: number): string {
  const colors = ['#14b8a6', '#ff7b6b', '#7ba3d1', '#f4c542', '#8ba888'];
  return colors[index % colors.length];
}

function handleDeleteExpense(expenseId: string) {
  emit('delete-expense', expenseId);
}

function hasCustomSplit(expense: Expense): boolean {
  if (!Array.isArray(expense.splitBetween) || expense.splitBetween.length <= 1) {
    return false;
  }

  if (expense.splitType === "money") {
    const costs = (expense.splitBetween as any[])
      .map((s) => typeof s.cost === "number" ? s.cost : Number(s.cost))
      .filter((c) => typeof c === "number" && !isNaN(c));

    if (costs.length > 1) {
      // Check if all costs are equal (within small tolerance)
      const first = costs[0];
      return costs.some((c) => Math.abs(c - first) > 0.01);
    }
  } else if (expense.splitType === "percentage") {
    const percentages = (expense.splitBetween as any[])
      .map((s) => typeof s.percentage === "number" ? s.percentage : Number(s.percentage))
      .filter((p) => typeof p === "number" && !isNaN(p));

    if (percentages.length > 1) {
      const first = percentages[0];
      return percentages.some((p) => Math.abs(p - first) > 0.1);
    }
  }

  return false;
}

function getSplitDescription(expense: Expense): string {
  if (!hasCustomSplit(expense)) {
    return `${formatCurrency(getPerPersonAmount(expense))} per person`;
  }

  // Custom split - show range or "varies"
  if (expense.splitType === "money" && Array.isArray(expense.splitBetween)) {
    const costs = (expense.splitBetween as any[])
      .map((s) => typeof s.cost === "number" ? s.cost : Number(s.cost))
      .filter((c) => typeof c === "number" && !isNaN(c));

    if (costs.length > 0) {
      const min = Math.min(...costs);
      const max = Math.max(...costs);
      return `${formatCurrency(min)} - ${formatCurrency(max)} (custom split)`;
    }
  }

  return "Custom split";
}

function getPerPersonAmount(expense: Expense): number {
  const total =
    typeof expense.totalCost === "number"
      ? expense.totalCost
      : Number(expense.totalCost) || 0;

  if (
    Array.isArray(expense.splitBetween) &&
    expense.splitBetween.length > 0 &&
    expense.splitType === "money"
  ) {
    const costs = (expense.splitBetween as any[])
      .map((s) =>
        typeof s.cost === "number" ? s.cost : Number(s.cost),
      )
      .filter((c) => typeof c === "number" && !isNaN(c));

    if (costs.length > 0) {
      const sum = costs.reduce((acc, c) => acc + c, 0);
      return sum / costs.length;
    }
  }

  const count =
    Array.isArray(expense.splitBetween) && expense.splitBetween.length > 0
      ? expense.splitBetween.length
      : 1;

  return total / count;
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

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.costs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.card {
  position: relative;
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 0;
}

.card-gradient-gold {
  height: 6px;
  background: #f4c542;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  padding-bottom: 1rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 0.25rem;
}

.card-description {
  font-size: 0.875rem;
  color: #64748b;
}

.card-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.btn-add-expense {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #f4c542;
  color: #1e3a5f;
  border: none;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.btn-add-expense:hover {
  background: #e0b138;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.w-4 {
  width: 1rem;
}

.h-4 {
  height: 1rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.text-green-600 {
  color: #16a34a;
}

.text-red-500 {
  color: #ef4444;
}

.balances-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.balance-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.balance-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.balance-info {
  flex: 1;
}

.balance-name {
  font-weight: 500;
  color: #1e3a5f;
  margin-bottom: 0.125rem;
}

.balance-status {
  font-size: 0.75rem;
  margin: 0;
}

.status-settled {
  color: #64748b;
}

.status-owed {
  color: #16a34a;
}

.status-owes {
  color: #dc2626;
}

.balance-amount-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.balance-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
}

.amount-label {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

.amount-value {
  font-size: 1rem;
  font-weight: 600;
}

.balance-amount.positive {
  color: #16a34a;
}

.balance-amount.negative {
  color: #dc2626;
}

.badge-settled {
  font-size: 1rem;
  background: #dcfce7;
  color: #16a34a;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Settlement Suggestions */
.settlement-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.settlement-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 0.75rem;
}

.settlement-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.settlement-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.settlement-from {
  font-weight: 500;
  color: #dc2626;
}

.settlement-arrow {
  color: #64748b;
  font-weight: bold;
}

.settlement-to {
  font-weight: 500;
  color: #16a34a;
}

.settlement-amount {
  margin-left: auto;
  font-weight: 600;
  color: #1e3a5f;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.expenses-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  transition: all 0.2s;
  position: relative;
}

.expense-item:hover {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.expense-info {
  flex: 1;
}

.expense-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.expense-header h3 {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e3a5f;
}

.expense-details {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.expense-per-person {
  font-size: 0.75rem;
  color: #94a3b8;
}

.expense-amount-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.expense-amount {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e3a5f;
}

.btn-delete-expense {
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  padding: 0.25rem;
}

.expense-item:hover .btn-delete-expense {
  opacity: 1;
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
