import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import postPoints from "src/services/endpoints/postPoints";
import getUserInfo from "src/services/endpoints/userInformationService";
import AIClass from "src/services/ai";
import flowNoAnswer from "../birthday/noAnswer.flow";
import { flowSeller } from "src/flows/seller.flow";
import { handleHistory } from "src/utils/handleHistory";
import flowFinancing from "./financing.flow";
import { flowSchedule } from "src/flows/schedule.flow";
import { flowScheduleTechno } from "./scheduleTechno.flow";
// import flowFinal from "./final.flow";
// import flowSmartTravel from "./smartTravel.flow";
// import flowInTheMiddle from "./middle.flow";


const flowMiddleTechno = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state, gotoFlow, extensions}) => {
        try {
            console.log('flowMiddleTechno');
            const currentState = state.getMyState() || {};
            console.log(currentState)
            console.log(currentState.userName)
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
    .addAction( async (ctx, { flowDynamic, state, extensions}) => {
            try {
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
                            body: `Podemos **financiartela** con tu cédula para que la pagues a meses y sin cuota inicial 🤑`,
                            delay: 2500
                        },
                        {
                            body: `Puedes agendar una cita en nuestro CDA aliado, de esta manera no tendrás que hacer filas y menos demora tendrás 🤟`,
                            delay: 2000
                        }
                    ]);
                    if (currentState.is_premium){
                        flowDynamic('Ademas por ser un usuario premium te regalamos $22.000?')
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
                    const prompt = `Analiza la respuesta del usuario: "${userMessage}" considerando que responde a la pregunta: "¿De que ciudad me estas hablando?"
                    tomando encuenta estas ciudades de Colombia donde tenemos sucursales CDA  "Tunja", "Bogota", "Medellin" y "Cali "

                    da una respuesta comentando en que ciudad tenenemos sucursales CDA y cual es la mas cercana que la respuesta sea clara y concisa`;

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
                            body: "Te gustaria saber mas sobre la financiacion o quieres agendar una cita con nuestro aliado?",
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
    .addAction( { capture:true, idle:2000 }, async (ctx, { flowDynamic, state, extensions, gotoFlow}) => {
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
                        gotoFlow(flowFinancing)
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

export default flowMiddleTechno