import React, { useRef } from "react";
import CreateLottery from "../components/CreateLottery/CreateLottery";
import Contact from "../components/Contact/Contact";
import GetStarted from "../components/GetStarted/GetStarted";
import Hero from "../components/Hero/Hero";
import LotteriesMenu from "../pages/LotteriesMenu/LotteriesMenu";
import Results from "../components/Results/Results";

const Website = () => {
  const resultsRef = useRef(null);

  return (
    <div className="App">
      <div>
        <div className="white-gradient" />
        <Hero />
      </div>
      <LotteriesMenu />
      <Results />
      <CreateLottery />
      <Contact />
      <GetStarted />
    </div>
  );
};

export default Website;
