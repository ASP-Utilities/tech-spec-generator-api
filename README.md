# Tech Spec Generator API

Backend API service for the Tech Spec Generator application. Handles chat history storage with PostgreSQL database persistence and Google Cloud Platform integration.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cloud**: Google Cloud Platform (Cloud SQL, Secret Manager)
- **Development**: tsx (for hot reloading)

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (for local development)
- Google Cloud SDK (for production deployment)

## 🛠️ Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Local PostgreSQL Database

Make sure PostgreSQL is installed and running locally. Create the database:

```sql
-- Using psql or your preferred PostgreSQL client
CREATE DATABASE tech_spec_gen;
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
Copy-Item .env.example .env
```

Edit `.env` with your local database credentials:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/tech_spec_gen

# Google Cloud Platform (optional for local dev)
GCP_PROJECT_ID=your-gcp-project-id
```

### 4. Run Database Migrations

Initialize the database schema using Prisma:

```bash
npx prisma migrate dev
```

This will:
- Create the `chat_sessions` table
- Generate the Prisma Client
- Apply all migrations

### 5. Run the Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### 6. Test the API

Check if the server is running and database is connected:

```bash
curl http://localhost:3001/api/health
```

You should see a response with `database.connected: true`.

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Returns server health status, database connection status, and session count.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "database": {
    "connected": true,
    "sessionCount": 5
  },
  "environment": "development"
}
```

### Save Chat Session
```
POST /api/chat/save
Content-Type: application/json

{
  "sessionId": "chat-123",
  "messages": [
    {
      "role": "user",
      "content": "Hello"
    },
    {
      "role": "model",
      "content": "Hi there!"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Get Chat Session
```
GET /api/chat/:sessionId
```
Retrieves a specific chat session by ID.

### Get All Chat Sessions
```
GET /api/chat
```
Retrieves all stored chat sessions (ordered by most recent).

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run type-check` - Run TypeScript type checking

### Prisma Commands

- `npx prisma migrate dev` - Create and apply new migration
- `npx prisma migrate deploy` - Apply migrations in production
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma generate` - Regenerate Prisma Client

### Project Structure

```
tech-spec-generator-api/
├── src/
│   ├── index.ts                 # Server entry point
│   ├── config/
│   │   └── database.ts          # Database configuration
│   ├── routes/
│   │   └── index.ts             # API routes
│   ├── controllers/
│   │   └── chat.controller.ts   # Request handlers
│   ├── services/
│   │   ├── storage.service.ts   # Database storage logic
│   │   └── secrets.service.ts   # Google Secret Manager
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   └── middleware/
│       └── index.ts             # Express middleware
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Database migrations
├── keys/                        # GCP service account keys (gitignored)
├── dist/                        # Build output
├── package.json
├── tsconfig.json
└── .env                         # Environment variables (gitignored)
```

## 🔗 Frontend Integration

Update your frontend's `backendService.ts` to point to this API:

```typescript
const response = await fetch('http://localhost:3001/api/chat/save', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(chatSession),
});
```

## 📦 Database Schema

The application uses a PostgreSQL database with the following schema:

### ChatSession Table

| Column    | Type     | Description                          |
|-----------|----------|--------------------------------------|
| id        | UUID     | Primary key (auto-generated)         |
| sessionId | String   | Unique session identifier            |
| messages  | JSON     | Array of chat messages               |
| timestamp | DateTime | Session creation time                |
| metadata  | JSON     | Optional session metadata (nullable) |
| createdAt | DateTime | Record creation time (auto)          |
| updatedAt | DateTime | Record update time (auto)            |

## ☁️ Google Cloud Platform Deployment

### Prerequisites

1. **Create a GCP Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Set Up Cloud SQL PostgreSQL**
   - Navigate to Cloud SQL in GCP Console
   - Create a new PostgreSQL instance
   - Note the connection name (format: `project:region:instance`)
   - Create a database named `tech_spec_gen`

3. **Create Service Account for Local Development**
   - Go to IAM & Admin > Service Accounts
   - Create new service account (e.g., `tech-spec-generator-dev`)
   - Grant roles:
     - `Cloud SQL Client`
     - `Secret Manager Secret Accessor`
   - Create and download JSON key
   - Save to `keys/service-account.json` (gitignored)

4. **Store Database Credentials in Secret Manager**
   ```bash
   # Enable Secret Manager API
   gcloud services enable secretmanager.googleapis.com
   
   # Create secret for DATABASE_URL
   echo -n "postgresql://user:password@/tech_spec_gen?host=/cloudsql/PROJECT:REGION:INSTANCE" | \
     gcloud secrets create DATABASE_URL --data-file=-
   ```

### Local Development with GCP Services

Update your `.env` file:

```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/tech_spec_gen
GCP_PROJECT_ID=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=./keys/service-account.json
```

### Production Deployment (Cloud Run)

1. **Build and push Docker image** (or use Cloud Build)

2. **Deploy to Cloud Run** with environment variables:

```bash
gcloud run deploy tech-spec-generator-api \
  --image gcr.io/your-project/tech-spec-generator-api \
  --platform managed \
  --region us-central1 \
  --add-cloudsql-instances PROJECT:REGION:INSTANCE \
  --set-env-vars NODE_ENV=production \
  --set-env-vars CLOUD_SQL_CONNECTION_NAME=PROJECT:REGION:INSTANCE \
  --set-env-vars GCP_PROJECT_ID=your-project-id \
  --set-secrets DATABASE_URL=DATABASE_URL:latest \
  --allow-unauthenticated
