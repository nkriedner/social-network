import axios from "./axios";

// this file will contain all of our action creator functions
// actions creator are just functions that return an object
// with a property called type
// additionally to type, we often have some sort of payload/data
// that we want to pass on to the reducer, so that the reducer can
// update redux globale state

export function getFriendsAndWannabes() {
    return axios
        .get("/friends-wannabes")
        .then((data) => {
            console.log(
                "Data from axios GET request to /friends-wannabes: ",
                data.data.data
            );
            return {
                type: "GET_FRIENDS_AND_WANNABES",
                payload: data.data.data,
            };
        })
        .catch((err) => {
            console.log(
                "Error when making axios GET request to /friends-wannabes",
                err
            );
        });
}

export function acceptFriendRequest(viewedUserId) {
    // / ---> Make AXIOS POST REQUEST TO ACCEPT FRIEND REQUEST
    // Return with id of user whose friendship was accepted
    return axios
        .post("/accept-friend-request", {
            otherUserId: viewedUserId,
        })
        .then((data) => {
            console.log(
                "Data from axios post request to /accept-friend-request: ",
                data.data.data
            );
            // setButtonText();
            return {
                type: "ACCEPT_FRIEND_REQUEST",
                viewedUserId,
            };
        })
        .catch((err) => {
            console.log(
                "Error in axios request to /accept-friend-request: ",
                err
            );
        });
}

export function unfriend(viewedUserId) {
    // ---> MAKKE AXIOS POST REQUEST TO DELETE FRIENDSHIP ROW
    // Return with id of user whose friendship was deleted
    return axios
        .post("/delete-friend-row", {
            otherUserId: viewedUserId,
        })
        .then((data) => {
            console.log(
                "Data from axios post request to /delete-friend-row: ",
                data.data.data
            );
            return {
                type: "DELETE_FRIEND_ROW",
                viewedUserId,
            };
        })
        .catch((err) => {
            console.log("Error in axios request to /delete-friend-row: ", err);
        });
}

export function chatMessages(messages) {
    // console.log("messages in chatMessages: ", messages);
    return {
        type: "LAST_CHAT_MESSAGES",
        payload: messages,
    };
}

export function chatMessage(message) {
    console.log("message in ChatMessage: ", message);
    return {
        typeof: "NEW_CHAT_MESSAGE",
        payload: message,
    };
}
