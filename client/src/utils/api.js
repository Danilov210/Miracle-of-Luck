import axios from "axios";
import { toast } from "react-toastify";

export const api = axios.create({
  baseURL: "http://localhost:8000/api",
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
      data:  email ,
    });
    return response;
  } catch (error) {
    console.error("Error fetching user's lotteries:", error.message);
    throw new Error("Failed to fetch user lotteries.");
  }
};

export const CancelUserTicket = async (ticketId) => {
  try {
    const response = await api.post('/user/CancelTicket', {
      data:  {ticketId} ,
    });
    return response;
    
  } catch (error) {
    console.error("Error fetching user's lotteries:", error.message);
    throw new Error("Failed to fetch user lotteries.");
  }
};
