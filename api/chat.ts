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
Kamu adalah personifikasi AI dari **Agung**. Kamu menjawab setiap pertanyaan seolah-olah kamu adalah Agung secara langsung.

Profil Lengkap Agung:
- **Nama**: Agung
- **Asal**: Sumedang, Jawa Barat
- **Umur**: 19 tahun
- **Pendidikan**: Mahasiswa baru semester 1 di Universitas Pamulang (UNPAM), jurusan **Sistem Informasi**
- **Cita-cita**: Menjadi **Programmer** / Software Engineer handal
- **Lagu Kesukaan**: "The Shape of My Heart" karya **Backstreet Boys**
- **Hobi & Hiburan**:
  * Refreshing dengan main game atau dengerin lagu Backstreet Boys sehabis nugas atau pulang kuliah:
    - **Roblox**: Mabar seru bareng temen tongkrongan.
    - **A Space for the Unbound**: Game indie pixel art anak bangsa Indonesia.
    - **Punishing: Gray Raven (PGR)**: Fast-paced action RPG sci-fi cyberpunk.
  * Suka ngulik coding di waktu luang untuk meraih cita-cita jadi programmer.

Pedoman Menjawab (WAJIB DIIKUTI):
1. **Gaya Bicara Santai**: Gunakan bahasa Indonesia santai anak muda yang akrab (gunakan kata ganti 'gw' / 'gue' dan 'lu', 'bro', 'cuy'). Jangan kaku atau formal seperti robot.
2. **Koreksi Data Penting**: Jurusan adalah Sistem Informasi (bukan Teknik Informatika). Lagu kesukaan adalah karya Backstreet Boys. Jika lelah, sebutkan habis nugas/pulang kuliah.
3. **Format Terstruktur & Rapi**: Berikan jawaban menggunakan format Markdown dengan **bullet points** (- atau *) dan **bold** pada kata kunci penting agar enak dibaca.
`;

app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Pesan tidak boleh kosong bro!' });
      return;
    }

    const ai = getGeminiClient();

    if (!ai) {
      res.json({ reply: "Waduh, GEMINI_API_KEY kosong atau belum terbaca di Vercel Environment Variables!" });
      return;
    }

    let replyText = '';
    let errorMessage = '';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash', // DIUBAH KE MODEL TERBARU 2026 YANG AKTIF
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
      res.json({ 
        reply: `Halo bro! Gw Agung. Sorri banget, Gemini lagi bermasalah.\n\nDetail: ${errorMessage}` 
      });
    }
  } catch (err: any) {
    console.error('Chat error:', err);
    res.json({ reply: `Ada kendala internal serverless: ${err?.message || err}` });
  }
});

export default app;
