import React from "react";
import { BrowserRouter, Route, Link } from "react-router-dom";
import Logo from "./logo";
import Uploader from "./uploader";
import Profilepic from "./profile-pic";
import Profile from "./profile";
import OtherProfile from "./other-profile";
import axios from "axios";
import FindPeople from "./find-people";
import Friends from "./friends";
import Chat from "./chat";

export default class App extends React.Component {
    constructor() {
        super();
        this.state = {
            imgUrl: null,
            showUploader: false,
        };
        this.toggleUploader = this.toggleUploader.bind(this);
        this.updateProfilePic = this.updateProfilePic.bind(this);
        this.setNewBio = this.setNewBio.bind(this);
    }
    componentDidMount() {
        console.log("app successfully mounted");
        // Get users info:
        console.log("Getting users infos...");
        axios
            .get("/user")
            .then((data) => {
                console.log(
                    "response from axios request in app component: ",
                    data
                );
                this.setState({
                    firstname: data.data.first_name,
                    lastname: data.data.last_name,
                    imgUrl: data.data.imageurl,
                    bio: data.data.bio,
                });
            })
            .catch((err) => {
                console.log(
                    "Error when making axios request to get users data: ",
                    err
                );
            });
    }
    toggleUploader() {
        console.log("toggleUploader was activated!");
        this.setState({
            showUploader: !this.state.showUploader,
        });
    }
    updateProfilePic(imgUrl) {
        this.setState({
            imgUrl,
        });
        this.toggleUploader();
    }
    setNewBio(newBio) {
        this.setState({
            bio: newBio,
        });
    }
    render() {
        return (
            <div>
                <div className="flex banner-top">
                    <Logo />
                    <div className="flex navbar">
                        {/* <Link to="/">HOME</Link> */}
                        <a href="/">Home</a>
                        {/* <br /> */}
                        <a href="/friends">Friends</a>
                        {/* <br /> */}
                        <a href="/find/users">Find Users</a>
                        {/* <br /> */}
                        <a href="/chat">Chat</a>
                        {/* <br /> */}
                        <a href="/logout">Logout</a>
                        {/* <Link key="chat-link" to={"/chat`"}>
                            Chat
                        </Link> */}
                    </div>
                    <Profilepic
                        updateProfilePic={this.updateProfilePic} //  needed?
                        toggleUploader={this.toggleUploader}
                        firstname={this.state.firstname}
                        lastname={this.state.lastname}
                        imgUrl={this.state.imgUrl || "/user-img.png"}
                    />
                </div>
                <BrowserRouter>
                    <Route
                        exact
                        path="/"
                        render={() => (
                            <Profile
                                setNewBio={this.setNewBio}
                                firstname={this.state.firstname}
                                lastname={this.state.lastname}
                                imgUrl={this.state.imgUrl || "/user-img.png"}
                                bio={this.state.bio}
                            />
                        )}
                    />
                    <Route path="/user/:id" component={OtherProfile} />
                    <Route path="/find/users" component={FindPeople} />
                    <Route path="/friends" component={Friends} />
                    <Route path="/chat" component={Chat} />
                </BrowserRouter>
                {this.state.showUploader && (
                    <Uploader
                        updateProfilePic={this.updateProfilePic}
                        toggleUploader={this.toggleUploader}
                    />
                )}
            </div>
        );
    }
}
