import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  await mailer.sendMail({
    from: `"ARevents" <${process.env.NODEMAILER_USER}>`,
    to,
    subject,
    html,
  });
};

// Kirim email verifikasi
export const sendVerificationEmail = async (to: string) => {
  const filePath = path.resolve("src/templates/register-template.hbs");
  if (!fs.existsSync(filePath)) {
    throw new Error("Email template tidak ditemukan di path: " + filePath);
  }
  const source = fs.readFileSync(filePath, "utf-8").toString();
  const template = handlebars.compile(source);
  const verify_url = `${
    process.env.FRONTEND_URL
  }/verify-email/${encodeURIComponent(to)}`;
  const html = template({ email: to, verify_url });
  await sendEmail(to, "ARevents: Verify Your Account", html);
};
