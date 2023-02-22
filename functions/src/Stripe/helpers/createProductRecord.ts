import * as logs from "../logs";
import {firestore} from "../../index"
import { Product } from "../interfaces";
import Stripe from "stripe"
import { prefixMetadata } from "./prefixMetadata";


/*
 * Create a Product record in Firestore based on a Stripe Product object.
 */
export const createProductRecord = async (product: Stripe.Product): Promise<void> => {
  const { firebaseRole, ...rawMetadata } = product.metadata;

  const productData: Product = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description,
    role: firebaseRole ?? null,
    images: product.images,
    ...prefixMetadata(rawMetadata),
  };
  await firestore
    .collection("Services")
    .doc(product.id)
    .set(productData);
  logs.firestoreDocCreated("Services", product.id);
};