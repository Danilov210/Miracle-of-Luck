import React, { useContext } from "react";
import { Avatar, Menu, MenuItem, IconButton, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import UserDetailContext from "../../context/UserDetailContext";
import "./ProfileMenu.css";

const ProfileMenu = ({ user, logout }) => {
  const { userDetails } = useContext(UserDetailContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    logout(); // Ensure logout is a valid function passed as a prop
    handleClose();
  };
  return (
    <>
      <IconButton onClick={handleClick} className="icon-button" style={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          src={userDetails?.picture || "/path/to/default/image.jpg"} // Safely access picture
          className="avatar-small"
          alt={userDetails?.fullName || "User Avatar"} // Safely access fullName
          sx={{ width: 40, height: 40 }}
          onError={(e) => { e.target.src = "/path/to/default/image.jpg"; }}
        />
        <Typography variant="body1" className="user-name" style={{ marginLeft: '8px' }}>
          {userDetails?.fullName || "Guest"} {/* Fallback to "Guest" if fullName is not available */}
        </Typography>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => { handleClose(); navigate("/userdetails"); }}>
          Manage your Account
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); navigate("/ownedlotteries"); }}>
          Owned Lotteries
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); navigate("/ownedtickets"); }}>
          My Tickets
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); navigate("/Transactions"); }}>
          My Transactions
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileMenu;
