import { createFlow } from "@bot-whatsapp/bot";
import welcomeFlow from "./welcome.flow";
import { flowSeller } from "./seller.flow";
import { flowSchedule } from "./schedule.flow";
import { flowConfirm } from "./confirm.flow";
import { flowBirthday, flowCaptureUserData } from "./birthday.flow";
import flowGivePoints from "./flowHelpers/birthday/GivePoints.flow";
import flowPhoneNumber from "./flowHelpers/birthday/phoneNumber.flow";
import flowUserNotInfo from "./flowHelpers/userNotInfo.flow";
import flowUserWithInfo from "./flowHelpers/userWithInfo.flow";
import flowDownloadApp from "./flowHelpers/birthday/downloadApp.flow";
import flowFinal from "./flowHelpers/birthday/final.flow";
import flowNoAnswer from "./flowHelpers/birthday/noAnswer.flow";
import flowSmartTravel from "./flowHelpers/birthday/smartTravel.flow";
import flowNegativeAnswerSmartTravel from "./flowHelpers/birthday/negativeAnswerSmartTravel.flow";
import flowInTheMiddle from "./flowHelpers/birthday/middle.flow";
import flowFinalTimeout from "./flowHelpers/birthday/finalTimeout.flow";



/**
 * Declaramos todos los flujos que vamos a utilizar
 */
export default createFlow([welcomeFlow, flowSeller, flowSchedule, flowConfirm, flowBirthday, flowCaptureUserData, flowGivePoints, flowPhoneNumber, flowUserNotInfo, flowUserWithInfo, flowDownloadApp, flowFinal, flowNoAnswer, flowSmartTravel, flowNegativeAnswerSmartTravel, flowInTheMiddle, flowFinalTimeout])