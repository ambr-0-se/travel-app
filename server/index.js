import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory path (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory (.env.local in root)
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini client with API key from environment
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});

if (!process.env.GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in environment variables');
  console.error('Please create a .env.local file with: GEMINI_API_KEY=your_key_here');
  process.exit(1);
}

// Helper function to compute context summary
const computeContextSummary = (itinerary) => {
  const today = new Date().toISOString().split('T')[0];
  const todaySchedule = itinerary.find(day => day.date === today);
  
  if (!todaySchedule) {
    return "No activities scheduled for today.";
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  const done = [];
  const upcoming = [];

  todaySchedule.items.forEach(item => {
    const [hours, minutes] = item.time.split(':').map(Number);
    const itemTimeMinutes = hours * 60 + minutes;
    
    if (itemTimeMinutes < currentTimeMinutes) {
      done.push(item);
    } else {
      upcoming.push(item);
    }
  });

  const nextUp = upcoming.length > 0 ? upcoming[0] : null;

  let summary = `Today: ${todaySchedule.title}. `;
  summary += `Completed: ${done.length} activities (${done.map(d => d.title).join(', ') || 'none'}). `;
  summary += `Upcoming: ${upcoming.length} activities. `;
  if (nextUp) {
    summary += `Next up: ${nextUp.time} - ${nextUp.title} at ${nextUp.location}.`;
  }

  return summary;
};

// Rate limiting (simple in-memory store)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP

const rateLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  const limit = rateLimitMap.get(ip);
  
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }

  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ 
      error: 'Too many requests. Please wait a moment before trying again.' 
    });
  }

  limit.count++;
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chat endpoint
app.post('/api/chat', rateLimit, async (req, res) => {
  try {
    const { prompt, history = [], itinerary = [], location = null } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required and must be a string' });
    }

    if (prompt.length > 1000) {
      return res.status(400).json({ error: 'Prompt is too long (max 1000 characters)' });
    }

    const contextSummary = computeContextSummary(itinerary);
    
    const systemInstruction = `
      You are the "Dubai-Oman Family Explorer" Assistant. 
      
      CURRENT CONTEXT: ${contextSummary}

      CURRENT LOCATION (if available): ${location ? `${location.lat}, ${location.lng}${location.accuracy ? ` (±${Math.round(location.accuracy)}m)` : ''}` : 'Not provided'}
      
      FULL ITINERARY: ${JSON.stringify(itinerary)}
      
      Your role is to:
      1. Answer questions about the schedule, using the CURRENT CONTEXT to know what's been done and what's coming next.
      2. Suggest nearby restaurants or activities for gaps in the schedule.
      3. Provide historical or cultural context for the locations being visited.
      4. NEVER hallucinate or change the fixed flight or mass timings.
      5. Be helpful, family-oriented, and encouraging.
      6. If asked about "nearby" spots and CURRENT LOCATION is provided, tailor suggestions to that area (approximate, no web browsing).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response. Please try again.' 
    });
  }
});

// Text-to-Speech endpoint
app.post('/api/tts', rateLimit, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }

    if (text.length > 5000) {
      return res.status(400).json({ error: 'Text is too long (max 5000 characters)' });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this travel description clearly and warmly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio data returned' });
    }

    res.json({ audio: base64Audio });
  } catch (error) {
    console.error('TTS API error:', error);
    res.status(500).json({ 
      error: 'Failed to generate audio. Please try again.' 
    });
  }
});

// Start server with error handling for port conflicts
const startServer = async (port) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`🚀 Backend server running on http://localhost:${port}`);
      console.log(`📡 API endpoints:`);
      console.log(`   POST /api/chat - Chat with AI assistant`);
      console.log(`   POST /api/tts - Generate text-to-speech`);
      console.log(`   GET  /health - Health check`);
      resolve(server);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  Port ${port} is in use, trying ${port + 1}...`);
        reject(err);
      } else {
        reject(err);
      }
    });
  });
};

// Try to start on PORT, or try next available port
(async () => {
  let currentPort = PORT;
  let maxAttempts = 5;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      await startServer(currentPort);
      break;
    } catch (err) {
      if (err.code === 'EADDRINUSE' && attempt < maxAttempts - 1) {
        currentPort++;
        attempt++;
      } else {
        console.error(`❌ Failed to start server:`, err.message);
        process.exit(1);
      }
    }
  }
})();

