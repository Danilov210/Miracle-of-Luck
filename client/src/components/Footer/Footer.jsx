import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <section className="f-wrapper">
      <div className="padding innerWidth flexCenter f-container">
        {/*left side */}
        <div className="flexColStart f-left">
          <img
            src="./BlackLogo.jpg"
            alt=""
            width={120}
            style={{ borderRadius: "10%" }}
          />
          <span>Our vision is to make everyone richer</span>
        </div>
        <div className="flexColStart f-right">
          <span className="primaryText">Information</span>
          <span className="small-font">Israel</span>
          <span className="small-font">Karmiel</span>
          <span>Ort Braude College</span>
        </div>
      </div>
      <div className="flexCenter f-menu">
        <span className="small-font">About Us </span>
        <span className="small-font">Contact Us </span>
        <span className="small-font">Disclaimer </span>
        <span className="small-font">Privacy Policy </span>
        <span className="small-font">Cookie Policy </span>
        <span className="small-font">Terms and Conditions</span>
      </div>
    </section>
  );
};

export default Footer;
