import React, { useState } from "react";
import data from "../../utils/slider.json";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import { sliderSetting } from "../../utils/common";
import "swiper/css";
import "./CreateMenuPage.css";
import useAuthCheck from "../../hooks/useAuthCheck.jsx";
import LotteryMenuCard from "../../components/LotteryMenuCard/LotteryMenuCard.jsx";
import CreateLotteryLike from "../../components/CreateLotteryLike/CreateLotteryLike.jsx";
import CreateFundraisingModel from "../../components/CreateFundraisingModel/CreateFundraisingModel.jsx"; // Import the second modal component
import CreateClassicModel from "../../components/CreateClassicModel/CreateClassicModel.jsx";


const CreateMenuPage = () => {
  const [modalOpened, setModalOpened] = useState(false); // State to manage modal visibility
  const [secondModalOpened, setSecondModalOpened] = useState(false); // State to manage the second modal visibility
  const [classicModalOpened, setClassicModalOpened] = useState(false); // State to manage the second modal visibility

  const { validateLogin } = useAuthCheck();

  // Function to handle card click event
  const handleCardClick = (index) => {

    if (index === 0) {
      // Trigger another specific action for the second card
      if (validateLogin()) {
        setModalOpened(true);
      }
    }
    if (index === 1) {
      // Trigger another specific action for the second card
      if (validateLogin()) {
        setSecondModalOpened(true);
      }
    }
    if (index === 2) {
      // Trigger another specific action for the second card
      if (validateLogin()) {
        setClassicModalOpened(true);
      }
    }
  };


  return (
    <section className="r-wrapper">
      <div className="wrapper paddings innerWidth r-container">
        <div className="r-head flexColCenter">
          <span className="orangeText">Create Lottery</span>
        </div>
        <Swiper {...sliderSetting}>
          <SliderButton />
          {data.map((card, i) => (
            <SwiperSlide key={i}>
              <div
                className="slide-link"
                onClick={() => handleCardClick(i)} // Use onClick event handler
                style={{ cursor: "pointer" }} // Change cursor to indicate clickable
              >
                <LotteryMenuCard card={card} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Render the CreateLotteryLike component as a modal */}
      {modalOpened && (
        <CreateLotteryLike open={modalOpened} setOpen={setModalOpened} />
      )}

      {/* Render the CreateLotteryFundraising as a modal */}
      {secondModalOpened && (
        <CreateFundraisingModel open={secondModalOpened} setOpen={setSecondModalOpened} />
      )}

      {/* Render the CreateLotteryClassic as a modal */}
      {classicModalOpened && (
        <CreateClassicModel open={classicModalOpened} setOpen={setClassicModalOpened} />
      )}
    </section>
  );
};

export default CreateMenuPage;

const SliderButton = () => {
  const swiper = useSwiper();
  return (
    <div className="flexCenter r-buttons">
      <button onClick={() => swiper.slidePrev()}>&lt;</button>
      <button onClick={() => swiper.slideNext()}>&gt;</button>
    </div>
  );
};