```

3. **Run database migrations** in production:

```bash
# From your local machine with gcloud configured
gcloud run jobs create migrate-db \
  --image gcr.io/your-project/tech-spec-generator-api \
  --command "npx" \
  --args "prisma,migrate,deploy" \
  --set-env-vars NODE_ENV=production \
  --set-secrets DATABASE_URL=DATABASE_URL:latest

gcloud run jobs execute migrate-db
```

### Environment Variables for Production

Set these in Cloud Run:

| Variable                   | Description                              | Example                              |
|----------------------------|------------------------------------------|--------------------------------------|
| `NODE_ENV`                 | Environment name                         | `production`                         |
| `PORT`                     | Server port (Cloud Run sets this)        | `8080`                               |
| `FRONTEND_URL`             | Your frontend URL                        | `https://your-frontend.app`          |
| `GCP_PROJECT_ID`           | Google Cloud project ID                  | `my-project-12345`                   |
| `CLOUD_SQL_CONNECTION_NAME`| Cloud SQL instance connection name       | `project:us-central1:db-instance`    |
| `DATABASE_URL`             | PostgreSQL connection string (from Secret Manager) | (stored in Secret Manager) |

**Note:** In production, `GOOGLE_APPLICATION_CREDENTIALS` is NOT needed - Cloud Run uses Workload Identity automatically.

## 🔒 Security

- ✅ CORS configured for frontend origin
- ✅ Helmet.js for security headers
- ✅ Request validation
- ✅ Error handling
- ✅ Database connection pooling via Prisma
- ✅ Secret management via Google Secret Manager (production)
- ✅ Service account key files excluded from git

### Security Best Practices

1. **Never commit `.env` or `keys/` directory**
2. **Use Secret Manager for production credentials**
3. **Rotate service account keys regularly**
4. **Use least-privilege IAM roles**
5. **Enable Cloud SQL SSL connections**
6. **Set up VPC for Cloud SQL in production**

## 🧪 Testing Database Connection

Test your local database connection:

```bash
# Using Prisma
npx prisma studio

# Or test the API health endpoint
curl http://localhost:3001/api/health
```

## 🐛 Troubleshooting

### Database Connection Failed

- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists: `CREATE DATABASE tech_spec_gen;`
- Check PostgreSQL logs for connection errors

### Prisma Migration Errors

- Reset database: `npx prisma migrate reset`
- Check schema.prisma syntax
- Ensure DATABASE_URL is correct

### GCP Authentication Issues

- Verify service account key file exists at specified path
- Check service account has correct IAM roles
- Ensure Secret Manager API is enabled

## 📝 License

MIT

## 🤝 Contributing

Feel free to submit issues and pull requests!

