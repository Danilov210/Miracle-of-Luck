import React, { useState } from "react";
import { useQuery } from "react-query";
import { Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { CancelUserTicket, getLotteryClassic } from "../../utils/api";
import { AiFillHeart } from "react-icons/ai";
import { PuffLoader } from "react-spinners";
import "./LotteryClassic.css";
import useAuthCheck from "../../hooks/useAuthCheck";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom"; // Import useLocation to access the state
import LotteryClassicTicketPurchase from "../../components/LotteryClassicTicketPurchase/LotteryClassicTicketPurchase"; // Ensure correct import path and component name

const LotteryClassic = () => {
    const location = useLocation(); // Get the current location
    const { state } = location; // Extract state from location
    const ticketId = state?.ticketId; // Get ticketId if available from state
    const ticketNumbers = state?.ticketNumbers; // Get ticket numbers if available from state

    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = () => setSnackbarOpen(false);
    const navigate = useNavigate();

    const id = useLocation().pathname.split("/").pop();
    const { data, isLoading, isError } = useQuery(["lotteryclassic", id], () => getLotteryClassic(id));
    const [ticketmodalOpened, setTicketModalOpened] = useState(false);
    const { validateLogin } = useAuthCheck();
    const { user } = useAuth0();

    if (isLoading) return <div className="wrapper flexCenter paddings"><PuffLoader /></div>;
    if (isError) return <div className="wrapper flexCenter paddings">Error while fetching the lottery classic details</div>;

    const { image, title, description, hosted, endDate, availableNumberRange, drawnNumbersCount, price, prizes, paticipationdescription } = data || {};

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
                {image && <img src={image} alt="Lottery Image" className="lottery-image" />}
                <div className="flexColStart lottery-details">
                    <div className="flexColStart head">
                        {/* Conditionally render the ticket ID if it exists */}
                        {ticketId && (
                            <span className="primaryText">Ticket ID: <span className="IDNumber">{ticketId}</span></span>
                        )}
                        {/* Conditionally render the ticket numbers if they exist */}
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
                        <LotteryClassicTicketPurchase opened={ticketmodalOpened} setOpened={setTicketModalOpened} lotteryId={id} email={user?.email} ticketPrice={price} availableNumberRange={availableNumberRange} drawnNumbersCount={drawnNumbersCount} />
                        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                            <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                                {snackbarMessage}
                            </Alert>
                        </Snackbar>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LotteryClassic;
