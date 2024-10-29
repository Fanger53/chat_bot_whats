import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import getUserInfo from "src/services/endpoints/userInformationService";
import flowGivePoints from "./GivePoints.flow";

const flowPhoneNumber = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
        try {
            console.log("FlowPhoneNumber")
            const phone = ctx.from
            const userInfo = await getUserInfo(phone);
            console.log("Checking user info:", userInfo);
            
            if (userInfo && userInfo.nombre && userInfo.puntos_actuales !== undefined) {
                console.log(state)
                await state.update({ phone: phone });
                const currentState = state.getMyState()
                await flowDynamic([
                    {
                        body: `Ok, perfecto🤟, ${currentState.userName}, Por ser tu cumpleaños, MotoSmart quiere obsequiarte 1.000 MotoPuntos para que puedas pasar a cualquiera de las tiendas aliadas a canjear uno de nuestros obsequios, podrás elegir uno entre llaveros, balaclavas gorras, porta documentos  entre otros🔥🎉🚀🛵`,
                        delay: 1000
                    }
                ]);
                gotoFlow(flowGivePoints);
            } else {
                // Si no hay info del usuario, iniciamos el flujo de captura
                await flowDynamic([{
                    body: 'Gracias por comunicarte con MotoSmart, la única app diseñada para motociclistas como tu 😎🛵\nPara entregarte tu regalo de cumpleaños, necesito confirmar algunos datos.',
                    delay: 1000
                }]);
                gotoFlow(flowPhoneNumber)
            }
        } catch (error) {
            console.error('[ERROR in initial API check]:', error);
        }
    })

    export default flowPhoneNumber;