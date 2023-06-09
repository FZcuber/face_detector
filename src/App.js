import { useState } from "react";
import Clarifai from "clarifai";
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import Rank from "./components/Rank/Rank";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";
import axios from "axios";
import MouseParticles from "react-mouse-particles";
import { Shift } from "ambient-cbg";
import "./App.css";

const app = new Clarifai.App({
  //insert your own api key
});

const initialState = {
  input: "",
  imageUrl: "",
  box: {},
  route: "signin",
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

  const onButtonSubmit = async () => {
    setState((prevState) => ({ ...prevState, imageUrl: state.input }));
    try {
      const response = await app.models.predict(
        "general-image-detection",
        state.input
      );
      if (response) {
        const updateResponse = await axios.put(
          "http://localhost:3000/image",
          {
            id: state.user.id,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        if (updateResponse.status === 200) {
          const count = updateResponse.data;
          setState((prevState) => ({
            ...prevState,
            user: { ...prevState.user, entries: count },
          }));
        } else {
          throw new Error(`HTTP error ${updateResponse.status}`);
        }
      }
      displayFaceBox(calculateFaceLocation(response));
    } catch (err) {
      console.log(err);
    }
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
  return (
    <div className="App">
      <Shift />
      <MouseParticles
        g={1}
        color="random"
        cull="MuiSvgIcon-root,MuiButton-root"
        level={6}
      />
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
