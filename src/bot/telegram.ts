import { Bot } from 'grammy';
import { config } from '../config.js';
import { processUserMessage } from '../agent/loop.js';
import { clearHistory } from '../db/memory.js';

if (!config.TELEGRAM_BOT_TOKEN || config.TELEGRAM_BOT_TOKEN === 'SUTITUYE POR EL TUYO') {
    console.error("[Telegram] El token del bot no está configurado correctamente.");
}

export const bot = new Bot(config.TELEGRAM_BOT_TOKEN);

// Middleware de autenticación (Whitelist)
bot.use(async (ctx, next) => {
    const userId = ctx.from?.id.toString();
    if (!userId) return;

    if (!config.TELEGRAM_ALLOWED_USER_IDS.includes(userId)) {
        console.warn(`[Seguridad] Intento de acceso denegado por ID de usuario: ${userId}`);
        // Se ignora silenciosamente o se puede responder que no está autorizado
        return;
    }

    await next();
});

bot.command("start", async (ctx) => {
    await ctx.reply("¡Hola! Soy OpenGravity. Estoy funcionando localmente y listo para ayudarte en lo que necesites.");
});

bot.command("clear", async (ctx) => {
    const userId = ctx.from!.id.toString();
    await clearHistory(userId);
    await ctx.reply("Memoria borrada. Empecemos de nuevo.");
});

bot.on("message:text", async (ctx) => {
    const userId = ctx.from!.id.toString();
    const text = ctx.message.text;

    try {
        // Opcional: mostrar un "Escribiendo..." mientras el agente piensa
        await ctx.replyWithChatAction("typing");

        const responseText = await processUserMessage(userId, text);

        // Grammy soporta MarkdownV2 pero a veces escaparlo es rudo, probaremos con parse_mode: Markdown
        await ctx.reply(responseText, { parse_mode: "Markdown" }).catch(async (e) => {
            console.error("[Telegram] Error parseando Markdown, enviando como texto plano", e);
            await ctx.reply(responseText);
        });

    } catch (error: any) {
        console.error("[Bot Error]", error);
        await ctx.reply(`Ocurrió un error en el sistema: ${error.message}`);
    }
});
