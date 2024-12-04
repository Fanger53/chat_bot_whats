import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import { BotContext, TFlow } from "@bot-whatsapp/bot/dist/types"
import { clearHistory } from "./handleHistory";

// Object to store timers for each user
const timers = {};

// Flow for handling inactivity
const idleFlow = addKeyword(EVENTS.ACTION).addAction(
    async (_, { endFlow, state, flowDynamic }) => {
        const currentState = state.getMyState();
        await flowDynamic(`${currentState.userName}, por falta de inactividad en el chat lo debo cerrar, sin embargo puedes comunicarte con nosotros cuando lo desees de nuevo`)
        state.update({ 
            flag:false
        });
        clearHistory(state)
        return endFlow("Gracias por comunicarte con MotoSmart 🤜🤛\nSe un motociclista ejemplar, queremos que siempre regreses a casa 🛵🤟😎");
    }
);

// const before = async (ctx: BotContext, userName: String, ms: number) => {
//     return new Promise((resolve) => {
//         console.log(before)
//         timers[ctx.from] = setTimeout(() => {
//           console.log(`User timeout: ${ctx.from}`);
//           resolve(`${userName}, ¿siguies disponible para continuar ?`);
//         }, ms);
//       });
// }

// Function to start the inactivity timer for a user
const start = (ctx: BotContext, gotoFlow: (a: TFlow) => Promise<void>, ms: number) => {
    timers[ctx.from] = setTimeout(() => {
        console.log(`User timeout: ${ctx.from}`);
        return gotoFlow(idleFlow);
    }, ms);
}

// Function to reset the inactivity timer for a user
const reset = (ctx: BotContext, gotoFlow: (a: TFlow) => Promise<void>, ms: number) => {
    stop(ctx);
    if (timers[ctx.from]) {
        console.log(`reset countdown for the user: ${ctx.from}`);
        clearTimeout(timers[ctx.from]);
    }
    start(ctx, gotoFlow, ms);
}

// Function to stop the inactivity timer for a user
const stop = (ctx: BotContext) => {
    if (timers[ctx.from]) {
        clearTimeout(timers[ctx.from]);
    }
}

export {
    // before,
    start,
    reset,
    stop,
    idleFlow,
}
