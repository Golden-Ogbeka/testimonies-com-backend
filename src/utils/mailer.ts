import colors from 'colors/safe';
import { create } from 'express-handlebars';
import nodemailer from 'nodemailer';
import path from 'path';
import { EMAIL_HOST, EMAIL_PASS, EMAIL_USER } from '../functions/env';
import { MailContentType } from '../types';

// Create transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: 587,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Handlebars view engine setup
const hbsEngine = create({
  extname: '.handlebars',
  layoutsDir: path.resolve('./src/templates/'),
  partialsDir: path.resolve('./src/templates/'),
  defaultLayout: false,
});

// Function to set up Handlebars
const setupHandlebars = async () => {
  try {
    const { default: nodemailerExpressHandlebars } = await import(
      'nodemailer-express-handlebars'
    );

    const handlebarOptions = {
      viewEngine: hbsEngine,
      viewPath: path.resolve('./src/templates/'),
    };

    transporter.use('compile', nodemailerExpressHandlebars(handlebarOptions));
    console.log(colors.blue('Email template setup successful'));
  } catch (error) {
    console.error(colors.red('Email Template setup failed'), { error });
  }
};

// Call the function to initialize handlebars
setupHandlebars();

const sendEmail = async ({
  email,
  recipient,
  subject,
  username,
  attachmentDetails,
}: MailContentType) => {
  try {
    const mailOptions: nodemailer.SendMailOptions & {
      template?: string;
      context?: any;
    } = {
      from: '"Product" <noreply@product.com>',
      to: recipient,
      subject: subject,
      template: 'email', // Template file name (without extension)
      context: {
        subject,
        emailContent: email,
        name: username,
        currentYear: new Date().getFullYear(),
      },
      ...(attachmentDetails
        ? {
            attachments: [
              {
                filename: attachmentDetails.fileName,
                content: attachmentDetails.fileBuffer,
                contentType: attachmentDetails.mimeType,
              },
            ],
          }
        : {}),
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("Couldn't send mail", { error });
  }
};

export { sendEmail };
