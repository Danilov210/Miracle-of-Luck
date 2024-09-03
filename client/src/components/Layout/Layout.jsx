import React, { useContext, useEffect } from "react";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import { Outlet } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import UserDetailContext from "../../context/UserDetailContext";
import { useMutation } from "react-query";
import { createUser } from "../../utils/api";
import useFavourites from "../../hooks/useFavourites";

const Layout = () => {
  useFavourites();

  const { isAuthenticated, user, getAccessTokenWithPopup } = useAuth0();
  const { setUserDetails } = useContext(UserDetailContext);
  
  const { mutate } = useMutation({
    mutationKey: [user?.email],
    mutationFn: async ({ data, token }) => {
      
      const receivedData = await createUser(data, token); // Call createUser and wait for response
      
      console.log("Received data from server:", receivedData.user);
      
            if (receivedData && receivedData.user) {
        // Merge new user data with existing user fields
        setUserDetails((prev) => {
          const updatedUser = {
            ...prev.user, // Keep existing user fields
            ...receivedData.user, // Override/merge with new user details from the server
          };

          const updatedDetails = {
            ...prev, // Keep other existing details intact
            ...updatedUser, // Spread the updated user details
          };

          return updatedDetails;
        });
      }
    },
  });

  useEffect(() => {
    const getTokenAndRegister = async () => {
      try{
      const res = await getAccessTokenWithPopup({
        authorizationParams: {
          audience: "http://localhost:8000",
          scope: "openid profile email",
        },
      });
      localStorage.setItem("access_token", res);
      setUserDetails((prev) => ({ ...prev, token: res }));
    
      if (user) {
        // Call mutation with proper data
        mutate({
          data: {
            email: user.email,
            firstName: user.given_name || "",
            lastName: user.family_name || "",
            picture: user.picture || "",
          },
          token: res,
        });
      } else {
        console.error("User data is undefined");
      }
    } catch (error) {
      console.error("Error obtaining token:", error.message);
    }
  };

   // Correctly call the function inside useEffect
   if (isAuthenticated ) {
    getTokenAndRegister(); // Correct function call
  }
}, [isAuthenticated]); // Ensure user is part of the dependencies


  return (
    <>
      <div style={{ background: "var(--black)", overflow: "hidden" }}>
        <Header />
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default Layout;
