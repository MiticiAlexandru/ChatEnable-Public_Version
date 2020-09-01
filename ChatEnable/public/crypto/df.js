const upperGeneratorLimit = 9999;
const lowerGeneratorLimit = 1000;

const upperSecretLimit = 2**16;
const lowerSecretLimit = 2;

function isPrime(n) {
    for(let i = 2, r = Math.sqrt(n); i <= r; i++)
        if(n % i == 0)
            return false;
    return true;
}

function safeBigInt(n) {
    if(typeof(n) == 'bigint')
        return n;
    return BigInt(n);
}

function getPowerWithMod(x, y, m) {
    return (safeBigInt(x) ** safeBigInt(y)) % safeBigInt(m);
}

// r is a primitive root for P if for every n from 1 to P-1, the results of the equation (r^n)%P are unique:
function isPrimitiveRoot(P, r) {
    let prior = [];
    for(i = 1; i < P; i++) {
        res = getPowerWithMod(r, i, P);
        if(prior.includes(res))
            return false;
        prior.push(res);
    }
    return true;
}

// Diffie-Hellman key exchange protocol implementation;
// Only use exposed methods to safely get and set properties:
class Df {
    constructor(owner, receiver) {
        this.owner = owner;
        this.receiver = receiver;

        this.generator = null;
        this.mod = null;
        this.privateKey = null;
        this.generatedKey = null;
        this.receiverGeneratedKey = null;
        this.sharedSecretKey = null;
    }

    getOwner() {
        return this.owner;
    }

    getReceiver() {
        return this.receiver;
    }

    // Only generates a public key, does not set it;
    // Between client and server, only use on the server side; Between 2 end users, only use by caller:
    generatePublicKey() {
        // TO DO:
        // P is prime, G is a primitive root for P:
        let ok = false;
        var P;
        while(ok == false) {
            P = Math.floor((Math.random() * upperGeneratorLimit) + lowerGeneratorLimit);
            ok = isPrime(P);
        }
        // P is prime and every prime has primitive roots:
        let r = 1;
        ok = false;
        while(ok == false) {
            r = r + 1;
            ok = isPrimitiveRoot(P, r);
        }
        return [r, P];
    }

    setPublicKey(publicKey) {
        if(this.generator == null)
            this.generator = publicKey[0];
        if(this.mod == null)
            this.mod = publicKey[1];
    }

    getPublicKey() {
        return [this.generator, this.mod];
    }

    setPrivateKey() {
        if(this.privateKey == null)
            this.privateKey  = Math.floor((Math.random() * upperSecretLimit) + lowerSecretLimit);
    }

    setGeneratedKey() {
        this.generatedKey = getPowerWithMod(this.generator, this.privateKey, this.mod);
    }

    getGeneratedKey() {
        return this.generatedKey;
    }

    getReceiverGeneratedKey() {
        return this.receiverGeneratedKey;
    }

    setSharedSecretKey(receiverGeneratedKey) {
        this.receiverGeneratedKey = receiverGeneratedKey;
        this.sharedSecretKey = (BigInt(3) ** getPowerWithMod(receiverGeneratedKey, this.privateKey, this.mod)).toString(2);
    }

    getSharedSecretKey() {
        return this.sharedSecretKey;
    }
}

function getPeerKey(keys, friendID) {
    return keys.find(key => key.getReceiver() == friendID);
}

// For browser:
try {
    window.Df = Df;
} catch {}

// For server:
try {
    module.exports = {Df: Df, getPeerKey: getPeerKey};
} catch {}
