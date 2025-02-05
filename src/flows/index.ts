import { createFlow } from "@bot-whatsapp/bot";
import welcomeFlow from "./welcome.flow.js";
import { flowSeller } from "./seller.flow.js";
import { flowSchedule } from "./schedule.flow.js";
import { flowConfirm } from "./confirm.flow.js";
import { flowBirthday } from "./flowHelpers/birthday/birthday.flow.js";
import flowGivePoints from "./flowHelpers/birthday/givePoints.flow.js";
import flowPhoneNumber from "./flowHelpers/birthday/phoneNumber.flow.js";
import flowUserNotInfo from "./flowHelpers/birthday/userNotInfo.flow.js";
import flowUserWithInfo from "./flowHelpers/birthday/userWithInfo.flow.js";
import flowDownloadApp from "./flowHelpers/birthday/downloadApp.flow.js";
import flowFinal from "./flowHelpers/birthday/final.flow.js";
import flowSmartTravel from "./flowHelpers/birthday/smartTravel.flow.js";
import flowNegativeAnswerSmartTravel from "./flowHelpers/birthday/negativeAnswerSmartTravel.flow.js";
import flowInTheMiddle from "./flowHelpers/birthday/middle.flow.js";
import { flowTecno } from "./tecno.flow.js";
import flowUserNotInfoTecno from "./flowHelpers/tecno/userNotInfoTecno.flow.js";
import flowPhoneNumberTecno from "./flowHelpers/tecno/phoneNumberTecno.flow.js";
import flowUserWithInfoTecno from "./flowHelpers/tecno/userWithInfoTecno.flow.js";
import flowMiddleTechno from "./flowHelpers/tecno/middleTecno.flow.js";
import { flowScheduleTechno } from "./flowHelpers/tecno/scheduleTechno.flow.js";
import { flowConfirmTechno } from "./flowHelpers/tecno/confirmTechno.flow.js";
import { flowConfirmBirthday } from "./flowHelpers/birthday/confirmBirthday.flow.js";
import { idleFlow } from "../utils/idleCustom.js";


/**
 * Declaramos todos los flujos que vamos a utilizar
 */
export default createFlow([welcomeFlow, flowSeller, flowSchedule, flowConfirm, flowBirthday, flowGivePoints, flowPhoneNumber, flowUserNotInfo, flowUserWithInfo, flowDownloadApp, flowFinal, flowSmartTravel, flowNegativeAnswerSmartTravel, flowInTheMiddle, flowTecno, flowUserWithInfoTecno, flowUserNotInfoTecno, flowPhoneNumberTecno,  flowMiddleTechno, flowScheduleTechno, flowConfirmTechno, idleFlow, flowConfirmBirthday, flowConfirmBirthday]);