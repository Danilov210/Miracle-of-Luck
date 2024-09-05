import React, { useState } from "react";
import { useQuery, useMutation } from "react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CancelUserTicket, CancelLottery, getLotteryClassic } from "../../utils/api"; // Import CancelLottery
import { AiFillHeart } from "react-icons/ai";
import { PuffLoader } from "react-spinners";
import "./LotteryClassic.css";
import useAuthCheck from "../../hooks/useAuthCheck";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import LotteryClassicTicketPurchase from "../../components/LotteryClassicTicketPurchase/LotteryClassicTicketPurchase";

const LotteryClassic = () => {
  const location = useLocation(); 
  const { state } = location; 
  const ticketId = state?.ticketId; 
  const ticketNumbers = state?.ticketNumbers; 
  const cancelLotteryOption = state?.cancelLotteryOption; // Check if cancelLotteryOption exists

  const navigate = useNavigate();

  const id = useLocation().pathname.split("/").pop();
  const { data, isLoading, isError } = useQuery(["lotteryclassic", id], () => getLotteryClassic(id));
  const [ticketModalOpened, setTicketModalOpened] = useState(false);
  const { validateLogin } = useAuthCheck();
  const { user } = useAuth0();

  // Mutation to handle ticket cancellation
  const cancelTicketMutation = useMutation({
    mutationFn: () => CancelUserTicket(ticketId),
    onSuccess: (response) => {
      if (response?.data?.message) {
        toast.success(response.data.message, {
          position: "bottom-right",
          autoClose: 3000,
        });
        setTimeout(() => {
          navigate("/ownedtickets");
        }, 1000);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message, {
        position: "bottom-right",
      });
    },
    onSettled: () => setTicketModalOpened(false),
  });

  // Mutation to handle lottery cancellation
  const cancelLotteryMutation = useMutation({
    mutationFn: () => CancelLottery(id, "Classic"), // Pass the lottery ID and type to the cancellation function
    onSuccess: (response) => {
      if (response?.data?.message) {
        toast.success(response.data.message, {
          position: "bottom-right",
          autoClose: 3000,
        });
        setTimeout(() => {
          navigate("/ownedlotteries");
        }, 1000);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message, {
        position: "bottom-right",
      });
    },
  });

  const { image, title, description, hosted, endDate, availableNumberRange, drawnNumbersCount, price, prizes, paticipationdescription } = data || {};

  if (isLoading) return <div className="wrapper flexCenter paddings"><PuffLoader /></div>;

  if (isError) return <div className="wrapper flexCenter paddings">Error while fetching the lottery classic details</div>;

  return (
    <div className="wrapper">
      <div className="flexColStart paddings innerWidth lottery-container">
        {image && <img src={image} alt="Lottery Image" className="lottery-image" />}
        <div className="flexColStart lottery-details">
          <div className="flexColStart head">
            {ticketId && (
              <span className="primaryText">Ticket ID: <span className="IDNumber">{ticketId}</span></span>
            )}
            {ticketNumbers && (
              <span className="primaryText">Ticket Numbers: <span className="IDNumber">{ticketNumbers.join(", ")}</span></span>
            )}
            {title && <span className="primaryText">Title: <span className="primary2Text">{title}</span></span>}
            {description && <span className="primaryText">Description: <span className="primary2Text">{description}</span></span>}
            {hosted && <span className="primaryText">Hosted By: <span className="primary2Text">{hosted}</span></span>}
            {endDate && <span className="primaryText">Lottery Draw Time: <span className="primary2Text">{new Date(endDate).toLocaleString()}</span></span>}
            {availableNumberRange && <span className="primaryText">Number Range: <span className="primary2Text">{availableNumberRange}</span></span>}
            {drawnNumbersCount && <span className="primaryText">Numbers to Draw: <span className="primary2Text">{drawnNumbersCount}</span></span>}
            {price && <span className="primaryText">Price For One Ticket: <span className="primary2Text">{price} USD</span></span>}
            {paticipationdescription && <span className="primaryText">Participation: <span className="primary2Text">{paticipationdescription}</span></span>}
            {prizes?.length > 0 && (
              <>
                <span className="primaryText">Prizes:</span>
                {prizes.map(({ place, amount }, idx) => (
                  <div key={idx} className="primary2Text">
                    <span className="placeNumber">Place {place} ({drawnNumbersCount - idx} {drawnNumbersCount - idx === 1 ? "number" : "numbers"} from {drawnNumbersCount})</span>: {amount} USD
                  </div>
                ))}
              </>
            )}
            <Box className="flexColCenter NavBut">
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mt: 2 }}>
                <button
                  className={`button ${ticketId ? 'button-red' : 'button-green'}`}
                  onClick={() => {
                    if (ticketId) {
                      cancelTicketMutation.mutate(); 
                    } else {
                      if (validateLogin()) {
                        setTicketModalOpened(true);
                      }
                    }
                  }}
                >
                  {ticketId ? "Cancel Ticket" : "Buy Ticket"}
                </button>
                {cancelLotteryOption && (
                  <button
                    className="button button-red"
                    onClick={() => cancelLotteryMutation.mutate()} // Trigger the lottery cancellation
                  >
                    Cancel Lottery
                  </button>
                )}
              </Box>
            </Box>
            <LotteryClassicTicketPurchase
              opened={ticketModalOpened}
              setOpened={setTicketModalOpened}
              lotteryId={id}
              email={user?.email}
              ticketPrice={price}
              availableNumberRange={availableNumberRange}
              drawnNumbersCount={drawnNumbersCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotteryClassic;
