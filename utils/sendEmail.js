import nodemailer from "nodemailer";

export default async function sendEmail(email, subject, text) {
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

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: text,
        });
        console.log("email sent successfully");
    } catch (error) {
        console.log("email not sent!");
        console.log(error);
        return error;
    }
}
