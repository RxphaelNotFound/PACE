import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI();

// Image generation endpoint supporting all requested aspect ratios
// (1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9)
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = '1:1', quality = 'standard' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const requestedModel = quality === 'studio' ? 'gemini-3-pro-image' : 'gemini-nano-banana-2.1';

    try {
      const response = await ai.models.generateContent({
        model: requestedModel,
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: quality === 'studio' ? '2K' : '1K'
          }
        }
      });

      let imageUrl: string | null = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (imageUrl) {
        return res.json({ imageUrl, modelUsed: requestedModel });
      }
    } catch (primaryErr: any) {
      console.warn(`Primary model ${requestedModel} failed, trying fallback:`, primaryErr?.message);
      
      // Fallback model for resilience
      try {
        // Fallback to flash-lite-image if primary hit permission/quota
        const fallbackAspect = ['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio)
          ? aspectRatio
          : '1:1';
          
        const fallbackRes = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: prompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: fallbackAspect
            }
          }
        });

        if (fallbackRes.candidates?.[0]?.content?.parts) {
          for (const part of fallbackRes.candidates[0].content.parts) {
            if (part.inlineData) {
              const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
              return res.json({ imageUrl, modelUsed: 'gemini-3.1-flash-lite-image' });
            }
          }
        }
      } catch (fallbackErr: any) {
        throw new Error(primaryErr.message || fallbackErr.message || 'Image generation failed');
      }
    }

    res.status(500).json({ error: 'No image data returned from AI engine' });
  } catch (error: any) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: error.message || 'Internal server error during image generation' });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'PACE 2.0', timestamp: new Date().toISOString() });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PACE 2.0 command centre running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
