import React, { useContext, useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Avatar,
  Typography,
  Dialog,
  DialogContent,
  Tabs,
  Tab,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  IconButton,
  InputAdornment,
  FormHelperText,
} from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import UserDetailContext from "../../context/UserDetailContext";
import { sendTransactionToDatabase, updateUserDetails } from "../../utils/api";
import { toast } from "react-toastify";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import "./UserDetails.css";

function formatDate(date) {
  if (!date) return "";

  if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return date;
  }

  const [day, month, year] = date.split("/");
  if (day && month && year) {
    return `${year}-${month}-${day}`;
  }

  return "";
}

const UserDetails = () => {
  const { user } = useAuth0();
  const { userDetails, setUserDetails } = useContext(UserDetailContext);
  const [isEditing, setIsEditing] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [transactionType, setTransactionType] = useState("");
  const [amount, setAmount] = useState("");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [showCvv, setShowCvv] = useState(false);
  const [errors, setErrors] = useState({});

  const [updatedDetails, setUpdatedDetails] = useState({
    email: user?.email || "",
    firstName: userDetails?.firstName || "",
    lastName: userDetails?.lastName || "",
    picture: userDetails?.picture || "/path/to/default/image.jpg",
    fullName:
      userDetails?.fullName ||
      `${userDetails?.firstName || ""} ${userDetails?.lastName || ""}`.trim(),
    DataOfBirth: formatDate(userDetails?.DataOfBirth) || "",
    balance: userDetails?.balance || 0,
  });

  const navigate = useNavigate();
  const cloudinaryRef = useRef();
  const widgetRef = useRef();

  useEffect(() => {
    setUpdatedDetails({
      email: user?.email || "",
      firstName: userDetails?.firstName || "",
      lastName: userDetails?.lastName || "",
      picture: userDetails?.picture || "/path/to/default/image.jpg",
      fullName: `${userDetails?.firstName || ""} ${userDetails?.lastName || ""}`.trim(),
      DataOfBirth: formatDate(userDetails?.DataOfBirth) || "",
      balance: userDetails?.balance || 0,
    });

    if (window.cloudinary) {
      cloudinaryRef.current = window.cloudinary;
      widgetRef.current = cloudinaryRef.current.createUploadWidget(
        {
          cloudName: "dhlgmuuvc",
          uploadPreset: "hojzo8q1",
          maxFiles: 1,
        },
        (err, result) => {
          if (result.event === "success") {
            handleImageUpload(result.info.secure_url);
          }
        }
      );
    } else {
      console.error("Cloudinary library not loaded");
    }
  }, [userDetails, user]);

  const handleCancelClick = () => {
    setIsEditing(false);
    setUpdatedDetails(userDetails);
    navigate("/");
  };

  const handleSaveClick = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const { email, firstName, lastName, picture, DataOfBirth } = updatedDetails;
      const userDataToUpdate = { email, firstName, lastName, picture, DataOfBirth };
      const updatedData = await updateUserDetails(userDataToUpdate, token);
      if (updatedData?.message) {
        toast.success(updatedData.message, {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
      setUserDetails(updatedData.user);
      setIsEditing(false);
      navigate("/");
    } catch (error) {
      console.error("Failed to save user details:", error.message);
    }
  };

  const handleChange = (field, value) => {
    setUpdatedDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
      fullName:
        field === "firstName" || field === "lastName"
          ? `${field === "firstName" ? value : prevDetails.firstName} ${field === "lastName" ? value : prevDetails.lastName
            }`.trim()
          : prevDetails.fullName,
    }));
  };

  const handleOpenUpload = () => {
    setIsUploadOpen(true);
    widgetRef.current.open();
  };

  const handleImageUpload = (imageUrl) => {
    setUpdatedDetails((prevDetails) => ({
      ...prevDetails,
      picture: imageUrl,
    }));
    setIsUploadOpen(false);
  };

  const handleTransactionClick = () => {
    setIsTransactionOpen(true);
  };

  const handleTabChange = (event, newValue) => {
    if (newValue === 1 && (!amount || !transactionType)) {
      if (!amount) {
        toast.error("Please fill amount field before proceeding.", {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
      if (!transactionType) {
        toast.error("Please choose a type of transaction before proceeding.", {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
    } else if (transactionType === "Withdraw" && amount > updatedDetails.balance) {
      toast.error("Insufficient balance. Please enter a valid amount.", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } else {
      setSelectedTab(newValue);
    }
  };

  const handlePayment = async () => {
    const token = localStorage.getItem("access_token");

    const newErrors = {};
    if (!cardDetails.cardNumber || cardDetails.cardNumber.length !== 19) {
      newErrors.cardNumber = "Card number must be 16 digits long (formatted as XXXX-XXXX-XXXX-XXXX).";
    }
    if (!cardDetails.cvv || cardDetails.cvv.length !== 3) {
      newErrors.cvv = "CVV must be 3 digits long.";
    }
    if (!cardDetails.expiryDate) {
      newErrors.expiryDate = "Expiration date is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Proceed with sending the transaction data to the database
    try {
      const transactionData = {
        email: updatedDetails.email,
        cardNumber: cardDetails.cardNumber,
        amount,
        type: transactionType,
      };
      const updatedData = await sendTransactionToDatabase(transactionData, token); // Call function to send data to the database
      if (updatedData?.message) {
        toast.success(updatedData.message, {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
      setUserDetails(updatedData.user);
      setIsEditing(false);
      setIsTransactionOpen(false);
      navigate("/");
    } catch (error) {
      toast.error("Failed to process payment. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
      })
    }
  };

  const handleCardNumberChange = (e) => {
    const input = e.target.value.replace(/\D/g, "");
    const formattedCardNumber = input.match(/.{1,4}/g)?.join("-") || input;
    setCardDetails((prev) => ({ ...prev, cardNumber: formattedCardNumber }));
    setErrors((prev) => ({ ...prev, cardNumber: "" }));
  };

  const handleExpiryDateChange = (e) => {
    const inputDate = e.target.value;
    const currentDate = new Date();
    const selectedDate = new Date(inputDate);

    if (selectedDate <= currentDate) {
      toast.error("Expiration date must be in the future.", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } else {
      setCardDetails((prev) => ({ ...prev, expiryDate: inputDate }));
      setErrors((prev) => ({ ...prev, expiryDate: "" }));
    }
  };

  const handleCvvChange = (e) => {
    const input = e.target.value.replace(/\D/g, "");
    setCardDetails((prev) => ({ ...prev, cvv: input }));
    setErrors((prev) => ({ ...prev, cvv: "" }));
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="r-wrapper">
      <div className="wrapper paddings innerWidth r-container">
        <div className="r-head flexColCenter">
          <span className="primaryText">Manage Your Account</span>
          <Box className="flexColCenter uploadZone" onClick={handleOpenUpload}>
            <Avatar
              src={updatedDetails.picture}
              className="avatar-large"
              alt={updatedDetails.fullName || "User Avatar"}
              sx={{ width: 100, height: 100 }}
              onError={(e) => {
                e.target.src = "/path/to/default/image.jpg";
              }}
            />
            <AiOutlineCloudUpload size={24} color="grey" />
            <Typography>Change Avatar</Typography>
          </Box>
          <span className="secondaryText">{updatedDetails.fullName || ""}</span>
          <span className="secondaryText">{updatedDetails.email}</span>
        </div>
        <Box className="user-details-container">
          <Box className="flexColCenter">
            <TextField
              label="First Name"
              value={updatedDetails.firstName || ""}
              onChange={(e) => handleChange("firstName", e.target.value)}
              margin="normal"
              sx={{ width: "60%" }}
            />
            <TextField
              label="Last Name"
              value={updatedDetails.lastName || ""}
              onChange={(e) => handleChange("lastName", e.target.value)}
              margin="normal"
              sx={{ width: "60%" }}
            />
            <TextField
              label="Date of Birth"
              type="date"
              value={updatedDetails.DataOfBirth || ""}
              onChange={(e) => handleChange("DataOfBirth", e.target.value)}
              margin="normal"
              sx={{ width: "60%" }}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: today }}
            />
            <TextField
              label="Balance($)"
              value={updatedDetails.balance}
              margin="normal"
              sx={{ width: "60%" }}
              disabled
            />
          </Box>

          <Box className="flexColCenter NavBut">
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
                mt: 2,
              }}
            >
              <button className="button button-blue" onClick={handleTransactionClick}>
                Manage Funds
              </button>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
                mt: 2,
              }}
            >
              <button className="button button-green" onClick={handleSaveClick}>
                Save Changes
              </button>
              <button className="button button-red" onClick={handleCancelClick}>
                Cancel Changes
              </button>
            </Box>
          </Box>
        </Box>
      </div>

      {/* Transaction Modal */}
      <Dialog
        open={isTransactionOpen}
        onClose={() => setIsTransactionOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Deposit/Withdraw" />
            <Tab label="Credit Card Info" />
          </Tabs>

          {/* First Tab Content: Deposit/Withdraw */}
          {selectedTab === 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Enter Transaction Details</Typography>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                margin="normal"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, e.target.value))}
              />
              <Typography>Balance: ${updatedDetails.balance}</Typography>
              <RadioGroup
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                row
              >
                <FormControlLabel
                  value="Deposit"
                  control={<Radio />}
                  label="Deposit"
                />
                <FormControlLabel
                  value="Withdraw"
                  control={<Radio />}
                  label="Withdraw"
                />
              </RadioGroup>
            </Box>
          )}

          {/* Second Tab Content: Credit Card Info */}
          {selectedTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Enter Credit Card Information</Typography>
              <TextField
                label="Card Number"
                fullWidth
                margin="normal"
                value={cardDetails.cardNumber}
                onChange={handleCardNumberChange}
                inputProps={{ maxLength: 19 }}
                error={!!errors.cardNumber}
                helperText={errors.cardNumber}
              />
              <TextField
                label="Expiration Date"
                type="month"
                margin="normal"
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: today }}
                value={cardDetails.expiryDate}
                onChange={handleExpiryDateChange}
                error={!!errors.expiryDate}
                helperText={errors.expiryDate}
              />
              <TextField
                label="CVV"
                type={showCvv ? "text" : "password"}
                fullWidth
                margin="normal"
                value={cardDetails.cvv}
                inputProps={{ maxLength: 3 }}
                onChange={handleCvvChange}
                error={!!errors.cvv}
                helperText={errors.cvv}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowCvv((prev) => !prev)}>
                        {showCvv ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {/* Payment Processing Button */}
              <Box className="flexColCenter NavBut">
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <button
                    className="button button-green"
                    style={{ width: '100%' }}
                    onClick={handlePayment}
                  >
                    Process Payment
                  </button>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default UserDetails;
