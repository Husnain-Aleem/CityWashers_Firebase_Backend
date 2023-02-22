import { firestore } from "../../index"


export async function CreateOrder(
    washerId: string,
    clientId: string,
    services: any,
    scheduledPickUpTime: any,
    scheduledDeliveryTime: any
) {
    const resp = await firestore.collection("Orders").add({})

    const order = {
        id: resp.id,
        services: services,
        scheduledPickUpTime: scheduledPickUpTime,
        scheduledDeliveryTime: scheduledDeliveryTime,
        client: clientId,
        washer: null,
        status: "pending",
        missedWashers: [],
        isPickedUp: false,
        isDelivered: false,
        pickupUrl: null,
        deliveryUrl: null,
        paymentConfirmation: null,
        pendingApprovalByWasher: washerId,
        orderCreationTime: new Date()
    }

    await resp.set(order)
}


