import * as admin from "firebase-admin"



export async function SendPushNotification(FCMToken: string) {

    try {

        const payload = {
            token: FCMToken,
            notification: {
                title: "You have an Order Pending For Confirmation",
                body: "",
            },
            data: {
                body: "Here is the link: ",
            },
        }

        const response = await admin.messaging().send(payload)
        console.log("Successfully sent push notification to washer: ", response)

    } catch (error) {
        console.log("error sending push notification to washer ", error)
    }
}
