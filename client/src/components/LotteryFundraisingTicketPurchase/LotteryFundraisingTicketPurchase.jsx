import React, { useContext, useState } from "react";
import { Dialog, DialogTitle, DialogContent, Button, TextField, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import dayjs from "dayjs";
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
            label="Number of Tickets"
            type="number"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1 }}
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
