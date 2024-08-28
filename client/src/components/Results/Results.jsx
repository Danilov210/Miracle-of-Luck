import React from 'react'
import {Swiper,SwiperSlide,useSwiper} from 'swiper/react'
import "swiper/css"
import './Results.css'
import data from '../../utils/slider.json'
import { sliderSetting } from '../../utils/common'

const Results = () => {
  return (
    <section className="r-wrapper">
        <div className="paddings innerWidth r-container">
            <div className="r-head flexColCenter">
                <span className="orangeText">Results</span>
                <span className="primaryText">Popular Lotteries</span>
            </div>
            <Swiper {...sliderSetting}>
              <SliderButton/>
              {data.map((card,i)=>(
                  <SwiperSlide key={i}>
                      <div className="flexColStart r-card">
                        <img src={card.image} alt="home" />
                        
                        <span className="primaryText">{card.name}</span>
                        <span className="secondaryText">{card.detail}</span>
                      </div>
                  </SwiperSlide>
                ))
              }
            </Swiper>
        </div>
    </section>
  )
}

export default Results




const  SliderButton=()=> {
  const swiper = useSwiper();
  return (
    <div className="flexCenter r-buttons">
      <button onClick={()=>swiper.slidePrev()}>&lt;</button>
      <button onClick={()=>swiper.slideNext()}>&gt;</button>    
    </div>
  )
}
