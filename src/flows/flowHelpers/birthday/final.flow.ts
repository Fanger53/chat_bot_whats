import {addAnswer, addKeyword, EVENTS } from "@bot-whatsapp/bot";
import welcomeFlow from "../../welcome.flow";

const flowFinal = addKeyword(EVENTS.ACTION)
    .addAction(
        async (ctx, { flowDynamic, state, gotoFlow }) => {
            const currentState = state.getMyState()
                await flowDynamic([{
                    body:`${currentState.userName}, por falta de inactividad en el chat lo debo cerrar, sin embargo puedes comunicarte con nosotros cuando lo desees de nuevo`, delay: 1000
                },{
                    body: `Gracias por comunicarte con MotoSmart 🤜🤛
                    Se un motociclista ejemplar, queremos que siempre regreses a casa 🛵🤟😎`,
                    delay: 2000
                }])
        }
    )

export default flowFinal;