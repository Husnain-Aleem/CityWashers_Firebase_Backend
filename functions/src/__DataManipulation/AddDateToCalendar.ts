import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";
import { firestore } from "../index";

export async function AddDateToCalendar(
    req: functions.https.Request,
    res: functions.Response<any>
) {
    try {

        console.log('AddDateToCalendar called');

        const calendars = await firestore.collectionGroup("Calendar").get()

        for(const cc of calendars.docs) {
            await firestore.doc(cc.ref.path).update({
                date: cc.id
            })
        }

        return res.status(200).json({
            "message": "success"
        });

    } catch (error) {
        console.log("error ", error);
        return res.status(403).json(error);
    }
}
