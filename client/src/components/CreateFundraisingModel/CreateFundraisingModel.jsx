import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Snackbar, Alert, Container, Dialog, DialogTitle, DialogContent, IconButton, Typography, Stepper, Step, StepLabel, TextField, Select, Box, MenuItem, Button } from "@mui/material";
import { HelpOutline as OtherIcon, Close as CloseIcon, Phone as PhoneIcon, Email as EmailIcon, Star as StarIcon, ShoppingCart as ShoppingCartIcon, CardGiftcard as GiftCardIcon, Smartphone as SmartphoneIcon, Laptop as LaptopIcon, Headphones as HeadphonesIcon, Watch as WatchIcon, Subscriptions as SubscriptionsIcon, SportsEsports as GamingConsoleIcon, Kitchen as KitchenIcon, Speaker as SpeakerIcon, Face as BeautyIcon, Flight as TravelIcon, Work as FashionIcon, Home as HomeAutomationIcon, Hiking as OutdoorGearIcon, MenuBook as BooksIcon, Pets as PetSuppliesIcon, Camera as CameraIcon, EmojiFoodBeverage as SnackBoxIcon, DirectionsCar as CarIcon, FitnessCenter as FitnessIcon, LocalDining as RestaurantIcon, LocalMall as ShoppingMallIcon, LocalMovies as MovieIcon, LocalBar as BarIcon, Spa as SpaIcon, AirplanemodeActive as AirplaneIcon, DirectionsBoat as BoatIcon, DirectionsBike as BikeIcon, DirectionsBus as BusIcon, Bed as BedIcon, LocalHospital as HospitalIcon, Computer as DesktopIcon, Tablet as TabletIcon, Toys as ToysIcon, MusicNote as MusicNoteIcon, ArtTrack as ArtIcon, FlashOn as FlashIcon, Healing as HealingIcon, Nature as NatureIcon, Palette as PaletteIcon, BeachAccess as BeachIcon, BugReport as BugIcon, Code as CodeIcon, FlashOn as PowerIcon, FitnessCenter as WorkoutIcon } from "@mui/icons-material";
import UploadImage from "../UploadImage/UploadImage";
import { createLotteryFundraising } from "../../utils/api";
import "./CreateFundraisingModel.css";

