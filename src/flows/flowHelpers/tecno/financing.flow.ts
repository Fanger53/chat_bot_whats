import { addKeyword, EVENTS } from "@bot-whatsapp/bot";


const flowFinancing = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { state, flowDynamic }) => {
        try {
            console.log("flowFinancing")
            
            await flowDynamic([
                {
                    body: `Si apruebas la financiación y difiere hasta lo máximo en 4 cuotas, cada cuota te quedará en $ 49.111 aproximadamente 😎\n\n✳️ Recuerda que empiezas a pagar 30 días después que se aprobó el proceso de financiación 🤟`,
                    delay: 2000
                },
                {
                    body: '🤙😎 En minutos uno de nuestros asesores te llamara para empezar el proceso 🤜🤛',
                    delay: 1000
                }
            ]);
            state.update({ 
                flag: false
            });
        } catch (error) {
            console.error('[ERROR in initial API check]:', error);
        }
    })

    export default flowFinancing;