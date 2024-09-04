import React, { useState } from "react";
import SearchBar from "../../components/SearchBar/SearchBar";
import "./LotteriesClassic.css";
import useLotteriesClassic from "../../hooks/useLotteriesClassic";
import { PuffLoader } from "react-spinners";
import LotteryClassicCard from "../../components/LotteryClassicCard/LotteryClassicCard";

const LotteriesClassic = () => {
  const { data, isError, isLoading } = useLotteriesClassic();
  const [filter, setFilter] = useState("");

  if (isError) {
    return (
      <div className="wrapper">
        <span>Error while fetching data</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="wrapper flexCenter" style={{ height: "60vh" }}>
        <PuffLoader color="#4066ff" size={80} aria-label="Loading Spinner" />
      </div>
    );
  }

  const filteredData = data.filter((lottery) =>
    ["title", "description", "hosted", "price", "availableNumberRange", "drawnNumbersCount", "participation"]
      .some((key) =>
        String(lottery[key])?.toLowerCase().includes(filter.toLowerCase())
      )
  );

  return (
    <div className="wrapper">
      <div className="flexColCenter paddings innerWidth lottery-container">
        <SearchBar filter={filter} setFilter={setFilter} />
        <div className="paddings flexCenter lottery">
          {filteredData.map((card, i) => (
            <LotteryClassicCard card={card} key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LotteriesClassic;
