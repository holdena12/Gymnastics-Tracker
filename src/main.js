// Import skills database
import { searchSkills, getSkillsForEvent } from './skills-database.js';

// Mobile Detection and CSS Loading
class MobileDetector {
  static isMobile() {
    // Multiple detection methods for comprehensive mobile detection
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Check user agent strings for mobile devices
    const mobileRegex = /android|blackberry|iemobile|ipad|iphone|ipod|opera mini|mobile/i;
    const isUserAgentMobile = mobileRegex.test(userAgent);
    
    // Check for touch capability
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Check screen dimensions (mobile-like screen size)
    const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 768;
    
    // Check device pixel ratio (often higher on mobile)
    const isHighDPI = window.devicePixelRatio > 1;
    
    // Comprehensive mobile detection
    return isUserAgentMobile || (isTouchDevice && isSmallScreen);
  }
  
  static isTablet() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const tabletRegex = /ipad|tablet|playbook|silk/i;
    const isTabletUserAgent = tabletRegex.test(userAgent);
    
    // Screen size between mobile and desktop
    const isTabletScreen = window.innerWidth > 768 && window.innerWidth <= 1024;
    
    return isTabletUserAgent || isTabletScreen;
  }
  
  static loadMobileCSS() {
    // Remove existing mobile CSS if any
    const existingMobileCSS = document.getElementById('mobile-styles');
    if (existingMobileCSS) {
      existingMobileCSS.remove();
    }
    
    // Create and inject mobile-specific CSS
    const mobileCSS = document.createElement('link');
    mobileCSS.id = 'mobile-styles';
    mobileCSS.rel = 'stylesheet';
    mobileCSS.href = './mobile-styles.css';
    mobileCSS.media = 'screen';
    
    // Add CSS to head
    document.head.appendChild(mobileCSS);
    
    // Add mobile class to body for additional styling hooks
    document.body.classList.add('mobile-device');
    
    console.log('Mobile-optimized CSS loaded');
  }
  
  static loadTabletCSS() {
    // Add tablet-specific optimizations
    document.body.classList.add('tablet-device');
    console.log('Tablet optimizations applied');
  }
  
  static applyMobileOptimizations() {
    // Viewport meta tag optimization for mobile
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    
    // Optimized viewport settings for mobile
    viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover';
    
    // Prevent zoom on inputs (iOS Safari fix)
    document.addEventListener('touchstart', function() {}, { passive: true });
    
    // Enhanced touch feedback
    document.body.style.webkitTapHighlightColor = 'transparent';
    document.body.style.webkitTouchCallout = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.userSelect = 'none';
    
    console.log('Mobile optimizations applied');
  }
  
  static init() {
    if (this.isMobile()) {
      this.loadMobileCSS();
      this.applyMobileOptimizations();
    } else if (this.isTablet()) {
      this.loadTabletCSS();
    }
    
    // Log device information for debugging
    console.log('Device Detection:', {
      isMobile: this.isMobile(),
      isTablet: this.isTablet(),
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      touchSupport: 'ontouchstart' in window,
      userAgent: navigator.userAgent
    });
  }
}

// Gymnastics Skills Tracker with Profile Management
class GymnasticsTracker {
  constructor() {
    // Initialize mobile detection first
    MobileDetector.init();
    
    // Profile management properties
    this.currentUser = null;
    this.profiles = this.loadProfiles();
    
    // App properties
    this.data = {};
    this.currentEvent = null;
    this.currentRoutineId = null;
    this.currentSkillId = null;
    this.currentPage = 'login'; // Start with login page
    this.currentRoutineView = null;
    this.difficultyValues = {
      'A': 0.1, 'B': 0.2, 'C': 0.3, 'D': 0.4, 'E': 0.5, 
      'F': 0.6, 'G': 0.7, 'H': 0.8, 'I': 0.9, 'J': 1.0
    };
    
    this.init();
  }

