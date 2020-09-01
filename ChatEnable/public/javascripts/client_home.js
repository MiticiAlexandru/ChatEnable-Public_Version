overLAN = true;

// ***************************************
// Video, audio and WEB-RTC code
// ***************************************

var sessionDescription = window.RTCSessionDescription ||
    window.mozRTCSessionDescription ||
    window.webkitRTCSessionDescription ||
    window.msRTCSessionDescription;

var pc;

var streamStarted = false;
const serverID = 'server';
var serverKey;
var callerID = null;
var callerKey;

const configPeerConnection = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
    ],
}

if(overLAN == true)
    pc = new RTCPeerConnection();
else
    pc = new RTCPeerConnection(configPeerConnection);

pc.ontrack = function (e) {
    var video = document.getElementById('videoScreen');
    video.srcObject = e.streams[0];
    video.play();
}

function startStream() {
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        if(streamStarted == false) {
            streamStarted = true;
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(function(stream) {
                var yourVideo = document.getElementById('yourVideoScreen');
                yourVideo.srcObject = stream;
                yourVideo.play();
                stream.getTracks().forEach(track => {
                    pc.addTrack(track, stream); 
                });
            }, error);
        } else {
            alert('Stream already started!');
        }
    } else {
        alert('Camera error!');
    }
}

function endStream() {
    streamStarted = false;
    pc.close();
}

pc.onconnectionstatechange = function (event) {
    if(pc.connectionState == 'connected')
        document.getElementById('convo_time').innerHTML = 'CONNECTED';
    else
        document.getElementById('convo_time').innerHTML = 'CONNECTING...';

    socket.emit('server pc connection change', {
        between: [myID, callerID],
        state: pc.connectionState,
        iceState: pc.iceConnectionState
    });
}

pc.onicecandidate = function(event) {
    if (event.candidate) {
        // Send the candidate to the remote peer
        socket.emit('send ICE candidate', {
            candidate: event.candidate,
            from: myID,
            to: callerID
        });
    }
}

pc.onnegotiationneeded = function() {
    pc.createOffer(function (offer) {
        pc.setLocalDescription(new sessionDescription(offer), function () {
            socket.emit('make offer', {
                offer: offer,
                to: callerID,
                from: myID,
                offerType: 'renegotiation'
            });
        }, error);
    }, error);
}

document.addEventListener('DOMContentLoaded', function(){
    var originalLocalVideo = document.getElementById('yourVideoScreen');
    var originalRemoteVideo = document.getElementById('videoScreen');

    originalLocalVideo.addEventListener('play', function(){
        var lv = document.getElementById('yourVideoScreen');
        var newLocalVideo = document.getElementById('newLocalVideo');
        var back = document.getElementById('back1');
        var cw1 = 100;
        var ch1 = 100;

        try {
            cw1 = newLocalVideo.clientWidth;
            ch1 = newLocalVideo.clientHeight;
        } catch {
            // Feature not available on platform, use default instance;
        }
        newLocalVideo.width = cw1;
        newLocalVideo.height = ch1;

        back.width = cw1;
        back.height = ch1;
        var backcontext = back.getContext('2d');

        encryptDecrypt(lv, newLocalVideo.getContext('2d'), cw1, ch1, backcontext);
    }, false);

    originalRemoteVideo.addEventListener('play', function(){
        var rv = document.getElementById('videoScreen');
        var newRemoteVideo = document.getElementById('vid');
        var back = document.getElementById('back2');
        var cw2 = 100;
        var ch2 = 100;

        try {
            cw2 = newRemoteVideo.clientWidth;
            ch2 = newRemoteVideo.clientHeight;
        } catch {
            // Feature not available on platform, use default instance;
        }
        newRemoteVideo.width = cw2;
        newRemoteVideo.height = ch2;

        back.width = cw2;
        back.height = ch2;
        var backcontext = back.getContext('2d');

        encryptDecrypt(rv, newRemoteVideo.getContext('2d'), cw2, ch2, backcontext);
    }, false);

}, false);

function encryptDecrypt(video, canvas, width, height, backcontext) {
    try {
    if(tc){
        if(video.paused || video.ended)
            return false;
        backcontext.drawImage(video, 0, 0, width, height);
        var frame = backcontext.getImageData(0, 0, width, height);

        // Do XOR operation on bits of frame using the key:
        var data = frame.data;
        var key = callerKey.getSharedSecretKey();
        var idx = 0;
        for (var i = 0; i < data.length; i += 1) {
            let tmp = data[i].toString(2);
            for (var j = 0; j < tmp.length; j += 1) {
                if(tmp[j] == key[idx])
                    tmp[j] = 0;
                else
                    tmp[j] = 1;
                idx = idx + 1;
                if(idx >= key.length)
                    idx = 0;
            }
            data[i] = parseInt(tmp, 2);
        }

        canvas.putImageData(frame, 0, 0);
        setTimeout(encryptDecrypt, 20, video, canvas, width, height, backcontext);
    }
    } catch {}
}

