import React from 'react'
import './Contact.css'
import { MdCall, MdVideoCall} from 'react-icons/md'
import { BsFillChatDotsFill } from 'react-icons/bs'
import { HiChatBubbleBottomCenter } from 'react-icons/hi2'

const Contact = () => {
  return (
    <div>
      <section className="c-wrapper">
        <div className="paddings innerWidht flexCenter c-container">
            {/*left side*/ }
            <div className="flexColStart c-left">
                <span className="orangeText">Our Contacts</span>
                <span className="primaryText">Easy to Contact</span>
                <span className="secondaryText">We're always here to bring excitement and opportunities to your life through our lotteries. We believe that a chance to win can make your day brighter and your future even better."</span>
           
                <div className="flexColStart contactModes">
                    {/* first row*/}
                    <div className="flexStart row">
                        <div className="flexColCenter mode">
                            <div className="flexStart">
                                <div className="flexCenter icon">
                                    <MdCall size={25}/>
                                </div>
                                <div className="flexColStart detail">
                                    <span className="primaryText">Call</span>
                                    <span className="secondaryText">053-021-0210</span>
                                </div>
                                <div className="flexCenter button">
                                    Call Now
                                </div>
                            </div>
                        </div>

                        <div className="flexColCenter mode">
                            <div className="flexStart">
                                <div className="flexCenter icon">
                                    <BsFillChatDotsFill size={25}/>
                                </div>
                                <div className="flexColStart detail">
                                    <span className="primaryText">Chat</span>
                                    <span className="secondaryText">053-021-0210</span>
                                </div>
                                <div className="flexCenter button">
                                    Chat Now
                                </div>
                            </div>
                        </div>
                    </div>
          
                <div className="flexStart row">
                        <div className="flexColCenter mode">
                            <div className="flexStart">
                                <div className="flexCenter icon">
                                    <MdVideoCall size={25}/>
                                </div>
                                <div className="flexColStart detail">
                                    <span className="primaryText">Video Call</span>
                                    <span className="secondaryText">053-021-0210</span>
                                </div>
                                <div className="flexCenter button">
                                    Video Call Now
                                </div>
                            

                            </div>
                        </div>

                        <div className="flexColCenter mode">
                            <div className="flexStart">
                                <div className="flexCenter icon">
                                    <HiChatBubbleBottomCenter size={25}/>
                                </div>
                                <div className="flexColStart detail">
                                    <span className="primaryText">Message</span>
                                    <span className="secondaryText">053-021-0210</span>
                                </div>
                                <div className="flexCenter button">
                                    Message Now
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/*right side*/ }
            <div className="flexColCenter c-right">
                <div className="image-container">
                    <img src="./contact.jpg" alt="" />
                </div>
            </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
