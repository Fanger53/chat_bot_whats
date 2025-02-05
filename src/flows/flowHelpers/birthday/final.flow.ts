import {addAnswer, addKeyword, EVENTS } from "@bot-whatsapp/bot";
import { stopPrevious } from "../../../utils/idleCustom.js";

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