import Groq from 'groq-sdk';
import { config } from '../config.js';
import { ChatMessage } from '../db/memory.js';
import { availableTools } from '../tools/index.js';

const groq = new Groq({ apiKey: config.GROQ_API_KEY });

// Using OpenRouter via standard fetch if needed
async function openRouterCompletion(messages: ChatMessage[], tools: any[]) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://github.com/opengravity',
            'X-Title': 'OpenGravity',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: config.OPENROUTER_MODEL,
            messages,
            tools: tools.length > 0 ? tools : undefined
        })
    });

    if (!response.ok) {
        throw new Error(`OpenRouter Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message;
}

export async function getAICompletion(messages: ChatMessage[]) {
    try {
        console.log('[AI] Solicitando respuesta a Groq...');
        const response = await groq.chat.completions.create({
            messages: messages as any,
            model: "llama-3.3-70b-versatile",
            tools: availableTools as any,
            tool_choice: "auto",
        });

        return response.choices[0].message;
    } catch (error) {
        console.log('[AI] Falla en Groq. Intentando OpenRouter...');
        if (config.OPENROUTER_API_KEY && config.OPENROUTER_API_KEY !== 'SUTITUYE POR EL TUYO') {
            return await openRouterCompletion(messages, availableTools);
        } else {
            console.error('[AI] OpenRouter no configurado o falló.', error);
            throw error;
        }
    }
}
