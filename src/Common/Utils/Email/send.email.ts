import { BadRequestException } from "@nestjs/common";
import { createTransport, Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
console.log({
    email: process.env.EMAIL_SENDER,
    password: process.env.PASSWORD_FOR_EMAIL_SENDER
});



export const sendEmail = async (data: Mail.Options): Promise<boolean> => {
    console.log({ data });


    if (!data.html && !data.attachments?.length && !data.text) {
        throw new BadRequestException("Missing Email Content")
    }

    console.log({
        email: process.env.EMAIL_SENDER,
        password: process.env.PASSWORD_FOR_EMAIL_SENDER
    });

    const transporter: Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> = createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_SENDER as string,
            pass: process.env.PASSWORD_FOR_EMAIL_SENDER as string,
        },
    });


    const info = await transporter.sendMail({
        from: `"${process.env.APPLICATION_NAME}🌟" <${process.env.EMAIL_SENDER as string}>`,
        ...data
    });
    console.log({ info: info.accepted });

    if (info.accepted.length) return true
    return false
} 