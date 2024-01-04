import nodemailer from "nodemailer";

const sendEmail = (email, link) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "jhjmhn@gmail.com",
      pass: "obsivgnolulbkkvc",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: "jhjmhn@gmail.com",
    to: email,
    subject: "Verify your email",
    text: "Welcome",
    html: `
      <div><a href=${link}>Click here to verify your email:${link}</a></div>
      `,
  };

  transporter.sendMail(mailOptions, (error, infor) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email is sent to your account");
    }
  });
};

export default sendEmail;
