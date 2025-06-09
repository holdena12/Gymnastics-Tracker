// Authentication Service for Cross-Device User Management
// Handles Firebase Authentication and Firestore data sync

// Firebase will be available via CDN scripts
// No ES6 imports needed for static hosting

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isOnline = navigator.onLine;
    this.localStorageBackup = true; // Keep localStorage as backup for offline use
    this.isFirebaseReady = false;
    
    // Wait for Firebase to be loaded
    this.waitForFirebase();
  }
  
  async waitForFirebase() {
    // Wait for Firebase scripts to load
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max
    
    while (attempts < maxAttempts) {
      if (typeof firebase !== 'undefined' && window.initializeFirebase) {
        this.isFirebaseReady = window.initializeFirebase();
        if (this.isFirebaseReady) {
          this.setupFirebaseListeners();
          break;
        }
      }
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!this.isFirebaseReady) {
      console.error('Firebase failed to load. Using localStorage fallback.');
    }
  }
  
  setupFirebaseListeners() {
    // Listen for online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    // Listen for auth state changes
    firebase.auth().onAuthStateChanged((user) => {
      this.currentUser = user;
      if (user) {
        this.syncUserData();
      }
    });
  }

  // Create new user account
  async createAccount(email, password, fullName = '', gymnasticsLevel = '') {
    if (!this.isFirebaseReady) {
      throw new Error('Firebase not ready. Please try again.');
    }
    
    try {
      // Create Firebase user
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Update user profile
      await user.updateProfile({
        displayName: fullName
      });
      
      // Create user document in Firestore
      await firebase.firestore().collection('users').doc(user.uid).set({
        uid: user.uid,
        email: email,
        fullName: fullName,
        gymnasticsLevel: gymnasticsLevel,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      });
      
      // Initialize empty data document
      await firebase.firestore().collection('userData').doc(user.uid).set({
        routines: {},
        skills: {},
        lastUpdated: new Date().toISOString()
      });
      
      return { success: true, user };
    } catch (error) {
      console.error('Account creation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign in existing user
  async signIn(email, password) {
    if (!this.isFirebaseReady) {
      throw new Error('Firebase not ready. Please try again.');
    }
    
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Update last login time
      await firebase.firestore().collection('users').doc(user.uid).update({
        lastLoginAt: new Date().toISOString()
      });
      
      return { success: true, user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign out user
  async signOutUser() {
    if (!this.isFirebaseReady) {
      this.currentUser = null;
      return { success: true };
    }
    
    try {
      await firebase.auth().signOut();
      this.currentUser = null;
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Load user data from Firestore
  async loadUserData() {
    if (!this.currentUser || !this.isFirebaseReady) return null;
    
    try {
      const userDataDoc = await firebase.firestore().collection('userData').doc(this.currentUser.uid).get();
      if (userDataDoc.exists) {
        const data = userDataDoc.data();
        
        // Merge with local data if offline backup is enabled
        if (this.localStorageBackup) {
          this.mergeWithLocalData(data);
        }
        
        return data;
      }
      return { routines: {}, skills: {}, lastUpdated: new Date().toISOString() };
    } catch (error) {
      console.error('Error loading user data:', error);
      
      // Fallback to localStorage if Firebase fails
      if (this.localStorageBackup) {
        return this.loadLocalData();
      }
      
      return null;
    }
  }

  // Save user data to Firestore
  async saveUserData(data) {
    if (!this.currentUser) return false;
    
    const dataWithTimestamp = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    try {
      if (this.isFirebaseReady) {
        await firebase.firestore().collection('userData').doc(this.currentUser.uid).update(dataWithTimestamp);
      }
      
      // Also save to localStorage as backup
      if (this.localStorageBackup) {
        localStorage.setItem(`gymnastics-data-${this.currentUser.email}`, JSON.stringify(dataWithTimestamp));
      }
      
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      
      // Fallback to localStorage if Firebase fails
      if (this.localStorageBackup) {
        localStorage.setItem(`gymnastics-data-${this.currentUser.email}`, JSON.stringify(dataWithTimestamp));
        return true;
      }
      
      return false;
    }
  }

  // Get user profile information
  async getUserProfile() {
    if (!this.currentUser || !this.isFirebaseReady) return null;
    
    try {
      const userDoc = await firebase.firestore().collection('users').doc(this.currentUser.uid).get();
      if (userDoc.exists) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(profileData) {
    if (!this.currentUser || !this.isFirebaseReady) return false;
    
    try {
      await firebase.firestore().collection('users').doc(this.currentUser.uid).update({
        ...profileData,
        lastUpdated: new Date().toISOString()
      });
      
      if (profileData.fullName) {
        await this.currentUser.updateProfile({
          displayName: profileData.fullName
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  // Check if username is available (for backward compatibility)
  async isUsernameAvailable(username) {
    if (!this.isFirebaseReady) return false;
    
    try {
      const querySnapshot = await firebase.firestore().collection('users').where('username', '==', username).get();
      return querySnapshot.empty;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  }

  // Sync offline data when coming back online
  async syncOfflineData() {
    if (!this.currentUser || !this.localStorageBackup || !this.isFirebaseReady) return;
    
    try {
      const localData = this.loadLocalData();
      const cloudData = await this.loadUserData();
      
      if (localData && cloudData) {
        // Simple merge strategy - use most recent timestamp
        const localTimestamp = new Date(localData.lastUpdated || 0);
        const cloudTimestamp = new Date(cloudData.lastUpdated || 0);
        
        if (localTimestamp > cloudTimestamp) {
          // Local data is newer, upload to cloud
          await this.saveUserData(localData);
        }
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }

  // Sync user data between devices
  async syncUserData() {
    if (!this.currentUser || !this.isFirebaseReady) return;
    
    try {
      const cloudData = await this.loadUserData();
      if (cloudData) {
        // Update local storage with cloud data
        localStorage.setItem(`gymnastics-data-${this.currentUser.email}`, JSON.stringify(cloudData));
        
        // Trigger data reload in the main app
        window.dispatchEvent(new CustomEvent('userDataSynced', { detail: cloudData }));
      }
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
  }

  // Helper methods
  loadLocalData() {
    if (!this.currentUser) return null;
    
    const localData = localStorage.getItem(`gymnastics-data-${this.currentUser.email}`);
    return localData ? JSON.parse(localData) : null;
  }

  mergeWithLocalData(cloudData) {
    const localData = this.loadLocalData();
    if (!localData) return cloudData;
    
    // Simple merge - prefer cloud data but keep local changes if newer
    const localTimestamp = new Date(localData.lastUpdated || 0);
    const cloudTimestamp = new Date(cloudData.lastUpdated || 0);
    
    return localTimestamp > cloudTimestamp ? localData : cloudData;
  }

  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
    };
    
    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is signed in
  isSignedIn() {
    return !!this.currentUser;
  }
}

// Export singleton instance
const authService = new AuthService();
window.authService = authService; 