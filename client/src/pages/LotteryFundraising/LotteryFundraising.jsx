import React, { useContext, useState } from "react";
import { useQuery, useMutation } from "react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CancelUserTicket, CancelLottery, getLotteryFundraising, getAllTicketsForLottery } from "../../utils/api";
import { PuffLoader } from "react-spinners";
import "./LotteryFundraising.css";
import useAuthCheck from "../../hooks/useAuthCheck";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import { Box, Card, CardContent, Typography, Collapse, IconButton, TextField } from "@mui/material";
import UserDetailContext from "../../context/UserDetailContext";
import LotteryFundraisingTicketPurchase from "../../components/LotteryFundraisingTicketPurchase/LotteryFundraisingTicketPurchase";
import ParticipantsModal from "../../components/participantsModal/participantsModal";

// SVG Icons (Replacements for MUI Icons)
const ExpandMoreIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 16.5l-8-8 1.41-1.41L12 13.67l6.59-6.58L20 8.5z" />
  </svg>
);

const ExpandLessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
  </svg>
);

const LotteryFundraising = () => {
  const location = useLocation();
  const { state } = location;
  const ticketId = state?.ticketId;
  const ticketNumber = state?.ticketNumber;
  const ticketStatus = state?.ticketStatus;
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

  // State for managing button disabled status
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isCancelLotteryDisabled, setIsCancelLotteryDisabled] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [participationExpanded, setParticipationExpanded] = useState(false);
  const [prizesExpanded, setPrizesExpanded] = useState(false);
  const [winnersExpanded, setWinnersExpanded] = useState(false);
  const [userPrizeExpanded, setUserPrizeExpanded] = useState(false); // State for user prize section

  // Mutation to handle ticket cancellation
  const cancelTicketMutation = useMutation({
    mutationFn: () => CancelUserTicket(ticketId,user?.email),
    onMutate: () => setIsButtonDisabled(true),
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
        setTimeout(() => navigate("/ownedtickets"), 1000);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message, { position: "bottom-right" });
    },
    onSettled: () => {
      setIsButtonDisabled(false);
      setTicketModalOpened(false);
    },
  });

  // Mutation to handle lottery cancellation
  const cancelLotteryMutation = useMutation({
    mutationFn: () => CancelLottery(user?.email, id, "Fundraising"),
    onMutate: () => setIsCancelLotteryDisabled(true),
    onSuccess: (response) => {
      setUserDetails((prev) => ({
        ...prev,
        balance: response.data.balance,
      }));

      if (response?.data?.message) {
        toast.success(response.data.message, { position: "bottom-right", autoClose: 3000 });
        setTimeout(() => navigate("/ownedlotteries"), 1000);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message, { position: "bottom-right" });
      setIsCancelLotteryDisabled(false);
    },
    onSettled: () => setIsCancelLotteryDisabled(true),
  });

  // Fetch all participants for the lottery
  const fetchAllParticipants = async () => {
    setIsButtonDisabled(true);
    try {
      const response = await getAllTicketsForLottery(id);
      if (response.length === 0) {
        // No participants found
        toast.info("No participants found", { position: "bottom-right" });
      } else {
        // Participants found, open modal
        setParticipants(response);
        setParticipantsModalOpened(true);
      }
    } catch (error) {
      toast.error("Failed to fetch participants", { position: "bottom-right" });
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const { title, description, hosted, startDate, endDate, price, prizes, image, paticipationdescription, lotteryStatus, participantCount, winnersTickets } = data || {};

  const userWinning = winnersTickets?.find((winner) => {
    return winner.ticketId === ticketNumber;
  });

  if (isLoading) return <div className="wrapper flexCenter paddings"><PuffLoader /></div>;
  if (isError) return <div className="wrapper flexCenter paddings">Error while fetching the lottery details</div>;

  return (
    <div className="wrapper">
      <div className="flexColStart paddings innerWidth lottery-container">
        {image && <img src={image} alt="Lottery Image" className="lottery-image" />}

        {/* Lottery Details Section */}
        <Card className="lottery-card">
          <CardContent>
            <Typography variant="h5" gutterBottom>{title}</Typography>
            <Typography color="textSecondary">Hosted by: {hosted}</Typography>
            <Typography color="textSecondary">Lottery Opens: {new Date(startDate).toLocaleDateString('en-GB')}</Typography>
            <Typography color="textSecondary">Draw Time: {new Date(endDate).toLocaleString('en-GB', { hour12: false })}</Typography>
            <Typography color="textSecondary">Price per Ticket: ${price} USD</Typography>
          </CardContent>
        </Card>

        {/* Description Section with Expandable Panel */}
        <Card className="description-card">
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Description</Typography>
              <IconButton onClick={() => setDescriptionExpanded(!descriptionExpanded)}>
                {descriptionExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={descriptionExpanded}>
              <Typography variant="body2">{description}</Typography>
            </Collapse>
          </CardContent>
        </Card>

        {/* Participation Section with Expandable Panel */}
        <Card className="participation-card">
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Participation Details</Typography>
              <IconButton onClick={() => setParticipationExpanded(!participationExpanded)}>
                {participationExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={participationExpanded}>
              <Typography variant="body2">{paticipationdescription}</Typography>
            </Collapse>
          </CardContent>
        </Card>

        {/* Prizes Section with Expandable Panel */}
        {prizes?.length > 0 && (
          <Card className="prizes-card">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Prizes</Typography>
                <IconButton onClick={() => setPrizesExpanded(!prizesExpanded)}>
                  {prizesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={prizesExpanded}>
                {prizes.map(({ place, description, icon }, idx) => (
                  <Typography key={idx}>
                    Place {place}: {description} ({icon})
                  </Typography>
                ))}
              </Collapse>
            </CardContent>
          </Card>
        )}

        {/* Winners Section with Expandable Panel (Visible Only When Lottery is Closed) */}
        {lotteryStatus === "Closed" && (
          <Card className="winners-card">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Winners</Typography>
                <IconButton onClick={() => setWinnersExpanded(!winnersExpanded)}>
                  {winnersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={winnersExpanded}>
                {winnersTickets?.length > 0 ? (
                  winnersTickets.map(({ ticketId, fullName, place, email }, idx) => (
                    <Typography key={idx}>
                      Place {place}: Winner - {fullName}{" "}
                      {cancelLotteryOption ? `(Email: ${email})` : `(Ticket ID: ${ticketId})`}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No winners were determined for this lottery.
                  </Typography>
                )}
              </Collapse>
            </CardContent>
          </Card>
        )}

        {/* Number of Participants Section */}
        {lotteryStatus === "Closed" && (
          participantCount ? (
            <Card className="participants-count-card">
              <CardContent>
                <Typography variant="h6">Number of Participants:</Typography>
                <Typography
                  variant="body1"
                  style={{ fontSize: "18px", fontWeight: "bold", marginTop: "10px" }}
                >
                  {participantCount}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Card className="participants-count-card">
              <CardContent>
                <Typography variant="h6">Number of Participants:</Typography>
                <Typography
                  variant="body1"
                  style={{ fontSize: "18px", fontWeight: "bold", marginTop: "10px" }}
                >
                  No participants
                </Typography>
              </CardContent>
            </Card>
          )
        )}

        {/* User Prize Section (Only display if ticketStatus is "won") */}
        {ticketStatus === "Won" && userWinning && (
          <Card className="prize-card">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Congratulations! You Won:</Typography>
                <IconButton onClick={() => setUserPrizeExpanded(!userPrizeExpanded)}>
                  {userPrizeExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={userPrizeExpanded}>
                <Typography variant="body1" style={{ fontWeight: 'bold', marginTop: '10px' }}>
                  Place: {userWinning.place}
                </Typography>
                <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                  Prize: {prizes.find((prize) => prize.place === userWinning?.place)?.description} ({prizes.find((prize) => prize.place === userWinning?.place)?.icon})
                </Typography>
              </Collapse>
            </CardContent>
          </Card>
        )}

        {/* Actions Section */}
        <Box className="flexColCenter NavBut">
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mt: 2 }}>
            {lotteryStatus !== "Closed" ? (
              <>
                <button
                  className={ticketId ? "button button-red" : "button button-green"}
                  onClick={() => {
                    if (ticketId) {
                      cancelTicketMutation.mutate();
                    } else {
                      if (validateLogin()) setTicketModalOpened(true);
                    }
                  }}
                  disabled={isButtonDisabled}
                >
                  {ticketId ? "Cancel Ticket" : "Buy Ticket"}
                </button>
                {cancelLotteryOption && (
                  <button
                    className="button button-red"
                    onClick={() => cancelLotteryMutation.mutate()}
                    disabled={isCancelLotteryDisabled}
                  >
                    Cancel Lottery
                  </button>
                )}
              </>
            ) : (
              <button className="button button-blue" onClick={fetchAllParticipants} disabled={isButtonDisabled}>
                Show All Participants
              </button>
            )}
          </Box>
        </Box>

        {/* Ticket Purchase Modal */}
        <LotteryFundraisingTicketPurchase
          opened={ticketModalOpened}
          setOpened={setTicketModalOpened}
          lotteryId={id}
          email={user?.email}
          ticketPrice={price}
        />
        {participantsModalOpened && (
          <ParticipantsModal
            opened={participantsModalOpened}
            setOpened={setParticipantsModalOpened}
            participants={participants}
          />
        )}
      </div>
    </div>
  );
};

export default LotteryFundraising;
