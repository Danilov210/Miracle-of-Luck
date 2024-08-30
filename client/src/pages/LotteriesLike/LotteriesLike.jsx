import React, { useState } from "react";
import SearchBar from "../../components/SearchBar/SearchBar";
import "./LotteriesLike.css";
import useLotteries from "../../hooks/useLotteries";
import { PuffLoader } from "react-spinners";
import LotteryLikeCard from "../../components/LotteryLikeCard/LotteryLikeCard"

const LotteriesLike = () => {
  const { data, isError, isLoading } = useLotteries();
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
      <div className="wrepper flexCenter" style={{ height: "60vh" }}>
        <PuffLoader
          height="80"
          width="80"
          radius={1}
          color="4066ff"
          aria-label="puff-loading"
        />
      </div>
    );
  }

  return (
    <div className="wrapper">
      <div className="flexColCenter paddings innerWidht lottery-container">
        <SearchBar filter={filter} setFilter={setFilter} />
        <div className="paddings flexCenter lottery">
          {
            data
              .filter(
                (property) =>
                  property.title.toLowerCase().includes(filter.toLowerCase()) ||
                  property.city.toLowerCase().includes(filter.toLowerCase()) ||
                  property.country.toLowerCase().includes(filter.toLowerCase())
              )
              .map((card, i) => (
                <LotteryLikeCard card={card} key={i} />
              ))
          }
        </div>
      </div>
    </div>
  );
};

export default LotteriesLike;
