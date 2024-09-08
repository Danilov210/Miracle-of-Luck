import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Close as CloseIcon } from "@mui/icons-material";
import { Container, Dialog, DialogTitle, DialogContent, IconButton, Typography, Stepper, Step, StepLabel, TextField, Select, Box, MenuItem, Button } from "@mui/material";
import { toast } from "react-toastify"; // Import toast from react-toastify
import UploadImage from "../UploadImage/UploadImage";
import { createLotteryClassic } from "../../utils/api";
import "./CreateClassicModel.css";

const CreateClassicModel = ({ open, setOpen }) => {
    const { user, getAccessTokenSilently } = useAuth0();

    const initialLotteryDetails = {
        hosted: "",
        title: "",
        description: "",
        image: null,
        paticipationdescription: "",
        endDate: "",
        drawnNumbersCount: 0,
        availableNumberRange: 0,
        price: 0,
        prizes: [{ place: 1, amount: 0 }],
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
        prizes: [...prev.prizes, { place: prev.prizes.length + 1, amount: 0 }] 
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

            const response = await createLotteryClassic(payload, token);
            if (response?.data?.message) {
                toast.success(response.data.message, {
                    position: "bottom-right",
                    autoClose: 3000, // Auto close after 3 seconds
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

    const canProceedToNextStep = lotteryDetails.paticipationdescription.trim() && lotteryDetails.price > 0 && lotteryDetails.availableNumberRange > 0 && lotteryDetails.drawnNumbersCount > 0 && lotteryDetails.availableNumberRange > lotteryDetails.drawnNumbersCount;

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

            <DialogTitle className="primaryText" style={{ textAlign: "center" }}>Create Lottery Classic</DialogTitle>
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
                            {renderTextField("Available Number Range (e.g., 1 to 49)", lotteryDetails.availableNumberRange, (e) => setLotteryDetails({ ...lotteryDetails, availableNumberRange: Math.min(50, Math.max(1, parseFloat(e.target.value) || 0)) }), "number")}
                            {renderTextField("Drawn Numbers Count (e.g., drawing 6 numbers)", lotteryDetails.drawnNumbersCount, (e) => setLotteryDetails({ ...lotteryDetails, drawnNumbersCount: Math.min(50, Math.max(1, parseFloat(e.target.value) || 0)) }), "number")}
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
                                <Box key={index} sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
                                    <Typography sx={{ minWidth: "200px", whiteSpace: "nowrap" }}>
                                        Place {index + 1} ({lotteryDetails.drawnNumbersCount - index} {lotteryDetails.drawnNumbersCount - index === 1 ? "number" : "numbers"} from {lotteryDetails.drawnNumbersCount})
                                    </Typography>
                                    {renderTextField("Amount (greater than 1)", prize.amount, (e) => handlePrizeChange(index, "amount", Math.max(1, parseFloat(e.target.value) || 0)), "number")}
                                </Box>
                            ))}
                            <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 2 }}>
                                <Button onClick={addPrize} variant="outlined" disabled={lotteryDetails.prizes.length >= lotteryDetails.drawnNumbersCount}>+ Add Another Prize</Button>
                                <Button onClick={deleteLastPrize} variant="outlined" color="error" disabled={lotteryDetails.prizes.length === 1}>- Delete Last Prize</Button>
                            </Box>
                            <Box className="flexColCenter NavBut" >
                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mt: 2 }}>

                                    <button className="button button-green" onClick={prevStep}>Back</button>
                                    {lotteryDetails.prizes.every((prize) => prize.amount > 0) && <button className="button button-blue" onClick={handleFinish}>Finish</button>}
                                </Box>
                            </Box>
                        </div>
                    )}
                </Container>
            </DialogContent>
        </Dialog>
    );
};

export default CreateClassicModel;
