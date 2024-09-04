import React from "react";
import { Avatar, Menu, MenuItem, IconButton, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./ProfileMenu.css";

const ProfileMenu = ({ user, logout }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick} className="icon-button" style={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          src={user?.picture || "/path/to/default/image.jpg"}
          className="avatar-small"
          alt={user?.name || "User Avatar"}
          sx={{ width: 40, height: 40 }}
          onError={(e) => { e.target.src = "/path/to/default/image.jpg"; }}
        />
        <Typography variant="body1" className="user-name" style={{ marginLeft: '8px' }}>
          {user?.name}
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
        {/* Updated this MenuItem to navigate to /ownedlotteries */}
        <MenuItem onClick={() => { handleClose(); navigate("/ownedlotteries"); }}>
          Owned Lotteries
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); navigate("/ownedtickets"); }}>
        My Tickets
        </MenuItem>
        <MenuItem
          onClick={() => {
            localStorage.clear();
            logout();
            handleClose();
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileMenu;
