import { firestore } from "../index"
import * as functions from "firebase-functions"
import { MailWasherForConfirmation } from "./helpers/MailWasherForConfirmation"
import { SendPushNotification } from "./helpers/SendPushNotification"
import { AvailabeWashers } from "./helpers/AvailabeWashers"
import { BestWasher } from "./helpers/BestWasher"
import { CreateOrder } from "./helpers/CreateOrder"


export async function StartBooking(
    req: functions.https.Request,
    res: functions.Response<any>
) {
    console.log("StartBooking called")

    try {
        const clientId = req.body.clientId
        const services = req.body.services
        const scheduledPickUpTime = req.body.scheduledPickUpTime
        const scheduledDeliveryTime = req.body.scheduledDeliveryTime

        const pickupTime = new Date()

        const hour = pickupTime.getHours()

        if (hour > 7 && hour < 22) {
            const availableWahers = await AvailabeWashers(hour)
            const bestWasher = await BestWasher(availableWahers)
            console.log("bestWasher ", bestWasher)
            if (bestWasher) {
                await CreateOrder(
                    bestWasher.washerId,
                    clientId,
                    services,
                    scheduledPickUpTime,
                    scheduledDeliveryTime
                )
                await MailWasherForConfirmation(bestWasher.washerEmail)

                return res.status(200).json({ message: "Washer with Id " +  bestWasher.washerId + " has been mailed for confirmation"})        

                // await SendPushNotification(FCMToken)
            } else {
                functions.logger.info("No Washer Found at the Moment")
                return res
                    .status(403)
                    .json({ error: "No Washer Found at the Moment" })
            }
        } else {
            functions.logger.info(
                "time is not between active hours ",
                pickupTime
            )
            return res.status(403).json({
                error:
                    "time " +
                    pickupTime +
                    " is not between active hours 7 and 22",
            })
        }        

    } catch (error) {
        functions.logger.error("error ", error)
        return res.status(403).json({ error: error })
    }
}










