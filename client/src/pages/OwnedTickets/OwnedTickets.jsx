import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { PuffLoader } from "react-spinners";
import { getAllUserLotteries } from "../../utils/api";
import LotteryFundraisingCard from "../../components/LotteryFundraisingCard/LotteryFundraisingCard";
import LotteryClassicCard from "../../components/LotteryClassicCard/LotteryClassicCard";
import LotteryLikeCard from "../../components/LotteryLikeCard/LotteryLikeCard";
import { useNavigate } from "react-router-dom";
import "./OwnedTickets.css";

const OwnedTickets = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Active");

  useEffect(() => {
    const fetchOwnedTickets = async () => {
      try {
        if (user?.email) {
          const response = await getAllUserLotteries({ email: user.email });
          setTickets(response.data);
        }
      } catch (error) {
        console.error("Error fetching user's tickets:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwnedTickets();
  }, [user?.email]);

  if (isError) {
    return (
      <div className="wrapper">
        <span>Error while fetching data</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="wrapper flexCenter" style={{ height: "60vh" }}>
        <PuffLoader color="#4066ff" size={80} aria-label="Loading Spinner" />
      </div>
    );
  }

  const filterTickets = (tickets, status) => {
    return tickets.filter((ticket) => {
      if (status === "Active") return ticket.status === "Active";
      if (status === "Ended") return ticket.status === "Ended";
      if (status === "Won") return ticket.status === "Won";
      return true;
    });
  };

  const ticketsFundraising = filterTickets(tickets, statusFilter).filter(
    (ticket) => ticket.lotteryType === "Fundraising"
  );
  const ticketsClassic = filterTickets(tickets, statusFilter).filter(
    (ticket) => ticket.lotteryType === "Classic"
  );
  const ticketsLike = filterTickets(tickets, statusFilter).filter(
    (ticket) => ticket.lotteryType === "Like"
  );

  const handleTicketClick = (ticket) => {
    const state = {
      from: "/ownedtickets",
      ticketNumber: ticket.ticketNumber, 
      ticketId: ticket.id,
      ticketNumbers: ticket.numbers || null,
    };
    navigate(`/ownedtickets/${ticket.lotteryType}/${ticket.lotteryId}`, { state });
  };

  const noTickets =
    ticketsFundraising.length === 0 &&
    ticketsClassic.length === 0 &&
    ticketsLike.length === 0;

  // Function to format the ticket number into multiple lines
  const formatTicketNumber = (ticketNumber) => {
    const parts = ticketNumber.split("-");
    if (parts.length === 0) return ticketNumber;
    return (
      <>
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 ? "-" : ""}
            <br />
          </span>
        ))}
      </>
    );
  };

  return (
    <div className="wrapper">
      <div className="flexColCenter paddings innerWidth ticket-container">
        <div className="ticket-filter">
          <button
            className={`filter-button ${statusFilter === "Active" ? "active" : ""}`}
            onClick={() => setStatusFilter("Active")}
          >
            Active Tickets
          </button>
          <button
            className={`filter-button ${statusFilter === "Ended" ? "active" : ""}`}
            onClick={() => setStatusFilter("Ended")}
          >
            Ended Tickets
          </button>
          <button
            className={`filter-button ${statusFilter === "Won" ? "active" : ""}`}
            onClick={() => setStatusFilter("Won")}
          >
            Won Tickets
          </button>
        </div>

        {noTickets && (
          <div className="no-tickets-message">
            <h3>You have not purchased any tickets yet.</h3>
          </div>
        )}

        {ticketsFundraising.length > 0 && (
          <div className="ticket-section">
            <h3>Fundraising Tickets</h3>
            <div className="paddings flexCenter ticket">
              {ticketsFundraising.map((ticket, i) => (
                <div key={i} onClick={() => handleTicketClick(ticket)}>
                  <LotteryFundraisingCard card={ticket.lotteryFundraising} />
                  <div className="ticket-number">
                    {formatTicketNumber(ticket.ticketNumber)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {ticketsClassic.length > 0 && (
          <div className="ticket-section">
            <h3>Classic Tickets</h3>
            <div className="paddings flexCenter ticket">
              {ticketsClassic.map((ticket, i) => (
                <div key={i} onClick={() => handleTicketClick(ticket)}>
                  <LotteryClassicCard card={ticket.lotteryClassic} />
                  <div className="ticket-number">
                    {formatTicketNumber(ticket.ticketNumber)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {ticketsLike.length > 0 && (
          <div className="ticket-section">
            <h3>Like Tickets</h3>
            <div className="paddings flexCenter ticket">
              {ticketsLike.map((ticket, i) => (
                <div key={i} onClick={() => handleTicketClick(ticket)}>
                  <LotteryLikeCard card={ticket.lotteryLike} />
                  <div className="ticket-number">
                    {formatTicketNumber(ticket.ticketNumber)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnedTickets;
