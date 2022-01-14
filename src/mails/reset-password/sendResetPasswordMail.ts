import nodemailer from "nodemailer";
import config from "../../config";

const sendResetPasswordMail = (to: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.mail.username,
      pass: config.mail.password
    }
  });

  const mailOptions = {
    from: config.mail.username,
    to,
    subject: "Reset your password",
    html: `
      <p>Please click the link to reset your password.</p>
      <a href=${config.app.url}/reset-password?code=${token}>${config.app.url}/reset-password?code=${token}</a>
    `
  };

  transporter.sendMail(mailOptions, function(error: any, info: any) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

export default sendResetPasswordMail;
