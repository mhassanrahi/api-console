# 🎯 Reactive API Console via Chat Interface

A modern, real-time API explorer tool that allows users to interact with multiple APIs through a chat-style interface. Built with React, Node.js, and WebSocket technology for seamless real-time communication.

## 🌟 Features

- **🔌 Multi-API Support**: Choose from 6+ public APIs (Weather, Cat Facts, Chuck Norris Jokes, etc.)
- **💬 Chat Interface**: Natural language commands like `get weather Berlin` or `search github john`
- **📺 Isolated Result Panels**: Each API gets its own dedicated panel for results
- **🔍 Real-time Search**: Filter results globally or within individual panels
- **🔐 Authentication**: Secure login with AWS Cognito integration
- **⚡ Real-time Updates**: WebSocket-powered live chat and API responses
- **📱 Modern UI**: Beautiful, responsive design with Tailwind CSS
- **🔒 Form Validation**: Robust validation with React Hook Form + Zod

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Hook Form + Zod** - Form validation
- **Socket.IO Client** - Real-time WebSocket communication
- **AWS Amplify** - Authentication with Cognito
- **Vitest** - Unit testing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe development
- **Socket.IO** - WebSocket server
- **JWT** - Token-based authentication
- **CORS** - Cross-origin resource sharing
- **Jest** - Unit testing

### APIs & Services
- **AWS Cognito** - Authentication service
- **Public APIs**:
  - Cat Facts API
  - Chuck Norris Jokes API
  - Bored API
  - GitHub Users API
  - Weather API (Open-Meteo)
  - Custom Backend API

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **AWS Account** (for Cognito setup)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd api-console
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update environment variables
# See Environment Configuration section below

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update environment variables
# See Environment Configuration section below

# Start development server
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **WebSocket**: ws://localhost:3001

## ⚙️ Environment Configuration

### Backend (.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# AWS Cognito Configuration
AWS_REGION=aws-region
COGNITO_USER_POOL_ID=your-user-pool-id
COGNITO_CLIENT_ID=your-client-id

# JWT Configuration
JWT_SECRET=your-jwt-secret

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# AWS Cognito Configuration
VITE_AWS_REGION=aws-region
VITE_COGNITO_USER_POOL_ID=your-user-pool-id
VITE_COGNITO_CLIENT_ID=your-client-id
```

## 📱 Usage Guide

### Authentication
1. **Sign Up**: Create a new account with email verification
2. **Sign In**: Login with your credentials
3. **Password Reset**: Use the forgot password flow with verification codes

### API Interaction
1. **Select APIs**: Choose which APIs to activate from the sidebar
2. **Send Commands**: Use natural language commands:
   - `get weather Berlin`
   - `get cat fact`
   - `search github john`
   - `get chuck joke`
   - `get activity`
   - `get my preferences`

### Features
- **Real-time Results**: See API responses instantly via WebSocket
- **Search & Filter**: Filter results globally or per panel
- **Pin Messages**: Pin important results to the top
- **Command History**: Access recent commands and suggestions
- **Auto-complete**: Get command suggestions as you type

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test          # Run unit tests
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage
```

### Backend Tests
```bash
cd backend
npm run test          # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### E2E Tests
```bash
cd frontend
npm run test:e2e      # Run Cypress E2E tests
```

## 📁 Project Structure

```
api-console/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── auth/         # Authentication components
│   │   │   └── common/       # Shared components
│   │   ├── constants/        # App constants and validation
│   │   ├── features/         # Redux slices
│   │   ├── store/            # Redux store configuration
│   │   ├── utils/            # Utility functions
│   │   └── App.tsx           # Main application component
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Node.js backend application
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── socket/           # WebSocket handlers
│   │   └── index.ts          # Server entry point
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🔧 Available Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run test         # Run unit tests
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🌐 API Endpoints

### Public APIs
- **Cat Facts**: `GET https://catfact.ninja/fact`
- **Chuck Norris**: `GET https://api.chucknorris.io/jokes/random`
- **Bored API**: `GET https://www.boredapi.com/api/activity`
- **GitHub Users**: `GET https://api.github.com/search/users`
- **Weather**: `GET https://api.open-meteo.com/v1/forecast`

### Backend API (Protected)
- `GET /api/user/preferences` - Get user preferences
- `POST /api/user/preferences` - Save user preferences
- `GET /api/searches/history` - Get search history
- `POST /api/searches` - Save search query
- `DELETE /api/searches/:id` - Delete search from history

### WebSocket Events
- `chat_command` - Send chat commands
- `api_response` - Receive API responses
- `command_status` - Command processing status
- `typing_indicator` - Real-time typing indicators