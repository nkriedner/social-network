import { socket } from "./socket";

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Chat() {
    const chatMessages = useSelector((state) => state && state.chatMessages);
    // console.log("Chat Messages: ", chatMessages);

    // Use createRef hook for scrolling issue in chat display:
    const elemRef = useRef();

    useEffect(() => {
        console.log("Chat component mounted successfully.");
        // console.log("elemRef.current.scrollTop: ", elemRef.current.scrollTop);
        // console.log(
        //     "elemRef.current.scrollHeight: ",
        //     elemRef.current.scrollHeight
        // );
        // console.log(
        //     "elemRef.current.clientHeight: ",
        //     elemRef.current.clientHeight
        // );

        elemRef.current.scrollTop =
            elemRef.current.scrollHeight - elemRef.current.clientHeight;
        // console.log("elemRef.current.scrollTop: ", elemRef.current.scrollTop);
    }, [chatMessages]);

    const handleKeyDown = (e) => {
        // key = "Enter"
        if (e.key == "Enter") {
            e.preventDefault();
            console.log("Handlekey e.target.value: ", e.target.value);
            console.log("SOCKET: ", socket);
            // Emit/Send typed input to server (1st argument is name of event, 2nd is content):
            socket.emit("chatMessage", e.target.value);
            // Reset textarea input field:
            e.target.value = "";
            window.location.reload(false);
        }
    };
    return (
        <div className="chat-room">
            <h1>Chat Room</h1>
            <ul className="chat-messages" ref={elemRef}>
                {chatMessages &&
                    chatMessages.map((message, index) => {
                        {
                            /* {
                            console.log("message: ", message);
                        } */
                        }
                        return (
                            <li className="flex" key={index}>
                                <Link key={index} to={`/user/${message.id}`}>
                                    <img
                                        className="other-user-img"
                                        src={
                                            message.imageurl || "/user-img.png"
                                        }
                                        alt={
                                            message.first_name +
                                            " " +
                                            message.last_name
                                        }
                                    />
                                    <p>
                                        {message.first_name} {message.last_name}
                                    </p>
                                </Link>
                                <p>{message.message_text}</p>
                                <p>{message.created_at}</p>
                            </li>
                        );
                    })}
            </ul>
            <textarea
                onKeyDown={handleKeyDown}
                placeholder="Type your chat message and press 'Enter'..."
            ></textarea>
        </div>
    );
}

// event listener for textarea  with button
