import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import AIClass from "../../../services/ai";
import { getHistoryParse, handleHistory } from "../../../utils/handleHistory";
import { generateTimer } from "../../../utils/generateTimer";
import { getCurrentCalendar } from "../../../services/calendar";
import { getFullCurrentDate } from "src/utils/currentDate";
import { reset, resetPrevious } from "src/utils/idleCustom";

const generateSchedulePrompt = (schedule: string, history: string) => {
    const currentDay = getFullCurrentDate()
    return `Como ingeniero de inteligencia artificial especializado en la programación de reuniones, tu objetivo es analizar la conversación y determinar la intención del cliente de programar una reunión, así como su preferencia de fecha y hora. La reunión durará aproximadamente 15 minutos y solo puede ser programada entre las 9am y las 4pm, de lunes a viernes, y solo para la semana en curso entre los horarios establecidos.

    Fecha de hoy: ${currentDay},

    Reuniones ya agendadas:
    -----------------------------------
    ${schedule}

    Historial de Conversación:
    -----------------------------------
    ${history}

    Ejemplos de respuestas adecuadas para sugerir horarios y verificar disponibilidad:
    -----------------------------------
    "Por supuesto, tengo un espacio disponible mañana, ¿a qué hora te resulta más conveniente?"
    "Sí, tengo un espacio disponible hoy, ¿a qué hora te resulta más conveniente?"
    "Ciertamente, tengo varios huecos libres esta semana. Por favor, indícame el día y la hora que prefieres."
    "Lo siento, ese horario ya está reservado. ¿Te parece bien el lunes a las 11:15 AM? 😊"

    **INSTRUCCIONES ESTRICTAS**:
    1. NO saludes.
    2. Si existe disponibilidad en la agenda, debes sugerir un horario y solicitar confirmación.
    3. Si el cliente sugiere un horario que ya está ocupado, responde indicando que el horario está ocupado y sugiere un horario alternativo disponible.
    4. Asegúrate de **verificar la agenda antes de confirmar** cualquier cita.
    5. Respuestas cortas ideales para enviar por WhatsApp con emojis.
    6. Revisa el historial de conversación y la agenda actual:${schedule}  para calcular el día, fecha y hora que no tenga conflicto con otra hora ya agendada tomando encuenta la fecha del dia de hoy ${currentDay}.
    -----------------------------
    Respuesta útil en primera persona:`;
};

/**
 * Hable sobre todo lo referente a agendar citas, revisar historial saber si existe huecos disponibles
 */
const flowScheduleTechno = addKeyword(EVENTS.ACTION).addAction(async (ctx, { extensions, state, flowDynamic, gotoFlow }) => {
    try {
        console.log('flowScheduleTechno')
        const currentState = state.getMyState() || {};
        console.log(currentState)
        reset(ctx, gotoFlow, 360000)
        resetPrevious(ctx, 180000, flowDynamic, currentState.userName)
        if(currentState.birthday === true){
            return console.log("no sigue el flujo")
        }
        await flowDynamic('dame un momento para consultar la agenda...')
        const ai = extensions.ai as AIClass
        const history = getHistoryParse(state)
        const list = await getCurrentCalendar()
        console.log(history)
        const promptSchedule = generateSchedulePrompt(list?.length ? list : 'ninguna', history)
        console.log(promptSchedule)
        const text = await ai.createChat([
            {
                role: 'system',
                content: promptSchedule
            },
            {
                role: 'user',
                content: `Cliente pregunta: ${ctx.body}`
            }
        ], 'qwen-max')
        console.log('flowScheduleTechno linea 69')
        console.log(text)
        await handleHistory({ content: text, role: 'assistant' }, state)
        state.update({
            scheduleTechno: true
        });
        const chunks = text.split(/(?<!\d)\.\s+/g);
        for (const chunk of chunks) {
            await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
        }
    } catch (error) {
        console.error('Error in flowSchedule:', error);
    }

})

export { flowScheduleTechno }