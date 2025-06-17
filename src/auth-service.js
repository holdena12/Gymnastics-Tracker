// AWS Authentication and Data Service for Gymnastics Tracker
// Handles Amazon Cognito Authentication and DynamoDB data synchronization

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAwsReady = false;
    this.cognitoUser = null; // To hold the Cognito user object
    
    this.initializeAWS();
  }

  initializeAWS() {
    // Ensure required globals are present before continuing
    if (typeof AWS === 'undefined' || !window.awsConfig || typeof AmazonCognitoIdentity === 'undefined') {
      console.error('AWS SDK, Amazon Cognito Identity JS, or aws-config.js not loaded.');
      return;
    }

    const { region, cognito } = window.awsConfig;
    if (!region || !cognito.userPoolId || !cognito.userPoolWebClientId || !cognito.identityPoolId) {
        console.warn('AWS Cognito is not configured. App will run in offline-only mode.');
        this.isAwsReady = false;
        return;
    }
    
    AWS.config.region = region;
    this.cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
    this.pool = new AmazonCognitoIdentity.CognitoUserPool({
      UserPoolId: cognito.userPoolId,
      ClientId: cognito.userPoolWebClientId,
    });
    
    this.isAwsReady = true;
    console.log('AWS Service initialized.');

    // Attempt to get the current user from the session
    this.cognitoUser = this.pool.getCurrentUser();

    if (this.cognitoUser != null) {
      this.cognitoUser.getSession((err, session) => {
        if (err) {
          console.error('Error getting session:', err);
          this.notifyAuthStateChange(false);
          return;
        }
        if (session.isValid()) {
          this.currentUser = {
            username: this.cognitoUser.getUsername(),
            ...this.cognitoUser.getSignInUserSession().getIdToken().payload
          };
          this.configureAwsCredentials(session.getIdToken().getJwtToken());
          this.notifyAuthStateChange(true);
        } else {
          this.notifyAuthStateChange(false);
        }
      });
    } else {
      this.notifyAuthStateChange(false);
    }
  }

  configureAwsCredentials(idToken) {
    const { region, cognito } = window.awsConfig;
    const loginKey = `cognito-idp.${region}.amazonaws.com/${cognito.userPoolId}`;

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: cognito.identityPoolId,
      Logins: {
        [loginKey]: idToken
      }
    });

    // Refresh credentials
    AWS.config.credentials.refresh((error) => {
      if (error) {
        console.error('Error refreshing credentials:', error);
      } else {
        this.dynamoDb = new AWS.DynamoDB.DocumentClient();
        console.log('AWS credentials configured successfully.');
        window.dispatchEvent(new CustomEvent('awsReady'));
      }
    });
  }
  
  notifyAuthStateChange(isSignedIn) {
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { isSignedIn, user: this.currentUser } 
    }));
  }

  // ========================================
  // AUTHENTICATION METHODS
  // ========================================

  async signUp(email, password, fullName, gymnasticsLevel) {
    if (!this.isAwsReady) return { success: false, error: 'AWS service not ready.' };

    // Generate a unique username (not email format) as some Cognito pools don't allow email as username
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 5);
    const username = `user_${timestamp}_${randomSuffix}`;
    
    // Ensure we have a name value
    const displayName = fullName && fullName.trim() ? fullName.trim() : 'User';

    const attributeList = [
      new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'email', Value: email }),
      new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'name', Value: displayName }),
      new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'preferred_username', Value: email })
    ];

    return new Promise((resolve) => {
      console.log('Attempting to sign up user with username:', username, 'email:', email);
      this.pool.signUp(username, password, attributeList, null, (err, result) => {
        if (err) {
          console.error('Sign up error:', err);
          resolve({ success: false, error: err.message || JSON.stringify(err) });
          return;
        }
        console.log('Sign up successful:', result);
        console.log('User needs confirmation:', !result.userConfirmed);
        // Store the mapping between email and username for login
        localStorage.setItem(`cognito_username_${email}`, username);
        
        resolve({ 
          success: true, 
          user: result.user, 
          username: username,
          needsConfirmation: !result.userConfirmed,
          userConfirmed: result.userConfirmed 
        });
      });
    });
  }

  async signIn(email, password) {
    if (!this.isAwsReady) return { success: false, error: 'AWS service not ready.' };

    console.log('Attempting to sign in user with email:', email);
    
    // Try to get the actual username from localStorage (stored during registration)
    const storedUsername = localStorage.getItem(`cognito_username_${email}`);
    const username = storedUsername || email; // Fallback to email if no stored username
    
    console.log('Using username for authentication:', username);
    
    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
      Username: username,
      Password: password,
    });
    
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
      Username: username,
      Pool: this.pool,
    });

    return new Promise((resolve) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session) => {
          this.currentUser = {
            username: cognitoUser.getUsername(),
            ...session.getIdToken().payload
          };
          this.cognitoUser = cognitoUser;
          this.configureAwsCredentials(session.getIdToken().getJwtToken());
          this.notifyAuthStateChange(true);
          resolve({ success: true, user: this.currentUser });
        },
        onFailure: (err) => {
          console.error('Sign in error:', err);
          let errorMessage = err.message || 'Authentication failed';
          
          // Handle specific Cognito error cases
          if (err.code === 'UserNotConfirmedException') {
            errorMessage = 'Please check your email and confirm your account before signing in.';
          } else if (err.code === 'NotAuthorizedException') {
            errorMessage = 'Invalid email or password. Please check your credentials.';
          } else if (err.code === 'UserNotFoundException') {
            errorMessage = 'No account found with this email address. Please register first.';
          }
          
          resolve({ success: false, error: errorMessage, code: err.code });
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // Handle case where user needs to set a new password
          resolve({ success: false, error: 'New password required. Please contact support.', code: 'NewPasswordRequired' });
        }
      });
    });
  }

  async signOut() {
    if (this.cognitoUser) {
      this.cognitoUser.signOut();
    }
    this.currentUser = null;
    this.cognitoUser = null;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: window.awsConfig.cognito.identityPoolId });
    this.notifyAuthStateChange(false);
    return { success: true };
  }

  isSignedIn() {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async confirmSignUp(email, confirmationCode) {
    if (!this.isAwsReady) return { success: false, error: 'AWS service not ready.' };

    // Get the actual username from localStorage
    const storedUsername = localStorage.getItem(`cognito_username_${email}`);
    const username = storedUsername || email;

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
      Username: username,
      Pool: this.pool,
    });

    return new Promise((resolve) => {
      cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
        if (err) {
          console.error('Confirmation error:', err);
          resolve({ success: false, error: err.message || JSON.stringify(err) });
          return;
        }
        resolve({ success: true, result });
      });
    });
  }

  async resendConfirmationCode(email) {
    if (!this.isAwsReady) return { success: false, error: 'AWS service not ready.' };

    // Get the actual username from localStorage
    const storedUsername = localStorage.getItem(`cognito_username_${email}`);
    const username = storedUsername || email;

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
      Username: username,
      Pool: this.pool,
    });

    return new Promise((resolve) => {
      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          console.error('Resend confirmation error:', err);
          resolve({ success: false, error: err.message || JSON.stringify(err) });
          return;
        }
        resolve({ success: true, result });
      });
    });
  }
  
  // ========================================
  // DATA MANAGEMENT METHODS (To be implemented)
  // ========================================
  
  async loadUserData() {
    if (!this.currentUser) {
      console.log('No current user, returning empty data');
      return { routines: {} };
    }

    try {
      const dynamodb = new AWS.DynamoDB.DocumentClient();
      const params = {
        TableName: window.awsConfig.dynamodb.tableName || 'GymnasticsTracker',
        Key: {
          userId: this.currentUser.username
        }
      };

      console.log('Attempting to load data from DynamoDB with params:', params);
      console.log('AWS credentials configured:', AWS.config.credentials);
      
      const result = await dynamodb.get(params).promise();
      
      if (result.Item && result.Item.userData) {
        console.log('Loaded user data from DynamoDB:', result.Item.userData);
        return result.Item.userData;
      } else {
        console.log('No user data found in DynamoDB, returning default structure');
        // Return default structure for new users
        const defaultData = {
          routines: {
            floor: [],
            pommel: [],
            rings: [],
            vault: [],
            pbars: [],
            hbar: []
          }
        };
        // Save the default structure to DynamoDB
        await this.saveUserData(defaultData);
        return defaultData;
      }
    } catch (error) {
      console.error('Error loading user data from DynamoDB:', error);
      console.error('Error details:', error.code, error.message);
      console.log('Falling back to localStorage');
      
      // Fallback to localStorage if DynamoDB fails
      const localData = localStorage.getItem(`gymnastics-data-${this.currentUser.username}`);
      if (localData) {
        try {
          return JSON.parse(localData);
        } catch (parseError) {
          console.error('Error parsing localStorage data:', parseError);
        }
      }
      
      // Return default structure on error
      const defaultData = {
        routines: {
          floor: [],
          pommel: [],
          rings: [],
          vault: [],
          pbars: [],
          hbar: []
        }
      };
      
      // Save default to localStorage as fallback
      localStorage.setItem(`gymnastics-data-${this.currentUser.username}`, JSON.stringify(defaultData));
      return defaultData;
    }
  }
  
  async saveUserData(data) {
    if (!this.currentUser) {
      console.log('No current user, cannot save data');
      return false;
    }

    try {
      const dynamodb = new AWS.DynamoDB.DocumentClient();
      const params = {
        TableName: window.awsConfig.dynamodb.tableName || 'GymnasticsTracker',
        Item: {
          userId: this.currentUser.username,
          userData: data,
          lastModified: new Date().toISOString()
        }
      };

      console.log('Attempting to save data to DynamoDB with params:', params);
      await dynamodb.put(params).promise();
      console.log('Successfully saved user data to DynamoDB');
      
      // Also save to localStorage as backup
      localStorage.setItem(`gymnastics-data-${this.currentUser.username}`, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving user data to DynamoDB:', error);
      console.error('Error details:', error.code, error.message);
      console.log('Falling back to localStorage');
      
      // Fallback to localStorage if DynamoDB fails
      try {
        localStorage.setItem(`gymnastics-data-${this.currentUser.username}`, JSON.stringify(data));
        console.log('Successfully saved user data to localStorage as fallback');
        return true;
      } catch (localError) {
        console.error('Error saving to localStorage:', localError);
        return false;
      }
    }
  }

  async getUserProfile() {
    // Return basic profile info from current user
    if (!this.currentUser) return null;
    
    return {
      fullName: this.currentUser.name || '',
      email: this.currentUser.email || '',
      gymnasticsLevel: this.currentUser.custom_gymnastics_level || ''
    };
  }

  async updateUserProfile(profileData) {
    console.log('updateUserProfile needs to be implemented for DynamoDB');
    return true;
  }

  async loadUserGroups() {
    console.log('loadUserGroups needs to be implemented for DynamoDB');
    return []; // Return empty groups for now
  }
  
  async createGroup(groupName) {
    console.log('createGroup needs to be implemented for DynamoDB');
    return { success: false, error: 'Not implemented' };
  }

  async joinGroupByCode(inviteCode) {
    console.log('joinGroupByCode needs to be implemented for DynamoDB');
    return { success: false, error: 'Not implemented' };
  }
  
}

// Export singleton instance
const authService = new AuthService();
window.authService = authService; 