function buildObject(args) {
    messageObject = {
        title: 'App message',
    
        message: args[0],
        image: args[1],
        buttonNames: args[2],
        buttonTypes: args[3],
        buttonRedirectTo: args[4],
        withCloseButton : args[5]
    };

    return messageObject;
}

var appMessages = [];

// Order is important, add new entries to the end
appMessages.push(buildObject(["", "/images/error_icon.png", ["Back"], ["0"], ["login"], "false"]));
appMessages.push(buildObject(["The account does not exist!", "", ["Back to login"], ["0"], ["login"], "false"]));
appMessages.push(buildObject(["Wrong username and password combination!", "", ["Back to login"], ["0"], ["login"], "false"]));
appMessages.push(buildObject(["We've sent you an account confirmation email! Remember to activate your account using the token we've sent you.", "/images/send_icon.png", ["Back to login"], ["0"], ["login"], "false"]));
appMessages.push(buildObject(["Username already taken.", "", ["Back to login"], ["0"], ["login"], "false"]));
appMessages.push(buildObject(["Your account has been activated!", "", ["Back to login"], ["0"], ["login"], "false"]));
appMessages.push(buildObject(["Account already activated.", "", ["Back to login"], ["0"], ["login"], "false"]));
appMessages.push(buildObject(["Wrong token!", "", ["Back to login"], ["0"], ["login"], "false"]));
appMessages.push(buildObject(["We've sent you an email with a new token! You can use it for a one-time login. You can then change your password.", "/images/send_icon.png", ["Back to login"], ["0"], ["login"], "false"]));
appMessages.push(buildObject(["Wrong username and email combination!", "", ["Back to login"], ["0"], ["login"], "false"]));

appMessages.push(buildObject(["", "/images/error_icon.png", ["Back"], ["0"], ["home"], "false"]));
appMessages.push(buildObject(["Your password was reset.", "", ["Back"], ["0"], ["home"], "false"]));
appMessages.push(buildObject(["Your email was reset.", "", ["Back"], ["0"], ["home"], "false"]));
appMessages.push(buildObject(["You cannot add yourself to your friends list.", "", ["Back"], ["0"], ["home"], "false"]));
appMessages.push(buildObject(["You are already friends.", "", ["Back"], ["0"], ["home"], "false"]));
appMessages.push(buildObject(["There is no account associated with this id.", "", ["Back"], ["0"], ["home"], "false"]));
appMessages.push(buildObject(["New friend succesfuly added.", "", ["Back"], ["0"], ["home"], "false"]));

module.exports = appMessages;
