import { useEffect, useState } from "react";
import axios from "./axios";

export default function FriendButton(props) {
    const [buttonText, setButtonText] = useState("");

    useEffect(() => {
        console.log("friend-button functional component successfully mounted");
        console.log("props in friend-button component:", props);
        console.log("viewedUserid: ", props.viewedUserId);

        // Make an axios request to figure out the initial status of friendship
        axios
            .get("/friendship-status", {
                params: { viewedUserId: props.viewedUserId },
            })
            .then((data) => {
                console.log(
                    "Data from axios request to /friendships-status: ",
                    data.data
                );
                setButtonText(data.data.buttonText);
            });
    }, [buttonText]); // added after it worked with refresh

    function submit(e) {
        // Log the textContent of the friend-button:
        console.log(
            "friend-button was clicked -> e.target.textContent: ",
            e.target.textContent
        );
        console.log("buttonText: ", buttonText);
        // Make axios post request according to buttonText:
        if (buttonText == "Make Friend Request") {
            document.getElementById("test").classList.add("red-button");
            console.log("Axios post request to /make-friend-request...");
            axios
                .post("/make-friend-request", {
                    buttonText: buttonText, // not needed
                    otherUserId: props.viewedUserId,
                })
                .then((data) => {
                    console.log(
                        "Data axios post request to /make-friend-request: ",
                        data.data
                    );
                    setButtonText();
                })
                .catch((err) => {
                    console.log(
                        "Error in axios request to /delete-friend-row: ",
                        err
                    );
                });
        } else if (
            buttonText == "Cancel Friend Request" ||
            buttonText == "Unfriend"
        ) {
            document.getElementById("test").classList.remove("red-button");
            // ---> MAKKE AXIOS REQUEST TO DELETE FRIENDSHIP ROW
            console.log("Axios post request to cancel/delete friend request");
            axios
                .post("/delete-friend-row", {
                    otherUserId: props.viewedUserId,
                })
                .then((data) => {
                    console.log(
                        "Data from axios post request to /delete-friend-row: ",
                        data.data
                    );
                    setButtonText();
                })
                .catch((err) => {
                    console.log(
                        "Error in axios request to /delete-friend-row: ",
                        err
                    );
                });
        } else if (buttonText == "Accept Friend Request") {
            document.getElementById("test").classList.add("red-button");
            // Make AXIOS REQUEST TO ACCEPT FRIEND REQUEST
            console.log("Axios post request to accet friendship");
            axios
                .post("/accept-friend-request", {
                    otherUserId: props.viewedUserId,
                })
                .then((data) => {
                    console.log(
                        "Data from axios post request to /accept-friend-request: ",
                        data.data
                    );
                    setButtonText();
                })
                .catch((err) => {
                    console.log(
                        "Error in axios request to /accept-friend-request: ",
                        err
                    );
                });
        }
    }

    return (
        <button id="test" onClick={(e) => submit(e)}>
            {buttonText}
        </button>
    );
}
