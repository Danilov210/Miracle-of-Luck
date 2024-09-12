import axios from "axios";
import { toast } from "react-toastify";

export const api = axios.create({
  baseURL: "https://miracleofluck.onrender.com/api",
});

export const createUser = async (data, token) => {
  try {
    const response = await api.post(
      `/user/register`,
      { data },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Extract and store the data from the response
    const receivedData = response.data; // Store the data from the response
    return receivedData; // Return the data for further use
  } catch (error) {
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 409) {
        // Do nothing; suppress the toast notification for "User already registered"
      } else if (error.response.status === 400) {
        toast.error("Invalid data provided. Please check your input.");
      } else {
        toast.error("Something went wrong with the registration. Please try again.");
      }
    } else {
      // Handle any other errors
      toast.error("Network error, please check your connection.");
    }
    throw error;
  }
};

export const getAllLotteriesLike = async () => {
  try {
    const responce = await api.get(`/lotteries/alllotterylike`, {
      timeout: 10 * 1000,
    });
    if (responce.status === 400 || responce.status === 500) {
      throw responce.data;
    }
    return responce.data;
  } catch (error) {
    toast.error("getAllLotteriesLike went wrong");
    throw error;
  }
};

export const getAllLotteriesFundraising = async () => {
  try {
    const responce = await api.get(`/lotteries/alllotteryfundraising`, {
      timeout: 10 * 1000,
    });
    if (responce.status === 400 || responce.status === 500) {
      throw responce.data;
    }
    return responce.data;
  } catch (error) {
    toast.error("getAllLotteriesFundraising went wrong");
    throw error;
  }
};

export const getAllLotteriesClassic = async () => {
  try {
    const responce = await api.get(`/lotteries/alllotteryclassic`, {
      timeout: 10 * 1000,
    });
    if (responce.status === 400 || responce.status === 500) {
      throw responce.data;
    }
    return responce.data;
  } catch (error) {
    toast.error("getAllLotteriesClassic went wrong");
    throw error;
  }
};

export const getLotteryLike = async (id) => {
  try {
    const responce = await api.get(`/lotteries/LotteryLike/${id}`, {
      timeout: 10 * 1000,
    });
    if (responce.status === 400 || responce.status === 500) {
      throw responce.data;
    }
    return responce.data;
  } catch (error) {
    toast.error("getLotteryLike went wrong");
    throw error;
  }
};

export const getLotteryFundraising = async (id) => {
  try {
    const responce = await api.get(`/lotteries/LotteryFundraising/${id}`, {
      timeout: 10 * 1000,
    });
    if (responce.status === 400 || responce.status === 500) {
      throw responce.data;
    }
    return responce.data;
  } catch (error) {
    toast.error("getLotteryFundraising went wrong");
    throw error;
  }
};

export const getLotteryClassic = async (id) => {
  try {
    const responce = await api.get(`/lotteries/LotteryClassic/${id}`, {
      timeout: 10 * 1000,
    });
    if (responce.status === 400 || responce.status === 500) {
      throw responce.data;
    }
    return responce.data;
  } catch (error) {
    toast.error("getLotteryClassic went wrong");
    throw error;
  }
};

