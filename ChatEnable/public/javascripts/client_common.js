function validatePassword(x) {
    if(x.length >= 8 && x.match(/(.*[a-z].*)/) && x.match(/(.*[A-Z].*)/) && x.match(/(.*[0-9].*)/)) {
        return true;
    }
    alert("Please input a valid password! A password must have at least 8 characters and contain at least an uppercase letter, a lowercase letter and a number!");
    return false;
}

function validateEmail(x) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(x))
        return true;
    alert("Please input a valid email address!");
    return false;
}

function validateName(x) {
    if(x.length == 0)
        return false;
    return true;
}

function validateUsername(x) {
    if(x.length < 8) {
        alert("Please input a valid username! A username must have at least 8 characters!");
        return false;
    }
    return true;
}

// Setting device sizes:
const mobileMaxWidth = 600;
const mobileMaxHeight = 800;

// Redirect function:
function redirectTo(urlTo) {
    location.href = urlTo;
}

// Remove HTML elements:
function removeHTMLelementById(id) {
    var elem = document.getElementById(id);
    elem.parentNode.removeChild(elem);
}
function removeHTMLelementByClass(className) {
    var elem = document.getElementsByClassName(className);
    while(elem[0]) {
        elem[0].parentNode.removeChild(elem[0]);
    }
}

// Resize a component:
function resizeElement(element, width, height, marginLeft, marginTop, font) {
    // Resize the element:
    element.style.width = width;
    element.style.height = height;
    element.style.marginLeft = marginLeft;
    element.style.marginTop = marginTop;

    element.style.fontSize = font;
}

// Resize a component by id:
function resizeComponents(id, width, height, marginLeft, marginTop, font) {
    var element = document.getElementById(id);
    resizeElement(element, width, height, marginLeft, marginTop, font);
}

// Resize a component by class:
function resizeClassComponents(id, width, height, marginLeft, marginTop, font) {
    var collection = document.getElementsByClassName(id);
    for(i=0;i<collection.length;i++)
        resizeElement(collection[i], width, height, marginLeft, marginTop, font);
}

// Resize APPmessageWindow:
function APPmessageWindowResize() {
    var elementExists = document.getElementsByClassName("APPmessageContainer");
    if(elementExists != null) {
        var width = window.outerWidth;
        var height = window.outerHeight;
        if(width < mobileMaxWidth)
            resizeClassComponents("APPmessageContainer", '90%', '95%', '5%', '2.5%', '5.5vmin');
        else {
            if(height < mobileMaxHeight)
                resizeClassComponents("APPmessageContainer", '90%', '90%', '5%', '2.5%', '5.5vmin');
            else
                resizeClassComponents("APPmessageContainer", '50%', '70%', '25%', '7.5%', '3.5vmin');
        }
    }
}

// Reset display after message;
// Set 0 for hidden, something else for visible.
var childList = [];
function APPmessageWindowCallback(display, parentID) {
    var parent = document.getElementById(parentID);
    children = parent.children;
    for(i=0;i<children.length;i++) {
        if(display == 0) {
            if(children[i].style.display == "block")
                childList.push(1);
            else
                childList.push(0);
            children[i].style.display = "none";
        } else {
            if(childList[i] == 1)
                children[i].style.display = "block";
        }
    }
    if(display == 1)
        childList = [];
}

// Create a message window with a custom message, has a varying number of buttons with custom messages and types;
// 0 for light blue button, 1 for red button and 2 for orange button;
// -1 for an icon button (in this case, the button message should be an image src);
// Leave messageIcon blank for no icon;
// Set a valid url in redirectTo in order to redirect there on button click;
// Leave an empty entry in redirectTo to close the message on button click;
// Set withCloseButton to true to include a close button on the app message window.

// Exemple of usage:
// APPmessageWindow("backgroundContainer", "Some message", "/images/send_icon.png", ["Ok", "/images/confirm.png", "OK!"], [0, -1, 2], ["login", "home", ""], true);
function APPmessageWindow(parentID, customMessage, messageIcon, buttonMessages, buttonTypes, buttonRedirectTo, withCloseButton) {
    // First, hide all elements:
    APPmessageWindowCallback(0, parentID);

    // Get parent element by id:
    var p = document.getElementById(parentID);

    // Create new message container:
    var messageContainer = document.createElement("div");
    messageContainer.classList.add("APPmessageContainer");
    p.appendChild(messageContainer);

    // Add close button to window, if needed:
    if(withCloseButton == 'true') {
        // Create button:
        var b = document.createElement("button");
        b.id = "closeWindowButton";
        b.innerHTML = "<img src='/images/cancel.png' class='icon'>";

        // Add onclick event to button:
        func = new Function("removeHTMLelementByClass('APPmessageContainer'); APPmessageWindowCallback(1, '" + parentID + "');");
        b.addEventListener("click", func);

        // Add the button to the window:
        messageContainer.appendChild(b);
    }

    // Add the message:
    if(customMessage == "")
        customMessage = "We're sorry, but there's been an unexpected error! <br><br> <img src='/images/error_icon.png' class='APPmessageIcon'>";
    else
        if(messageIcon != "")
            customMessage = customMessage + " <br><br> <img src='" + messageIcon + "' class='APPmessageIcon'>";
    if(withCloseButton == 'true')
        customMessage = "<br>" + customMessage;
    var APPmessage = document.createElement("p");
    APPmessage.classList.add("APPmessageText");
    APPmessage.innerHTML = customMessage;
    messageContainer.appendChild(APPmessage);

    // Add button paragraph:
    var buttonParagraph = document.createElement("fieldset");
    buttonParagraph.classList.add("iconFieldset");
    messageContainer.appendChild(buttonParagraph);

    // Add the buttons:
    n = buttonMessages.length;
    for(i=0;i<n;i++) {
        // Prepare button type:
        switch(buttonTypes[i]) {
            case "-1": buttonTypes[i] = "iconBtn2";
            buttonMessages[i] = "<img src='" + buttonMessages[i] + "' class='icon'>";
            break;

            case "0": buttonTypes[i] = "buttonLightBlue";
            break;

            case "1": buttonTypes[i] = "buttonRed";
            break;

            case "2": buttonTypes[i] = "buttonOrange";
            break;
        }

        // Create button:
        var b = document.createElement("button");
        b.classList.add(buttonTypes[i]);
        b.innerHTML = buttonMessages[i];

        // Add onclick event to button:
        if(buttonRedirectTo[i] != "") {
            func = new Function("redirectTo('/" + buttonRedirectTo[i] + "');");
            b.addEventListener("click", func);
        } else {
            func = new Function("removeHTMLelementByClass('APPmessageContainer'); APPmessageWindowCallback(1, '" + parentID + "');");
            b.addEventListener("click", func);
        }

        // Add the button and spaces (if needed):
        buttonParagraph.appendChild(b);
        if(i<n-1)
            buttonParagraph.insertAdjacentHTML( 'beforeend', "&nbsp;&nbsp;&nbsp;" );
    }

    // Finally, call resize:
    APPmessageWindowResize();
}
