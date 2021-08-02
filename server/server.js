// ***************
// *** IMPORTS ***
// ***************

// Import express:
const express = require("express");
const app = express();
// Import and Set up Web Sockets ->
const server = require("http").Server(app);
const io = require("socket.io")(server, {
    allowRequest: (req, callback) =>
        callback(null, req.headers.referer.startsWith("http://localhost:3000")),
});
// <- (web sockets end)
// Import compression for minimizing the size of the responses we send (should be used for any project):
const compression = require("compression");
// Import bcrypt with methods for password security:
const { hash, compare } = require("./bcrpt");
// Import crypto-random-string for generating the verification codes when resetting passwords:
const cryptRandomString = require("crypto-random-string");
// Import sendEmail function from SES for sending emails to the user:
const { sendEmail } = require("./ses");
// Import CookieSession module for setting and checking cookies:
const cookieSession = require("cookie-session");
// Import Csurf to prevent CSRF attacks:
const csurf = require("csurf");
// Import my cookieSecret from the secrets file:
let cookieSecret;
if (process.env.COOKIE_SECRET) {
    cookieSecret = process.env.COOKIE_SECRET;
} else {
    cookieSecret = require("../secrets.json").COOKIE_SECRET;
}
// Import database functions from db.js:
const {
    registerUser,
    findUser,
    getUserInfos,
    getNewestUserInfos,
    searchUsersByName,
    getOtherUserInfos,
    uploadImage,
    updateBio,
    updateUserPassword,
    insertCode,
    findCode,
    checkFriendship,
    makeFriendRequest,
    deleteFriendshipRow,
    acceptFriendRequest,
    getFriendsAndWannabes,
    getRecentMessages,
    addNewMessage,
} = require("./db");
const { json } = require("express");
// Import the following to upload files ->
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3");
const { s3Url } = require("./config.json");
const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});
const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152, // files over 2mb cannot be uploaded!
    },
});
// <- end of code used for uploading files!

// *****************************
// *** ACTIVATION OF MODULES ***
// *****************************

// Activate compression module:
app.use(compression());
// Activate express.json middleware tto recognize the incoming Request Object as a JSON Object:
app.use(express.json());
// Activate cookieSession module:
// app.use(
//     cookieSession({
//         secret: cookieSecret,
//         maxAge: 1000 * 60 * 60 * 24 * 7, // sets cookies for 7 days
//     })
// );
const cookieSessionMiddleware = cookieSession({
    secret: `I'm always angry.`,
    maxAge: 1000 * 60 * 60 * 24 * 7,
});
app.use(cookieSessionMiddleware);
io.use(function (socket, next) {
    cookieSessionMiddleware(socket.request, socket.request.res, next);
});
// Activate Csurf and get the csrf token into a cookie:
app.use(csurf());
app.use(function (req, res, next) {
    res.cookie("mytoken", req.csrfToken());
    next();
});
// Activate the express middleware for parsing the body / urls - needed for post requests (correct ?):
app.use(
    express.urlencoded({
        extended: false,
    })
);
// Activate express.json for post requests to recognize incoming requests as json object (correct ?):
app.use(express.json());
// Activate express.static to serve static files ???
app.use(express.static(path.join(__dirname, "..", "client", "public")));

// **************
// *** ROUTES ***
// **************

// Welcome GET Route:
app.get("/welcome", (req, res) => {
    console.log("GET request for /welcome route.");
    // Check if user is logged in (if a userId is set in session cookie):
    console.log("Checking if user is logged in...");
    console.log("req.session: ", req.session);
    if (req.session.userId) {
        // If a userId is set in session cookie:
        console.log("Userid cookie is set ->");
        console.log("Redirect to / route...");
        res.redirect("/");
    } else {
        console.log("No userId cookie is set ->");
        res.sendFile(path.join(__dirname, "..", "client", "index.html"));
    }
});

