import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import { generateTimer } from "../utils/generateTimer";
import { getHistoryParse, handleHistory } from "../utils/handleHistory";
import AIClass from "../services/ai";
import { getFullCurrentDate } from "src/utils/currentDate";
import getUserInfo from "../services/endpoints/userInformationService";
import flowPhoneNumber from "./flowHelpers/phoneNumber.flow";
import flowGivePoints from "./flowHelpers/GivePoints.flow";
import postPoints from "src/services/endpoints/postPoints";

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

const POSITIVE_WORDS = [
    'si',
    'sí',
    'ok',
    'okay',
    'yes',
    'yeah',
    'claro',
    'dale',
    'por supuesto',
    'afirmativo',
    'correcto',
    'efectivamente',
    'exacto',
    'vale'
];

const NEGATIVE_WORDS = [
    'no',
    'nop',
    'nope',
    'negativo',
    'nel'
];

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
    .addAction(async (ctx, { flowDynamic, state }) => {
        try {
            const userInfo = await getUserInfo(ctx.from);
            console.log("Checking user info:", userInfo);
            
            if (userInfo && userInfo.nombre && userInfo.puntos_actuales !== undefined) {
                await flowDynamic([
                    {
                        body: `Gracias por comunicarte con MotoSmart, la única app diseñada para motociclistas como tu 😎🛵`,
                        delay: 1000
                    },
                    {
                        body: ` Hola ${userInfo.nombre}, Mi nombre es sofia y  voy a ser tu asesora asignada`,
                        delay: 2500
                    },
                    {
                        body: `${userInfo.nombre}, permíteme felicitarte por tu cumpleaños 🛵🎉🥳 todo el equipo MotoSmart desea que tengas un año lleno de muchos éxitos, bendiciones y mucha salud para que alcances todas tus metas🤜🤛`,
                        delay: 2000
                    },
                    {
                        body: `y ${userInfo.nombre} por favor no olvides guardar nuestro número 3157444950 para que estes enterado de todos los descuentos y promociones que tenemos para ti`,
                        delay: 2500 
                    },
                    {
                        body: `¿Me podrías confirmar tu nombre?`,
                        delay: 2500 
                    }
                ]);
            } else {
                // Si no hay info del usuario, iniciamos el flujo de captura
                await flowDynamic([{
                    body: 'Gracias por comunicarte con MotoSmart, la única app diseñada para motociclistas como tu 😎🛵\nPara entregarte tu regalo de cumpleaños, necesito confirmar algunos datos.',
                    delay: 1000
                }]);
            }
        } catch (error) {
            console.error('[ERROR in initial API check]:', error);
            await flowDynamic('Lo siento, hubo un error. Vamos a proceder con la captura de datos.');
        }
    })
    .addAnswer(
        '¿Me podrías confirmar tu nombre?',
        { capture: true, buttons: [{ body: 'Cancelar registro' }] },
        async (ctx, { flowDynamic, state }) => {
            console.log("Capturing name:", ctx.body);
            if (ctx.body === 'Cancelar registro') {
                return flowDynamic('Has cancelado el registro. ¿En qué más puedo ayudarte?');
            }
            
            try {
                const userName = ctx.body;
                await state.update({ userName: userName });
                await flowDynamic(`Gracias ${userName}! ¿Me podrías confirmar tu número de celular registrado en MotoSmart?`);
            } catch (error) {
                console.error('[ERROR capturing name]:', error);
                await flowDynamic('Hubo un error. ¿Podrías decirme tu nombre nuevamente?');
            }
        }
    )
    .addAnswer(
        ['Por favor, ingresa tu número de celular registrado', 'Asegúrate de ingresarlo en formato correcto'],
        { capture: true },
        async (ctx, { flowDynamic, state, gotoFlow, endFlow }) => {
            console.log("Capturing phone:", ctx.body);
            try {
                const phone = `57${ctx.body.trim()}`
                const currentState = state.getMyState()
                const userInfo = await getUserInfo(phone);

                if (userInfo && userInfo.puntos_actuales !== undefined) {
                    const userData = {
                        ...userInfo,
                        nombre: currentState.userName || userInfo.nombre
                    };
                    await state.update({ phone:  phone });

                    await flowDynamic([
                        {
                            body: `¡Excelente ${userData.nombre}! He confirmado tu información. Tienes ${userData.puntos_actuales} MotoPuntos acumulados. 🎉`,
                            delay: 1000
                        },
                    ]);
                    return true;
                } else {
                    await flowDynamic([
                        {
                            body: 'No encontré tu registro con ese número. ¿Podrías verificarlo nuevamente?',
                            delay: 1000
                        }
                    ]);
                    console.log("lina 170")
                    // Volver a pedir el número
                    return gotoFlow(flowPhoneNumber)
                }
            } catch (error) {
                console.error('[ERROR capturing phone]:', error);
                await flowDynamic('Ocurrió un error. ¿Podrías ingresar tu número nuevamente?');
                return false;
            }
        }
    )
    .addAnswer(
        ['Por favor, confirma si los motopuntos coinciden con tu app (responde sí o no)'],
        { capture: true },
        async (ctx, { flowDynamic, state }) => {
            try {
                const userMessage = ctx.body.toLowerCase();
                
                // Verificar respuesta positiva
                const isPositive = POSITIVE_WORDS.some(word => userMessage.includes(word));
                // Verificar respuesta negativa
                const isNegative = NEGATIVE_WORDS.some(word => userMessage.includes(word));
                
                if (isPositive) {
                    await postPoints(ctx.from, "true");
                    await flowDynamic([
                        {
                            body: '¡Registro completado! Procederemos con tu regalo de cumpleaños. 🎉',
                            delay: 1000
                        }
                    ]);
                    await state.update({ registered: true });
                } else if (isNegative) {
                    await flowDynamic([
                        {
                            body: 'Entiendo. Si cambias de opinión, puedes intentarlo nuevamente más tarde.',
                            delay: 1000
                        }
                    ]);
                } else {
                    await flowDynamic([
                        {
                            body: 'No he podido entender tu respuesta. Por favor, responde con un "sí" o "no".',
                            delay: 1000
                        }
                    ]);
                }
            } catch (error) {
                console.error('Error en el proceso de registro:', error);
                await flowDynamic([
                    {
                        body: 'Lo siento, ha ocurrido un error. Por favor, intenta nuevamente.',
                        delay: 1000
                    }
                ]);
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