import {addAnswer, addKeyword, EVENTS } from "@bot-whatsapp/bot";
import welcomeFlow from "../../welcome.flow";
import { stopPrevious } from "src/utils/idleCustom";

const flowFinal = addKeyword(EVENTS.ACTION)
    .addAction(
        async (ctx, { flowDynamic, state, gotoFlow }) => {
            const currentState = state.getMyState()
                await flowDynamic([{
                    body:`Muy Bien`, 
                    delay: 1000
                },{
                    body: `Gracias por comunicarte con MotoSmart 🤜🤛\nSe un motociclista ejemplar, queremos que siempre regreses a casa 🛵🤟😎`,
                    delay: 1000
                }])
                state.update({ 
                    flag:false
                });
                stopPrevious(ctx);
        }
    )

export default flowFinal;