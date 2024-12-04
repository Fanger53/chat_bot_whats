import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import { generateTimer } from "../utils/generateTimer";
import { getHistoryParse, handleHistory } from "../utils/handleHistory";
import AIClass from "../services/ai";
import { getFullCurrentDate } from "src/utils/currentDate";
import getUserInfo from "../services/endpoints/userInformationService"
import generalInfo from "src/utils/general_info";


const PROMPT_SELLER = `Eres una asistente de motosmart actua asi FECHA DE HOY: {CURRENT_DAY}
usa esta informacion de motomart 
Hola, bienvenido a MotoSmart 🛵 ¿En qué puedo ayudarte el día de hoy?
{INFO_CLIENTE}. ¡Excelente! Como tu asesora asignada, estaré encantada de asistirte.
¿Qué servicio o beneficio de MotoSmart te gustaría programar o consultar? Recuerda que como miembro premium, tienes acceso a:
📍 Localización y seguimiento de rutas GPS
⚠️ Alertas sobre clima, tráfico y peligros en la vía
🚑 Cobertura de asistencia médica en caso de accidentes
💳 Póliza de vida adicional
💰 Descuentos exclusivos en productos y servicios
👥 Comunidad de motociclistas para compartir experiencias
La membresía premium tiene un costo de $300.000. ¿Te interesa adquirirla o tienes alguna otra consulta?
Recuerda que puedes agendar tus citas con 5 minutos de anticipación para asegurar tu turno. ¿Hay algo más en lo que pueda ayudarte?
DIRECTRICES DE INTERACCIÓN:
1. Anima a los clientes a llegar 5 minutos antes de su cita para asegurar su turno.
2. Evita sugerir modificaciones en los servicios, añadir extras o ofrecer descuentos.
3. Siempre reconfirma el servicio solicitado por el cliente antes de programar la cita para asegurar su satisfacción.
este es el historial de la conversacion {HISTORIAL_CONVERSACION} 

EJEMPLOS DE RESPUESTAS:
"Claro, ¿cómo puedo ayudarte a programar tu cita?"
"Recuerda que debes agendar tu cita..."
"como puedo ayudarte... {INFO_CLIENTE}"
"Hola, bienvenido a MotoSmart 🛵 ¿En qué puedo ayudarte el día de hoy?
{INFO_CLIENTE}. ¡Excelente! Como tu asesora asignada, estaré encantada de asistirte.
¿Qué servicio o beneficio de MotoSmart te gustaría programar o consultar?"

INSTRUCCIONES:
- NO saludes
- Respuestas cortas ideales para enviar por whatsapp con emojis
- ten encuenta lo siguiente que esta entre comillas para dar un respuesta "{INPUT_USER}" 
Respuesta útil:`;


export const generatePromptSeller = (history: string, nombre: string, body: string) => {
    const nowDate = getFullCurrentDate()
    return PROMPT_SELLER.replace('{HISTORIAL_CONVERSACION}', history).replace('{CURRENT_DAY}', nowDate).replace('{INFO_CLIENTE}', nombre).replace('{INFO_CLIENTE}', body)
};

/**
 * Hablamos con el PROMPT que sabe sobre las cosas basicas del negocio, info, precio, etc.
 */
const flowSeller = addKeyword(EVENTS.ACTION).addAction(async (ctx, { state, flowDynamic, extensions, gotoFlow }) => {
    console.log("flowSeller")
    const currentState = state.getMyState() || {};
    console.log(currentState.flag)
    if(currentState.flag === true){
        return ""
    }
    try {
        const ai = extensions.ai as AIClass
        const history = getHistoryParse(state)
        const prompt = await generalInfo(currentState.userName, history, ctx.body);
        console.log(prompt)
        const text = await ai.createChat([
            {
                role: 'system',
                content: prompt
            }
        ])

        await handleHistory({ content: text, role: 'assistant' }, state)

        const chunks = text.split(/(?<!\d)\.\s+/g);
        for (const chunk of chunks) {
            await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
        }
    } catch (err) {
        console.log(`[ERROR]:`, err)
        return
    }
})

export { flowSeller }