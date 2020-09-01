function validateFormLogin() {
    let user = document.getElementById('usernameField');
    let password = document.getElementById('passwordField');

    if(validateUsername(user.value) == true && validatePassword(password.value) == true)
        return true;
    return false;
}

function validateFormRegister() {
    let user = document.getElementById('signUpUsernameField');
    let password = document.getElementById('signUpPasswordField');
    let password2 = document.getElementById('signUpPasswordConfirmField');
    let email = document.getElementById('emailField');
    let firstname = document.getElementById('firstNameField');
    let lastname = document.getElementById('lastNameField');

    if((password.value == password2.value) && validatePassword(password.value) == true && validateUsername(user.value) == true && validateEmail(email.value) == true) {
        if(validateName(firstname.value) == true && validateName(lastname.value) == true)
            return true;
        else
            alert('No first name or last name provided!');
    }
    return false;
}

function validateFormForgotPass() {
    let user = document.getElementById('usernameRecovery');
    let email = document.getElementById('recoveryEmailField');

    if(validateUsername(user.value) == true && validateEmail(email.value) == true)
        return true;
    return false;
}

// Resize functions:
function resizeAction() {
    var width = window.outerWidth;
    var height = window.outerHeight;
    if(width < mobileMaxWidth) {
        resizeComponents("loginContainer", '90%', '95%', '5%', '2.5%', '5.5vmin');
        resizeComponents("signUpContainer", '90%', '95%', '5%', '2.5%', '3vmin');
        resizeComponents("forgotPasswordContainer", '90%', '95%', '5%', '2.5%', '5.5vmin');
    } else {
        if(height < mobileMaxHeight) {
            resizeComponents("loginContainer", '90%', '90%', '5%', '2.5%', '5.5vmin');
            resizeComponents("signUpContainer", '90%', '90%', '5%', '2.5%', '3vmin');
            resizeComponents("forgotPasswordContainer", '90%', '90%', '5%', '2.5%', '5.5vmin');
        } else {
            resizeComponents("loginContainer", '50%', '70%', '25%', '7.5%', '3.5vmin');
            resizeComponents("signUpContainer", '50%', '90%', '25%', '2.5%', '3vmin');
            resizeComponents("forgotPasswordContainer", '50%', '70%', '25%', '7.5%', '3.5vmin');
        }
    }
    APPmessageWindowResize();
}

// Function to switch between sign up and login windows:
function switchLoginSignUp() {
    switchHTMLelements("loginContainer", "signUpContainer");
}

// Function to switch between login and forgot password windows:
function switchLoginForgotPass() {
    switchHTMLelements("loginContainer", "forgotPasswordContainer");
}

// Function to switch between two windows:
function switchHTMLelements(a, b) {
    var x = document.getElementById(a);
    var y = document.getElementById(b);
    if (x.style.display === "none") {
        y.style.display = "none";
        x.style.display = "block";
    } else {
        x.style.display = "none";
        y.style.display = "block";
    }
}

function initialize() {
    var element = document.getElementById("loginContainer");
    element.style.display = "block";
    resizeAction();
}

// Back to login function (activate page)
function backToLogin() {
    redirectTo('/login');
}

function checkChange() {
    var img = document.getElementById('imageUpload');
    var btn = document.getElementById('submitUpload');

    if( img.files.length == 0 ){
        btn.disabled = true;
    } else {
        btn.disabled = false;
    }
}
