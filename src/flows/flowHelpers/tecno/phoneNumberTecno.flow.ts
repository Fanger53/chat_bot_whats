import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import getUserInfo from "../../../services/endpoints/userInformationService.js";
import flowDownloadApp from "../birthday/downloadApp.flow.js";
import flowMiddleTechno from "./middleTecno.flow.js";
import { reset, resetPrevious } from "../../../utils/idleCustom.js";


const array = []
const flowPhoneNumberTecno = addKeyword(EVENTS.ACTION)
    .addAction({capture: true},async (ctx, { state, gotoFlow, flowDynamic }) => {
        try {
            const currentState = state.getMyState() || {};
            reset(ctx, gotoFlow, 780000)
            resetPrevious(ctx, 600000, flowDynamic, currentState.userName)
            console.log("flowPhoneNumberTecno")
            const phone = ctx.body
            console.log(phone)
            const userInfo = await getUserInfo(phone);
            if (!array.includes("primero")) {
                array.push('primero');
            }

            if (userInfo && userInfo.nombre && userInfo.puntos_actuales !== undefined) {
                await state.update({ userName: userInfo.nombre, phone: phone, puntos: userInfo.puntos_actuales });
                gotoFlow(flowMiddleTechno);
            } else {
                if (array.length <= 1) {
                    // Primer intento con número de celular
                    await flowDynamic(`${currentState.userName}!, no hemos encontrado registro con este número de celular, por favor verifica e intentalo otra vez.`);
                    array.push('try');
                } else if (array.length > 1 && array.length <= 2) {
                    // Segundo intento con número de celular
                    await flowDynamic("Ahora necesitamos que nos brindes tu correo electrónico para continuar.");
                    array.push('email');
                } else if (array.length === 3) {
                    console.log("Redirigiendo a la descarga de la app porque no se encontró el registro.");
                    return gotoFlow(flowDownloadApp)
                } 
                gotoFlow(flowPhoneNumberTecno)
            }
        } catch (error) {
            console.error('[ERROR in initial API check]:', error);
        }
    })

    export default flowPhoneNumberTecno;