import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { firestore } from "../index";

export async function SendPushNotifications(
  req: functions.https.Request,
  res: functions.Response<any>
) {
  try {
    const userType = req.body.userType;
    console.log("userType ", userType);
    const storeOwnerEmail = req.body.storeOwnerEmail;
    console.log("storeOwnerEmail ", storeOwnerEmail);

    const PushNotification = await firestore.collection('PushNotifications').doc(storeOwnerEmail).get();

    const title = PushNotification.data()?.title;
    const body = PushNotification.data()?.body;
    const imageURL = PushNotification.data()?.imageURL;
    const deepLink = PushNotification.data()?.deeplLink;

    if (userType === "android-users") {
      const tokens = await firestore
        .collection("PushNotifications")
        .doc(storeOwnerEmail)
        .collection("android-users")
        .doc("andriod_tokens")
        .get();

      const androidTokens = tokens.data()?.tokens;

      if (androidTokens) {
        for (let token of androidTokens) {
          await admin.messaging().send({
            token: token,
            android: {
              notification: {
                title: title,
                body: body,
                imageUrl: imageURL,                
              },
            },
          });
        }
      } else {
        console.log(
          "ANDROID - No Token Found In Store Owner " + storeOwnerEmail + " collection"
        );
        return res.send({
          messgae:
            "ANDROID - No Token Found In Store Owner " + storeOwnerEmail + " collection",
        });
      }
    } 

    else if (userType === "iphone-users") {
      const itokens = await firestore
        .collection("PushNotifications")
        .doc(storeOwnerEmail)
        .collection("iphone-users")
        .doc("iphone_tokens")
        .get();

      const iOSTokens = itokens.data()?.tokens;

      if (iOSTokens) {
        for (let token of iOSTokens) {
          await admin.messaging().send({
            token: token,
            apns: {
              payload: {
                aps: {
                  alert: {
                    title: title,
                    body: body,
                  },
                },
              },
              fcmOptions: {
                imageUrl: imageURL
              },
            },
          });
        }
      } else {
        console.log(
          "IOS - No Token Found In Store Owner " + storeOwnerEmail + " collection"
        );
        return res.send({
          messgae:
            "IOS - No Token Found In Store Owner " + storeOwnerEmail + " collection",
        });
      }
    } 

    else if (userType === "all-users") {
      /////////////////////////////////////////////////
      // Android
      /////////////////////////////////////////////////
      const tokens = await firestore
        .collection("PushNotifications")
        .doc(storeOwnerEmail)
        .collection("android-users")
        .doc("andriod_tokens")
        .get();

      const androidTokens = tokens.data()?.tokens;

      if (androidTokens) {
        for (let token of androidTokens) {
          await admin.messaging().send({
            token: token,
            android: {
              notification: {
                title: title,
                body: body,
                imageUrl: imageURL,
                clickAction: deepLink,
              },
            },
          });
        }
      } else {
        console.log(
          "ALL USERS - No Token Found In Store Owner " + storeOwnerEmail + " collection"
        );
      }
      //

      /////////////////////////////////////////////////
      // iOS
      /////////////////////////////////////////////////

      const itokens = await firestore
        .collection("PushNotifications")
        .doc(storeOwnerEmail)
        .collection("iphone-users")
        .doc("iphone_tokens")
        .get();

      const iOSTokens = itokens.data()?.tokens;

      if (iOSTokens) {
        for (let token of iOSTokens) {
          await admin.messaging().send({
            token: token,
            apns: {
              payload: {
                aps: {
                  alert: {
                    title: title,
                    body: body,
                  },
                },
              },
              fcmOptions: {
                imageUrl: imageURL,
              },
            },
          });
        }
      } else {
        console.log(
          "ALL USERS - No Token Found In Store Owner " + storeOwnerEmail + " collection"
        );
      }
      //
    }

    return res.send({
      messgae: "Success",
    });

  } catch (error) {
    console.log("error ", error);
    return res.send({
      messgae: error,
    });
  }
}

