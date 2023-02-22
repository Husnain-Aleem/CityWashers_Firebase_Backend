import { firestore } from "../index"

export async function SetDailyCalendar() {

    console.log('SetDailyCalendar started')

    const washers = await firestore.collection("Washers").get()

    if(washers.docs.length) {

    const date = new Date()
    const month = date.getUTCMonth() + 1
    const day = date.getUTCDate()
    const year = date.getUTCFullYear()

    const docId = year + "_" + month + "_" + day

    const orderDetails = {
        booked: false,
        orderId: null,
    }    

    const calendar:any = {
        "availableToday": true,   
        date: docId,     
        timeSlotsAndOrders: {
        "7": orderDetails,
        "8": orderDetails,
        "9": orderDetails,
        "10": orderDetails,
        "11": orderDetails,
        "12": orderDetails,
        "13": orderDetails,
        "14": orderDetails,
        "15": orderDetails,
        "16": orderDetails,
        "17": orderDetails,
        "18": orderDetails,
        "19": orderDetails,
        "20": orderDetails,
        "21": orderDetails,
        "22": orderDetails
        }
    }

    for(const washer of washers.docs) {

        calendar.washerId = washer.data().id

        calendar.remainingOrderCapacity = (await firestore.collection("Washers").doc(washer.id).get()).data()?.orderCapacity || 10

        await firestore.collection("Washers").doc(washer.id).collection("Calendar").doc(docId).set(calendar)

    }

    }

    else {
        console.log('No Washers Found')
        return null
    }

    return

  }