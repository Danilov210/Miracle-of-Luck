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

  // Separate tickets by type
  const ticketsFundraising = tickets.filter(ticket => ticket.lotteryType === "Fundraising");
  const ticketsClassic = tickets.filter(ticket => ticket.lotteryType === "Classic");
  const ticketsLike = tickets.filter(ticket => ticket.lotteryType === "Like");

  // Function to handle navigation
  const handleTicketClick = (ticket) => {
    const state = {
      from: "/ownedtickets",
      ticketId: ticket.id,
      ticketNumbers: ticket.numbers || null // Pass ticketNumbers if they exist
    };
    navigate(`/ownedtickets/${ticket.lotteryType}/${ticket.lotteryId}`, { state });
  };


  return (
    <div className="wrapper">
      <div className="flexColCenter paddings innerWidth ticket-container">

        {/* Fundraising Tickets */}
        {ticketsFundraising.length > 0 && (
          <div className="ticket-section">
            <h3>Fundraising Tickets</h3>
            <div className="paddings flexCenter ticket">
              {ticketsFundraising.map((ticket, i) => (
                <div key={i} onClick={() => handleTicketClick(ticket)}>
                  <LotteryFundraisingCard card={ticket.lotteryFundraising} />
                  <div className="ticket-id">Ticket ID: {ticket.id}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Classic Tickets */}
        {ticketsClassic.length > 0 && (
          <div className="ticket-section">
            <h3>Classic Tickets</h3>
            <div className="paddings flexCenter ticket">
              {ticketsClassic.map((ticket, i) => (
                <div key={i} onClick={() => handleTicketClick(ticket)}>
                  <LotteryClassicCard card={ticket.lotteryClassic} />
                  <div className="ticket-id">Ticket ID: {ticket.id}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Like Tickets */}
        {ticketsLike.length > 0 && (
          <div className="ticket-section">
            <h3>Like Tickets</h3>
            <div className="paddings flexCenter ticket">
              {ticketsLike.map((ticket, i) => (
                <div key={i} onClick={() => handleTicketClick(ticket)}>
                  <LotteryLikeCard card={ticket.lotteryLike} />
                  <div className="ticket-id">Ticket ID: {ticket.id}</div>
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
