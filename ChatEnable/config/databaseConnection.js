// MySql connection
var mysql = require('mysql');
var dbConfig = require('./databaseConfig');
var queries = require('./MySqlQueries');
var chalk = require('chalk');

var mysqlConnection = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password : dbConfig.password,
    database: dbConfig.database,
    multipleStatements: dbConfig.multipleStatements
});

mysqlConnection.connect((err) => {
    if(err)
        console.log(chalk.bold.red(`Failed to connect to database.\n${err}`));
    else
        console.log(chalk.bold.green("Database connected.\n"));
});

// MySql DB functions
var db = {};

db.MysqlQuery = (query, queryParams) => {
    return new Promise((resolve, reject) => {
        mysqlConnection.query(query, queryParams, (err, res) => {
            if(err)
                return reject(err);
            return resolve(res);
        });
    });
};

// Get user ID from username
db.getUserID = async (username) => {
    // Get query
    var getId = queries.getIdFromUsername();
    try {
        // Execute query
        var id = await db.MysqlQuery(getId, [username]);
        id = id[0].id;
        return id;
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

// Get username from user ID
db.getUsername = async (id) => {
    // Get query
    var getUsername = queries.getUsernameFromId();
    try {
        // Execute query
        var username = await db.MysqlQuery(getUsername, [id]);
        username = username[0].username;
        return username;
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

// Check if the account exists and is confirmed
// Returns 1 if both, 0 if unconfirmed, -1 if it doesn't exist
db.accountCheck = async (username) => {
    // Get query
    var newQuery1 = queries.accountExists();
    var newQuery2 = queries.accountCheck();
    try {
        // Execute query
        var res = await db.MysqlQuery(newQuery1, [username]);
        res = res[0].c;
        // Check response
        if(res != 1)
            return -1;
        // Execute query
        var res = await db.MysqlQuery(newQuery2, [username]);
        res = res[0].c;
        // Check response
        if(res != 1)
            return 0;
        return 1;
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

// Check if a user's password matches
db.userPasswordCheck = async (username, password) => {
    // Get query
    var newQuery = queries.userPasswordCheck();
    try {
        // Execute query
        var res = await db.MysqlQuery(newQuery, [username, password]);
        res = res[0].c;
        // Check response
        if(res != 1)
            return 0;
        return 1;
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

// Get a user's full info
db.getUserInfo = async (username) => {
    // Get query
    var newQuery = queries.getUserInfo();
    try {
        // Execute query
        var res = await db.MysqlQuery(newQuery, [username]);
        // Return first row
        return res[0];
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

// Get full friends list sorted alphabetically
db.getFriendsList = async (username) => {
    // Get query
    var getId = queries.getIdFromUsername();
    var newQuery = queries.getFriendsList();
    try {
        // Execute query
        var id = await db.MysqlQuery(getId, [username]);
        id = id[0].id;
        // Execute query
        var res = await db.MysqlQuery(newQuery, [id, id]);
        // Return first row
        return res;
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

// Check if username is taken
db.isUsernameFree = async (username) => {
    // Get query
    var newQuery = queries.isUsernameFree();
    try {
        // Execute query
        var res = await db.MysqlQuery(newQuery, [username]);
        // Check response
        if(res[0].c != 0)
            return 0;
        return 1;
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

// Add a non-confirmed user to the DB
db.insertUser = async (user) => {
    // Get query
    var newQuery = queries.insertUser();
    try {
        // Execute query
        await db.MysqlQuery(newQuery, [user.id, user.username, user.firstname, user.lastname, user.password, user.email]);
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

// Add a friend to a user by friend's id
// Returns 1 for success, 0 if friend account does not exist, -1 if already friends and -2 if user tries to friend himself
db.addToFriendsList = async (userID, friendId, dateTime) => {
    // Get query
    var newQuery1 = queries.friendshipExists();
    var newQuery2 = queries.accountExistsAndIsConfirmedByID();
    var newQuery3 = queries.addToFriendsList();
    try {
        if(userID == friendId)
            return -2;
        // Execute query
        var res = await db.MysqlQuery(newQuery2, [friendId]);
        res = res[0].c;
        // Check response
        if(res != 1)
            return 0;
        // Execute query
        var res = await db.MysqlQuery(newQuery1, [userID, userID, friendId]);
        res = res[0].c;
        // Check response
        if(res != 0)
            return -1;
        // Execute query
        await db.MysqlQuery(newQuery3, [userID, friendId, dateTime]);
        return 1;
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

// Add a profile picture to a user; if it already exists, replace it
db.addProfilePicture = async (id, picture) => {
    // Get query
    var newQuery = queries.addProfilePicture();
    try {
        // Execute query
        await db.MysqlQuery(newQuery, [picture, id]);
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

// Add a token to a user; if it already exists, replace it
db.addToken = async (username, token) => {
    // Get query
    var getId = queries.getIdFromUsername();
    var newQuery1 = queries.destroyToken();
    var newQuery2 = queries.addToken();
    try {
        // Execute query
        var id = await db.MysqlQuery(getId, [username]);
        id = id[0].id;
        // Execute query
        await db.MysqlQuery(newQuery1, [id]);
        // Execute query
        await db.MysqlQuery(newQuery2, [id, token]);
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

// Confirm the user account
db.confirmAccount = async (username) => {
    // Get query
    var newQuery = queries.confirmAccount();
    try {
        // Execute query
        await db.MysqlQuery(newQuery, [username]);
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

// Check if a user's token matches
db.checkToken = async (username, token) => {
    // Get query
    var getId = queries.getIdFromUsername();
    var newQuery = queries.checkToken();
    try {
        // Execute query
        var id = await db.MysqlQuery(getId, [username]);
        id = id[0].id;
        // Execute query
        var res = await db.MysqlQuery(newQuery, [id, token]);
        res = res[0].c;
        // Check response
        if(res != 1)
            return 0;
        return 1;
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

// Check if a user has a token assigned
db.userHasToken = async (username) => {
    // Get query
    var getId = queries.getIdFromUsername();
    var newQuery = queries.userHasToken();
    try {
        // Execute query
        var id = await db.MysqlQuery(getId, [username]);
        id = id[0].id;
        // Execute query
        var res = await db.MysqlQuery(newQuery, [id]);
        res = res[0].c;
        // Check response
        if(res != 1)
            return 0;
        return 1;
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

// Check if an email is in the DB assigned to the user; if it is, return 1; otherwise, return 0
db.checkEmail = async (username, email) => {
    // Get query
    var newQuery = queries.checkEmail();
    try {
        // Execute query
        var res = await db.MysqlQuery(newQuery, [username, email]);
        res = res[0].c;
        // Check response
        if(res == 0)
            return 0;
        return 1;
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

// Change user password
db.changePassword = async (id, newPassword) => {
    // Get query
    var newQuery = queries.changePassword();
    try {
        // Execute query
        await db.MysqlQuery(newQuery, [newPassword, id]);
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

// Change user email
db.changeEmail = async (id, newEmail) => {
    // Get query
    var newQuery = queries.changeEmail();
    try {
        // Execute query
        await db.MysqlQuery(newQuery, [newEmail, id]);
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

db.updateLastCall = async (id1, id2, time) => {
    // Get query
    var newQuery = queries.updateLastCall();
    try {
        // Execute query
        await db.MysqlQuery(newQuery, [time, id1, id2]);
        await db.MysqlQuery(newQuery, [time, id2, id1]);
    } catch(err) {
        console.log(err);
        throw(err);
    }
}

// Destroying a used token
db.destroyToken = async (username) => {
    // Get query
    var getId = queries.getIdFromUsername();
    var newQuery = queries.destroyToken();
    try {
        // Execute query
        var id = await db.MysqlQuery(getId, [username]);
        id = id[0].id;
        // Execute query
        await db.MysqlQuery(newQuery, [id]);
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

// Deleting a friend from the friend list
db.deleteFriendship = async (username, friendId) => {
    // Get query
    var getId = queries.getIdFromUsername();
    var newQuery = queries.deleteFromFriendList();
    try {
        // Execute query
        var id = await db.MysqlQuery(getId, [username]);
        id = id[0].id;
        // Execute query
        await db.MysqlQuery(newQuery, [id, friendId]);
        // Execute query
        await db.MysqlQuery(newQuery, [friendId, id]);
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

// Safe deletion of an account
db.deleteAccount = async (username) => {
    // Get query
    var getId = queries.getIdFromUsername();
    var newQuery1 = queries.destroyToken();
    var newQuery2 = queries.deleteAllFromFriendList();
    var newQuery3 = queries.deleteAccount();
    try {
        // Execute query
        var id = await db.MysqlQuery(getId, [username]);
        id = id[0].id;
        // Execute query
        await db.MysqlQuery(newQuery1, [id]);
        // Execute query
        await db.MysqlQuery(newQuery2, [id, id]);
        // Execute query
        await db.MysqlQuery(newQuery3, [id]);
    } catch(err) {
        console.log(err);
        throw(err);
    }
};

module.exports = db;
