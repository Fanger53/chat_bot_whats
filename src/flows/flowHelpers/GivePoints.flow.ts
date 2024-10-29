import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import postPoints from "src/services/endpoints/postPoints";


const flowGivePoints = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state }) => {
        try {
            const currentState = state.getMyState()
            console.log(currentState.phone)
            // if (userInfo && userInfo.nombre && userInfo.puntos_actuales !== undefined) {
            //     await state.update({ userInfo });
            //     console.log(state)
            //     await flowDynamic([
            //         {
            //             body: `Gracias por comunicarte con MotoSmart, la única app diseñada para motociclistas como tu 😎🛵`,
            //             delay: 1000
            //         },
            //     ]);
            // } else {
            //     // Si no hay info del usuario, iniciamos el flujo de captura
            //     await flowDynamic([{
            //         body: 'Gracias por comunicarte con MotoSmart, la única app diseñada para motociclistas como tu 😎🛵\nPara entregarte tu regalo de cumpleaños, necesito confirmar algunos datos.',
            //         delay: 1000
            //     }]);
            // }
        } catch (error) {
            console.error('[ERROR in initial API check]:', error);
            await flowDynamic('Lo siento, hubo un error. Vamos a proceder con la captura de datos.');
        }
    })

export default flowGivePoints;