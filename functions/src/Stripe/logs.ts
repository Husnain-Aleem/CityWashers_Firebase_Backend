
export const creatingCustomer = (uid: string) => {
    console.log(`⚙️ Creating customer object for [${uid}].`);
  };
  
  export const customerCreationError = (error: any, uid: string) => {
    console.error(
      `❗️[Error]: Failed to create customer for [${uid}]:`,
      error.message
    );
  };
  
  export const customerDeletionError = (error: Error, uid: string) => {
    console.error(
      `❗️[Error]: Failed to delete customer for [${uid}]:`,
      error.message
    );
  };
  
  export function customerCreated(id: string, livemode: boolean) {
    console.log(
      `✅Created a new customer: https://dashboard.stripe.com${
        livemode ? '' : '/test'
      }/customers/${id}.`
    );
  }
  
  export function customerDeleted(id: string) {
    console.log(`🗑Deleted Stripe customer [${id}]`);
  }
  
  export function creatingCheckoutSession(docId: string) {
    console.log(`⚙️ Creating checkout session for doc [${docId}].`);
  }
  
  export function checkoutSessionCreated(docId: string) {
    console.log(`✅Checkout session created for doc [${docId}].`);
  }
  
  export function checkoutSessionCreationError(docId: string, error: any) {
    console.error(
      `❗️[Error]: Checkout session creation failed for doc [${docId}]:`,
      error.message
    );
  }
  
  export function createdBillingPortalLink(uid: string) {
    console.log(`✅Created billing portal link for user [${uid}].`);
  }
  
  export function billingPortalLinkCreationError(uid: string, error: Error) {
    console.error(
      `❗️[Error]: Customer portal link creation failed for user [${uid}]:`,
      error.message
    );
  }
  
  export function firestoreDocCreated(collection: string, docId: string) {
    console.log(
      `🔥📄 Added doc [${docId}] to collection [${collection}] in Firestore.`
    );
  }
  
  export function firestoreDocDeleted(collection: string, docId: string) {
    console.log(
      `🗑🔥📄 Deleted doc [${docId}] from collection [${collection}] in Firestore.`
    );
  }
  
  export function userCustomClaimSet(
    uid: string,
    claimKey: string,
    claimValue: string
  ) {
    console.log(
      `🚦 Added custom claim [${claimKey}: ${claimValue}] for user [${uid}].`
    );
  }
  
  export function badWebhookSecret(error: any) {
    console.error(
      '❗️[Error]: Webhook signature verification failed. Is your Stripe webhook secret parameter configured correctly?',
      error.message
    );
  }
  
  export function startWebhookEventProcessing(id: string, type: string) {
    console.log(`⚙️ Handling Stripe event [${id}] of type [${type}].`);
  }
  
  export function webhookHandlerSucceeded(id: string, type: string) {
    console.log(`✅Successfully handled Stripe event [${id}] of type [${type}].`);
  }
  
  export function webhookHandlerError(error: any, id: string, type: string) {
    console.error(
      `❗️[Error]: Webhook handler for  Stripe event [${id}] of type [${type}] failed:`,
      error.message
    );
  }
  