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

    // Generate a username that's not in email format (required when email alias is enabled)
    const username = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    const attributeList = [
      new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'email', Value: email }),
      new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'name', Value: fullName || 'User' }),
      new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'name.formatted', Value: fullName || 'User' }),
      new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'custom:gymnastics_level', Value: gymnasticsLevel || '' })
    ];

    return new Promise((resolve) => {
      this.pool.signUp(username, password, attributeList, null, (err, result) => {
        if (err) {
          console.error('Sign up error:', err);
          resolve({ success: false, error: err.message || JSON.stringify(err) });
          return;
        }
        // After sign up, we should store their profile data in DynamoDB
        // This will happen after they confirm their email and sign in for the first time.
        resolve({ success: true, user: result.user });
      });
    });
  }

  async signIn(email, password) {
    if (!this.isAwsReady) return { success: false, error: 'AWS service not ready.' };

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
      Username: email,
      Password: password,
    });
    
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
      Username: email,
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
          resolve({ success: false, error: err.message || JSON.stringify(err) });
        },
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
  
  // ========================================
  // DATA MANAGEMENT METHODS (To be implemented)
  // ========================================
  
  async loadUserData() {
    console.log('loadUserData needs to be implemented for DynamoDB');
    return { routines: {} }; // Return default empty data
  }
  
  async saveUserData(data) {
    console.log('saveUserData needs to be implemented for DynamoDB');
    return true;
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