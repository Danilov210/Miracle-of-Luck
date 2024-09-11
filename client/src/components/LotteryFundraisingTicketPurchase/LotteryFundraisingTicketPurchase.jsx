import React, { useContext, useState } from "react";
import { Dialog, DialogTitle, DialogContent, Button, TextField, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { useMutation } from "react-query";
import UserDetailContext from "../../context/UserDetailContext.js";
import { BuyTicketFundraising } from "../../utils/api.js";

const LotteryClassicTicketPurchase = ({ opened, setOpened, lotteryId, email, ticketPrice }) => {
  const [ticketNumber, setTicketNumber] = useState(1); // Default ticket number
  const {
    userDetails: { token, balance },
    setUserDetails,
  } = useContext(UserDetailContext);

  // Calculate total price based on the number of tickets
  const totalPrice = ticketNumber * ticketPrice;

  const handleLotteryTicketPurchaseSuccess = () => {
    toast.success("You have purchased your ticket successfully", {
      position: "bottom-right",
    });

    setUserDetails((prev) => ({
      ...prev,
      balance: prev.balance - totalPrice, // Deduct the total price from user balance
      ticketPurchases: [
        ...(prev.ticketPurchases || []), // Ensure prev.ticketPurchases is an array
        {
          id: lotteryId,
          tickets: ticketNumber,
          totalPrice: totalPrice,
        },
      ],
    }));

    setTicketNumber(1); // Reset ticket number to 1 after purchase
  };

  // Mutation for booking tickets
  const { mutate, isLoading } = useMutation({
    mutationFn: () =>
      BuyTicketFundraising(
        {
          ticketNumber,
          lotteryId,
          email,
          totalPrice,
        },
        token
      ),
    onSuccess: () => handleLotteryTicketPurchaseSuccess(),
    onError: ({ response }) => toast.error(response.data.message),
    onSettled: () => setOpened(false),
  });

  const handleTicketNumberChange = (e) => {
    const value = Math.max(1, Math.min(10, parseInt(e.target.value) || 1)); // Limit between 1 and 10
    setTicketNumber(value);
  };

  return (
    <Dialog
      open={opened}
      onClose={() => setOpened(false)}
      aria-labelledby="dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="dialog-title" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Purchase Tickets
        {/* Close Button */}
        <IconButton onClick={() => setOpened(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <div className="flexColCenter" style={{ gap: "1rem", minWidth: "300px" }}>
          <Typography variant="h6">Your Balance: {balance} USD</Typography>
          <TextField
            label="Number of Tickets (Max 10 per purchase)"
            type="number"
            value={ticketNumber}
            onChange={handleTicketNumberChange}
            inputProps={{ min: 1, max: 10 }} // Limit the input to a minimum of 1 and a maximum of 10
            fullWidth
          />
          <Typography variant="h6">Total Price: {totalPrice} USD</Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "var(--blue)",
              fontWeight: 500,
              padding: "0.6rem 1.4rem",
              color: "white",
              borderRadius: "64px",
              transition: "all 300ms ease-in",
              "&:hover": {
                cursor: "pointer",
                transform: "scale(1.1)",
                backgroundColor: "var(--blue)", // Keep the same color on hover
              },
            }}
            disabled={isLoading || totalPrice > balance}
            onClick={() => mutate()}
          >
            Buy Tickets
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LotteryClassicTicketPurchase;