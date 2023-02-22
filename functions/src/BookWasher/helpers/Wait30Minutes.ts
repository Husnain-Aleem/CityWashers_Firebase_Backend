import * as functions from "firebase-functions";
// import * as firebase from "firebase-admin"
import { firestore } from "../../index";
import { MailClientForConfirmation } from "./MailClientForConfirmation";
import { CloudTasksClient } from "@google-cloud/tasks";
import { RestartBookingProcess } from "../RestartBooking/RestartBooking";

// Wait 30minutes for confirmation or time out
export async function Wait30Minutes(
    req: functions.https.Request,
    res: functions.Response<any>
) {
    console.log("Wait 30minutes for washer confirmation/time-out called");

    try {
        const order = req.body.order;
        // console.log("order ", order);

        const docPath = req.body.docPath;
        console.log("docPath ", docPath);

        const orderAfterWait = await firestore.doc(docPath).get();

        const tasksClient = new CloudTasksClient();

        const expirationTask = await firestore
            .doc(docPath)
            .collection("ExpirationTask")
            .doc("ExpirationTask")
            .get();

        console.log("expirationTask ", expirationTask.data()?.expirationTask);

        await tasksClient.deleteTask({
            name: expirationTask.data()?.expirationTask,
        });

        // The confirmation/rejection should happen by calling a specific API endpoint provided by the backend

        if (orderAfterWait.data()?.washer) {
            // confirm from client
            await MailClientForConfirmation(order.client);
        } else {
            // If timeout or not confirmed, Send Order Details to next avaiable washer and wait for his confirmation
            functions.logger.info(
                "Washer Rejected or time out => restarting booking process"
            );
            const missedByWasher =
                orderAfterWait.data()?.pendingApprovalByWasher || null;
            const missedWashers = orderAfterWait.data()?.missedWashers || null;
            await RestartBookingProcess(docPath, missedByWasher, missedWashers);
        }

        return;
    } catch (error) {
        functions.logger.error("error ", error);
        return null;
    }
}
