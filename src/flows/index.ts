import { createFlow } from "@bot-whatsapp/bot";
import welcomeFlow from "./welcome.flow";
import { flowSeller } from "./seller.flow";
import { flowSchedule } from "./schedule.flow";
import { flowConfirm } from "./confirm.flow";
import { flowBirthday, flowCaptureUserData } from "./birthday.flow";
import flowGivePoints from "./flowHelpers/GivePoints.flow";
import flowPhoneNumber from "./flowHelpers/phoneNumber.flow";

/**
 * Declaramos todos los flujos que vamos a utilizar
 */
export default createFlow([welcomeFlow, flowSeller, flowSchedule, flowConfirm, flowBirthday, flowCaptureUserData, flowGivePoints, flowPhoneNumber])