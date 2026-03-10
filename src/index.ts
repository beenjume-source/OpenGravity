import http from 'http';
import { validateConfig } from './config.js';
import { initDb } from './db/index.js';
import { bot } from './bot/telegram.js';

async function main() {
    console.log("===============================");
    console.log("       OpenGravity V1.0        ");
    console.log("===============================\n");

    // 1. Validar entorno
    validateConfig();

    // 2. Inicializar DB
    initDb();

    // 3. Iniciar Bot de Telegram via Long Polling
    console.log("[Telegram] Conectando bot de Telegram...");
    bot.start({
        onStart(botInfo) {
            console.log(`[Telegram] Bot iniciado exitosamente como @${botInfo.username}`);
            console.log("[OpenGravity] Agente online y esperando mensajes.");
        },
    });

    // 4. Iniciar Servidor HTTP Dummy para Render y Cron-job
    const PORT = process.env.PORT || 3000;
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OpenGravity Agent is Alive!');
    });

    server.listen(PORT, () => {
        console.log(`[Healthcheck] Servidor escuchando en el puerto ${PORT} (Ideal para cron-job.org)`);
    });

    // Manejo elegante de apagado
    process.once("SIGINT", () => {
        console.log("\n[Apagado] Deteniendo el bot...");
        bot.stop();
        server.close();
        process.exit(0);
    });
    process.once("SIGTERM", () => {
        console.log("\n[Apagado] Deteniendo el bot...");
        bot.stop();
        server.close();
        process.exit(0);
    });
}

main().catch(error => {
    console.error("[Fatal Error] Falló al iniciar OpenGravity:", error);
    process.exit(1);
});
