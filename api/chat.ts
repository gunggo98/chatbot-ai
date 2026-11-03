import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || !key.trim()) return null;

  // Inisialisasi standar yang direkomendasikan SDK resmi Google @google/genai
  return new GoogleGenAI({
    apiKey: key.trim()
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

// Endpoint Handler Utama untuk Vercel Serverless
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Pesan tidak boleh kosong bro!' });
      return;
    }

    const ai = getGeminiClient();

    if (!ai) {
      res.status(500).json({ error: 'API Key Gemini belum diset di Vercel!' });
      return;
    }

    const formattedHistory = Array.isArray(history)
      ? history.slice(-8).map((h: { sender: string; text: string }) => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        }))
      : [];

    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite'];
    let replyText = '';
    const errors: string[] = [];

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            ...formattedHistory,
            { role: 'user', parts: [{ text: message }] },
          ],
          config: { systemInstruction: AGUNG_PERSONALITY_PROMPT },
        });

        if (response.text && response.text.trim().length > 0) {
          replyText = response.text.trim();
          break;
        }
        errors.push(`[${model}] respons kosong`);
      } catch (modelErr: any) {
        const msg = `[${model}] ${modelErr?.status ?? ''} ${String(modelErr?.message || modelErr).slice(0, 150)}`;
        errors.push(msg);
        console.error('[Gemini Engine Error]:', msg);
      }
    }

    if (replyText) {
      res.json({ reply: replyText });
    } else {
      // DEBUG SEMENTARA: tampilkan error asli. Hapus bagian "Detail" setelah masalah ketemu.
      res.json({
        reply: `Halo bro! Gw Agung. Sorri banget, Gemini lagi bermasalah.\n\nDetail:\n${errors.join('\n')}`,
      });
    }
  } catch (err) {
    console.error('Chat error:', err);
    res.json({ reply: "Waduh bro, backend sistem gw lagi ada kendala runtime nih. Coba tes chat lagi ya!" });
  }
});

export default app;