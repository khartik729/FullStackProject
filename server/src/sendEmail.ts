import nodemailer from "nodemailer";

export async function sendEmail(email: string ) {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 4000,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "khartik.u@gmail.com", // generated ethereal user
            pass: "mustang2020" // generated ethereal password
        },
        tls:{
            rejectUnauthorized:false
        }
    });

    const mailOptions = {
        from: '"Khartik Uppalapati" <khartik.u@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello World !!", // plain text body
        html: "<h1>Hello,you have singed up to Khartik.com</h1>"
    };

    try {
     await transporter.sendMail(mailOptions);   
    } catch (err) {
        console.error(err);
    }
}
