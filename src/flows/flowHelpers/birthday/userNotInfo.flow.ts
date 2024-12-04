import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import getUserInfo from "src/services/endpoints/userInformationService";
import flowGivePoints from "./givePoints.flow";
import AIClass from "src/services/ai";
import flowPhoneNumber from "./phoneNumber.flow";
import { reset, start } from "src/utils/idleCustom";

const flowUserNotInfo = addKeyword(EVENTS.ACTION)
    .addAction( async (ctx, { flowDynamic, state, extensions }) => {
            console.log('flowUserNotInfo')
            console.log("Capturing phone:", ctx.body);
            start
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
    .addAction({ capture: true, idle:30000 }, async (ctx, { flowDynamic, state, extensions, gotoFlow }) => {
                try {
                    reset
                    const userInput = ctx.body;
                    
                    const ai = extensions.ai as AIClass;
                    const prompt = `Extrae el nombre de la siguiente frase: "${userInput}" solo el nombre no el prompt, ejemplo de la frase "me llamo leo" devuelve leo, solo devuelve el nombre otro ejemplo es que "${userInput}" puede ser solo el nombre: leo entoces tu respuesta sera leo, solo responde el nombre nada mas ninguna frase mas si el nombre es angela responde angela, si el nombre extraido es andres responde andres nada mas `;
                    const response = await ai.createChat([
                    { role: 'user', content: prompt }
                    ]);

                    // Extraer el nombre de la respuesta de la IA
                    const userName = response.trim();

                    // Actualizar el estado con el nombre
                    await state.update({ userName: userName });

                    // Generar una respuesta personalizada utilizando el nombre
                    await flowDynamic(`Gracias ${userName}! ¿Me podrías confirmar tu número de celular registrado en MotoSmart?, para continuar con la entrega de los Motopuntos`);
                    gotoFlow(flowPhoneNumber);
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


    export default flowUserNotInfo;