socket.on('offer made', function (data) {
    if(myID == data.to) {
        offer = data.offer;
        callerID = data.from;

        pc.setRemoteDescription(new sessionDescription(data.offer), function () {
            pc.createAnswer(function (answer) {
                pc.setLocalDescription(new sessionDescription(answer), function () {
                    socket.emit('make answer', {
                        answer: answer,
                        to: data.from,
                        from: data.to
                    });
                }, error);
            }, error);
        }, error);
    }
});

socket.on('answer made', function (data) {
    if(myID == data.to) {
        callerID = data.from;
        pc.setRemoteDescription(new sessionDescription(data.answer), function () {}, error);
    }
});

socket.on('ask connection', function(data) {
    if(myID == data.userID) {
        pc.createOffer(function (offer) {
            pc.setLocalDescription(new sessionDescription(offer), function () {
                socket.emit('make offer', {
                    offer: offer,
                    to: data.friendID,
                    from: myID,
                    offerType: 'initial'
                });
            }, error);
        }, error);
    }
});

socket.on('send ICE candidate', function(data) {
    // ICE candidate configuration.
    var candidate = new RTCIceCandidate(data.candidate);
    pc.addIceCandidate(candidate);
});

function error(err) {
    console.warn('Error', err);
}

// ***************************************
// Socket.io code
// ***************************************

socket.on('user update', (listOfActiveUsers) => {
    activeUsers = listOfActiveUsers;
    showActiveUsers();
});

// Send call request
function makeCall(x) {
    if(free == true)
        socket.emit('make call', x);
}

// Send end call request
function endCall(x) {
    if(free == false)
        socket.emit('end call', x);
}

// If a request was sent, ask user if they want to accept the call
socket.on('accept call', async ([userID, friendID]) => {
    if(userID == data.userData.id && isOnline(friendID) == true) {
        if(await callAsk(friendID) == true)
            acceptCall([userID, friendID]);
    }
});

// Mark user in a phone call
socket.on('mark as busy', ([userID, friendID]) => {
    if(userID == data.userData.id) {
        free = false;
        callerID = friendID;
        cooldown = false;

        createKeys(friendID);
    }
});

// Mark user as not in a phone call
socket.on('mark as free', (userID) => {
    if(userID == data.userData.id) {
        free = true;
        endStream();
        redirectTo('/home');
    }
});

// Change last call time
socket.on('change lastCall time', ([userID, friendID, time]) => {
    if(userID == data.userData.id)
        changeLastCallTime(friendID, time);
});

// Accept a call
function acceptCall([userID, friendID]) {
    if(isOnline(friendID) == true) {
        let friendsList = data.friendsList;
        let caller;
        friendsList.forEach((friend) => {
            if(friend.id = friendID)
                caller = friend;
        });
        menuAction(0);
        showConversation(friendID, caller.picture);
        socket.emit('accepted call', [userID, friendID]);
    }
}

function createKeys(friendID) {
    if(friendID < myID || friendID == serverID) {
        var df = new Df(myID, friendID);
        var publicKey = df.generatePublicKey();
        df.setPublicKey(publicKey);
        df.setPrivateKey();
        df.setGeneratedKey();

        if(friendID == serverID)
            serverKey = df;
        else
            callerKey = df;

        socket.emit('key exchange - public and generated key', {
            from: myID,
            to: friendID,
            publicKey: df.getPublicKey(),
            generatedKey: df.getGeneratedKey().toString()
        });
    }
}

socket.on('key exchange - public and generated key', (data) => {
    if(myID == data.to) {
        var df = new Df(myID, data.from);
        df.setPublicKey(data.publicKey);
        df.setPrivateKey();
        df.setGeneratedKey();
        df.setSharedSecretKey(BigInt(data.generatedKey));

        callerKey = df;

        socket.emit('key exchange - generated key', {
            from: myID,
            to: data.from,
            generatedKey: df.getGeneratedKey().toString()
        });

        if(data.from != serverID)
            startStream();
    }
});

socket.on('key exchange - generated key', (data) => {
    if(myID == data.to) {
        if(data.from == serverID) {
            serverKey.setSharedSecretKey(BigInt(data.generatedKey));
        } else {
            callerKey.setSharedSecretKey(BigInt(data.generatedKey));
            startStream();
        }
    }
});

// ***************************************
// Other code
// ***************************************

function initialize() {
    resizeAction();

    var user = data.userData;
    var friendsList = data.friendsList;
    displayUserData(user);
    displayFriendsList(friendsList);
    try {
        displayProfilePicture(user.picture, 'profilePicture');
    } catch {}
}

