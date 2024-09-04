import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { PuffLoader } from "react-spinners";
import { getAllUserOwnedLotteries } from "../../utils/api";
import LotteryFundraisingCard from "../../components/LotteryFundraisingCard/LotteryFundraisingCard";
import LotteryClassicCard from "../../components/LotteryClassicCard/LotteryClassicCard";
import LotteryLikeCard from "../../components/LotteryLikeCard/LotteryLikeCard";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/SearchBar/SearchBar";
import "./OwnedLotteries.css";

const OwnedLotteries = () => {
  const { user } = useAuth0();
  const navigate = useNavigate(); 
  const [ownedLotteries, setOwnedLotteries] = useState([]);
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchOwnedLotteries = async () => {
      try {
        if (user?.email) {
          const response = await getAllUserOwnedLotteries(user.email);
          setOwnedLotteries(response.data);
        }
      } catch (error) {
        console.error("Error fetching user's owned lotteries:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwnedLotteries();
  }, [user?.email]);

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

  const { ownedLotteriesLike = [], ownedLotteriesFundraising = [], ownedLotteriesClassic = [] } = ownedLotteries;



  // Function to filter lotteries based on search term
  const filterLotteries = (lotteries) =>
    lotteries.filter((lottery) =>
      ["title", "description", "hosted", "paticipationdescription"].some((key) =>
        String(lottery[key])?.toLowerCase().includes(filter.toLowerCase())
      )
    );

  // Function to handle navigation
  const handleLotteryClick = (lottery, type) => {
    navigate(`/ownedlotteries/${type}/${lottery.id}`, { state: { from: "/ownedlotteries" } });
  };

  return (
    <div className="wrapper">
      <div className="flexColCenter paddings innerWidth lottery-container">
        <SearchBar filter={filter} setFilter={setFilter} />

        {/* Fundraising Lotteries */}
        {ownedLotteriesFundraising.length > 0 && (
          <div className="lottery-section">
            <h3>Fundraising Lotteries</h3>
            <div className="paddings flexCenter lottery">
              {filterLotteries(ownedLotteriesFundraising).map((card, i) => (
                <div key={i} onClick={() => handleLotteryClick(card, "LotteryFundraising")}>
                  <LotteryFundraisingCard card={card} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Classic Lotteries */}
        {ownedLotteriesClassic.length > 0 && (
          <div className="lottery-section">
            <h3>Classic Lotteries</h3>
            <div className="paddings flexCenter lottery">
              {filterLotteries(ownedLotteriesClassic).map((card, i) => (
                <div key={i} onClick={() => handleLotteryClick(card, "LotteryClassic")}>
                  <LotteryClassicCard card={card} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Like Lotteries */}
        {ownedLotteriesLike.length > 0 && (
          <div className="lottery-section">
            <h3>Like Lotteries</h3>
            <div className="paddings flexCenter lottery">
              {filterLotteries(ownedLotteriesLike).map((card, i) => (
                <div key={i} onClick={() => handleLotteryClick(card, "LotteryLike")}>
                  <LotteryLikeCard card={card} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnedLotteries;
