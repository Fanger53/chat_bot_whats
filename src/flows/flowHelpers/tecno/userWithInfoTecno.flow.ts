import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import AIClass from "src/services/ai";
import { handleHistory } from "src/utils/handleHistory";
import flowFinancing from "./financing.flow";
import { flowScheduleTechno } from "./scheduleTechno.flow";
import { reset, start } from "src/utils/idleCustom";
import { delay } from "@bot-whatsapp/bot/dist/utils";
// import flowFinal from "./final.flow";
// import flowSmartTravel from "./smartTravel.flow";
// import flowInTheMiddle from "./middle.flow";


const flowUserWithInfoTecno = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state, gotoFlow, extensions}) => {
        try {
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
            start(ctx, gotoFlow, 90000)
            console.log('flowUserWithInfoTecno');
            const currentState = state.getMyState() || {};
            console.log(currentState)
            console.log(currentState.userName)
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
            reset(ctx, gotoFlow, 90000)
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
                    body: "quiero contarte los beneficios que tienes por sacar la revision tecnico mecanica con uno de nuestros aliados😎🛵",
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
                reset(ctx, gotoFlow, 90000)
                const currentState = state.getMyState() || {};
                console.log(currentState);
                console.log("");
                if (currentState && currentState.userName !== "") {
                    await flowDynamic([
                        {
                            body: `Cargaremos 5️⃣0️⃣0️⃣0️⃣ MotoPuntos a tu perfil para que los cambies por obsequios en cualquiera de nuestras marcas aliadas 🎁`,
                            delay: 5000
                        },
                        {
                            body: `Puedes agendar una cita en nuestro CDA aliado, de esta manera no tendrás que hacer filas y menos demora tendrás 🤟`,
                            delay: 5000
                        }
                    ]);
                    if (currentState.is_premium){
                        flowDynamic([
                            {
                                body: 'Lo mejor de todo es que recibiras un *bono de descuento de $25.000*🤑 por ser un usuario MotosMart premium activo',
                                delay: 5000
                            }
                        ])
                    }
                    await flowDynamic([{
                        body: 'el valor de la revicion tecnicomecanica para el año 2025 quedo en $207.700 con el bono de descuento entregado por MotoSmart para ti solo p1agas $182.700',
                        delay: 2000
                    }])
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
            reset(ctx, gotoFlow, 90000)
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
                    Si concluyes que la ciudad es cali responde lo siguiente "muy bien, en cali tenemos al aliado la sucursal, ubicado en la carrera 70 # 2c-32\n\n

                    tambien puedes llegar con la ubicion por google maps: [https://maps.app.goo.gl/5BA51ZbnyvG3RwZZ9](https://maps.app.goo.gl/5BA51ZbnyvG3RwZZ9)\n\n

                    recuerda exigir que te escanen tu codigo qr para recibir los 5000 MotoPuntos de obsequio junto al 'bono de descuento de $25.000
                    por favor dime la fecha y hora para agendar una cita prioritaria para ti!\n\n
                    en el cda la sucursal hay atencion de 8am a 5pm de lunes a sabado `;

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
                reset(ctx, gotoFlow, 90000)
                try { 
                    const currentState = state.getMyState();
                    const userMessage = ctx.body.toLowerCase();
                    const ai = extensions.ai as AIClass;
                    const prompt = `Analiza la respuesta del usuario: "${userMessage}" considerando que responde a la pregunta: "¿Te gustaría agendar una cita con nuestro aliado?"

                    Si la respuesta es sobre financiación o préstamo, responde con "1".
                    Si la respuesta es sobre agendar o algo relacionado, responde con "2".
                    Si la respuesta es negativa o no relevante, responde con "3".
                    Devuelve únicamente "1", "2" o "3" sin explicaciones adicionales`;

                    const response = await ai.createChat([
                        {
                            role: 'system',
                            content: prompt
                        }
                    ]);

                    console.log(response);
                    console.log(response === "1")
                    if (response === "1") {
                        console.log("financing")
                    } else if (response === "2") {
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