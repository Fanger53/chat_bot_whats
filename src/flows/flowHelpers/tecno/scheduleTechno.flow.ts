import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import AIClass from "../../../services/ai";
import { getHistoryParse, handleHistory } from "../../../utils/handleHistory";
import { generateTimer } from "../../../utils/generateTimer";
import { getCurrentCalendar } from "../../../services/calendar";
import { getFullCurrentDate } from "src/utils/currentDate";
import { reset, resetPrevious } from "src/utils/idleCustom";

const generateSchedulePrompt = (schedule: string, history: string, suggestedTimes: string[]) => {
    const currentDay = getFullCurrentDate();
    return `Como ingeniero de inteligencia artificial especializado en la programación de reuniones, tu objetivo es analizar la conversación, determinar la intención del cliente y gestionar su preferencia de fecha y hora para programar una cita. La cita durará aproximadamente 15 minutos y solo puede ser programada entre las 9am y las 4pm, de lunes a viernes, y solo para la semana en curso entre los horarios establecidos.
    Datos proporcionados:
    - Fecha de hoy: ${currentDay}
    - Reuniones ya agendadas:
    -----------------------------------
    ${schedule}
    - Horarios ya sugeridos:
    -----------------------------------
    ${suggestedTimes.join(", ") || "ninguno"}
    - Historial de conversación:
    -----------------------------------
    ${history}
    Reglas estrictas para generar respuestas:
    1. NO saludes ni uses frases introductorias.
    2. pregunta en que horario le sirve al usuario..
    3. Si el cliente sugiere un horario que ya está ocupado, responde indicando que el horario está ocupado y sugiere un horario alternativo disponible.
    4. Si el cliente indica que no puede asistir en un día específico, pregunta por otra fecha u hora dentro del rango permitido (9am-4pm, lunes-viernes, semana en curso).
    5. Si no hay más disponibilidad en la semana, informa al cliente que no hay horarios disponibles y ofrece alternativas generales (por ejemplo, "¿Te gustaría que te contactáramos la próxima semana?").
    6. Asegúrate de verificar la agenda antes de confirmar cualquier cita.
    7. Respuestas cortas y claras, ideales para enviar por WhatsApp, con emojis para mantener un tono amigable.
    8. Revisa el historial de conversación y la agenda actual (${schedule}) para calcular el día, fecha y hora que no tenga conflicto con otra hora ya agendada, tomando en cuenta la fecha del día de hoy (${currentDay}).
    9. Evita sugerir horarios que ya fueron mencionados en esta conversación (${suggestedTimes.join(", ") || "ninguno"}).

    Ejemplos de respuestas adecuadas:
    - "Por supuesto, tengo un espacio disponible mañana, ¿a qué hora te resulta más conveniente? 😊"
    - "Sí, tengo un espacio disponible hoy, ¿a qué hora te resulta más conveniente? 🕒"
    - "Lo siento, ese horario ya está reservado. ¿Te parece bien otro horario? 😊"
    - "Entiendo, si no puedes ese día, ¿qué otro día te resulta conveniente esta semana? 📅"
    - "No hay más disponibilidad esta semana. ¿Te gustaría que te contactáramos la próxima semana? 🙌"

    Nota Importante:
    - Solo devuelve una respuesta útil y directa, sin texto adicional ni explicaciones innecesarias.
    - siempre revisa el ${schedule} antes de sugerir una hora para la cita.
    IMPRESCINDIBLE:
    - si el usuario propone una hora fuera de la hora de atncion que es de 9am a 4pm, informale que solo se atiende en ese horario.`;
};

/**
 * Hable sobre todo lo referente a agendar citas, revisar historial saber si existe huecos disponibles
 */
const flowScheduleTechno = addKeyword(EVENTS.ACTION).addAction(async (ctx, { extensions, state, flowDynamic, gotoFlow }) => {
    try {
        console.log('flowScheduleTechno');
        const currentState = state.getMyState() || {};
        console.log(currentState);
        reset(ctx, gotoFlow, 360000);
        resetPrevious(ctx, 180000, flowDynamic, currentState.userName);

        if (currentState.birthday === true) {
            return console.log("no sigue el flujo");
        }

        await flowDynamic('dame un momento para consultar la agenda...');
        const ai = extensions.ai as AIClass;
        const history = getHistoryParse(state);
        const list = await getCurrentCalendar();
        const suggestedTimes = currentState.suggestedTimes || [];

        // Generar el prompt con el historial y los horarios ya sugeridos
        const promptSchedule = generateSchedulePrompt(list?.length ? list : 'ninguna', history, suggestedTimes);
        console.log(promptSchedule);

        // Enviar el prompt al modelo de IA
        const text = await ai.createChat([
            {
                role: 'system',
                content: promptSchedule,
            },
            {
                role: 'user',
                content: `Cliente pregunta: ${ctx.body}`,
            },
        ], 'qwen-max');

        console.log('Respuesta del modelo:', text);

        // Guardar la respuesta en el historial
        await handleHistory({ content: text, role: 'assistant' }, state);

        // Actualizar el estado con los horarios sugeridos
        const newSuggestedTimes = [...suggestedTimes, ...extractSuggestedTimes(text)];
        state.update({
            scheduleTechno: true,
            suggestedTimes: newSuggestedTimes,
        });

        // Dividir la respuesta en chunks y enviarla al usuario
        const chunks = text.split(/(?<!\d)\.\s+/g);
        for (const chunk of chunks) {
            await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
        }
    } catch (error) {
        console.error('Error in flowSchedule:', error);
    }
});

// Función para extraer los horarios sugeridos de la respuesta del modelo
function extractSuggestedTimes(response: string): string[] {
    const timeRegex = /\b(?:lunes|martes|miércoles|jueves|viernes)\s+a\s+las\s+\d{1,2}:\d{2}\s+(AM|PM)\b/gi;
    const matches = response.match(timeRegex);
    return matches || [];
}

export { flowScheduleTechno };