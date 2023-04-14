import React, { useState } from "react";
import Clarifai from "clarifai";
import ParticlesBg from "particles-bg";
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import Rank from "./components/Rank/Rank";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";
import "./App.css";

const app = new Clarifai.App({
  apiKey: "ba96abe91f2c46d9b78d78e71b92e963",
});

const initialState = {
  input: "",
  imageUrl: "",
  box: {},
  route: "home",
  isSignedIn: false,
  user: {
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: "",
  },
};

const App = () => {
  const [state, setState] = useState(initialState);

  const loadUser = (data) => {
    setState((prevState) => ({
      ...prevState,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
      },
    }));
  };

  const calculateFaceLocation = (data) => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  const displayFaceBox = (box) => {
    setState((prevState) => ({ ...prevState, box: box }));
  };

  const onInputChange = (event) => {
    setState((prevState) => ({ ...prevState, input: event.target.value }));
  };

  const onButtonSubmit = () => {
    setState((prevState) => ({ ...prevState, imageUrl: state.input }));
    app.models
      .predict("general-image-detection", state.input)
      .then((response) => {
        if (response) {
          fetch("http://localhost:3000/image", {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: state.user.id,
            }),
          })
            .then((response) => response.json())
            .then((count) => {
              setState((prevState) => ({
                ...prevState,
                user: { ...prevState.user, entries: count },
              }));
            });
        }
        displayFaceBox(calculateFaceLocation(response));
      })
      .catch((err) => console.log(err));
  };

  const onRouteChange = (route) => {
    if (route === "signout") {
      setState((prevState) => ({ ...prevState, isSignedIn: false }));
    } else if (route === "home") {
      setState((prevState) => ({ ...prevState, isSignedIn: true }));
    }
    setState((prevState) => ({ ...prevState, route: route }));
  };

  const { isSignedIn, imageUrl, route, box } = state;
  console.log(box);
  return (
    <div className="App">
      <ParticlesBg type="square" bg={true} />
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
      {route === "home" ? (
        <div>
          <Logo />
          <Rank name={state.user.name} entries={state.user.entries} />
          <ImageLinkForm
            onInputChange={onInputChange}
            onButtonSubmit={onButtonSubmit}
          />
          <FaceRecognition box={box} imageUrl={imageUrl} />
        </div>
      ) : route === "signin" ? (
        <Signin loadUser={loadUser} onRouteChange={onRouteChange} />
      ) : (
        <Register loadUser={loadUser} onRouteChange={onRouteChange} />
      )}
    </div>
  );
};

export default App;
