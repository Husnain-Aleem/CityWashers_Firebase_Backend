// /Washers/9TcCK5pbfdfiyDqhh73o/Calendar/2021_11_18

import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";
import { firestore } from "../index";

export async function ArrayUnion(
    req: functions.https.Request,
    res: functions.Response<any>
) {
    try {
        console.log("ArrayUnion called");

        const order = await firestore.doc(
            "/Orders/7vVhG817Hf3WNYqzGCMj"
        ).get();

        console.log('hours ', order.data()?.orderCreationTime.toDate().getHours());

        return res.status(200).json({
            message: "success ArrayUnion",
        });
    } catch (error) {
        console.log("error ", error);
        return res.status(403).json(error);
    }
}
