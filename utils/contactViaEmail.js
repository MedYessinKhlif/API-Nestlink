import nodemailer from "nodemailer";
export default async function contactViaEmail( email, subject, message, listingId) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: Number(process.env.EMAIL_PORT),
            secure: Boolean(process.env.SECURE),
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
            tls: {
                // Disable certificate verification
                rejectUnauthorized: false
            }

        });

        const info = await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: message,
        });

        console.log("Email sent to landlord successfully:", info.messageId);
        // You can now use the listingId for further processing if needed
        console.log("Listing ID:", listingId);

        return info; // Return the info object for potential further processing
    } catch (error) {
        console.error("Email not sent!");
        console.error(error);
        throw error; // Throw the error for better error handling
    }
}