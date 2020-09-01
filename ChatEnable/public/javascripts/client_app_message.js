// Resize functions:
function resizeAction() {
    APPmessageWindowResize();
}

function createAppMessage() {
    message = document.getElementById("POSTmessage").innerHTML;
    image = document.getElementById("POSTimage").innerHTML;
    buttonNames = document.getElementById("POSTbuttonNames").innerHTML;
    buttonTypes = document.getElementById("POSTbuttonTypes").innerHTML;
    buttonRedirectTo = document.getElementById("POSTbuttonRedirectTo").innerHTML;
    withCloseButton = document.getElementById("POSTwithCloseButton").innerHTML;

    APPmessageWindow('backgroundContainer', message, image, [buttonNames], [buttonTypes], [buttonRedirectTo], withCloseButton);
}
