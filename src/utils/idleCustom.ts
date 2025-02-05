import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import { BotContext, TFlow } from "@bot-whatsapp/bot/dist/types"
import { clearHistory } from "./handleHistory.js";

// Object to store timers for each user
const timers = {};
const preTimers = {};

// Flow for handling inactivity
const idleFlow = addKeyword(EVENTS.ACTION).addAction(
    async (ctx, { endFlow, state, flowDynamic }) => {
        const currentState = state.getMyState();
        await flowDynamic(`Por falta de inactividad en el chat lo debo cerrar, sin embargo puedes comunicarte con nosotros cuando lo desees de nuevo`)
        state.update({ 
            flag:false
        });
        clearHistory(state)
        stop(ctx)
        stopPrevious(ctx)
        return endFlow("Gracias por comunicarte con MotoSmart 🤜🤛\nSe un motociclista ejemplar, queremos que siempre regreses a casa 🛵🤟😎");
    }
);

const startPrevious = async (ctx: BotContext, ms: number, flowDynamic: (message: string) => Promise<void>, name: string): Promise<void> => {
    const message = `${name}, Sigues Disponible?`;
    preTimers[ctx.from] = setTimeout(async () => {
        console.log(message);
        await flowDynamic(message);
    }, ms);
};

const resetPrevious = async (ctx: BotContext, ms: number, flowDynamic: (message: string) => Promise<void>, name: string): Promise<void> => {
    console.log(`reset countdown for previous the user: ${ctx.from}`);
    if (preTimers[ctx.from]) {
        clearTimeout(preTimers[ctx.from]);
        delete preTimers[ctx.from];
    }
    await startPrevious(ctx, ms, flowDynamic, name);
}


const stopPrevious = (ctx: BotContext) => {
    if (preTimers[ctx.from]) {
        clearTimeout(preTimers[ctx.from]);
        delete preTimers[ctx.from];
    }
    for (const key in preTimers) {
        if (preTimers.hasOwnProperty(key)) {
            clearTimeout(preTimers[key]);
            delete preTimers[key];
        }
    }
}


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
    startPrevious,
    resetPrevious,
    stopPrevious
}
