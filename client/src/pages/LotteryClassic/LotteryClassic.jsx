import React, { useContext, useState } from "react";
import { useQuery, useMutation } from "react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CancelUserTicket, CancelLottery, getLotteryClassic } from "../../utils/api";
import { PuffLoader } from "react-spinners";
import "./LotteryClassic.css";
import useAuthCheck from "../../hooks/useAuthCheck";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import { Box, Card, CardContent, Typography, Collapse, IconButton } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import UserDetailContext from "../../context/UserDetailContext";
import LotteryClassicTicketPurchase from "../../components/LotteryClassicTicketPurchase/LotteryClassicTicketPurchase";

const LotteryClassic = () => {
  const location = useLocation();
  const { state } = location;
  const ticketId = state?.ticketId;
  const ticketNumbers = state?.ticketNumbers;
  const cancelLotteryOption = state?.cancelLotteryOption;
  const navigate = useNavigate();

  const id = location.pathname.split("/").pop();
  const { data, isLoading, isError } = useQuery(["lotteryclassic", id], () => getLotteryClassic(id));
  const [ticketModalOpened, setTicketModalOpened] = useState(false);
  const { validateLogin } = useAuthCheck();
  const { user } = useAuth0();
  const { setUserDetails } = useContext(UserDetailContext);

  // State for managing button disabled status
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isCancelLotteryDisabled, setIsCancelLotteryDisabled] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [participationExpanded, setParticipationExpanded] = useState(false);
  const [prizesExpanded, setPrizesExpanded] = useState(false);

  // Mutation to handle ticket cancellation
  const cancelTicketMutation = useMutation({
    mutationFn: () => CancelUserTicket(ticketId),
    onMutate: () => setIsButtonDisabled(true),
    onSuccess: (response) => {
      setUserDetails((prev) => {
        const previousDetails = prev && typeof prev === 'object' && prev !== null ? prev : {};
        return {
          ...previousDetails, 
          balance: response.data.balance,
        };
      });

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
    onSettled: () => {
      setIsButtonDisabled(false);
      setTicketModalOpened(false);
    },
  });

  // Mutation to handle lottery cancellation
  const cancelLotteryMutation = useMutation({
    mutationFn: () => CancelLottery(user?.email, id, "Classic"),
    onMutate: () => setIsCancelLotteryDisabled(true),
    onSuccess: (response) => {
      setUserDetails((prev) => {
        const previousDetails = prev && typeof prev === 'object' && prev !== null ? prev : {};
        return {
          ...previousDetails,
          balance: response.data.balance,
        };
      });

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
      setIsCancelLotteryDisabled(false);
    },
    onSettled: () => setIsCancelLotteryDisabled(true),
  });

  const { image, title, description, hosted, startDate, endDate, availableNumberRange, drawnNumbersCount, price, prizes, paticipationdescription } = data || {};

  // Convert availableNumberRange to an array of numbers if it is a string
  let numberRange = [];
  if (typeof availableNumberRange === "string") {
    numberRange = availableNumberRange.split(",").map(num => parseInt(num.trim(), 10)).filter(num => !isNaN(num));
  } else if (Array.isArray(availableNumberRange)) {
    numberRange = availableNumberRange.filter(num => typeof num === "number" && !isNaN(num));
  }

  // Format the number range for display in "Range is: 1-NumberRange" format
  const formattedNumberRange = numberRange.length > 0 
    ? `Range is: 1-${Math.max(...numberRange)}`
    : "Range is: Not Available";  // Provide a fallback message if the range is not available

  if (isLoading) return <div className="wrapper flexCenter paddings"><PuffLoader /></div>;
  if (isError) return <div className="wrapper flexCenter paddings">Error while fetching the lottery classic details</div>;

  return (
    <div className="wrapper">
      <div className="flexColStart paddings innerWidth lottery-container">
        {image && <img src={image} alt="Lottery Image" className="lottery-image" />}

        {/* Lottery Details Section */}
        <Card className="lottery-card">
          <CardContent>
            <Typography variant="h5" gutterBottom>{title}</Typography>
            <Typography color="textSecondary">Hosted by: {hosted}</Typography>
            {startDate && (
              <Typography color="textSecondary">
                Start Date: {new Date(startDate).toLocaleDateString()}
              </Typography>
            )}
            <Typography color="textSecondary">
              Draw Time: {new Date(endDate).toLocaleString()}
            </Typography>
            <Typography color="textSecondary">
              Price: ${price} USD
            </Typography>
            <Typography color="textSecondary">
              Number Range: 1-{availableNumberRange}
            </Typography>
            <Typography color="textSecondary">
              Numbers to Draw: {drawnNumbersCount}
            </Typography>
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
                {prizes.map(({ place, amount }, idx) => (
                  <Typography key={idx}>
                    Place {place}: {amount} USD
                  </Typography>
                ))}
              </Collapse>
            </CardContent>
          </Card>
        )}

        {/* Actions Section */}
        <Box className="flexColCenter NavBut">
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mt: 2 }}>
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
          </Box>
        </Box>

        {/* Ticket Purchase Modal */}
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
  );
};

export default LotteryClassic;


