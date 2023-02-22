import * as logs from "../logs";
import {firestore} from "../../index"
import Stripe from "stripe"



export const deleteProductOrPrice = async (pr: Stripe.Product | Stripe.Price) => {
    if (pr.object === 'product') {
      await firestore
        .collection("Services")
        .doc(pr.id)
        .delete();
      logs.firestoreDocDeleted("Services", pr.id);
    }
    if (pr.object === 'price') {
      await firestore
        .collection("Services")
        .doc((pr as Stripe.Price).product as string)
        .collection('prices')
        .doc(pr.id)
        .delete();
      logs.firestoreDocDeleted('prices', pr.id);
    }
  };