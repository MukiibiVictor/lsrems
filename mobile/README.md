# LSREMS Mobile App

React Native (Expo) mobile application for the LSREMS system.

## Setup

```bash
cd mobile
npm install
```

## Running

```bash
# Start Expo dev server
npx expo start

# Android emulator
npx expo start --android

# iOS simulator (Mac only)
npx expo start --ios
```

## API Configuration

Edit `src/services/api.ts` and set `API_BASE`:
- Android emulator: `http://10.0.2.2:8000/api`
- Physical device: `http://<your-local-ip>:8000/api`
- Production: `https://your-domain.com/api`

## Screens

| Screen | Description |
|--------|-------------|
| Login | Auth with email/password |
| Dashboard | Stats overview + quick actions |
| Properties | Browse & search properties |
| Projects | Survey project list & status |
| Profile | User info & settings |

## Build APK

```bash
npx expo build:android
# or with EAS
npx eas build --platform android
```
