import React from 'react'
import "./Hero.css"
import CountUp from 'react-countup'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom';


export default function Hero() {
    const navigate = useNavigate(); // Initialize the navigate function

    const handlePlayClick = () => {
        navigate("/lotteries/LotteryLike"); // Navigate to the desired route
    };
    return (
        <section className="hero-wrapper">
            <div className="paddings innerWidth flexCenter hero-container">
                {/*left side*/}
                <div className="flexColStart hero-left">
                    <div className="hero-title">
                        <motion.h1
                            initial={{ y: "2rem", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                duration: 2,
                                type: "spring"
                            }}
                        >
                            Discover our revolutionary free lottery!</motion.h1>
                    </div>

                    <div className="flexColStart hero-des">
                        <span className="secondaryText">Just like, comment, and share for a chance to win big prizes!!!</span>
                    </div>

                    <div className=" b-search">
                        <button className="button search" onClick={handlePlayClick}>
                            Play
                        </button>
                    </div>

                    <div className="flexCenter stats">
                        <div className="flexColStart stat">
                            <span>
                                <CountUp start={900} end={1000} duration={4} />
                                <span>+</span>
                            </span>
                            <span className="secondaryText">
                                Number Of Lotteries
                            </span>
                        </div>
                        <div className="flexColStart stat">
                            <span>
                                <CountUp start={254} end={259} duration={4} />
                                <span>+</span>
                            </span>
                            <span className="secondaryText">
                                Happy Customers
                            </span>
                        </div>

                        <div className="flexColStart stat">
                            <span>
                                <CountUp start={1400} end={1400} />
                                <span>+</span>
                            </span>
                            <span className="secondaryText">
                                Last Week Winners
                            </span>
                        </div>

                    </div>
                </div>

                {/*right side*/}
                <div className=" flexColCenter hero-right">
                    <motion.div
                        initial={{ x: "7rem", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                            duration: 2,
                            type: "spring"
                        }}
                        className="image-container">
                        <img src="./hero-image.png" alt="" />
                    </motion.div>
                </div>
            </div>
        </section>
    )

}
