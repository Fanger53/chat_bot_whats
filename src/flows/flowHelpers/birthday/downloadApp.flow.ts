import { addKeyword, EVENTS } from "@bot-whatsapp/bot";

const flowDownloadApp = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state }) => {
        try {
            const currentState = state.getMyState()
            console.log('flowDownloadApp')
            flowDynamic(`${currentState.userName}, si no tienes la app descargada en tu telefono puedes descargarla ahora mismo para que puedas comprobar tus MotoPuntos\npuedes descargarla en este enlace:\n http://bit.ly/DescargaMotoSmart`)
        } catch (error) {
            console.error('[ERROR in initial API check]:', error);
            await flowDynamic('Lo siento, hubo un error.');
            return true;
        }
    })

export default flowDownloadApp;