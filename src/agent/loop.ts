import { saveMessage, getHistory } from '../db/memory.js';
import { getAICompletion } from '../ai/provider.js';
import { executeTool } from '../tools/index.js';

const SYSTEM_PROMPT = `Eres OpenGravity, un agente de IA personal, brillante, conciso e incisivo.
Estás ejecutándote localmente y te comunicas exclusivamente a través de Telegram.
Puedes usar las herramientas proporcionadas para responder con precisión.
Si el usuario pregunta tu nombre o qué eres, responde que eres OpenGravity, una IA operando totalmente en su servidor local y que nadie más tiene acceso a ti.
Contesta usando Markdown para Telegram y sé muy directo.`;

export async function processUserMessage(userId: string, userText: string): Promise<string> {
    const maxIterations = 5;
    let iterations = 0;

    // Guardar historial inicial del usuario
    await saveMessage(userId, 'user', userText);

    // Cargar historial de SQLite
    const rawHistory = await getHistory(userId, 15);
    const messages: any[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...rawHistory
    ];

    while (iterations < maxIterations) {
        iterations++;

        // Llamada a LLM
        const aiMessage = await getAICompletion(messages);
        messages.push(aiMessage);

        if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
            console.log(`[Agent] Iteración ${iterations}: Ejecutando ${aiMessage.tool_calls.length} herramientas...`);

            for (const toolCall of aiMessage.tool_calls) {
                try {
                    const args = JSON.parse(toolCall.function.arguments);
                    console.log(`  [Tool Exec] -> ${toolCall.function.name}`, args);
                    const result = await executeTool(toolCall.function.name, args);
                    console.log(`  [Tool Result] <-`, result);

                    messages.push({
                        role: 'tool',
                        content: String(result),
                        name: toolCall.function.name,
                        tool_call_id: toolCall.id
                    });
                } catch (error: any) {
                    console.error(`  [Tool Error] <-`, error.message);
                    messages.push({
                        role: 'tool',
                        content: `Error: ${error.message}`,
                        name: toolCall.function.name,
                        tool_call_id: toolCall.id
                    });
                }
            }
            // Después de ejecutar las herramientas, el bucle volverá a consultar al LLM con los nuevos mensajes.
        } else {
            // No hay herramientas, es una respuesta final de texto
            const finalContent = aiMessage.content || "Sin respuesta generada.";
            await saveMessage(userId, 'assistant', finalContent);
            return finalContent;
        }
    }

    const abortMsg = "Límite de iteraciones del agente alcanzado. Proceso abortado.";
    await saveMessage(userId, 'assistant', abortMsg);
    return abortMsg;
}