// Registration POST Route:
app.post("/registration", (req, res) => {
    console.log("POST request on /registration route.");
    console.log("req.body: ", req.body);
    // Hash the password:
    hash(req.body.password)
        .then((hashed_password) => {
            console.log("hashed_password: ", hashed_password);
            // Insert submitted data into users table:
            console.log("Inserting data into users table...");
            registerUser(
                req.body.firstname,
                req.body.lastname,
                req.body.email,
                hashed_password
            )
                .then((result) => {
                    // Set a session cookie with the userId
                    console.log("setting a session cookie for userId");
                    req.session.userId = result.rows[0].id;
                    console.log("req.session.userId: ", req.session.userId);
                    res.json({
                        success: true,
                    });
                })
                .catch((err) => {
                    console.log("Error on /registration post route: ", err);
                    res.json({
                        error: "Error on /registration post route",
                        Error: err,
                    });
                });
        })
        .catch((err) => {
            console.log(
                "Error when hashing password in /registration route: ",
                err
            );
            res.json({
                error: "Error when hashing password in /registration route",
                Error: err,
            });
        });
});

// Login POST Route:
app.post("/login", (req, res) => {
    console.log("POST request for login route");
    console.log("req.body: ", req.body);
    // Search user in users table:
    findUser(req.body.email)
        .then((result) => {
            console.log("Searching user in database...");
            console.log("result.rows[0]: ", result.rows[0]);
            // Check password:
            compare(req.body.password, result.rows[0].password_hash)
                .then((matchCheck) => {
                    console.log("matchCheck: ", matchCheck);
                    if (matchCheck === true) {
                        // If password is true -> set session cookie for userId
                        console.log(
                            "Password is correct -> set session cookie for userId"
                        );
                        req.session.userId = result.rows[0].id;
                        res.json({
                            success: true,
                        });
                    } else {
                        res.json({
                            message: "Password is incorrect",
                        });
                    }
                })
                .catch((err) => {
                    console.log("Error when comparing passwords: ", err);
                    res.json({
                        error: "Error when comparing passwords",
                        Error: err,
                    });
                });
        })
        .catch((err) => {
            console.log("Error to find user in /login route: ", err);
            res.json({
                error: "Error to find user in /login route",
                Error: err,
            });
        });
});

// Logout GET Route:
app.get("/logout", (req, res) => {
    console.log("GET request for logout route");
    req.session.userId = null;
    console.log("Userid set to null");
    res.redirect("/welcome#/login");
});

// Upload image POST route:
app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    console.log("POST request for /upload route");
    console.log("req.file: ", req.file);
    const fullUrl = s3Url + req.file.filename;
    console.log("fullUrl: ", fullUrl);
    // Upload image url to database:
    uploadImage(fullUrl, req.session.userId)
        .then((result) => {
            console.log("result.rows[0]: ", result.rows[0]);
            res.json(result.rows[0]);
        })
        .catch((err) => {
            console.log("Error when uploading img url to database: ", err);
            res.json({
                error: "Error when uploading image in /uload route",
            });
        });
});

// Update bio POST route:
app.post("/update-bio", (req, res) => {
    console.log("POST request for /update-bio route");
    console.log("req.body: ", req.body);
    updateBio(req.body.bio, req.session.userId)
        .then((result) => {
            console.log("result.rows[0]: ", result.rows[0]);
            res.json(result.rows[0]);
        })
        .catch((err) => {
            console.log("Error when updating bio in database: ", err);
            res.json({
                error: "Error when updating bio in database",
                Error: err,
            });
        });
});

