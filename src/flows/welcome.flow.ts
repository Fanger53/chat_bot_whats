import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import conversationalLayer from "src/layers/conversational.layer";
import mainLayer from "src/layers/main.layer";
import { flowCaptureUserData } from "./birthday.flow";
import AIClass from "src/services/ai";
import getUserInfo from "src/services/endpoints/userInformationService";
import { handleHistory } from "src/utils/handleHistory";
import { flowSeller } from "./seller.flow";

/**
 * Este flow responde a cualquier palabra que escriban
 */
export default addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { gotoFlow, state }) => {
        console.log("welcome")
        const birthdayMessage = "Hola, hoy es mi cumpleaños🎉 y quiero saber mas sobre el obsequio por ser usuario MotoSmart";
        const phone = ctx.from
        console.log(phone)
        // Si el mensaje coincide exactamente, redirige al flujo de cumpleaños
        const userInfo = await getUserInfo(phone);
        await state.update({ userName: userInfo.nombre, phone: phone, puntos: userInfo.puntos_actuales, is_premium: userInfo.is_premium});
        const body = ctx.body;
        if (body === birthdayMessage) {
            state.update({ 
                birthday:true
            });
            return gotoFlow(flowCaptureUserData);
        }

        // await handleHistory({ content: body, role: 'user' }, state)
        // const keywordsRegex = /\b(gps|premium|motosmart|hola)\b/i;

        // // Si el mensaje contiene alguna palabra clave, redirige al flujo deseado
        // if (keywordsRegex.test(ctx.body)) {
        //     console.log('redirige a flow seller')
        //     return gotoFlow(flowSeller);
        // }
    })
    .addAction(conversationalLayer)
    .addAction(mainLayer);