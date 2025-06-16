# AWS Setup for Gymnastics Tracker Backend

This guide details how to set up the necessary AWS services (Cognito and DynamoDB) to serve as the backend for the Gymnastics Tracker application.

## 🚀 Overview

We will set up the following services:
1.  **Amazon Cognito User Pool:** To handle user sign-up and sign-in.
2.  **Amazon Cognito Identity Pool:** To provide temporary, secure AWS credentials to authenticated users, allowing them to access DynamoDB.
3.  **Amazon DynamoDB:** A NoSQL database to store user data, routines, and team information.
4.  **IAM Roles:** Automatically created by Cognito to define permissions for what authenticated users can do.

---

## Step 1: Create a Cognito User Pool

This pool will manage your application's users.

1.  Navigate to the **[Amazon Cognito service](https://console.aws.amazon.com/cognito/home)** in the AWS Console.
2.  Click **"Create user pool"**.
3.  **Step 1: Configure sign-in experience**
    *   Under "Cognito user pool sign-in options", select **"Email"**.
    *   Click **"Next"**.
4.  **Step 2: Configure security requirements**
    *   Leave the password policy and MFA settings as their defaults for now.
    *   Under "User account recovery", select **"Email only"**.
    *   Click **"Next"**.
5.  **Step 3: Configure sign-up experience**
    *   Leave the settings as default. You can leave "Enable self-registration" checked.
    *   Under "Custom attributes", click **"Add custom attribute"**.
        *   **Name**: `gymnastics_level`
        *   **Type**: `String`
        *   **Mutable**: Check the box.
    *   Click **"Next"**.
6.  **Step 4: Configure message delivery**
    *   Under "Email", choose **"Send email with Cognito"**. This is suitable for development and has a free tier.
    *   Click **"Next"**.
7.  **Step 5: Integrate your app**
    *   Give the User Pool a name, e.g., `GymnasticsTracker-Users`.
    *   Under "App client", select **"Public client"**.
    *   Give the app client a name, e.g., `gymnastics-tracker-web-app`.
    *   Ensure **"Generate a client secret"** is **UNCHECKED**. Public clients on the web cannot securely store a secret.
    *   Click **"Next"**.
8.  **Step 6: Review and create**
    *   Review your settings and click **"Create user pool"**.

**➡️ After creation, navigate to your new User Pool, go to the "App integration" tab, and copy the `User pool ID` and the `Client ID`. You will need these for `aws-config.js`.**

---

## Step 2: Create a Cognito Identity Pool

This pool provides temporary AWS credentials to your users.

1.  Navigate to the **[Amazon Cognito service](https://console.aws.amazon.com/cognito/home)**.
2.  On the left, click **"Federated identities"**.
3.  Click **"Create identity pool"**.
4.  **Step 1: Configure identity pool trust**
    *   Give the Identity Pool a name, e.g., `GymnasticsTracker-Identities`.
    *   Under "User access", select **"Authenticated access"**.
    *   Under "Authentication providers", select the **"Cognito"** tab.
    *   Paste the **`User pool ID`** and **`Client ID`** from the User Pool you just created.
    *   Click **"Next"**.
5.  **Step 2: Configure permissions**
    *   Under "Authenticated role", select **"Create a new IAM role"**.
    *   The role name will be pre-filled (e.g., `Cognito_GymnasticsTracker-IdentitiesAuth_Role`). You can leave it as the default.
    *   Click **"View policy document"**. You will see a default policy. We will edit this in the next step.
    *   Click **"Next"**.
6.  **Step 3: Configure identity pool**
    *   Review the details.
    *   Click **"Create identity pool"**.

**➡️ After creation, copy the `Identity pool ID`. You will need this for `aws-config.js`.**

---

## Step 3: Create DynamoDB Tables & Configure Permissions

1.  Navigate to the **[Amazon DynamoDB service](https://console.aws.amazon.com/dynamodb/home)**.
2.  Click **"Create table"**.
    *   **Table name**: `GymnasticsTracker-Users`
    *   **Partition key**: `userId` (Type: String)
    *   Leave other settings as default and click **"Create table"**.
3.  Repeat the process for the other tables:
    *   **Table name**: `GymnasticsTracker-Groups`
        *   **Partition key**: `groupId` (Type: String)
    *   **Table name**: `GymnasticsTracker-Invites`
        *   **Partition key**: `inviteCode` (Type: String)

4.  **Configure IAM Role Permissions for DynamoDB:**
    *   Navigate to the **[IAM service](https://console.aws.amazon.com/iam/home)**.
    *   Click on **"Roles"** in the left menu.
    *   Find and click on the authenticated role you created earlier (e.g., `Cognito_GymnasticsTracker-IdentitiesAuth_Role`).
    *   Under "Permissions policies", click the **`+ Add permissions`** dropdown and select **"Create inline policy"**.
    *   Select the **JSON** tab.
    *   Paste the following policy. This allows users to access only the items in the DynamoDB tables that match their own user ID or are otherwise necessary for the app to function.

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "dynamodb:GetItem",
                    "dynamodb:PutItem",
                    "dynamodb:UpdateItem",
                    "dynamodb:DeleteItem",
                    "dynamodb:Query"
                ],
                "Resource": [
                    "arn:aws:dynamodb:*:*:table/GymnasticsTracker-Users",
                    "arn:aws:dynamodb:*:*:table/GymnasticsTracker-Groups",
                    "arn:aws:dynamodb:*:*:table/GymnasticsTracker-Invites"
                ],
                "Condition": {
                    "ForAllValues:StringEquals": {
                        "dynamodb:LeadingKeys": [
                            "${cognito-identity.amazonaws.com:sub}"
                        ]
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "dynamodb:GetItem",
                    "dynamodb:PutItem",
                    "dynamodb:UpdateItem",
                    "dynamodb:Query"
                ],
                "Resource": "arn:aws:dynamodb:*:*:table/GymnasticsTracker-Groups/*"
            }
        ]
    }
    ```
    *   Click **"Review policy"**.
    *   Give the policy a name, e.g., `DynamoDB-User-Access`.
    *   Click **"Create policy"**.

---

## Step 4: Update Your App Configuration

Open `src/aws-config.js` in your project and replace the placeholder values with the actual IDs you copied from the AWS Console.

```javascript
const awsConfig = {
  region: 'us-east-1', // <-- Make sure this is your AWS region
  cognito: {
    userPoolId: 'PASTE_YOUR_USER_POOL_ID_HERE',
    userPoolWebClientId: 'PASTE_YOUR_APP_CLIENT_ID_HERE',
    identityPoolId: 'PASTE_YOUR_IDENTITY_POOL_ID_HERE'
  },
  // ... rest of the config
};
```

You are now ready to run the application with an AWS backend! 