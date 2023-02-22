


/**
 * Prefix Stripe metadata keys with `stripe_metadata_` to be spread onto Product and Price docs in Cloud Firestore.
 */
 export const prefixMetadata = (metadata: any) =>
 Object.keys(metadata).reduce((prefixedMetadata:any, key:any) => {
   prefixedMetadata[`stripe_metadata_${key}`] = metadata[key];
   return prefixedMetadata;
 }, {});