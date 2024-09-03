import React from "react";
import data from "../../utils/slider.json";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import { sliderSetting } from "../../utils/common";
import "swiper/css";
import "./LotteriesMenu.css";
import LotteryMenuCard from "../../components/LotteryMenuCard/LotteryMenuCard";
import { Link } from "react-router-dom";

const LotteriesMenu = () => {
  // Define an array of links corresponding to the slides
  const links = ["/lotteries/LotteryLike", "/lotteries/LotteryFundraising", "/lotteries/LotteryClassic"];

  return (
    <section className="r-wrapper">
      <div className="wrapper paddings innerWidth r-container">
        <div className="flexColCenter r-head">
          <span className="orangeText">Best Choices</span>
          <span className="primaryText">Popular Lotteries</span>
        </div>
        <Swiper {...sliderSetting}>
          <SliderButton />
          {data.map((card, i) => (
            <SwiperSlide key={i}>
              <Link to={links[i % links.length]} className="slide-link">
                <LotteryMenuCard card={card} />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default LotteriesMenu;

const SliderButton = () => {
  const swiper = useSwiper();
  return (
    <div className="flexCenter r-buttons">
      <button onClick={() => swiper.slidePrev()}>&lt;</button>
      <button onClick={() => swiper.slideNext()}>&gt;</button>
    </div>
  );
};