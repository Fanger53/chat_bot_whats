import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import AIClass from "src/services/ai";
import { handleHistory } from "src/utils/handleHistory";
import flowFinancing from "./financing.flow";
import { flowScheduleTechno } from "./scheduleTechno.flow";
import { reset, start } from "src/utils/idleCustom";
// import flowFinal from "./final.flow";
// import flowSmartTravel from "./smartTravel.flow";
// import flowInTheMiddle from "./middle.flow";


const flowUserWithInfoTecno = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state, gotoFlow, extensions}) => {
        try {
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
                        body: " ¿De que ciudad me estas hablando? ",
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

                    Ejemplo: "No estoy segura de la ciudad que mencionas, pero nuestras sucursales están en Bogotá, Medellín y Cali.", siempre ten encuenta la ciudad que se menciona aqui: "${userMessage}"`;

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
                            body: "Por sacar tu TECNO tienes beneficios con MotoSmart como:",
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
                            delay: 2000
                        },
                        {
                            body: `Puedes agendar una cita en nuestro CDA aliado, de esta manera no tendrás que hacer filas y menos demora tendrás 🤟`,
                            delay: 2000
                        }
                    ]);
                    if (currentState.is_premium){
                        flowDynamic('Ademas por ser un usuario premium te regalamos $22.000?')
                    }
                    flowDynamic('')
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
    .addAction( { capture:true }, async (ctx, { flowDynamic, state, extensions, gotoFlow}) => {
                reset(ctx, gotoFlow, 90000)
                try { 
                    const currentState = state.getMyState();
                    const userMessage = ctx.body.toLowerCase();
                    const ai = extensions.ai as AIClass;
                    const prompt = `Analiza la respuesta del usuario: "${userMessage}" considerando que responde a la pregunta: "¿Te gustaría saber más sobre la financiación o agendar una cita con nuestro aliado?"

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