  init() {
    // Check if user is already logged in
    this.checkAuthStatus();
    this.setupEventListeners();
    
    // Initialize mobile-specific features
    if (MobileDetector.isMobile()) {
      this.setupMobileFeatures();
    }
    
    if (this.currentUser) {
      this.showMainApp();
    } else {
      this.showLoginPage();
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
    this.renderRecentProfiles();
  }

  showMainApp() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('main-page').style.display = 'block';
    document.getElementById('routine-page').style.display = 'none';
    this.updateProfileDisplay();
    this.renderAll();
    // Auto-save every 30 seconds as backup
    setInterval(() => this.saveData(), 30000);
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

  // Data Management (Per User)
  loadData() {
    if (!this.currentUser) return;
    
    try {
      const stored = localStorage.getItem(`gymnastics-data-${this.currentUser}`);
      if (stored) {
        this.data = JSON.parse(stored);
        console.log('User data loaded successfully');
        return;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    
    // Initialize with empty data structure
    this.data = {
      floor: [],
      pommel: [],
      rings: [],
      vault: [],
      pbars: [],
      hbar: []
    };
  }

  saveData() {
    if (!this.currentUser) return;
    
    try {
      localStorage.setItem(`gymnastics-data-${this.currentUser}`, JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving user data:', error);
      this.showNotification('Warning: Failed to save data', 'warning');
    }
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
    const routine = this.data[eventType].find(r => r.id === routineId);
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
    this.currentPage = 'main';
    this.currentRoutineView = null;

    // Hide routine page, show main page
    document.getElementById('routine-page').style.display = 'none';
    document.getElementById('main-page').style.display = 'block';
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
    // Profile System Event Listeners
    
    // Login/Register Tab Switching
    document.querySelectorAll('.login-tab').forEach(tab => {
      // Add both click and touchend event listeners for better mobile support
      const handleTabSwitch = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const targetTab = e.target.dataset.tab;
        
        // Update tab active states
        document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        // Update form active states
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        if (targetTab === 'login') {
          document.getElementById('login-form').classList.add('active');
        } else if (targetTab === 'register') {
          document.getElementById('register-form').classList.add('active');
        }
      };
      
      tab.addEventListener('click', handleTabSwitch);
      tab.addEventListener('touchend', handleTabSwitch);
    });

    // Authentication Forms
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    document.getElementById('register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister();
    });

    // Recent Profiles Quick Selection
    document.addEventListener('click', (e) => {
      if (e.target.closest('.recent-profile-item')) {
        const username = e.target.closest('.recent-profile-item').dataset.username;
        this.showQuickLogin(username);
      }
    });

    // Profile Actions
    document.getElementById('switch-profile-btn').addEventListener('click', () => {
      this.showSwitchProfileModal();
    });

    document.getElementById('manage-profile-btn').addEventListener('click', () => {
      this.showManageProfileModal();
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
      this.logout();
    });

    // Profile Modal Tabs
    document.querySelectorAll('.profile-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = e.target.dataset.tab;
        
        // Update tab active states
        document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        // Update content active states
        document.querySelectorAll('.profile-tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${targetTab}-profile-tab`).classList.add('active');
      });
    });

    // Profile Management Forms
    document.getElementById('edit-profile-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleProfileUpdate();
    });

