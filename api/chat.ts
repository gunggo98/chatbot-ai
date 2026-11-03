import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || !key.trim()) return null;

  return new GoogleGenAI({
    apiKey: key.trim(),
  });
}

const AGUNG_PERSONALITY_PROMPT = `
Kamu adalah personifikasi AI dari Agung. Jawab setiap pertanyaan seolah-olah kamu adalah Agung secara langsung.
Profil:
- Nama: Agung
- Asal: Sumedang, Jawa Barat
- Umur: 19 tahun
- Pendidikan: Mahasiswa baru semester 1 di Universitas Pamulang (UNPAM), jurusan Sistem Informasi
- Cita-cita: Menjadi Programmer / Software Engineer handal
- Lagu Kesukaan: "The Shape of My Heart" karya Backstreet Boys
- Hobi: Main Roblox mabar bareng temen, main game indie "A Space for the Unbound", dan main "Punishing: Gray Raven" (PGR) sehabis nugas atau pulang kuliah. Suka ngulik coding di waktu luang.

Pedoman:
1. Gunakan bahasa Indonesia santai anak muda akrab (gue/gw dan lu/bro/cuy). Jangan kaku atau formal seperti robot.
2. Jawab secara terstruktur rapi memakai format Markdown (bullet points dan bold pada kata kunci).
`;

app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Pesan tidak boleh kosong bro!' });
      return;
    }

    const ai = getGeminiClient();

    if (!ai) {
      res.json({ reply: "Waduh, GEMINI_API_KEY kosong atau belum terbaca di Vercel!" });
      return;
    }

    let replyText = '';
    let errorMessage = '';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite', // Wajib pakai model ini sesuai perintah terbaru Google
        contents: [
          {
            role: 'user',
            parts: [{ text: `${AGUNG_PERSONALITY_PROMPT}\n\nUser bertanya: ${message}` }],
          },
        ],
      });

      if (response.text && response.text.trim().length > 0) {
        replyText = response.text.trim();
      }
    } catch (modelErr: any) {
      errorMessage = modelErr?.message || String(modelErr);
      console.error("[Gemini Engine Error]:", errorMessage);
    }

    if (replyText) {
      res.json({ reply: replyText });
    } else {
      // Jika Google sibuk, berikan pesan fallback yang ramah (bukan teks error mentah yang bikin pusing)
      if (errorMessage.includes("503") || errorMessage.includes("demand")) {
        res.json({ reply: "Sorri banget bro, server Google Gemini di jalur gratisan lagi antre parah (High Demand). Coba kirim ulang pesan lu barusan atau tunggu 1 menit lagi ya!" });
      } else {
        res.json({ reply: `Halo bro! Gw Agung. Sorri banget Gemini lagi ada kendala.\n\nDetail: ${errorMessage}` });
      }
    }
  } catch (err: any) {
    console.error('Chat error:', err);
    res.json({ reply: `Ada kendala internal serverless: ${err?.message || err}` });
  }
});

export default app;
