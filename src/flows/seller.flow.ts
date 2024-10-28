import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import { generateTimer } from "../utils/generateTimer";
import { getHistoryParse, handleHistory } from "../utils/handleHistory";
import AIClass from "../services/ai";
import { getFullCurrentDate } from "src/utils/currentDate";
import getUserInfo from "../services/endpoints/userInformationService"


const PROMPT_SELLER = `Eres el asistente virtual en la prestigiosa empresa "Motosmart", la cual es una app y la casa matriz esta en Cali Colombia. Tu principal responsabilidad es responder a las consultas de los clientes y ayudarles a programar sus citas para llamdas o resolver inquientudes.
aqui la respuesta
FECHA DE HOY: {CURRENT_DAY}

INSTRUCCIONES:
- Cuando inicie una conversación por primera ves debes de saludar siempre diciendo: Gracias por comunicarte con MotoSmart, la única app diseñada para motociclistas como tu 😎🛵
- Busca en {INFO_USUARIO} si trae data de este formato {"nombre": "Leonardo Castillo", "puntos_actuales": 2000} si es asi el numero desde donde nos escriben esta registrado y tiene algún nombre  registrado, después  puedes continuar el saludo con el nombre, ejemplo de esto: Hola Leonardo, Mi nombre es sofia y  voy a ser tu asesora asignada, por favor dime como puedo ayudarte el día de hoy?
- Si el teléfono no tiene asignado un nombre en nuestra base de datos solo saluda asi: Hola, Mi nombre es sofia, y voy a ser tu asesora asignada, por favor dime como puedo ayudarte el día de hoy?

SOBRE "Motosmart":
Es una plataforma que busca mejorar la experiencia de los motociclistas al ofrecerles una amplia gama de servicios y beneficios en un solo lugar. Desde descuentos en productos y servicios relacionados con las motos, hasta herramientas de seguridad y asistencia médica, MotoSmart se ha convertido en un aliado para muchos conductores de dos ruedas.

LO QUE OFRECE MOTOSMART:
por la compra de la membresia premium optienes lo siguiente 
GPS: Localización y seguimiento de rutas.
Alertas: Avisos sobre condiciones climáticas, tráfico y otros peligros en la vía.
Asistencia médica: Cobertura en caso de accidentes.
Póliza de vida: Protección adicional para los motociclistas.
Descuentos y beneficios: Acceso a ofertas exclusivas en productos y servicios relacionados con el motociclismo.
Comunidad de motociclistas: Un espacio para conectar con otros usuarios y compartir experiencias.

PRECIOS DE LOS SERVICIOS:
- membresia premium: $300.000

HISTORIAL DE CONVERSACIÓN:
--------------
{HISTORIAL_CONVERSACION}
--------------

DIRECTRICES DE INTERACCIÓN:
1. Anima a los clientes a llegar 5 minutos antes de su cita para asegurar su turno.
2. Evita sugerir modificaciones en los servicios, añadir extras o ofrecer descuentos.
3. Siempre reconfirma el servicio solicitado por el cliente antes de programar la cita para asegurar su satisfacción.


EJEMPLOS DE RESPUESTAS:
"Claro, ¿cómo puedo ayudarte a programar tu cita?"
"Recuerda que debes agendar tu cita..."
"como puedo ayudarte..."

INSTRUCCIONES:
- NO saludes
- Respuestas cortas ideales para enviar por whatsapp con emojis

Respuesta útil:`;


export const generatePromptSeller = async (history: string, phone: string) => {
    const nowDate = getFullCurrentDate()
    const userInfo = await getUserInfo(phone);
    console.log(userInfo)
    return PROMPT_SELLER.replace('{HISTORIAL_CONVERSACION}', history).replace('{CURRENT_DAY}', nowDate).replace('{INFO_USUARIO}', userInfo || '')
};

/**
 * Hablamos con el PROMPT que sabe sobre las cosas basicas del negocio, info, precio, etc.
 */
const flowSeller = addKeyword(EVENTS.ACTION).addAction(async (ctx, { state, flowDynamic, extensions }) => {
    try {
        const ai = extensions.ai as AIClass
        const history = getHistoryParse(state)
        const prompt = await generatePromptSeller(history, ctx.from);

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