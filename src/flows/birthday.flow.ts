import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import { generateTimer } from "../utils/generateTimer";
import { getHistoryParse, handleHistory } from "../utils/handleHistory";
import AIClass from "../services/ai";
import { getFullCurrentDate } from "src/utils/currentDate";
import getUserInfo from "../services/endpoints/userInformationService";

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

const flowCaptureUserData = addKeyword(['cumpleaños', 'cumple', 'regalo'])
    .addAction(async (ctx, { flowDynamic, state }) => {
        try {
            // Intenta obtener información del usuario desde la API
            const userInfo = await getUserInfo(ctx.from);

            if (userInfo && userInfo.nombre && userInfo.puntos_actuales !== undefined) {
                // Si encuentra información del usuario, actualiza el estado
                await state.update({ userInfo });
                console.log("si encuentra la informacion")
                // Responde con un mensaje personalizado
                await flowDynamic([
                    {
                        body: `Gracias por comunicarte con MotoSmart, la única app diseñada para motociclistas como tu 😎🛵`,
                        delay: 1000
                    },
                    {
                        body: `¡Hola ${userInfo.nombre}! Veo que tienes ${userInfo.puntos_actuales} MotoPuntos acumulados. 🎉`,
                        delay: 1500
                    },
                    {
                        body: `${userInfo.nombre}, permíteme felicitarte por tu cumpleaños 🛵🎉🥳 todo el equipo MotoSmart desea que tengas un año lleno de muchos éxitos, bendiciones y mucha salud para que alcances todas tus metas🤜🤛`,
                        delay: 2000
                    }
                ]);
                
                return;
            }

            // Si no encuentra información, inicia el flujo de captura
            await flowDynamic([
                {
                    body: 'Gracias por comunicarte con MotoSmart, la única app diseñada para motociclistas como tu 😎🛵\nPara entregarte tu regalo de cumpleaños, necesito confirmar algunos datos.',
                    delay: 1000
                }
            ]);
        } catch (error) {
            console.log('[ERROR in initial API check]:', error);
            // Si hay error en la API, inicia el flujo de captura normal
            await flowDynamic('Gracias por comunicarte con MotoSmart, la única app diseñada para motociclistas como tu 😎🛵\nPara entregarte tu regalo de cumpleaños, necesito confirmar algunos datos.');
        }
    })
    .addAnswer(
        '¿Me podrías confirmar tu nombre completo?',
        { capture: true },
        async (ctx, { flowDynamic, state }) => {
            console.log("aqui cuando no encuentra el nombre en la api ")
            console.log(state)
            try {
                const userName = ctx.body;
                await state.update({ userName });
                return flowDynamic(`Gracias ${userName}! ¿Me podrías confirmar tu número de celular registrado en MotoSmart?`);
            } catch (error) {
                console.log('[ERROR capturing name]:', error);
                return flowDynamic('Lo siento, hubo un error al procesar tu nombre. ¿Podrías intentarlo nuevamente?');
            }
        }
    )
    .addAnswer(
        null,
        { capture: true },
        async (ctx, { flowDynamic, state }) => {
            try {
                const phone = ctx.body;
                const currentState = await getStateData(state);
                
                // Intenta obtener información del usuario nuevamente con el número proporcionado
                const userInfo = await getUserInfo(phone);
                
                if (userInfo && userInfo.puntos_actuales !== undefined) {
                    // Actualiza el estado con la información completa
                    const userData = {
                        ...userInfo,
                        nombre: currentState.userName || userInfo.nombre
                    };
                    await state.update({ userInfo: userData, phone });
                    
                    return flowDynamic([
                        {
                            body: `¡Excelente ${userData.nombre}! He confirmado tu información. Tienes ${userData.puntos_actuales} MotoPuntos acumulados. 🎉`,
                            delay: 1000
                        },
                        {
                            body: 'Ahora procederé con la entrega de tu regalo de cumpleaños. 🎁',
                            delay: 1500
                        }
                    ]);
                } else {
                    return flowDynamic([
                        {
                            body: 'Lo siento, no encontré tu registro en nuestra base de datos con ese número. ¿Podrías verificar si el número está correcto?',
                            delay: 1000
                        }
                    ]);
                }
            } catch (error) {
                console.log('[ERROR capturing phone]:', error);
                return flowDynamic('Hubo un error al verificar tu información. Por favor, intenta nuevamente.');
            }
        }
    );


    export const generatePromptSeller = async (history: string, phone: string) => {
        const nowDate = getFullCurrentDate()
        const userInfo = await getUserInfo(phone);
        console.log(userInfo)
        return PROMPT_BIRTHDAY.replace('{HISTORIAL_CONVERSACION}', history).replace('{CURRENT_DAY}', nowDate).replace('{INFO_USUARIO}', userInfo || '')
    };
// Flujo principal mejorado
const flowBirthday = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { state, flowDynamic, extensions }) => {
        try {
            const ai = extensions.ai as AIClass;
            const history = getHistoryParse(state);
            const currentState = await getStateData(state);
            
            // Usar información del estado si está disponible
            let userInfoForPrompt = '';
            console.log(currentState.userInfo)
            if (currentState.userInfo) {
                userInfoForPrompt = JSON.stringify(currentState.userInfo);
            } else {
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