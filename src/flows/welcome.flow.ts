import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import conversationalLayer from "../layers/conversational.layer.js";
import mainLayer from "../layers/main.layer.js";
import getUserInfo from "../services/endpoints/userInformationService.js";
import { flowBirthday } from "./flowHelpers/birthday/birthday.flow.js";
import { flowTecno } from "./tecno.flow.js";
import { stop, stopPrevious } from "../utils/idleCustom.js";
import checkTecnoMatch from "../utils/checkTecnoMatch.js";

const welcome_flow_default = addKeyword(EVENTS.WELCOME).addAction(async (ctx, { gotoFlow, state, flowDynamic }) => {
    console.log("flowWelcome");
    // const birthdayMessage = "Hola, hoy es mi cumpleaños🎉 y quiero saber mas sobre el obsequio por ser usuario MotoSmart";
    const birthdayMessage = "sdgshshs";
    const tecnoMessage = "Hola, mi TECNO vence muy pronto ⏱️ puedes darme información sobre cual seria el valor del bono de descuento y los beneficios de sacarla con #MotoSmart";
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
        } else if (body === tecnoMessage || checkTecnoMatch(body)) {
            console.log("29");
            state.update({ flag: true, scheduleTechno: true });
            return gotoFlow(flowTecno);
        } else {
            if (currentState.scheduleTechno === true) {
                return console.log("confirm techno");
            } else {
                stop(ctx);
                stopPrevious(ctx);
                console.log("flowWelcome 42");
                state.update({ flag: false, scheduleTechno: false, scheduleBirthday: false });
            }
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
        await flowDynamic('Hubo un error al obtener la información del usuario.');
    }
}).addAction(conversationalLayer).addAction(mainLayer);

export { welcome_flow_default as default };