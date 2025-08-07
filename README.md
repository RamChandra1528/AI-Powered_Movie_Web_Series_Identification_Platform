# CineAI - AI-Powered Movie & Web Series Identification Platform

A production-ready, full-stack web application that uses advanced AI to identify movies and web series from images, videos, text descriptions, or actor names. Built with React, Node.js, and integrated with OpenAI GPT-4 Vision and Google Gemini Vision APIs.

## 🚀 Features

### Core Functionality
- **Multi-Modal AI Search**: Text, image upload, video clip analysis, and actor name search
- **Real-Time AI Processing**: Integration with OpenAI GPT-4 Vision and Google Gemini Vision
- **Comprehensive Movie Database**: Detailed information including cast, director, ratings, and streaming platforms
- **User Authentication**: JWT-based secure authentication with role-based access control
- **Search History**: Track and manage user search history
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Technical Features
- **RESTful API**: Complete backend API with Swagger documentation
- **File Upload Support**: Handle image and video uploads up to 10MB
- **Rate Limiting**: Protect against abuse with configurable rate limits
- **Security Best Practices**: Helmet.js, CORS, input validation, and password hashing
- **Database Support**: File-based storage with PostgreSQL schema for production
- **Containerization**: Docker and Docker Compose ready
- **Testing Suite**: Unit tests (Jest) and E2E tests (Playwright)

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

### Backend
- **Node.js** with Express.js
- **JWT** for authentication
- **Multer** for file uploads
- **Sharp** for image processing
- **Swagger** for API documentation

### AI Integration
- **OpenAI GPT-4 Vision API**
- **Google Gemini Vision API**

### Database
- **File-based storage** (development)
- **PostgreSQL** (production ready)

### DevOps & Testing
- **Docker** & **Docker Compose**
- **Jest** for unit testing
- **Playwright** for E2E testing
- **Nginx** for reverse proxy

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for containerized deployment)
- OpenAI API key (for GPT-4 Vision)
- Google AI Studio API key (for Gemini Vision)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd cineai-platform
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# AI Provider API Keys
OPENAI_API_KEY=sk-your-openai-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 3. Development Mode

```bash
# Start both frontend and backend
npm run dev:full

# Or start separately
npm run server:dev  # Backend on port 5000
npm run dev         # Frontend on port 5173
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health

## 🐳 Docker Deployment

### Development with Docker

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

```bash
# Build production image
docker build -t cineai-app .

# Run with production environment
docker run -d \
  --name cineai-production \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-production-secret \
  -e OPENAI_API_KEY=your-openai-key \
  -e GEMINI_API_KEY=your-gemini-key \
  cineai-app
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### End-to-End Tests

```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## 📚 API Documentation

### Authentication Endpoints

```bash
POST /api/auth/register    # Register new user
POST /api/auth/login       # User login
GET  /api/auth/me          # Get current user
POST /api/auth/refresh     # Refresh JWT token
```

### AI Identification Endpoints

```bash
POST /api/ai/identify      # Identify content using AI
GET  /api/ai/providers     # Get available AI providers
POST /api/ai/config        # Configure AI provider settings
```

### Movie Endpoints

```bash
GET  /api/movies           # Get movies with filtering
GET  /api/movies/:id       # Get movie by ID
GET  /api/movies/meta/genres    # Get all genres
GET  /api/movies/meta/stats     # Get database statistics
```

### User Endpoints

```bash
GET  /api/users/profile         # Get user profile
PUT  /api/users/profile         # Update user profile
GET  /api/users/search-history  # Get search history
DELETE /api/users/search-history/:id  # Delete search entry
```

## 🔧 Configuration

### AI Provider Setup

1. **OpenAI GPT-4 Vision**:
   - Visit [OpenAI Platform](https://platform.openai.com)
   - Create API key in API Keys section
   - Add to environment as `OPENAI_API_KEY`

2. **Google Gemini Vision**:
   - Visit [Google AI Studio](https://makersuite.google.com)
   - Generate API key
   - Add to environment as `GEMINI_API_KEY`

### Database Configuration

For production, update the database configuration:

```javascript
// server/config/database.js
// Replace file-based storage with PostgreSQL/MongoDB
```

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcrypt with salt rounds
- **Rate Limiting** to prevent API abuse
- **Input Validation** using express-validator
- **CORS Configuration** for cross-origin requests
- **Helmet.js** for security headers
- **File Upload Validation** with size and type restrictions

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first approach** using Tailwind CSS
- **Breakpoint optimization** for all screen sizes
- **Touch-friendly interfaces** for mobile devices
- **Progressive enhancement** for better performance

## 🚀 Deployment Options

### Cloud Platforms

1. **Heroku**:
   ```bash
   heroku create cineai-app
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   git push heroku main
   ```

2. **Railway**:
   ```bash
   railway login
   railway init
   railway add
   railway deploy
   ```

3. **DigitalOcean App Platform**:
   - Connect GitHub repository
   - Configure environment variables
   - Deploy with automatic builds

### VPS Deployment

```bash
# Clone repository on server
git clone <repository-url>
cd cineai-platform

# Install dependencies
npm install --production

# Build frontend
npm run build

# Start with PM2
npm install -g pm2
pm2 start server/index.js --name cineai-app
pm2 startup
pm2 save
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation at `/api-docs`
- Review the test files for usage examples

## 🔮 Future Enhancements

- [ ] Real-time streaming platform availability updates
- [ ] Advanced filtering and recommendation engine
- [ ] Social features (watchlists, reviews, ratings)
- [ ] Mobile app development (React Native)
- [ ] Integration with more AI providers
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Voice search capabilities

---

**Built with ❤️ using modern web technologies and AI**