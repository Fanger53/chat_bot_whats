import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import postPoints from "src/services/endpoints/postPoints";
import getUserInfo from "src/services/endpoints/userInformationService";
import AIClass from "src/services/ai";
import flowFinal from "./final.flow";
import flowInTheMiddle from "./middle.flow";
import { reset } from "src/utils/idleCustom";

const flowGivePoints = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
        try {
            reset(ctx, gotoFlow, 90000)
            console.log('flowGivePoints')
            const currentState = state.getMyState() || {};
            console.log(currentState)
            console.log(currentState.userName)
            
            if (currentState && currentState.userName !== "") {
                await flowDynamic([
                    {
                        body: `${currentState.userName}, permíteme felicitarte por tu cumpleaños 🛵🎉🥳 todo el equipo MotoSmart desea que tengas un año lleno de muchos éxitos, bendiciones y mucha salud para que alcances todas tus metas🤜🤛`,
                        delay: 2000
                    },

                ]);
            } else {
                // Si no hay info del usuario, iniciamos el flujo de captura
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

                    const ai = extensions.ai as AIClass;
                    const prompt = `Genera una única pregunta corta y amigable sobre cómo está pasando su cumpleaños. 
                        Reglas:
                        - Debe ser una sola pregunta simple
                        - No usar saludos ni nombres
                        - Usar un tono casual y amistoso
                        - La pregunta debe enfocarse específicamente en cómo está pasando/disfrutando su cumpleaños
                        - Mantener la pregunta entre 5-10 palabras

                        Ejemplos del estilo deseado:
                        "¿cómo va ese día especial?"
                        "¿qué tal va la celebración de cumpleaños?"
                        "¿disfrutando tu día especial?"

                        Responde con una sola pregunta siguiendo este estilo.`;
                    const response = await ai.createChat([
                    { role: 'user', content: prompt }
                    ]);

                    // Generar una respuesta personalizada utilizando el nombre
                    await flowDynamic([{body: `${response}`, delay: 7000}]);
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
        .addAction({ capture: true }, async (ctx, { flowDynamic, state, extensions, gotoFlow }) => {
            reset(ctx, gotoFlow, 90000)
            try {
                const currentState = state.getMyState()
                const body = ctx.body

                const ai = extensions.ai as AIClass;
                const prompt = `toma esto ${body} como contexto y el usuario está de cumpleaños. Ya lo hemos felicitado y saludado antes. 
                Instrucciones:
                - No usar saludos ni nombres, ni felicitarlo de nuevo
                - No hacer preguntas
                - Responder como si fuera un amigo cercano hablando informalmente
                - La respuesta debe ser una afirmación o comentario cerrado
                - Mantener un tono celebrativo y positivo
                Por ejemplo, en vez de "¿cómo ha estado tu día?" di algo como "Espero que estés disfrutando al máximo este día tan especial" o "Que este día esté lleno de momentos increíbles y mucha alegría"`
    ;
                const response = await ai.createChat([
                { role: 'user', content: prompt }
                ]);

                // Generar una respuesta personalizada utilizando el nombre
                await flowDynamic([{body: `${response}`, delay: 3000}]);
                return gotoFlow(flowInTheMiddle);
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
    // .addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
    //     try {
    //         const currentState = state.getMyState()
    //         await flowDynamic([
    //             {
    //                 body: `Ok, perfecto🤟, ${currentState.userName}, MotoSmart te regala 1.000 MotoPuntos para que los uses en cualquiera de nuestras tiendas aliadas y canjees un obsequio especial. Puedes elegir entre llaveros, balaclavas, gorras y más. 🔥🚀🛵 \n\n¿Que te parece esto que te estoy contando?`,
    //                 delay: 2000
    //             },
    //         ]);
            
            
            
    //     } catch (error) {
    //         console.error('[ERROR in secondary action]:', error);
    //         return false;
    //     }
    // })
    // .addAction({ capture: true }, async (ctx, { flowDynamic, state, extensions, gotoFlow }) => {
    //         try {
    //             const currentState = state.getMyState()
    //             const body = ctx.body

    //             const ai = extensions.ai as AIClass;
    //             const prompt = `Actúa como un agente amigable y responde al contexto: "${body}".
    //                 Reglas:
    //                 - Usa un tono conversacional y casual
    //                 - Genera una única respuesta breve
    //                 - No uses saludos ni te presentes
    //                 - No expliques por qué respondes
    //                 - No hagas preguntas adicionales
    //                 - La respuesta debe fluir naturalmente hacia la verificación de puntos

    //                 Ejemplo del estilo de respuesta deseado:
    //                 "Genial, me alegro mucho. Estoy revisando en sistema la cantidad de MotoPuntos que tienes justo ahora, me aparecen un registro de ${currentState.points} puntos, puedes por favor abrir la app y comprobar si este numero esta correcto"`;
    //             const response = await ai.createChat([
    //             { role: 'user', content: prompt }
    //             ]);

    //             // Generar una respuesta personalizada utilizando el nombre
    //             await flowDynamic([
    //                 {
    //                     body: `${response}`, 
    //                     delay: 5000
    //                 },
    //                 {
    //                     body: 'Aqui te envio una  imagen de donde puedes ver la cantidad de MotoPuntos en tu perfil\npor favor validalo para cargar los puntos de obsequio🤜🏼🤛🏼',
    //                     media: 'https://i.ibb.co/Ph1NLvV/488ec2cc-8807-42e8-b3e2-ba91c21aab93.jpg',
    //                     delay: 3000
    //                 }
                            
    //             ]);
    //         } catch (error) {
    //             console.error('Error en el proceso de registro:', error);
    //             await flowDynamic([
    //                 {
    //                     body: 'Lo siento, ha ocurrido un error. Por favor, intenta nuevamente.',
    //                     delay: 1000
    //                 }
    //             ]);
    //         }
    //     }
    // )
    // .addAction({ capture: true, idle: 20000 }, async (ctx, { flowDynamic, state, gotoFlow, extensions }) => {
    //             try {
    //                 const currentState = state.getMyState();
    //                 if (ctx?.idleFallBack) {
    //                     // Crear un timeout que se puede cancelar
    //                     const timeoutPromise = new Promise((resolve) => {
    //                         const timeoutId = setTimeout(() => {
    //                             resolve('timeout');
    //                         }, 30000);
            
    //                         // Guardar el ID del timeout en el estado para poder cancelarlo si es necesario
    //                         state.update({ idleTimeoutId: timeoutId });
    //                     });
            
    //                     await flowDynamic(`${currentState.userName}, ¿lograste revisar los motopuntos que te aparcen en la app?`);
            
    //                     // Esperar la respuesta o el timeout
    //                     const result = await Promise.race([
    //                         timeoutPromise,
    //                         new Promise((resolve) => {
    //                             // Esta promesa se resolvería si el usuario responde antes del timeout
    //                             state.update({ idleResolve: resolve });
    //                         })
    //                     ]);
            
    //                     // Limpiar el estado
    //                     await state.update({ 
    //                         idleTimeoutId: null, 
    //                         idleResolve: null 
    //                     });
            
    //                     // Si se cumplió el timeout, ir al flujo final
    //                     if (result === 'timeout') {
    //                         return gotoFlow(flowFinal);
    //                     }
            
    //                     // Si el usuario respondió, continuar con el resto del código
    //                 }
    //                 const userMessage = ctx.body.toLowerCase();
    //                 const ai = extensions.ai as AIClass;
    //                 const prompt = `Analiza la siguiente respuesta del usuario: "${userMessage}"
    //                     Instrucciones estrictas:
    //                     - Si la respuesta contiene CUALQUIERA de estas palabras clave, devuelve OBLIGATORIAMENTE true:
    //                     * sí
    //                     * claro
    //                     * ok
    //                     * correcto
    //                     * genial
    //                     * bueno
    //                     * perfecto
    //                     * entendido
    //                     * de acuerdo
    //                     * está bien
    //                     * correcto

    //                     - Analiza el sentido general de la respuesta
    //                     - Si la respuesta es afirmativa o muestra disposición positiva, devuelve true
    //                     - Si la respuesta es negativa o muestra dudas, devuelve false

    //                     Criterios de positividad:
    //                     - Presencia de palabras afirmativas
    //                     - Tono de aceptación
    //                     - Ausencia de palabras negativas

    //                     Responde SOLO con true o false. Sin explicaciones adicionales.`;

    //                 const response = await ai.createChat([
    //                     {
    //                         role: 'system',
    //                         content: prompt
    //                     }
    //                 ]);

    //                 // Convertir la respuesta a un booleano
    //                 const isPositive = response.trim() === 'true';
    //                 console.log(isPositive)
    //                 if (isPositive) {
    //                     await postPoints(ctx.from, "true");
    //                     await flowDynamic([
    //                         {
    //                             body: '¡Registro completado! Procederemos con tu regalo de cumpleaños. 🎉',
    //                             delay: 1000
    //                         },
    //                         {
    //                             body: `y ${currentState.userName} por favor no olvides guardar nuestro número 3157444950 para que estes enterado de todos los descuentos y promociones que tenemos para ti`,
    //                             delay: 2500 
    //                         }
    //                     ]);
    //                     await state.update({ registered: true });
    //                 } else {
    //                     await flowDynamic([
    //                         {
    //                             body: 'Entiendo. agenda una cita para ver porque no aparecen los motopuntos',
    //                             delay: 1000
    //                         }
    //                     ]);
    //                 }

    //                 if (currentState.is_premium == "true") {
    //                     console.log('linea 282')
    //                     return false;
    //                 }
    //             } catch (error) {
    //                 console.error('Error en el proceso de registro:', error);
    //                 await flowDynamic([
    //                     {
    //                         body: 'Lo siento, ha ocurrido un error. Por favor, intenta nuevamente.',
    //                         delay: 1000
    //                     }
    //                 ]);
    //             }
    //         }
    //     )
    // .addAction(async (ctx, { flowDynamic, state, extensions }) => {
    //         try {
    //             const currentState = state.getMyState()
    //             const body = ctx.body

    //             const ai = extensions.ai as AIClass;
    //             const prompt = `Actúa como un asesor entusiasta de MotoSmart. Usa el siguiente contexto:
    //                 - Nombre del usuario: ${currentState.userName}
    //                 - Es su cumpleaños
    //                 - Oferta: 30% descuento + 30 días de membresía

    //                 Genera una respuesta que:
    //                 1. Exprese emoción por darle más sorpresas de cumpleaños
    //                 2. Liste los beneficios de la membresía MotoSmart GPS numerados del 1 al 10 (incluyendo póliza de vida, doctor online, GPS, etc.)
    //                 3. Mencione los bonos adicionales (revisión técnico mecánica y vacaciones)
    //                 4. Pregunte qué le parecen los beneficios
    //                 5. Termine con un mensaje sobre protección contra robo y facilidades de financiación

    //                 Reglas:
    //                 - Usa emojis relevantes
    //                 - Mantén un tono amigable y entusiasta
    //                 - Inicia con "Ok, Espera....😌"
    //                 - Incluye los emojis numerados (1️⃣, 2️⃣, etc.)
    //                 - No agregues información adicional fuera del guión
    //                 - Mantén el formato y estilo exacto del mensaje ejemplo`;
    //             const response = await ai.createChat([
    //             { role: 'user', content: prompt }
    //             ]);

    //             // Generar una respuesta personalizada utilizando el nombre
    //             await flowDynamic([
    //                 {
    //                     body: `${response}`, 
    //                     delay: 5000
    //                 }
                            
    //             ]);
    //         } catch (error) {
    //             console.error('Error en el proceso de registro:', error);
    //             await flowDynamic([
    //                 {
    //                     body: 'Lo siento, ha ocurrido un error. Por favor, intenta nuevamente.',
    //                     delay: 1000
    //                 }
    //             ]);
    //         }
    //     }
    // )

export default flowGivePoints;