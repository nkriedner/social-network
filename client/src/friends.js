import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    getFriendsAndWannabes,
    acceptFriendRequest,
    unfriend,
} from "./actions";

export default function Friends() {
    // Find friends and wannabes on mounting:

    const dispatch = useDispatch();
    const friendsAndWannabes = useSelector(
        (state) => state.arrayOfFriendsAndWannabes
    );
    // console.log("friendsAndWannabes: ", friendsAndWannabes);

    const friends = [];
    const wannabes = [];

    // As soon as friendsAndWannabes exists:
    if (friendsAndWannabes) {
        // console.log("friendsAndWannabes[0]: ", friendsAndWannabes[0]);
        for (let x of friendsAndWannabes) {
            // console.log("x in friendsAndWannabes: ", x);
            // console.log("x.accepted: ", x.accepted);
            if (x.accepted == true) {
                // console.log("x.accepted = true: ", x);
                friends.push(x);
                // console.log("friends: ", friends);
            } else {
                // console.log("x.accepted = false: ", x);
                wannabes.push(x);
                // console.log("wannabes: ", wannabes);
            }
        }
    }

    useEffect(() => {
        console.log("Friends component mounted successfully");

        dispatch(getFriendsAndWannabes());
    }, []);

    return (
        <div>
            <div className="flex-center">
                <h2>Friend Requests ({wannabes.length})</h2>
            </div>
            <ul>
                {wannabes &&
                    wannabes.map((wannabe, index) => {
                        return (
                            <li key={index}>
                                <img
                                    className="other-user-img"
                                    src={wannabe.imageurl || "/user-img.png"}
                                    alt={
                                        wannabe.first_name +
                                        " " +
                                        wannabe.last_name
                                    }
                                />
                                <div className="flex-center">
                                    <p className="p-style-1">
                                        {wannabe.first_name} {wannabe.last_name}
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        dispatch(
                                            acceptFriendRequest(wannabe.id)
                                        )
                                    }
                                >
                                    Accept
                                </button>
                                <p className="transparent">.</p>
                            </li>
                        );
                    })}
            </ul>
            <div className="flex-center">
                <h2>Existing Friends ({friends.length})</h2>
            </div>
            <ul>
                {friends &&
                    friends.map((friend, index) => {
                        return (
                            <li key={index}>
                                <img
                                    className="other-user-img"
                                    src={friend.imageurl || "/user-img.png"}
                                    alt={
                                        friend.first_name +
                                        " " +
                                        friend.last_name
                                    }
                                />
                                <div className="flex-center">
                                    <p className="p-style-1">
                                        {friend.first_name} {friend.last_name}
                                    </p>
                                </div>
                                <button
                                    className="red-button"
                                    onClick={() =>
                                        dispatch(unfriend(friend.id))
                                    }
                                >
                                    Unfriend
                                </button>
                                <p className="transparent">.</p>
                                {/* <br /> */}
                            </li>
                        );
                    })}
            </ul>
        </div>
    );
}
