import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import { generateTimer } from "../utils/generateTimer";
import { getHistoryParse, handleHistory } from "../utils/handleHistory";
import AIClass from "../services/ai";
import { getFullCurrentDate } from "src/utils/currentDate";
import getUserInfo from "../services/endpoints/userInformationService";
import flowUserNotInfo from "./flowHelpers/userNotInfo.flow";
import flowUserWithInfo from "./flowHelpers/userWithInfo.flow";

// Función auxiliar para manejar el estado de forma segura
const getStateData = async (state) => {
    try {
        const currentState = await state.getAllState();
        return currentState || {};
    } catch (error) {
        console.log('[ERROR getting state]:', error);
        return {};
    }
};


const PROMPT_BIRTHDAY = `Eres el asistente virtual en la prestigiosa empresa "Motosmart", la cual es una app y la casa matriz esta en Cali Colombia. Tu principal responsabilidad es guiar al usuario que está de cumpleaños.

FECHA DE HOY: {CURRENT_DAY}
INFORMACIÓN DEL USUARIO: {INFO_USUARIO}

INSTRUCCIONES DE RESPUESTA:

1. Si NO hay información del usuario (INFO_USUARIO está vacío):
   - Saluda: "Gracias por comunicarte con MotoSmart, la única app diseñada para motociclistas como tu 😎🛵"
   - Di: "Para poder entregarte tu regalo de cumpleaños, necesito confirmar algunos datos."
   - Pide: "Por favor, compárteme tu nombre completo."
   - Espera la respuesta del usuario.

2. Si HAY información del usuario (formato: {"nombre": "Nombre", "puntos_actuales": X}):
   - Saluda usando el nombre: "Hola [nombre], gracias por comunicarte con MotoSmart, la única app diseñada para motociclistas como tu 😎🛵"
   - Felicita: "[nombre], permítame felicitarle por su cumpleaños 🛵🎉🥳"
   - Continúa con el proceso de regalo según los puntos actuales.

3. Proceso de regalo:
   - Recuerda guardar número: "Por favor guarda nuestro número 3157444950"
   - Verifica correo/celular registrado
   - Confirma MotoPuntos actuales
   - Otorga regalo de 1000 MotoPuntos
   - Solicita verificación en la app

HISTORIAL DE CONVERSACIÓN:
--------------
{HISTORIAL_CONVERSACION}
-------------

Respuesta útil:`;

const flowCaptureUserData = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
        try {
            const userInfo = await getUserInfo(ctx.from);
            console.log("Checking user info:", userInfo);
            
            if (userInfo && userInfo.nombre && userInfo.puntos_actuales !== undefined) {
                await state.update({ userName: userInfo.nombre,  points: userInfo.puntos_actuales });
                return gotoFlow(flowUserWithInfo);
            } else {
                // Si no hay info del usuario, iniciamos el flujo de captura
                return gotoFlow(flowUserNotInfo)
            }
        } catch (error) {
            console.error('[ERROR in initial API check]:', error);
            await flowDynamic('Lo siento, hubo un error. Vamos a proceder con la captura de datos.');
            return true;
        }
    })

    export const generatePromptSeller = async (history: string, phone: string) => {
        const nowDate = getFullCurrentDate()
        const userInfo = await getUserInfo(phone);
        console.log(userInfo)
        return PROMPT_BIRTHDAY.replace('{HISTORIAL_CONVERSACION}', history).replace('{CURRENT_DAY}', nowDate).replace('{INFO_USUARIO}', userInfo || '')
    };
// Flujo principal mejorado
const flowBirthday = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { state, flowDynamic, extensions }) => {
        console.log("linea 165")
        try {
            const ai = extensions.ai as AIClass;
            const history = getHistoryParse(state);
            const currentState = await getStateData(state);
            console.log("aqui linea 167")
            // Usar información del estado si está disponible
            let userInfoForPrompt = '';
            console.log(currentState.userInfo)
            if (currentState.userInfo) {
                userInfoForPrompt = JSON.stringify(currentState.userInfo);
            } else {
                console.log("linea 177")
                console.log(state)
                const userInfo = await getUserInfo(ctx.from);
                if (userInfo) {
                    userInfoForPrompt = JSON.stringify(userInfo);
                    await state.update({ userInfo });
                }
            }

            const prompt = await generatePromptSeller(history, ctx.from);
            const promptWithUserInfo = prompt.replace('{INFO_USUARIO}', userInfoForPrompt || '');

            const text = await ai.createChat([
                {
                    role: 'system',
                    content: promptWithUserInfo
                }
            ]);

            await handleHistory({ content: text, role: 'assistant' }, state);

            const chunks = text.split(/(?<!\d)\.\s+/g);
            for (const chunk of chunks) {
                await flowDynamic([{ 
                    body: chunk.trim(), 
                    delay: generateTimer(150, 250) 
                }]);
            }
        } catch (err) {
            console.log(`[ERROR in flowBirthday]:`, err);
            await flowDynamic('Lo siento, tuve un problema procesando tu solicitud. ¿Podrías intentarlo nuevamente?');
        }
    });

export { flowBirthday, flowCaptureUserData };