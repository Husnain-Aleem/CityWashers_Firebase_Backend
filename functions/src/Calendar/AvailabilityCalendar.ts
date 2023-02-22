import * as functions from "firebase-functions";
import { firestore } from "../index";

export async function AvailabilityCalendar(
    req: functions.https.Request,
    res: functions.Response<any>
) {
    try {
        console.log("AvailabilityCalendar Called");

        const availableWashers = await AvailabeWashers();

        const bestWashers = await BestWashers(availableWashers);

        console.log("resp ", bestWashers);

        res.status(200).json({
            bestWashers: bestWashers,
        });
    } catch (error) {
        console.log("error ", error);
        res.status(403).json(error);
    }
}

// find best washers based on address, radius and KPIs
async function BestWashers(availableWashers: any[]): Promise<string[]> {
    const bestWashers = [];

    if (availableWashers.length) {
        for (let washer of availableWashers) {
            const score = (
                await firestore
                    .collection("Washers")
                    .where("id", "==", washer.washerId)
                    .get()
            ).docs[0].data()?.score;
            console.log("score ", score);
            washer.score = score;
            bestWashers.push(washer);
        }

        bestWashers.sort((a: any, b: any) => (a.score < b.score ? 1 : -1));

        return bestWashers;
    } else {
        return [];
    }
}

// find washers which are avaiable/free for work now
async function AvailabeWashers(): Promise<string[]> {
    const date = await getDocID(new Date());

    const availableWashers = await firestore
        .collectionGroup("Calendar")
        .where("availableToday", "==", true)
        .where("remainingOrderCapacity", ">", 0)
        .where("date", "==", date)
        .get();

    if (availableWashers.docs.length) {
        const list = [];

        for (const washer of availableWashers.docs) {
            list.push(washer.data());
        }

        return list as unknown as string[];
    } else {
        return [];
    }
}

async function getDocID(date: any) {
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    const docId = year + "_" + month + "_" + day;
    return docId;
}
