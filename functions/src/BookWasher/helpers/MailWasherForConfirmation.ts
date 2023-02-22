import sgMail = require("@sendgrid/mail")
import { SENDER, SENDGRID_API_KEY } from "../../config/Globals"

sgMail.setApiKey(SENDGRID_API_KEY)


export async function MailWasherForConfirmation(washerEmail: string) {

    console.log('MailWasherForConfirmation called ', washerEmail);

    const washerEmail2 = "laalgeenew@gmail.com"

    const mailBody = `<html>
    <div>
    Hi ${washerEmail}, Hope you are doing good.
    </div>
    <br>
    <div>
    You have an order pending for your confirmation.
    </div>
    <br>
    <div>
    Here is the link: 
    </div>
    <br>
    <div>
    Thank you  
    </div>
    <br>
    </html>`

    const msg = {
        to: washerEmail2, // Change to your recipient
        from: SENDER, // Change to your verified sender
        subject: "You have an Order Pending For Confirmation",
        html: mailBody,
    }

    sgMail
        .send(msg)
        .then((response) => {
            console.log("Mail Sent To Washer  ", response[0].statusCode)
        })
        .catch((error) => {
            console.error(error)
        })
}