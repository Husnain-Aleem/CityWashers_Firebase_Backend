import * as functions from "firebase-functions";
import { createCustomerRecord } from "../helpers/createCustomerRecord";
import * as admin from "firebase-admin";
import * as logs from "../logs";
import Stripe from "stripe";
import { stripeSecretKey } from "../../config/Globals";
const stripe = require("stripe")(stripeSecretKey);

/**
 * Create a CheckoutSession for the customer and save payment link
 * /{Customers}/{docId}/checkout_sessions/{id}
 */
export async function CreateCheckoutSession(
    snap: functions.firestore.QueryDocumentSnapshot,
    context: functions.EventContext
) {
    functions.logger.info("CreateCheckoutSession called");
    try {
        const {
            price,
            success_url,
            cancel_url,
            quantity,
            payment_method_types = ["card"],
            //   metadata = {},
            tax_rates = [],
            allow_promotion_codes = false,
            //   trial_from_plan = true,
            line_items,
            billing_address_collection = "required",
            locale = "auto",
            promotion_code,
            client_reference_id,
        } = snap.data();

        logs.creatingCheckoutSession(context.params.id);

        // Get stripe customer id
        let customerRecord =
            (await snap.ref.parent.parent?.get())?.data() || null;

        if (!customerRecord?.stripeId) {            
            const { email } = await admin.auth().getUser(context.params.uid);
            const docPath = snap.ref.parent.parent?.path as string
            customerRecord = await createCustomerRecord({
                uid: context.params.uid,
                email,
                docPath
            });
        }
        const customer = customerRecord?.stripeId;

        const sessionCreateParams: Stripe.Checkout.SessionCreateParams = {
            billing_address_collection,
            payment_method_types,
            customer,
            line_items: line_items
                ? line_items
                : [
                      {
                          price,
                          quantity,
                          tax_rates,
                      },
                  ],
            mode: "payment",
            // subscription_data: {
            //   trial_from_plan,
            //   metadata,
            // },
            success_url,
            cancel_url,
            locale,
        };
        if (promotion_code) {
            sessionCreateParams.discounts = [{ promotion_code }];
        } else {
            sessionCreateParams.allow_promotion_codes = allow_promotion_codes;
        }
        if (client_reference_id)
            sessionCreateParams.client_reference_id = client_reference_id;

        const session = await stripe.checkout.sessions.create(
            sessionCreateParams,
            { idempotencyKey: context.params.id }
        );

        await snap.ref.set(
            {
                sessionId: session.id,
                created: admin.firestore.Timestamp.now(),
            },
            { merge: true }
        );

        logs.checkoutSessionCreated(context.params.id);

        return;
    } catch (error) {
        const err = error as any
        logs.checkoutSessionCreationError(context.params.id, error);        
        await snap.ref.set(            
            { error: { message: err.message } },
            { merge: true }
        );
    }
}
