import nodemailer from "nodemailer";

const sendMail = async (req, res) => {
  const {
    name,
    senderEmail,
    subject,
    title,
    abstract,
    category,
    additionalInfo,
  } = req.body;

  try {
    // let transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: process.env.EMAIL_USER,   // your email
    //     pass: process.env.EMAIL_PASS,   // your Gmail App Password
    //   },
    // });

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "kokareshraddha5@gmail.com", // your email
        pass: "", // your Gmail App Password
      },
    });

    let mailOptions = {
      from: `"${name}" <${senderEmail}>`,
      to: "kokareshraddha05@gmail.com", // replace with target email
      subject: subject,
      html: `
        <h2>${title}</h2>
        <p><b>From:</b> ${name} (${senderEmail})</p>
        <p><b>Category:</b> ${category}</p>
        <p><b>Abstract:</b><br/> ${abstract}</p>
        <p><b>Additional Info:</b><br/> ${additionalInfo || "N/A"}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
};

export { sendMail };