    document.getElementById('change-password-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handlePasswordChange();
    });

    // Data Management
    document.getElementById('export-data-btn').addEventListener('click', () => {
      this.handleDataExport();
    });

    document.getElementById('import-data-btn').addEventListener('click', () => {
      document.getElementById('import-data-input').click();
    });

    document.getElementById('import-data-input').addEventListener('change', (e) => {
      this.handleDataImport(e);
    });

    document.getElementById('delete-profile-btn').addEventListener('click', () => {
      this.showDeleteConfirmation();
    });

    // Create New Profile from Switch Modal
    document.getElementById('create-new-profile-btn').addEventListener('click', () => {
      this.closeModal(document.getElementById('switch-profile-modal'));
      // Switch to register tab
      document.querySelector('.login-tab[data-tab="register"]').click();
      this.showLoginPage();
    });

    // Confirmation Modal
    document.getElementById('confirm-proceed').addEventListener('click', () => {
      if (this.pendingConfirmAction) {
        this.pendingConfirmAction();
        this.pendingConfirmAction = null;
      }
      this.closeModal(document.getElementById('confirm-modal'));
    });

    document.getElementById('confirm-cancel').addEventListener('click', () => {
      this.pendingConfirmAction = null;
      this.closeModal(document.getElementById('confirm-modal'));
    });

    // Existing App Event Listeners
    
    // Add routine buttons
    document.querySelectorAll('.add-routine-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentEvent = e.target.dataset.event;
        this.showRoutineModal();
      });
    });

    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.closeModal(e.target.closest('.modal'));
      });
    });

    // Modal background clicks
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal);
        }
      });
    });

    // Form submissions
    document.getElementById('routine-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRoutineSubmit();
    });

    document.getElementById('skill-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSkillSubmit();
    });

    document.getElementById('progression-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleProgressionSubmit();
    });

    // Save data when window is about to close
    window.addEventListener('beforeunload', () => {
      this.saveData();
    });

    // Save data when window loses focus
    window.addEventListener('blur', () => {
      this.saveData();
    });

    // Back to dashboard button
    document.getElementById('back-to-dashboard').addEventListener('click', () => {
      this.showMainPage();
    });

    // Routine page add skill button
    document.getElementById('routine-add-skill').addEventListener('click', (e) => {
      const eventType = e.target.dataset.event;
      const routineId = e.target.dataset.routine;
      this.showSkillModal(eventType, routineId);
    });

    // Edit routine notes button
    document.getElementById('edit-routine-notes').addEventListener('click', () => {
      if (this.currentRoutineView) {
        this.showNotesModal(this.currentRoutineView.eventType, this.currentRoutineView.routineId);
      }
    });

    // Notes form submission
    document.getElementById('notes-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleNotesSubmit();
    });

    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal[style*="block"]');
        if (activeModal) {
          this.closeModal(activeModal);
        }
      }
    });
  }

  // Profile Management Handlers
  handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
      this.showNotification('Please enter both username and password', 'warning');
      return;
    }

    try {
      this.authenticateUser(username, password);
      this.showNotification('Login successful!', 'success');
      this.showMainApp();
    } catch (error) {
      this.showNotification(error.message, 'warning');
    }
  }

  handleRegister() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const fullName = document.getElementById('register-fullname').value.trim();
    const level = document.getElementById('register-level').value;

    // Validation
    if (!username || !password) {
      this.showNotification('Username and password are required', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      this.showNotification('Passwords do not match', 'warning');
      return;
    }

    if (password.length < 4) {
      this.showNotification('Password must be at least 4 characters long', 'warning');
      return;
    }

    try {
      this.createProfile(username, password, fullName, level);
      this.authenticateUser(username, password);
      this.showNotification('Profile created successfully!', 'success');
      this.showMainApp();
    } catch (error) {
      this.showNotification(error.message, 'warning');
    }
  }

  showQuickLogin(username) {
    // Auto-fill login form with username
    document.getElementById('login-username').value = username;
    document.getElementById('login-password').focus();
    // Switch to login tab
    document.querySelector('.login-tab[data-tab="login"]').click();
  }

  showSwitchProfileModal() {
    const modal = document.getElementById('switch-profile-modal');
    const profilesList = document.getElementById('profiles-list');
    
    const profiles = Object.values(this.profiles)
      .filter(profile => profile.username !== this.currentUser)
      .sort((a, b) => new Date(b.lastAccess) - new Date(a.lastAccess));

    if (profiles.length === 0) {
      profilesList.innerHTML = '<p class="no-profiles">No other profiles found. Create a new profile to switch between multiple users.</p>';
    } else {
      profilesList.innerHTML = profiles.map(profile => {
        const initial = profile.fullName ? profile.fullName.charAt(0).toUpperCase() : profile.username.charAt(0).toUpperCase();
        const lastAccess = new Date(profile.lastAccess).toLocaleDateString();
        
        return `
          <div class="profile-card" data-username="${profile.username}">
            <div class="profile-card-avatar">${initial}</div>
            <div class="profile-card-info">
              <h4>${profile.fullName || profile.username}</h4>
              <p class="profile-card-level">${profile.level || 'No level set'}</p>
              <p class="profile-card-access">Last access: ${lastAccess}</p>
            </div>
          </div>
        `;
      }).join('');

      // Add click handlers for profile cards
      profilesList.querySelectorAll('.profile-card').forEach(card => {
        card.addEventListener('click', () => {
          const username = card.dataset.username;
          try {
            this.switchProfile(username);
            this.closeModal(modal);
            this.showNotification(`Switched to ${username}'s profile`, 'success');
          } catch (error) {
            this.showNotification(error.message, 'warning');
          }
        });
      });
    }

    modal.style.display = 'block';
  }

  showManageProfileModal() {
    const modal = document.getElementById('manage-profile-modal');
    
    if (!this.currentUser) return;
    
    const profile = this.profiles[this.currentUser];
    
    // Pre-fill edit profile form
    document.getElementById('edit-username').value = profile.username;
    document.getElementById('edit-fullname').value = profile.fullName || '';
    document.getElementById('edit-level').value = profile.level || '';
    
    // Update data stats
    this.updateDataStats();
    
    modal.style.display = 'block';
  }

  updateDataStats() {
    const statsContainer = document.getElementById('profile-data-stats');
    if (!this.currentUser) return;

    const totalRoutines = Object.values(this.data).reduce((sum, eventRoutines) => sum + eventRoutines.length, 0);
    const totalSkills = Object.values(this.data).reduce((sum, eventRoutines) => {
      return sum + eventRoutines.reduce((skillSum, routine) => skillSum + (routine.skills ? routine.skills.length : 0), 0);
    }, 0);

    const profile = this.profiles[this.currentUser];
    const memberSince = new Date(profile.createdAt).toLocaleDateString();

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

    try {
      this.updateProfile({ fullName, level });
      this.showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      this.showNotification('Failed to update profile', 'warning');
    }
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

    this.data[this.currentEvent].push(routine);
    this.saveData();
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
    Object.keys(this.data).forEach(eventType => {
      this.renderRoutines(eventType);
    });
  }

  renderRoutines(eventType) {
    const container = document.getElementById(`${eventType}-routines`);
    const routines = this.data[eventType];

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
    const isVault = eventType === 'vault';
    const difficulty = isVault ? `D-score: ${skill.difficulty}` : `(${skill.difficulty})`;
    
    // Get the routine to check if this is the last skill
    const routine = this.data[eventType].find(r => r.id === routineId);
    const isLastSkill = routine && index === routine.skills.length - 1;

    return `
      <li class="skill-item" 
          data-skill-id="${skill.id}" 
          data-event="${eventType}" 
          data-routine="${routineId}" 
          data-skill="${skill.id}" 
          data-index="${index}"
          draggable="true">
        <div class="drag-handle">⋮⋮</div>
        <div class="skill-order-number" onclick="window.gymnasticsTracker.editSkillOrder('${eventType}', '${routineId}', '${skill.id}', ${index + 1})">
          ${index + 1}
        </div>
        <div class="skill-details">
          <span class="skill-name">${skill.name}</span>
          <span class="skill-difficulty">${difficulty}</span>
        </div>
        <div class="skill-actions">
          <button class="reorder-btn up-btn" ${index === 0 ? 'disabled' : ''} onclick="window.gymnasticsTracker.moveSkillUp('${eventType}', '${routineId}', ${index})">↑</button>
          <button class="reorder-btn down-btn" ${isLastSkill ? 'disabled' : ''} onclick="window.gymnasticsTracker.moveSkillDown('${eventType}', '${routineId}', ${index})">↓</button>
          <button class="edit-skill-btn" onclick="window.gymnasticsTracker.showSkillModal('${eventType}', '${routineId}', '${skill.id}')">Edit</button>
        </div>
      </li>
    `;
  }

  renderProgression(eventType, routineId, skillId, progression) {
    const isOverdue = progression.targetDate && this.isOverdue(progression.targetDate) && !progression.completed;
    const difficultyValue = progression.difficulty ? this.difficultyValues[progression.difficulty] || 0 : null;
    
    console.log('Rendering progression with data:', { eventType, routineId, skillId, progressionId: progression.id });
    
    return `
      <li class="progression-item ${progression.completed ? 'progression-completed' : ''}">
        <input type="checkbox" class="progression-checkbox" ${progression.completed ? 'checked' : ''} 
               data-event="${eventType}" data-routine="${routineId}" data-skill="${skillId}" data-progression="${progression.id}">
        <div class="progression-info">
          <div class="progression-name">${progression.name}</div>
          <div class="progression-meta">
            ${progression.difficulty ? `<span class="progression-difficulty">${progression.difficulty} (${difficultyValue})</span>` : ''}
            ${progression.targetDate ? `<span class="progression-date ${isOverdue ? 'overdue' : ''}">${this.formatDate(progression.targetDate)}</span>` : ''}
            ${progression.notes ? `<span class="progression-notes">${progression.notes}</span>` : ''}
          </div>
        </div>
        <button type="button" class="delete-progression-btn" 
                data-event="${eventType}" 
                data-routine="${routineId}" 
                data-skill="${skillId}" 
                data-progression="${progression.id}"
                title="Delete this progression step">
          ×
        </button>
      </li>
    `;
  }

  // Skill reordering functionality
  reorderSkills(eventType, routineId, fromIndex, toIndex) {
    console.log('Reordering skills:', { eventType, routineId, fromIndex, toIndex });
    
    const routine = this.data[eventType].find(r => r.id === routineId);
    if (!routine || !routine.skills) {
      console.error('Routine or skills not found');
      return;
    }
    
    // Remove skill from old position and insert at new position
    const [movedSkill] = routine.skills.splice(fromIndex, 1);
    routine.skills.splice(toIndex, 0, movedSkill);
    
    console.log('Skills reordered successfully');
    this.saveData();
    this.showNotification('Skills reordered successfully', 'success');
  }

  moveSkillToPosition(eventType, routineId, skillId, newPosition) {
    console.log('Moving skill to position:', { eventType, routineId, skillId, newPosition });
    
    const routine = this.data[eventType].find(r => r.id === routineId);
    if (!routine || !routine.skills) {
      console.error('Routine or skills not found');
      return;
    }
    
    // Find the current index of the skill
    const currentIndex = routine.skills.findIndex(s => s.id === skillId);
    if (currentIndex === -1) {
      console.error('Skill not found');
      return;
    }
    
    // Validate new position (1-based to 0-based index)
    const newIndex = newPosition - 1;
    if (newIndex < 0 || newIndex >= routine.skills.length) {
      this.showNotification('Invalid position. Please enter a number between 1 and ' + routine.skills.length, 'warning');
      return;
    }
    
    if (currentIndex === newIndex) {
      console.log('Skill already in that position');
      return;
    }
    
    // Reorder the skills
    this.reorderSkills(eventType, routineId, currentIndex, newIndex);
  }

  makeOrderNumberEditable(orderElement, eventType, routineId, skillId, currentPosition) {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'skill-order-input';
    input.value = currentPosition;
    input.min = 1;
    input.max = this.data[eventType].find(r => r.id === routineId).skills.length;
    
    // Replace the order number with input
    orderElement.parentNode.replaceChild(input, orderElement);
    input.focus();
    input.select();
    
    const finishEditing = () => {
      const newPosition = parseInt(input.value);
      if (newPosition && newPosition !== currentPosition) {
        this.moveSkillToPosition(eventType, routineId, skillId, newPosition);
      }
      
      // Refresh the routine page view
      if (this.currentRoutineView && 
          this.currentRoutineView.eventType === eventType && 
          this.currentRoutineView.routineId === routineId) {
        const updatedRoutine = this.data[eventType].find(r => r.id === routineId);
        this.renderRoutinePage(eventType, updatedRoutine);
      } else {
        // Fallback to render routines if not on routine page
        this.renderRoutines(eventType);
      }
    };
    
    // Handle Enter key and blur
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        finishEditing();
      } else if (e.key === 'Escape') {
        // Cancel editing - just refresh the view
        if (this.currentRoutineView && 
            this.currentRoutineView.eventType === eventType && 
            this.currentRoutineView.routineId === routineId) {
          const currentRoutine = this.data[eventType].find(r => r.id === routineId);
          this.renderRoutinePage(eventType, currentRoutine);
        } else {
          this.renderRoutines(eventType);
        }
      }
    });
    
    input.addEventListener('blur', finishEditing);
  }

  setupDragAndDrop(container) {
    let draggedElement = null;
    let draggedData = null;
    
    // Handle drag start
    container.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('skill-item')) {
        draggedElement = e.target;
        draggedData = {
          eventType: e.target.dataset.event,
          routineId: e.target.dataset.routine,
          skillId: e.target.dataset.skill,
          index: parseInt(e.target.dataset.index)
        };
        
        e.target.classList.add('dragging');
        e.target.parentElement.classList.add('drag-active');
        
        console.log('Drag started:', draggedData);
        e.dataTransfer.effectAllowed = 'move';
      }
    });
    
    // Handle drag over
    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      const skillItem = e.target.closest('.skill-item');
      if (skillItem && skillItem !== draggedElement) {
        // Remove drag-over class from all items
        container.querySelectorAll('.skill-item').forEach(item => {
          item.classList.remove('drag-over');
        });
        skillItem.classList.add('drag-over');
      }
    });
    
    // Handle drag leave
    container.addEventListener('dragleave', (e) => {
      const skillItem = e.target.closest('.skill-item');
      if (skillItem) {
        skillItem.classList.remove('drag-over');
      }
    });
    
    // Handle drop
    container.addEventListener('drop', (e) => {
      e.preventDefault();
      
      const targetItem = e.target.closest('.skill-item');
      if (targetItem && targetItem !== draggedElement && draggedData) {
        const targetIndex = parseInt(targetItem.dataset.index);
        const sourceIndex = draggedData.index;
        
        console.log('Drop detected:', { sourceIndex, targetIndex });
        
        if (sourceIndex !== targetIndex) {
          this.reorderSkills(
            draggedData.eventType,
            draggedData.routineId,
            sourceIndex,
            targetIndex
          );
          
          // Refresh the routine page view if we're currently viewing it
          if (this.currentRoutineView && 
              this.currentRoutineView.eventType === draggedData.eventType && 
              this.currentRoutineView.routineId === draggedData.routineId) {
            const updatedRoutine = this.data[draggedData.eventType].find(r => r.id === draggedData.routineId);
            this.renderRoutinePage(draggedData.eventType, updatedRoutine);
          }
        }
      }
      
      // Clean up
      container.querySelectorAll('.skill-item').forEach(item => {
        item.classList.remove('drag-over', 'dragging');
      });
      container.classList.remove('drag-active');
      
      draggedElement = null;
      draggedData = null;
    });
    
    // Handle drag end
    container.addEventListener('dragend', (e) => {
      // Clean up drag styles
      container.querySelectorAll('.skill-item').forEach(item => {
        item.classList.remove('drag-over', 'dragging');
      });
      container.classList.remove('drag-active');
      
      draggedElement = null;
      draggedData = null;
    });
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