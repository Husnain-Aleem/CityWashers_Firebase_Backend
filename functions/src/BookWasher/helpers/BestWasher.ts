import { firestore } from "../../index"


// find best washer based on KPI
export async function BestWasher(availableWashers: any[]): Promise<any> {
    const bestWashers = []

    if (availableWashers.length) {
        for (let avWasher of availableWashers) {
            const washer = (
                await firestore
                    .collection("Washers")
                    .where("id", "==", avWasher.washerId)
                    .get()
            ).docs[0].data()
            const score = washer?.score
            const washerEmail = washer?.email
            console.log("score ", score, " <==> email ", washerEmail)
            avWasher.score = score
            avWasher.washerEmail = washerEmail
            bestWashers.push(avWasher)
        }

        bestWashers.sort((a: any, b: any) => (a.score < b.score ? 1 : -1))

        const best = bestWashers[0];

        console.log('best ', best);

        // await firestore.collection("BestWashers").add({date: new Date(), best})

        return best
    } else {
        return null
    }
}