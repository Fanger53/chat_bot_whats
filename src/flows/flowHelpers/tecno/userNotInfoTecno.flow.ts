import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import AIClass from "../../../services/ai/index.js";
import flowPhoneNumberTecno from "./phoneNumberTecno.flow.js";
import { reset, resetPrevious } from "../../../utils/idleCustom.js";

const flowUserNotInfoTecno = addKeyword(EVENTS.ACTION)
    .addAction( async (ctx, { flowDynamic, state, extensions, gotoFlow }) => {
            const currentState = state.getMyState() || {};
            reset(ctx, gotoFlow, 360000)
            resetPrevious(ctx, 180000, flowDynamic, currentState.userName)
            try {
                const ai = extensions.ai as AIClass;
                const prompt = `Genera una pregunta casual y amigable para pedirle el nombre a un usuario.
                Reglas:
                - Debe ser una pregunta corta y directa
                - Usar un tono amistoso y cercano
                - No usar lenguaje formal
                - No usar saludos
                - No añadir contexto adicional
                - Puede incluir máximo 2 emojis
                - La pregunta debe ser específicamente sobre el nombre

                Ejemplos del estilo deseado:
                "¿Me cuentas cuál es tu nombre? 😊"
                "¿Cómo te llamas? 😃"
                "¿Con quién tengo el gusto? 👋"

                Responde con una sola pregunta siguiendo este estilo.`;

                const response = await ai.createChat([
                    {
                        role: 'system',
                        content: prompt
                    }
                ]);
                await flowDynamic([
                    {
                        body: `Gracias por comunicarte con MotoSmart, la única app diseñada para motociclistas como tu 😎🛵`,
                        delay: 1000
                    },
                    {
                        body: ` Hola, Mi nombre es sofia y  voy a ser tu asesora asignada`,
                        delay: 2500
                    },
                    {
                        body: response
                    }
                ]);
                return true;
                
            } catch (error) {
                console.error('[ERROR capturing phone]:', error);
                await flowDynamic('Ocurrió un error. ¿Podrías ingresar tu número nuevamente?');
                return false;
            }
        }
    )
    .addAction({ capture: true, idle:3000 }, async (ctx, { flowDynamic, state, extensions, gotoFlow }) => {
                try {
                    const currentState = state.getMyState() || {};
                    reset(ctx, gotoFlow, 360000)
                    resetPrevious(ctx, 180000, flowDynamic, currentState.userName)
                    const userInput = ctx.body;
                    const ai = extensions.ai as AIClass;
                    const prompt = `Extrae el nombre de la siguiente frase o palabra: "${userInput}" el contexto es que esto es el input del user y es el nombre "${userInput}" el nombre del usuario este es el contexto "me llamo ${userInput}"
                        INSTRUCCIONES:
                        1. Si el input es un nombre solo (ejemplo: "Harold"), devuelve ese nombre directamente
                        2. Si el input es una frase (ejemplo: "me llamo Leo"), extrae solo el nombre
                        3. NO agregues ningún texto adicional en la respuesta
                        4. NO hagas preguntas ni solicites información adicional
                        5. La respuesta debe ser ÚNICAMENTE el nombre extraído

                        Ejemplos válidos:
                        Input -> Respuesta esperada
                        "Harold" -> "Harold"
                        "me llamo Leo" -> "Leo"
                        "soy Pedro" -> "Pedro"
                        "Angela" -> "Angela"
                        "Andres" -> "Andres"
                        "Mi nombre es María" -> "María"

                        IMPORTANTE: 
                        - Si recibes una sola palabra, asume que es un nombre
                        - NO incluyas puntuación ni texto adicional
                        - NO solicites información adicional
                        - NO hagas preguntas de seguimiento   no olvides el contexto es que esto es el input del user y es el nombre "${userInput}"`;
                    const response = await ai.createChat([
                    { role: 'system', content: prompt }
                    ]);

                    // Extraer el nombre de la respuesta de la IA
                    const userName = response.trim();

                    // Actualizar el estado con el nombre
                    await state.update({ userName: userName });

                    // Generar una respuesta personalizada utilizando el nombre
                    await flowDynamic(`Gracias ${userName}! ¿Me podrías confirmar tu número de celular registrado en MotoSmart?, para continuar con la entrega de los Motopuntos`);
                    gotoFlow(flowPhoneNumberTecno);
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


    export default flowUserNotInfoTecno;