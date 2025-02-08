import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import AIClass from "../../../services/ai/index.js";
import { clearHistory, handleHistory, getHistoryParse } from "../../../utils/handleHistory.js";
import { getFullCurrentDate } from "../../../utils/currentDate.js";
import { appToCalendarTechno } from "../../../services/calendar/techno.js";
import { reset, resetPrevious, stop, stopPrevious } from "../../../utils/idleCustom.js";
import formatDate from "../../../utils/formatDate.js";
import { sendMessage } from "../../../services/endpoints/whatsappSendMessage.js";

const generatePromptToFormatDate = (history: string) => {
    const prompt = `Fecha de Hoy:${getFullCurrentDate()}, Basado en el Historial de conversacion: 
    ${history}
    ----------------
    Fecha ideal: yyyy / dd / mm /  hh:mm`

    return prompt
}

const generateJsonParse = (info: string) => {
    const prompt = `
                Tu tarea es analizar el contexto proporcionado y generar un objeto JSON que se adhiera estrictamente a la estructura especificada. Asegúrate de cumplir con las siguientes reglas:
                1. Entrada: El contexto incluirá información en formato de texto o variables interpoladas (por ejemplo, ${info}).
                2. Salida: Debes generar un objeto JSON válido con los campos exactos indicados en la estructura.
                3. Formato: El objeto JSON debe ser devuelto directamente, sin comillas extras, comentarios ni texto adicional.
                4. Campos obligatorios: Los campos 'name', 'type', 'plate', 'startDate' y 'phone' deben estar presentes en el objeto JSON.

                Contexto:  
                ${info}

                Estructura del Objeto JSON a Generar:
                {
                    "name": "string",
                    "type": "string",
                    "plate": "string",
                    "startDate": "string",
                    "phone": "string"
                }

                Ejemplo de Salida Esperada:
                {
                    "name": "Leifer",
                    "type": "cda",
                    "plate": "ABC123A",
                    "startDate": "2024/02/15 00:00",
                    "phone": "573000000000"
                }

                Nota Importante:  
                Solo devuelve el objeto JSON final. No incluyas texto explicativo ni comillas adicionales.`

    return prompt
}

/**
 * Encargado de pedir los datos necesarios para registrar el evento en el calendario
 */
const flowConfirmTechno = addKeyword(EVENTS.ACTION).addAction(async (ctx, { flowDynamic, gotoFlow, state }) => {
    console.log("flowConfirmTechno")
    const currentState = state.getMyState() || {};
    reset(ctx, gotoFlow, 780000)
    resetPrevious(ctx, 600000, flowDynamic, currentState.userName)
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
    ], 'qwen-max')
    console.log('text in confirm', text)
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
        console.log('text in confirm 78', text)
        await appToCalendarTechno(text)
        await flowDynamic(`muy bien ${currentState.name}, tu cita a sido agendada para ${formatDate(currentState.startDate)}`)
        console.log('text in confirm 78', text)
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