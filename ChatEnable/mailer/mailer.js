// Mail configuration
var mailConfig = require('./mailConfig');
var mailContent = require('./mailContent');

var mailer = {};

var nodemailer = require('nodemailer');

transporter = transporter = nodemailer.createTransport({
    service: mailConfig.service,
    auth: {
        user: mailConfig.fromAddress,
        pass: mailConfig.password
    }
});

mailer.sendEmail = (user, emailTemplateNumber, otherParams) => {
    var email = mailContent.getEmail(user, emailTemplateNumber, otherParams)
    var status = 0;

    var mailOptions = {
        from: mailConfig.fromAddress,
        to: user.email,
        subject: email.subject,
        text: email.content
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            status = 1;
        }
    });

    return status;
};

module.exports = mailer;
