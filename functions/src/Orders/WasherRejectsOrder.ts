import * as functions from "firebase-functions";
import { firestore } from "../index";
import { RestartBookingProcess } from "../BookWasher/RestartBooking/RestartBooking";

// todo change its region to europe west for time
export async function WasherRejectsOrder(
    req: functions.https.Request,
    res: functions.Response<any>
) {
    console.log("WasherRejectsOrder called");
    try {
        const washerId = req.body.washerId;
        const orderId = req.body.orderId;

        const order = await firestore
            .collection("Orders")
            .where("id", "==", orderId)
            .where("pendingApprovalByWasher", "==", washerId)            
            .get();

        if (order.docs.length) {
            await RestartBookingProcess(order.docs[0].ref.path, washerId, order.docs[0].data().missedWashers)
            return res.status(200).json({
                message: "Order Rejected Successfully"
            })
        } else {
            return res.status(403).json({
                error:
                    `Washer with id ${washerId} does not have any order with id ${orderId} pending for approval, So It can't be rejected`,
            });
        }
    } catch (error) {
        functions.logger.error("error ", error);
        return res.status(403).json({
            error: error,
        });
    }
}

