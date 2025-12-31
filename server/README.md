# Backend Server

This backend server handles all Gemini API calls securely, keeping the API key on the server side instead of exposing it in the client bundle.

## Setup

1. **Install dependencies**:
   ```bash
   npm run server:install
   # or
   cd server && npm install
   ```

2. **Configure environment variables**:
   Create a `.env.local` file in the **root directory** (not in server/) with:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

   The server will automatically load this file.

3. **Start the server**:
   ```bash
   npm run server:dev    # Development mode with auto-reload
   # or
   npm run server:start  # Production mode
   ```

   The server will run on `http://localhost:3001` by default.

## API Endpoints

### POST `/api/chat`
Chat with the AI assistant.

**Request Body**:
```json
{
  "prompt": "What's next on my schedule?",
  "history": [
    { "role": "user", "parts": [{ "text": "Hello" }] },
    { "role": "model", "parts": [{ "text": "Hi there!" }] }
  ],
  "itinerary": [...],
  "location": { "lat": 25.2048, "lng": 55.2708, "accuracy": 10 }
}
```

**Response**:
```json
{
  "text": "Based on your schedule..."
}
```

### POST `/api/tts`
Generate text-to-speech audio.

**Request Body**:
```json
{
  "text": "Welcome to Dubai!"
}
```

**Response**:
```json
{
  "audio": "base64_encoded_audio_data"
}
```

### GET `/health`
Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX..."
}
```

## Security Features

- ✅ API key stored securely on server (never exposed to client)
- ✅ Rate limiting (10 requests per minute per IP)
- ✅ Input validation and length limits
- ✅ CORS enabled for frontend
- ✅ Error handling with generic error messages

## Development

To run both frontend and backend together:

```bash
npm run dev:full
```

This starts:
- Frontend dev server on `http://localhost:3000`
- Backend server on `http://localhost:3001`

## Production Deployment

When deploying to production:

1. Set the `GEMINI_API_KEY` environment variable on your hosting platform
2. Update `VITE_API_URL` in your frontend build to point to your backend URL
3. Deploy the backend server separately (e.g., Railway, Render, Fly.io)
4. Deploy the frontend (Vercel, Netlify, etc.)

### Example: Vercel + Railway

**Backend (Railway)**:
- Set `GEMINI_API_KEY` in Railway environment variables
- Deploy server directory
- Get backend URL: `https://your-backend.railway.app`

**Frontend (Vercel)**:
- Set `VITE_API_URL=https://your-backend.railway.app` in Vercel environment variables
- Deploy frontend

## Troubleshooting

**Error: GEMINI_API_KEY is not set**
- Make sure `.env.local` exists in the root directory (not server/)
- Check that the file contains: `GEMINI_API_KEY=your_key_here`

**CORS errors**
- Make sure the backend is running
- Check that `VITE_API_URL` matches your backend URL

**Rate limit errors**
- Wait 1 minute before making another request
- The limit is 10 requests per minute per IP address

