import {firestore} from "../../index"
import * as functions from "firebase-functions"
import * as logs from "../logs"
import { stripeSecretKey, stripeWebhookSecret } from "../../config/Globals"
import Stripe from "stripe"
import { insertPriceRecord } from "../helpers/insertPriceRecord"
import { createProductRecord } from "../helpers/createProductRecord"
import { deleteProductOrPrice } from "../helpers/deleteProductOrPrice"
const stripe = require('stripe')(stripeSecretKey);


/**
 * A webhook handler function for the relevant Stripe events.
 */
 export async function StripeWebhooksEvents
    (req: functions.https.Request, resp: functions.Response<any>) {
    const relevantEvents = new Set([
      'product.created',
      'product.updated',
      'product.deleted',
      'price.created',
      'price.updated',
      'price.deleted',
      'checkout.session.completed',      
    ]);
    let event: Stripe.Event;
  
    // Instead of getting the `Stripe.Event`
    // object directly from `req.body`,
    // use the Stripe webhooks API to make sure
    // this webhook call came from a trusted source
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        req.headers['stripe-signature'],
        stripeWebhookSecret
      );
    } catch (error) {
      logs.badWebhookSecret(error);
      resp.status(401).send('Webhook Error: Invalid Secret');
      return;
    }
  
    if (relevantEvents.has(event.type)) {
      logs.startWebhookEventProcessing(event.id, event.type);
      try {
        switch (event.type) {
          case 'product.created':
          case 'product.updated':
            await createProductRecord(event.data.object as Stripe.Product);
            break;
          case 'price.created':
          case 'price.updated':
            await insertPriceRecord(event.data.object as Stripe.Price);
            break;
          case 'product.deleted':
            await deleteProductOrPrice(event.data.object as Stripe.Product);
            break;
          case 'price.deleted':
            await deleteProductOrPrice(event.data.object as Stripe.Price);
            break;         
          case 'checkout.session.completed':
            const checkoutSession = event.data
              .object as Stripe.Checkout.Session;
              
            if (checkoutSession.mode === 'payment') {

              functions.logger.info("customer ", checkoutSession.customer)
              
              // Get customer's UID from Firestore
              const customersSnap = await firestore
              .collection("Clients")
              .where('stripeId', '==', checkoutSession.customer)
              .get();
  
              if (customersSnap.size !== 1) {
                throw new Error('User not found!');
              }
  
              const docId = customersSnap.docs[0].id;
  
              await firestore
              .collection("Clients")
              .doc(docId)
              .collection('payments')
              .add(checkoutSession);            
              
            }
            break;
          ///////////////////////////////////////////////
          ///////////////////////////////////////////////
          //////////////////////////////////////////////          
          default:
            logs.webhookHandlerError(
              new Error('Unhandled relevant event!'),
              event.id,
              event.type
            );
        }
        logs.webhookHandlerSucceeded(event.id, event.type);
      } catch (error) {
        logs.webhookHandlerError(error, event.id, event.type);
        resp.json({
          error: 'Webhook handler failed. View function logs in Firebase.',
        });
        return;
      }
    }
  
    // Return a response to Stripe to acknowledge receipt of the event.
    resp.json({ received: true });
  };