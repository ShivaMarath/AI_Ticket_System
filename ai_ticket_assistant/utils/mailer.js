import nodemailer from "nodemailer"
export const sendmail = async(to, subject, text)=>{
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_SMTP_HOST,
            port: process.env.MAILTRAP_SMTP_PORT,
            secure: false, // use SSL
            auth: {
              user: process.env.MAILTRAP_SMTP_USER,
              pass: process.env.MAILTRAP_SMTP_PASS,
         }
})
const mailOptions = {
  from: 'yourusername@email.com',
  to: 'yourfriend@email.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

// Send the email
transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
  return info
});
    } catch (error) {
        console.log(error)
        }
}