import React, { useContext, useState } from "react";
import { useQuery, useMutation } from "react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CancelUserTicket, getLotteryFundraising, CancelLottery, getAllTicketsForLottery } from "../../utils/api";
import { PuffLoader } from "react-spinners";
import { AiFillHeart } from "react-icons/ai";
import "./LotteryFundraising.css";
import useAuthCheck from "../../hooks/useAuthCheck";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import UserDetailContext from "../../context/UserDetailContext";
import LotteryClassicTicketPurchase from "../../components/LotteryFundraisingTicketPurchase/LotteryFundraisingTicketPurchase";
import ParticipantsModal from "../../components/participantsModal/participantsModal";

const LotteryFundraising = () => {
  const location = useLocation();
  const { state } = location;
  const ticketId = state?.ticketId;
  const cancelLotteryOption = state?.cancelLotteryOption;
  const navigate = useNavigate();

  const id = location.pathname.split("/").pop();
  const { data, isLoading, isError } = useQuery(["lotteryfundraising", id], () => getLotteryFundraising(id));
  const [ticketModalOpened, setTicketModalOpened] = useState(false);
  const [participantsModalOpened, setParticipantsModalOpened] = useState(false);
  const [participants, setParticipants] = useState([]);
  const { validateLogin } = useAuthCheck();
  const { user } = useAuth0();
  const { setUserDetails } = useContext(UserDetailContext);

  const cancelTicketMutation = useMutation({
    mutationFn: () => CancelUserTicket(ticketId),
    onSuccess: (response) => {
      setUserDetails((prev) => ({
        ...prev,
        balance: response.data.balance,
      }));
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

  const cancelLotteryMutation = useMutation({
    mutationFn: () => CancelLottery(user?.email, id, "Fundraising"),
    onSuccess: (response) => {
      setUserDetails((prev) => ({
        ...prev,
        balance: response.data.balance,
      }));

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

  const fetchAllParticipants = async () => {
    try {
      const response = await getAllTicketsForLottery(id);
      setParticipants(response);
      setParticipantsModalOpened(true);
    } catch (error) {
      console.error("Error fetching participants:", error);
      toast.error("Failed to fetch participants", {
        position: "bottom-right",
      });
    }
  };

  const { title, description, hosted, startDate,endDate, price, prizes, image, paticipationdescription, lotteryStatus, participantCount, winnersTickets } = data || {};

  if (isLoading) return <div className="wrapper flexCenter paddings"><PuffLoader /></div>;

  if (isError) return <div className="wrapper flexCenter paddings">Error while fetching the lottery details</div>;

  return (
    <div className="wrapper">
      <div className="flexColStart paddings innerWidth lottery-container">
        <AiFillHeart size={30} color="transparent" className="like" />
        {image && <img src={image} alt="Lottery Image" className="lottery-image" />}
        <div className="flexColStart lottery-details head">
          {ticketId && (
            <span className="primaryText">Ticket ID: <span className="IDNumber">{ticketId}</span></span>
          )}
          {[
            { label: "Title", value: title },
            { label: "Description", value: description },
            { label: "Hosted By", value: hosted },
          ].map(({ label, value }, idx) => value && (
            <span key={idx} className="primaryText">{label}: <span className="primary2Text">{value}</span></span>
          ))}
          {/* Start Date Field between Hosted By and Draw Time */}
          {startDate && (
            <span className="primaryText">
              Start Date: <span className="primary2Text">{new Date(startDate).toLocaleDateString()}</span>
            </span>
          )}
          {[
            { label: "Lottery Draw Time", value: endDate && new Date(endDate).toLocaleString() },
            { label: "Participation", value: paticipationdescription },
            { label: "Price", value: `${price} USD` },
          ].map(({ label, value }, idx) => value && (
            <span key={idx} className="primaryText">{label}: <span className="primary2Text">{value}</span></span>
          ))}
          {prizes?.length > 0 && (
            <>
              <span className="primaryText">Prizes:</span>
              {prizes.map(({ place, description, icon }, idx) => {
                const winner = winnersTickets?.find((winner) => winner.place === place);
                return (
                  <div key={idx} className="primary2Text">
                    <span className="placeNumber">Place {place}</span>: {description} ({icon}) 
                    {winner && <span className="primaryTextYellow"> - Winner: Ticket ID {winner.ticketId} (Full Name: {winner.fullName})</span>}
                  </div>
                );
              })}
            </>
          )}
          {participantCount && (
            <div className="primaryText">
              Number of Participants: <span className="primary2Text">{participantCount}</span>
            </div>
          )}
          <Box className="flexColCenter NavBut">
            {lotteryStatus !== "Closed" ? (
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
                    onClick={() => {
                      if (cancelLotteryOption) {
                        cancelLotteryMutation.mutate();
                      }
                    }}
                  >
                    Cancel Lottery
                  </button>
                )}
              </Box>
            ) : (
              <button className="button button-green" onClick={fetchAllParticipants}>
                Show All Participants
              </button>
            )}
          </Box>
          <LotteryClassicTicketPurchase opened={ticketModalOpened} setOpened={setTicketModalOpened} lotteryId={id} email={user?.email} ticketPrice={price} />
        </div>
      </div>
      {participantsModalOpened && (
        <ParticipantsModal 
          opened={participantsModalOpened} 
          setOpened={setParticipantsModalOpened} 
          participants={participants} 
        />
      )}
    </div>
  );
};

export default LotteryFundraising;
