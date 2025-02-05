import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import AIClass from "../../../services/ai/index.js";
import { handleHistory } from "../../../utils/handleHistory.js";
import { flowScheduleTechno } from "./scheduleTechno.flow.js";
import { reset, resetPrevious } from "../../../utils/idleCustom.js";
import flowFinal from "../birthday/final.flow.js";


const flowMiddleTechno = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state, gotoFlow, extensions}) => {
        try {
            console.log('flowMiddleTechno');
            const currentState = state.getMyState() || {};
            reset(ctx, gotoFlow, 360000)
            resetPrevious(ctx, 180000, flowDynamic, currentState.userName)
            if (currentState && currentState.userName !== "") {
                await flowDynamic([
                    {
                        body: `${currentState.userName} Por sacar tu TECNO tienes tres beneficios con MotoSmart:`,
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
    .addAction( async (ctx, { flowDynamic, state, gotoFlow}) => {
            try {
                const currentState = state.getMyState() || {};
                reset(ctx, gotoFlow, 360000)
                resetPrevious(ctx, 180000, flowDynamic, currentState.userName)
                if (currentState && currentState.userName !== "") {
                    await flowDynamic([
                        {
                            body: `Cargaremos 5️⃣0️⃣0️⃣0️⃣ MotoPuntos a tu perfil para que los cambies por obsequios en cualquiera de nuestras marcas aliadas 🎁`,
                            delay: 2000
                        },
                        {
                            body: `Podemos **financiartela** con tu cédula para que la pagues a meses y sin cuota inicial 🤑`,
                            delay: 2500
                        },
                        {
                            body: `Puedes agendar una cita en nuestro CDA aliado, de esta manera no tendrás que hacer filas y menos demora tendrás 🤟`,
                            delay: 2000
                        }
                    ]);
                    if (currentState.is_premium){
                        flowDynamic('Ademas por ser un usuario premium te regalamos $25.000?')
                    }
                    flowDynamic('¿De que ciudad me estas hablando?')
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
    .addAction( { capture: true}, async (ctx, { flowDynamic, state, extensions}) => {
                try { 
                    const currentState = state.getMyState();
                    const userMessage = ctx.body.toLowerCase();
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
                            body: "Te gustaria agendar una cita con nuestro aliado?",
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
    .addAction( {capture:true}, async (ctx, { flowDynamic, state, extensions, gotoFlow}) => {
                try { 
                    const currentState = state.getMyState();
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
                    console.log("flow middle",(isPositive === true))
                    if (isPositive === true) {
                        console.log("agendar middle 165")
                        state.update({
                            scheduleTechno: true
                        });
                        await handleHistory({ content: userMessage, role: 'user' }, state)
                        gotoFlow(flowScheduleTechno)
                    } else {
                        state.update({ 
                            flag: false,
                            scheduleTechno: false
                        });
                        gotoFlow(flowFinal)
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

export default flowMiddleTechno