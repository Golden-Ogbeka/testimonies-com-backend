# Testimonies.com Backend - Agent Guidelines

## 1. Project Overview

This is the backend API for Testimonies.com, a platform for sharing testimonies of God's goodness. The backend is built with Node.js, Express, TypeScript, and MongoDB, providing RESTful APIs for web and mobile clients.

## 2. Technology Stack

### 2.1 Core Technologies
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with refresh mechanism
- **Real-time**: Socket.io for live features
- **File Storage**: Cloudinary/AWS S3
- **Background Jobs**: Agenda for scheduled tasks

### 2.2 Payment Integration
- **Stripe**: International payments
- **Paystack**: African market payments  
- **Flutterwave**: Multi-currency support

### 2.3 Communication Services
- **Email**: Nodemailer with multiple providers
- **SMS**: Twilio/Termii for verification
- **Translation**: Google Translate API
- **Transcription**: Speech-to-text services

## 3. Architecture Principles

### 3.1 Code Organization
```
src/
├── api/                    # API routes and controllers
│   ├── v1/
│   │   ├── routes/        # Route definitions
│   │   ├── controllers/   # Request handlers
│   │   └── middleware/    # Route-specific middleware
├── models/                # Mongoose models
├── services/              # Business logic services
├── utils/                 # Utility functions
├── config/                # Configuration files
├── middleware/            # Global middleware
├── jobs/                  # Background job definitions
├── types/                 # TypeScript type definitions
└── templates/             # Email/notification templates
```

### 3.2 Naming Conventions
- **Files**: kebab-case (e.g., `user-controller.ts`)
- **Directories**: kebab-case (e.g., `user-management/`)
- **Variables/Functions**: camelCase (e.g., `getUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Classes**: PascalCase (e.g., `UserService`)
- **Interfaces**: PascalCase with 'I' prefix (e.g., `IUserDocument`)

### 3.3 API Design Standards
- **RESTful URLs**: Use nouns, not verbs (e.g., `/api/v1/users`, not `/api/v1/getUsers`)
- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (remove)
- **Status Codes**: Use appropriate HTTP status codes
- **Response Format**: Consistent JSON response structure
- **Versioning**: API versioning in URL path (`/api/v1/`)

## 4. Development Guidelines

### 4.1 Code Quality Standards

#### 4.1.1 TypeScript Usage
- **Strict Mode**: Always use TypeScript strict mode
- **Type Definitions**: Define interfaces for all data structures
- **No Any**: Avoid `any` type, use proper typing
- **Null Safety**: Handle null/undefined cases explicitly
- **Generic Types**: Use generics for reusable components

#### 4.1.2 Error Handling
```typescript
// Use custom error classes
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Consistent error response format
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: any;
  };
}
```

#### 4.1.3 Async/Await Pattern
```typescript
// Always use async/await, avoid callbacks
async function getUserById(id: string): Promise<IUser | null> {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    logger.error('Error fetching user:', error);
    throw new DatabaseError('Failed to fetch user');
  }
}
```

### 4.2 Security Guidelines

#### 4.2.1 Input Validation
- **Sanitization**: Sanitize all user inputs
- **Validation**: Use Joi or similar for request validation
- **SQL Injection**: Use parameterized queries (Mongoose handles this)
- **XSS Prevention**: Escape HTML content
- **File Upload**: Validate file types and sizes

#### 4.2.2 Authentication & Authorization
```typescript
// JWT token structure
interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  accountType: 'personal' | 'organization';
  isVerified: boolean;
}

