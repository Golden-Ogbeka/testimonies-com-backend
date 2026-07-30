# Testimonies.com Backend

A robust, premium, and production-ready backend for the Testimonies.com platform. This API handles complex user engagement, high-performance messaging, organization management, and multi-gateway payment integrations.

## 📋 Documentation

- **[Product Requirements Document (PRD)](./PRD.md)** - Complete feature specifications and requirements
- **[Agent Guidelines](./AGENTS.md)** - Development rules and coding standards for AI agents
- **[API Documentation](http://localhost:<PORT>/docs/user)** - Interactive Swagger documentation

## 🚀 Key Features

- **Testimony Management**: Comprehensive system for creating, broadcasting, liking, and replying to testimonies.
- **Payment Ecosystem**: Integrated with **Stripe, Paystack, and Flutterwave**. Supports live payment intents, transaction tracking, and signature-verified webhooks for automated subscription activation.
- **High-Performance Messaging**: Optimized real-time messaging with conversation history, full-text search, and automated unread count management.
- **Organization & Team Tools**: Advanced role-based access control (RBAC) for organizations and their internal teams.
- **Subscription & Promotions**: Dynamic plan management and promotion request workflows.
- **Global Search & Discovery**: Optimized MongoDB text search and indexing for testimonies and users.
- **Security & Optimization**:
  - Rate limiting and standard security headers (Helmet).
  - CSRF and parameter pollution protection.
  - Compound MongoDB indexing for high-load performance.
  - Centrally managed authentication and authorization middleware.

## 🛠 Tech Stack

- **Core**: Node.js, Express.js, TypeScript
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **Payments**: Stripe SDK, Paystack API, Flutterwave API
- **Documentation**: Swagger (Split into User and Admin docs)
- **Storage**: Cloudinary/AWS
- **Process Management**: Agenda (Background Jobs)

## 📖 API Documentation

The project uses Swagger to provide interactive documentation:

- **User API Documentation**: `http://localhost:<PORT>/docs/user`
- **Admin API Documentation**: `http://localhost:<PORT>/docs/admin`

_Note: Most endpoints require an `x-api-key` header and valid JWT authentication._

## ⚙️ Setup & Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd testimonies-com-backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the `.env.example` to `.env` and fill in the required keys (MongoDB URI, Payment Secrets, etc.):

   ```bash
   cp .env.example .env
   ```

4. **Run in Development**:

   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm start
   ```

## 📜 Available Scripts

- `npm run dev`: Start development server with hot-reload.
- `npm start`: Build and start production server.
- `npm run test`: Execute Jest tests.
- `npm run lint`: Run ESLint checks.
- `npm run format`: Format code with Prettier.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
