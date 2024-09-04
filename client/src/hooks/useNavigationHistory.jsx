import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const useNavigationHistory = () => {
  const navigate = useNavigate();

  // Function to go back to the previous page
  const goBack = useCallback(() => {
    navigate(-1); // Navigates to the previous page in the browser history
  }, [navigate]);

  return { goBack };
};

export default useNavigationHistory;
