import * as logs from "../Stripe/logs";
import * as functions from "firebase-functions";
import {firestore} from "../index"
import { CustomerData } from "../Stripe/interfaces";
import { stripeSecretKey } from "../config/Globals";
const stripe = require('stripe')(stripeSecretKey);


/**
 * Create a customer object in Stripe when a user is created.
 */
 export async function AddExistingCustToStripe (
    req: functions.https.Request,
    res: functions.Response<any>
 ) {
    try {
        const uid = req.body.uid;
        const email = req.body.email;
        logs.creatingCustomer(uid);
        const customerData: CustomerData = {
            metadata: {
                firebaseUID: uid,
            },
        };
        if (email) customerData.email = email;

        const customer = await stripe.customers.create(customerData);
        // Add a mapping record in Cloud Firestore.
        const customerRecord = {
            stripeId: customer.id,
            stripeLink: `https://dashboard.stripe.com${
                customer.livemode ? "" : "/test"
            }/customers/${customer.id}`,
        };
        const client = await firestore
            .collection("Clients")
            .where("id", "==", uid)
            .get()        

        await firestore.doc(client.docs[0].ref.path).set(customerRecord, { merge: true });
        logs.customerCreated(customer.id, customer.livemode);
        return res.status(200).json({
            customerRecord: customerRecord
        });
    } catch (error) {
        logs.customerCreationError(error, req.body.uid);
        return res.status(400).json({
            error:error
        });
    }
};
