// AWS Configuration for Gymnastics Skills Tracker
// This file will hold the configuration for AWS Cognito and DynamoDB

const awsConfig = {
  region: 'us-east-1', // Example: 'us-east-1'
  cognito: {
    userPoolId: 'YOUR_COGNITO_USER_POOL_ID', // Example: 'us-east-1_xxxxxxxxx'
    userPoolWebClientId: 'YOUR_COGNITO_APP_CLIENT_ID', // Example: 'xxxxxxxxxxxxxxxxxxxxxx'
    identityPoolId: 'YOUR_COGNITO_IDENTITY_POOL_ID' // Example: 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
  },
  dynamodb: {
    tableName: 'GymnasticsTracker-Users',
    groupsTableName: 'GymnasticsTracker-Groups',
    invitesTableName: 'GymnasticsTracker-Invites'
  }
};

// Expose the config to the window object
window.awsConfig = awsConfig; 