const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/social-network");

// Function for registering users:
module.exports.registerUser = (
    first_name,
    last_name,
    email_address,
    password_hash
) => {
    // To prevent SQL injection:
    const q = `
        INSERT INTO users (first_name, last_name, email_address, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `;
    const params = [first_name, last_name, email_address, password_hash];
    return db.query(q, params);
};

// Function for finding a user in users table:
module.exports.findUser = (email_address) => {
    const q = `
        SELECT * FROM users
        WHERE email_address = $1
    `;
    const params = [email_address];
    return db.query(q, params);
};

// Function for getting a users infos:
module.exports.getUserInfos = (userId) => {
    const q = `
        SELECT * FROM users
        WHERE id = $1
    `;
    const params = [userId];
    return db.query(q, params);
};

// Function for getting the three newest users profile data:
module.exports.getNewestUserInfos = () => {
    const q = `
        SELECT * FROM users
        ORDER BY id DESC
        LIMIT 3
    `;
    const params = [];
    return db.query(q, params);
};

module.exports.searchUsersByName = (searchInput) => {
    const q = `
        SELECT * FROM users
        WHERE first_name ILIKE $1
    `;
    const params = [searchInput + "%"];
    return db.query(q, params);
};

// Function for getting OTHER user's infos:
module.exports.getOtherUserInfos = (idInUrl) => {
    const q = `
            SELECT first_name, last_name, bio, imageUrl FROM users
            WHERE id = $1
    `;
    const params = [idInUrl];
    return db.query(q, params);
};

// Function for uploading a user image:
module.exports.uploadImage = (imageUrl, userId) => {
    const q = `
        UPDATE users
        SET imageUrl = $1
        WHERE id = $2
        RETURNING *
    `;
    const params = [imageUrl, userId];
    return db.query(q, params);
};

// Function for updating a users bio:
module.exports.updateBio = (bio, userId) => {
    const q = `
        UPDATE users
        SET bio = $1
        WHERE id = $2
        RETURNING *
    `;
    const params = [bio, userId];
    return db.query(q, params);
};

// Function for updating a user password in users table:
module.exports.updateUserPassword = (hashed_password, email_address) => {
    const q = `
        UPDATE users
        SET password_hash = $1
        WHERE email_address = $2
        RETURNING *
    `;
    const params = [hashed_password, email_address];
    return db.query(q, params);
};

// Function for inserting code in reset_codes table:
module.exports.insertCode = (email, code) => {
    const q = `
        INSERT INTO reset_codes (email, code)
        VALUES ($1, $2)
        RETURNING *
    `;
    const params = [email, code];
    return db.query(q, params);
};

// Function for finding the code in reset_codes table:
module.exports.findCode = (email) => {
    const q = `
        SELECT * FROM reset_codes
        WHERE email = $1
        AND CURRENT_TIMESTAMP - created_at < INTERVAL '10 minutes'
        ORDER BY created_at DESC
        LIMIT 1
    `;
    const params = [email];
    return db.query(q, params);
};

// Function for checking friendship statuses:
module.exports.checkFriendship = (loggedInUser, otherUser) => {
    const q = `
        SELECT * FROM friendships
        WHERE (recipient_id = $1 AND sender_id = $2)
        OR (recipient_id = $2 AND sender_id = $1);
    `;
    const params = [loggedInUser, otherUser];
    return db.query(q, params);
};

// Function for making a friend request:
module.exports.makeFriendRequest = (loggedInUser, otherUser) => {
    const q = `
        INSERT INTO friendships (sender_id, recipient_id)
        VALUES ($1, $2)
        RETURNING *
    `;
    const params = [loggedInUser, otherUser];
    return db.query(q, params);
};

// Function for accepting friend requests:
module.exports.acceptFriendRequest = (loggedInUser, otherUser) => {
    const q = `
        UPDATE friendships
        SET accepted = true
        WHERE sender_id = $2
        AND recipient_id = $1
        RETURNING *
    `;
    const params = [loggedInUser, otherUser];
    return db.query(q, params);
};

// Function for deleting a row in friendships:
module.exports.deleteFriendshipRow = (loggedInUser, otherUser) => {
    const q = `
        DELETE FROM friendships
        WHERE (recipient_id = $1 AND sender_id = $2)
        OR (recipient_id = $2 AND sender_id = $1)
    `;
    const params = [loggedInUser, otherUser];
    return db.query(q, params);
};

// Function for retrieving the lists of friends and wannabes from friendships table:
module.exports.getFriendsAndWannabes = (loggedInUser) => {
    const q = `
        SELECT users.id, first_name, last_name, imageUrl, accepted
        FROM friendships
        JOIN users
        ON (accepted = false AND recipient_id = $1 AND sender_id = users.id)
        OR (accepted = true AND recipient_id = $1 AND sender_id = users.id)
        OR (accepted = true AND sender_id = $1 AND recipient_id = users.id)
    `;
    const params = [loggedInUser];
    return db.query(q, params);
};

// Function for retreiving the last 10 chat messages:
module.exports.getRecentMessages = () => {
    const q = `
        SELECT users.id, first_name, last_name, imageUrl, message_text, messages.created_at
        FROM users
        JOIN messages
        ON messages.sender_id = users.id
        ORDER BY messages.created_at DESC
        LIMIT 10
    `;
    const params = [];
    return db.query(q, params);
};

// Function for adding a new message when one is received from a client
module.exports.addNewMessage = (senderId, messageText) => {
    const q = `
        INSERT INTO messages (sender_id, message_text)
        VALUES ($1, $2)
    `;
    const params = [senderId, messageText];
    return db.query(q, params);
};
