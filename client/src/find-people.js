import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function FindPeople() {
    const [newestUsers, setNewestUsers] = useState([]);
    const [searchedUsers, setSearchedUsers] = useState("");
    const [showSearchedUsers, setShowSearchedUsers] = useState([]);

    // FIND NEWEST USERS:
    useEffect(() => {
        console.log("find-people functional component successfully mounted");
        let ignore = false;
        if (searchedUsers.length == 0) {
            console.log("Made it to the if");
            setShowSearchedUsers([]);
            console.log(
                "find-people component making axios request to get data from three most recent added profiles..."
            );
            axios
                .get("/newest-users")
                .then((data) => {
                    console.log(
                        "Data from axios request to /newest-users (data.data.data): ",
                        data.data.data
                    );
                    setNewestUsers(data.data.data);
                })
                .catch((err) => {
                    console.log(
                        "Error when making axios request to /newest-users: ",
                        err
                    );
                });
        } else {
            console.log("Made it to the ELSE");
            axios
                .get("/users-by-name", {
                    params: { lettersForSearch: searchedUsers },
                })
                .then((data) => {
                    console.log(
                        "Data from axios request to /users-by-name (data.data.data): ",
                        data.data.data
                    );
                    if (!ignore) {
                        setShowSearchedUsers(data.data.data);
                    }
                })
                .catch((err) => {
                    console.log(
                        "Error when making axios request to /users-by-name: ",
                        err
                    );
                });
        }

        return () => {
            // clean up function runs when the component rerenders!
            // IF by that point whe have not received an API response yet,
            // we want to ignore that response
            console.log("SET IGNORE TO TRUE");
            ignore = true;
        };
    }, [searchedUsers]);

    let showSearchedUsersTitle = !!showSearchedUsers.length; // converts it to false by
    // double negation (needed because otherwise down below the 0 of the length of the array
    // will be shown on the page)

    return (
        <div>
            <div className="flex-center">
                <h1>Find People</h1>
            </div>
            <br />
            <input onChange={(e) => setSearchedUsers(e.target.value)} />
            {showSearchedUsersTitle && (
                <div className="flex-center">
                    <h2>Found users for your search:</h2>
                </div>
            )}
            <ul>
                {showSearchedUsers.map((user, index) => {
                    {
                        /* console.log("user: ", user); */
                    }
                    return (
                        <Link key={index} to={`/user/${user.id}`}>
                            <li key={index}>
                                <img
                                    className="other-user-img"
                                    src={user.imageurl || "/user-img.png"}
                                    alt={user.first_name + " " + user.last_name}
                                />
                                <div className="flex-center">
                                    <p className="p-style-1">
                                        {user.first_name} {user.last_name}
                                    </p>
                                </div>
                                <p className="transparent">.</p>
                            </li>
                        </Link>
                    );
                })}
            </ul>

            {!showSearchedUsersTitle && (
                <div>
                    <div className="flex-center">
                        <h2>Our three newest users:</h2>
                    </div>
                    <ul>
                        {newestUsers.map((user, index) => {
                            {
                                /* console.log("user: ", user); */
                            }
                            return (
                                <Link key={index} to={`/user/${user.id}`}>
                                    <li key={index}>
                                        <img
                                            className="other-user-img"
                                            src={
                                                user.imageurl || "/user-img.png"
                                            }
                                            alt={
                                                user.first_name +
                                                " " +
                                                user.last_name
                                            }
                                        />
                                        <div className="flex-center">
                                            <p className="p-style-1">
                                                {user.first_name}{" "}
                                                {user.last_name}
                                            </p>
                                        </div>
                                        <p className="transparent">.</p>
                                    </li>
                                </Link>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
