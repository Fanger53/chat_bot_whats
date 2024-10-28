import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import conversationalLayer from "src/layers/conversational.layer";
import mainLayer from "src/layers/main.layer";
import { flowBirthday } from "./birthday.flow";

/**
 * Este flow responde a cualquier palabra que escriban
 */
export default addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { gotoFlow }) => {
        // Mensaje específico de cumpleaños
        const birthdayMessage = "Hola, hoy es mi cumpleaños🎉 y quiero saber mas sobre el obsequio por ser usuario MotoSmart";
        
        // Si el mensaje coincide exactamente, redirige al flujo de cumpleaños
        if (ctx.body === birthdayMessage) {
            return gotoFlow(flowBirthday);
        }
        
        // Si no coincide, continúa con el flujo normal
        return;
    })
    .addAction(conversationalLayer)
    .addAction(mainLayer);