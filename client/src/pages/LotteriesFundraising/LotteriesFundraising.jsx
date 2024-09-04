import React, { useState } from "react";
import SearchBar from "../../components/SearchBar/SearchBar";
import "./LotteriesFundraising.css";
import useLotteriesFundraising from "../../hooks/useLotteriesFundraising";
import { PuffLoader } from "react-spinners";
import LotteryFundraisingCard from "../../components/LotteryFundraisingCard/LotteryFundraisingCard";

const LotteriesFundraising = () => {
  const { data, isError, isLoading } = useLotteriesFundraising();
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

  // Filtering data based on the fields available in your dataset
  const filteredData = data.filter((lottery) =>
    ["title", "description", "hosted", "paticipationdescription", "price"]
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
            <LotteryFundraisingCard card={card} key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LotteriesFundraising;
