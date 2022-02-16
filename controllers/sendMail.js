const nodemailer = require("nodemailer");

module.exports = async (to, url ,txt) => {
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
            },
        });

        await transporter.sendMail({
            from: process.env.USER,
            to: to,
            subject: `Hello ✔`,
            html: `
                     <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
                         <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to our Application.</h2>
                         <p>Congratulations! You're almost set to start using Our Website.
                          Click the button below to validate your email address.
                         </p>
            
                         <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${txt}</a>
            
                         <p>If the button doesn't work for any reason, you can also click on the link below:</p>
            
                         <div>${url}</div>
                         </div>
                     `
        });
        console.log("email sent successfully");
    } catch (error) {
        console.log(error);
        console.log("email not sent!");
    }
}


