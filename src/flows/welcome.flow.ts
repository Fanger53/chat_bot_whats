import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import conversationalLayer from "src/layers/conversational.layer";
import mainLayer from "src/layers/main.layer";
import { flowCaptureUserData } from "./birthday.flow";
import AIClass from "src/services/ai";
import flowInfo from "./info.flows";

/**
 * Este flow responde a cualquier palabra que escriban
 */
export default addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { gotoFlow, state }) => {
        // Mensaje específico de cumpleaños
        const birthdayMessage = "Hola, hoy es mi cumpleaños🎉 y quiero saber mas sobre el obsequio por ser usuario MotoSmart";
        
        // Si el mensaje coincide exactamente, redirige al flujo de cumpleaños
        if (ctx.body === birthdayMessage) {
            state.update({ 
                birthday:true
            });
            return gotoFlow(flowCaptureUserData);
        }
        const keywordsRegex = /\b(gps|premium|motosmart|hola)\b/i;

        // Si el mensaje contiene alguna palabra clave, redirige al flujo deseado
        if (keywordsRegex.test(ctx.body)) {
            return gotoFlow(flowInfo);
        }
        return;
    })
    .addAction(conversationalLayer)
    .addAction(mainLayer);