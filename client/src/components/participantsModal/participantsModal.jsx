

import React from 'react';
import { Modal, Box } from '@mui/material';
import './participantsModal.css';

const ParticipantsModal = ({ opened, setOpened, participants }) => {
  return (
    <Modal
      open={opened}
      onClose={() => setOpened(false)}
      aria-labelledby="tickets-modal-title"
      aria-describedby="tickets-modal-description"
    >
      <Box className="modal-content">
        <h2 id="tickets-modal-title">All Participants</h2>
        {participants.length > 0 ? (
          participants.map((ticket, index) => (
            <div key={index} className="ticket-item">
              <p>Ticket ID: {ticket.ticketNumber}</p>
              <p>Full Name: {ticket.user.fullName || `${ticket.user.firstName} ${ticket.user.lastName}`}</p>
            </div>
          ))
        ) : (
          <p>No participants found.</p>
        )}
      </Box>
    </Modal>
  );
};

export default ParticipantsModal;
