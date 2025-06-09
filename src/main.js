// Import skills database
import { searchSkills, getSkillsForEvent } from './skills-database.js';
// Firebase auth service will be available globally via CDN scripts

// Mobile Detection and CSS Loading
class MobileDetector {
  constructor() {
    this.isMobile = this.detectMobile();
    this.init();
  }
  
  detectMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const touchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const smallScreen = window.innerWidth <= 768;
    
    return mobileRegex.test(userAgent) || (touchCapable && smallScreen);
  }
  
  init() {
    if (this.isMobile) {
      document.body.classList.add('mobile-device');
      this.loadMobileCSS();
      this.setupMobileOptimizations();
    }
  }
  
  loadMobileCSS() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './mobile-styles.css';
    document.head.appendChild(link);
  }
  
  setupMobileOptimizations() {
    // Add viewport meta tag if not present
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
      document.head.appendChild(viewport);
    }
  }
}

// Gymnastics Skills Tracker with Profile Management
class GymnasticsTracker {
  constructor() {
    // Initialize mobile detector first
    this.mobileDetector = new MobileDetector();
    
    // Initialize Firebase auth service (will be available globally)
    this.authService = null;
    
    // Core app properties
    this.currentUser = null;
    this.userData = {
      routines: {},
      skills: {}
    };
    this.currentEvent = '';
    this.currentRoutine = '';
    
    // Initialize the app
    this.init();
  }

  async init() {
    // Wait for auth service to be available
    await this.waitForAuthService();
    
    this.showLoginPage();
    this.setupEventListeners();
    this.setupMobileFeatures();
    
    // Listen for auth state changes
    if (this.authService) {
      this.authService.getCurrentUser();
      if (this.authService.isSignedIn()) {
        this.showMainApp();
      }
    }
    
    // Listen for auth state changes from Firebase
    window.addEventListener('authStateChanged', (event) => {
      const { isSignedIn, user, groups } = event.detail;
      if (isSignedIn) {
        this.currentUser = user;
        this.currentGroups = groups || [];
        this.loadUserData();
        this.showMainApp();
      } else {
        this.currentUser = null;
        this.currentGroups = [];
        this.showLoginPage();
      }
      this.updateGroupUI();
    });
  }
  
