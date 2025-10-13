# 🔐 Get Your Google Client Secret

## The Problem
Your `.env` file has `GOOGLE_CLIENT_SECRET=your-google-client-secret` which is a placeholder. You need the actual secret.

## 🚀 How to Get Your Google Client Secret

### Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're logged into the same Google account that created the OAuth client

### Step 2: Navigate to Credentials
1. Click the project dropdown at the top
2. Select your project (or create one if needed)
3. Go to **APIs & Services** → **Credentials**

### Step 3: Find Your OAuth Client
1. Look for "OAuth 2.0 Client IDs" section
2. Find the client with ID: `917137353724-ftng1fau0pm0hdl65l1i5et8fmssvedj`
3. Click the **Edit** button (pencil icon)

### Step 4: Get the Client Secret

### Step 5: Update Your .env File
Replace this line in your `.env` file:
```
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

With:
```
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-client-secret-here
```

### Step 6: Verify Redirect URIs
While you're there, make sure these redirect URIs are added:
- `http://localhost:8001/google-calendar-callback`

### Step 7: Restart Your Server
After updating the `.env` file, restart your development server:
```bash
npm run dev
```

## 🧪 Test the Connection
1. Go to your calendar view
2. Click "Connect Google Calendar" 
3. Complete the OAuth flow
4. Check the server logs for detailed error messages

## 💡 Security Note
Never commit your actual Google Client Secret to version control. Keep it in `.env` and make sure `.env` is in your `.gitignore` file.