const nodemailer = require("nodemailer");

const mailUser = process.env.MAIL_USER || process.env.EMAIL_USER;
const mailPass = process.env.MAIL_PASS || process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: mailUser,
    pass: mailPass,
  },
});

const sendMail = async ({ to, subject, html, text }) => {
  if (!to) return;

  await transporter.sendMail({
    from: mailUser,
    to,
    subject,
    html,
    text,
  });
};

module.exports = { sendMail, transporter };
