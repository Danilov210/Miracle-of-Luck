import React, { useContext, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import { getLotteryClassic } from "../../utils/api";
import { PuffLoader } from "react-spinners";
import { AiFillHeart } from "react-icons/ai";
import "./LotteryClassic.css";
import useAuthCheck from "../../hooks/useAuthCheck";
import { useAuth0 } from "@auth0/auth0-react";
import UserDetailContext from "../../context/UserDetailContext";
import LotteryticketPurchase from "../../components/LotteryTicketPurchase/LotteryTicketPurchase";




const LotteryClassic = () => {

    const { pathname } = useLocation();
    const id = pathname.split("/").slice(-1)[0];
    const { data, isLoading, isError } = useQuery(["lotteryclassic", id], () =>
        getLotteryClassic(id)
    );
    const [modalOpened, setModalOpened] = useState(false);
    const { validateLogin } = useAuthCheck();
    const { user } = useAuth0();

    // const {
    //     userDetails: { token, ticketPurchases },
    //     setUserDetails,
    // } = useContext(UserDetailContext);

    // const { mutate: cancelBooking, isLoading: cancelling } = useMutation({
    //     mutationFn: () => removeBooking(id, user?.email, token),
    //     onSuccess: () => {
    //         setUserDetails((prev) => ({
    //             ...prev,
    //             ticketPurchases: prev.ticketPurchases.filter((booking) => booking?.id !== id),
    //         }));

    //         toast.success("Booking cancelled", { position: "bottom-right" });
    //     },
    // });

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
                        {/* <button className="button button-blue">Purches</button> */}
                        {/* booking button */}
                        {/* {ticketPurchases?.map((booking) => booking.id).includes(id) ? (
                            <>
                                <Button
                                    variant="outline"
                                    w={"100%"}
                                    color="red"
                                    onClick={() => cancelBooking()}
                                    disabled={cancelling}
                                >
                                    <span>Cancel booking</span>
                                </Button>
                                <span>
                                    Your visit already booked for date{" "}
                                    {ticketPurchases?.filter((ticketPurchase) => ticketPurchase?.id === id)[0].date}
                                </span>
                            </>
                        ) : (
                            <button
                                className="button button-green"
                                onClick={() => {
                                    validateLogin() && setModalOpened(true);
                                }}
                            >
                                Book your visit
                            </button>
                        )} */}
                        <button className="button button-green"
                            onClick={() => {
                                validateLogin() && setModalOpened(true);
                            }}
                        >
                            Book your visit
                        </button>
                        
                        <LotteryticketPurchase
                            opened={modalOpened}
                            setOpened={setModalOpened}
                            lotteryId={id}
                            email={user?.email}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LotteryClassic;
