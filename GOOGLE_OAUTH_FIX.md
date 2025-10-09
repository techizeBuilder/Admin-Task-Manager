# Google Calendar OAuth Setup - Fixing redirect_uri_mismatch

## The Error
`Error 400: redirect_uri_mismatch` occurs when the redirect URI in your OAuth request doesn't match the authorized redirect URIs configured in Google Cloud Console.

## Quick Fix Steps

### 1. **Identify Your App URL**
Your app is running on: `http://localhost:8001` (or your current domain)

### 2. **Required Redirect URIs**
You need to add these EXACT URLs to Google Cloud Console:

**For Development:**
```
http://localhost:8001/google-calendar-callback
```

**For Production (replace with your domain):**
```
https://yourdomain.com/google-calendar-callback
```

### 3. **Google Cloud Console Configuration**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to OAuth Settings:**
   - Go to "APIs & Services" → "Credentials"
   - Find your OAuth 2.0 Client ID (the one starting with `917137353724-...`)
   - Click the edit button (pencil icon)

3. **Add Authorized Redirect URIs:**
   - Scroll down to "Authorized redirect URIs"
   - Click "ADD URI"
   - Add: `http://localhost:8001/google-calendar-callback`
   - If you have a production domain, also add: `https://yourdomain.com/google-calendar-callback`
   - Click "SAVE"

### 4. **Verify Your React Route**
Make sure you have the callback route configured in your React app. Add this to your main App.jsx or router configuration:

```jsx
import GoogleCalendarCallback from './components/GoogleCalendarCallback';

// Add this route to your routing configuration
<Route path="/google-calendar-callback" component={GoogleCalendarCallback} />
```

### 5. **Environment Variables**
Create a `.env` file in your project root with:

```env
REACT_APP_GOOGLE_CLIENT_ID=917137353724-ftng1fau0pm0hdl65l1i5et8fmssvedj.apps.googleusercontent.com
GOOGLE_CLIENT_ID=917137353724-ftng1fau0pm0hdl65l1i5et8fmssvedj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLIENT_URL=http://localhost:8001
```

## Testing the Fix

1. **Clear your browser cache and cookies**
2. **Restart your development server**
3. **Try the Google Calendar connection again**

## Common Issues & Solutions

### Issue 1: Still getting redirect_uri_mismatch
**Solution:** Double-check that the URL in Google Cloud Console matches EXACTLY:
- No trailing slashes
- Correct protocol (http vs https)
- Correct port number
- Correct path

### Issue 2: Popup blocked
**Solution:** 
- Allow popups for your site
- Or disable popup blocker temporarily

### Issue 3: CORS errors
**Solution:** Make sure your backend is running and accessible

## Production Deployment

When deploying to production:

1. **Update environment variables:**
   ```env
   CLIENT_URL=https://yourdomain.com
   ```

2. **Add production redirect URI to Google Cloud Console:**
   ```
   https://yourdomain.com/google-calendar-callback
   ```

3. **Update CORS settings** in your backend to allow your production domain

## Verification Checklist

- [ ] Google Cloud Console has the correct redirect URI
- [ ] React route for `/google-calendar-callback` exists
- [ ] Environment variables are set correctly
- [ ] Backend server is running
- [ ] Browser cache is cleared

## Next Steps After Setup

Once the redirect URI is fixed:
1. The Google OAuth flow should work
2. Users will be redirected to Google for authorization
3. Google will redirect back to your callback URL
4. Your app will exchange the code for access tokens
5. Tasks will sync to Google Calendar

## Support

If you continue to have issues:
1. Check the browser console for detailed error messages
2. Verify the exact redirect URI being used in the OAuth request
3. Ensure all URLs match exactly between your code and Google Cloud Console