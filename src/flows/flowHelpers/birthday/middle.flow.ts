import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import { flowSeller } from "src/flows/seller.flow";
import AIClass from "src/services/ai";
import flowNoAnswer from "./noAnswer.flow";
import flowFinal from "./final.flow";
import flowSmartTravel from "./smartTravel.flow";
import postPoints from "src/services/endpoints/postPoints";
import { flowSchedule } from "src/flows/schedule.flow";
import { getHistoryParse, handleHistory } from "src/utils/handleHistory";
import { getCurrentCalendar } from "src/services/calendar";
import { getFullCurrentDate } from "src/utils/currentDate";
import flowFinalTimeout from "./finalTimeout.flow";
import { idleFlow, reset } from "src/utils/idleCustom";

const PROMPT_SCHEDULE = `
Como ingeniero de inteligencia artificial especializado en la programación de reuniones, tu objetivo es analizar la conversación y determinar la intención del cliente de programar una reunión, así como su preferencia de fecha y hora. La reunión durará aproximadamente 45 minutos y solo puede ser programada entre las 9am y las 4pm, de lunes a viernes, y solo para la semana en curso.

Fecha de hoy: {CURRENT_DAY}

Reuniones ya agendadas:
-----------------------------------
{AGENDA_ACTUAL}

Historial de Conversacion:
-----------------------------------
{HISTORIAL_CONVERSACION}

Ejemplos de respuestas adecuadas para sugerir horarios y verificar disponibilidad:
----------------------------------
"Por supuesto, tengo un espacio disponible mañana, ¿a qué hora te resulta más conveniente?"
"Sí, tengo un espacio disponible hoy, ¿a qué hora te resulta más conveniente?"
"Ciertamente, tengo varios huecos libres esta semana. Por favor, indícame el día y la hora que prefieres."

INSTRUCCIONES:
- NO saludes
- Si existe disponibilidad debes decirle al usuario que confirme
- Revisar detalladamente el historial de conversación y calcular el día fecha y hora que no tenga conflicto con otra hora ya agendada
- Respuestas cortas ideales para enviar por whatsapp con emojis
-----------------------------
Respuesta útil en primera persona:`

const generateSchedulePrompt = (summary: string, history: string) => {
    const nowDate = getFullCurrentDate()
    const mainPrompt = PROMPT_SCHEDULE
        .replace('{AGENDA_ACTUAL}', summary)
        .replace('{HISTORIAL_CONVERSACION}', history)
        .replace('{CURRENT_DAY}', nowDate)

    return mainPrompt
}

