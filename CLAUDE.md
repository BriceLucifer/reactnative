# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm start` or `npx expo start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device 
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run on web browser
- `npm run reset-project` - Reset to blank project structure

### Code Quality
- `npm run lint` - Run ESLint for code linting (using Expo's flat config)

### Testing
- No test framework currently configured
- Consider adding Jest for unit testing React components

## Project Architecture

### Tech Stack
- **Framework**: React Native with Expo (SDK 53)
- **Navigation**: Expo Router with file-based routing
- **Backend**: Appwrite (self-hosted at http://170.106.113.63/v1)
- **UI Libraries**: 
  - React Native Reanimated for animations
  - Expo Linear Gradient for gradients
  - Expo Blur for blur effects
  - React Navigation for navigation components
- **Additional Features**: Audio recording/playback, image handling, calendar integration, location services

### App Structure
- **Entry Point**: `app/index.tsx` - Login screen with Apple/Google OAuth
- **Layout**: `app/_layout.tsx` - Root layout with navigation stack
- **Screens**: Located in `app/screens/` including:
  - `NoteListScreen.tsx` - Main notes list with animated header
  - `NoteEditorScreen.tsx` - Note editing interface
  - `Permission.tsx` - Permissions handling screen
  - Various utility screens (PasswordLock, Feedback, etc.)

### Key Components (`components/`)
- `NoteCard.tsx` - Individual note display with text/audio/image content
- `ProfileDrawer.tsx` - Side drawer for user profile and settings
- `ChatDialog.tsx` - Dialog for chat/AI interactions
- `AudioPlayer.tsx` - Audio playback functionality
- `RecordButton.tsx` & `RecordingModal.tsx` - Audio recording interface

### Services
- `services/appwrite.ts` - Appwrite client configuration and OAuth functions
- `services/noteService.ts` - Note CRUD operations (currently in-memory mock data)

### Content System
Notes support multiple content block types:
- Text blocks
- Image blocks (with remote URLs)
- Audio blocks (with duration and optional transcript)

### Configuration
- **Expo Config**: `app.json` with Chinese permission descriptions
- **TypeScript**: Strict mode enabled with path mapping (`@/*` → `./`)
- **ESLint**: Using Expo's flat config
- **Permissions**: Calendar, location, microphone, photo library access

### Backend Configuration
- **Appwrite Instance**: Remote instance at `https://api.freedomai.fun/v1`
- **Project ID**: `689c404400138a4a5f2d`
- **OAuth2 Callbacks**: Uses Appwrite console as redirect (`/console`)
- **Mock Data**: Notes currently use in-memory data (`services/noteService.ts`)

### Development Notes
- OAuth scheme: `shiro://auth-callback` (configured in app.json)
- The app uses gesture handlers and safe area context throughout
- Custom fonts (Gilroy family) are included in `assets/fonts/`
- All screens are designed for portrait orientation only
- Chinese permission descriptions used throughout app.json
- TypeScript strict mode with `@/*` path mapping to `./`

### API Integration Status
- **Authentication**: Functional OAuth2 with Apple/Google via Appwrite
- **Notes**: Currently mock data - replace `noteService.ts` with real Appwrite API calls
- **Audio Storage**: Demo audio served from Appwrite storage buckets
- **User Management**: Basic user session handling implemented