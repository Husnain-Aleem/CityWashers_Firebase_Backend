import * as logs from "../logs";
import {firestore} from "../../index"
import { CustomerData } from "../interfaces";
import { stripeSecretKey } from "../../config/Globals";
const stripe = require('stripe')(stripeSecretKey);


/**
 * Create a customer object in Stripe when a user is created.
 */
 export const createCustomerRecord = async ({
    email,
    uid,
    docPath
}: {
    email?: string;
    uid: string;
    docPath: string
}) => {
    try {
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

        await firestore.doc(docPath).set(customerRecord, { merge: true });
        logs.customerCreated(customer.id, customer.livemode);
        return customerRecord;
    } catch (error) {
        logs.customerCreationError(error, uid);
        return null;
    }
};
