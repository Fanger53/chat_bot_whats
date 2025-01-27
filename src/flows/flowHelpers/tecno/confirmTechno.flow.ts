import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import AIClass from "../../../services/ai";
import { clearHistory, handleHistory, getHistoryParse } from "../../../utils/handleHistory";
import { getFullCurrentDate } from "../../../utils/currentDate";
import { appToCalendarTechno } from "src/services/calendar/techno";
import { reset, resetPrevious, stop, stopPrevious } from "src/utils/idleCustom";
import formatDate from "src/utils/formatDate";
import { sendMessage } from "src/services/endpoints/whatsappSendMessage";

const generatePromptToFormatDate = (history: string) => {
    const prompt = `Fecha de Hoy:${getFullCurrentDate()}, Basado en el Historial de conversacion: 
    ${history}
    ----------------
    Fecha ideal: yyyy / dd / mm /  hh:mm`

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
const flowConfirmTechno = addKeyword(EVENTS.ACTION).addAction(async (ctx, { flowDynamic, gotoFlow, state }) => {
    reset(ctx, gotoFlow, 90000)
    console.log("flowConfirmTechno")
    const currentState = state.getMyState() || {};
    reset(ctx, gotoFlow, 360000)
    resetPrevious(ctx, 180000, flowDynamic, currentState.userName)
    await flowDynamic('Ok, voy a pedirte unos datos para agendar')
    await flowDynamic('¿Cual es tu nombre completo?')
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
    .addAction({ capture: true }, async (ctx, { state, flowDynamic }) => {
        await flowDynamic(`Ultima pregunta ¿Cual es la placa de tu moto?`)
    })
    .addAction({ capture: true }, async (ctx, { state, extensions, flowDynamic }) => {
        await state.update({ plate: ctx.body })
        const currentState = state.getMyState() || {};
        const infoCustomer = `Name: ${currentState.name}, StarteDate: ${currentState.startDate}, plate: ${ctx.body}, type: cda, phone: ${ctx.from}`
        const ai = extensions.ai as AIClass

        const text = await ai.createChat([
            {
                role: 'system',
                content: generateJsonParse(infoCustomer)
            }
        ])

        await appToCalendarTechno(text)
        await flowDynamic(`muy bien ${currentState.name}, tu cita a sido agendada para ${formatDate(currentState.startDate)}`)
        clearHistory(state)
        flowDynamic("¿te puedo ayudar con algo mas?")
        state.update({
            scheduleTechno: false
        });
        stop(ctx)
        stopPrevious(ctx)
        console.log('current state', currentState)
        console.log('placa', currentState.plate)
        let message = `¡Hola!\nEl usuario ${currentState.name} con placa ${currentState.plate} de MotoSmart App  a agendando una cita para su revisión técnico mecánica para  ${formatDate(currentState.startDate)}\nPuedes consultar la agenda en este link👇👇\nhttps://docs.google.com/spreadsheets/d/1kWXzc52b3eALRBlgAzvwabOuxwNaC8QAbk4sn28fH_M/edit?usp=sharing`

        sendMessage("573156101101", message)
    });

export { flowConfirmTechno }