import * as functions from "firebase-functions";
import { firestore } from "../index";
import * as admin from "firebase-admin";

// todo change its region to europe west for time
export async function WasherConfirmsOrder(
    req: functions.https.Request,
    res: functions.Response<any>
) {
    console.log("WasherConfirmsOrder called");
    try {
        const washerId = req.body.washerId;
        const orderId = req.body.orderId;

        const docId = await getDocID(new Date());

        const order = await firestore
            .collection("Orders")
            .where("id", "==", orderId)
            .where("pendingApprovalByWasher", "==", washerId)
            .get();

        if (order.docs.length) {
            await updateWahserOrderStatus( washerId, order.docs[0].data(), docId, order.docs[0].ref.path);
        } else {
            return res.status(403).json({
                error: `Washer with id ${washerId} does not have any order with id ${orderId} pending for approval`,
            });
        }
    } catch (error) {
        functions.logger.error("error ", error);
        return res.status(403).json({
            error: error,
        });
    }
}

// We will update order details in 2 places after washer confirms order
// First in Washer's Calendar with today's date
// Then in Orders collection
async function updateWahserOrderStatus(washerId: string, order: any, docId: string, orderDocRef: string) {
    const hour = order.scheduledPickUpTime.toDate().getHours();

    const index = Object.keys(order.timeSlotsAndOrders).find(
        (ele) => ele === hour
    );

    if (index) {
        if (!order.timeSlotsAndOrders[index as string].booked) {
            order.timeSlotsAndOrders[index as string] = {
                booked: true,
                orderId: order.id,
            };
        }

        const washer = (await firestore.collection("Washers").where("id", "==", washerId).get()).docs[0].ref.path;

        await firestore
            .doc(washer)
            .collection("Calendar")
            .doc(docId)
            .update({
                remainingOrderCapacity:
                    admin.firestore.FieldValue.increment(-1),
                timeSlotsAndOrders: order.timeSlotsAndOrders,
            });

        await firestore.doc(orderDocRef).update({
            washer: washerId
        })

    }
}

async function getDocID(date: any) {
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    const docId = year + "_" + month + "_" + day;
    return docId;
}
