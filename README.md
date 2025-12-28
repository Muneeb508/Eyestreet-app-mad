# Street Eye – Civic Reporting App (React Native)

Name: Muneeb & Taha

Street Eye is a civic reporting mobile application that helps citizens report, track, and discuss local issues such as garbage, water shortages, road damage, and streetlight problems.

Built using React Native with Firebase as the backend for authentication, real-time data, and storage.

# APK Download 

You can download and install the latest APK from Google Drive:

Street Eye APK (Google Drive): https://drive.google.com/file/d/19Z0PTjNWZUoUu4k4xwJ_nIPeHsKR9uYW/view?usp=sharing

Note: If Android blocks installation, enable Install unknown apps for your browser or file manager in settings.

## Core Screens (5 Screens)

1. **Home (Map + Feed)** - Interactive map with color-coded issue markers and nearby issues list
2. **Report Issue** - Create a new civic report with photos, GPS location, and category selection
3. **My Reports** - View issues reported by the logged-in user, organized by status
4. **Community** - Public community feed to discuss local problems
5. **Emergency & Support** - One-tap emergency hotlines and city service numbers

## Features

- Firebase Authentication (Email & Password)
- Real-time issue updates using Firestore
- Image upload with Firebase Storage
- GPS based issue location
- Issue status tracking workflow
- Community upvoting system
- Category-based filtering
- Simple analytics counters
- Pakistani city support

## Tech Stack

### Frontend
- React Native (Expo)
- JavaScript
- React Navigation
- React Native Maps
- Expo Image Picker

### Backend
- Firebase Authentication
- Cloud Firestore
- Firebase Storage

## Prerequisites

- Node.js (18+ recommended)
- npm or yarn
- Android Studio or Xcode
- Expo CLI
- Firebase account
- Git

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable:
   - Authentication (Email/Password)
   - Firestore Database
   - Firebase Storage
3. Update `src/services/firebase.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 3. Run the App

```bash
# Start Expo
npx expo start

# Run on Android
npx expo start --android

# Run on iOS (Mac only)
npx expo start --ios
```

## Project Structure

```
src/
├── components/
│   ├── IssueCard.js
│   ├── CustomButton.js
│   └── MapMarker.js
├── screens/
│   ├── AuthScreen.js
│   ├── HomeScreen.js

│   ├── ReportIssueScreen.js
│   ├── MyReportsScreen.js
│   ├── CommunityScreen.js
│   └── EmergencyScreen.js
├── navigation/
│   └── AppNavigator.js
├── services/
│   └── firebase.js
├── constants/
│   └── colors.js
└── App.js
```

## Firestore Collections

### users
```javascript
{
  "name": "string",
  "email": "string",
  "city": "string",
  "createdAt": "timestamp",
  "reportsCount": "number"
}
```

### issues
```javascript
{
  "userId": "string",
  "title": "string",
  "description": "string",
  "category": "string",
  "location": {
    "lat": "number",
    "lng": "number"
  },
  "address": "string",
  "status": "pending | inProgress | resolved",
  "imageUrls": ["string"],
  "upvotes": ["userId"],
  "createdAt": "timestamp"
}
```

### community_posts
```javascript
{
  "userId": "string",
  "userName": "string",
  "content": "string",
  "likes": ["userId"],
  "comments": ["string"],
  "createdAt": "timestamp"
}
```

## Issue Categories

- Garbage
- Water
- Sewer
- Roads
- Electricity
- Streetlights
- Traffic
- Other

## Emergency Hotlines (Pakistan)

- Police: 15
- Ambulance / Rescue: 1122
- Fire Brigade: 16
- Edhi: 115
- Gas: 1199
- K-Electric: 118
- Citizen Portal: 1334

## Permissions Required

### Android
- Internet
- Location (Fine & Coarse)
- Camera
- Storage access

### iOS
- Location usage
- Camera access
- Photo library access

## Color Scheme

- Primary: #254A48 (Deep Teal Green)
- Accent: #E8DDBB (Soft Beige)
- Info: #7EB6FF (Pastel Blue)
- Background: #F1F1F1
- Text: #3A3A3A
- Danger: #D9534F
- Success: #6ABF69
- Warning: #F5C542

## Production Notes

- Secure Firestore rules before release
- Disable test mode
- Optimize images
- Enable app signing
- Add proper app icons and splash screen

## License

This project is private and proprietary.

