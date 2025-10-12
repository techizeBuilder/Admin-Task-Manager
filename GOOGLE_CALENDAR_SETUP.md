# Google Calendar Integration Setup Instructions

## Prerequisites
1. Google Cloud Console project with Calendar API enabled
2. OAuth 2.0 credentials configured

## Installation Steps

### 1. Install Google APIs
```bash
npm install googleapis
```

### 2. Environment Variables
Add these to your `.env` file:
```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLIENT_URL=http://localhost:3000
```

### 3. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/google-calendar-callback` (development)
   - `https://yourdomain.com/google-calendar-callback` (production)

### 4. Database Schema Update
Add these fields to your User model:
```javascript
googleCalendarTokens: {
  access_token: String,
  refresh_token: String,
  expiry_date: Number
}
```

### 5. Add Route to Server
In your main server file, add:
```javascript
const googleCalendarRoutes = require('./routes/googleCalendar');
app.use('/api/google-calendar', authenticateToken, googleCalendarRoutes);
```

### 6. Add Route to React Router
In your React app routing, add:
```javascript
import GoogleCalendarCallback from './components/GoogleCalendarCallback';

// Add this route
<Route path="/google-calendar-callback" component={GoogleCalendarCallback} />
```

## Features Included

### Frontend (TasksCalendarView.jsx)
- ✅ Google Calendar connect button
- ✅ Connection status indicator
- ✅ Automatic sync trigger
- ✅ Disconnect functionality
- ✅ Loading states and error handling

### Backend (googleCalendar.js)
- ✅ OAuth flow handling
- ✅ Token storage and refresh
- ✅ Task to calendar event conversion
- ✅ Priority-based color coding
- ✅ Connection status checking

### Security Features
- ✅ Secure token storage in database
- ✅ User authentication required
- ✅ Error handling and validation
- ✅ Token refresh handling

## Usage
1. Click "Connect Google Calendar" button
2. Complete OAuth flow in popup window
3. Tasks with due dates automatically sync to Google Calendar
4. Events are color-coded by priority:
   - Green: Low priority
   - Yellow: Medium priority
   - Orange: High priority
   - Red: Urgent priority

## API Endpoints
- `POST /api/google-calendar/auth` - Exchange auth code for tokens
- `POST /api/google-calendar/sync` - Sync tasks to Google Calendar
- `GET /api/google-calendar/status` - Check connection status
- `DELETE /api/google-calendar/disconnect` - Disconnect account