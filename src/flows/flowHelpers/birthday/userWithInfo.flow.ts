import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import postPoints from "src/services/endpoints/postPoints";
import getUserInfo from "src/services/endpoints/userInformationService";
import AIClass from "src/services/ai";
import flowFinal from "./final.flow";
import flowNoAnswer from "./noAnswer.flow";
import flowSmartTravel from "./smartTravel.flow";
import flowInTheMiddle from "./middle.flow";
import { start, reset } from "src/utils/idleCustom";


const flowUserWithInfo = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state, gotoFlow, extensions}) => {
        try {
            console.log('flowUserWithInfo');
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
    .addAction( async (ctx, { flowDynamic, state, extensions, gotoFlow}) => {
                start(ctx, gotoFlow, 90000)
                try { 
                    const currentState = state.getMyState()
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
                    await flowDynamic([{body: `${response}`, delay: 2000}]);
                    // let b = await before(ctx, currentState.userName, 10000)
                    // flowDynamic(`${b}`)
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
        .addAction({ capture:true}, async (ctx, { flowDynamic, state, extensions, gotoFlow }) => {
            reset(ctx, gotoFlow, 90000)          
            try {
                const body = ctx.body
                
                const ai = extensions.ai as AIClass;
                const prompt = `toma esto ${body} como contexto y el usuario está de cumpleaños. Ya lo hemos felicitado y saludado antes. 
                Instrucciones:
                - No usar saludos ni nombres, ni felicitarlo de nuevo
                - No hacer preguntas
                - Responder como si fuera un amigo cercano hablando informalmente
                - La respuesta debe ser una afirmación o comentario cerrado
                - Mantener un tono celebrativo y positivo
                Por ejemplo, en vez de "¿cómo ha estado tu día?" di algo como "Espero que estés disfrutando al máximo este día tan especial" o "Que este día esté lleno de momentos increíbles y mucha alegría"`;
                const response = await ai.createChat([
                { role: 'user', content: prompt }
                ]);
                
                // Generar una respuesta personalizada utilizando el nombre
                await flowDynamic([{body: `${response}`, delay: 5000}]);
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
    );

export default flowUserWithInfo