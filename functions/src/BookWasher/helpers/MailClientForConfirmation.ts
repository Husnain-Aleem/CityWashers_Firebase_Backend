import sgMail = require("@sendgrid/mail");
import { SENDER, SENDGRID_API_KEY } from "../../config/Globals";
import { firestore } from "../../index";
import * as functions from "firebase-functions";

sgMail.setApiKey(SENDGRID_API_KEY);

export async function MailClientForConfirmation(clientId: string) {

    console.log("MailClientForConfirmation called ", clientId);

    const client = await firestore
        .collection("Clients")
        .where("id", "==", clientId)
        .get();

    if (client.docs[0].data()) {

    const clientEmail = client.docs[0].data().email

    const mailBody = `<html>
    <div>
    Dear Client ${clientEmail}, Hope you are doing good.
    </div>
    <br>
    <div>
    You have an order pending for your confirmation.
    </div>
    <br>
    <div>
    You can confirm order by scanning this url: 
    </div>
    <br>
    <div>
    Thank you  
    </div>
    <br>
    </html>`;

        const msg = {
            to: clientEmail, // Change to your recipient
            from: SENDER, // Change to your verified sender
            subject: "You have an Order Pending For Confirmation",
            html: mailBody,
        };

        sgMail
            .send(msg)
            .then((response) => {
                console.log("Mail Sent To Client ", response[0].statusCode);
            })
            .catch((error) => {
                console.error(error);
            });
    } else {
        functions.logger.error("No Client found with id ", clientId);
    }
}
