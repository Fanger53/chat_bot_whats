import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import conversationalLayer from "src/layers/conversational.layer";
import mainLayer from "src/layers/main.layer";
import getUserInfo from "src/services/endpoints/userInformationService";
import { flowBirthday } from "./birthday.flow";
import { flowTecno } from "./tecno.flow";

/**
 * Este flow responde a cualquier palabra que escriban
 */
export default addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { gotoFlow, state }) => {
        console.log("welcome")
        const birthdayMessage = "Hola, hoy es mi cumpleaños🎉 y quiero saber mas sobre el obsequio por ser usuario MotoSmart";
        const tecnoMessage = "Hola, mi TECNO vence muy pronto ⏱️ puedes darme información sobre los beneficios de sacarla con #MotoSmart"
        const phone = ctx.from
        console.log(phone)
        // Si el mensaje coincide exactamente, redirige al flujo de cumpleaños
        const userInfo = await getUserInfo(phone);
        await state.update({ userName: userInfo.nombre, phone: phone, puntos: userInfo.puntos_actuales, is_premium: userInfo.is_premium});
        const body = ctx.body;
        console.log(body === tecnoMessage)
        if (body === birthdayMessage) {
            state.update({ 
                flag:true
            });
            return gotoFlow(flowBirthday);
        } else if(body === tecnoMessage){
            console.log("29")
            state.update({ 
                flag:true, 
                scheduleTechno: true
            });
            return gotoFlow(flowTecno);
        }
    })
    .addAction(conversationalLayer)
    .addAction(mainLayer);