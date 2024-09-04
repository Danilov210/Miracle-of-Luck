import React, { useState } from "react";
import { useQuery } from "react-query";
import { Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {  getLotteryFundraising } from "../../utils/api";
import { PuffLoader } from "react-spinners";
import { AiFillHeart } from "react-icons/ai";
import "./LotteryFundraising.css";
import useAuthCheck from "../../hooks/useAuthCheck";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom"; // Import useLocation to access the state
import LotteryClassicTicketPurchase from "../../components/LotteryFundraisingTicketPurchase/LotteryFundraisingTicketPurchase";

const LotteryFundraising = () => {
  const location = useLocation(); // Get the current location
  const { state } = location; // Extract state from location
  const ticketId = state?.ticketId; // Get ticketId if available from state
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const handleCloseSnackbar = () => setSnackbarOpen(false);
  const navigate = useNavigate();

  const id = location.pathname.split("/").pop();
  const { data, isLoading, isError } = useQuery(["lotteryfundraising", id], () => getLotteryFundraising(id));
  const [ticketModalOpened, setTicketModalOpened] = useState(false);
  const { validateLogin } = useAuthCheck();
  const { user } = useAuth0();

  if (isLoading) return <div className="wrapper flexCenter paddings"><PuffLoader /></div>;
  if (isError) return <div className="wrapper flexCenter paddings">Error while fetching the lottery details</div>;

  const { title, description, hosted, startDate, price, prizes, image, paticipationdescription, link } = data;

  const showMessage = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleTicketCancel = async () => {
    try {
      const response = await CancelUserTicket(ticketId);

      if (response?.data?.message) {
        showMessage(response.data.message, "success");
        navigate("/ownedtickets");
      } else {
        throw new Error("Unexpected response format from the server.");
      }
    } catch (error) {
      showMessage(` ${error.response?.data?.message || error.message}`, "error");
      console.error("Error creating lotteryLike:", error);
    }
  };

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
          <button
            className={`button ${ticketId ? 'button-red' : 'button-green'}`} // Dynamically set button color
            onClick={() => {
              if (ticketId) {
                handleTicketCancel();
              } else {
                if (validateLogin()) {
                  setTicketModalOpened(true);
                }
              }
            }}
          >
            {ticketId ? "Cancel Ticket" : "Buy Ticket"}
          </button>
          <LotteryClassicTicketPurchase opened={ticketModalOpened} setOpened={setTicketModalOpened} lotteryId={id} email={user?.email} ticketPrice={price} />
          <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </div>
      </div>
    </div>
  );
};

export default LotteryFundraising;
