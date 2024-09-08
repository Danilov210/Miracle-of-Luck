import React, { useRef } from "react";
import CreateMenuPage from "../pages/CreateMenuPage/CreateMenuPage";
import Contact from "../components/Contact/Contact";
import GetStarted from "../components/GetStarted/GetStarted";
import Hero from "../components/Hero/Hero";
import LotteriesMenuPage from "../pages/LotteriesMenuPage/LotteriesMenuPage";
import ResultsMenuPage from "../pages/ResultsMenuPage/ResultsMenuPage";

const Website = () => {
  const resultsRef = useRef(null);

  return (
    <div className="App">
      <div>
        <div className="white-gradient" />
        <Hero />
      </div>
      <LotteriesMenuPage />
      <ResultsMenuPage />
      <CreateMenuPage />
      <Contact />
      <GetStarted />
    </div>
  );
};

export default Website;
