// ================= email.js =================

import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"CowGuard" <${process.env.EMAIL_SENDER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;