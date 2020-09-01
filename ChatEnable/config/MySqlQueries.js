var MySqlQueries = {};

MySqlQueries.getIdFromUsername = () => {
    return `SELECT id FROM user WHERE username = ?;`;
};

MySqlQueries.getUsernameFromId = () => {
    return `SELECT username FROM user WHERE id = ?;`;
};

MySqlQueries.accountExists = () => {
    return `SELECT COUNT(id) AS c FROM user WHERE username = ?;`;
};

MySqlQueries.accountExistsAndIsConfirmedByID = () => {
    return `SELECT COUNT(username) AS c FROM user WHERE id = ? AND confirmed = true;`;
};

MySqlQueries.accountCheck = () => {
    return `SELECT COUNT(id) AS c FROM user WHERE username = ? AND confirmed = true`;
};

MySqlQueries.userPasswordCheck = () => {
    return `SELECT COUNT(id) AS c FROM user WHERE username = ? AND password = ?;`;
};

MySqlQueries.getUserInfo = () => {
    return `SELECT id, username, firstname, lastname, email, confirmed, picture FROM user WHERE username = ?;`;
};

MySqlQueries.getFriendsList = () => {
    return `SELECT user.id, user.firstname, user.lastname, user.username, user.picture, x.lastCall
            FROM user JOIN

            (
                SELECT id2 as id, lastCall FROM friendsList WHERE id1 = ?
                UNION
                SELECT id1 as id, lastCall FROM friendsList WHERE id2 = ?
            ) x
            
            ON user.id = x.id
            ORDER BY user.firstname, user.lastname;`;
};

MySqlQueries.isUsernameFree = () => {
    return `SELECT COUNT(id) AS c FROM user WHERE username = ?;`;
};

MySqlQueries.insertUser = () => {
    return `INSERT INTO user VALUES (?, ?, ?, ?, ?, ?, false, null);`;
};

MySqlQueries.friendshipExists = () => {
    return `SELECT COUNT(x.id) AS c FROM
            
            (
                SELECT id2 as id FROM friendsList WHERE id1 = ?
                UNION
                SELECT id1 as id FROM friendsList WHERE id2 = ?
            ) x

            WHERE x.id = ?;`;
};

MySqlQueries.addToFriendsList = () => {
    return `INSERT INTO friendsList VALUES (?, ?, ?);`;
};

MySqlQueries.addProfilePicture = () => {
    return `UPDATE user SET picture = ? WHERE id = ?;`;
};

MySqlQueries.addToken = () => {
    return `INSERT INTO usertoken VALUES (?, ?);`;
};

MySqlQueries.confirmAccount = () => {
    return `UPDATE user SET confirmed = true WHERE username = ?;`;
};

MySqlQueries.checkToken = () => {
    return `SELECT COUNT(id) AS c FROM usertoken WHERE id = ? AND token = ?;`;
};

MySqlQueries.userHasToken = () => {
    return `SELECT COUNT(id) AS c FROM usertoken WHERE id = ?;`;
};

MySqlQueries.checkEmail = () => {
    return `SELECT COUNT(id) AS c FROM user WHERE username = ? AND email = ?;`;
};

MySqlQueries.changePassword = () => {
    return `UPDATE user SET password = ? WHERE id = ?;`;
};

MySqlQueries.changeEmail = () => {
    return `UPDATE user SET email = ? WHERE id = ?;`;
};

MySqlQueries.updateLastCall = () => {
    return `UPDATE friendsList SET lastCall = ? WHERE id1 = ? AND id2 = ?;`;
};

MySqlQueries.destroyToken = () => {
    return `DELETE FROM usertoken WHERE id = ?;`;
};

MySqlQueries.deleteAllFromFriendList = () => {
    return `DELETE FROM friendsList WHERE id1 = ? OR id2 = ?;`;
};

MySqlQueries.deleteFromFriendList = () => {
    return `DELETE FROM friendsList WHERE id1 = ? AND id2 = ?;`;
};

MySqlQueries.deleteAccount = () => {
    return `DELETE FROM userToken WHERE id = ?;`;
};

module.exports = MySqlQueries;