const flowInTheMiddle = addKeyword(EVENTS.ACTION)
.addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
    reset(ctx, gotoFlow, 90000)
    try {
        const currentState = state.getMyState()
        await flowDynamic([
            {
                body: `Oye ${currentState.userName}, Por ser tu cumpleaños, MotoSmart quiere obsequiarte 1.000 MotoPuntos para que puedas pasar a cualquiera de las tiendas aliadas a canjear uno de nuestros obsequios, podrás elegir uno entre llaveros, balaclavas gorras, porta documentos entre otros🔥🎉🚀🛵\n\n¿Que te parece esto que te estoy contando?`,
                delay: 1000
            },
        ]);
        
        
        return true;
    } catch (error) {
        console.error('[ERROR in secondary action]:', error);
        return false;
    }
})
.addAction({ capture: true, idle: 5000}, async (ctx, { flowDynamic, state, gotoFlow, extensions }) => {
        try {
            reset(ctx, gotoFlow, 90000)
            const currentState = state.getMyState()
            const body = ctx.body
            console.log("aqui va un idle flow in the midle")
            console.log(ctx.idleFallBack)
            if (ctx?.idleFallBack) {
                console.log("paso el idle")
                return gotoFlow(flowNoAnswer)
            }
            const ai = extensions.ai as AIClass;
            const prompt = `Actúa como un agente amigable y responde al contexto: "${body}".
                Reglas:
                - Usa un tono conversacional y casual
                - Genera una única respuesta breve
                - No uses saludos ni te presentes
                - No expliques por qué respondes
                - No hagas preguntas adicionales
                - La respuesta debe fluir naturalmente hacia la verificación de puntos

                Ejemplo del estilo de respuesta deseado:
                "Genial, me alegro mucho. Estoy revisando en sistema la cantidad de MotoPuntos que tienes justo ahora, me aparecen un registro de ${currentState.points} puntos, puedes por favor abrir la app y comprobar si este numero esta correcto", los ${currentState.points} son obligatorios que se tome la cantidad que llegan antes de responder confirma que los puntos son ${currentState.points} igual a  ${currentState.points} puntos`;
            const response = await ai.createChat([
            { role: 'user', content: prompt }
            ]);

            // Generar una respuesta personalizada utilizando el nombre
            await flowDynamic([
                {
                    body: `${response}`, 
                    delay: 1000
                },
                {
                    body: 'Aqui te envio una  imagen de donde puedes ver la cantidad de MotoPuntos en tu perfil\npor favor validalo para cargar los puntos de obsequio🤜🏼🤛🏼',
                    media: 'https://i.ibb.co/Ph1NLvV/488ec2cc-8807-42e8-b3e2-ba91c21aab93.jpg',
                    delay: 1000
                }
                        
            ]);
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
.addAction({ capture: true, idle: 60000}, async (ctx, { flowDynamic, state, gotoFlow, extensions }) => {
            try {
                reset(ctx, gotoFlow, 90000)
                const currentState = state.getMyState();
                if (ctx?.idleFallBack) {
                    // Crear un timeout que se puede cancelar
                    const timeoutPromise = new Promise((resolve) => {
                        const timeoutId = setTimeout(() => {
                            resolve('timeout');
                        }, 60000);
        
                        // Guardar el ID del timeout en el estado para poder cancelarlo si es necesario
                        state.update({ idleTimeoutId: timeoutId });
                    });
        
                    await flowDynamic(`${currentState.userName}, ¿lograste revisar los motopuntos que te aparcen en la app?`);
        
                    // Esperar la respuesta o el timeout
                    const result = await Promise.race([
                        timeoutPromise,
                        new Promise((resolve) => {
                            // Esta promesa se resolvería si el usuario responde antes del timeout
                            state.update({ idleResolve: resolve });
                        })
                    ]);
        
                    // Limpiar el estado
                    await state.update({ 
                        idleTimeoutId: null, 
                        idleResolve: null 
                    });
        
                    // Si se cumplió el timeout, ir al flujo final
                    if (result === 'timeout') {
                        return gotoFlow(idleFlow);
                    }
                }
                const userMessage = ctx.body.toLowerCase();
                const ai = extensions.ai as AIClass;
                console.log('flow in the midle 116')
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
                    await postPoints(ctx.from, "true");
                    await state.update({ registered: true });
                    await flowDynamic(' ¡Excelente! en este momento hemos cargado 1.000 MotoPuntos en tu cuenta, por favor actualiza la aplicacion y comprueba si se sumaron los puntos en tu saldo');
                } else {
                    await flowDynamic([
                        {
                            body: 'Entiendo. agenda una cita para ver porque no aparecen los motopuntos',
                            delay: 1000
                        }
                    ]);
                    console.log("para agendar")
                    state.update({ 
                        flag: false
                    });
                    return gotoFlow(flowSchedule);
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
    .addAction({ capture: true, idle: 60000}, async (ctx, { flowDynamic, state, gotoFlow, extensions }) => {
            try {
                const currentState = state.getMyState();
                if (ctx?.idleFallBack) {
                    // Crear un timeout que se puede cancelar
                    const timeoutPromise = new Promise((resolve) => {
                        const timeoutId = setTimeout(() => {
                            resolve('timeout');
                        }, 60000);
        
                        // Guardar el ID del timeout en el estado para poder cancelarlo si es necesario
                        state.update({ idleTimeoutId: timeoutId });
                    });
        
                    await flowDynamic(`${currentState.userName}, ¿lograste revisar los motopuntos que te aparcen en la app?`);
        
                    // Esperar la respuesta o el timeout
                    const result = await Promise.race([
                        timeoutPromise,
                        new Promise((resolve) => {
                            // Esta promesa se resolvería si el usuario responde antes del timeout
                            state.update({ idleResolve: resolve });
                        })
                    ]);
        
                    // Limpiar el estado
                    await state.update({ 
                        idleTimeoutId: null, 
                        idleResolve: null 
                    });
        
                    // Si se cumplió el timeout, ir al flujo final
                    if (result === 'timeout') {
                        console.log('linea 255 se acabo el tiempo')
                        return gotoFlow(idleFlow);
                    }
                }
                const userMessage = ctx.body.toLowerCase();
                const ai = extensions.ai as AIClass;
                console.log('flow in the midle 116')
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
                    if (currentState.is_premium === true) {
                        console.log('linea 441')
                        gotoFlow(flowSmartTravel);
                    } else {
                        gotoFlow(flowFinal);
                    }
                } else {
                    await flowDynamic('Entiendo. agenda una cita para ver porque no aparecen los motopuntos');
                    console.log("para agendar")
                    const history = getHistoryParse(state)
                    const list = await getCurrentCalendar()
                    const promptSchedule = generateSchedulePrompt(list?.length ? list : 'ninguna', history)
                    const text = await ai.createChat([
                        {
                            role: 'system',
                            content: promptSchedule
                        },
                        {
                            role: 'user',
                            content: `Cliente pregunta: Quiero agendar una cita`
                        }
                    ], 'gpt-4')
                
                    await handleHistory({ content: text, role: 'assistant' }, state)
                    state.update({ 
                        flag: false
                    });
                    return gotoFlow(flowSchedule);
                }

            } catch (error) {
                console.error('Error en el proceso de registro:', error);
                await flowDynamic([
                    {
                        body: 'Lo siento, ha ocurrido un error. Por favor, intenta nuevamente.',
                    }
                ]);
            }
        }
    )
   

export default flowInTheMiddle;