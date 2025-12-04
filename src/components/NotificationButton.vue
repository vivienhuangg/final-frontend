<template>
	<div class="notification-button-container">
		<button class="notification-button" @click="openModal" :class="{ 'has-unread': unreadCount > 0 }">
			<svg class="notification-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
					d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
			</svg>
			<span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
		</button>

		<NotificationModal v-if="showModal" @close="closeModal" @notification-click="handleNotificationClick" />
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import NotificationModal from './NotificationModal.vue';
import * as Notifications from '../api/notifications';
import { useAuth } from '../stores/useAuth';

const router = useRouter();
const { isAuthenticated } = useAuth();
const showModal = ref(false);
const unreadCount = ref(0);
let pollInterval: number | null = null;

async function loadUnreadCount() {
	if (!isAuthenticated) return;
	try {
		unreadCount.value = await Notifications.getUnreadCount();
	} catch (error) {
		console.error('Failed to load unread count:', error);
	}
}

function openModal() {
	showModal.value = true;
	// Refresh count when opening modal
	loadUnreadCount();
}

function closeModal() {
	showModal.value = false;
}

function handleNotificationClick(notification: Notifications.Notification) {
	closeModal();
	navigateToNotification(notification);
}

function navigateToNotification(notification: Notifications.Notification) {
	// Map notification types to tabs/routes
	const type = notification.type;
	const tripId = notification.trip;

	console.log('[NotificationButton] Navigating for notification:', { type, tripId, notification });

	if (!tripId) {
		// Some notifications don't have a trip (like trip invitations)
		if (type === 'trip_invitation') {
			console.log('[NotificationButton] Navigating to invitations page');
			router.push({ name: 'invitations' });
		}
		return;
	}

	// Navigate to trip page with appropriate tab
	// Packing-related notifications
	if (
		type === 'packing_item_assigned' ||
		type === 'packing_item_unassigned' ||
		type === 'packing_list_change' ||
		type === 'packing_list_regenerate'
	) {
		console.log('[NotificationButton] Navigating to packing tab');
		router.push({ name: 'trip', params: { id: tripId }, query: { tab: 'packing' } });
	}
	// Expense-related notifications
	else if (type === 'expense_added' || type === 'expense_edited' || type === 'expense_debt' || type === 'expense_change') {
		console.log('[NotificationButton] Navigating to costs tab');
		router.push({ name: 'trip', params: { id: tripId }, query: { tab: 'costs' } });
	}
	// Activity-related notifications
	else if (
		type === 'activity_proposal_created' ||
		type === 'activity_proposal_to_group' ||
		type === 'activity_details_changed' ||
		type === 'activity_modified' ||
		type === 'activity_added' ||
		type === 'activity_opted_in' ||
		type === 'activity_opted_out' ||
		type === 'activity_deleted'
	) {
		console.log('[NotificationButton] Navigating to attractions tab');
		router.push({ name: 'trip', params: { id: tripId }, query: { tab: 'attractions' } });
	}
	// Trip-related notifications
	else if (
		type === 'trip_joined' ||
		type === 'trip_invitation_accepted' ||
		type === 'event_details_change' ||
		type === 'event_rating'
	) {
		console.log('[NotificationButton] Navigating to overview tab');
		router.push({ name: 'trip', params: { id: tripId }, query: { tab: 'overview' } });
	}
	// Default to trip overview
	else {
		console.log('[NotificationButton] Navigating to trip overview (default)');
		router.push({ name: 'trip', params: { id: tripId } });
	}
}

// Poll for unread count every 30 seconds
function startPolling() {
	if (pollInterval) return;
	pollInterval = window.setInterval(() => {
		loadUnreadCount();
	}, 30000);
}

function stopPolling() {
	if (pollInterval) {
		clearInterval(pollInterval);
		pollInterval = null;
	}
}

watch(isAuthenticated, (authenticated) => {
	if (authenticated) {
		loadUnreadCount();
		startPolling();
	} else {
		stopPolling();
		unreadCount.value = 0;
	}
}, { immediate: true });

onMounted(() => {
	if (isAuthenticated.value) {
		loadUnreadCount();
		startPolling();
	}
});

onUnmounted(() => {
	stopPolling();
});
</script>

<style scoped>
.notification-button-container {
	position: fixed;
	top: 1rem;
	right: 1rem;
	z-index: 999;
}

.notification-button {
	position: relative;
	width: 3rem;
	height: 3rem;
	border-radius: 50%;
	background: white;
	border: 2px solid #e2e8f0;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s;
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.notification-button:hover {
	background: #f8fafc;
	border-color: #14b8a6;
	transform: scale(1.05);
}

.notification-button.has-unread {
	border-color: #14b8a6;
	background: #e2f8f6;
}

.notification-icon {
	width: 1.5rem;
	height: 1.5rem;
	color: #1e3a5f;
}

.notification-badge {
	position: absolute;
	top: -0.25rem;
	right: -0.25rem;
	background: #ef4444;
	color: white;
	border-radius: 50%;
	width: 1.25rem;
	height: 1.25rem;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.75rem;
	font-weight: 600;
	border: 2px solid white;
}
</style>

