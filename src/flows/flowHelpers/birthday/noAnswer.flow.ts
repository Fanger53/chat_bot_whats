import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import flowFinal from "./final.flow";
import flowInTheMiddle from "./middle.flow";

const flowNoAnswer = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
        try {
            const currentState = state.getMyState()
            console.log('flowNoAnswer')
            flowDynamic(`${currentState.userName}}, ¿siguies disponible para continuar ?`)
            
        } catch (error) {
            console.error('[ERROR in initial API check]:', error);
            await flowDynamic('Lo siento, hubo un error.');
            return true;
        }
    })
    .addAction({capture:true, idle:15000}, async (ctx, { flowDynamic, state, gotoFlow }) => {
        try {
            const currentState = state.getMyState()
            const body = ctx.body
            if (ctx?.idleFallBack) {
                return gotoFlow(flowFinal)
            }else{
                return gotoFlow(flowInTheMiddle)
            }
        } catch (error) {
            console.error('[ERROR in initial API check]:', error);
            await flowDynamic('Lo siento, hubo un error.');
            return true;
        }
    })

export default flowNoAnswer;