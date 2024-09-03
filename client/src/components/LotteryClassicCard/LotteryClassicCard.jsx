import React from "react";
import "./LotteryClassicCard.css";
import { AiFillHeart } from "react-icons/ai";
import { truncate } from "lodash";
import { useNavigate } from "react-router-dom";

const LotteryClassicCard = ({ card }) => {
  const navigate = useNavigate();
  return (
    <div
      className="flexColStart r-card"
      onClick={() => navigate(`../LotteryClassic/${card.id}`)}
    >
      <AiFillHeart size={30} color="grey" />
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

export default LotteryClassicCard;
