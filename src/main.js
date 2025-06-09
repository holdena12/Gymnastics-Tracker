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
    console.log('Setting up event listeners...');
    
    // Profile System Event Listeners
    
    // Login/Register Tab Switching with debugging
    console.log('Setting up login tab listeners...');
    const loginTabs = document.querySelectorAll('.login-tab');
    console.log('Found login tabs:', loginTabs.length);
    
    if (loginTabs.length === 0) {
      console.error('No login tabs found! Check HTML structure.');
      return;
    }
    
    loginTabs.forEach((tab, index) => {
      console.log(`Setting up tab ${index}:`, tab.dataset.tab);
      
      // Create a more robust event handler
      const handleTabSwitch = (e) => {
        console.log('Tab switch triggered:', e.type, e.target.dataset.tab);
        e.preventDefault();
        e.stopPropagation();
        
        const targetTab = e.target.dataset.tab;
        
        if (!targetTab) {
          console.error('No data-tab attribute found on clicked element');
          return;
        }
        
        console.log('Switching to tab:', targetTab);
        
        // Update tab active states
        document.querySelectorAll('.login-tab').forEach(t => {
          t.classList.remove('active');
          console.log('Removed active from tab:', t.dataset.tab);
        });
        e.target.classList.add('active');
        console.log('Added active to tab:', targetTab);
        
        // Update form active states
        document.querySelectorAll('.auth-form').forEach(form => {
          form.classList.remove('active');
          console.log('Removed active from form:', form.id);
        });
        
        if (targetTab === 'login') {
          const loginForm = document.getElementById('login-form');
          if (loginForm) {
            loginForm.classList.add('active');
            console.log('Activated login form');
          } else {
            console.error('Login form not found!');
          }
        } else if (targetTab === 'register') {
          const registerForm = document.getElementById('register-form');
          if (registerForm) {
            registerForm.classList.add('active');
            console.log('Activated register form');
          } else {
            console.error('Register form not found!');
          }
        }
      };
      
      // Remove any existing event listeners first
      tab.removeEventListener('click', handleTabSwitch);
      tab.removeEventListener('touchend', handleTabSwitch);
      tab.removeEventListener('touchstart', handleTabSwitch);
      
      // Add comprehensive event listeners for all interaction types
      tab.addEventListener('click', handleTabSwitch, { passive: false });
      tab.addEventListener('touchend', handleTabSwitch, { passive: false });
      
      // For mobile, also add touchstart for immediate feedback
      tab.addEventListener('touchstart', (e) => {
        console.log('Touch start on tab:', e.target.dataset.tab);
        // Add visual feedback
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
          e.target.style.transform = '';
        }, 100);
      }, { passive: true });
      
      console.log('Event listeners added to tab:', tab.dataset.tab);
    });

    // Add a backup click handler to the tab container
    const tabContainer = document.querySelector('.login-tabs');
    if (tabContainer) {
      tabContainer.addEventListener('click', (e) => {
        console.log('Container click detected:', e.target.tagName, e.target.className);
        if (e.target.classList.contains('login-tab')) {
          console.log('Login tab clicked via container handler');
          // The individual tab handlers should have already fired, but this is a backup
        }
      });
    }

    // Authentication Forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        console.log('Login form submitted');
        e.preventDefault();
        this.handleLogin();
      });
    } else {
      console.error('Login form not found!');
    }

    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        console.log('Register form submitted');
        e.preventDefault();
        this.handleRegister();
      });
    } else {
      console.error('Register form not found!');
    }

    // Recent Profiles Quick Selection
    document.addEventListener('click', (e) => {
      if (e.target.closest('.recent-profile-item')) {
        const username = e.target.closest('.recent-profile-item').dataset.username;
        this.showQuickLogin(username);
      }
    });

    // Test the login tabs after setup
    setTimeout(() => {
      console.log('Testing login tabs after setup...');
      const tabs = document.querySelectorAll('.login-tab');
      tabs.forEach(tab => {
        console.log('Tab:', tab.dataset.tab, 'Active:', tab.classList.contains('active'));
      });
      
      const forms = document.querySelectorAll('.auth-form');
      forms.forEach(form => {
        console.log('Form:', form.id, 'Active:', form.classList.contains('active'));
      });
    }, 1000);

    console.log('Event listeners setup completed');
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