// Reset password start POST route:
app.post("/reset-password/start", (req, res) => {
    console.log("POST request for /reset-password/start route");
    // Search user in users table:
    findUser(req.body.email)
        .then((result) => {
            console.log("Searching user in database...");
            // Check if user (email) exists in table:
            console.log("result.rows: ", result.rows);
            if (result.rows.length > 0) {
                console.log("User exists...");
                // Create the verification code:
                console.log("Creating the verification code...");
                const secretCode = cryptRandomString({
                    length: 6,
                });
                console.log("Verification Code: ", secretCode);
                // Put verification code in reset_codes table:
                console.log("Inserting code in reset_codes table...");
                insertCode(result.rows[0].email_address, secretCode)
                    .then((result) => {
                        // Send email to user:
                        console.log(
                            "Sending email with verfication code to user..."
                        );
                        console.log(
                            "result.rows[0].email: ",
                            result.rows[0].email
                        );
                        console.log(
                            "result.rows[0].code: ",
                            result.rows[0].code
                        );
                        sendEmail(
                            result.rows[0].email,
                            `This is the verification code to reset your password: ${result.rows[0].code}`,
                            `Resetting your password`
                        );
                        res.json({
                            success:
                                "Successfully sent email with reset verification code",
                        });
                    })
                    .catch((err) => {
                        console.log(
                            "Error when inserting the verification code and/or sending the email to user:",
                            err
                        );
                        res.json({
                            error: "Error when inserting code in table or when sending email",
                            Error: err,
                        });
                    });
            } else {
                console.log("This user does not exit in database");
                res.json({
                    success: false,
                    // error: "Sorry, but this user does not exist in database",
                });
            }
        })
        .catch((err) => {
            console.log(
                "Error when searching for user in user table in server:",
                err
            );
            res.json({
                error: "Error when searching for user in user table in server",
                Error: err,
            });
        });
});

// Reset password verify POST route:
app.post("/reset-password/verify", (req, res) => {
    console.log("POST request for /reset-password/verify route");
    console.log("req.body: ", req.body);
    // Search for code in reset_codes table:
    console.log("Searching for the code in database...");
    findCode(req.body.email)
        .then((result) => {
            console.log("result.rows: ", result.rows);
            // Check if code in db is equal to input of user:
            if (result.rows[0].code == req.body.code) {
                console.log("Verification code input was correct");
                hash(req.body.password).then((hashed_password) => {
                    console.log("hashed_password: ", hashed_password);
                    console.log("Updating user password...");
                    updateUserPassword(hashed_password, req.body.email)
                        .then(() => {
                            console.log("User password was updated");
                            res.json({
                                success: "User password was updated",
                            });
                        })
                        .catch((err) => {
                            console.log(
                                "Error when updating user password: ",
                                err
                            );
                            res.json({
                                Message: "Error when updating user password",
                                Error: err,
                            });
                        });
                });
            } else {
                console.log("Verifcitaion code input was not correct");
                res.json({
                    success: false,
                });
            }
        })
        .catch((err) => {
            console.log(
                "Error when searching for code in reset_codes table: ",
                err
            );
            res.json({
                Message: "Error when searching for code in reset_codes table",
                Error: err,
            });
        });
});

// User GET Route (to return logged-in user's info):
app.get("/user", (req, res) => {
    console.log("GET request to /user route");
    console.log("Getting user's infos from database...");
    getUserInfos(req.session.userId)
        .then((result) => {
            console.log("result.rows[0] from getUserInfo: ", result.rows[0]);
            res.json(result.rows[0]);
        })
        .catch((err) => {
            console.log("Error when getting user's infos from database: ", err);
            res.json({
                Message: "Error when getting user's infos from database",
                Error: err,
            });
        });
});

// Newest-users GET Route (to find all users data):
app.get("/newest-users", (req, res) => {
    console.log("GET request to /newest-users route");
    // Get the data f
    getNewestUserInfos()
        .then((result) => {
            console.log("result.rows from getNewestUserInfos: ", result.rows);
            res.json({
                data: result.rows,
            });
        })
        .catch((err) => {
            console.log(
                "Error when getting three most recent users profile data from database: ",
                err
            );
        });
});

