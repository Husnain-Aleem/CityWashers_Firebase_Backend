import * as functions from "firebase-functions";
import { createCustomerRecord } from "../helpers/createCustomerRecord";


// Trigger that runs whenever a new user is added in firebase auth
export async function CreateCustomerInStripe(
    snap: functions.firestore.QueryDocumentSnapshot,
    context: functions.EventContext
    ) {        
    const { email, uid } = snap.data();
    const docPath = snap.ref.path
    await createCustomerRecord({ email, uid, docPath});
}
