import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import conversationalLayer from "src/layers/conversational.layer";
import mainLayer from "src/layers/main.layer";
import getUserInfo from "src/services/endpoints/userInformationService";
import { flowBirthday } from "./flowHelpers/birthday/birthday.flow";
import { flowTecno } from "./tecno.flow";
import { stop, stopPrevious } from "src/utils/idleCustom";

const welcome_flow_default = addKeyword(EVENTS.WELCOME).addAction(async (ctx, { gotoFlow, state, flowDynamic }) => {
    console.log("flowWelcome");
    const birthdayMessage = "Hola, hoy es mi cumpleaños🎉 y quiero saber mas sobre el obsequio por ser usuario MotoSmart";
    const tecnoMessage = "Hola, mi TECNO vence muy pronto ⏱️ puedes darme información sobre los beneficios de sacarla con #MotoSmart";
    const phone = ctx.from;
    console.log("welcomeflow 21", phone);

    try {
        const userInfo = await getUserInfo(phone);
        if (!userInfo) {
            console.error('User not found');
            return;
        }

        await state.update({ userName: userInfo.nombre, phone, puntos: userInfo.puntos_actuales, is_premium: userInfo.is_premium });
        const currentState = state.getMyState() || {};
        const body = ctx.body;
        console.log("techno:", body === tecnoMessage);
        console.log("birthday:", body === birthdayMessage);

        if (body === birthdayMessage) {
            state.update({ flag: true, scheduleTechno: false });
            return gotoFlow(flowBirthday);
        } else if (body === tecnoMessage) {
            console.log("29");
            state.update({ flag: true, scheduleTechno: true });
            return gotoFlow(flowTecno);
        } else {
            if (currentState.scheduleTechno === true) {
                return "confirm techno";
            } else {
                stop(ctx);
                stopPrevious(ctx);
                state.update({ flag: false, scheduleTechno: false, scheduleBirthday: false });
            }
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
        await flowDynamic('Hubo un error al obtener la información del usuario.');
    }
}).addAction(conversationalLayer).addAction(mainLayer);

export { welcome_flow_default as default };