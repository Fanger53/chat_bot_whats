import { createFlow } from "@bot-whatsapp/bot";
import welcomeFlow from "./welcome.flow";
import { flowSeller } from "./seller.flow";
import { flowSchedule } from "./schedule.flow";
import { flowConfirm } from "./confirm.flow";
import { flowBirthday } from "./birthday.flow";
import flowGivePoints from "./flowHelpers/birthday/givePoints.flow";
import flowPhoneNumber from "./flowHelpers/birthday/phoneNumber.flow";
import flowUserNotInfo from "./flowHelpers/birthday/userNotInfo.flow";
import flowUserWithInfo from "./flowHelpers/birthday/userWithInfo.flow";
import flowDownloadApp from "./flowHelpers/birthday/downloadApp.flow";
import flowFinal from "./flowHelpers/birthday/final.flow";
import flowNoAnswer from "./flowHelpers/birthday/noAnswer.flow";
import flowSmartTravel from "./flowHelpers/birthday/smartTravel.flow";
import flowNegativeAnswerSmartTravel from "./flowHelpers/birthday/negativeAnswerSmartTravel.flow";
import flowInTheMiddle from "./flowHelpers/birthday/middle.flow";
import flowFinalTimeout from "./flowHelpers/birthday/finalTimeout.flow";
import { flowTecno } from "./tecno.flow";
import flowUserNotInfoTecno from "./flowHelpers/tecno/userNotInfoTecno.flow";
import flowPhoneNumberTecno from "./flowHelpers/tecno/phoneNumberTecno.flow";
import flowUserWithInfoTecno from "./flowHelpers/tecno/userWithInfoTecno.flow";
import flowFinancing from "./flowHelpers/tecno/financing.flow";
import flowMiddleTechno from "./flowHelpers/tecno/middleTecno.flow";
import { flowScheduleTechno } from "./flowHelpers/tecno/scheduleTechno.flow";
import { flowConfirmTechno } from "./flowHelpers/tecno/confirmTechno.flow";
import { idleFlow } from "src/utils/idleCustom";


/**
 * Declaramos todos los flujos que vamos a utilizar
 */
export default createFlow([welcomeFlow, flowSeller, flowSchedule, flowConfirm, flowBirthday, flowGivePoints, flowPhoneNumber, flowUserNotInfo, flowUserWithInfo, flowDownloadApp, flowFinal, flowNoAnswer, flowSmartTravel, flowNegativeAnswerSmartTravel, flowInTheMiddle, flowFinalTimeout, flowTecno, flowUserWithInfoTecno, flowUserNotInfoTecno, flowPhoneNumberTecno, flowFinancing, flowMiddleTechno, flowScheduleTechno, flowConfirmTechno, idleFlow])