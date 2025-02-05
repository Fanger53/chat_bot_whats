import 'dotenv/config';
import { createBot, MemoryDB, createProvider } from '@bot-whatsapp/bot';
import { BaileysProvider } from '@bot-whatsapp/provider-baileys';
import AIClass from './services/ai/index.js';
import flows from './flows/index.js';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ai = new AIClass(process.env.OPEN_API_KEY, 'qwen-max');

const main = async () => {
    const provider = createProvider(BaileysProvider);

    // Crear el bot
    await createBot(
        {
            database: new MemoryDB(),
            provider,
            flow: flows,
        },
        { extensions: { ai } }
    );

    // Crear un servidor HTTP para escuchar en un puerto
    const PORT = process.env.PORT || 3008; // Usa el puerto definido en .env o 3008 por defecto
    const server = http.createServer((req, res) => {
        if (req.url === '/qr') {
            // Ruta para servir el archivo QR
            const filePath = path.join(process.cwd(), 'bot.qr.png'); // Ruta absoluta al archivo
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('QR file not found');
                } else {
                    res.writeHead(200, { 'Content-Type': 'image/png' });
                    res.end(data); // Envía el archivo PNG como respuesta
                }
            });
        } else {
            // Respuesta predeterminada para otras rutas
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Bot is running!\n');
        }
    });

    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

main();