import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import SearchBar from "../../components/SearchBar/SearchBar";
import "./LotteriesFundraising.css";
import useLotteriesFundraising from "../../hooks/useLotteriesFundraising";
import { PuffLoader } from "react-spinners";
import LotteryFundraisingCard from "../../components/LotteryFundraisingCard/LotteryFundraisingCard";

const LotteriesFundraising = () => {
  const { data, isError, isLoading } = useLotteriesFundraising();
  const [filter, setFilter] = useState("");
  const location = useLocation();

  // Determine if the user came from the "Results" or "Lotteries" page
  const isFromResultsPage = location.pathname.includes("/results");
  const isFromLotteriesPage = location.pathname.includes("/lotteries");

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

  // Filter data based on the navigation source and user search input
  const filteredData = data
    .filter((lottery) =>
      ["title", "description", "hosted", "paticipationdescription", "price"]
        .some((key) =>
          String(lottery[key])?.toLowerCase().includes(filter.toLowerCase())
        )
    )
    .filter((lottery) => {
      // Show only closed lotteries if coming from the "Results" page
      if (isFromResultsPage) return lottery.lotteryStatus === "Closed";
      // Show only open lotteries if coming from the "Lotteries" page
      if (isFromLotteriesPage) return lottery.lotteryStatus === "Open";
      // Otherwise, show all lotteries
      return true;
    });

  return (
    <div className="wrapper">
      <div className="flexColCenter paddings innerWidth lottery-container">
        <SearchBar filter={filter} setFilter={setFilter} />
        <div className="paddings flexCenter lottery">
          {filteredData.length > 0 ? (
            filteredData.map((card, i) => (
              <LotteryFundraisingCard card={card} key={i} />
            ))
          ) : (
            <div className="no-lotteries-message">
              No available lotteries exist.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LotteriesFundraising;
