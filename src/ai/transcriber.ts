import fs from 'fs';
import path from 'path';
import os from 'os';
import Groq from 'groq-sdk';
import { config } from '../config.js';
import { bot } from '../bot/telegram.js';

const groq = new Groq({ apiKey: config.GROQ_API_KEY });

export async function transcribeTelegramVoice(fileId: string): Promise<string> {
    try {
        const fileInfo = await bot.api.getFile(fileId);
        if (!fileInfo.file_path) {
            throw new Error("Telegram no devolvió la ruta del archivo");
        }

        const url = `https://api.telegram.org/file/bot${config.TELEGRAM_BOT_TOKEN}/${fileInfo.file_path}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error descargando audio de Telegram: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Lo guardamos en el directorio de archivos temporales del SO
        const tempFilePath = path.join(os.tmpdir(), `voice_${fileId}.ogg`);
        fs.writeFileSync(tempFilePath, buffer);

        try {
            // "whisper-large-v3-turbo" es super rápido e ideal para audios
            const transcription: any = await groq.audio.transcriptions.create({
                file: fs.createReadStream(tempFilePath),
                model: "whisper-large-v3-turbo",
                response_format: "verbose_json", // Groq Whisper devuelve el texto
                language: "es" // Forzamos español por rapidez o podríamos quitarlo para que auto-detecte
            });

            return transcription.text || "No se pudo transcribir";
        } finally {
            // Clean up: Borrar el audio para no inundar el disco del servidor (Render)
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        }
    } catch (err: any) {
        console.error("[Transcriber] Error:", err.message);
        throw err;
    }
}
