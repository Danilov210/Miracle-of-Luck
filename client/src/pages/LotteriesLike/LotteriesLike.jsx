import React, { useState } from "react";
import SearchBar from "../../components/SearchBar/SearchBar";
import "./LotteriesLike.css";
import useLotteriesLike from "../../hooks/useLotteries";
import { PuffLoader } from "react-spinners";
import LotteryLikeCard from "../../components/LotteryLikeCard/LotteryLikeCard"

const LotteriesLike = () => {
  const { data, isError, isLoading } = useLotteriesLike();
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

  // Filtering data based on the available fields
  const filteredData = data.filter((lottery) =>
    ["title", "description", "hosted", "paticipationdescription", "link", "lotteryStatus"]
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
            <LotteryLikeCard card={card} key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LotteriesLike;