import * as functions from "firebase-functions";
import { CloudTasksClient } from "@google-cloud/tasks";
import { firestore } from "../../index";

// Get the project ID from the FIREBASE_CONFIG env var
const project = JSON.parse(process.env.FIREBASE_CONFIG!).projectId;
const location = "us-central1";

const tasksClient = new CloudTasksClient();
const url = `https://${location}-${project}.cloudfunctions.net/Wait30Minutes`;
const queue = `wait-thirty-minutes`;

export async function Create30MinutesJob(
    docQS: functions.Change<functions.firestore.QueryDocumentSnapshot>,
    context: functions.EventContext
) {
    console.log("Create30MinutesJob started");

    try {
        
        const order = docQS.after.data();
        // console.log("order ", order);

        if (!order.washer && !order?.tempStopBooking) {
            const docPath = docQS.after.ref.path;
            console.log("docPath ", docPath);

            const payload = {
                docPath,
                order,
            };

            // expiry-time set to 300 seconds
            const expirationAtSeconds = Date.now() / 1000 + 120;
            console.log("expire seconds ", expirationAtSeconds);

            console.log("url ", url);

            const task: any = {
                httpRequest: {
                    httpMethod: "POST",
                    url,
                    body: Buffer.from(JSON.stringify(payload)).toString(
                        "base64"
                    ),
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
                scheduleTime: {
                    seconds: expirationAtSeconds,
                },
            };

            const queuePath: string = tasksClient.queuePath(
                project,
                location,
                queue
            );

            const [response] = await tasksClient.createTask({
                parent: queuePath,
                task,
            });

            console.log("google cloud createTask response ", response);

            const expirationTask: any = response.name;

            await firestore
                .doc(docPath)
                .collection("ExpirationTask")
                .doc("ExpirationTask")
                .set({ expirationTask: expirationTask });
        }

        return;
    } catch (error) {
        console.log("error ", error);
        return null;
    }
}
