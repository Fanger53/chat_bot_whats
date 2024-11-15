import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import flowInfo from "src/flows/info.flows";
import AIClass from "src/services/ai";
import { handleHistory } from "src/utils/handleHistory";

const flowNegativeAnswerSmartTravel = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state }) => {
        try {
            const currentState = state.getMyState()
            console.log('flowNegativeAnswerSmartTravel')
            await flowDynamic([
                {
                    body: `Esta bien, lamento que no desees mas infomacion, sin embargo puedes comunicarte de nuevo con nosotros cuando desees mas informacion`,
                    delay: 2500 
                },
                {
                    body: '¿puedo ayudarte con algo mas?',
                    delay: 2500 
                }
            ]);
            
        } catch (error) {
            console.error('[ERROR in initial API check]:', error);
            await flowDynamic('Lo siento, hubo un error.');
            return true;
        }
    })
    .addAction({ capture: true}, async (ctx, { flowDynamic, state, gotoFlow, extensions }) => {
        try {
            const currentState = state.getMyState();
            const userMessage = ctx.body.toLowerCase();
            const ai = extensions.ai as AIClass;
            const prompt = `Analiza la siguiente respuesta del usuario: "${userMessage} bajo el contexto de que la respuesta es de esta pregunta ¿te puedo ayudar con algo mas?"
                    Instrucciones estrictas:
                    - Si la respuesta contiene CUALQUIERA de estas palabras clave, devuelve OBLIGATORIAMENTE true:
                    * sí
                    * claro
                    * ok
                    * correcto
                    * genial
                    * bueno
                    * perfecto
                    * entendido
                    * de acuerdo
                    * está bien
                    * correcto

                    - Analiza el sentido general de la respuesta
                    - Si la respuesta es afirmativa o muestra disposición positiva, devuelve true
                    - Si la respuesta es negativa o muestra dudas, devuelve false

                    Criterios de positividad:
                    - Presencia de palabras afirmativas
                    - Tono de aceptación
                    - Ausencia de palabras negativas
                    -preguntas que aunque tienen palabras negativas ejemplo: Mi Gps no me esta dando la ubicacion no se refiere al contexto

                    Responde SOLO con true o false. Sin explicaciones adicionales.`;

            const response = await ai.createChat([
                {
                    role: 'system',
                    content: prompt
                }
            ]);
            
            const isNegative = response.trim() === 'false';
            const isPositive = response.trim() === 'true';
            console.log(isNegative)
            if (isNegative === false) {
                await flowDynamic([
                    {
                        body: '¡Muy bien!',
                        delay: 2000 
                    },
                    {
                        body: 'Gracias por comunicarte con MotoSmart 🤜🤛.\n\Se un motociclista ejemplar, queremos que siempre regreses a casa 🛵🤟😎',
                        delay: 2500 
                    }
                ]);
            } else{
                state.update({ 
                    is_positive: true,
                    prompt: userMessage
                });
                gotoFlow(flowInfo)
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
    })
   

export default flowNegativeAnswerSmartTravel;