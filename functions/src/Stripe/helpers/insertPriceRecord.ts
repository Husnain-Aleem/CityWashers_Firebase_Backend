import * as logs from "../logs";
import {firestore} from "../../index"
import { Price } from "../interfaces";
import Stripe from "stripe"
import { prefixMetadata } from "./prefixMetadata";
import { stripeSecretKey } from "../../config/Globals";
const stripe = require('stripe')(stripeSecretKey);



/**
 * Create a price (billing price plan) and insert it into a subcollection in Products.
 */
 export const insertPriceRecord = async (price: Stripe.Price): Promise<void> => {
    if (price.billing_scheme === 'tiered')
      // Tiers aren't included by default, we need to retireve and expand.
      price = await stripe.prices.retrieve(price.id, { expand: ['tiers'] });
  
    const priceData: Price = {
      active: price.active,
      billing_scheme: price.billing_scheme,
      tiers_mode: price.tiers_mode,
      tiers: price.tiers ?? null,
      currency: price.currency,
      description: price.nickname,
      type: price.type,
      unit_amount: price?.unit_amount,
      recurring: price.recurring,
      interval: price.recurring?.interval ?? null,
      interval_count: price.recurring?.interval_count ?? null,
      trial_period_days: price.recurring?.trial_period_days ?? null,
      transform_quantity: price.transform_quantity,
      ...prefixMetadata(price.metadata),
    };
    const dbRef = firestore
      .collection("")
      .doc(price.product as string)
      .collection('prices');
    await dbRef.doc(price.id).set(priceData);
    logs.firestoreDocCreated('prices', price.id);
  };


  
