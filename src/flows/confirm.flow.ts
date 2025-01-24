import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import AIClass from "../services/ai";
import { clearHistory, handleHistory, getHistoryParse } from "../utils/handleHistory";
import { getFullCurrentDate } from "../utils/currentDate";
import { appToCalendar } from "src/services/calendar";
import { reset, resetPrevious, stop, stopPrevious,} from "src/utils/idleCustom";
import formatDate from "src/utils/formatDate";
import flowFinal from "./flowHelpers/birthday/final.flow";

const generatePromptToFormatDate = (history: string) => {
    const prompt = `Fecha de Hoy:${getFullCurrentDate()}, Basado en el Historial de conversacion: 
    ${history}
    ----------------
    Fecha ideal: yyyy / mm / dd /  hh:mm`

    return prompt
}

const generateJsonParse = (info: string) => {
    const prompt = `tu tarea principal es analizar la información proporcionada en el contexto y generar un objeto JSON que se adhiera a la estructura especificada a continuación. 

    Contexto: "${info}"
    
    {
        "name": "Leifer",
        "type": "cda",
        "plate": "ABC123A",
        "startDate": "2024/02/15 00:00",
        "phone": "573000000000"
    }
    
    Objeto JSON a generar:`

    return prompt
}

/**
 * Encargado de pedir los datos necesarios para registrar el evento en el calendario
 */
const flowConfirm = addKeyword(EVENTS.ACTION).addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
    console.log("flowConfirm")
    const currentState = state.getMyState() || {};
    reset(ctx, gotoFlow, 360000)
    resetPrevious(ctx, 180000, flowDynamic, currentState.userName)
    await flowDynamic('Ok, voy a pedirte unos datos para agendar')
    await flowDynamic('¿Cual es tu nombre?')
}).addAction({ capture: true }, async (ctx, { state, flowDynamic, extensions }) => {
    await state.update({ name: ctx.body })
    const ai = extensions.ai as AIClass
    const history = getHistoryParse(state)
    const text = await ai.createChat([
        {
            role: 'system',
            content: generatePromptToFormatDate(history)
        }
    ], 'gpt-4')

    await handleHistory({ content: text, role: 'assistant' }, state)
    await flowDynamic(`¿Me confirmas fecha y hora?: ${formatDate(text)}`)
    await state.update({ startDate: text })
})
    .addAction({ capture: true }, async (ctx, { state, extensions, flowDynamic, gotoFlow }) => {
        const currentState = state.getMyState() || {};
        const infoCustomer = `Name: ${currentState.name}, StarteDate: ${currentState.startDate}, plate: ${ctx.body}, type: default, phone: ${ctx.from}`
        const ai = extensions.ai as AIClass

        const text = await ai.createChat([
            {
                role: 'system',
                content: generateJsonParse(infoCustomer)
            }
        ])

        await appToCalendar(text)
        await flowDynamic(`${state.get('name')}, tu cita a sido agendada para ${formatDate(state.get('startDate'))}`)
        clearHistory(state)
        gotoFlow(flowFinal)
    })

export { flowConfirm }