import { BotContext, BotMethods } from "@bot-whatsapp/bot/dist/types"
import { getHistoryParse } from "../utils/handleHistory.js"
import AIClass from "../services/ai/index.js"
import { flowSeller } from "../flows/seller.flow.js"
import { flowSchedule } from "../flows/schedule.flow.js"
import { flowConfirm } from "../flows/confirm.flow.js"
import { flowScheduleTechno } from "../flows/flowHelpers/tecno/scheduleTechno.flow.js"
import { flowConfirmTechno } from "../flows/flowHelpers/tecno/confirmTechno.flow.js"
import { flowScheduleBirthday } from "../flows/flowHelpers/birthday/scheduleBirthday.flow.js"
import { flowConfirmBirthday } from "../flows/flowHelpers/birthday/confirmBirthday.flow.js"

/**
 * Determina que flujo va a iniciarse basado en el historial que previo entre el bot y el humano
 */
export default async (_: BotContext, { state, gotoFlow, extensions }: BotMethods) => {
    const ai = extensions.ai as AIClass
    const history = getHistoryParse(state)
    const currentState = state.getMyState() || {};
    console.log(history)
    const prompt = `Como una inteligencia artificial avanzada, tu tarea es analizar el contexto de una conversación y determinar cuál de las siguientes acciones es más apropiada para realizar:
    --------------------------------------------------------
    Historial de conversación:
    {HISTORY}
    
    Posibles acciones a realizar:
    1. AGENDAR: Esta acción se debe realizar cuando el cliente expresa su deseo de programar una cita.
    2. HABLAR: Esta acción se debe realizar cuando el cliente desea hacer una pregunta o necesita más información o saluda.
    3. CONFIRMAR: Esta acción se debe realizar cuando el cliente y el vendedor llegaron a un acuerdo mutuo proporcionando una fecha, dia y hora exacta sin conflictos de hora.
    4. CUMPLEAÑOS: Esta acción se debe realizar cuando el cliente expresa algo sobre su cumpleaños
    -----------------------------
    Tu objetivo es comprender la intención del cliente y seleccionar la acción más adecuada en respuesta a su declaración.
    
    Respuesta ideal (AGENDAR|HABLAR|CONFIRMAR|CUMPLEAÑOS):`.replace('{HISTORY}', history)

    const text = await ai.createChat([
        {
            role: 'system',
            content: prompt
        }
    ])

    console.log("confirmar:", (text.includes('CONFIRMAR')))
    console.log("flag_shedule techno:", currentState.scheduleTechno)
    if (text.includes('HABLAR')) return gotoFlow(flowSeller)

    console.log("shedule techno:", currentState.scheduleTechno)
    console.log("agendar:", (text.includes('AGENDAR')))
    if (text.includes('AGENDAR') && currentState.scheduleTechno === true) return gotoFlow(flowScheduleTechno)

    if (text.includes('CONFIRMAR') && currentState.scheduleTechno === true) return gotoFlow(flowConfirmTechno)

    if (text.includes('AGENDAR') && currentState.scheduleBirthday === true) return gotoFlow(flowScheduleBirthday)
    
    if (text.includes('CONFIRMAR') && currentState.scheduleBirthday === true) return gotoFlow(flowConfirmBirthday)

    console.log("agendar:", (text.includes('AGENDAR')))
    console.log("flag:", currentState.scheduleTechno === false)
    console.log("main linea 44",(text.includes('AGENDAR') && currentState.scheduleTechno === false))
    if ((text.includes('AGENDAR') && currentState.scheduleTechno === false) || (text.includes('AGENDAR') && currentState.scheduleBirthday === false)) return gotoFlow(flowSchedule)
        
    if ((text.includes('CONFIRMAR') && currentState.scheduleTechno === false) || (text.includes('AGENDAR') && currentState.scheduleBirthday === false)) return gotoFlow(flowConfirm)
        console.log('linea 46')
    // console.log(text.includes('CUMPLEAÑOS linea 47'))
    // if (text.includes('CUMPLEAÑOS')) {
    //     state.update({ 
    //         flag:true
    //     });
    //     return gotoFlow(flowBirthday)
    // }
}