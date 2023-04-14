import React from "react";
import Tilt from "react-parallax-tilt";
import brain from "./brain.png";
import "./Logo.css";

const Logo = () => {
  return (
    <div className="ma4 mt0">
      <Tilt
        className="Tilt br2 shadow-2"
        options={{ max: 100 }}
        style={{ height: 155, width: 200 }} // Increase height and width to 200px
      >
        <div className="Tilt-inner pa3">
          <img
            style={{ paddingTop: "5px", height: "100%", width: "100%" }}
            alt="logo"
            src={brain}
          />{" "}
        </div>
      </Tilt>
    </div>
  );
};

export default Logo;
