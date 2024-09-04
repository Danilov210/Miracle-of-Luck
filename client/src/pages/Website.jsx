import React, { useRef } from "react";
import CreateMenuPage from "../pages/CreateMenuPage/CreateMenuPage";
import Contact from "../components/Contact/Contact";
import GetStarted from "../components/GetStarted/GetStarted";
import Hero from "../components/Hero/Hero";
import LotteriesMenuPage from "../pages/LotteriesMenuPage/LotteriesMenuPage";
import Results from "../components/Results/Results";

const Website = () => {
  const resultsRef = useRef(null);

  return (
    <div className="App">
      <div>
        <div className="white-gradient" />
        <Hero />
      </div>
      <LotteriesMenuPage />
      <Results />
      <CreateMenuPage />
      <Contact />
      <GetStarted />
    </div>
  );
};

export default Website;
