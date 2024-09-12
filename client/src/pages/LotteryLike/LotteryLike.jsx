import React, { useContext, useState } from "react";
import { useQuery, useMutation } from "react-query";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { getLotteryLike, CancelLotteryLike, getAllTicketsForLottery } from "../../utils/api";
import { PuffLoader } from "react-spinners";
import { Box, Card, CardContent, Typography, Collapse, IconButton } from "@mui/material";
import UserDetailContext from "../../context/UserDetailContext";
import ParticipantsModal from "../../components/participantsModal/participantsModal";
import { useAuth0 } from "@auth0/auth0-react";

import "./LotteryLike.css";

// Custom SVG icons to replace MUI icons
const ExpandMoreSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 16.5l-6-6h12z" />
  </svg>
);

const ExpandLessSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 7.5l6 6H6z" />
  </svg>
);

const LotteryLike = () => {
  const location = useLocation();
  const { state } = location;
  const ticketId = state?.ticketId;
  const ticketNumber = state?.ticketNumber;
  const ticketStatus = state?.ticketStatus;
  const cancelLotteryOption = state?.cancelLotteryOption;
  const navigate = useNavigate();

  // State to control expandable panels
  const id = location.pathname.split("/").pop();
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [participationExpanded, setParticipationExpanded] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [participantsModalOpened, setParticipantsModalOpened] = useState(false);
  const [prizesExpanded, setPrizesExpanded] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isCancelLotteryDisabled, setIsCancelLotteryDisabled] = useState(false);
  const [winnersExpanded, setWinnersExpanded] = useState(false);
  const [userPrizeExpanded, setUserPrizeExpanded] = useState(false); // State for user prize section

  const { setUserDetails } = useContext(UserDetailContext);
  const { user } = useAuth0();
  // Fetch lottery data with useQuery
  const { data, isLoading, isError } = useQuery(["LotteryLike", id], () => getLotteryLike(id), {
    refetchOnWindowFocus: false,
    staleTime: 5000,
    cacheTime: 10000,
  });

  // Mutation for canceling the lottery
  const cancelLotteryMutation = useMutation({
    mutationFn: () => CancelLotteryLike(id),
    onMutate: () => setIsCancelLotteryDisabled(true),
    onSuccess: (response) => {
      setUserDetails((prev) => ({
        ...prev,
      }));
      toast.success(response.data.message, { position: "bottom-right", autoClose: 3000 });
      setTimeout(() => navigate("/ownedlotteries"), 1000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message, { position: "bottom-right" });
      setIsCancelLotteryDisabled(false);
    },
    onSettled: () => {
      setIsCancelLotteryDisabled(true);
    },
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

  const { image, title, description, hosted, endDate, startDate, conditions, prizes, link, paticipationdescription, lotteryStatus, participantCount, winnersTickets } = data || {};

  const userWinning = winnersTickets?.find((winner) => {
    return winner.ticketId === ticketNumber;
  });

  if (isLoading) return <div className="flexCenter paddings"><PuffLoader /></div>;
  if (isError) return <div className="flexCenter paddings">Error while fetching lottery details</div>;

  return (
    <div className="wrapper">
      <div className="flexColStart paddings innerWidth lottery-container">
        {image && <img src={image} alt="Lottery" className="lottery-image" />}

        {/* Lottery Details Section */}
        <Card className="lottery-card">
          <CardContent>
            <Typography variant="h5" gutterBottom>{title}</Typography>
            <Typography color="textSecondary">Hosted by: {hosted}</Typography>
            <Typography color="textSecondary">Lottery Opens: {new Date(startDate).toLocaleDateString('en-GB')}</Typography>
            <Typography color="textSecondary">Draw Time: {new Date(endDate).toLocaleString('en-GB', { hour12: false })}</Typography>
          </CardContent>
        </Card>

        {/* Description Section with Expandable Panel */}
        <Card className="description-card">
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Description</Typography>
              <IconButton onClick={() => setDescriptionExpanded(!descriptionExpanded)}>
                {descriptionExpanded ? <ExpandLessSVG /> : <ExpandMoreSVG />}
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
                {participationExpanded ? <ExpandLessSVG /> : <ExpandMoreSVG />}
              </IconButton>
            </Box>
            <Collapse in={participationExpanded}>
              <Typography variant="body2">
                {conditions ? conditions.join(", ") : "No specific conditions provided."}
              </Typography>
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
                  {prizesExpanded ? <ExpandLessSVG /> : <ExpandMoreSVG />}
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

        {/* Link Section */}
        {link && (
          <Typography className="primary3Text" variant="body2">
            Link: <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
          </Typography>
        )}

        {/* Winners Section with Expandable Panel (Visible Only When Lottery is Closed) */}
        {lotteryStatus === "Closed" && (
          <Card className="winners-card">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Winners</Typography>
                <IconButton onClick={() => setWinnersExpanded(!winnersExpanded)}>
                  {winnersExpanded ? <ExpandLessSVG /> : <ExpandMoreSVG />}
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

        {lotteryStatus === "Open" && (
          <Typography className="primary3Text" variant="body2">
            To enter this draw, complete all conditions on the provided link, and you'll be automatically entered.
          </Typography>
        )}

        {/* User Prize Section (Only display if ticketStatus is "won") */}
        {ticketStatus === "Won" && userWinning && (
          <Card className="prize-card">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Congratulations! You Won:</Typography>
                <IconButton onClick={() => setUserPrizeExpanded(!userPrizeExpanded)}>
                  {userPrizeExpanded ? <ExpandLessSVG /> : <ExpandMoreSVG />}
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
            {lotteryStatus !== "Closed" && cancelLotteryOption ? (
              <button
                className="button button-red"
                onClick={() => cancelLotteryMutation.mutate()}
                disabled={isCancelLotteryDisabled}
              >
                Cancel Lottery
              </button>
            ) : (
              <button
                className="button button-blue"
                onClick={fetchAllParticipants}
                disabled={isButtonDisabled}
              >
                Show All Participants
              </button>
            )}
          </Box>
        </Box>

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

export default LotteryLike;
