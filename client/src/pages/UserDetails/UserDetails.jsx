import React, { useContext, useState, useEffect } from "react";
import { Box, TextField, Avatar } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import UserDetailContext from "../../context/UserDetailContext";
import { updateUserDetails } from "../../utils/api";
import { toast } from "react-toastify";

import "./UserDetails.css";

// Function to convert "dd/MM/yyyy" to "yyyy-MM-dd"
function formatDate(date) {
  if (!date) return ""; // Return empty string if date is falsy

  // Check if the date is already in yyyy-MM-dd format
  if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return date; // Return as is if already in the correct format
  }

  // Convert dd/MM/yyyy to yyyy-MM-dd
  const [day, month, year] = date.split('/');
  if (day && month && year) {
    return `${year}-${month}-${day}`; // Convert to ISO format
  }

  return ""; // Return empty string if the date is invalid
}

const UserDetails = () => {
  const { user } = useAuth0();
  const { userDetails, setUserDetails } = useContext(UserDetailContext);
  const [isEditing, setIsEditing] = useState(true);
  const [updatedDetails, setUpdatedDetails] = useState({
    email: user?.email || "",
    firstName: userDetails?.firstName || "",
    lastName: userDetails?.lastName || "",
    picture: user?.picture || "/path/to/default/image.jpg",
    fullName: userDetails?.fullName || `${userDetails?.firstName || ""} ${userDetails?.lastName || ""}`.trim(),
    DataOfBirth: formatDate(userDetails?.DataOfBirth) || "", // Safely format the date
    balance: userDetails?.balance || 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Sync updatedDetails with userDetails changes
    setUpdatedDetails({
      email: user?.email || "",
      firstName: userDetails?.firstName || "",
      lastName: userDetails?.lastName || "",
      picture: user?.picture || "/path/to/default/image.jpg",
      fullName: `${userDetails?.firstName || ""} ${userDetails?.lastName || ""}`.trim(),
      DataOfBirth: formatDate(userDetails?.DataOfBirth) || "", // Safely format the date
      balance: userDetails?.balance || 0,
    });
  }, [userDetails, user]);

  const handleCancelClick = () => {
    setIsEditing(false);
    setUpdatedDetails(userDetails);
    navigate("/");
  };

  const handleSaveClick = async () => {
    try {
      const token = localStorage.getItem("access_token");

      // Extract fields to send to the API
      const { email, firstName, lastName, picture, DataOfBirth } = updatedDetails;

      // Create object with fields to update
      const userDataToUpdate = { email, firstName, lastName, picture, DataOfBirth };

      // Call API function
      const updatedData = await updateUserDetails(userDataToUpdate, token);
      if (updatedData?.message) {
        toast.success(updatedData.message, {
          position: "bottom-right",
          autoClose: 3000,
        })
      }
      // Update context with server response
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

  // Get today's date in yyyy-MM-dd format to use as the maximum allowable date
  const today = new Date().toISOString().split('T')[0];

  return (
    <section className="r-wrapper">
      <div className="wrapper paddings innerWidth r-container">
        <div className="r-head flexColCenter">
          <span className="primaryText">Manage Your Account</span>
          <Avatar
            src={updatedDetails.picture}
            className="avatar-large"
            alt={updatedDetails.fullName || "User Avatar"}
            sx={{ width: 100, height: 100 }}
            onError={(e) => {
              e.target.src = "/path/to/default/image.jpg";
            }}
          />
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
              inputProps={{ max: today }} // Set maximum date to today
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
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mt: 2 }}>
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
    </section>
  );
};

export default UserDetails;
