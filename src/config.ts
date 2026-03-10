import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env file
dotenv.config({ path: resolve(process.cwd(), '.env') });

export const config = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    TELEGRAM_ALLOWED_USER_IDS: (process.env.TELEGRAM_ALLOWED_USER_IDS || '').split(',').map(id => id.trim()),
    GROQ_API_KEY: process.env.GROQ_API_KEY || '',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'openrouter/free',
    DB_PATH: process.env.DB_PATH || './memory.db',
};

export function validateConfig() {
    const missing: string[] = [];
    if (!config.TELEGRAM_BOT_TOKEN || config.TELEGRAM_BOT_TOKEN === 'SUTITUYE POR EL TUYO') missing.push('TELEGRAM_BOT_TOKEN');
    if (!config.GROQ_API_KEY || config.GROQ_API_KEY === 'SUTITUYE POR EL TUYO') missing.push('GROQ_API_KEY');

    if (missing.length > 0) {
        console.warn(`[Config] Faltan variables de entorno importantes o siguen en su valor por defecto: ${missing.join(', ')}`);
    }
}
