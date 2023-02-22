import * as functions from "firebase-functions";
import { firestore } from "../index";

export async function ConfirmOrderPickup(
    req: functions.https.Request,
    res: functions.Response<any>
) {
    console.log("ConfirmOrderPickup Called");
    try {
        const washerId = req.body.washerId;
        const orderId = req.body.orderId;

        const order = await firestore
            .collection("Orders")
            .where("id", "==", orderId)
            .where("pendingApprovalByWasher", "==", washerId)
            .get();

        if (order.docs.length) {
            await returnConfirmationCode(order.docs[0].data(), order.docs[0].ref.path);
        } else {
            return res.status(403).json({
                error: `Washer with id ${washerId} does not have any order with id ${orderId} pending for approval`,
            });
        }

        return res.status(200).json({
            message: `Order: {} Pickup Confirmed by Washer: {}`
        });
    } catch (error) {
        functions.logger.error("error confirming order pickup ", error);
        return res.status(403).json(error);
    }
}


async function returnConfirmationCode(order: any, docPath: string) {

    

}