// Users-by-name GET Route:
app.get("/users-by-name", (req, res) => {
    console.log("GET request to /users-by-name route");
    console.log("req.query.lettersForSearch: ", req.query.lettersForSearch);
    searchUsersByName(req.query.lettersForSearch)
        .then((result) => {
            console.log("result.rows from searchUsersByName: ", result.rows);
            res.json({
                data: result.rows,
            });
        })
        .catch((err) => {
            console.log("Error when searching for users by name: ", err);
        });
});

// Other-user GET Route:
app.get("/other-user/:id", (req, res) => {
    console.log("GET request to /other-user/:id route");
    console.log("req.params: ", req.params); // holds the id from the url
    // Check if id of user is equal to id in url:
    if (parseInt(req.params.id) === req.session.userId) {
        console.log("userId and id in url are equal");
        res.json({
            error: "userId and id in url are equal",
        });
    } else {
        console.log("userId and in in url are NOT equal");
        getOtherUserInfos(req.params.id)
            .then((result) => {
                console.log(
                    "result.rows[0] from getOtherUserInfos: ",
                    result.rows[0]
                );
                res.json({
                    data: result.rows[0],
                });
            })
            .catch((err) => {
                console.log(
                    "Error when getting other user's infos from database: ",
                    err
                );
                res.json({
                    Message:
                        "Error when getting other user's infos from database",
                    error: err,
                });
            });
    }
});

// Friendship-status GET ROUTE:
app.get("/friendship-status", (req, res) => {
    console.log("GET request to /friendship-status route");
    // Store the parameters for checking friendship status in variables:
    console.log("req.query: ", req.query);
    console.log("req.session: ", req.session);
    const otherUser = req.query.viewedUserId;
    const loggedInUser = req.session.userId;
    // Check the friendship status in database:
    checkFriendship(loggedInUser, otherUser)
        .then((result) => {
            console.log("result.rows from checkFriendship: ", result.rows);
            console.log(
                "result.rows.length from checkFriendship: ",
                result.rows.length
            );
            // If there is no friendship status in database:
            if (result.rows.length == 0) {
                res.json({
                    buttonText: "Make Friend Request",
                });
            } else if (result.rows.length > 0) {
                console.log("result.rows.length is > 0!!!");
                // If friendship is existing (was accepted):
                if (result.rows[0].accepted) {
                    console.log(
                        "result.rows.length > 0 AND result.rows.accepted == true"
                    );
                    res.json({
                        buttonText: "Unfriend",
                    });
                }
                // If friendship is pending (was not accepted yet):
                if (!result.rows[0].accepted) {
                    console.log("friendship is pending...");
                    console.log(
                        "result.rows[0].sender_id:",
                        result.rows[0].sender_id
                    );
                    console.log("loggedInUser: ", loggedInUser);
                    // If sender of request:
                    if (result.rows[0].sender_id == loggedInUser) {
                        res.json({
                            buttonText: "Cancel Friend Request",
                        });
                    } else if (result.rows[0].sender_id == otherUser) {
                        res.json({
                            buttonText: "Accept Friend Request",
                        });
                    }
                }
            }
        })
        .catch((err) =>
            console.log("Error when checking friendship in database: ", err)
        );
});

// Make-friend-request POST route:
app.post("/make-friend-request", (req, res) => {
    console.log("POST request to /make-friend-request");
    console.log("req.body in /make-friend-request: ", req.body);
    console.log("req.session: ", req.session);
    const loggedInUser = req.session.userId;
    const buttonText = req.body.buttonText;
    const otherUser = req.body.otherUserId;
    // console.log(loggedInUser, buttonText, otherUser);
    makeFriendRequest(loggedInUser, otherUser)
        .then((result) => {
            console.log("result.rows in makeFriendRequest: ", result.rows);
            res.json({
                data: result.rows,
            });
        })
        .catch((err) => {
            console.log(
                "Error when calling makeFriendRequest to database: ",
                err
            );
        });
});

