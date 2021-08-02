import { HashRouter, Route } from "react-router-dom";
import Registration from "./registration";
import Login from "./login";
import ResetPassword from "./reset-password";

export default function Welcome() {
    console.log("welcome functional component loaded");
    return (
        <div>
            <div className="flex-center">
                <h1>Learn to code and meditate!</h1>
            </div>
            <div className="flex-center">
                <h1 className="welcome-logo flex-center">
                    {/* Logo */}
                    Conscious
                    <br />
                    Coding
                </h1>
            </div>
            {/* <div className="flex-center">
                <p className="p-style-1">
                    Become friends with Nils (if you like) and of course with
                    any of Nils friends.
                </p>
            </div> */}
            <HashRouter>
                <div>
                    <Route exact path="/" component={Registration} />
                    <Route path="/login" component={Login} />
                    <Route path="/reset-password" component={ResetPassword} />
                </div>
            </HashRouter>
        </div>
    );
}
