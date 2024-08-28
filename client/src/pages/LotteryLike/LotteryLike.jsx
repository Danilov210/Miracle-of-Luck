import React from "react";
import { useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import { getLotteryLike } from "../../utils/api";
import { PuffLoader } from "react-spinners";
import { AiFillHeart } from "react-icons/ai";
import "./LotteryLike.css";

const LotteryLike = () => {
  const { pathname } = useLocation();
  const id = pathname.split("/").slice(-1)[0];
  console.log(id);
  const { data, isError, isLoading } = useQuery(["lotterylike", id], () =>
    getLotteryLike(id)
  );

  if (isLoading) {
    return (
      <div className="wrapper">
        <div className="flexCenter paddings">
          <PuffLoader />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="wrapper">
        <div className="flexCenter paddings">
          <span>Error while fetching the lottery Like details</span>
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper">
      <div className="flexColStart paddings innerWidth lottery-container">
        {/* like button */}
        <div className="like">
          <AiFillHeart size={30} color="grey" />
        </div>
        {/* image */}
        <img src={data?.image} alt="Lottery Image" />
        <div className="flexCentre lottery-details">
          <div className="flexColStart head">
            <span className="primaryText">{data?.title}</span>
            <span className="primaryText">Description!!!!!!!!!!!!</span>
            <span className="primaryText">HostName!!!!!!!!!!!!</span>
            <span className="primaryText">DATA+TIME!!!!!!!!!!!!</span>
            <span className="primaryText">Conditions!!!!!!!!!!!!</span>
            <span className="primaryText">Prises!!!!!!!!!!!!</span>
            <span className="primaryText">Link!!!!!!!!!!!!</span>
            {/* <span className="orangeText" style={{ fontSize: "1.5rem" }}>
              {data?.price}
            </span> */}

            {/* purchesing button */}
            <button className="button button-blue">Purches</button>
          </div>
          <div className="flexStart options"></div>
        </div>
      </div>
    </div>
  );
};

export default LotteryLike;