function displayDataInElementByClass(data, htmlClassName) {
    var x = document.getElementsByClassName(htmlClassName);
    for (let i = 0; i < x.length; i++) {
        x[i].innerHTML = data;
    }
}

function displayUserData(user) {
    displayDataInElementByClass('Username: ' + user.username, 'userUsernameDisplay');
    displayDataInElementByClass(user.firstname + ' ' + user.lastname, 'userNameDisplay');
    displayDataInElementByClass('My ID: ' + user.id, 'userIdDisplay');
    displayDataInElementByClass('Account email address: ' + user.email, 'userEmailDisplay');
}

function changeLastCallTime(friendID, time) {
    if(time != null) {
        var friendsList = data.friendsList;
        friendsList.forEach((friend) => {
            if(friend.id == friendID)
                friend.lastCall = time;
        });
        displayFriendsList(friendsList);
        document.getElementById('convo_time').innerHTML = document.getElementById(`t_${friendID}`).innerHTML;
    } else
        document.getElementById('convo_time').innerHTML = 'CONNECTING...';
}

function showActiveUsers() {
    var friendsList = data.friendsList;
    friendsList.forEach(friend => {
        if(isOnline(friend.id) == true)
            showOnline(friend.id);
        else
            showOffline(friend.id);
    });
}

function makeCallInit() {
    let userID = data.userData.id;
    let friendID = document.getElementById("convo_id").value;
    if(userID != friendID && isOnline(friendID) == true && cooldown == false) {
        makeCall([userID, friendID]);
        cooldown = true;
        document.getElementById('convo_time').innerHTML = 'CALLING...';
        setTimeout(() => {
            cooldown = false;
            if(free = true)
                document.getElementById('convo_time').innerHTML = document.getElementById(`t_${friendID}`).innerHTML;
        }, 30000);
    }
}

function endCallInit() {
    let userID = data.userData.id;
    endCall(userID);
}

function isOnline(id) {
    if(activeUsers.includes(id))
        return true;
    return false;
}

function isToday(date) {
    var today = new Date();
    return date.getDate() == today.getDate() && date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear();
}

function timeout(time) {
    return new Promise(res => setTimeout(res, time));
}

async function callAsk(friendID) {
    let friendsList = data.friendsList;
    let caller;
    let c = true;
    friendsList.forEach((friend) => {
        if(friend.id = friendID)
            caller = friend;
    });
    var r = confirm(`${caller.username} wants to talk to you.\nTo start a conversation, respond in the next 30 seconds.`);
    if(r == true)
        return true;
    await timeout(30000);
    return false;
}

function switchConvoDisplay() {
    let x = document.getElementById('conversationWindow');
    let y = document.getElementById('contactsWindow');
    let z = document.getElementById('menuBar');
    if(x.style.display == "none") {
        x.style.display = "block";
        y.style.display = "none";
        z.style.display = "none";
    } else {
        x.style.display = "none";
        y.style.display = "block";
        z.style.display = "block";
    }
}

function switchConvoDisplayWithClose() {
    switchConvoDisplay();
    endCallInit();
}

function showConversation(id, picture) {
    let x = document.getElementById('convo_name');
    let y = document.getElementById('convo_time');
    let z = document.getElementById('convo_id');
    let name = document.getElementById(`u_${id}`).innerHTML + '<br>' + document.getElementById(`n_${id}`).value;
    let time = document.getElementById(`t_${id}`).innerHTML;

    x.innerHTML = name;
    y.innerHTML = time;
    z.value = id;

    try {
        displayProfilePicture(picture, 'convo-pic');
    } catch {}
    if(isOnline(id) == true)
        changeFontColor("convo_name", "rgb(0, 170, 0)");
    else
        changeFontColor("convo_name", "rgb(0, 0, 0)");
    switchConvoDisplay();
}

