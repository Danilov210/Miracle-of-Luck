import React, { useState } from "react";
import { useQuery, useMutation } from "react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CancelUserTicket, getLotteryFundraising, CancelLottery } from "../../utils/api"; // Import CancelLottery API
import { PuffLoader } from "react-spinners";
import { AiFillHeart } from "react-icons/ai";
import "./LotteryFundraising.css";
import useAuthCheck from "../../hooks/useAuthCheck";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import { Box } from "@mui/material";

import LotteryClassicTicketPurchase from "../../components/LotteryFundraisingTicketPurchase/LotteryFundraisingTicketPurchase";

const LotteryFundraising = () => {
  const location = useLocation();
  const { state } = location;
  const ticketId = state?.ticketId;
  const cancelLotteryOption = state?.cancelLotteryOption; // Check if cancelLotteryOption exists
  const navigate = useNavigate();

  const id = location.pathname.split("/").pop();
  const { data, isLoading, isError } = useQuery(["lotteryfundraising", id], () => getLotteryFundraising(id));
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
    mutationFn: () => CancelLottery(id, "Fundraising"), // Pass lotteryId and "Fundraising" as parameters
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

  const { title, description, hosted, startDate, price, prizes, image, paticipationdescription, link } = data || {};

  // Show loading spinner while data is loading
  if (isLoading) return <div className="wrapper flexCenter paddings"><PuffLoader /></div>;

  // Show error message if there is an error fetching data
  if (isError) return <div className="wrapper flexCenter paddings">Error while fetching the lottery details</div>;

  return (
    <div className="wrapper">
      <div className="flexColStart paddings innerWidth lottery-container">
        <AiFillHeart size={30} color="transparent" className="like" />
        {image && <img src={image} alt="Lottery Image" className="lottery-image" />}
        <div className="flexColStart lottery-details head">
          {/* Conditionally render the ticket ID if it exists */}
          {ticketId && (
            <span className="primaryText">Ticket ID: <span className="IDNumber">{ticketId}</span></span>
          )}
          {[{ label: "Title", value: title }, { label: "Description", value: description }, { label: "Hosted By", value: hosted }, { label: "Lottery Draw Time", value: startDate && new Date(startDate).toLocaleString() }, { label: "Participation", value: paticipationdescription }, { label: "Price", value: `${price} USD` }].map(({ label, value }, idx) => value && <span key={idx} className="primaryText">{label}: <span className="primary2Text">{value}</span></span>)}
          {prizes?.length > 0 && (
            <>
              <span className="primaryText">Prizes:</span>
              {prizes.map(({ place, description, icon }, idx) => (
                <div key={idx} className="primary2Text">
                  <span className="placeNumber">Place {place}</span>: {description} ({icon})
                </div>
              ))}
            </>
          )}
          {link && <span className="primaryText">Link: <a href={link} target="_blank" rel="noopener noreferrer" className="primary2Text">{link}</a></span>}
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
              {/* Conditionally render the cancel lottery button if cancelLotteryOption exists */}
              {cancelLotteryOption && (
                <button
                  className="button button-red"
                  onClick={() => {
                    if (cancelLotteryOption) {
                      cancelLotteryMutation.mutate(); // Trigger lottery cancellation
                    }
                  }}
                >
                  Cancel Lottery
                </button>
              )}
            </Box>
          </Box>
          <LotteryClassicTicketPurchase opened={ticketModalOpened} setOpened={setTicketModalOpened} lotteryId={id} email={user?.email} ticketPrice={price} />
        </div>
      </div>
    </div>
  );
};

export default LotteryFundraising;
