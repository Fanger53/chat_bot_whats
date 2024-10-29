import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import conversationalLayer from "src/layers/conversational.layer";
import mainLayer from "src/layers/main.layer";
import { flowCaptureUserData } from "./birthday.flow";

/**
 * Este flow responde a cualquier palabra que escriban
 */
export default addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { gotoFlow }) => {
        // Mensaje específico de cumpleaños
        const birthdayMessage = "Hola, hoy es mi cumpleaños🎉 y quiero saber mas sobre el obsequio por ser usuario MotoSmart";
        
        // Si el mensaje coincide exactamente, redirige al flujo de cumpleaños
        if (ctx.body === birthdayMessage) {
            return gotoFlow(flowCaptureUserData);
        }
        return;
    })
    .addAction(conversationalLayer)
    .addAction(mainLayer);