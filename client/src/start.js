import ReactDOM from "react-dom";
import Welcome from "./welcome";
import App from "./app";

import { io } from "socket.io-client";

// Redux setup ->
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import reduxPromise from "redux-promise";
import { composeWithDevTools } from "redux-devtools-extension";
import reducer from "./reducer";
import { init } from "./socket";

const store = createStore(
    reducer,
    composeWithDevTools(applyMiddleware(reduxPromise))
);

const socket = io();

socket.on("welcome", function (message) {
    console.log("Testing socket connection...");
    console.log(message);
    socket.emit("thanks", {
        welcomeAnswer: "Thank you. It is great to be here.",
    });
});

socket.on("achtung", function (message) {
    console.log(message);
});

// Check the url and render the accoring component:
// (for logged out / new users: the logo component)
// (for logged in users: the welcome component)
// console.log("location.pathname: ", location.pathname);
if (location.pathname == "/welcome") {
    ReactDOM.render(<Welcome />, document.querySelector("main"));
} else {
    init(store);
    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>,
        document.querySelector("main")
    );
}
