import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Select,
  Box,
  MenuItem,
  Button,
  FormControlLabel,
  FormGroup,
  Checkbox
} from "@mui/material";
import { toast } from "react-toastify";
import UploadImage from "../UploadImage/UploadImage";
import { createLotteryLike } from "../../utils/api";
import "./CreateLotteryLike.css";

// Custom SVG icons to replace MUI icons
const CustomIcon = ({ path, label }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d={path} stroke="currentColor" strokeWidth="2" />
    {label && <title>{label}</title>}
  </svg>
);

const CloseSVG = () => (
  <CustomIcon path="M6 6L18 18M6 18L18 6" />
);

const iconOptions = [
  { label: "Phone", value: "Phone"},
  { label: "Email", value: "Email"},
  { label: "Star", value: "Star"},
  { label: "Shopping Cart", value: "ShoppingCart"},
  { label: "Gift Card", value: "GiftCard"},
  { label: "Smartphone", value: "Smartphone"},
  { label: "Laptop", value: "Laptop"},
  { label: "Headphones", value: "Headphones"},
  { label: "Watch", value: "Watch"},
  { label: "Subscription", value: "Subscription"},
  { label: "Gaming Console", value: "GamingConsole"},
  { label: "Kitchen Appliance", value: "KitchenAppliance"},
  { label: "Speaker", value: "Speaker"},
  { label: "Beauty Products", value: "BeautyProducts"},
  { label: "Travel Voucher", value: "TravelVoucher"},
  { label: "Fashion Accessories", value: "FashionAccessories"},
  { label: "Home Automation", value: "HomeAutomation"},
  { label: "Outdoor Gear", value: "OutdoorGear"},
  { label: "Books", value: "Books"},
  { label: "Pet Supplies", value: "PetSupplies"},
  { label: "Camera", value: "Camera"},
  { label: "Snack Box", value: "SnackBox"},
  { label: "Car", value: "Car"},
  { label: "Fitness", value: "Fitness"},
  { label: "Restaurant", value: "Restaurant"},
  { label: "Shopping Mall", value: "ShoppingMall"},
  { label: "Movies", value: "Movies"},
  { label: "Bar", value: "Bar"},
  { label: "Spa", value: "Spa"},
  { label: "Airplane", value: "Airplane"},
  { label: "Boat", value: "Boat"},
  { label: "Bike", value: "Bike"},
  { label: "Bus", value: "Bus"},
  { label: "Bed", value: "Bed"},
  { label: "Hospital", value: "Hospital"},
  { label: "Desktop", value: "Desktop"},
  { label: "Tablet", value: "Tablet"},
  { label: "Toys", value: "Toys"},
  { label: "Music", value: "Music"},
  { label: "Art", value: "Art"},
  { label: "Flash", value: "Flash"},
  { label: "Healing", value: "Healing"},
  { label: "Nature", value: "Nature"},
  { label: "Palette", value: "Palette"},
  { label: "Beach", value: "Beach"},
  { label: "Bug", value: "Bug"},
  { label: "Code", value: "Code"},
  { label: "Power", value: "Power"},
  { label: "Workout", value: "Workout"},
  { label: "Others", value: "Others" }
];


const CreateLotteryLike = ({ open, setOpen }) => {
  const { user, getAccessTokenSilently } = useAuth0();

  const initialLotteryDetails = {
    hosted: "",
    title: "",
    description: "",
    image: null,
    paticipationdescription: "",
    endDate: "",
    conditions: [],
    prizes: [{ place: 1, description: "", icon: "" }],
    link: "",
    userEmail: user?.email || "",
  };

  const initialConditions = {
    comment: false,
    like: false,
    share: false,
  };

  const [activeStep, setActiveStep] = useState(0);
  const [lotteryDetails, setLotteryDetails] = useState(initialLotteryDetails);
  const [conditions, setConditions] = useState(initialConditions);
  const [isLinkValid, setIsLinkValid] = useState(true);

  const currentDateTime = new Date().toISOString().slice(0, 16);

  const validateLink = (link) => {
    try {
      new URL(link);
      return true;
    } catch (e) {
      return false;
    }
  };

  const nextStep = () => {
    if (activeStep === 2) {
      const selectedConditions = Object.keys(conditions).filter((key) => conditions[key]);
      setLotteryDetails((prevDetails) => ({ ...prevDetails, conditions: selectedConditions }));
    }
    setActiveStep((current) => Math.min(current + 1, 3));
  };

  const prevStep = () => setActiveStep((current) => Math.max(current - 1, 0));

  const handleCheckboxChange = (event) => setConditions({ ...conditions, [event.target.name]: event.target.checked });

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

      const response = await createLotteryLike(payload, token);

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
      toast.error(` ${error.response?.data?.message || error.message}`, {
        position: "bottom-right",
      });
      console.error("Error creating lotteryLike:", error);
    }
  };

  const isEndDateValid = lotteryDetails.endDate && new Date(lotteryDetails.endDate) > new Date();
  const isAnyConditionSelected = Object.values(conditions).some((value) => value);
  const canProceedToNextStep = isAnyConditionSelected && lotteryDetails.paticipationdescription.trim() !== "" && isEndDateValid && isLinkValid;

  const renderTextField = (label, value, onChange, type = "text") => (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      fullWidth
      margin="normal"
      type={type}
      InputLabelProps={type === "datetime-local" ? { shrink: true } : {}}
    />
  );

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
      <IconButton onClick={() => setOpen(false)} style={{ position: "absolute", right: 8, top: 8, color: "black" }}>
        <CloseSVG />
      </IconButton>

      <DialogTitle className="primaryText" style={{ textAlign: "center" }}>
        Create Lottery Like
      </DialogTitle>
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
              <TextField
                label="Link to Facebook Page"
                value={lotteryDetails.link}
                onChange={(e) => {
                  const value = e.target.value;
                  setLotteryDetails({ ...lotteryDetails, link: value });
                  setIsLinkValid(validateLink(value));
                }}
                fullWidth
                margin="normal"
                error={!isLinkValid}
                helperText={!isLinkValid ? "Please enter a valid URL." : ""}
              />
              {lotteryDetails.title && lotteryDetails.hosted && lotteryDetails.description && lotteryDetails.endDate && lotteryDetails.link && isLinkValid && isEndDateValid && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <button className="button button-blue" onClick={nextStep}>Next</button>
                  </Box>
                </Box>
              )}
            </div>
          )}

          {activeStep === 1 && (
            <UploadImage
              prevStep={prevStep}
              nextStep={nextStep}
              lotteryDetails={lotteryDetails}
              setLotteryDetails={setLotteryDetails}
            />
          )}

          {activeStep === 2 && (
            <div>
              <span className="flexColCenter primaryText">Select the conditions for the lottery</span>
              
              {renderTextField("Participation Description", lotteryDetails.paticipationdescription, (e) => setLotteryDetails({ ...lotteryDetails, paticipationdescription: e.target.value }))}

              <FormGroup sx={{ mt: 2 }}>
                {Object.keys(initialConditions).map((condition) => (
                  <FormControlLabel
                    key={condition}
                    control={<Checkbox checked={conditions[condition]} onChange={handleCheckboxChange} name={condition} />}
                    label={condition.charAt(0).toUpperCase() + condition.slice(1)}
                  />
                ))}
              </FormGroup>
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

              <span className="flexColCenter primaryText">Add Prizes for the Lottery</span>
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
                    <MenuItem value="" disabled>Select Category</MenuItem>
                    {iconOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                           {option.label}
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

export default CreateLotteryLike;
