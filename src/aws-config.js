// AWS Configuration for Gymnastics Skills Tracker
// This file will hold the configuration for AWS Cognito and DynamoDB

const awsConfig = {
  region: 'us-east-1', // Example: 'us-east-1'
  cognito: {
    userPoolId: 'us-east-1_NugIuAYbc',
    userPoolWebClientId: '7lavuhim67nlljcv9sk444pmej',
    identityPoolId: 'us-east-1:96c50b8b-85c6-4426-b708-b23595e36154', // TODO: update once you create an Identity Pool
    domain: 'https://us-east-1nugiuaybc.auth.us-east-1.amazoncognito.com'
  },
  dynamodb: {
    tableName: 'GymnasticsTracker',
    groupsTableName: 'GymnasticsTracker-Groups',
    invitesTableName: 'GymnasticsTracker-Invites'
  }
};

// Expose the config to the window object
window.awsConfig = awsConfig; 