// Middleware for protected routes
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  // Implementation here
};
```

#### 4.2.3 Rate Limiting
- **Global Limits**: 1000 requests per 15 minutes per IP
- **Auth Endpoints**: 10 requests per 15 minutes per IP
- **File Upload**: 5 uploads per minute per user
- **API Key**: Required for all API access

### 4.3 Database Guidelines

#### 4.3.1 MongoDB Best Practices
- **Indexing**: Create indexes for frequently queried fields
- **Aggregation**: Use aggregation pipelines for complex queries
- **Pagination**: Implement cursor-based pagination for large datasets
- **Transactions**: Use transactions for multi-document operations
- **Schema Design**: Design schemas for read optimization

#### 4.3.2 Model Definitions
```typescript
// User model example
interface IUser extends Document {
  username: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
  accountType: 'personal' | 'organization';
  isVerified: boolean;
  profile: {
    displayName: string;
    bio?: string;
    profileImage?: string;
    coverImage?: string;
  };
  settings: {
    theme: 'light' | 'dark';
    privacy: 'public' | 'private';
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.4 API Response Standards

#### 4.4.1 Success Response Format
```typescript
interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### 4.4.2 Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    field?: string;
    details?: any;
  };
}
```

### 4.5 Testing Guidelines

#### 4.5.1 Test Structure
- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Test complete user workflows
- **Coverage**: Maintain 80%+ test coverage

#### 4.5.2 Test Naming Convention
```typescript
describe('UserController', () => {
  describe('POST /api/v1/users/register', () => {
    it('should create a new user with valid data', async () => {
      // Test implementation
    });
    
    it('should return validation error for invalid email', async () => {
      // Test implementation
    });
  });
});
```

## 5. Performance Guidelines

### 5.1 Database Optimization
- **Indexes**: Create compound indexes for multi-field queries
- **Aggregation**: Use aggregation pipelines instead of multiple queries
- **Projection**: Only select required fields in queries
- **Caching**: Implement Redis caching for frequently accessed data
- **Connection Pooling**: Use connection pooling for database connections

### 5.2 API Performance
- **Response Time**: Target < 200ms for standard API calls
- **Pagination**: Implement efficient pagination for large datasets
- **Compression**: Use gzip compression for responses
- **CDN**: Use CDN for static assets and file uploads
- **Monitoring**: Implement APM for performance monitoring

### 5.3 Memory Management
- **Streaming**: Use streams for large file operations
- **Garbage Collection**: Monitor and optimize garbage collection
- **Memory Leaks**: Regularly check for memory leaks
- **Resource Cleanup**: Properly close database connections and file handles

## 6. Logging and Monitoring

### 6.1 Logging Standards
```typescript
// Use structured logging
logger.info('User registered', {
  userId: user.id,
  email: user.email,
  accountType: user.accountType,
  timestamp: new Date().toISOString()
});

// Log levels: error, warn, info, debug
logger.error('Database connection failed', { error: error.message });
```

### 6.2 Monitoring Requirements
- **Health Checks**: Implement health check endpoints
- **Metrics**: Track key business and technical metrics
- **Alerts**: Set up alerts for critical issues
- **Performance**: Monitor API response times and database performance

## 7. Deployment Guidelines

### 7.1 Environment Configuration
- **Environment Variables**: Use environment variables for all configuration
- **Secrets Management**: Use secure secret management for sensitive data
- **Configuration Validation**: Validate all required environment variables on startup
- **Multiple Environments**: Support dev, staging, and production environments

### 7.2 Docker Configuration
```dockerfile
# Use multi-stage builds for optimization
FROM node:18-alpine AS builder
# Build stage

FROM node:18-alpine AS production
# Production stage with minimal dependencies
```

### 7.3 CI/CD Pipeline
- **Automated Testing**: Run all tests on every commit
- **Code Quality**: Run linting and type checking
- **Security Scanning**: Scan for security vulnerabilities
- **Deployment**: Automated deployment to staging and production

## 8. Documentation Standards

### 8.1 Code Documentation
- **JSDoc**: Use JSDoc comments for all public functions
- **README**: Maintain comprehensive README files
- **API Documentation**: Use Swagger/OpenAPI for API documentation
- **Architecture**: Document system architecture and design decisions

### 8.2 API Documentation
```typescript
/**
 * Register a new user account
 * @route POST /api/v1/users/register
 * @param {RegisterRequest} req.body - User registration data
 * @returns {Promise<RegisterResponse>} User registration response
 * @throws {ValidationError} When input data is invalid
 * @throws {ConflictError} When user already exists
 */
```

## 9. Specific Implementation Rules

### 9.1 Authentication Flow
1. **Registration**: Email/phone verification required
2. **Login**: Username/email + password with 2FA
3. **Token Management**: JWT with refresh token rotation
4. **Session Handling**: Stateless JWT-based sessions
5. **Password Security**: Bcrypt with minimum 12 rounds

### 9.2 File Upload Handling
1. **Validation**: Check file type, size, and content
2. **Storage**: Use cloud storage with CDN
3. **Processing**: Async processing for large files
4. **Security**: Scan files for malware
5. **Optimization**: Compress images and videos

### 9.3 Real-time Features
1. **WebSocket**: Use Socket.io for real-time communication
2. **Authentication**: Authenticate WebSocket connections
3. **Rooms**: Use rooms for targeted messaging
4. **Scaling**: Design for horizontal scaling
5. **Fallback**: Provide polling fallback for WebSocket failures

### 9.4 Background Jobs
1. **Queue Management**: Use Agenda for job scheduling
2. **Error Handling**: Implement retry logic with exponential backoff
3. **Monitoring**: Monitor job success/failure rates
4. **Cleanup**: Clean up completed jobs regularly
5. **Scaling**: Design jobs to be idempotent and scalable

## 10. Code Review Guidelines

### 10.1 Review Checklist
- [ ] Code follows TypeScript best practices
- [ ] Proper error handling implemented
- [ ] Security considerations addressed
- [ ] Performance implications considered
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No hardcoded values or secrets
- [ ] Consistent with existing codebase

### 10.2 Review Process
1. **Self Review**: Author reviews own code before submission
2. **Peer Review**: At least one peer review required
3. **Testing**: All tests must pass
4. **Documentation**: Update relevant documentation
5. **Deployment**: Follow deployment checklist

## 11. Emergency Procedures

### 11.1 Incident Response
1. **Detection**: Monitor alerts and user reports
2. **Assessment**: Quickly assess impact and severity
3. **Communication**: Notify stakeholders and users
4. **Resolution**: Implement fix or rollback
5. **Post-mortem**: Conduct post-incident review

### 11.2 Rollback Procedures
1. **Database Migrations**: Ensure all migrations are reversible
2. **Feature Flags**: Use feature flags for risky deployments
3. **Blue-Green Deployment**: Maintain ability to quickly switch versions
4. **Backup Strategy**: Regular automated backups with tested restore procedures

## 12. Compliance Requirements

### 12.1 Data Protection
- **GDPR**: Implement right to deletion and data portability
- **Data Minimization**: Only collect necessary data
- **Consent Management**: Track and manage user consent
- **Data Retention**: Implement data retention policies
- **Audit Trail**: Maintain audit logs for data access

### 12.2 Security Compliance
- **Encryption**: Encrypt sensitive data at rest and in transit
- **Access Control**: Implement role-based access control
- **Vulnerability Management**: Regular security assessments
- **Incident Reporting**: Procedures for security incident reporting
- **Compliance Audits**: Regular compliance audits and reviews