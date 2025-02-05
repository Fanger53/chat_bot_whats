import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import getUserInfo from "../services/endpoints/userInformationService.js";
import { start, startPrevious } from "../utils/idleCustom.js";
import flowUserWithInfoTecno from "./flowHelpers/tecno/userWithInfoTecno.flow.js";
import flowUserNotInfoTecno from "./flowHelpers/tecno/userNotInfoTecno.flow.js";


const flowTecno = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
        try {
            console.log("flowTecno")
            const userInfo = await getUserInfo(ctx.from);
            console.log("Checking user info:", userInfo);
            const currentState = state.getMyState() || {};
            start(ctx, gotoFlow, 360000)
            startPrevious(ctx, 180000, flowDynamic, currentState.userName)
            if (userInfo && userInfo.nombre && userInfo.puntos_actuales !== undefined) {
                await state.update({ userName: userInfo.nombre,  points: userInfo.puntos_actuales });
                return gotoFlow(flowUserWithInfoTecno);
            } else {
                // Si no hay info del usuario, iniciamos el flujo de captura
                return gotoFlow(flowUserNotInfoTecno)
            }
        } catch (error) {
            console.error('[ERROR in initial API check]:', error);
            await flowDynamic('Lo siento, hubo un error. Vamos a proceder con la captura de datos.');
            return true;
        }
    })


export { flowTecno };