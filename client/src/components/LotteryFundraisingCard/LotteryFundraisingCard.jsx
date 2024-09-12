import React from "react";
import "./LotteryFundraisingCard.css";
import { AiFillHeart } from "react-icons/ai";
import { truncate } from "lodash";
import { useNavigate } from "react-router-dom";

const LotteryFundraisingCard = ({ card }) => {
  const navigate = useNavigate();
  return (
    <div
      className="flexColStart r-card"
      onClick={() => navigate(`../LotteryFundraising/${card.id}`)}
    >
      <AiFillHeart size={30} color="transparent" />
      <img src={card.image} alt="home" />
      <span className="primaryText">
        {truncate(card.title, { length: 15 })}
      </span>
      <span className="secondaryText">
        {truncate(card.description, { length: 80 })}
      </span>
    </div>
  );
};

export default LotteryFundraisingCard;
