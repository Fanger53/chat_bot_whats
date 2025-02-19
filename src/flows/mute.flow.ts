import { addKeyword } from '@bot-whatsapp/bot'
import { numberClean } from '../utils/numberClean.js'

const ADMIN_NUMBER = process.env.ADMIN_NUMBER 

const mutedFlow = addKeyword('Mute')
    .addAction(async (ctx, { blacklist, flowDynamic }) => {
        console.log('Muted flow')
        if (ctx.from === ADMIN_NUMBER) {
            console.log('Muted flow admin')
            const toMute = numberClean(ctx.body) //Mute +34000000 message incoming
            const check = blacklist.checkIf(toMute)
            if (!check) {
                blacklist.add(toMute)
                await flowDynamic(`❌ ${toMute} silenciado`)
                return
            }
            blacklist.remove(toMute)
            await flowDynamic(`🆗 ${toMute} bot escuchando`)
            return
        }
})

export default mutedFlow