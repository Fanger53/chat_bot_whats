import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import generalInfo from "src/utils/general_info";
import { getHistoryParse, handleHistory } from "src/utils/handleHistory";
import AIClass from "src/services/ai";
import { flowSchedule } from "./schedule.flow";

const flowInfo = addKeyword(EVENTS.ACTION)
.addAction( async (ctx, { state, flowDynamic, extensions, gotoFlow }) => {
    console.log("flowInfo")
    const currentState = state.getMyState()
    console.log(currentState.is_positive === true)
    if (currentState.is_positive === true){
        flowDynamic(` Hola ${currentState.userName}, Mi nombre es sofia y  voy a ser tu asesora asignada`)
        state.update({ is_positive: false });
        const history = currentState.prompt
        const prompt_text = generalInfo(currentState.userName, history, ctx.body);
        const ai = extensions.ai as AIClass;
        const response = await ai.createChat([
            { role: 'user', content: prompt_text }
        ]);
        flowDynamic(response)
    }
})
.addAction({capture:true}, async (ctx, { state, flowDynamic, extensions, gotoFlow }) => {
    console.log("flowInfo")
    const currentState = state.getMyState()
    const history = getHistoryParse(state)
    const prompt_text = generalInfo(currentState.userName, history, ctx.body);
    const userMessage = ctx.body.toLowerCase();
    const ai = extensions.ai as AIClass;
    const prompt = `Analiza la siguiente respuesta del usuario: "${userMessage}" bajo el  contexto de que el cliente expresa su deseo de programar una cita.

        **Instrucciones estrictas:**
        1. Si la respuesta contiene **CUALQUIERA** de las siguientes palabras clave, devuelve **obligatoriamente true**:
        - agendar
        - reservar
        - programar
        - fijar
        - calendario

        2. Analiza el tono y sentido general de la respuesta:
        - Si la respuesta es afirmativa o muestra disposición positiva para agendar, devuelve **true**.
        - Si la respuesta es negativa o muestra dudas respecto a agendar, devuelve **false**.

        **Criterios de positividad para agendar:**
        - Presencia de palabras sinónimas de **agendar**.
        - Tono de aceptación, interés o disposición.
        - Ausencia de palabras negativas o de indecisión.

        **Responde solo con "true" o "false", sin explicaciones adicionales.**`;

    const agenda_response = await ai.createChat([
        {
            role: 'system',
            content: prompt
        }
    ])
    const isPositive = agenda_response.trim() === 'true';
    console.log(isPositive)
    console.log("flow info  l 60")
    if (isPositive === true) {
        console.log("enviar agenda")
        state.update({ 
            birthday: false
        });
        const text = await ai.createChat([
            {
                role: 'user',
                content: `Cliente pregunta: Quiero agendar una cita`
            }
        ], 'gpt-4')
    
        await handleHistory({ content: text, role: 'assistant' }, state)
        return gotoFlow(flowSchedule);
    }
    const response = await ai.createChat([
        { role: 'user', content: prompt_text }
    ]);
    await handleHistory({ content: response, role: 'assistant' }, state)
    await flowDynamic(response);
    return gotoFlow(flowInfo)
});


export default flowInfo;