import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import { stopPrevious } from "src/utils/idleCustom";

const flowDownloadApp = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state }) => {
        try {
            const currentState = state.getMyState()
            console.log('flowDownloadApp')
            flowDynamic(`${currentState.userName}, parece que no estás registrado en motosmart con el número o el correo que nos diste, ¡pero no te preocupes!\nPuedes descargar ahora mismo MotoSmart para que te registres y empieces a disfrutar de todos los beneficios de la comunidad MotoSmart\n\nClic aquí para descargar MotoSmart\n👇👇👇\nhttp://bit.ly/DescargaMotoSmart`)
            state.update({ 
                flag:false
            });
            stopPrevious(ctx);
        } catch (error) {
            console.error('[ERROR in initial API check]:', error);
            await flowDynamic('Lo siento, hubo un error.');
            return true;
        }
    })

export default flowDownloadApp;