// UI Manager - Handles all UI interactions and state management
class UIManager {
    constructor() {
        this.currentView = 'home';
        this.isLoading = false;
        this.modals = new Map();
        this.eventListeners = new Map();
        
        this.initializeModals();
        this.setupGlobalEventListeners();
    }

    // Initialize all modals
    initializeModals() {
        const modalIds = [
            'errorModal', 'apiKeyModal', 'searchModal', 'notificationModal',
            'quickActionsModal', 'profileModal', 'favoritesModal', 'scheduleModal',
            'homeModal', 'matchDetailsModal'
        ];

        modalIds.forEach(id => {
            const modal = document.getElementById(id);
            if (modal) {
                this.modals.set(id, modal);
            }
        });
    }

    // Setup global event listeners
    setupGlobalEventListeners() {
        // Close modals on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.closeAllModals();
            }
        });

        // Close modals on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Handle navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-navigate]')) {
                e.preventDefault();
                const view = e.target.dataset.navigate;
                this.navigateTo(view);
            }
        });
    }

    // Loading state management
    showLoading(message = 'Loading...') {
        this.isLoading = true;
        this.updateLoadingStatus(message);
        
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    hideLoading() {
        this.isLoading = false;
        
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    updateLoadingStatus(message) {
        const statusElement = document.getElementById('loadingStatus');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    // Error handling
    showError(message, retryCallback = null) {
        const modal = this.modals.get('errorModal');
        const messageElement = document.getElementById('errorMessage');
        const retryButton = document.getElementById('retryButton');
        
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        if (modal) {
            modal.classList.remove('hidden');
        }

        if (retryCallback && retryButton) {
            // Remove existing listeners
            const newButton = retryButton.cloneNode(true);
            retryButton.parentNode.replaceChild(newButton, retryButton);
            
            newButton.addEventListener('click', () => {
                this.hideError();
                retryCallback();
            });
        }
    }

    hideError() {
        const modal = this.modals.get('errorModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Success notifications
    showSuccess(message, duration = 3000) {
        const toast = document.getElementById('successToast');
        const messageElement = document.getElementById('successMessage');
        
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        if (toast) {
            toast.classList.remove('translate-x-full');
            
            setTimeout(() => {
                toast.classList.add('translate-x-full');
            }, duration);
        }
    }

    // Modal management
    showModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            // Focus first focusable element
            const firstFocusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    }

    hideModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    closeAllModals() {
        this.modals.forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    // Navigation
    navigateTo(view) {
        this.currentView = view;
        
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active', 'text-green-500');
            btn.classList.add('text-gray-400');
        });

        const activeButton = document.querySelector(`[data-view="${view}"]`);
        if (activeButton) {
            activeButton.classList.add('active', 'text-green-500');
            activeButton.classList.remove('text-gray-400');
        }

        // Trigger view change event
        this.triggerEvent('viewChanged', { view });
    }

    // Event system
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    triggerEvent(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => callback(data));
        }
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // DOM utilities
    createElement(tag, className, innerHTML = '') {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        if (innerHTML) {
            element.innerHTML = innerHTML;
        }
        return element;
    }

    // Animation utilities
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    fadeOut(element, duration = 300) {
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(1 - (progress / duration), 0);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
} 