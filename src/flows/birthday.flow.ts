import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import getUserInfo from "../services/endpoints/userInformationService";
import flowUserNotInfo from "./flowHelpers/birthday/userNotInfo.flow";
import flowUserWithInfo from "./flowHelpers/birthday/userWithInfo.flow";


const flowBirthday = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
        try {
            const userInfo = await getUserInfo(ctx.from);
            console.log("Checking user info:", userInfo);
            
            if (userInfo && userInfo.nombre && userInfo.puntos_actuales !== undefined) {
                await state.update({ userName: userInfo.nombre,  points: userInfo.puntos_actuales });
                return gotoFlow(flowUserWithInfo);
            } else {
                // Si no hay info del usuario, iniciamos el flujo de captura
                return gotoFlow(flowUserNotInfo)
            }
        } catch (error) {
            console.error('[ERROR in initial API check]:', error);
            await flowDynamic('Lo siento, hubo un error. Vamos a proceder con la captura de datos.');
            return true;
        }
    })


export { flowBirthday };