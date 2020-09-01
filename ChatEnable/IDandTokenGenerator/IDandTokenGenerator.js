const TokenLength = 8;
// ID length = IDrandLength + 12
const IDrandLength = 8;

function randomGenerator(n) {
    let result = '';
    let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for ( let i = 0; i < n; i++ ) {
        let rnd = Math.floor(Math.random() * characters.length);
        result += characters.charAt(rnd);
    }
    return result;
}

class generator
{
    constructor() {
        this.timeNow = Date.now();
    }

    generateToken() {
        return 'T0' + randomGenerator(TokenLength);
    }

    generateUserID() {
        let time = new Date(this.timeNow);
        let chars1 = 'abcdefghijklmnopqrstuvwxyz';
        let chars2 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        let date = ("0" + time.getDate()).slice(-2);
        // Month, incremented from 0
        let month = time.getMonth();
        let year = time.getFullYear();
        let hours = time.getHours();
        let minutes = time.getMinutes();
        let seconds = time.getSeconds();
        if(minutes < 10)
            minutes = '0' + minutes;
        if(seconds < 10)
            seconds = '0' + seconds;

        var arr = year.toString(10).split('').map(Number);
        let res = date + chars2[month] + chars1[hours] + minutes + seconds;
        res = res + randomGenerator(IDrandLength);
        res = res + chars2[arr[0] + 1] + chars1[arr[1] + 1] + chars2[arr[2] + 1] + chars1[arr[3] + 1];
        return res;
    }
};

module.exports = generator;
