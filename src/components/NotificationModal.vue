<template>
	<div class="modal-overlay" @click="$emit('close')">
		<div class="modal" @click.stop>
			<div class="modal-header">
				<h2 class="modal-title">Notifications</h2>
				<div class="modal-header-actions">
					<button v-if="unreadCount > 0" class="btn-mark-all" @click="markAllAsRead">
						Mark all as read
					</button>
					<button class="btn-close" @click="$emit('close')">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			</div>

			<div class="modal-content">
				<div v-if="loading" class="loading-state">Loading notifications...</div>
				<div v-else-if="notifications.length === 0" class="empty-state">
					<svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
					</svg>
					<p>No notifications</p>
				</div>
				<div v-else class="notifications-list">
					<div
						v-for="notification in notifications"
						:key="notification.notification"
						:class="['notification-item', { unread: !notification.read }]"
						@click="handleClick(notification)"
					>
						<div class="notification-content">
							<div class="notification-message">{{ notification.message }}</div>
							<div class="notification-meta">
								<span class="notification-type">{{ formatNotificationType(notification.type) }}</span>
								<span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
							</div>
						</div>
						<div class="notification-actions">
							<button
								v-if="!notification.read"
								class="btn-mark-read"
								@click.stop="markAsRead(notification)"
								title="Mark as read"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as Notifications from '../api/notifications';

const emit = defineEmits<{
	close: [];
	'notification-click': [notification: Notifications.Notification];
}>();

const notifications = ref<Notifications.Notification[]>([]);
const loading = ref(true);
const unreadCount = ref(0);

async function loadNotifications() {
	loading.value = true;
	try {
		const fetchedNotifications = await Notifications.getNotifications(true);
		console.log('=== ALL NOTIFICATIONS ===');
		console.log('Raw notifications:', fetchedNotifications);
		console.log('Number of notifications:', fetchedNotifications.length);
		fetchedNotifications.forEach((notif, index) => {
			console.log(`Notification ${index + 1}:`, {
				id: notif.notification,
				type: notif.type,
				message: notif.message,
				trip: notif.trip,
				relatedEntity: notif.relatedEntity,
				read: notif.read,
				createdAt: notif.createdAt,
				createdAtType: typeof notif.createdAt,
				createdAtIsValid: notif.createdAt ? !isNaN(new Date(notif.createdAt).getTime()) : false,
			});
		});
		console.log('========================');
		notifications.value = fetchedNotifications;
		unreadCount.value = notifications.value.filter(n => !n.read).length;
	} catch (error) {
		console.error('Failed to load notifications:', error);
	} finally {
		loading.value = false;
	}
}

async function markAsRead(notification: Notifications.Notification) {
	try {
		await Notifications.markAsRead(notification.notification);
		notification.read = true;
		unreadCount.value = Math.max(0, unreadCount.value - 1);
	} catch (error) {
		console.error('Failed to mark notification as read:', error);
	}
}

async function markAllAsRead() {
	try {
		await Notifications.markAllAsRead();
		notifications.value.forEach(n => n.read = true);
		unreadCount.value = 0;
	} catch (error) {
		console.error('Failed to mark all as read:', error);
	}
}

function handleClick(notification: Notifications.Notification) {
	if (!notification.read) {
		markAsRead(notification);
	}
	emit('notification-click', notification);
}

function formatNotificationType(type: Notifications.NotificationType): string {
	const typeMap: Record<Notifications.NotificationType, string> = {
		packing_list_change: 'Packing List',
		packing_list_regenerate: 'Packing List',
		packing_item_assigned: 'Packing',
		packing_item_unassigned: 'Packing',
		event_details_change: 'Trip',
		event_rating: 'Rating',
		expense_added: 'Expense',
		expense_edited: 'Expense',
		expense_debt: 'Expense',
		trip_invitation: 'Invitation',
		trip_invitation_accepted: 'Trip',
		trip_joined: 'Trip',
		activity_proposal_created: 'Activity',
		activity_proposal_to_group: 'Activity',
		activity_details_changed: 'Activity',
		activity_opted_in: 'Activity',
		activity_opted_out: 'Activity',
		activity_deleted: 'Activity',
	};
	return typeMap[type] || 'Notification';
}

function formatTime(timestamp: string | Date | undefined): string {
	if (!timestamp) return 'Unknown time';
	
	const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
	
	// Check if date is valid
	if (isNaN(date.getTime())) {
		console.error('Invalid date:', timestamp);
		return 'Unknown time';
	}
	
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMins < 1) return 'Just now';
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;
	return date.toLocaleDateString();
}

onMounted(() => {
	loadNotifications();
});
</script>

<style scoped>
.modal-overlay {
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

.modal {
	background: white;
	border-radius: 0.75rem;
	width: 90%;
	max-width: 600px;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1.5rem;
	border-bottom: 1px solid #e2e8f0;
}

.modal-title {
	font-size: 1.5rem;
	font-weight: 600;
	color: #1e3a5f;
	margin: 0;
}

.modal-header-actions {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.btn-mark-all {
	background: transparent;
	border: 1px solid #14b8a6;
	color: #14b8a6;
	padding: 0.5rem 1rem;
	border-radius: 0.5rem;
	cursor: pointer;
	font-size: 0.875rem;
	transition: all 0.2s;
}

.btn-mark-all:hover {
	background: #e2f8f6;
}

.btn-close {
	background: transparent;
	border: none;
	cursor: pointer;
	color: #64748b;
	padding: 0.25rem;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 0.25rem;
	transition: all 0.2s;
}

.btn-close:hover {
	background: #f1f5f9;
	color: #1e3a5f;
}

.modal-content {
	flex: 1;
	overflow-y: auto;
	padding: 1rem;
}

.loading-state,
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 3rem 1rem;
	color: #64748b;
}

.empty-icon {
	width: 3rem;
	height: 3rem;
	margin-bottom: 1rem;
	opacity: 0.5;
}

.notifications-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.notification-item {
	display: flex;
	align-items: flex-start;
	gap: 1rem;
	padding: 1rem;
	border: 1px solid #e2e8f0;
	border-radius: 0.5rem;
	background: white;
	cursor: pointer;
	transition: all 0.2s;
}

.notification-item:hover {
	background: #f8fafc;
	border-color: #14b8a6;
}

.notification-item.unread {
	background: #e2f8f6;
	border-color: #14b8a6;
	border-left-width: 4px;
}

.notification-content {
	flex: 1;
	min-width: 0;
}

.notification-message {
	font-size: 0.9375rem;
	color: #1e293b;
	margin-bottom: 0.5rem;
	font-weight: 500;
}

.notification-meta {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	font-size: 0.75rem;
	color: #64748b;
}

.notification-type {
	background: #e2f8f6;
	color: #0d9488;
	padding: 0.125rem 0.5rem;
	border-radius: 9999px;
	font-weight: 500;
}

.notification-time {
	color: #94a3b8;
}

.notification-actions {
	display: flex;
	align-items: center;
}

.btn-mark-read {
	background: transparent;
	border: none;
	cursor: pointer;
	color: #14b8a6;
	padding: 0.5rem;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 0.25rem;
	transition: all 0.2s;
}

.btn-mark-read:hover {
	background: #e2f8f6;
}

.w-4 {
	width: 1rem;
}

.h-4 {
	height: 1rem;
}

.w-5 {
	width: 1.25rem;
}

.h-5 {
	height: 1.25rem;
}
</style>

