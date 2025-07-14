// Notification Service - Handles all notification functionality
class NotificationService {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.currentFilter = 'All';
        this.notificationTypes = {
            MATCH_UPDATE: 'match_update',
            PREDICTION: 'prediction',
            SYSTEM: 'system',
            BET_RESULT: 'bet_result'
        };
        
        this.loadNotifications();
        this.updateBadge();
    }

    // Load notifications from localStorage
    loadNotifications() {
        try {
            const stored = localStorage.getItem('betHelperNotifications');
            this.notifications = stored ? JSON.parse(stored) : [];
            this.calculateUnreadCount();
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.notifications = [];
        }
    }

    // Save notifications to localStorage
    saveNotifications() {
        try {
            localStorage.setItem('betHelperNotifications', JSON.stringify(this.notifications));
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    }

    // Add a new notification
    addNotification(type, title, message, data = {}) {
        const notification = {
            id: Date.now() + Math.random(),
            type: type,
            title: title,
            message: message,
            data: data,
            timestamp: new Date().toISOString(),
            read: false
        };

        this.notifications.unshift(notification);
        
        // Keep only last 100 notifications
        if (this.notifications.length > 100) {
            this.notifications = this.notifications.slice(0, 100);
        }

        this.calculateUnreadCount();
        this.saveNotifications();
        this.updateBadge();
        this.updateNotificationList();

        // Show toast notification
        this.showToastNotification(notification);

        return notification;
    }

    // Calculate unread count
    calculateUnreadCount() {
        this.unreadCount = this.notifications.filter(n => !n.read).length;
    }

    // Update notification badge
    updateBadge() {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount.toString();
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    // Mark notification as read
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.calculateUnreadCount();
            this.saveNotifications();
            this.updateBadge();
            this.updateNotificationList();
        }
    }

    // Mark all notifications as read
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.calculateUnreadCount();
        this.saveNotifications();
        this.updateBadge();
        this.updateNotificationList();
    }

    // Delete notification
    deleteNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.calculateUnreadCount();
        this.saveNotifications();
        this.updateBadge();
        this.updateNotificationList();
    }

    // Get filtered notifications
    getFilteredNotifications(filter = 'All') {
        if (filter === 'All') {
            return this.notifications;
        }
        
        const filterMap = {
            'Match Updates': this.notificationTypes.MATCH_UPDATE,
            'Predictions': this.notificationTypes.PREDICTION,
            'System': this.notificationTypes.SYSTEM
        };

        const type = filterMap[filter];
        return type ? this.notifications.filter(n => n.type === type) : this.notifications;
    }

    // Update notification list in modal
    updateNotificationList() {
        const container = document.getElementById('notificationList');
        if (!container) return;

        const filteredNotifications = this.getFilteredNotifications(this.currentFilter);

        if (filteredNotifications.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="ri-notification-3-line text-3xl mb-2"></i>
                    <p>No notifications</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredNotifications.map(notification => 
            this.createNotificationItem(notification)
        ).join('');
    }

    // Create notification item HTML
    createNotificationItem(notification) {
        const iconMap = {
            [this.notificationTypes.MATCH_UPDATE]: 'ri-football-line',
            [this.notificationTypes.PREDICTION]: 'ri-lightbulb-line',
            [this.notificationTypes.SYSTEM]: 'ri-settings-3-line',
            [this.notificationTypes.BET_RESULT]: 'ri-money-dollar-circle-line'
        };

        const colorMap = {
            [this.notificationTypes.MATCH_UPDATE]: 'text-blue-500',
            [this.notificationTypes.PREDICTION]: 'text-green-500',
            [this.notificationTypes.SYSTEM]: 'text-gray-500',
            [this.notificationTypes.BET_RESULT]: 'text-yellow-500'
        };

        const icon = iconMap[notification.type] || 'ri-notification-3-line';
        const color = colorMap[notification.type] || 'text-gray-500';
        const timeAgo = this.getTimeAgo(notification.timestamp);

        return `
            <div class="notification-item border-b border-gray-100 last:border-b-0 ${!notification.read ? 'bg-blue-50' : ''}" data-id="${notification.id}">
                <div class="flex items-start p-3 hover:bg-gray-50 transition-colors">
                    <div class="flex-shrink-0 mr-3">
                        <i class="${icon} ${color} text-lg"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <p class="text-sm font-medium text-gray-900">${notification.title}</p>
                                <p class="text-sm text-gray-600 mt-1">${notification.message}</p>
                                <p class="text-xs text-gray-400 mt-1">${timeAgo}</p>
                            </div>
                            <div class="flex items-center space-x-2 ml-2">
                                ${!notification.read ? '<div class="w-2 h-2 bg-blue-500 rounded-full"></div>' : ''}
                                <button class="delete-notification text-gray-400 hover:text-red-500 transition-colors" data-id="${notification.id}">
                                    <i class="ri-delete-bin-line text-sm"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Get time ago string
    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d ago`;
        }
    }

    // Show toast notification
    showToastNotification(notification) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'fixed top-20 right-4 bg-white text-gray-900 px-4 py-3 rounded-lg shadow-lg border border-gray-200 transform translate-x-full transition-transform duration-300 z-50 max-w-sm';
        toast.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0 mr-3">
                    <i class="ri-notification-3-line text-green-500 text-lg"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium">${notification.title}</p>
                    <p class="text-xs text-gray-600 mt-1">${notification.message}</p>
                </div>
                <button class="close-toast text-gray-400 hover:text-gray-600 ml-2">
                    <i class="ri-close-line"></i>
                </button>
            </div>
        `;

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);

        // Auto hide after 5 seconds
        const autoHideTimer = setTimeout(() => {
            this.hideToast(toast);
        }, 5000);

        // Close button handler
        const closeBtn = toast.querySelector('.close-toast');
        closeBtn.onclick = () => {
            clearTimeout(autoHideTimer);
            this.hideToast(toast);
        };

        // Click to mark as read
        toast.onclick = (e) => {
            if (!e.target.closest('.close-toast')) {
                this.markAsRead(notification.id);
                clearTimeout(autoHideTimer);
                this.hideToast(toast);
            }
        };
    }

    // Hide toast notification
    hideToast(toast) {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // Set notification filter
    setFilter(filter) {
        this.currentFilter = filter;
        this.updateNotificationList();
    }

    // Generate demo notifications
    generateDemoNotifications() {
        const demoNotifications = [
            {
                type: this.notificationTypes.MATCH_UPDATE,
                title: 'Match Started',
                message: 'Manchester United vs Liverpool has started!'
            },
            {
                type: this.notificationTypes.PREDICTION,
                title: 'New Prediction Available',
                message: 'High confidence prediction for Arsenal vs Chelsea'
            },
            {
                type: this.notificationTypes.BET_RESULT,
                title: 'Bet Result',
                message: 'Your bet on Barcelona has won! +$25.50'
            },
            {
                type: this.notificationTypes.SYSTEM,
                title: 'App Updated',
                message: 'New features available in BetHelper v2.0'
            }
        ];

        demoNotifications.forEach(notification => {
            this.addNotification(notification.type, notification.title, notification.message);
        });
    }

    // Clear all notifications
    clearAllNotifications() {
        this.notifications = [];
        this.calculateUnreadCount();
        this.saveNotifications();
        this.updateBadge();
        this.updateNotificationList();
    }

    // Get notification count by type
    getNotificationCountByType(type) {
        return this.notifications.filter(n => n.type === type && !n.read).length;
    }

    // Check if user has notifications enabled
    areNotificationsEnabled() {
        return localStorage.getItem('notificationsEnabled') !== 'false';
    }

    // Enable/disable notifications
    setNotificationsEnabled(enabled) {
        localStorage.setItem('notificationsEnabled', enabled.toString());
    }
} 