import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import getUserInfo from "src/services/endpoints/userInformationService";
import flowGivePoints from "./GivePoints.flow";
import flowDownloadApp from "./downloadApp.flow";

const array = []
const flowPhoneNumber = addKeyword(EVENTS.ACTION)
    .addAction({capture: true},async (ctx, { state, gotoFlow, flowDynamic }) => {
        try {
            console.log("FlowPhoneNumber")
            const phone = `57${ctx.from}`
            console.log(phone)
            const userInfo = await getUserInfo(phone);
            console.log("Checking user info:", userInfo);
            const currentState = state.getMyState()
            if (!array.includes("primero")) {
                array.push('primero');
            }

            if (userInfo && userInfo.nombre && userInfo.puntos_actuales !== undefined) {
                console.log(state)
                await state.update({ phone: phone, puntos: userInfo.puntos_actuales });
                const currentState = state.getMyState()
                gotoFlow(flowGivePoints);
            } else {
                console.log(array.length <= 2)
                console.log(array.length > 2 && array.length <= 3)
                console.log(array.length <= 3)
                console.log(array.length)
                console.log(array)
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
                gotoFlow(flowPhoneNumber)
            }
        } catch (error) {
            console.error('[ERROR in initial API check]:', error);
        }
    })

    export default flowPhoneNumber;