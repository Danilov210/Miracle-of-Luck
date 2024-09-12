import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Container, Dialog, DialogTitle, DialogContent, IconButton, Typography, Stepper, Step, StepLabel, TextField, Select, Box, MenuItem, Button } from "@mui/material";
import { toast } from "react-toastify";
import UploadImage from "../UploadImage/UploadImage";
import { createLotteryFundraising } from "../../utils/api";
import "./CreateFundraisingModel.css";

// Define the CustomIcon component for SVG icons
const CustomIcon = ({ path, label }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d={path} stroke="currentColor" strokeWidth="2" />
    {label && <title>{label}</title>}
  </svg>
);

// Define the custom SVG icons
const CloseSVG = () => (
  <CustomIcon path="M6 6L18 18M6 18L18 6" />
);

const iconOptions = [
    { label: "Phone", value: "Phone", icon: <CustomIcon path="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21 11.72 11.72 0 004.51 1.15 1 1 0 01.91 1v3.19a1 1 0 01-1 1A18 18 0 013 6a1 1 0 011-1h3.19a1 1 0 011 .91 11.72 11.72 0 001.15 4.51 1 1 0 01-.21 1.11l-2.2 2.2z" /> },
    { label: "Email", value: "Email", icon: <CustomIcon path="M2 4h20v16H2z M22 4L12 13 2 4" /> },
    { label: "Star", value: "Star", icon: <CustomIcon path="M12 17.27L18.18 21 15.64 13.97 22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l6.36 4.73L5.82 21z" /> },
    { label: "Shopping Cart", value: "ShoppingCart", icon: <CustomIcon path="M7 4h13l-1.38 9H8.38L7 4zM5 4H4L2 14h2l1-6h15v2H5zM9 16h6v2H9z" /> },
    { label: "Gift Card", value: "GiftCard", icon: <CustomIcon path="M4 4h16v12H4z M6 8h12v4H6z M4 8h16" /> },
    { label: "Smartphone", value: "Smartphone", icon: <CustomIcon path="M7 2h10v20H7z M9 18h6v2H9z" /> },
    { label: "Laptop", value: "Laptop", icon: <CustomIcon path="M2 5h20v12H2z M0 19h24v2H0z" /> },
    { label: "Headphones", value: "Headphones", icon: <CustomIcon path="M4 12V10a8 8 0 0116 0v2h-3v10H7V12H4z" /> },
    { label: "Watch", value: "Watch", icon: <CustomIcon path="M12 1v22M7 4h10v16H7z" /> },
    { label: "Subscription", value: "Subscription", icon: <CustomIcon path="M4 4h16v12H4z M6 8h12v4H6z" /> },
    { label: "Gaming Console", value: "GamingConsole", icon: <CustomIcon path="M5 8v10h14V8z M9 16l-3 3v-6l3 3z" /> },
    { label: "Kitchen Appliance", value: "KitchenAppliance", icon: <CustomIcon path="M7 3v18h10V3z M9 5h6v12H9z" /> },
    { label: "Speaker", value: "Speaker", icon: <CustomIcon path="M4 6h16v12H4z M8 10h8v4H8z" /> },
    { label: "Beauty Products", value: "BeautyProducts", icon: <CustomIcon path="M12 2C8.13 2 5 5.13 5 9c0 3.87 3.13 7 7 7s7-3.13 7-7c0-3.87-3.13-7-7-7z" /> },
    { label: "Travel Voucher", value: "TravelVoucher", icon: <CustomIcon path="M5 8l5 5 10-10" /> },
    { label: "Fashion Accessories", value: "FashionAccessories", icon: <CustomIcon path="M12 2l4 8H8z M4 10h16v8H4z" /> },
    { label: "Home Automation", value: "HomeAutomation", icon: <CustomIcon path="M5 12h14l-7-7z M12 5v14" /> },
    { label: "Outdoor Gear", value: "OutdoorGear", icon: <CustomIcon path="M12 2l10 20H2z M12 2v20" /> },
    { label: "Books", value: "Books", icon: <CustomIcon path="M3 4v16h18V4H3zm2 2h14v12H5V6z" /> },
    { label: "Pet Supplies", value: "PetSupplies", icon: <CustomIcon path="M12 2C7.03 2 3 6.03 3 11h6v9h6v-9h6c0-4.97-4.03-9-9-9z" /> },
    { label: "Camera", value: "Camera", icon: <CustomIcon path="M4 8h16v12H4z M8 5h8v2H8z" /> },
    { label: "Snack Box", value: "SnackBox", icon: <CustomIcon path="M4 8h16v8H4z M8 5h8v2H8z" /> },
    { label: "Car", value: "Car", icon: <CustomIcon path="M3 10h18l-3 5H6z" /> },
    { label: "Fitness", value: "Fitness", icon: <CustomIcon path="M6 12h12v2H6z M8 8h8v2H8z" /> },
    { label: "Restaurant", value: "Restaurant", icon: <CustomIcon path="M6 2v20 M18 2v20" /> },
    { label: "Shopping Mall", value: "ShoppingMall", icon: <CustomIcon path="M5 8h14v12H5z M8 10h8v8H8z" /> },
    { label: "Movies", value: "Movies", icon: <CustomIcon path="M4 8h16v12H4z M8 10h8v4H8z" /> },
    { label: "Bar", value: "Bar", icon: <CustomIcon path="M4 6h16v12H4z" /> },
    { label: "Spa", value: "Spa", icon: <CustomIcon path="M4 12l8 8 8-8" /> },
    { label: "Airplane", value: "Airplane", icon: <CustomIcon path="M10 20l2-18M12 2l8 8-8-8-8 8z" /> },
    { label: "Boat", value: "Boat", icon: <CustomIcon path="M12 2L4 20h16z" /> },
    { label: "Bike", value: "Bike", icon: <CustomIcon path="M4 10h16 M8 6h8 M6 8v8 M18 8v8" /> },
    { label: "Bus", value: "Bus", icon: <CustomIcon path="M4 8h16v8H4z M8 6h8v2H8z" /> },
    { label: "Bed", value: "Bed", icon: <CustomIcon path="M4 12h16v6H4z" /> },
    { label: "Hospital", value: "Hospital", icon: <CustomIcon path="M6 2h12v20H6z M9 8h6v8H9z" /> },
    { label: "Desktop", value: "Desktop", icon: <CustomIcon path="M4 5h16v12H4z M8 18h8v2H8z" /> },
    { label: "Tablet", value: "Tablet", icon: <CustomIcon path="M7 2h10v20H7z" /> },
    { label: "Toys", value: "Toys", icon: <CustomIcon path="M12 2v20 M6 6h12 M6 18h12" /> },
    { label: "Music", value: "Music", icon: <CustomIcon path="M9 2v12h6V2z" /> },
    { label: "Art", value: "Art", icon: <CustomIcon path="M12 2v20 M6 6h12 M6 18h12" /> },
    { label: "Flash", value: "Flash", icon: <CustomIcon path="M7 2l10 10H7l10 10z" /> },
    { label: "Healing", value: "Healing", icon: <CustomIcon path="M12 2l10 20H2z" /> },
    { label: "Nature", value: "Nature", icon: <CustomIcon path="M6 8l12 8-12-8-12 8z" /> },
    { label: "Palette", value: "Palette", icon: <CustomIcon path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14a4 4 0 01-4-4h8a4 4 0 01-4 4z" /> },
    { label: "Beach", value: "Beach", icon: <CustomIcon path="M4 12h16v8H4z" /> },
    { label: "Bug", value: "Bug", icon: <CustomIcon path="M4 4h16v12H4z M8 6h8v8H8z" /> },
    { label: "Code", value: "Code", icon: <CustomIcon path="M4 12h16v8H4z" /> },
    { label: "Power", value: "Power", icon: <CustomIcon path="M12 2v20 M6 8h12 M6 16h12" /> },
    { label: "Workout", value: "Workout", icon: <CustomIcon path="M4 8h16v8H4z M8 6h8v2H8z" /> },
    { label: "Others", value: "Others", icon: <CustomIcon path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-2.47-.35-4.52-2.4-4.93-4.93H5v-2h1.07c.26-1.17.97-2.2 1.93-2.93V7h2v1.07c1.17-.26 2.2-.97 2.93-1.93H15v2h-1.07c-.26 1.17-.97 2.2-1.93 2.93V15h-2v-1.07c-1.17.26-2.2.97-2.93 1.93H7v2h1.07c.35 2.47 2.4 4.52 4.93 4.93V21z" /> }
  ];

const CreateFundraisingModel = ({ open, setOpen }) => {
  const { user, getAccessTokenSilently } = useAuth0();

  const initialLotteryDetails = {
    hosted: "",
    title: "",
    description: "",
    image: null,
    paticipationdescription: "",
    endDate: "",
    price: 0,
    prizes: [{ place: 1, description: "", icon: "" }],
    userEmail: user?.email || "",
  };

  const currentDateTime = new Date().toISOString().slice(0, 16);

  const [activeStep, setActiveStep] = useState(0);
  const [lotteryDetails, setLotteryDetails] = useState(initialLotteryDetails);

  const nextStep = () => setActiveStep((current) => Math.min(current + 1, 3));
  const prevStep = () => setActiveStep((current) => Math.max(current - 1, 0));

  const handlePrizeChange = (index, field, value) => {
    setLotteryDetails((prev) => {
      const updatedPrizes = [...prev.prizes];
      updatedPrizes[index][field] = value;
      updatedPrizes[index].place = index + 1;
      return { ...prev, prizes: updatedPrizes };
    });
  };

  const addPrize = () => setLotteryDetails((prev) => ({
    ...prev,
    prizes: [...prev.prizes, { place: prev.prizes.length + 1, description: "", icon: "" }]
  }));

  const deleteLastPrize = () => setLotteryDetails((prev) => ({
    ...prev,
    prizes: prev.prizes.length > 1 ? prev.prizes.slice(0, -1) : prev.prizes
  }));

  const handleFinish = async () => {
    try {
      const token = await getAccessTokenSilently();
      const endDate = lotteryDetails.endDate ? new Date(lotteryDetails.endDate).toISOString() : null;
      const payload = { ...lotteryDetails, endDate };

      const response = await createLotteryFundraising(payload, token);
      if (response?.data?.message) {
        toast.success(response.data.message, {
          position: "bottom-right",
          autoClose: 3000,
        });

        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error("Unexpected response format from the server.");
      }
    } catch (error) {
      toast.error(`Error creating lottery: ${error.response?.data?.message || error.message}`, {
        position: "bottom-right",
      });
      console.error("Error creating lotteryLike:", error);
    }
  };

  const isEndDateValid = lotteryDetails.endDate && new Date(lotteryDetails.endDate) > new Date();
  const canProceedToNextStep = lotteryDetails.paticipationdescription.trim() && lotteryDetails.price > 0 && isEndDateValid;

  const renderTextField = (label, value, onChange, type = "text") => (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      fullWidth
      margin="normal"
      type={type}
    />
  );

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
      <IconButton onClick={() => setOpen(false)} style={{ position: "absolute", right: 8, top: 8, color: "black" }}>
        <CloseSVG />
      </IconButton>

      <DialogTitle className="primaryText" style={{ textAlign: "center" }}>Create Lottery Fundraising</DialogTitle>
      <DialogContent>
        <Container>
          <Stepper activeStep={activeStep} alternativeLabel>
            {["Main - Details", "Images - Upload", "Conditions - Details", "Prizes - Details"].map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <div>
              {renderTextField("Lottery Hosted By", lotteryDetails.hosted, (e) => setLotteryDetails({ ...lotteryDetails, hosted: e.target.value }))}
              {renderTextField("Title of Lottery", lotteryDetails.title, (e) => setLotteryDetails({ ...lotteryDetails, title: e.target.value }))}
              {renderTextField("Description of Lottery", lotteryDetails.description, (e) => setLotteryDetails({ ...lotteryDetails, description: e.target.value }))}
              <TextField
                label="Date and Time of Lottery Draw"
                type="datetime-local"
                value={lotteryDetails.endDate}
                onChange={(e) =>
                  setLotteryDetails({
                    ...lotteryDetails,
                    endDate: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: currentDateTime }}
              />
              {lotteryDetails.title && lotteryDetails.hosted && lotteryDetails.description && lotteryDetails.endDate && isEndDateValid && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <button className="button button-blue" onClick={nextStep}>Next</button>
                </Box>
              )}
            </div>
          )}

          {activeStep === 1 && (
            <UploadImage prevStep={prevStep} nextStep={nextStep} lotteryDetails={lotteryDetails} setLotteryDetails={setLotteryDetails} />
          )}

          {activeStep === 2 && (
            <div>
              <Typography variant="h4" sx={{ mt: 2, textAlign: "center", fontWeight: "bold" }}>Select the conditions for the lottery</Typography>
              {renderTextField("Participation Description", lotteryDetails.paticipationdescription, (e) => setLotteryDetails({ ...lotteryDetails, paticipationdescription: e.target.value }))}
              {renderTextField("Price of One Ticket (Min Value 1)", lotteryDetails.price, (e) => setLotteryDetails({ ...lotteryDetails, price: Math.max(1, parseFloat(e.target.value) || 0) }), "number")}
              <Box className="flexColCenter NavBut">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2 }}>
                  <button className="button button-green" onClick={prevStep}>Back</button>
                  {canProceedToNextStep && <button className="button button-blue" onClick={nextStep}>Next</button>}
                </Box>
              </Box>
            </div>
          )}

          {activeStep === 3 && (
            <div>
              <Typography variant="h4" sx={{ mt: 2, textAlign: "center", fontWeight: "bold" }}>Add Prizes for the Lottery</Typography>
              {lotteryDetails.prizes.map((prize, index) => (
                <Box
                  key={index}
                  sx={{
                    mt: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flexDirection: { xs: 'column', sm: 'row' }
                  }}
                >
                  <Typography sx={{ minWidth: "45px", whiteSpace: "nowrap" }}>Place {index + 1}</Typography>
                  {renderTextField("Prize Description", prize.description, (e) => handlePrizeChange(index, "description", e.target.value))}
                  <Select
                    value={prize.icon}
                    onChange={(e) => handlePrizeChange(index, "icon", e.target.value)}
                    displayEmpty
                    sx={{
                      minWidth: { xs: '100%', sm: '220px' },
                      maxWidth: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <MenuItem value="" disabled>Select Icon</MenuItem>
                    {iconOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                          {option.icon} {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              ))}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 2 }}>
                <Button onClick={addPrize} variant="outlined">+ Add Another Prize</Button>
                <Button onClick={deleteLastPrize} variant="outlined" color="error" disabled={lotteryDetails.prizes.length === 1}>
                  - Delete Last Prize
                </Button>
              </Box>
              <Box className="flexColCenter NavBut">
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mt: 2 }}>
                  <button className="button button-green" onClick={prevStep}>Back</button>
                  {lotteryDetails.prizes.every((prize) => prize.description && prize.icon) && (
                    <button className="button button-blue" onClick={handleFinish}>Finish</button>
                  )}
                </Box>
              </Box>
            </div>
          )}
        </Container>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFundraisingModel;
