# Tech Spec Generator API

Backend API service for the Tech Spec Generator application. Handles chat history storage and analysis.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Development**: tsx (for hot reloading)

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
Copy-Item .env.example .env
```

Edit `.env` and configure your settings:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Run the Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### 4. Test the API

Check if the server is running:

```bash
curl http://localhost:3001/api/health
```

Or visit `http://localhost:3001/api/health` in your browser.

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Returns server health status and session count.

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
Retrieves all stored chat sessions.

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run type-check` - Run TypeScript type checking

### Project Structure

```
tech-spec-generator-api/
├── src/
│   ├── index.ts                 # Server entry point
│   ├── routes/
│   │   └── index.ts             # API routes
│   ├── controllers/
│   │   └── chat.controller.ts   # Request handlers
│   ├── services/
│   │   └── storage.service.ts   # Storage logic
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   └── middleware/
│       └── index.ts             # Express middleware
├── dist/                        # Build output
├── package.json
├── tsconfig.json
└── .env
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

## 📦 Storage

Currently using **in-memory storage** for chat sessions. This means:
- ✅ Fast and simple
- ⚠️ Data is lost when server restarts

### Upgrading to Persistent Storage

To add database storage:

1. **Install a database client** (e.g., Prisma, MongoDB):
   ```bash
   npm install @prisma/client
   ```

2. **Update `storage.service.ts`** to use database instead of `Map`

3. **Add database URL** to `.env`:
   ```env
   DATABASE_URL=your_database_connection_string
   ```

## 🚢 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deployment Platforms

This API can be deployed to:
- **Railway** (recommended for Node.js)
- **Render**
- **Heroku**
- **AWS EC2/ECS**
- **DigitalOcean App Platform**

### Environment Variables for Production

Make sure to set these in your hosting platform:
- `NODE_ENV=production`
- `PORT=3001` (or whatever your host uses)
- `FRONTEND_URL=https://your-frontend-domain.com`

## 🔒 Security

- ✅ CORS configured for frontend origin
- ✅ Helmet.js for security headers
- ✅ Request validation
- ✅ Error handling

### Future Enhancements

- [ ] Add authentication (JWT tokens)
- [ ] Rate limiting
- [ ] Request body size limits
- [ ] API key authentication
- [ ] Database persistence

## 📝 License

MIT

## 🤝 Contributing

Feel free to submit issues and pull requests!

