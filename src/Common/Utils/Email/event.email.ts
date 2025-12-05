import { EventEmitter } from "node:events";
import Mail from "nodemailer/lib/mailer";
import { sendEmail } from "./send.email";
import { verifyEmail } from "./templet.email";
import { ApplicationStatusEnum } from "src/Common/Enum";

interface IEmail extends Mail.Options {
  otp?: number,
  title: string,
  status?: ApplicationStatusEnum,
  jobTitle?: string;
  applicantName?: string;
}
export const emailEvent = new EventEmitter();
emailEvent.on("otpEmail", async (data: IEmail) => {
  console.log({ data });

  try {
    data.html = verifyEmail({
      title: data.title,
      body: ` <p style="font-size:15px; color:#444; text-align:center; margin-bottom: 25px; line-height:1.6;">
                       Use the code below to verify your account:
                    </p>
  
                    <div style="margin: 0 auto 25px; background:linear-gradient(135deg, #3b82f6, #7c3aed); color:#fff; font-size:24px; font-weight:700; letter-spacing:6px; text-align:center; padding:16px 0; border-radius:12px; width:80%; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                      ${data.otp}
                    </div>
  
                    <p style="font-size:14px; color:#666; text-align:center; margin-bottom:20px;">
                      This code will expire in <b>10 minutes</b>. Do not share it with anyone.
                    </p>
  
                    <p style="font-size:13px; color:#999; text-align:center;">
                      Didn’t request this? Just ignore this email.
                    </p>
           `
    })
    sendEmail(data)
  } catch (error) {
    console.log(`Fail to send email`, error);
  }
});
emailEvent.on("statusEmail", async (data: IEmail) => {
  console.log({ data });

  try {
    data.html = verifyEmail({
      title: data.title,
      body: `  
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#333; line-height:1.6; max-width:600px; margin:0 auto; padding:20px; background-color:#f9f9f9; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.05);">

  <p>Hi <strong>${data.applicantName || 'Applicant'}</strong>,</p>

  <p>Your application for <b>${data.jobTitle || 'the job'}</b> has been updated to: 
    <span style="font-weight:bold; color:${data.status === ApplicationStatusEnum.accepted ? '#28a745' : data.status === ApplicationStatusEnum.rejected ? '#dc3545' : '#fd7e14'}">
      ${data.status}
    </span>
    <p>This is an automated message. Please do not reply.</p>
  </p>
 
</div>

           `
    })
    sendEmail(data)
  } catch (error) {
    console.log(`Fail to send email`, error);
  }
});
