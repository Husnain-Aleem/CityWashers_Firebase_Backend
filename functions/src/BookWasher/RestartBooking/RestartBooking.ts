import { firestore } from "../../index";
import * as firebase from "firebase-admin";
import * as functions from "firebase-functions";
import { AvailabeWashers } from "../helpers/AvailabeWashers";
import { BestWasher } from "../helpers/BestWasher";
import { MailWasherForConfirmation } from "../helpers/MailWasherForConfirmation";



export async function RestartBookingProcess(docPath: string, washerId: string, missedWashers: string[]) {
    console.log(
        "RestartBookingProcess called. Order not taken by washer => ",
        washerId
    );

    const pickupTime = new Date();

    const hour = pickupTime.getHours();

    if (hour > 7 && hour < 22) {
        // Checking for available washers excluding previously missed ones
        // Available washers will be taken/queried from db becasue availability keeps changing
        const availableWahers = await AvailabeWashers(hour, washerId, missedWashers);
        const bestWasher = await BestWasher(availableWahers);
        console.log("bestWasher ", bestWasher);

        if (bestWasher) {
            // updating order becasue we have set a trigger function which works when there is updation
            // in `Orders` collection and that trigger function restarts booking process
            await firestore.doc(docPath).update({
                missedWashers:
                    firebase.firestore.FieldValue.arrayUnion(washerId),
                pendingApprovalByWasher: bestWasher.washerId,
            });
            await MailWasherForConfirmation(bestWasher.washerEmail);
            return;
        } else {
            await firestore.doc(docPath).update({
                missedWashers:
                    firebase.firestore.FieldValue.arrayUnion(washerId),
                    pendingApprovalByWasher: null,
                    tempStopBooking: true
            });
            functions.logger.info("No Washer Found at the Moment");
            return null;
        }
    } else {
        functions.logger.info("time is not between active hours ", pickupTime);
        return null;
    }
}
