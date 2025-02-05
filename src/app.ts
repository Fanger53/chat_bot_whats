import 'dotenv/config'
import { createBot, MemoryDB, createProvider } from '@bot-whatsapp/bot'
import { BaileysProvider } from '@bot-whatsapp/provider-baileys'
import AIClass from './services/ai/index.js'; // Incluye la extensión .js
import flows from './flows/index.js'; // Incluye la extensión .js

const ai = new AIClass(process.env.OPEN_API_KEY, 'qwen-max')

const main = async () => {

    const provider = createProvider(BaileysProvider)
    // const provider = createProvider(TelegramProvider, { token: process.env.TELEGRAM_API ?? '' })

    await createBot({
        database: new MemoryDB(),
        provider,
        flow: flows
    }, { extensions: { ai } })

}

main()