import React, { useContext, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  IconButton,
  Grid,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { useMutation } from "react-query";
import UserDetailContext from "../../context/UserDetailContext.js";
import { BuyTicketClassic } from "../../utils/api.js";

const LotteryClassicTicketPurchase = ({
  opened,
  setOpened,
  lotteryId,
  email,
  ticketPrice,
  availableNumberRange,
  drawnNumbersCount,
}) => {
  const [selectedNumbers, setSelectedNumbers] = useState([]); // To track selected numbers
  const {
    userDetails: { token, balance },
    setUserDetails,
  } = useContext(UserDetailContext);

  const handleNumberClick = (number) => {
    setSelectedNumbers((prev) =>
      prev.includes(number)
        ? prev.filter((n) => n !== number) // Remove if already selected
        : prev.length < drawnNumbersCount // Only add if limit is not reached
        ? [...prev, number]
        : prev // Otherwise, do nothing
    );
  };

  const handleLotteryTicketPurchaseSuccess = () => {
    toast.success("You have purchased your ticket successfully", {
      position: "bottom-right",
    });

    setUserDetails((prev) => ({
      ...prev,
      balance: prev.balance - ticketPrice,
      ticketPurchases: [
        ...(prev.ticketPurchases || []),
        {
          id: lotteryId,
          selectedNumbers,
          totalPrice: ticketPrice,
        },
      ],
    }));

    // Reset selected numbers after successful purchase
    setSelectedNumbers([]);
  };

  const { mutate, isLoading } = useMutation({
    mutationFn: () =>
      BuyTicketClassic(
        {
          selectedNumbers,
          lotteryId,
          email,
          totalPrice: ticketPrice,
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
      <DialogTitle
        id="dialog-title"
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        Purchase Ticket
        <IconButton onClick={() => setOpened(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <div className="flexColCenter" style={{ gap: "1rem", minWidth: "300px" }}>
          <Typography variant="h6">Your Balance: {balance} USD</Typography>
          <Typography variant="h6">Total Price: {ticketPrice} USD</Typography>

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="h6">
              Select {drawnNumbersCount} Numbers:
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {[...Array(availableNumberRange).keys()].map((i) => (
                <Grid item xs={4} key={i}>
                  <Button
                    variant={selectedNumbers.includes(i + 1) ? "contained" : "outlined"}
                    onClick={() => handleNumberClick(i + 1)}
                    sx={{
                      width: "100%",
                      height: "50px",
                      fontWeight: 500,
                      backgroundColor: selectedNumbers.includes(i + 1)
                        ? "var(--blue)"
                        : "white",
                      color: selectedNumbers.includes(i + 1) ? "white" : "black",
                      "&:hover": {
                        backgroundColor: selectedNumbers.includes(i + 1)
                          ? "var(--blue)"
                          : "#f0f0f0",
                      },
                    }}
                    disabled={
                      !selectedNumbers.includes(i + 1) &&
                      selectedNumbers.length >= drawnNumbersCount // Disable if limit reached
                    }
                  >
                    {i + 1}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>

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
                backgroundColor: "var(--blue)",
              },
            }}
            disabled={
              isLoading || ticketPrice > balance || selectedNumbers.length !== drawnNumbersCount
            } // Disabled until correct number of selections
            onClick={() => mutate()}
          >
            Buy Ticket
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LotteryClassicTicketPurchase;
