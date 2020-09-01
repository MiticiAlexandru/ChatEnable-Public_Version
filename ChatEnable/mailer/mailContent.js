var mailContent = {};

mailContent.getEmail = (user, emailTemplateNumber, otherParams) => {
    var emailHeaders = [
        'Welcome to Chat Enable!',
        'Confirm your account',
        'Reset your password'
    ];

    var emails = [
`Welcome to Chat Enable, dear user!

With our platform you can video chat to all your friends. Your communication through our service is encrypted and private. To add a friend, simply ask them for their user ID and input it in the 'Add a fiend' section of the website.
Our platform is add-free and we will not send you marketing emails. We've also sent you an email with a token to confirm your address.

We wish you a great day!
Chat Enable`,

`Dear ${user.firstname} ${user.lastname},

This is your email confirmation token: ${otherParams}

We wish you a great day!
Chat Enable`,

`Dear ${user.firstname} ${user.lastname},

Use this one-time token to login and reset your password: ${otherParams}

We wish you a great day!
Chat Enable`
    ];

    let obj = {
        subject: emailHeaders[emailTemplateNumber],
        content: emails[emailTemplateNumber]
    };
    return obj;
};

module.exports = mailContent;