  async waitForAuthService() {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max
    
    while (attempts < maxAttempts) {
      if (typeof AuthService !== 'undefined' && window.authService) {
        this.authService = window.authService;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!this.authService) {
      console.warn('AuthService not available. Some features may not work.');
    }
  }

  setupMobileFeatures() {
    // Add mobile-specific enhancements
    this.setupTouchGestures();
    this.setupMobileNavigation();
    this.setupMobileKeyboard();
    this.enablePullToRefresh();
    this.optimizeMobilePerformance();
    
    console.log('Mobile features initialized');
  }
  
  setupTouchGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    // Add swipe gesture support
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      this.handleSwipeGesture(touchStartX, touchStartY, touchEndX, touchEndY);
    }, { passive: true });
    
    // Add long press support for context menus
    this.setupLongPress();
  }
  
  handleSwipeGesture(startX, startY, endX, endY) {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const minSwipeDistance = 50;
    
    // Horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right - go back or open side menu
        this.handleSwipeRight();
      } else {
        // Swipe left - next or close menu
        this.handleSwipeLeft();
      }
    }
    
    // Vertical swipes  
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY > 0) {
        // Swipe down - refresh or expand
        this.handleSwipeDown();
      } else {
        // Swipe up - minimize or scroll to top
        this.handleSwipeUp();
      }
    }
  }
  
  handleSwipeRight() {
    // Navigate back in mobile context
    if (this.currentPage === 'routine') {
      this.showMainPage();
      this.showNotification('Swiped back to dashboard', 'info');
    }
  }
  
  handleSwipeLeft() {
    // Close modals or navigate forward
    const activeModal = document.querySelector('.modal[style*="block"]');
    if (activeModal) {
      this.closeModal(activeModal);
      this.showNotification('Modal closed', 'info');
    }
  }
  
  handleSwipeDown() {
    // Pull to refresh functionality
    if (window.scrollY === 0) {
      this.triggerRefresh();
    }
  }
  
  handleSwipeUp() {
    // Quick scroll to top or minimize action
    if (window.scrollY > 200) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.showNotification('Scrolled to top', 'info');
    }
  }
  
  setupLongPress() {
    let longPressTimer;
    let isLongPress = false;
    
    document.addEventListener('touchstart', (e) => {
      isLongPress = false;
      longPressTimer = setTimeout(() => {
        isLongPress = true;
        this.handleLongPress(e);
      }, 800); // 800ms for long press
    });
    
    document.addEventListener('touchend', () => {
      clearTimeout(longPressTimer);
    });
    
    document.addEventListener('touchmove', () => {
      clearTimeout(longPressTimer);
    });
  }
  
  handleLongPress(e) {
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Handle long press on different elements
    const target = e.target.closest('.skill-item, .routine-card, .profile-card');
    if (target) {
      if (target.classList.contains('skill-item')) {
        this.showSkillContextMenu(target, e);
      } else if (target.classList.contains('routine-card')) {
        this.showRoutineContextMenu(target, e);
      }
    }
  }
  
  showSkillContextMenu(skillElement, event) {
    // Create mobile context menu for skills
    const contextMenu = document.createElement('div');
    contextMenu.className = 'mobile-context-menu';
    contextMenu.innerHTML = `
      <div class="context-menu-item" data-action="edit">Edit Skill</div>
      <div class="context-menu-item" data-action="delete">Delete Skill</div>
      <div class="context-menu-item" data-action="move">Move to Position</div>
      <div class="context-menu-item" data-action="cancel">Cancel</div>
    `;
    
    // Position and show context menu
    document.body.appendChild(contextMenu);
    this.positionContextMenu(contextMenu, event);
    
    // Add event listeners
    contextMenu.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action) {
        this.handleSkillContextAction(skillElement, action);
        document.body.removeChild(contextMenu);
      }
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (contextMenu.parentNode) {
        document.body.removeChild(contextMenu);
      }
    }, 5000);
  }
  
  setupMobileNavigation() {
    // Add mobile-specific navigation enhancements
    
    // Back button handling for Android
    if (window.history && window.history.pushState) {
      window.addEventListener('popstate', (e) => {
        if (this.currentPage === 'routine') {
          e.preventDefault();
          this.showMainPage();
        }
      });
    }
    
    // Prevent default zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }
  
  setupMobileKeyboard() {
    // Handle virtual keyboard showing/hiding
    const viewport = window.visualViewport;
    if (viewport) {
      viewport.addEventListener('resize', () => {
        this.handleKeyboardToggle(viewport.height < window.innerHeight);
      });
    }
    
    // Alternative method for older browsers
    let initialHeight = window.innerHeight;
    window.addEventListener('resize', () => {
      const currentHeight = window.innerHeight;
      const heightDiff = initialHeight - currentHeight;
      
      if (heightDiff > 150) {
        // Keyboard is likely open
        this.handleKeyboardToggle(true);
      } else {
        // Keyboard is likely closed
        this.handleKeyboardToggle(false);
      }
    });
  }
  
  handleKeyboardToggle(isKeyboardOpen) {
    const body = document.body;
    
    if (isKeyboardOpen) {
      body.classList.add('keyboard-open');
      // Adjust modal positions when keyboard is open
      const modals = document.querySelectorAll('.modal[style*="block"] .modal-content');
      modals.forEach(modal => {
        modal.style.marginTop = '10px';
        modal.style.maxHeight = 'calc(100vh - 20px)';
      });
    } else {
      body.classList.remove('keyboard-open');
      // Reset modal positions
      const modals = document.querySelectorAll('.modal-content');
      modals.forEach(modal => {
        modal.style.marginTop = '';
        modal.style.maxHeight = '';
      });
    }
  }
  
  enablePullToRefresh() {
    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    let refreshTriggered = false;
    
    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = false;
        refreshTriggered = false;
      }
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
      if (window.scrollY === 0 && startY > 0) {
        currentY = e.touches[0].clientY;
        const pullDistance = currentY - startY;
        
        if (pullDistance > 0) {
          isPulling = true;
          
          // Visual feedback for pull to refresh
          if (pullDistance > 80 && !refreshTriggered) {
            this.showPullToRefreshIndicator(true);
          } else if (pullDistance <= 80) {
            this.showPullToRefreshIndicator(false);
          }
        }
      }
    }, { passive: true });
    
    document.addEventListener('touchend', () => {
      if (isPulling && currentY - startY > 80 && !refreshTriggered) {
        refreshTriggered = true;
        this.triggerRefresh();
      }
      
      isPulling = false;
      startY = 0;
      this.hidePullToRefreshIndicator();
    }, { passive: true });
  }
  
  showPullToRefreshIndicator(isReady) {
    let indicator = document.getElementById('pull-refresh-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'pull-refresh-indicator';
      indicator.className = 'pull-to-refresh';
      document.body.insertBefore(indicator, document.body.firstChild);
    }
    
    indicator.textContent = isReady ? 'Release to refresh' : 'Pull to refresh';
    indicator.style.display = 'block';
    indicator.style.backgroundColor = isReady ? 'var(--mobile-accent-primary)' : 'var(--mobile-surface-secondary)';
  }
  
  hidePullToRefreshIndicator() {
    const indicator = document.getElementById('pull-refresh-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }
  
  triggerRefresh() {
    this.showNotification('Refreshing data...', 'info');
    
    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    
    // Simulate refresh action
    setTimeout(() => {
      this.renderAll();
      this.showNotification('Data refreshed!', 'success');
      this.hidePullToRefreshIndicator();
    }, 1000);
  }
  
  optimizeMobilePerformance() {
    // Disable animations on low-end devices
    if (this.isLowEndDevice()) {
      document.body.classList.add('reduced-motion');
    }
    
    // Optimize scroll performance
    document.addEventListener('scroll', this.throttle(() => {
      this.handleScroll();
    }, 16), { passive: true }); // 60fps throttling
    
    // Optimize touch events
    this.optimizeTouchEvents();
  }
  
  isLowEndDevice() {
    // Detect low-end devices based on various factors
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const slowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
    const lowMemory = navigator.deviceMemory && navigator.deviceMemory < 2;
    const lowConcurrency = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    
    return slowConnection || lowMemory || lowConcurrency;
  }
  
  throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }
  
  handleScroll() {
    // Implement scroll-based optimizations
    const scrollY = window.scrollY;
    
    // Hide/show header on scroll for more screen space
    if (scrollY > 100) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }
  }
  
  optimizeTouchEvents() {
    // Improve touch responsiveness
    const touchElements = document.querySelectorAll('button, .login-tab, .profile-btn, .skill-item');
    
    touchElements.forEach(element => {
      element.addEventListener('touchstart', function() {
        this.classList.add('touching');
      }, { passive: true });
      
      element.addEventListener('touchend', function() {
        setTimeout(() => {
          this.classList.remove('touching');
        }, 150);
      }, { passive: true });
      
      element.addEventListener('touchcancel', function() {
        this.classList.remove('touching');
      }, { passive: true });
    });
  }
  
  // Mobile Context Menu Helper Methods
  positionContextMenu(contextMenu, event) {
    const touch = event.touches ? event.touches[0] : event.changedTouches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    
    // Position the context menu
    contextMenu.style.position = 'fixed';
    contextMenu.style.left = Math.min(x, window.innerWidth - 200) + 'px';
    contextMenu.style.top = Math.min(y, window.innerHeight - 200) + 'px';
    contextMenu.style.zIndex = '10000';
    
    // Style the context menu
    contextMenu.style.backgroundColor = 'var(--mobile-surface-primary)';
    contextMenu.style.border = '1px solid var(--border-primary)';
    contextMenu.style.borderRadius = 'var(--radius-md)';
    contextMenu.style.boxShadow = 'var(--mobile-shadow-md)';
    contextMenu.style.padding = '8px';
    contextMenu.style.minWidth = '180px';
    
    // Style menu items
    const items = contextMenu.querySelectorAll('.context-menu-item');
    items.forEach(item => {
      item.style.padding = '12px 16px';
      item.style.cursor = 'pointer';
      item.style.borderRadius = 'var(--radius-sm)';
      item.style.marginBottom = '4px';
      item.style.fontSize = 'var(--mobile-font-sm)';
      item.style.color = 'var(--mobile-text-primary)';
      item.style.touchAction = 'manipulation';
      
      item.addEventListener('touchstart', function() {
        this.style.backgroundColor = 'var(--mobile-accent-primary)';
        this.style.color = 'black';
      });
      
      item.addEventListener('touchend', function() {
        setTimeout(() => {
          this.style.backgroundColor = '';
          this.style.color = 'var(--mobile-text-primary)';
        }, 150);
      });
    });
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'context-menu-backdrop';
    backdrop.style.position = 'fixed';
    backdrop.style.top = '0';
    backdrop.style.left = '0';
    backdrop.style.width = '100%';
    backdrop.style.height = '100%';
    backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    backdrop.style.zIndex = '9999';
    
    backdrop.addEventListener('click', () => {
      if (contextMenu.parentNode) {
        document.body.removeChild(contextMenu);
      }
      if (backdrop.parentNode) {
        document.body.removeChild(backdrop);
      }
    });
    
    document.body.appendChild(backdrop);
  }
  
  handleSkillContextAction(skillElement, action) {
    const skillId = skillElement.dataset.skillId;
    const eventType = this.currentRoutineView?.eventType;
    const routineId = this.currentRoutineView?.routineId;
    
    if (!skillId || !eventType || !routineId) return;
    
    switch (action) {
      case 'edit':
        this.showSkillModal(eventType, routineId, skillId);
        break;
      case 'delete':
        if (confirm('Delete this skill?')) {
          this.deleteSkill(eventType, routineId, skillId);
        }
        break;
      case 'move':
        const newPosition = prompt('Enter new position (1-based):');
        if (newPosition && !isNaN(newPosition)) {
          this.moveSkillToPosition(eventType, routineId, skillId, parseInt(newPosition));
        }
        break;
      case 'cancel':
        // Do nothing, menu will close
        break;
    }
  }
  
  showRoutineContextMenu(routineElement, event) {
    // Similar to skill context menu but for routines
    const contextMenu = document.createElement('div');
    contextMenu.className = 'mobile-context-menu';
    contextMenu.innerHTML = `
      <div class="context-menu-item" data-action="view">View Routine</div>
      <div class="context-menu-item" data-action="edit">Edit Routine</div>
      <div class="context-menu-item" data-action="delete">Delete Routine</div>
      <div class="context-menu-item" data-action="cancel">Cancel</div>
    `;
    
    document.body.appendChild(contextMenu);
    this.positionContextMenu(contextMenu, event);
    
    contextMenu.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action) {
        this.handleRoutineContextAction(routineElement, action);
        document.body.removeChild(contextMenu);
        // Remove backdrop
        const backdrop = document.querySelector('.context-menu-backdrop');
        if (backdrop) document.body.removeChild(backdrop);
      }
    });
  }

  handleRoutineContextAction(routineElement, action) {
    const routineId = routineElement.querySelector('.view-routine-btn')?.dataset.routine;
    const eventType = routineElement.querySelector('.view-routine-btn')?.dataset.event;
    
    if (!routineId || !eventType) return;
    
    switch (action) {
      case 'view':
        this.showRoutinePage(eventType, routineId);
        break;
      case 'edit':
        // Show edit routine modal (you'd need to implement this)
        this.showNotification('Edit routine feature coming soon!', 'info');
        break;
      case 'delete':
        if (confirm('Delete this routine and all its skills?')) {
          this.deleteRoutine(eventType, routineId);
        }
        break;
      case 'cancel':
        // Do nothing, menu will close
        break;
    }
  }

  // Profile Management Methods
  loadProfiles() {
    try {
      const stored = localStorage.getItem('gymnastics-profiles');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
    return {};
  }

  saveProfiles() {
    try {
      localStorage.setItem('gymnastics-profiles', JSON.stringify(this.profiles));
    } catch (error) {
      console.error('Error saving profiles:', error);
    }
  }

  checkAuthStatus() {
    const currentUser = localStorage.getItem('gymnastics-current-user');
    if (currentUser && this.profiles[currentUser]) {
      this.currentUser = currentUser;
      this.loadData();
      return true;
    }
    return false;
  }

  createProfile(username, password, fullName = '', level = '') {
    if (this.profiles[username]) {
      throw new Error('Username already exists');
    }

    // Simple password hashing (in production, use proper bcrypt)
    const hashedPassword = btoa(password + 'salt123');
    
    this.profiles[username] = {
      username,
      password: hashedPassword,
      fullName,
      level,
      createdAt: new Date().toISOString(),
      lastAccess: new Date().toISOString()
    };

    this.saveProfiles();
    return true;
  }

  authenticateUser(username, password) {
    const profile = this.profiles[username];
    if (!profile) {
      throw new Error('Username not found');
    }

    const hashedPassword = btoa(password + 'salt123');
    if (profile.password !== hashedPassword) {
      throw new Error('Invalid password');
    }

    // Update last access
    profile.lastAccess = new Date().toISOString();
    this.saveProfiles();

    this.currentUser = username;
    localStorage.setItem('gymnastics-current-user', username);
    this.loadData();
    return true;
  }

  switchProfile(username) {
    if (!this.profiles[username]) {
      throw new Error('Profile not found');
    }

    this.currentUser = username;
    localStorage.setItem('gymnastics-current-user', username);
    this.profiles[username].lastAccess = new Date().toISOString();
    this.saveProfiles();
    this.loadData();
    this.updateProfileDisplay();
    this.renderAll();
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('gymnastics-current-user');
    this.data = {};
    this.showLoginPage();
  }

  updateProfile(updates) {
    if (!this.currentUser) return false;
    
    Object.assign(this.profiles[this.currentUser], updates);
    this.saveProfiles();
    this.updateProfileDisplay();
    return true;
  }

  changePassword(currentPassword, newPassword) {
    if (!this.currentUser) throw new Error('No user logged in');
    
    const profile = this.profiles[this.currentUser];
    const currentHashed = btoa(currentPassword + 'salt123');
    
    if (profile.password !== currentHashed) {
      throw new Error('Current password is incorrect');
    }

    profile.password = btoa(newPassword + 'salt123');
    this.saveProfiles();
    return true;
  }

  deleteProfile(username) {
    if (!this.profiles[username]) return false;
    
    // Delete profile data
    localStorage.removeItem(`gymnastics-data-${username}`);
    delete this.profiles[username];
    this.saveProfiles();

    // If deleting current user, logout
    if (this.currentUser === username) {
      this.logout();
    }
    
    return true;
  }

  exportUserData() {
    if (!this.currentUser) return null;
    
    const userData = {
      profile: this.profiles[this.currentUser],
      routines: this.data,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(userData, null, 2);
  }

  importUserData(jsonData) {
    try {
      const userData = JSON.parse(jsonData);
      if (userData.routines) {
        this.data = userData.routines;
        this.saveData();
        this.renderAll();
        return true;
      }
    } catch (error) {
      console.error('Import error:', error);
      throw new Error('Invalid data format');
    }
    return false;
  }

  // UI Management Methods
  showLoginPage() {
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('routine-page').style.display = 'none';
    // Note: Recent profiles removed since we use Firebase authentication now
  }

  showMainApp() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('main-page').style.display = 'block';
    document.getElementById('routine-page').style.display = 'none';
    this.updateCurrentProfileDisplay();
    this.renderAll();
    // Auto-save every 30 seconds as backup
    setInterval(() => this.saveUserData(), 30000);
  }

  updateProfileDisplay() {
    if (!this.currentUser) return;
    
    const profile = this.profiles[this.currentUser];
    const initial = profile.fullName ? profile.fullName.charAt(0).toUpperCase() : profile.username.charAt(0).toUpperCase();
    
    document.getElementById('current-profile-name').textContent = profile.fullName || profile.username;
    document.getElementById('current-profile-level').textContent = profile.level || 'No level set';
    document.querySelector('.profile-avatar').textContent = initial;
  }

  renderRecentProfiles() {
    const recentProfilesList = document.getElementById('recent-profiles-list');
    if (!recentProfilesList) return;

    const recentProfiles = Object.values(this.profiles)
      .sort((a, b) => new Date(b.lastAccess) - new Date(a.lastAccess))
      .slice(0, 3);

    if (recentProfiles.length === 0) {
      document.getElementById('quick-profiles-section').style.display = 'none';
      return;
    }

    document.getElementById('quick-profiles-section').style.display = 'block';
    recentProfilesList.innerHTML = recentProfiles.map(profile => {
      const initial = profile.fullName ? profile.fullName.charAt(0).toUpperCase() : profile.username.charAt(0).toUpperCase();
      const lastAccess = new Date(profile.lastAccess).toLocaleDateString();
      
      return `
        <div class="recent-profile-item" data-username="${profile.username}">
          <div class="recent-profile-avatar">${initial}</div>
          <div class="recent-profile-info">
            <p class="recent-profile-name">${profile.fullName || profile.username}</p>
            <p class="recent-profile-meta">${profile.level || 'No level'} • Last access: ${lastAccess}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  // Data Management (Per User) - Legacy methods for backward compatibility
  loadData() {
    // This method is kept for any legacy references but data loading now happens via Firebase
    console.log('Legacy loadData called - using Firebase loadUserData instead');
  }

  saveData() {
    // This method is kept for any legacy references but data saving now happens via Firebase
    this.saveUserData();
  }

  // Calculate start value for a routine
  calculateStartValue(routine, eventType = null) {
    if (!routine.skills || routine.skills.length === 0) {
      if (eventType === 'vault') {
        return {
          total: 10.0,
          skillsValue: 0.0,
          baseValue: 10.0,
          skillCount: 0
        };
      }
      return {
        total: 12.0,
        skillsValue: 0.0,
        baseValue: 12.0,
        skillCount: 0
      };
    }

    if (eventType === 'vault') {
      // Vault scoring: 10.0 + D-score (vault should typically have only 1 skill)
      // For vault, skills have D-scores as their difficulty value (e.g., 5.6, 4.8, etc.)
      const vaultDScore = routine.skills.length > 0 ? 
        parseFloat(routine.skills[0].difficulty) || 0 : 0;
      
      return {
        total: Math.round((10.0 + vaultDScore) * 10) / 10,
        skillsValue: Math.round(vaultDScore * 10) / 10,
        baseValue: 10.0,
        skillCount: routine.skills.length
      };
    } else {
      // Other events: 12.0 + accumulated difficulty values
      const skillsValue = routine.skills.reduce((sum, skill) => {
        return sum + (this.difficultyValues[skill.difficulty] || 0);
      }, 0);

      return {
        total: Math.round((12.0 + skillsValue) * 10) / 10, // Round to 1 decimal
        skillsValue: Math.round(skillsValue * 10) / 10,
        baseValue: 12.0,
        skillCount: routine.skills.length
      };
    }
  }

  // Calculate progression progress for a skill
  calculateProgressionProgress(skill) {
    if (!skill.progressions || skill.progressions.length === 0) {
      return { total: 0, completed: 0, percentage: 0 };
    }

    const total = skill.progressions.length;
    const completed = skill.progressions.filter(prog => prog.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  }

  showNotification(message, type = 'info') {
    // Create a toast notification element
    const notification = document.createElement('div');
    notification.className = `notification toast ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
        <span class="notification-message">${message}</span>
      </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show with animation
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
    
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  // Navigation methods
  showRoutinePage(eventType, routineId) {
    const routine = this.userData.routines[eventType].find(r => r.id === routineId);
    if (!routine) return;

    this.currentPage = 'routine';
    this.currentRoutineView = { eventType, routineId, routine };

    // Hide main page, show routine page
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('routine-page').style.display = 'block';

    // Update page content
    this.renderRoutinePage(eventType, routine);
  }

  showMainPage() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('main-page').style.display = 'block';
    document.getElementById('routine-page').style.display = 'none';
    this.updateCurrentProfileDisplay();
    this.renderAll();
    // Auto-save every 30 seconds as backup
    setInterval(() => this.saveUserData(), 30000);
  }

  renderRoutinePage(eventType, routine) {
    const eventNames = {
      'floor': 'Floor Exercise',
      'pommel': 'Pommel Horse',
      'rings': 'Still Rings',
      'vault': 'Vault',
      'pbars': 'Parallel Bars',
      'hbar': 'High Bar'
    };

    // Update page title and event badge
    document.getElementById('routine-page-title').textContent = routine.name;
    document.getElementById('routine-page-event').textContent = eventNames[eventType];

    // Update add skill button
    const addSkillBtn = document.getElementById('routine-add-skill');
    addSkillBtn.dataset.event = eventType;
    addSkillBtn.dataset.routine = routine.id;

    // Render routine progress
    const progressContainer = document.getElementById('routine-progress-container');
    const { total, completed, percentage } = this.calculateProgress(routine);
    progressContainer.innerHTML = `
      <div class="progress-info">
        <span class="progress-title">Routine Progress</span>
        <span class="progress-percentage">${percentage}%</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar-fill" style="width: ${percentage}%;"></div>
      </div>
      <div class="progress-summary">${completed} of ${total} skills completed</div>
    `;

    // Calculate and render start value
    const startValueContainer = document.getElementById('start-value-container');
    const startValue = this.calculateStartValue(routine, eventType);
    startValueContainer.innerHTML = `
      <div class="start-value-info">
        <span class="start-value-title">Start Value</span>
        <span class="start-value-total">${startValue.total.toFixed(1)}</span>
      </div>
      <div class="start-value-breakdown">
        (Skills: ${startValue.skillsValue.toFixed(1)})
      </div>
    `;

    // Render skills in the routine page
    this.renderRoutineSkills(eventType, routine);

    // Update notes
    const notesContent = document.getElementById('routine-notes-content');
    if (routine.notes && routine.notes.trim()) {
      notesContent.innerHTML = `<p class="notes-text">${routine.notes.replace(/\n/g, '<br>')}</p>`;
    } else {
      notesContent.innerHTML = `<p class="notes-empty">No notes added yet. Click "Edit" to add some notes about this routine.</p>`;
    }
  }

  renderRoutineSkills(eventType, routine) {
    const container = document.getElementById('routine-skills-list');
    
    if (!routine.skills || routine.skills.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🤸‍♂️</div>
          <div class="empty-state-text">No skills added yet</div>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem;">
            Click "Add Skill" to start building your routine
          </p>
        </div>
      `;
      return;
    }

    const skillsHtml = routine.skills.map((skill, index) => 
      this.renderSkill(eventType, routine.id, skill, index)
    ).join('');
    
    container.innerHTML = skillsHtml;

    // Set up drag and drop functionality
    this.setupDragAndDrop(container);

    // Set up event listeners for the routine page skills (for checkboxes and delete buttons)
    this.addDynamicEventListeners('routine-page');
  }

  // Event Listeners
  setupEventListeners() {
    // ========================================
    // AUTHENTICATION EVENT LISTENERS
    // ========================================
    
    // Login tabs
    const loginTabs = document.querySelectorAll('.login-tab');
    loginTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetForm = e.target.dataset.form;
        this.switchLoginForm(targetForm);
      });
    });

    // Auth forms
    document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
    document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));

    // Profile management
    document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
    document.getElementById('manage-profile-btn').addEventListener('click', () => this.showManageProfileModal());
    document.getElementById('groups-btn').addEventListener('click', () => this.showGroupsModal());

    // ========================================
    // GROUP MANAGEMENT EVENT LISTENERS
    // ========================================
    
    // Groups modal event listeners
    document.getElementById('create-group-btn').addEventListener('click', () => this.showCreateGroupModal());
    document.getElementById('join-group-btn').addEventListener('click', () => this.showJoinGroupModal());
    
    // Create group form
    document.getElementById('create-group-form').addEventListener('submit', (e) => this.handleCreateGroup(e));
    
    // Join group form
    document.getElementById('join-group-form').addEventListener('submit', (e) => this.handleJoinGroup(e));
    
    // Invite code handling
    document.getElementById('copy-invite-code').addEventListener('click', () => this.copyInviteCode());
    
    // Auto-uppercase invite code input
    const inviteCodeInput = document.getElementById('invite-code');
    inviteCodeInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });

    // ========================================
    // MODAL CLOSE EVENT LISTENERS
    // ========================================
    
    // Close buttons for all modals
    const closeButtons = document.querySelectorAll('.close, .modal-close');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) {
          this.closeModal(modal);
        }
      });
    });

    // Click outside modal to close
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModal(e.target);
      }
    });

    // ========================================
    // ROUTINE MANAGEMENT EVENT LISTENERS
    // ========================================
    
    // Add routine buttons
    const addRoutineBtns = document.querySelectorAll('.add-routine-btn');
    addRoutineBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const eventType = e.target.dataset.event;
        this.showAddRoutineModal(eventType);
      });
    });

    // Routine form submission
    document.getElementById('routine-form').addEventListener('submit', (e) => this.handleRoutineSubmit(e));

    // Back to main button
    document.getElementById('back-to-main').addEventListener('click', () => this.showMainPage());

    // ========================================
    // SKILL MANAGEMENT EVENT LISTENERS
    // ========================================
    
    // Add skill button in routine page
    document.getElementById('add-skill-btn').addEventListener('click', () => {
      const eventType = this.currentRoutineView?.eventType;
      if (eventType) {
        this.showAddSkillModal(eventType);
      }
    });

    // Skill form submission
    document.getElementById('skill-form').addEventListener('submit', (e) => this.handleSkillSubmit(e));

    // Skills search
    document.getElementById('skills-search').addEventListener('input', (e) => this.handleSkillsSearch(e));

    // Event selection for skills
    document.getElementById('skill-event').addEventListener('change', (e) => {
      const eventType = e.target.value;
      if (eventType) {
        this.loadEventSkills(eventType);
      }
    });

    // Custom skill toggle
    document.getElementById('custom-skill-toggle').addEventListener('change', (e) => {
      this.toggleCustomSkillForm(e.target.checked);
    });

    // ========================================
    // PROFILE MANAGEMENT EVENT LISTENERS
    // ========================================
    
    // Profile tabs
    const profileTabs = document.querySelectorAll('.profile-tab');
    profileTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = e.target.dataset.tab;
        this.switchProfileTab(targetTab);
      });
    });

    // Profile update form
    document.getElementById('profile-update-form').addEventListener('submit', (e) => this.handleProfileUpdate(e));

    // Password change form
    document.getElementById('password-change-form').addEventListener('submit', (e) => this.handlePasswordChange(e));

    // ========================================
    // KEYBOARD SHORTCUTS
    // ========================================
    
    document.addEventListener('keydown', (e) => {
      // ESC to close modals
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal[style*="block"]');
        if (openModal) {
          this.closeModal(openModal);
        }
      }
      
      // Ctrl/Cmd + Enter to submit forms
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeForm = document.activeElement.closest('form');
        if (activeForm) {
          activeForm.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      }
    });

    // ========================================
    // RESPONSIVE AND MOBILE OPTIMIZATIONS
    // ========================================
    
    // Touch events for mobile
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', (e) => {
        // Add touch feedback
        if (e.target.closest('button, .btn, .tab')) {
          e.target.closest('button, .btn, .tab').classList.add('touching');
        }
      });
      
      document.addEventListener('touchend', (e) => {
        // Remove touch feedback
        document.querySelectorAll('.touching').forEach(el => {
          el.classList.remove('touching');
        });
      });
    }
  }

  // Utility Functions
  calculateProgress(routine) {
    const total = routine.skills.length;
    const completed = routine.skills.filter(skill => skill.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  }

  isOverdue(dateString) {
    if (!dateString) return false;
    const targetDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return targetDate < today;
  }

  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // Helper methods for skill reordering
  moveSkillUp(eventType, routineId, currentIndex) {
    console.log('Moving skill up:', { eventType, routineId, currentIndex });
    
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      this.reorderSkills(eventType, routineId, currentIndex, newIndex);
      
      // Refresh the routine page
      if (this.currentRoutineView && this.currentRoutineView.eventType === eventType && this.currentRoutineView.routineId === routineId) {
        const updatedRoutine = this.data[eventType].find(r => r.id === routineId);
        this.renderRoutinePage(eventType, updatedRoutine);
      }
    }
  }

  moveSkillDown(eventType, routineId, currentIndex) {
    console.log('Moving skill down:', { eventType, routineId, currentIndex });
    
    const routine = this.data[eventType].find(r => r.id === routineId);
    if (routine && currentIndex < routine.skills.length - 1) {
      const newIndex = currentIndex + 1;
      this.reorderSkills(eventType, routineId, currentIndex, newIndex);
      
      // Refresh the routine page
      if (this.currentRoutineView && this.currentRoutineView.eventType === eventType && this.currentRoutineView.routineId === routineId) {
        const updatedRoutine = this.data[eventType].find(r => r.id === routineId);
        this.renderRoutinePage(eventType, updatedRoutine);
      }
    }
  }

  editSkillOrder(eventType, routineId, skillId, currentPosition) {
    console.log('Editing skill order:', { eventType, routineId, skillId, currentPosition });
    
    // Find the skill order element
    const skillItem = document.querySelector(`[data-skill-id="${skillId}"]`);
    if (skillItem) {
      const orderElement = skillItem.querySelector('.skill-order-number');
      this.makeOrderNumberEditable(orderElement, eventType, routineId, skillId, currentPosition);
    }
  }

  // Profile Management Handlers
  async handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      this.showNotification('Please enter both email and password', 'warning');
      return;
    }

    try {
      const result = await this.authService.signIn(email, password);
      
      if (result.success) {
        this.currentUser = result.user;
        await this.loadUserData();
        this.showMainPage();
        this.showNotification(`Welcome back, ${this.currentUser.displayName || 'User'}!`, 'success');
      } else {
        this.showNotification(result.error, 'warning');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showNotification('An error occurred during sign in', 'warning');
    }
  }

  async handleRegister(event) {
    event.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const fullName = document.getElementById('register-fullname').value;
    const level = document.getElementById('register-level').value;

    // Validation
    if (!email || !password) {
      this.showNotification('Please enter both email and password', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      this.showNotification('Passwords do not match', 'warning');
      return;
    }

    if (password.length < 6) {
      this.showNotification('Password must be at least 6 characters long', 'warning');
      return;
    }

    try {
      const result = await this.authService.createAccount(email, password, fullName, level);
      
      if (result.success) {
        this.currentUser = result.user;
        await this.loadUserData();
        this.showMainPage();
        this.showNotification('Account created successfully! Your data will sync across all devices.', 'success');
      } else {
        this.showNotification(result.error, 'warning');
      }
    } catch (error) {
      console.error('Registration error:', error);
      this.showNotification('An error occurred during account creation', 'warning');
    }
  }

  async logout() {
    try {
      const result = await this.authService.signOutUser();
      
      if (result.success) {
        this.currentUser = null;
        this.userData = { routines: {}, skills: {} };
        this.showLoginPage();
        this.showNotification('Signed out successfully', 'info');
      } else {
        this.showNotification('Error signing out', 'warning');
      }
    } catch (error) {
      console.error('Logout error:', error);
      this.showNotification('Error signing out', 'warning');
    }
  }

  // Data Management Methods
  async loadUserData() {
    if (!this.authService || !this.authService.isSignedIn()) {
      return;
    }

    try {
      const data = await this.authService.loadUserData();
      if (data) {
        this.userData = data;
        // Ensure userData has the correct structure
        if (!this.userData.routines) {
          this.userData.routines = {
            floor: [],
            pommel: [],
            rings: [],
            vault: [],
            pbars: [],
            hbar: []
          };
        }
        this.refreshUI();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.showNotification('Error loading your data', 'warning');
    }
  }

  async saveUserData() {
    if (!this.authService || !this.authService.isSignedIn()) {
      return false;
    }

    try {
      const success = await this.authService.saveUserData(this.userData);
      if (success) {
        // Data saved successfully
        return true;
      } else {
        this.showNotification('Error saving data', 'warning');
        return false;
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      this.showNotification('Error saving data', 'warning');
      return false;
    }
  }

  // Update profile information
  async updateUserProfile(profileData) {
    try {
      const success = await this.authService.updateUserProfile(profileData);
      if (success) {
        this.showNotification('Profile updated successfully', 'success');
        this.updateCurrentProfileDisplay();
        return true;
      } else {
        this.showNotification('Error updating profile', 'warning');
        return false;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      this.showNotification('Error updating profile', 'warning');
      return false;
    }
  }

  showQuickLogin(username) {
    // This method is kept for legacy compatibility but not used with Firebase auth
    console.log('Legacy showQuickLogin called - not applicable with Firebase authentication');
  }

  showSwitchProfileModal() {
    const modal = document.getElementById('switch-profile-modal');
    const profilesList = document.getElementById('profiles-list');
    
    // With Firebase authentication, users need to sign out and sign in with different accounts
    profilesList.innerHTML = '<p class="no-profiles">To switch accounts, please sign out and sign in with a different email address.</p>';

    modal.style.display = 'block';
  }

  showManageProfileModal() {
    const modal = document.getElementById('manage-profile-modal');
    
    if (!this.authService || !this.authService.isSignedIn()) return;
    
    const user = this.authService.getCurrentUser();
    
    // Pre-fill edit profile form with Firebase user data
    document.getElementById('edit-username').value = user.email; // Use email as username
    
    // Load profile data from Firebase
    this.authService.getUserProfile().then(profile => {
      if (profile) {
        document.getElementById('edit-fullname').value = profile.fullName || user.displayName || '';
        document.getElementById('edit-level').value = profile.gymnasticsLevel || '';
      }
    }).catch(error => {
      console.log('Profile data not yet available:', error);
    });
    
    // Update data stats
    this.updateDataStats();
    
    modal.style.display = 'block';
  }

  updateDataStats() {
    const statsContainer = document.getElementById('profile-data-stats');
    if (!this.authService || !this.authService.isSignedIn()) return;

    const totalRoutines = Object.values(this.userData.routines || {}).reduce((sum, eventRoutines) => sum + eventRoutines.length, 0);
    const totalSkills = Object.values(this.userData.routines || {}).reduce((sum, eventRoutines) => {
      return sum + eventRoutines.reduce((skillSum, routine) => skillSum + (routine.skills ? routine.skills.length : 0), 0);
    }, 0);

    const user = this.authService.getCurrentUser();
    const memberSince = user ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown';

    statsContainer.innerHTML = `
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">${totalRoutines}</span>
          <span class="stat-label">Routines</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${totalSkills}</span>
          <span class="stat-label">Skills</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${memberSince}</span>
          <span class="stat-label">Member Since</span>
        </div>
      </div>
    `;
  }

  handleProfileUpdate() {
    const fullName = document.getElementById('edit-fullname').value.trim();
    const level = document.getElementById('edit-level').value;

    this.updateUserProfile({ fullName, gymnasticsLevel: level })
      .then(success => {
        if (success) {
          this.showNotification('Profile updated successfully!', 'success');
        } else {
          this.showNotification('Failed to update profile', 'warning');
        }
      })
      .catch(error => {
        console.error('Profile update error:', error);
        this.showNotification('Failed to update profile', 'warning');
      });
  }

  handlePasswordChange() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;

    if (newPassword !== confirmNewPassword) {
      this.showNotification('New passwords do not match', 'warning');
      return;
    }

    if (newPassword.length < 4) {
      this.showNotification('Password must be at least 4 characters long', 'warning');
      return;
    }

    try {
      this.changePassword(currentPassword, newPassword);
      this.showNotification('Password changed successfully!', 'success');
      
      // Clear form
      document.getElementById('change-password-form').reset();
    } catch (error) {
      this.showNotification(error.message, 'warning');
    }
  }

  handleDataExport() {
    try {
      const data = this.exportUserData();
      if (!data) {
        this.showNotification('No data to export', 'warning');
        return;
      }

      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gymnastics-data-${this.currentUser}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showNotification('Data exported successfully!', 'success');
    } catch (error) {
      this.showNotification('Failed to export data', 'warning');
    }
  }

  handleDataImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        this.importUserData(e.target.result);
        this.showNotification('Data imported successfully!', 'success');
      } catch (error) {
        this.showNotification('Failed to import data: ' + error.message, 'warning');
      }
    };
    reader.readAsText(file);
  }

  showDeleteConfirmation() {
    document.getElementById('confirm-title').textContent = 'Delete Profile';
    document.getElementById('confirm-message').textContent = 
      `Are you sure you want to delete the profile "${this.currentUser}"? This action cannot be undone and will permanently delete all your routines and skills.`;
    
    this.pendingConfirmAction = () => {
      try {
        this.deleteProfile(this.currentUser);
        this.showNotification('Profile deleted successfully', 'success');
      } catch (error) {
        this.showNotification('Failed to delete profile', 'warning');
      }
    };

    document.getElementById('confirm-modal').style.display = 'block';
  }

  // Modal Management
  showRoutineModal() {
    document.getElementById('routine-modal').style.display = 'block';
    document.getElementById('routine-name').focus();
  }

  showSkillModal(eventType, routineId, skillId = null) {
    this.currentEvent = eventType;
    this.currentRoutineId = routineId;
    this.currentSkillId = skillId;

    const modalTitle = document.querySelector('#skill-modal h2');
    const submitButton = document.querySelector('#skill-modal button[type="submit"]');

    if (skillId) {
      modalTitle.textContent = 'Edit Skill';
      submitButton.textContent = 'Save Changes';
      const routine = this.data[eventType].find(r => r.id === routineId);
      const skill = routine?.skills.find(s => s.id === skillId);
      if (skill) {
        document.getElementById('skill-name').value = skill.name;
        document.getElementById('skill-difficulty').value = skill.difficulty;
        document.getElementById('skill-target-date').value = skill.targetDate;
        document.getElementById('skill-notes').value = skill.notes;
        document.getElementById('skill-name').removeAttribute('readonly');
      }
    } else {
      modalTitle.textContent = 'Add Skill';
      submitButton.textContent = 'Add Skill';
      document.getElementById('skill-form').reset();
      const nameField = document.getElementById('skill-name');
      nameField.setAttribute('readonly', 'true');
      nameField.placeholder = 'Select a skill from the database above';
    }
    
    // Map event types to database names
    const eventNameMap = {
      'floor': 'Floor Exercise',
      'pommel': 'Pommel Horse',
      'rings': 'Still Rings',
      'vault': 'Vault',
      'pbars': 'Parallel Bars',
      'hbar': 'High Bar'
    };
    
    const eventName = eventNameMap[eventType];
    
    // Set up search functionality
    this.setupSkillSearch(eventName);
    
    // Load initial skills list for this event
    this.renderSkillsSearchResults(eventName, '');
    
    document.getElementById('skill-modal').style.display = 'block';
    document.getElementById('skill-search').focus();
  }

  setupSkillSearch(eventName) {
    const searchInput = document.getElementById('skill-search');
    const resultsContainer = document.getElementById('skills-search-results');
    
    // Clear previous event listeners
    searchInput.replaceWith(searchInput.cloneNode(true));
    const newSearchInput = document.getElementById('skill-search');
    
    // Add search input listener
    newSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      this.renderSkillsSearchResults(eventName, query);
    });
    
    // Clear any previous results
    resultsContainer.innerHTML = '';
  }

  renderSkillsSearchResults(eventName, query) {
    const resultsContainer = document.getElementById('skills-search-results');
    const skills = searchSkills(eventName, query);
    
    if (skills.length === 0) {
      resultsContainer.innerHTML = `
        <div class="empty-results">
          ${query ? `No skills found matching "${query}"` : `No skills available for ${eventName}`}
        </div>
      `;
      return;
    }
    
    resultsContainer.innerHTML = skills.map(skill => {
      // Provide fallback for missing realName or description
      const skillDescription = skill.realName && skill.realName !== skill.name ? 
        skill.realName : 
        (skill.description || `${eventName} skill`);
      
      return `
        <div class="skill-item" data-skill-name="${skill.name}" data-skill-difficulty="${skill.difficulty}">
          <div class="skill-info-container">
            <div class="skill-name">${skill.name}</div>
            <div class="skill-real-name">${skillDescription}</div>
          </div>
          <span class="skill-difficulty ${skill.difficulty}">${skill.difficulty}</span>
        </div>
      `;
    }).join('');
    
    // Add click listeners to skill items
    resultsContainer.querySelectorAll('.skill-item').forEach(item => {
      item.addEventListener('click', () => {
        this.selectSkillFromDatabase(
          item.dataset.skillName, 
          item.dataset.skillDifficulty
        );
      });
    });
  }

  selectSkillFromDatabase(skillName, difficulty) {
    // Populate the form with selected skill
    const nameField = document.getElementById('skill-name');
    nameField.value = skillName;
    nameField.removeAttribute('readonly');
    
    document.getElementById('skill-difficulty').value = difficulty;
    
    // Highlight selected item
    document.querySelectorAll('.skill-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    const selectedItem = document.querySelector(`[data-skill-name="${skillName}"]`);
    if (selectedItem) {
      selectedItem.classList.add('selected');
    }
    
    // Clear search to show selection
    document.getElementById('skill-search').value = `Selected: ${skillName} (${difficulty})`;
  }

  showProgressionModal(eventType, routineId, skillId) {
    this.currentEvent = eventType;
    this.currentRoutineId = routineId;
    this.currentSkillId = skillId;
    
    // Find the skill to get its name
    const routine = this.data[eventType].find(r => r.id === routineId);
    const skill = routine?.skills.find(s => s.id === skillId);
    
    if (skill) {
      document.getElementById('target-skill-name').textContent = skill.name;
    }
    
    document.getElementById('progression-modal').style.display = 'block';
    document.getElementById('progression-name').focus();
  }

  showNotesModal(eventType, routineId) {
    this.currentEvent = eventType;
    this.currentRoutineId = routineId;
    
    // Find the routine to get its name and notes
    const routine = this.data[eventType].find(r => r.id === routineId);
    
    if (routine) {
      document.getElementById('notes-routine-name').textContent = routine.name;
      document.getElementById('routine-notes-edit').value = routine.notes || '';
    }
    
    document.getElementById('notes-modal').style.display = 'block';
    document.getElementById('routine-notes-edit').focus();
  }

  closeModal(modal) {
    modal.style.display = 'none';
    // Reset forms
    modal.querySelectorAll('form').forEach(form => form.reset());
    
    // Reset skill search if closing skill modal
    if (modal.id === 'skill-modal') {
      document.getElementById('skill-search').value = '';
      document.getElementById('skills-search-results').innerHTML = '';
      document.querySelectorAll('.skill-item').forEach(item => {
        item.classList.remove('selected');
      });
      
      // Reset skill name field to readonly
      const nameField = document.getElementById('skill-name');
      nameField.setAttribute('readonly', 'true');
      nameField.placeholder = 'Select a skill from the database above';
    }
  }

  // Routine Management
  handleRoutineSubmit() {
    const name = document.getElementById('routine-name').value;
    const date = document.getElementById('routine-date').value;
    const notes = document.getElementById('routine-notes').value;

    const routine = {
      id: Date.now().toString(),
      name,
      date,
      notes,
      skills: [],
      createdAt: new Date().toISOString()
    };

    this.userData.routines[this.currentEvent].push(routine);
    this.saveUserData();
    this.renderRoutines(this.currentEvent);
    this.closeModal(document.getElementById('routine-modal'));
    this.showNotification('Routine created successfully', 'success');
  }

  // Skill Management
  handleSkillSubmit() {
    const name = document.getElementById('skill-name').value;
    const targetDate = document.getElementById('skill-target-date').value;
    const notes = document.getElementById('skill-notes').value;
    
    // Check if a difficulty was set from database selection
    const difficultyField = document.getElementById('skill-difficulty');
    let difficulty = difficultyField ? difficultyField.value : null;
    
    // If no difficulty was set (manual entry), show error message
    if (!difficulty) {
      this.showNotification('Please select a skill from the database to ensure accurate difficulty rating.', 'warning');
      return;
    }

    const routine = this.data[this.currentEvent].find(r => r.id === this.currentRoutineId);
    if (!routine) {
      this.showNotification('Routine not found', 'error');
      return;
    }

    if (this.currentSkillId) {
      // Editing existing skill
      const skill = routine.skills.find(s => s.id === this.currentSkillId);
      if (skill) {
        skill.name = name;
        skill.targetDate = targetDate;
        skill.notes = notes;
        skill.difficulty = difficulty;
      }
    } else {
      // Adding new skill
      // For vault, only allow one skill per routine
      if (this.currentEvent === 'vault' && routine.skills.length > 0) {
        this.showNotification('Vault routines can only have one skill. Please delete the existing skill first.', 'warning');
        return;
      }

      const skill = {
        id: Date.now().toString(),
        name,
        difficulty,
        targetDate,
        notes,
        completed: false,
        completedAt: null,
        progressions: [],
        createdAt: new Date().toISOString()
      };
      routine.skills.push(skill);
    }

    this.saveData();
    
    // Re-render appropriate view
    if (this.currentPage === 'routine' && this.currentRoutineView) {
      // Update the routine reference in currentRoutineView
      this.currentRoutineView.routine = routine;
      this.renderRoutinePage(this.currentRoutineView.eventType, routine);
    } else {
      this.renderRoutines(this.currentEvent);
    }
    
    this.closeModal(document.getElementById('skill-modal'));
    this.showNotification(`Skill ${this.currentSkillId ? 'updated' : 'added'} successfully`, 'success');
  }

  // Progression Management
  handleProgressionSubmit() {
    const name = document.getElementById('progression-name').value;
    const difficulty = document.getElementById('progression-difficulty').value;
    const targetDate = document.getElementById('progression-target-date').value;
    const notes = document.getElementById('progression-notes').value;

    const progression = {
      id: Date.now().toString(),
      name,
      difficulty,
      targetDate,
      notes,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    };

    const routine = this.data[this.currentEvent].find(r => r.id === this.currentRoutineId);
    const skill = routine?.skills.find(s => s.id === this.currentSkillId);
    
    if (skill) {
      if (!skill.progressions) {
        skill.progressions = [];
      }
      skill.progressions.push(progression);
      this.saveData();
      this.renderRoutines(this.currentEvent);
      this.closeModal(document.getElementById('progression-modal'));
      this.showNotification('Progression step added successfully', 'success');
    }
  }

  // Notes Management
  handleNotesSubmit() {
    const notes = document.getElementById('routine-notes-edit').value;
    
    const routine = this.data[this.currentEvent].find(r => r.id === this.currentRoutineId);
    if (routine) {
      routine.notes = notes;
      this.saveData();
      
      // Update the routine page view if we're currently viewing it
      if (this.currentRoutineView && 
          this.currentRoutineView.eventType === this.currentEvent && 
          this.currentRoutineView.routineId === this.currentRoutineId) {
        this.currentRoutineView.routine = routine;
        this.renderRoutinePage(this.currentEvent, routine);
      }
      
      this.closeModal(document.getElementById('notes-modal'));
      this.showNotification('Notes updated successfully', 'success');
    }
  }

  toggleSkill(eventType, routineId, skillId) {
    const routine = this.data[eventType].find(r => r.id === routineId);
    const skill = routine.skills.find(s => s.id === skillId);
    
    skill.completed = !skill.completed;
    this.saveData();
    
    // Re-render appropriate view
    if (this.currentPage === 'routine' && this.currentRoutineView) {
      // Update the routine reference in currentRoutineView
      this.currentRoutineView.routine = routine;
      this.renderRoutinePage(this.currentRoutineView.eventType, routine);
    } else {
      this.renderRoutines(eventType);
    }
    
    this.showNotification(`Skill ${skill.completed ? 'completed' : 'marked incomplete'}`, 'success');
  }

  toggleProgression(eventType, routineId, skillId, progressionId) {
    const routine = this.data[eventType].find(r => r.id === routineId);
    const skill = routine?.skills.find(s => s.id === skillId);
    const progression = skill?.progressions?.find(p => p.id === progressionId);
    
    if (progression) {
      progression.completed = !progression.completed;
      progression.completedAt = progression.completed ? new Date().toISOString() : null;
      this.saveData();
      this.renderRoutines(eventType);
    }
  }

  deleteSkill(eventType, routineId, skillId) {
    const routine = this.data[eventType].find(r => r.id === routineId);
    if (routine) {
      routine.skills = routine.skills.filter(s => s.id !== skillId);
      this.saveData();
      
      // Re-render appropriate view
      if (this.currentPage === 'routine' && this.currentRoutineView) {
        // Update the routine reference in currentRoutineView
        this.currentRoutineView.routine = routine;
        this.renderRoutinePage(this.currentRoutineView.eventType, routine);
      } else {
        this.renderRoutines(eventType);
      }
      
      this.showNotification('Skill deleted', 'info');
    }
  }

  deleteProgression(eventType, routineId, skillId, progressionId) {
    console.log('deleteProgression called with:', { eventType, routineId, skillId, progressionId });
    
    const routine = this.data[eventType].find(r => r.id === routineId);
    if (!routine) {
      console.error('Routine not found:', routineId);
      return;
    }
    
    const skill = routine.skills.find(s => s.id === skillId);
    if (!skill) {
      console.error('Skill not found:', skillId);
      return;
    }
    
    if (!skill.progressions) {
      console.error('No progressions found for skill:', skillId);
      return;
    }
    
    const initialLength = skill.progressions.length;
    skill.progressions = skill.progressions.filter(p => p.id !== progressionId);
    
    if (skill.progressions.length === initialLength) {
      console.error('Progression not found or not deleted:', progressionId);
      return;
    }
    
    console.log('Progression deleted successfully. Remaining progressions:', skill.progressions.length);
    
    this.saveData();
    this.renderRoutines(eventType);
    this.showNotification('Progression step deleted', 'info');
  }

  deleteRoutine(eventType, routineId) {
    this.data[eventType] = this.data[eventType].filter(r => r.id !== routineId);
    this.saveData();
    this.renderRoutines(eventType);
    this.showNotification('Routine deleted', 'info');
  }

  // Rendering
  renderAll() {
    Object.keys(this.userData.routines).forEach(eventType => {
      this.renderRoutines(eventType);
    });
  }

  renderRoutines(eventType) {
    const container = document.getElementById(`${eventType}-routines`);
    const routines = this.userData.routines[eventType];

    if (routines.length === 0) {
      container.innerHTML = this.renderEmptyState();
      return;
    }

    container.innerHTML = routines.map(routine => this.renderRoutine(eventType, routine)).join('');
    
    // Add event listeners for dynamic content
    this.addDynamicEventListeners(eventType);
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🎯</div>
        <div class="empty-state-text">No routines yet</div>
        <p>Click "Add Routine" to get started tracking your skills!</p>
      </div>
    `;
  }

  renderRoutine(eventType, routine) {
    return `
      <div class="routine-card fade-in">
        <div class="routine-header">
          <div class="routine-title-container">
            <h3 class="routine-title">${routine.name}</h3>
            <button class="view-routine-btn" data-event="${eventType}" data-routine="${routine.id}">
              View Routine →
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderSkill(eventType, routineId, skill, index) {
    const isCompleted = skill.completed;
    const hasProgressions = skill.progressions && skill.progressions.length > 0;
    const progressionProgress = this.calculateProgressionProgress(skill);
    const isOverdueSkill = this.isOverdue(skill.targetDate);
    
    return `
      <div class="skill-item ${isCompleted ? 'completed' : ''} ${isOverdueSkill ? 'overdue' : ''}" 
           data-skill-id="${skill.id}" 
           draggable="true">
        <div class="skill-content">
          <div class="skill-header">
            <div class="skill-order-number" data-position="${index + 1}">${index + 1}</div>
            <div class="skill-main-info">
              <div class="skill-name-row">
                <label class="skill-checkbox-container">
                  <input type="checkbox" 
                         class="skill-checkbox" 
                         ${isCompleted ? 'checked' : ''}
                         data-event="${eventType}"
                         data-routine="${routineId}"
                         data-skill="${skill.id}">
                  <span class="skill-name">${skill.name}</span>
                </label>
                <span class="skill-difficulty ${skill.difficulty}">${skill.difficulty}</span>
              </div>
              ${skill.targetDate ? `
                <div class="skill-target-date ${isOverdueSkill ? 'overdue' : ''}">
                  Target: ${this.formatDate(skill.targetDate)}
                </div>
              ` : ''}
              ${skill.notes ? `<div class="skill-notes">${skill.notes}</div>` : ''}
            </div>
          </div>
          
          ${hasProgressions ? `
            <div class="progressions-section">
              <div class="progressions-header">
                <span class="progressions-title">Progression Steps</span>
                <div class="progressions-progress">
                  <span class="progress-text">${progressionProgress.completed}/${progressionProgress.total} completed (${progressionProgress.percentage}%)</span>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressionProgress.percentage}%"></div>
                  </div>
                </div>
              </div>
              <div class="progressions-list">
                ${skill.progressions.map(progression => this.renderProgression(eventType, routineId, skill.id, progression)).join('')}
              </div>
            </div>
          ` : ''}
          
          <div class="skill-actions">
            <button class="skill-action-btn edit-skill-btn" title="Edit skill">
              ✏️ Edit
            </button>
            <button class="skill-action-btn" onclick="gymnasticsTracker.showProgressionModal('${eventType}', '${routineId}', '${skill.id}')" title="Add progression step">
              ➕ Add Step
            </button>
            <button class="skill-action-btn move-up-btn" onclick="gymnasticsTracker.moveSkillUp('${eventType}', '${routineId}', ${index})" title="Move up" ${index === 0 ? 'disabled' : ''}>
              ⬆️
            </button>
            <button class="skill-action-btn move-down-btn" onclick="gymnasticsTracker.moveSkillDown('${eventType}', '${routineId}', ${index})" title="Move down">
              ⬇️
            </button>
            <button class="skill-action-btn delete-btn" onclick="gymnasticsTracker.deleteSkill('${eventType}', '${routineId}', '${skill.id}')" title="Delete skill">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderProgression(eventType, routineId, skillId, progression) {
    const isCompleted = progression.completed;
    const isOverdueProgression = this.isOverdue(progression.targetDate);
    
    return `
      <div class="progression-item ${isCompleted ? 'completed' : ''} ${isOverdueProgression ? 'overdue' : ''}">
        <div class="progression-content">
          <label class="progression-checkbox-container">
            <input type="checkbox" 
                   class="progression-checkbox" 
                   ${isCompleted ? 'checked' : ''}
                   data-event="${eventType}"
                   data-routine="${routineId}"
                   data-skill="${skillId}"
                   data-progression="${progression.id}">
            <span class="progression-name">${progression.name}</span>
          </label>
          ${progression.difficulty ? `<span class="progression-difficulty ${progression.difficulty}">${progression.difficulty}</span>` : ''}
        </div>
        
        ${progression.targetDate ? `
          <div class="progression-target-date ${isOverdueProgression ? 'overdue' : ''}">
            Target: ${this.formatDate(progression.targetDate)}
          </div>
        ` : ''}
        
        ${progression.notes ? `<div class="progression-notes">${progression.notes}</div>` : ''}
        
        <div class="progression-actions">
          <button class="delete-progression-btn" 
                  data-event="${eventType}" 
                  data-routine="${routineId}" 
                  data-skill="${skillId}" 
                  data-progression="${progression.id}"
                  title="Delete progression step">
            🗑️
          </button>
        </div>
      </div>
    `;
  }

  setupDragAndDrop(container) {
    let draggedElement = null;
    let draggedIndex = null;

    container.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('skill-item')) {
        draggedElement = e.target;
        draggedIndex = Array.from(container.children).indexOf(draggedElement);
        e.target.style.opacity = '0.5';
      }
    });

    container.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('skill-item')) {
        e.target.style.opacity = '';
        draggedElement = null;
        draggedIndex = null;
      }
    });

    container.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    container.addEventListener('drop', (e) => {
      e.preventDefault();
      
      if (!draggedElement) return;
      
      const dropTarget = e.target.closest('.skill-item');
      if (!dropTarget || dropTarget === draggedElement) return;
      
      const dropIndex = Array.from(container.children).indexOf(dropTarget);
      
      if (draggedIndex !== dropIndex) {
        // Perform the reorder
        this.reorderSkills(
          this.currentRoutineView.eventType,
          this.currentRoutineView.routineId,
          draggedIndex,
          dropIndex
        );
        
        // Refresh the display
        const updatedRoutine = this.data[this.currentRoutineView.eventType]
          .find(r => r.id === this.currentRoutineView.routineId);
        this.renderRoutinePage(this.currentRoutineView.eventType, updatedRoutine);
      }
    });
  }

  reorderSkills(eventType, routineId, fromIndex, toIndex) {
    const routine = this.data[eventType].find(r => r.id === routineId);
    if (!routine || !routine.skills) return;
    
    const skills = routine.skills;
    const [movedSkill] = skills.splice(fromIndex, 1);
    skills.splice(toIndex, 0, movedSkill);
    
    this.saveData();
  }

  makeOrderNumberEditable(orderElement, eventType, routineId, skillId, currentPosition) {
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1';
    input.value = currentPosition;
    input.className = 'order-input';
    
    const routine = this.data[eventType].find(r => r.id === routineId);
    input.max = routine ? routine.skills.length : currentPosition;
    
    input.addEventListener('blur', () => {
      this.handleOrderChange(orderElement, input, eventType, routineId, skillId, currentPosition);
    });
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      } else if (e.key === 'Escape') {
        orderElement.textContent = currentPosition;
      }
    });
    
    orderElement.innerHTML = '';
    orderElement.appendChild(input);
    input.focus();
    input.select();
  }

  handleOrderChange(orderElement, input, eventType, routineId, skillId, currentPosition) {
    const newPosition = parseInt(input.value);
    
    if (isNaN(newPosition) || newPosition < 1) {
      orderElement.textContent = currentPosition;
      return;
    }
    
    const routine = this.data[eventType].find(r => r.id === routineId);
    if (!routine || newPosition > routine.skills.length) {
      orderElement.textContent = currentPosition;
      return;
    }
    
    if (newPosition !== currentPosition) {
      // Find current skill index
      const currentIndex = routine.skills.findIndex(s => s.id === skillId);
      if (currentIndex !== -1) {
        this.reorderSkills(eventType, routineId, currentIndex, newPosition - 1);
        
        // Refresh the routine page
        const updatedRoutine = this.data[eventType].find(r => r.id === routineId);
        this.renderRoutinePage(eventType, updatedRoutine);
      }
    } else {
      orderElement.textContent = currentPosition;
    }
  }

  moveSkillToPosition(eventType, routineId, skillId, newPosition) {
    const routine = this.data[eventType].find(r => r.id === routineId);
    if (!routine || newPosition < 1 || newPosition > routine.skills.length) {
      this.showNotification('Invalid position', 'warning');
      return;
    }
    
    const currentIndex = routine.skills.findIndex(s => s.id === skillId);
    if (currentIndex !== -1) {
      this.reorderSkills(eventType, routineId, currentIndex, newPosition - 1);
      
      // Refresh the routine page
      const updatedRoutine = this.data[eventType].find(r => r.id === routineId);
      this.renderRoutinePage(eventType, updatedRoutine);
      
      this.showNotification(`Skill moved to position ${newPosition}`, 'success');
    }
  }

  addDynamicEventListeners(eventType) {
    let container;
    
    if (eventType === 'routine-page') {
      // Handle routine page container
      container = document.getElementById('routine-skills-list');
    } else {
      // Handle main page event containers
      container = document.getElementById(`${eventType}-routines`);
    }
    
    if (!container) return;
    
    // Use event delegation for all dynamic content
    container.addEventListener('click', (e) => {
      console.log('Click event detected on:', e.target.tagName, e.target.className, e.target.textContent);
      
      e.stopPropagation();
      
      // Don't prevent default for checkboxes - they need their default behavior
      if (!e.target.classList.contains('skill-checkbox') && 
          !e.target.classList.contains('progression-checkbox')) {
        e.preventDefault();
      }
      
      // Check if this is a delete progression button or contains one
      let target = e.target;
      
      // Look up the DOM tree to find the actual button if we clicked inside it
      while (target && target !== container) {
        console.log('Checking element:', target.tagName, target.className);
        
        if (target.classList.contains('edit-skill-btn')) {
          const skillItem = target.closest('.skill-item');
          if (skillItem) {
            const eventType = this.currentRoutineView.eventType;
            const routineId = this.currentRoutineView.routineId;
            const skillId = skillItem.dataset.skillId;
            this.showSkillModal(eventType, routineId, skillId);
          }
          return;
        }

        if (target.classList.contains('delete-progression-btn')) {
          console.log('Found delete progression button!', target.dataset);
          
          const eventType = target.dataset.event;
          const routineId = target.dataset.routine;
          const skillId = target.dataset.skill;
          const progressionId = target.dataset.progression;
          
          console.log('Deleting progression immediately:', { eventType, routineId, skillId, progressionId });
          
          try {
            this.deleteProgression(eventType, routineId, skillId, progressionId);
            console.log('Delete progression method completed');
          } catch (error) {
            console.error('Error during deleteProgression:', error);
          }
          return;
        }
        
        // View routine button
        if (target.classList.contains('view-routine-btn')) {
          const eventType = target.dataset.event;
          const routineId = target.dataset.routine;
          this.showRoutinePage(eventType, routineId);
          return;
        }
        
        target = target.parentElement;
      }
    });

    // Add checkbox event handling with change event
    container.addEventListener('change', (e) => {
      if (e.target.classList.contains('skill-checkbox')) {
        const eventType = e.target.dataset.event;
        const routineId = e.target.dataset.routine;
        const skillId = e.target.dataset.skill;
        this.toggleSkill(eventType, routineId, skillId);
      } else if (e.target.classList.contains('progression-checkbox')) {
        const eventType = e.target.dataset.event;
        const routineId = e.target.dataset.routine;
        const skillId = e.target.dataset.skill;
        const progressionId = e.target.dataset.progression;
        this.toggleProgression(eventType, routineId, skillId, progressionId);
      }
    });
  }

  // Refresh the UI after data changes
  refreshUI() {
    if (this.authService && this.authService.isSignedIn()) {
      this.updateCurrentProfileDisplay();
      this.renderAll();
    }
  }

  // Update current profile display
  async updateCurrentProfileDisplay() {
    if (!this.authService || !this.authService.isSignedIn()) return;
    
    const user = this.authService.getCurrentUser();
    if (user) {
      const profile = await this.authService.getUserProfile();
      const displayName = user.displayName || profile?.fullName || user.email;
      const level = profile?.gymnasticsLevel || 'No level set';
      const initial = displayName.charAt(0).toUpperCase();
      
      const nameElement = document.getElementById('current-profile-name');
      const levelElement = document.getElementById('current-profile-level');
      const avatarElement = document.querySelector('.profile-avatar');
      
      if (nameElement) nameElement.textContent = displayName;
      if (levelElement) levelElement.textContent = level;
      if (avatarElement) avatarElement.textContent = initial;
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.gymnasticsTracker = new GymnasticsTracker();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Escape key closes modals
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal').forEach(modal => {
      if (modal.style.display === 'block') {
        modal.style.display = 'none';
      }
    });
  }
});