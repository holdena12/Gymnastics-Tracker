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
    this.currentGroups = []; // User's groups
    this.groupListeners = new Map(); // Group data listeners
    
    // Wait for Firebase to be loaded
    this.waitForFirebase();
  }
  
  async waitForFirebase() {
    // Wait for Firebase scripts to load
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max
    
    while (attempts < maxAttempts) {
      if (typeof firebase !== 'undefined' && window.initializeFirebase) {
        try {
          this.isFirebaseReady = window.initializeFirebase();
          if (this.isFirebaseReady) {
            // Check if Firebase config has valid credentials
            const config = firebase.app().options;
            if (config.apiKey && 
                config.apiKey !== 'your-api-key-here' && 
                config.authDomain && 
                config.authDomain !== 'your-project-id.firebaseapp.com') {
              
              this.auth = firebase.auth();
              this.db = firebase.firestore();
              this.setupAuthStateListener();
              console.log('Firebase initialized successfully with valid credentials');
              break;
            } else {
              console.warn('Firebase has placeholder credentials, falling back to localStorage');
              this.isFirebaseReady = false;
              break;
            }
          }
        } catch (error) {
          console.warn('Firebase initialization failed:', error);
          this.isFirebaseReady = false;
          break;
        }
      }
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!this.isFirebaseReady) {
      console.warn('Firebase not available or has invalid credentials. Using localStorage fallback authentication.');
      // Check for existing fallback authentication
      this.checkFallbackAuth();
    }
  }

  setupAuthStateListener() {
    if (!this.auth) return;
    
    this.auth.onAuthStateChanged(async (user) => {
      this.currentUser = user;
      if (user) {
        console.log('User authenticated:', user.email);
        await this.loadUserGroups();
        this.notifyAuthStateChange(true);
      } else {
        console.log('User signed out');
        this.currentGroups = [];
        this.clearGroupListeners();
        this.notifyAuthStateChange(false);
      }
    });
  }

  notifyAuthStateChange(isSignedIn) {
    // Dispatch custom event for main app to listen to
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { isSignedIn, user: this.currentUser, groups: this.currentGroups } 
    }));
  }

  // ========================================
  // AUTHENTICATION METHODS
  // ========================================

  async signUp(email, password, fullName = '', gymnasticsLevel = '') {
    if (!this.isFirebaseReady) {
      // Fallback to localStorage-based authentication for development/testing
      return this.signUpWithLocalStorage(email, password, fullName, gymnasticsLevel);
    }

    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Update profile with display name
      await user.updateProfile({
        displayName: fullName || email.split('@')[0]
      });

      // Create user profile document
      await this.db.collection('users').doc(user.uid).set({
        fullName: fullName || email.split('@')[0],
        email: email,
        gymnasticsLevel: gymnasticsLevel,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        groups: [], // User's groups
        groupInvites: [] // Pending group invites
      });

      console.log('User created successfully:', email);
      return { success: true, user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  }

  async signIn(email, password) {
    if (!this.isFirebaseReady) {
      // Fallback to localStorage-based authentication for development/testing
      return this.signInWithLocalStorage(email, password);
    }

    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      console.log('User signed in successfully:', email);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    if (!this.isFirebaseReady) {
      // Fallback logout for localStorage
      this.currentUser = null;
      localStorage.removeItem('fallback_currentUser');
      this.notifyAuthStateChange(false);
      return { success: true };
    }

    try {
      this.clearGroupListeners();
      await this.auth.signOut();
      console.log('User signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  isSignedIn() {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // ========================================
  // USER DATA MANAGEMENT
  // ========================================

  async getUserProfile() {
    if (!this.isFirebaseReady || !this.currentUser) {
      // For fallback authentication, return user data directly
      if (this.currentUser) {
        return {
          fullName: this.currentUser.fullName || this.currentUser.displayName,
          email: this.currentUser.email,
          gymnasticsLevel: this.currentUser.gymnasticsLevel || ''
        };
      }
      return null;
    }

    try {
      const doc = await this.db.collection('users').doc(this.currentUser.uid).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateUserProfile(profileData) {
    if (!this.isFirebaseReady || !this.currentUser) return false;

    try {
      await this.db.collection('users').doc(this.currentUser.uid).update({
        ...profileData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  async loadUserData() {
    if (!this.isFirebaseReady || !this.currentUser) {
      return this.loadLocalData();
    }

    try {
      const doc = await this.db.collection('userData').doc(this.currentUser.uid).get();
      const data = doc.exists ? doc.data() : this.getDefaultUserData();
      
      // Backup to localStorage
      if (this.localStorageBackup) {
        localStorage.setItem(`userData_${this.currentUser.uid}`, JSON.stringify(data));
      }
      
      return data;
    } catch (error) {
      console.error('Error loading user data:', error);
      return this.loadLocalData();
    }
  }

  async saveUserData(data) {
    if (!this.isFirebaseReady || !this.currentUser) {
      return this.saveLocalData(data);
    }

    try {
      await this.db.collection('userData').doc(this.currentUser.uid).set({
        ...data,
        lastModified: firebase.firestore.FieldValue.serverTimestamp(),
        userId: this.currentUser.uid
      });
      
      // Backup to localStorage
      if (this.localStorageBackup) {
        localStorage.setItem(`userData_${this.currentUser.uid}`, JSON.stringify(data));
      }
      
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return this.saveLocalData(data);
    }
  }

  // ========================================
  // GROUP/TEAM MANAGEMENT METHODS
  // ========================================

  async createGroup(groupName, description = '', isPrivate = false) {
    if (!this.currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    // Fallback local group creation when Firebase not ready
    if (!this.isFirebaseReady) {
      const inviteCode = this.generateInviteCode();
      const group = {
        id: inviteCode,
        name: groupName,
        description,
        isPrivate,
        createdBy: this.currentUser.uid,
        createdAt: new Date().toISOString(),
        members: [{
          userId: this.currentUser.uid,
          email: this.currentUser.email,
          displayName: this.currentUser.displayName || this.currentUser.email,
          role: 'admin',
          joinedAt: new Date().toISOString()
        }],
        inviteCode,
        memberCount: 1,
        userRole: 'admin'
      };
      this.currentGroups.push(group);
      return { success: true, groupId: inviteCode, inviteCode };
    }

    try {
      const groupData = {
        name: groupName,
        description: description,
        isPrivate: isPrivate,
        createdBy: this.currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        members: [{
          userId: this.currentUser.uid,
          email: this.currentUser.email,
          displayName: this.currentUser.displayName || this.currentUser.email,
          role: 'admin',
          joinedAt: firebase.firestore.FieldValue.serverTimestamp()
        }],
        inviteCode: this.generateInviteCode(),
        memberCount: 1
      };

      const groupRef = await this.db.collection('groups').add(groupData);
      const groupId = groupRef.id;

      // Add group to user's groups
      await this.db.collection('users').doc(this.currentUser.uid).update({
        groups: firebase.firestore.FieldValue.arrayUnion({
          groupId: groupId,
          groupName: groupName,
          role: 'admin',
          joinedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
      });

      await this.loadUserGroups();
      
      return { success: true, groupId, inviteCode: groupData.inviteCode };
    } catch (error) {
      console.error('Error creating group:', error);
      return { success: false, error: error.message };
    }
  }

  async joinGroupByCode(inviteCode) {
    if (!this.currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    // Fallback local group join when Firebase not ready
    if (!this.isFirebaseReady) {
      const group = this.currentGroups.find(g => g.inviteCode === inviteCode);
      if (!group) {
        return { success: false, error: 'Invalid invite code' };
      }
      const isMember = group.members.some(m => m.userId === this.currentUser.uid);
      if (isMember) {
        return { success: false, error: 'You are already a member of this group' };
      }
      const newMember = {
        userId: this.currentUser.uid,
        email: this.currentUser.email,
        displayName: this.currentUser.displayName || this.currentUser.email,
        role: 'member',
        joinedAt: new Date().toISOString()
      };
      group.members.push(newMember);
      group.memberCount = group.members.length;
      return { success: true, groupName: group.name };
    }

    try {
      // Find group by invite code
      const groupQuery = await this.db.collection('groups')
        .where('inviteCode', '==', inviteCode.toUpperCase())
        .limit(1)
        .get();

      if (groupQuery.empty) {
        return { success: false, error: 'Invalid invite code' };
      }

      const groupDoc = groupQuery.docs[0];
      const groupData = groupDoc.data();
      const groupId = groupDoc.id;

      // Check if user is already a member
      const isMember = groupData.members.some(member => member.userId === this.currentUser.uid);
      if (isMember) {
        return { success: false, error: 'You are already a member of this group' };
      }

      // Add user to group
      const newMember = {
        userId: this.currentUser.uid,
        email: this.currentUser.email,
        displayName: this.currentUser.displayName || this.currentUser.email,
        role: 'member',
        joinedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      await this.db.collection('groups').doc(groupId).update({
        members: firebase.firestore.FieldValue.arrayUnion(newMember),
        memberCount: firebase.firestore.FieldValue.increment(1)
      });

      // Add group to user's groups
      await this.db.collection('users').doc(this.currentUser.uid).update({
        groups: firebase.firestore.FieldValue.arrayUnion({
          groupId: groupId,
          groupName: groupData.name,
          role: 'member',
          joinedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
      });

      await this.loadUserGroups();
      
      return { success: true, groupName: groupData.name };
    } catch (error) {
      console.error('Error joining group:', error);
      return { success: false, error: error.message };
    }
  }

  async leaveGroup(groupId) {
    if (!this.currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    // Fallback local group leave when Firebase not ready
    if (!this.isFirebaseReady) {
      const idx = this.currentGroups.findIndex(g => g.id === groupId);
      if (idx === -1) {
        return { success: false, error: 'Group not found' };
      }
      const group = this.currentGroups[idx];
      group.members = group.members.filter(m => m.userId !== this.currentUser.uid);
      group.memberCount = group.members.length;
      if (group.members.length === 0) {
        this.currentGroups.splice(idx, 1);
      }
      return { success: true };
    }

    try {
      const groupDoc = await this.db.collection('groups').doc(groupId).get();
      if (!groupDoc.exists) {
        return { success: false, error: 'Group not found' };
      }

      const groupData = groupDoc.data();
      
      // Remove user from group members
      const updatedMembers = groupData.members.filter(member => member.userId !== this.currentUser.uid);
      
      if (updatedMembers.length === 0) {
        // Delete group if no members left
        await this.db.collection('groups').doc(groupId).delete();
      } else {
        // Update group
        await this.db.collection('groups').doc(groupId).update({
          members: updatedMembers,
          memberCount: firebase.firestore.FieldValue.increment(-1)
        });
      }

      // Remove group from user's groups
      const userGroups = (await this.getUserProfile()).groups || [];
      const updatedUserGroups = userGroups.filter(group => group.groupId !== groupId);
      
      await this.db.collection('users').doc(this.currentUser.uid).update({
        groups: updatedUserGroups
      });

      await this.loadUserGroups();
      
      return { success: true };
    } catch (error) {
      console.error('Error leaving group:', error);
      return { success: false, error: error.message };
    }
  }

  async loadUserGroups() {
    if (!this.currentUser) {
      this.currentGroups = [];
      return [];
    }
    // Fallback load groups from local when Firebase not ready
    if (!this.isFirebaseReady) {
      return this.currentGroups;
    }

    try {
      const userProfile = await this.getUserProfile();
      const userGroups = userProfile?.groups || [];
      
      // Load detailed group information
      const groupPromises = userGroups.map(async (userGroup) => {
        const groupDoc = await this.db.collection('groups').doc(userGroup.groupId).get();
        if (groupDoc.exists) {
          return {
            id: userGroup.groupId,
            ...groupDoc.data(),
            userRole: userGroup.role
          };
        }
        return null;
      });

      const groups = (await Promise.all(groupPromises)).filter(group => group !== null);
      this.currentGroups = groups;
      
      return groups;
    } catch (error) {
      console.error('Error loading user groups:', error);
      this.currentGroups = [];
      return [];
    }
  }

  async getGroupMembers(groupId) {
    if (!this.isFirebaseReady) {
      const group = this.currentGroups.find(g => g.id === groupId);
      return group ? group.members : [];
    }

    try {
      const groupDoc = await this.db.collection('groups').doc(groupId).get();
      if (groupDoc.exists) {
        return groupDoc.data().members || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting group members:', error);
      return [];
    }
  }

  async getGroupRoutines(groupId) {
    if (!this.isFirebaseReady) {
      return [];
    }

    try {
      // Get all group members
      const members = await this.getGroupMembers(groupId);
      const memberIds = members.map(member => member.userId);

      // Get routines from all group members
      const routinePromises = memberIds.map(async (userId) => {
        const userDataDoc = await this.db.collection('userData').doc(userId).get();
        if (userDataDoc.exists) {
          const userData = userDataDoc.data();
          const member = members.find(m => m.userId === userId);
          
          return {
            userId: userId,
            userName: member.displayName,
            userEmail: member.email,
            routines: userData.routines || {}
          };
        }
        return null;
      });

      const allRoutines = (await Promise.all(routinePromises)).filter(data => data !== null);
      return allRoutines;
    } catch (error) {
      console.error('Error getting group routines:', error);
      return [];
    }
  }

  generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  clearGroupListeners() {
    this.groupListeners.forEach(unsubscribe => unsubscribe());
    this.groupListeners.clear();
  }

  // ========================================
  // FALLBACK LOCALSTORAGE AUTHENTICATION
  // ========================================
  
  async signUpWithLocalStorage(email, password, fullName = '', gymnasticsLevel = '') {
    try {
      // Get existing users or create empty object
      const users = JSON.parse(localStorage.getItem('fallback_users') || '{}');
      
      // Check if user already exists
      if (users[email]) {
        return { success: false, error: 'An account with this email already exists' };
      }
      
      // Validate inputs
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }
      
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }
      
      // Create new user
      const userId = 'fallback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const user = {
        uid: userId,
        email: email,
        displayName: fullName || email.split('@')[0],
        fullName: fullName,
        gymnasticsLevel: gymnasticsLevel,
        createdAt: new Date().toISOString(),
        metadata: { creationTime: new Date().toISOString() }
      };
      
      // Store user credentials (in real app, password would be hashed)
      users[email] = { ...user, password: password };
      localStorage.setItem('fallback_users', JSON.stringify(users));
      
      // Set current user
      this.currentUser = user;
      localStorage.setItem('fallback_currentUser', JSON.stringify(user));
      
      // Notify auth state change
      this.notifyAuthStateChange(true);
      
      console.log('User created successfully with fallback auth:', email);
      return { success: true, user };
    } catch (error) {
      console.error('Fallback signup error:', error);
      return { success: false, error: 'Failed to create account' };
    }
  }
  
  async signInWithLocalStorage(email, password) {
    try {
      const users = JSON.parse(localStorage.getItem('fallback_users') || '{}');
      const user = users[email];
      
      if (!user) {
        return { success: false, error: 'No account found with this email' };
      }
      
      if (user.password !== password) {
        return { success: false, error: 'Incorrect password' };
      }
      
      // Set current user (remove password from user object)
      const { password: _, ...userWithoutPassword } = user;
      this.currentUser = userWithoutPassword;
      localStorage.setItem('fallback_currentUser', JSON.stringify(userWithoutPassword));
      
      // Notify auth state change
      this.notifyAuthStateChange(true);
      
      console.log('User signed in successfully with fallback auth:', email);
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Fallback signin error:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  }
  
  checkFallbackAuth() {
    try {
      const currentUser = localStorage.getItem('fallback_currentUser');
      if (currentUser) {
        this.currentUser = JSON.parse(currentUser);
        console.log('Fallback user restored:', this.currentUser.email);
      }
    } catch (error) {
      console.error('Error checking fallback auth state:', error);
    }
  }

  // ========================================
  // LOCAL STORAGE FALLBACK METHODS
  // ========================================

  loadLocalData() {
    try {
      const key = this.currentUser ? `userData_${this.currentUser.uid}` : 'userData_guest';
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : this.getDefaultUserData();
    } catch (error) {
      console.error('Error loading local data:', error);
      return this.getDefaultUserData();
    }
  }

  saveLocalData(data) {
    try {
      const key = this.currentUser ? `userData_${this.currentUser.uid}` : 'userData_guest';
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving local data:', error);
      return false;
    }
  }

  getDefaultUserData() {
    return {
      routines: {
        floor: [],
        pommel: [],
        rings: [],
        vault: [],
        pbars: [],
        hbar: []
      }
    };
  }
}

// Export singleton instance
const authService = new AuthService();
window.authService = authService; 