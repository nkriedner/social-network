// /src/reducer.js -> this is one big function with a bunch of conditionals,
// that check for what action to run
export default function reducer(state = {}, action) {
    // for almost each of my actions we'll need a new conditional
    // in our reducer function!

    if (action.type === "GET_FRIENDS_AND_WANNABES") {
        state = {
            ...state,
            arrayOfFriendsAndWannabes: action.payload,
        };
    }

    if (action.type === "ACCEPT_FRIEND_REQUEST") {
        state = {
            ...state,
            arrayOfFriendsAndWannabes: state.arrayOfFriendsAndWannabes.map(
                (friendOrWannabe) => {
                    console.log(
                        "TEST: action.viewedUserId:",
                        action.viewedUserId
                    );
                    console.log(
                        "TEST: friendOrWannabe.id:",
                        friendOrWannabe.id
                    );
                    if (friendOrWannabe.id == action.viewedUserId) {
                        return {
                            ...friendOrWannabe,
                            accepted: true,
                        };
                    } else {
                        return friendOrWannabe;
                    }
                }
            ),
        };
    }

    if (action.type === "DELETE_FRIEND_ROW") {
        state = {
            ...state,
            arrayOfFriendsAndWannabes: state.arrayOfFriendsAndWannabes.filter(
                (friendOrWannabe) => friendOrWannabe.id != action.viewedUserId
            ),
        };
    }

    if (action.type === "LAST_CHAT_MESSAGES") {
        state = {
            ...state,
            chatMessages: action.payload,
        };
    }

    if (action.type === "NEW_CHAT_MESSAGE") {
        state = {
            ...state,
            chatMessages: [...state.chatMessages, action.message],
        };
    }

    return state;
}
