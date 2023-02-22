import { firestore } from "../../index";

// find washers which are avaiable/free for work now
export async function AvailabeWashers(
    hour: number,
    washerId?: string,
    missedWashers?: string[]
): Promise<string[]> {
    const today = new Date();
    const month = today.getUTCMonth() + 1;
    const day = today.getUTCDate();
    const year = today.getUTCFullYear();

    const date = year + "_" + month + "_" + day;

    const availableWashers = await firestore
        .collectionGroup("Calendar")
        .where("availableToday", "==", true)
        .where("remainingOrderCapacity", ">", 0)
        .where("date", "==", date)
        .get();

    if (availableWashers.docs.length) {
        const list = [];

        for (const washer of availableWashers.docs) {
            const h = washer.data()?.timeSlotsAndOrders[hour] || null;
            if (h && h.booked === false) {
                list.push(washer.data());
            }
        }

        if (washerId) {
            missedWashers?.push(washerId);
            for (const removeWasher of missedWashers as unknown as any) {
                const removeIndex = list
                    .map((calendar) => calendar.washerId)
                    .indexOf(removeWasher);
                console.warn(
                    `removeIndex ${removeIndex} || new washer who missed order  ${removeWasher}`
                );
                list.splice(removeIndex, 1);
            }
        }

        // await firestore
        //     .collection("AvailabeWashers")
        //     .add({ list, date: new Date() });
        console.log("list before returning to best washers ", list)
        return list as unknown as string[];
    } else {
        return [];
    }
}