// Delete-friend-row POST route:
app.post("/delete-friend-row", (req, res) => {
    console.log("POST request to /delete-friend-row route");
    const loggedInUser = req.session.userId;
    const otherUser = req.body.otherUserId;
    deleteFriendshipRow(loggedInUser, otherUser)
        .then((result) => {
            console.log("result.rows in deleteFriendshipRow: ", result.rows);
            res.json({
                data: otherUser,
            });
        })
        .catch((err) => {
            console.log("Error when calling deleteFriendshipRow: ", err);
        });
});

// Accept-friend-request POST route:
app.post("/accept-friend-request", (req, res) => {
    console.log("POST request to /accept-friend-request route");
    const loggedInUser = req.session.userId;
    const otherUser = req.body.otherUserId;
    acceptFriendRequest(loggedInUser, otherUser)
        .then((result) => {
            console.log("result.rows in acceptFriendRequest: ", result.rows);
            res.json({
                data: result.rows,
            });
        })
        .catch((err) => {
            console.log("Error when calling acceptFriendRequest: ", err);
        });
});

// Friends-wannabes GET route:
app.get("/friends-wannabes", (req, res) => {
    console.log("GET request to /friends-wannabes route");
    const loggedInUser = req.session.userId;
    console.log(loggedInUser);
    getFriendsAndWannabes(loggedInUser)
        .then((result) => {
            console.log("result.rows in getFriendsAndWannabes: ", result.rows);
            res.json({
                data: result.rows,
            });
        })
        .catch((err) => {
            console.log("Error when calling getFriendsAndWannabes: ", err);
        });
    // res.send("GET request to /friends-wannabes route");
});

// Universal GET Route:
// (do not delete or comment out this route ever!!!)
app.get("*", function (req, res) {
    console.log("GET request for universal * route");
    // Check if user is NOT logged in (if no userId in session cookie):
    console.log("Checking if user is NOT logged in...");
    console.log("req.session: ", req.session);
    if (!req.session.userId) {
        // If NO userId is set in session cookie:
        console.log("No userId cookie is set ->");
        console.log("Redirect to /welcome route...");
        res.redirect("/welcome");
    } else {
        res.sendFile(path.join(__dirname, "..", "client", "index.html"));
    }
});

// ************************
// **** ACTIVATE SERVER ***
// ************************
server.listen(process.env.PORT || 3001, function () {
    console.log("Server listening on port 3001.");
});

io.on("connection", function (socket) {
    const userId = socket.request.session.userId;

    if (!socket.request.session.userId) {
        return socket.disconnect(true);
    }

    // Log the current connected socket ids:
    console.log(`Socket with the id ${socket.id} is now connected.`);

    // Log socket ids that disconnect:
    socket.on("disconnect", function () {
        console.log(`Socket with the id ${socket.id} is now disconnected.`);
    });

    // Use getRecentMessages to get the data for the 10 most recent chat messages:
    getRecentMessages()
        .then((result) => {
            // console.log("result.rows from getRecentMessages: ", result.rows);
            // Emit/Send the data to the client:
            io.sockets.emit("chatMessages", result.rows.reverse());
        })
        .catch((err) => {
            console.log("Error when using getRecentMessages: ", err);
        });

    // Check for incoming chat messages:
    socket.on("chatMessage", function (chatMessage) {
        console.log("CHAT MESSAGE INCOMING: ", chatMessage);
        // Insert new chat message in databases:
        addNewMessage(userId, chatMessage);
        io.emit("update", {});
    });

    socket.on("thanks", function (message) {
        console.log(message);
    });

    // For testing:
    socket.emit("welcome", {
        message: `Welcome, nice to see you in the chat, id number ${userId}!`,
        // message: "Welcome, nice to see you in the chat!",
    });
    // io.emit("achtung", {
    //     warning: "This site will go offline SOON...!!!",
    // });

    /* ... */
});
