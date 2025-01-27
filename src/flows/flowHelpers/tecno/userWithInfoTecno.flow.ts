import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import AIClass from "src/services/ai";
import { handleHistory } from "src/utils/handleHistory";
import { flowScheduleTechno } from "./scheduleTechno.flow";
import { startPrevious, reset, start, resetPrevious } from "src/utils/idleCustom";
import { delay } from "@bot-whatsapp/bot/dist/utils";
// import flowFinal from "./final.flow";
// import flowSmartTravel from "./smartTravel.flow";
// import flowInTheMiddle from "./middle.flow";


const flowUserWithInfoTecno = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state, gotoFlow, extensions}) => {
        try {
            console.log("flowUserWithInfoTecno")
            const ai = extensions.ai as AIClass;
                const prompt = `Genera una pregunta casual y amigable para preguntar cómo está un usuario.
                Reglas:
                - Debe ser una pregunta corta y directa
                - Usar un tono amistoso y cercano
                - No usar lenguaje formal
                - No usar saludos
                - No añadir contexto adicional
                - Puede incluir máximo 2 emojis
                - La pregunta debe ser específicamente sobre cómo está el usuario

                Ejemplos del estilo deseado:
                "¿Cómo estás? 😊"
                "¿Qué tal va tu día? 😃"
                "¿Cómo te encuentras? 👋"

                Responde con una sola pregunta siguiendo este estilo.`;

            const response = await ai.createChat([
                {
                    role: 'system',
                    content: prompt
                }
            ]);
            const currentState = state.getMyState() || {};
            reset(ctx, gotoFlow, 360000)
            resetPrevious(ctx, 180000, flowDynamic, currentState.userName)
            console.log('flowUserWithInfoTecno');

            if (currentState && currentState.userName !== "") {
                await flowDynamic([
                    {
                        body: `Gracias por comunicarte con MotoSmart, la única app diseñada para motociclistas como tu 😎🛵`,
                        delay: 2000
                    },
                    {
                        body: ` Hola ${currentState.userName}, Mi nombre es sofia y  voy a ser tu asesora asignada`,
                        delay: 2500
                    },
                    {
                        body: response,
                        delay: 1000
                    }

                ]);
            } else {
                return false;
            }
        } catch (error) {
            console.error('[ERROR in initial API check]:', error);
            await flowDynamic('Lo siento, hubo un error. Vamos a proceder con la captura de datos.');
            return true;
        }
    })
    .addAction({ capture: true},async (ctx, { flowDynamic, state, gotoFlow, extensions}) => {
        try {
            const currentState = state.getMyState() || {};
            reset(ctx, gotoFlow, 360000)
            resetPrevious(ctx, 180000, flowDynamic, currentState.userName)
            const body = ctx.body
            const ai = extensions.ai as AIClass;
                const prompt = `Toma esto "${body}" como contexto y responde de forma positiva.
                Instrucciones:
                - No usar saludos ni nombres
                - No hacer preguntas
                - Responder como si fuera un amigo cercano hablando informalmente
                - La respuesta debe ser una afirmación o comentario cerrado
                - Mantener un tono positivo

                Ejemplos:
                "¡Genial que estés teniendo un día genial!"
                "¡Qué bueno escuchar eso!"
                "¡Me alegra saberlo!"`;

            const response = await ai.createChat([
                {
                    role: 'system',
                    content: prompt
                }
            ]);

            await flowDynamic([
                {
                    body: response,
                    delay: 2000
                },
                {
                    body: "Genial, quiero contarte los beneficios que tienes por sacar la revision tecnico mecanica con uno de nuestros aliados😎🛵",
                    delay: 2000
                }
            ]);
            
        } catch (error) {
            console.error('[ERROR in initial API check]:', error);
            await flowDynamic('Lo siento, hubo un error. Vamos a proceder con la captura de datos.');
            return true;
        }
    })
    .addAction( async (ctx, { flowDynamic, state, extensions, gotoFlow}) => {
            try {
                const currentState = state.getMyState() || {};
                reset(ctx, gotoFlow, 360000)
                resetPrevious(ctx, 180000, flowDynamic, currentState.userName)

                if (currentState && currentState.userName !== "") {
                    await flowDynamic([
                        {
                            body: `No 1. Cargaremos *5️⃣0️⃣0️⃣0️⃣ MotoPuntos* a tu perfil para que los cambies por obsequios en cualquiera de nuestras marcas aliadas 🎁`,
                            delay: 5000
                        },
                        {
                            body: `No 2. Puedes agendar una cita preferencial en nuestro CDA aliado, de esta manera no tendrás que hacer filas y menos demora tendrás 🤟`,
                            delay: 5000
                        }
                    ]);
                    if (currentState.is_premium){
                        await flowDynamic([
                            {
                                body: 'No 3. Lo mejor de todo es que recibirás un *bono de descuento de $25.000* pesos🤑 por ser un usuario MotoSmart premium activo. El valor de la revisión técnico-mecánica para el año 2025 quedó en $207.700. Con el bono de descuento entregado por MotoSmart, solo pagas $182.700.',
                                delay: 5000
                            }
                        ])
                    }
                    else {
                        await flowDynamic([
                            {
                                body: 'No 3. Lo mejor de todo es que recibirás un bono de descuento de $15.000 pesos🤑 por hacer parte de la comunidad MotoSmart. El valor de la revisión técnico-mecánica para el año 2025 quedó en $207.700. Con el bono de descuento entregado por MotoSmart, solo pagas $192.700.',
                                delay: 5000
                            }
                        ])
                    }
                    
                    await flowDynamic(`${currentState.userName}, ¿que te parecen estos beneficios por hacer parte de la comunidad MotoSmart?`);
                } else {
                    return false;
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
    .addAction({capture: true}, async (ctx, { flowDynamic, state, gotoFlow, extensions}) => {
        try {
            const currentState = state.getMyState() || {};
            reset(ctx, gotoFlow, 360000)
            resetPrevious(ctx, 180000, flowDynamic, currentState.userName)
            const body = ctx.body
            const ai = extensions.ai as AIClass;
                const prompt = `Toma esto "${body}" como contexto y responde a la pregunta: "¿Qué te parecen estos beneficios por hacer parte de la comunidad MotoSmart?". 
                Instrucciones:
                - No usar saludos ni nombres
                - No hacer preguntas
                - Responder como si fuera un amigo cercano hablando informalmente
                - La respuesta debe ser una afirmación o comentario cerrado
                - Mantener un tono positivo

                Ejemplos:
                "¡Genial que te gusten los beneficios!"
                "¡Qué bueno que te parezcan útiles!"
                "¡Me alegra saber que te gustan!"`;

            const response = await ai.createChat([
                {
                    role: 'system',
                    content: prompt
                }
            ]);

            await flowDynamic([
                {
                    body: response,
                    delay: 2000
                },
                {
                    body: "por favor dime ¿en que ciudad tienes pensado llevar tu moto a la revision tecnicomecanica?, comprobare si tenemos disponibilidad ahi 😎",
                    delay: 2000
                }
            ]);
            
        } catch (error) {
            console.error('[ERROR in initial API check]:', error);
            await flowDynamic('Lo siento, hubo un error. Vamos a proceder con la captura de datos.');
            return true;
        }
    })
    .addAction( { capture: true}, async (ctx, { flowDynamic, state, extensions, gotoFlow}) => {
                try {
                    reset(ctx, gotoFlow, 90000)
                    const currentState = state.getMyState();
                    const userMessage = ctx.body
                    resetPrevious(ctx, 25000, flowDynamic, currentState.userName)
                    console.log(userMessage)
                    const ai = extensions.ai as AIClass;
                    const prompt = `Analiza la respuesta: ${userMessage} considerando que responde a la pregunta: '¿De qué ciudad o pueblo de Colombia me está hablando?' y que se refiere a ciudades o pueblos colombianos.

                    Si la respuesta menciona directamente una de las ciudades donde tenemos sucursales CDA (Bogotá, Medellín, Cali), responde indicando que tenemos una sucursal en esa ciudad.
                    Si la respuesta menciona otra ciudad o pueblo diferente:
                    Calcula cuál es la sucursal más cercana entre Bogotá, Medellín y Cali.
                    Proporciona la distancia aproximada (en kilómetros) desde esa ciudad/pueblo a nuestra sucursal más cercana.
                    Responde de manera clara, mencionando que aunque no tenemos una sucursal en esa ciudad, indicamos la más cercana y la distancia.
                    Responde en un tono amable, breve y profesional.
                    Si no puedes interpretar la ubicación, responde con una lista clara de las sucursales disponibles:

                    Ejemplo: "No estoy segura de la ciudad que mencionas, pero nuestras sucursales están en Bogotá, Medellín y Cali.", siempre ten encuenta la ciudad que se menciona aqui: "${userMessage}", siempre ten encuenta el contexto de ${userMessage}, ya que es la ciudad que el usuario menciono.
                    Si concluyes que la ciudad es cali responde lo siguiente "Muy bien, en Cali tenemos al aliado la sucursal ubicado en la carrera 70 # 2c-32. 

                    Puedes llegar con la ubicación por Google Maps: 👇👇
                    [https://maps.app.goo.gl/5BA51ZbnyvG3RwZZ9](https://maps.app.goo.gl/5BA51ZbnyvG3RwZZ9). 

                    Recuerda exigirle al aliado que escanee tu código QR para que puedas recibir el descuento de $${currentState.is_premium ? "25.000" : "15000"} pesos y sumar 5000 MotoPuntos de obsequio por usar nuestras alianzas.

                    Nuestro aliado tiene atención de 8am a 5pm de lunes a sábado" `;

                    const response = await ai.createChat([
                        {
                            role: 'system',
                            content: prompt
                        }
                    ]);
                    flowDynamic([
                        {   body: response,
                            delay: 2000
                        },
                        {
                            body: "¿Te gustaría agendar una cita con nuestro aliado?",
                            delay: 2000
                        }
                    ])
                    
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
    .addAction( { capture:true }, async (ctx, { flowDynamic, state, extensions, gotoFlow}) => {
                try {
                    const currentState = state.getMyState() || {};
                    reset(ctx, gotoFlow, 360000)
                    resetPrevious(ctx, 180000, flowDynamic, currentState.userName)
                    const userMessage = ctx.body.toLowerCase();
                    const ai = extensions.ai as AIClass;
                    const prompt = `Analiza la respuesta del usuario: "${userMessage}" considerando que responde a la pregunta: "¿Te gustaría agendar una cita con nuestro aliado?"
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
                    
                    Si la respuesta es sobre agendar o algo relacionado positivamnete, responde con "true".
                    Si la respuesta es negativa o no relevante, responde con "false".
                    Devuelve únicamente "true" o "false" sin "explicaciones adicionales`;

                    const response = await ai.createChat([
                        {
                            role: 'system',
                            content: prompt
                        }
                    ]);

                    const isPositive = response.trim() === 'true';
                    console.log(response);
                    console.log(isPositive === true)
                    if (isPositive === true) {
                        console.log("agendar")
                        state.update({
                            scheduleTechno: true
                        });
                        await handleHistory({ content: userMessage, role: 'user' }, state)
                        gotoFlow(flowScheduleTechno)
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
                            flag: false,
                            scheduleTechno: false
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
        );

export default flowUserWithInfoTecno