function displayFriendsList(friendsList) {
    var contactsWindow = document.getElementById('contactsWindow');
    if(!friendsList || friendsList.length == 0) {
        contactsWindow.innerHTML = '<div class="centeredVert"><div class="centered">You have no contacts in your friends list.<br>To add someone to your friends list, go to settings and add their user ID.</div></div>';
    } else {
        let HTMLfriendsList = `<div class="friendsListSeparator"></div>`;
        // Sort the friends list by lastCall
        friendsList.sort(function(a, b) {
            a = new Date(a.lastCall);
            b = new Date(b.lastCall);
            return a>b ? -1 : a<b ? 1 : 0;
        });

        // Create the friends list in the browser
        friendsList.forEach(friend => {
            let HTMLpictureId = "pic-" + friend.id;
            let id = friend.id;
            let name = friend.firstname + " " + friend.lastname;
            let username = friend.username;

            // Turn lastCall string to local time
            let lastCall = new Date(friend.lastCall);
            let displayTime;

            // Format date and time for display
            let lastCallDate = lastCall.getDate() + '/' + (lastCall.getMonth() + 1) + '/' + lastCall.getFullYear();
            let m = lastCall.getMinutes();
            if(m < 10)
                m = '0' + m;
            let lastCallTime = lastCall.getHours() + ':' + m;

            // Set time for display as date if the last call was not today or as time if it was
            if(isToday(lastCall)) {
                displayTime = lastCallTime;
            } else {
                displayTime = lastCallDate;
            }
            friend.displayTime = displayTime;

            // Add button that contains the friend information
            let friendsListItem = `<button id="${id}" onclick="showConversation('${id}', '${friend.picture}')" class="friendsListItem">`;
            // Add friend profile picture
            friendsListItem = friendsListItem + `<div class="friendPicContainer"> <img src="/images/profile_pic_default.png" class="icon2" id="${HTMLpictureId}"> </div>`;
            // Add friend name
            friendsListItem = friendsListItem + `<div class="friendNameContainer"> <div class="centeredVert"> <div class="centered" id="u_${id}"> ${username} </div> </div> </div>`;
            // Add display time
            friendsListItem = friendsListItem + `<div class="friendTimeContainer"> <div class="centeredVert"> <div class="centered" id="t_${id}"> ${displayTime} </div> </div> </div>`;
            // Add hidden name
            friendsListItem = friendsListItem + `<input type="hidden" id="n_${id}" value="${name}">`;
            // Close friend button
            friendsListItem = friendsListItem + `</button>`;

            // Add list separator
            friendsListItem = friendsListItem + `<div class="friendsListSeparator"></div>`;

            // Add it to the final list
            HTMLfriendsList = HTMLfriendsList + friendsListItem;
        });

        // Finally, add the list to the page
        contactsWindow.innerHTML = HTMLfriendsList;

        friendsList.forEach(friend => {
            // At the end, if the profile image exists, display it for the user
            let HTMLpictureId = "pic-" + friend.id;
            try {
                displayProfilePicture(friend.picture, HTMLpictureId);
            } catch {}
        });
    }
}

function changeFontColor(HTMLelementID, color) {
    document.getElementById(HTMLelementID).style.color = color;
}

function showOnline(id) {
    // Green
    let color = "rgb(0, 170, 0)";
    changeFontColor("u_" + id, color);
    if(document.getElementById("convo_id").value == id)
        changeFontColor("convo_name", color);
}

function showOffline(id) {
    // Black
    let color = "rgb(0, 0, 0)";
    changeFontColor("u_" + id, color);
    if(document.getElementById("convo_id").value == id)
        changeFontColor("convo_name", color);
}

// Picture is the name of the profile picture from the folder; imageID is the id of the HTML image element.
function displayProfilePicture(picture, imageID) {
    try {
        if(picture) {
            const path = '/userProfilePictures/' + picture;
            var img = document.getElementById(imageID);
            img.src = path;
        }
    } catch(err) {
        console.error(err);
    }
}

function uploadProfilePicture() {
    redirectTo('/upload-profile-picture');
}

// Function to switch from desktop to mobile:
function resizeAction() {
    APPmessageWindowResize();
}

function validateFormChangePass() {
    var x = document.getElementById("passwordReset");
    return validatePassword(x.value);
}

function validateFormChangeEmail() {
    var x = document.getElementById("emailReset");
    return validateEmail(x.value);
}

function validateFormAddFriend() {
    var x = document.getElementById("addFriend");
    if(x.value.length != 20) {
        alert("Please input a valid id!");
        return false;
    }
    return true;
}

// Menu bar action function:
function menuAction(index) {
    var names = [
        "mobileMenuContactsButtonIcon",
        "mobileMenuProfileButtonIcon",
        "mobileMenuSettingsButtonIcon"
    ];
    var inactive = [
        "/images/phone_inactive.png",
        "/images/user_inactive.png",
        "/images/settings_inactive.png"
    ];
    var active = [
        "/images/phone.png",
        "/images/user.png",
        "/images/settings.png"
    ];
    var windowNames = [
        "contactsWindow",
        "profileWindow",
        "settingsWindow",
        "conversationWindow"
    ];

    // Icon change:
    for(var i=0; i<3; i++) {
        var element = document.getElementById(names[i]);
        element.src = inactive[i];
    }
    var element = document.getElementById(names[index]);
    element.src = active[index];

    // Window switch:
    for(var i=0; i<4; i++) {
        var element = document.getElementById(windowNames[i]);
        element.style.display = "none";
    }
    var element = document.getElementById(windowNames[index]);
    element.style.display = "block";
}
