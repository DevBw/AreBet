// BetHelper App JavaScript
class BetHelper {
  constructor() {
    this.init();
  }

  init() {
    this.initDateTabs();
    this.initBottomNavigation();
    this.initMatchActions();
    this.initFloatingActionButton();
    this.initNotifications();
  }

  // Date Tab Switching
  initDateTabs() {
    const dateTabs = document.querySelectorAll('.bg-gray-100.p-1.rounded-full button');
    
    dateTabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        // Remove active class from all tabs
        dateTabs.forEach((t) => {
          t.classList.remove('bg-primary', 'text-white');
          t.classList.add('text-gray-700');
        });

        // Add active class to clicked tab
        e.target.classList.add('bg-primary', 'text-white');
        e.target.classList.remove('text-gray-700');

        // Simulate loading new data
        this.loadMatchData(e.target.textContent.trim());
      });
    });
  }

  // Bottom Navigation
  initBottomNavigation() {
    const navItems = document.querySelectorAll('.grid-cols-5 a');

    navItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();

        // Remove active class from all items
        navItems.forEach((navItem) => {
          const icon = navItem.querySelector('i');
          const text = navItem.querySelector('span');

          icon.classList.remove('text-primary');
          icon.classList.add('text-gray-500');
          text.classList.remove('text-primary', 'font-medium');
          text.classList.add('text-gray-500');
        });

        // Add active class to clicked item
        const icon = item.querySelector('i');
        const text = item.querySelector('span');

        icon.classList.remove('text-gray-500');
        icon.classList.add('text-primary');
        text.classList.remove('text-gray-500');
        text.classList.add('text-primary', 'font-medium');

        // Handle navigation
        this.handleNavigation(text.textContent.trim());
      });
    });
  }

  // Match Actions (Save/Bet buttons)
  initMatchActions() {
    // Save buttons
    const saveButtons = document.querySelectorAll('button:has(.ri-bookmark-line)');
    
    saveButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const icon = button.querySelector('i');

        if (icon.classList.contains('ri-bookmark-line')) {
          // Save match
          icon.classList.remove('ri-bookmark-line');
          icon.classList.add('ri-bookmark-fill');
          button.classList.remove('bg-gray-100', 'text-gray-700');
          button.classList.add('bg-secondary', 'text-white');
          this.showNotification('Match saved!', 'success');
        } else {
          // Remove saved match
          icon.classList.remove('ri-bookmark-fill');
          icon.classList.add('ri-bookmark-line');
          button.classList.remove('bg-secondary', 'text-white');
          button.classList.add('bg-gray-100', 'text-gray-700');
          this.showNotification('Match removed from saved', 'info');
        }
      });
    });

    // Bet buttons
    const betButtons = document.querySelectorAll('button:has(.ri-external-link-line)');
    
    betButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.showBettingModal();
      });
    });
  }

  // Floating Action Button
  initFloatingActionButton() {
    const fabButton = document.querySelector('.fixed.right-4.bottom-20 button');
    
    fabButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.showQuickActionsModal();
    });
  }

  // Notifications
  initNotifications() {
    const notificationIcon = document.querySelector('.ri-notification-3-line');
    const searchIcon = document.querySelector('.ri-search-line');
    const userIcon = document.querySelector('.ri-user-3-line');

    notificationIcon.parentElement.addEventListener('click', () => {
      this.showNotification('No new notifications', 'info');
    });

    searchIcon.parentElement.addEventListener('click', () => {
      this.showSearchModal();
    });

    userIcon.parentElement.addEventListener('click', () => {
      this.showProfileModal();
    });
  }

  // Helper Methods
  loadMatchData(period) {
    console.log(`Loading matches for: ${period}`);
    // In a real app, this would fetch data from an API
    this.showNotification(`Loading ${period.toLowerCase()} matches...`, 'info');
  }

  handleNavigation(section) {
    console.log(`Navigating to: ${section}`);
    // In a real app, this would handle routing
    this.showNotification(`${section} section coming soon!`, 'info');
  }

  showBettingModal() {
    const modal = this.createModal('Opening Betting Platform', 
      'You will be redirected to place your bet.', 
      [
        { text: 'Cancel', class: 'bg-gray-200 text-gray-800', action: 'close' },
        { text: 'Continue', class: 'bg-primary text-white', action: 'bet' }
      ]
    );
    
    document.body.appendChild(modal);
  }

  showQuickActionsModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-5 w-4/5 max-w-sm fade-in">
        <div class="text-lg font-medium mb-3">Quick Actions</div>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <button class="bg-gray-100 p-3 rounded-lg flex flex-col items-center hover-scale" data-action="search">
            <i class="ri-search-line ri-xl mb-2"></i>
            <span class="text-sm">Find Match</span>
          </button>
          <button class="bg-gray-100 p-3 rounded-lg flex flex-col items-center hover-scale" data-action="favorites">
            <i class="ri-star-line ri-xl mb-2"></i>
            <span class="text-sm">Favorites</span>
          </button>
          <button class="bg-gray-100 p-3 rounded-lg flex flex-col items-center hover-scale" data-action="calendar">
            <i class="ri-calendar-line ri-xl mb-2"></i>
            <span class="text-sm">Calendar</span>
          </button>
          <button class="bg-gray-100 p-3 rounded-lg flex flex-col items-center hover-scale" data-action="alerts">
            <i class="ri-notification-line ri-xl mb-2"></i>
            <span class="text-sm">Alerts</span>
          </button>
        </div>
        <button class="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-button">Close</button>
      </div>
    `;

    // Add event listeners
    modal.querySelectorAll('button[data-action]').forEach(button => {
      button.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleQuickAction(action);
        document.body.removeChild(modal);
      });
    });

    modal.querySelector('.w-full').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    document.body.appendChild(modal);
  }

  showSearchModal() {
    const modal = this.createModal('Search Matches', 
      'Feature coming soon! Search for specific teams, leagues, or matches.', 
      [{ text: 'OK', class: 'bg-primary text-white', action: 'close' }]
    );
    
    document.body.appendChild(modal);
  }

  showProfileModal() {
    const modal = this.createModal('User Profile', 
      'Profile management coming soon! Track your betting history and statistics.', 
      [{ text: 'OK', class: 'bg-primary text-white', action: 'close' }]
    );
    
    document.body.appendChild(modal);
  }

  createModal(title, message, buttons) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    const buttonHtml = buttons.map(btn => 
      `<button class="${btn.class} px-4 py-2 rounded-button" data-action="${btn.action}">${btn.text}</button>`
    ).join('');
    
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-5 w-4/5 max-w-sm fade-in">
        <div class="text-lg font-medium mb-3">${title}</div>
        <div class="text-sm text-gray-600 mb-4">${message}</div>
        <div class="flex justify-end space-x-2">
          ${buttonHtml}
        </div>
      </div>
    `;

    // Add event listeners
    modal.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'close') {
          document.body.removeChild(modal);
        } else if (action === 'bet') {
          window.open('https://www.betway.com', '_blank');
          document.body.removeChild(modal);
        }
      });
    });

    return modal;
  }

  handleQuickAction(action) {
    const messages = {
      search: 'Search feature coming soon!',
      favorites: 'Favorites feature coming soon!',
      calendar: 'Calendar feature coming soon!',
      alerts: 'Alerts feature coming soon!'
    };
    
    this.showNotification(messages[action], 'info');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      warning: 'bg-yellow-500'
    };
    
    notification.className = `fixed top-20 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50 fade-in`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BetHelper();
});

// Add some utility functions
window.BetHelper = {
  // Utility to format odds
  formatOdds: (odds) => {
    return parseFloat(odds).toFixed(2);
  },
  
  // Utility to calculate potential winnings
  calculateWinnings: (stake, odds) => {
    return (stake * odds).toFixed(2);
  },
  
  // Utility to format percentage
  formatPercentage: (value) => {
    return `${Math.round(value)}%`;
  }
}; 