# MicroHire Frontend

A modern React-based frontend for the MicroHire internship platform, built with Vite, Ant Design, and comprehensive state management.

## Features

- 🎨 **Modern UI**: Built with Ant Design components
- 🔐 **Authentication**: Secure login/register with JWT
- 💼 **Internship Management**: Browse, create, and manage internships
- 📝 **Application System**: Complete application workflow
- 💬 **Real-time Messaging**: WebSocket-based messaging
- 📊 **Analytics Dashboard**: Comprehensive analytics
- 🔍 **Advanced Search**: Filter and search internships
- 📱 **Responsive Design**: Mobile-friendly interface
- 🔒 **Security**: CSRF protection and secure API calls
- 🎯 **Admin Panel**: Complete administrative interface

## Quick Start

### Prerequisites

- Node.js 18+
- Backend server running (see backend README)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd microhire-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Configuration

The frontend automatically connects to the backend API. Make sure your backend is running on the configured URL (default: `http://localhost:5000`).

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=MicroHire
```

## Features Overview

### Authentication
- Secure login/register with JWT tokens
- Password reset functionality
- Role-based access control
- Automatic token refresh

### Internship Management
- Browse available internships
- Advanced filtering and search
- Create internships (Business users)
- Detailed internship views

### Application System
- Apply for internships
- Track application status
- Manage applications

### Messaging
- Real-time messaging between users
- Conversation management
- Message notifications

### Analytics
- Platform usage analytics
- User engagement metrics
- Business insights

### Admin Panel
- User management
- Platform moderation
- System analytics
- Content management

## Tech Stack

- **Framework**: React 18 with Vite
- **UI Library**: Ant Design
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Real-time**: WebSocket
- **Routing**: React Router
- **Notifications**: React Hot Toast
- **Styling**: CSS Modules + Ant Design

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

### Project Structure

```
src/
├── components/      # Reusable UI components
├── contexts/        # React context providers
├── pages/          # Page components
├── services/       # API services
├── utils/          # Utility functions
└── assets/         # Static assets
```

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your web server

3. **Configure your web server** to serve the React app

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Security Features

- **CSRF Protection**: Automatic CSRF token handling
- **Secure API Calls**: Credentials included in requests
- **Input Validation**: Client-side validation
- **XSS Protection**: React's built-in XSS protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
