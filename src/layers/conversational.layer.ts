import { BotContext, BotMethods } from "@bot-whatsapp/bot/dist/types";
import { handleHistory } from "../utils/handleHistory";

/**
 * Su funcion es almancenar en el state todos los mensajes que el usuario  escriba
 */
export default async ({ body }: BotContext, { state, }: BotMethods) => {
    console.log("conversationalLayer");
    await handleHistory({ content: body, role: 'user' }, state)
}