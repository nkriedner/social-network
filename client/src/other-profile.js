import React from "react";
import axios from "axios";
import Profilepic from "./profile-pic";
import Profile from "./profile";
import FindPeople from "./find-people";
import FriendButton from "./friend-button";

export default class OtherProfile extends React.Component {
    constructor() {
        super();
        this.state = {};
    }
    componentDidMount() {
        const id = this.props.match.params.id;
        console.log("OtherProfile successfully mounted");
        console.log("OtherProfile props: ", this.props);
        console.log("id in url: ", id);
        axios
            .get(`/other-user/${id}`)
            .then((response) => {
                console.log(
                    "data from axios get request to /other-user/:id: ",
                    response.data.data
                );
                console.log("firstname", response.data.data.first_name);
                this.setState({
                    firstname: response.data.data.first_name,
                    lastname: response.data.data.last_name,
                    bio: response.data.data.bio,
                    imgUrl: response.data.data.imageurl,
                });
            })
            .catch((err) => {
                console.log(
                    "Error when making axios get request to /other-user/:id: ",
                    err
                );
                this.props.history.push("/"); // redirects the user back to his own profile
            });
    }
    render() {
        return (
            <div className="profile-flex">
                <img
                    className="profile-img-big"
                    alt={`${this.state.firstname} ${this.state.lastname}`}
                    src={this.state.imgUrl || "/user-img.png"}
                />
                <FriendButton viewedUserId={this.props.match.params.id} />
                <div className="margin-left-3">
                    <h2>
                        {this.state.firstname} {this.state.lastname}
                    </h2>
                    <p className="p-style-1">{this.state.bio}</p>
                </div>
            </div>
        );
    }
}
