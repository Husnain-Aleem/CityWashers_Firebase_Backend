import * as functions from "firebase-functions";
import { firestore } from "../index";

export async function GetOrder(
    req: functions.https.Request,
    res: functions.Response<any>
) {
    console.log("GetOrder Called");
    try {
        const orderId = req.body.orderId;

        const order = (
            await firestore.collection("Orders").where("id", "==", orderId).get()
        )?.docs[0]?.data();

        if (order) {
            return res.status(200).json({ order: order });
        } else {
            functions.logger.error("No order found with id ", orderId);
            return res
                .status(403)
                .json({ error: "No order found with id " + orderId });
        }
    } catch (error) {
        functions.logger.error("error getting order ", error);
        return res.status(403).json(error);
    }
}
