import * as functions from "firebase-functions"
import * as firebase from "firebase-admin"
import { firestore } from "../index"

export async function CreateWasher(
  req: functions.https.Request,
  res: functions.Response<any>
) {
  console.log("Create Washer Called")

  try {
    const email = req.body.email

    const washerQS = await firestore
      .collection("Washers")
      .where("email", "==", email)
      .get()

    const washerData = washerQS.docs

    if (washerData.length > 0) {
      return res.status(403).json({
        message: "Washer with email " + email + " already exists",
      })
    }

    const washerRecord = await firebase.auth().createUser({
      email: email,
      password: req.body.password,
    })

    console.log("Successfully created new washer:", email)

    const resp = await firestore.collection("Washers").add({
      userType: "washer",
      name: req.body.name,
      address: req.body.address,
      id: washerRecord.uid,
      email: email,
      telephoneNumber: req.body.telephoneNumber,
      finishedOnBoarding: req.body.finishedOnBoarding,
      score: req.body.score,
      orderCapacity: req.body.orderCapacity,
      servicePaused: req.body.servicePaused,
      performance: req.body?.KPI || null,
    })

    const data = await resp.get()

    return res.status(201).json(data.data())
  } catch (error) {
    console.log('error ', error)
    return res.status(403).json(error)
  }
}