const iconOptions = [
    { label: "Phone", value: "Phone", icon: <PhoneIcon /> },
    { label: "Email", value: "Email", icon: <EmailIcon /> },
    { label: "Star", value: "Star", icon: <StarIcon /> },
    { label: "Shopping Cart", value: "ShoppingCart", icon: <ShoppingCartIcon /> },
    { label: "Gift Card", value: "GiftCard", icon: <GiftCardIcon /> },
    { label: "Smartphone", value: "Smartphone", icon: <SmartphoneIcon /> },
    { label: "Laptop", value: "Laptop", icon: <LaptopIcon /> },
    { label: "Headphones", value: "Headphones", icon: <HeadphonesIcon /> },
    { label: "Watch", value: "Watch", icon: <WatchIcon /> },
    { label: "Subscription", value: "Subscription", icon: <SubscriptionsIcon /> },
    { label: "Gaming Console", value: "GamingConsole", icon: <GamingConsoleIcon /> },
    { label: "Kitchen Appliance", value: "KitchenAppliance", icon: <KitchenIcon /> },
    { label: "Speaker", value: "Speaker", icon: <SpeakerIcon /> },
    { label: "Beauty Products", value: "BeautyProducts", icon: <BeautyIcon /> },
    { label: "Travel Voucher", value: "TravelVoucher", icon: <TravelIcon /> },
    { label: "Fashion Accessories", value: "FashionAccessories", icon: <FashionIcon /> },
    { label: "Home Automation", value: "HomeAutomation", icon: <HomeAutomationIcon /> },
    { label: "Outdoor Gear", value: "OutdoorGear", icon: <OutdoorGearIcon /> },
    { label: "Books", value: "Books", icon: <BooksIcon /> },
    { label: "Pet Supplies", value: "PetSupplies", icon: <PetSuppliesIcon /> },
    { label: "Camera", value: "Camera", icon: <CameraIcon /> },
    { label: "Snack Box", value: "SnackBox", icon: <SnackBoxIcon /> },
    { label: "Car", value: "Car", icon: <CarIcon /> },
    { label: "Fitness", value: "Fitness", icon: <FitnessIcon /> },
    { label: "Restaurant", value: "Restaurant", icon: <RestaurantIcon /> },
    { label: "Shopping Mall", value: "ShoppingMall", icon: <ShoppingMallIcon /> },
    { label: "Movies", value: "Movies", icon: <MovieIcon /> },
    { label: "Bar", value: "Bar", icon: <BarIcon /> },
    { label: "Spa", value: "Spa", icon: <SpaIcon /> },
    { label: "Airplane", value: "Airplane", icon: <AirplaneIcon /> },
    { label: "Boat", value: "Boat", icon: <BoatIcon /> },
    { label: "Bike", value: "Bike", icon: <BikeIcon /> },
    { label: "Bus", value: "Bus", icon: <BusIcon /> },
    { label: "Bed", value: "Bed", icon: <BedIcon /> },
    { label: "Hospital", value: "Hospital", icon: <HospitalIcon /> },
    { label: "Desktop", value: "Desktop", icon: <DesktopIcon /> },
    { label: "Tablet", value: "Tablet", icon: <TabletIcon /> },
    { label: "Toys", value: "Toys", icon: <ToysIcon /> },
    { label: "Music", value: "Music", icon: <MusicNoteIcon /> },
    { label: "Art", value: "Art", icon: <ArtIcon /> },
    { label: "Flash", value: "Flash", icon: <FlashIcon /> },
    { label: "Healing", value: "Healing", icon: <HealingIcon /> },
    { label: "Nature", value: "Nature", icon: <NatureIcon /> },
    { label: "Palette", value: "Palette", icon: <PaletteIcon /> },
    { label: "Beach", value: "Beach", icon: <BeachIcon /> },
    { label: "Bug", value: "Bug", icon: <BugIcon /> },
    { label: "Code", value: "Code", icon: <CodeIcon /> },
    { label: "Power", value: "Power", icon: <PowerIcon /> },
    { label: "Workout", value: "Workout", icon: <WorkoutIcon /> },
    { label: "Others", value: "Others", icon: <OtherIcon /> },
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
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

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
                showMessage(response.data.message, "success");
                setTimeout(() => window.location.reload(), 3000);
            } else {
                throw new Error("Unexpected response format from the server.");
            }
        } catch (error) {
            showMessage(`Error creating lottery: ${error.response?.data?.message || error.message}`, "error");
            console.error("Error creating lotteryLike:", error);
        }
    };

    const showMessage = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = () => setSnackbarOpen(false);

    const canProceedToNextStep = lotteryDetails.paticipationdescription.trim() && lotteryDetails.price > 0;

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
                <CloseIcon />
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
                            {lotteryDetails.title && lotteryDetails.hosted && lotteryDetails.description && lotteryDetails.endDate && (
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
                            <Typography variant="h4" sx={{ mt: 2, textAlign: "center", fontWeight: "bold" }}>
                                Add Prizes for the Lottery
                            </Typography>
                            {lotteryDetails.prizes.map((prize, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        mt: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        flexDirection: { xs: 'column', sm: 'row' } // Stack vertically on small screens, horizontally on medium and larger screens
                                    }}
                                >
                                    <Typography sx={{ minWidth: "45px", whiteSpace: "nowrap" }}>Place {index + 1}</Typography>
                                    {renderTextField("Prize Description", prize.description, (e) => handlePrizeChange(index, "description", e.target.value))}
                                    <Select
                                        value={prize.icon}
                                        onChange={(e) => handlePrizeChange(index, "icon", e.target.value)}
                                        displayEmpty
                                        sx={{
                                            minWidth: { xs: '100%', sm: '220px' }, // Full width on small screens, 200px on medium and larger
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
                                    {/* Check if all prizes are filled */}
                                    {lotteryDetails.prizes.every((prize) => prize.description && prize.icon) && (
                                        <button className="button button-blue" onClick={handleFinish}>Finish</button>
                                    )}
                                </Box>
                            </Box>
                        </div>
                    )}

                    <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMessage}</Alert>
                    </Snackbar>
                </Container>
            </DialogContent>
        </Dialog>
    );
};

export default CreateFundraisingModel;