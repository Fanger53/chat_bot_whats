import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import { flowSeller } from "src/flows/seller.flow";
import AIClass from "src/services/ai";
import flowNegativeAnswerSmartTravel from "./negativeAnswerSmartTravel.flow";
import { handleHistory } from "src/utils/handleHistory";

const flowSmartTravel = addKeyword(EVENTS.ACTION)
    .addAction( async (ctx, { flowDynamic, state }) => {
        try {
            const currentState = state.getMyState()
            console.log('flowSmartTravel')
            await flowDynamic([
                {
                    body: `Genial ${currentState.userName}, ahora puedes usar tus MotoPuntos para conseguir descuentos y regalos en MotoSmart 😎🎉`,
                    delay: 2500 
                },
                {
                    body: `¿Por otra parte sabias que por ser un usuario premium tienes un bono activo por $200.000 pesos  para tus proximas vacaciones?`,
                    delay: 2500 
                }
            ]);
            
        } catch (error) {
            console.error('[ERROR in initial API check]:', error);
            await flowDynamic('Lo siento, hubo un error.');
            return true;
        }
    })
    .addAction({ capture: true}, async (ctx, { flowDynamic, state}) => {
                try {
                    const currentState = state.getMyState();
                    await flowDynamic(`Asi es ${currentState.userName}, por ser un usuario premium tienes activo un bono por $200.000 pesos de descuento con nuestro aliado SmarTravel, ellos son expertos en viajes y te aseguro que te llevaras una gran experiencia\n\n¿te gustaria saber mas sobre este bono?`)

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
        )
        .addAction({ capture: true}, async (ctx, { flowDynamic, state, gotoFlow, extensions }) => {
            try {
                const currentState = state.getMyState();
                const userMessage = ctx.body.toLowerCase();
                const ai = extensions.ai as AIClass;
                const prompt = `Analiza la siguiente respuesta del usuario: "${userMessage}"
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

                    Responde SOLO con true o false. Sin explicaciones adicionales.`;

                const response = await ai.createChat([
                    {
                        role: 'system',
                        content: prompt
                    }
                ]);

                // Convertir la respuesta a un booleano
                const isPositive = response.trim() === 'true';
                console.log(isPositive)
                if (isPositive) {
                    await flowDynamic([
                        {
                            body: `genial, te voy a conectar con mi compañera sofia quien es la experta en viajes con  SmartTravel, en minutos ella se contactara por Whatsapp contigo ${currentState.userName}`,
                            delay: 2500 
                        },
                        {
                            body: `¿te puedo ayudar con algo mas?`,
                            delay: 2500 
                        }
                    ]);
                } else{
                    gotoFlow(flowNegativeAnswerSmartTravel);
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
    )
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

                // Convertir la respuesta a un booleano
                console.log("linea 152");
                console.log(response);
                const isNegative = response.trim() === 'false';
                const isPositive = response.trim() === 'true';
                console.log('linea 153')
                console.log(isPositive)
                if (isPositive === true) {
                    state.update({ 
                        flag: false
                    });
                    await handleHistory({ content: userMessage, role: 'user' }, state)
                    gotoFlow(flowSeller)
                } else {
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
                    state.update({ 
                        flag: false
                    });
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
    )

export default flowSmartTravel;