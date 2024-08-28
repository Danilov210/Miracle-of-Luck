import React from "react";
import "./LotteriesLike.css";
import SearchBar from "../../components/SearchBar/SearchBar";
import useLotteries from "../../hooks/useLotteries";
import { PuffLoader } from "react-spinners";
import LotteryLikeCard from "../../components/LotteryLikeCard/LotteryLikeCard"

const LotteriesLike = () => {
  const { data, isError, isLoading } = useLotteries();
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
        <SearchBar />
        <div className="paddings flexCenter lotteries">
          {data.map((card, i) => (
            <LotteryLikeCard card={card} key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LotteriesLike;