export const createLotteryLike = async (data, token) => {
  try {
    const res = await api.post(
      `lotteries/createLike`,
      { data },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res;

  } catch (error) {
    console.error("Error sending lottery data:", error);
    throw error;
  }
};

export const createLotteryFundraising = async (data, token) => {
  try {

    const res = await api.post(
      `lotteries/createFundraising`,
      { data },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res;
  } catch (error) {
    console.error("Error sending lottery data:", error);
    throw error;
  }
};

export const createLotteryClassic = async (data, token) => {
  try {
    const res = await api.post(
      `lotteries/createClassic`,
      { data },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res;

  } catch (error) {
    console.error("Error sending lottery data:", error);
    throw error;
  }
};

export const BuyTicketFundraising = async (data, token) => {
  try {

    const res = await api.post(
      `user/BuyTicketFundraising`,
      { data },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res;

  } catch (error) {
    toast.error("Buy Ticket Fundraising went wrong, Please try again");
    throw error;
  }
};

export const BuyTicketClassic = async (data, token) => {
  try {
    const res = await api.post(
      `user/BuyTicketClassic`,
      { data },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res;
  } catch (error) {
    toast.error("Buy Ticket Classic went wrong, Please try again");
    throw error;
  }
};

export const getAllUserOwnedLotteries = async (email) => {
  try {
    const response = await api.post('/user/UserOwnedLottories', { data: { email } }); // Send email inside 'data'
    return response;
  } catch (error) {
    throw new Error('Failed to fetch user owned lotteries.');
  }
};

export const getAllUserLotteries = async (email) => {
  try {
    const response = await api.post('/user/UserLottoriesTickets', {
      data: email,
    });
    return response;
  } catch (error) {
    console.error("Error fetching user's lotteries:", error.message);
    throw new Error("Failed to fetch user lotteries.");
  }
};

export const CancelUserTicket = async (ticketId,email) => {
  try {
    if (!ticketId) {
      throw new Error("Ticket ID is required.");
    }
    const response = await api.post('/user/CancelTicket', {
      data: { ticketId ,email }, // Ensures that ticketId is properly sent in the request body
    });

    return response; // Return the response directly if successful

  } catch (error) {
    console.error("Error cancelling user's ticket:", error.response?.data?.message || error.message);
    throw new Error("Failed to cancel user's ticket.");
  }
};


export const CancelLottery = async (email, lotteryId, lotteryType) => {

  try {
    const response = await api.post('/user/CancelLottery', {
      data: { email, lotteryId, lotteryType }, // Send both lotteryId and lotteryType
    });
    return response;
  } catch (error) {

    console.error("Error canceling the lottery:", error.message);
    throw new Error("Failed to cancel the lottery.");
  }
};


export const updateUserDetails = async (updatedDetails, token) => {
  try {
    // Only include fields that are allowed to be updated
    const allowedFields = ['email', 'firstName', 'lastName', 'fullName', 'picture', 'DataOfBirth'];
    const sanitizedDetails = Object.keys(updatedDetails)
      .filter(key => allowedFields.includes(key) && updatedDetails[key] !== undefined && updatedDetails[key] !== null)
      .reduce((obj, key) => {
        obj[key] = updatedDetails[key];
        return obj;
      }, {});


    // Send the sanitized user details to the server
    const response = await api.put(
      '/user/updateUser',
      {
        data: sanitizedDetails, // Send only sanitized user details in the request body
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      }
    );

    const receivedData = response.data; // Store the data from the response
    return receivedData;
  } catch (error) {
    console.error('Error updating user details:', error.message);
    throw new Error('Failed to update user details.');
  }
};


// Function to send transaction data to the database
export const sendTransactionToDatabase = async (transactionData, token) => {
  try {
    const response = await api.post(
      '/user/createTransaction',
      {
        data: transactionData, // Send only sanitized user details in the request body
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      }
    );

    const receivedData = response.data; // Store the data from the response
    return receivedData;
  } catch (error) {
    console.error('Error updating user details:', error.message);
    throw new Error('Failed to update user details.');
  }
};


export const fetchUserTransactions = async (email) => {
  const token = localStorage.getItem("access_token"); // Get the token from local storage
  const response = await api.post(
    "/user/getUserTransactions",
    { data: { email } },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data; // Return the response data
};

export const getAllTicketsForLottery = async (lotteryId) => {
  const token = localStorage.getItem("access_token"); // Get the token from local storage
  const response = await api.get(`/lotteries/Alltickets/${lotteryId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data; // Return the response data
};


export const CancelLotteryLike = async (lotteryId) => {
  try {
    const response = await api.post('/user/CancelLotteryLike', {
      data: { lotteryId }, // Send both lotteryId and lotteryType
    });
    return response;
  } catch (error) {
    console.error("Error canceling the lottery:", error.message);
    throw new Error("Failed to cancel the lottery.");
  }
};
