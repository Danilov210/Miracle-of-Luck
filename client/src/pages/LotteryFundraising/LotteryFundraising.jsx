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
import { Box, Card, CardContent, Typography, Collapse, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import UserDetailContext from "../../context/UserDetailContext";
import LotteryFundraisingTicketPurchase from "../../components/LotteryFundraisingTicketPurchase/LotteryFundraisingTicketPurchase";
import ParticipantsModal from "../../components/participantsModal/participantsModal";

const LotteryFundraising = () => {
  const location = useLocation();
  const { state } = location;
  const ticketNumber = state?.ticketNumber;
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

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [participationExpanded, setParticipationExpanded] = useState(false);
  const [prizesExpanded, setPrizesExpanded] = useState(false);
  const [winnersExpanded, setWinnersExpanded] = useState(false);
  const [ticketNumberExpanded, setTicketNumberExpanded] = useState(false); // State to control ticket number section
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isCancelLotteryDisabled, setIsCancelLotteryDisabled] = useState(false);

  const cancelTicketMutation = useMutation({
    mutationFn: () => CancelUserTicket(ticketNumber),
    onMutate: () => setIsButtonDisabled(true),
    onSuccess: (response) => {
      setUserDetails((prev) => ({
        ...prev,
        balance: response.data.balance,
      }));
      if (response?.data?.message) {
        toast.success(response.data.message, { position: "bottom-right", autoClose: 3000 });
        setTimeout(() => navigate("/ownedtickets"), 1000);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message, { position: "bottom-right" });
    },
    onSettled: () => {
      setTicketModalOpened(false);
      setIsButtonDisabled(false);
    },
  });

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

  const fetchAllParticipants = async () => {
    setIsButtonDisabled(true);
    try {
      const response = await getAllTicketsForLottery(id);
      setParticipants(response);
      setParticipantsModalOpened(true);
    } catch (error) {
      console.error("Error fetching participants:", error);
      toast.error("Failed to fetch participants", { position: "bottom-right" });
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const { title, description, hosted, startDate, endDate, price, prizes, image, paticipationdescription, lotteryStatus, participantCount, winnersTickets } = data || {};

  const formatTicketNumber = (ticketNumber) => {
    if (!ticketNumber) return null;
    const parts = ticketNumber.split("-");
    return parts.map((part, index) => (
      <span key={index}>
        {part}
        {index < parts.length - 1 ? "-" : ""}
        <br />
      </span>
    ));
  };

  if (isLoading) return <div className="wrapper flexCenter paddings"><PuffLoader /></div>;
  if (isError) return <div className="wrapper flexCenter paddings">Error while fetching the lottery details</div>;

  return (
    <div className="wrapper">
      <div className="flexColStart paddings innerWidth lottery-container">
        <AiFillHeart size={30} color="transparent" className="like" />
        {image && <img src={image} alt="Lottery Image" className="lottery-image" />}

        {/* Lottery Details Section */}
        <Card className="lottery-card">
          <CardContent>
            <Typography variant="h5" gutterBottom>{title}</Typography>
            <Typography color="textSecondary">Hosted by: {hosted}</Typography>
            <Typography color="textSecondary">Start Date: {new Date(startDate).toLocaleDateString()}</Typography>
            <Typography color="textSecondary">Draw Time: {new Date(endDate).toLocaleString()}</Typography>
            <Typography color="textSecondary">Price: ${price} USD</Typography>
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

        {/* Number of Participants Section */}
        {participantCount && (
          <Card className="participants-count-card">
            <CardContent>
              <Typography variant="h6">Number of Participants</Typography>
              <Typography variant="body1" style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '10px' }}>
                {participantCount}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* My Ticket Number Section with Expandable Panel */}
        {ticketNumber && (
          <Card className="ticket-number-card">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">My Ticket Number</Typography>
                <IconButton onClick={() => setTicketNumberExpanded(!ticketNumberExpanded)}>
                  {ticketNumberExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={ticketNumberExpanded}>
                <Typography variant="h5" color="secondary" style={{ fontWeight: 'bold', fontSize: '24px' }}>
                  {formatTicketNumber(ticketNumber)}
                </Typography>
              </Collapse>
            </CardContent>
          </Card>
        )}

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
        {lotteryStatus === "Closed" && winnersTickets?.length > 0 && (
          <Card className="winners-card">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Winners</Typography>
                <IconButton onClick={() => setWinnersExpanded(!winnersExpanded)}>
                  {winnersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={winnersExpanded}>
                {winnersTickets.map(({ ticketId, fullName, place }, idx) => (
                  <Typography key={idx}>
                    Place {place}: Winner - {fullName} (Ticket ID: {ticketId})
                  </Typography>
                ))}
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
                  className={ticketNumber ? "button button-red" : "button button-green"}
                  onClick={() => {
                    if (ticketNumber) {
                      cancelTicketMutation.mutate();
                    } else {
                      if (validateLogin()) setTicketModalOpened(true);
                    }
                  }}
                  disabled={isButtonDisabled}
                >
                  {ticketNumber ? "Cancel Ticket" : "Buy Ticket"}
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

        {/* Modals */}
        <LotteryFundraisingTicketPurchase opened={ticketModalOpened} setOpened={setTicketModalOpened} lotteryId={id} email={user?.email} ticketPrice={price} />
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
