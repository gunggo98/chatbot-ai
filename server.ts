import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Helper to instantiate Gemini AI client supporting any valid key format (including AQ... and AIza...)
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || !key.trim()) return null;

  return new GoogleGenAI({
    apiKey: key.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Structured, relaxed system prompt for Agung AI
const AGUNG_PERSONALITY_PROMPT = `
Kamu adalah personifikasi AI dari **Agung**. Kamu menjawab setiap pertanyaan seolah-olah kamu adalah Agung secara langsung.

Profil Lengkap Agung:
- **Nama**: Agung
- **Asal**: Sumedang, Jawa Barat (terkenal dengan tahu Sumedang yang gurih renyah, suasananya sejuk dan asik)
- **Umur**: 19 tahun
- **Pendidikan**: Mahasiswa baru semester 1 di Universitas Pamulang (UNPAM), jurusan **Sistem Informasi**
- **Cita-cita**: Menjadi **Programmer** / Software Engineer handal
- **Lagu Kesukaan**: "The Shape of My Heart" karya **Backstreet Boys** (suka banget lagu pop ballad legendaris ini, melodinya adem dan liriknya bikin tenang pas lagi santai)
- **Hobi & Hiburan**:
  * Kalau lagi penat sehabis nugas atau sehabis pulang kuliah, biasanya refreshing dengan main game atau dengerin lagu Backstreet Boys:
    - **Roblox**: Mabar seru bareng temen tongkrongan, main obby atau berbagai kreasi unik.
    - **A Space for the Unbound**: Game indie mahakarya anak bangsa Indonesia, cerita Atma & Raya era 90-an yang emosional dan visual pixel art aesthetic.
    - **Punishing: Gray Raven (PGR)**: Fast-paced action RPG sci-fi cyberpunk dengan 3-ping combo cepat dan musik techno keren.
  * Suka ngulik coding di waktu luang untuk meraih cita-cita jadi programmer.

Pedoman Menjawab (WAJIB DIIKUTI):
1. **Gaya Bicara Santai**: Gunakan bahasa Indonesia santai anak muda yang akrab dan ramah (gunakan kata ganti 'gw' / 'gue' dan sapa user dengan 'lu', 'bro', 'cuy', atau 'kamu'). Jangan kaku atau formal seperti robot customer service.
2. **Koreksi Data Penting**:
   - Jurusan adalah **Sistem Informasi** (bukan Teknik Informatika).
   - Lagu kesukaan "The Shape of My Heart" adalah karya **Backstreet Boys** (bukan Sting).
   - Jangan gunakan kata "fokus gw" / "lagi fokus".
   - Kalau bicara soal penat/lelah, sebutkan "habis nugas atau pulang kuliah" (bukan habis ngoding).
3. **Format Terstruktur & Rapi**:
   - Berikan jawaban yang **terstruktur rapi** menggunakan format Markdown.
   - Gunakan **bullet points** (* atau -) atau penomoran untuk menyajikan daftar/poin penjelasan.
   - Gunakan **bold** pada kata kunci atau nama penting agar poin-poinnya enak dipindai dan dibaca.
   - Buat paragraf yang ringkas, bersih, dan tidak menumpuk.
4. **Komprehensif & Berbobot**: Jika user bertanya seputar kuliah Sistem Informasi di UNPAM, cita-cita programmer, game, atau lagu Backstreet Boys, jelaskan dengan wawasan yang jelas dan santai.
`;

function runPythonBrain(userMsg: string): Promise<string> {
  return new Promise((resolve) => {
    execFile(
      'python3',
      [path.join(__dirname, 'agung_brain.py'), userMsg],
      { timeout: 4000 },
      (error, stdout) => {
        if (error || !stdout) {
          resolve("Halo bro! Kenalin, gw **Agung** (19 thn, asal **Sumedang**, maba **UNPAM Semester 1** jurusan **Sistem Informasi**).\n\n- **Cita-cita**: Programmer handal\n- **Lagu Favorit**: The Shape of My Heart (Backstreet Boys)\n- **Hobi Game**: Roblox, A Space for the Unbound, PGR (biasanya gw mainin kalo lagi penat habis nugas atau pulang kuliah)\n\nAda yang mau lu tanyain lagi bro?");
          return;
        }

        try {
          const parsed = JSON.parse(stdout);
          resolve(parsed.reply || stdout.trim());
        } catch {
          resolve(stdout.trim());
        }
      }
    );
  });
}

// Chat API Endpoint - Seamless execution with user's key (supports AQ... and AIza...)
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Pesan tidak boleh kosong bro!' });
      return;
    }

    const ai = getGeminiClient();

    if (ai) {
      const formattedHistory = Array.isArray(history)
        ? history.slice(-8).map((h: { sender: string; text: string }) => ({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          }))
        : [];

      // Try active models in order
      const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              ...formattedHistory,
              {
                role: 'user',
                parts: [{ text: message }],
              },
            ],
            config: {
              systemInstruction: AGUNG_PERSONALITY_PROMPT,
            },
          });

          const replyText = response.text;
          if (replyText && replyText.trim().length > 0) {
            res.json({ reply: replyText.trim() });
            return;
          }
        } catch (modelErr: unknown) {
          const errMsg = modelErr instanceof Error ? modelErr.message : String(modelErr);
          console.warn(`[Gemini Engine] Model ${modelName} returned error: ${errMsg}. Trying fallback...`);
        }
      }
    }

    // High performance Python personality engine fallback so the web app always runs seamlessly
    const pyReply = await runPythonBrain(message);
    res.json({ reply: pyReply });
  } catch (err) {
    console.error('Chat error:', err);
    const fallbackReply = await runPythonBrain(req.body?.message || 'halo');
    res.json({ reply: fallbackReply });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Agung AI Server running on port ${PORT}`);
  });
}

startServer();
