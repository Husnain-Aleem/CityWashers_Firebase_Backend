import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as cors from "cors";
import * as firebaseAccountCredentials from "./config/donewashproject-service-account.json";
// import { stripeWebhooks } from "./Stripe/stripe-webhooks";
import { CreateClient } from "./CreateAccounts/CreateClient";
import { CreateWasher } from "./CreateAccounts/CreateWasher";
import { AvailabilityCalendar } from "./Calendar/AvailabilityCalendar";
import { SendPushNotifications } from "./notifications/SendNotifications";
import { SetDailyCalendar } from "./Calendar/setDailyCalendar";
import { StartBooking } from "./BookWasher/StartBooking";
import { GetOrder } from "./Orders/GetOrder";
import { Create30MinutesJob } from "./BookWasher/helpers/Create30MinutesJob";
import { Wait30Minutes } from "./BookWasher/helpers/Wait30Minutes";
import { AddDateToCalendar } from "./__DataManipulation/AddDateToCalendar";
import { ArrayUnion } from "./__DataManipulation/ArrayUnion"
import { CreateCheckoutSession } from "./Stripe/CreateCheckoutSession/CreateCheckoutSession";
import { CreateCustomerInStripe } from "./Stripe/CreateCustomer/CreateCustomerInStripe";
import { StripeWebhooksEvents } from "./Stripe/WebhookHandler/StripeWebhooksEvents";
import { WasherRejectsOrder } from "./Orders/WasherRejectsOrder";
import { WasherConfirmsOrder } from "./Orders/WasherConfirmsOrder";
import { ConfirmOrderPickup } from "./Orders/ConfirmOrderPickup";
import { ConfirmOrderDelivery } from "./Orders/ConfirmOrderDelivery";
import { AddExistingCustToStripe } from "./__DataManipulation/AddExistingCustToStripe";




const serviceAccount = firebaseAccountCredentials as admin.ServiceAccount;

admin.initializeApp(
  {credential: admin.credential.cert(serviceAccount)}
);

export const firestore = admin.firestore()


const whitelist = [
    'http://localhost:4200',
];

const corsHandler = cors
({

    origin: (origin: any, callback: any) => {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error(`Origin: ${origin} not allowed by CORS!!`))
            // callback(null, true)
        }
    }
});

module.exports = {    
        /***********************************************************************************/
        // Push Notifications                                           /////////////////////
        /////////////////////////////////////////////////////////////////////////////////////                  
        'SendPushNotifications': functions.runWith({minInstances: 5}).https.onRequest((req: functions.https.Request, res: functions.Response<any>) => {
            corsHandler(req, res, async() => await SendPushNotifications(req, res))
        }),        
        /***********************************************************************************/
        // Account Creations                                         ///////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////  
        'CreateClient': functions.https.onRequest((req: functions.https.Request, res: functions.Response<any>) => {
            corsHandler(req, res, async() => await CreateClient(req, res))
        }),              
        'CreateWasher': functions.https.onRequest((req: functions.https.Request, res: functions.Response<any>) => {
            corsHandler(req, res, async() => await CreateWasher(req, res))
        }),        
        /***********************************************************************************/
        // Book Washer                                           ///////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////                
        'Create30MinutesJob': functions.firestore.document("Orders/{orderId}")
        .onUpdate(async(
            docQS: functions.Change<functions.firestore.QueryDocumentSnapshot>,
            context: functions.EventContext) => {
            await Create30MinutesJob(docQS, context)
        }),
        'Wait30Minutes': functions.https.onRequest((req: functions.https.Request, res: functions.Response<any>) => {
            corsHandler(req, res, async() => await Wait30Minutes(req, res))
        }),
        'StartBookingWasher': functions.region("europe-west1").https.onRequest((req: functions.https.Request, res: functions.Response<any>) => {
            corsHandler(req, res, async() => await StartBooking(req, res))
        }),
        /***********************************************************************************/
        // Orders                                           ///////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////
        // 'ConfirmOrderDelivery': functions.https.onRequest((req: functions.https.Request, res: functions.Response<any>) => {
        //     corsHandler(req, res, async() => await ConfirmOrderDelivery(req, res))
        // }),
        // 'ConfirmOrderPickup': functions.https.onRequest((req: functions.https.Request, res: functions.Response<any>) => {
        //     corsHandler(req, res, async() => await ConfirmOrderPickup(req, res))
        // }),
        // 'GetOrder': functions.https.onRequest((req: functions.https.Request, res: functions.Response<any>) => {
        //     corsHandler(req, res, async() => await GetOrder(req, res))
        // }),
        // 'WasherConfirmsOrder': functions.https.onRequest((req: functions.https.Request, res: functions.Response<any>) => {
        //     corsHandler(req, res, async() => await WasherConfirmsOrder(req, res))
        // }),
        'WasherRejectsOrder': functions.https.onRequest((req: functions.https.Request, res: functions.Response<any>) => {
            corsHandler(req, res, async() => await WasherRejectsOrder(req, res))
        }),        
        /***********************************************************************************/
        //     Stripe                                           ////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////
        'CreateCheckoutSession': functions.firestore.document(`/{Customers}/{docId}/checkout_sessions/{id}`)
        .onCreate(async (
            snap: functions.firestore.QueryDocumentSnapshot,
            context: functions.EventContext) => {
            await CreateCheckoutSession(snap, context)
        }),
        'CreateCustomerInStripe': functions.firestore.document(`/{Customers}/{docId}`)
        .onCreate(async (
            snap: functions.firestore.QueryDocumentSnapshot,
            context: functions.EventContext) => {
            await CreateCustomerInStripe(snap, context)
        }),        
        'StripeWebhooksEvents': functions.runWith({ memory: '2GB', timeoutSeconds: 540 })
        .https.onRequest((req: functions.https.Request, res: functions.Response<any>) => {
            corsHandler(req, res, async() => await StripeWebhooksEvents(req, res))
        }),
        /***********************************************************************************/
        /////////////////////////////////////////////////////////////////////////////////////
        ///  Calendar  //////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////
        'AvailabilityCalendar': functions.runWith({timeoutSeconds: 540}).https.onRequest((req: functions.https.Request, res: functions.Response<any>) => {
            corsHandler(req, res, async() => await AvailabilityCalendar(req, res))
        }),
        'SetDailyCalendar': functions.region("europe-west1") //Belgium
        .pubsub
        .schedule("0 6 * * *") // every morning at 6 a.m Amsterdam time
        .timeZone("Europe/Amsterdam") // timezone taken from https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
        .onRun(async() => await SetDailyCalendar()),
        /***********************************************************************************/
        /// Data Manipulation ///////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////
        // 'AddDateToCalendar': functions.https.onRequest((req: functions.https.Request, res: functions.Response<any>) => {
        //     corsHandler(req, res, async() => await AddDateToCalendar(req, res))
        // }),
        // 'ArrayUnion': functions.https.onRequest((req: functions.https.Request, res: functions.Response<any>) => {
        //     corsHandler(req, res, async() => await ArrayUnion(req, res))
        // }),
        'AddExistingCustToStripe': functions.https.onRequest((req: functions.https.Request, res: functions.Response<any>) => {
            corsHandler(req, res, async() => await AddExistingCustToStripe(req, res))
        }),
}


