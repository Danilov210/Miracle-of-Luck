import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";

export const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

export const createUser = async (data, token) => {
  try {
    // Make an API request and store the response
    const response = await api.post(
      `/user/register`,
      { data }, // Payload being sent to the server
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

    return res; // Return the response to be handled by the caller

  } catch (error) {
    console.error("Error sending lottery data:", error);
    throw error; // Re-throw the error to be handled by the caller
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

    return res; // Return the response to be handled by the caller

  } catch (error) {
    console.error("Error sending lottery data:", error);
    throw error; // Re-throw the error to be handled by the caller
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

    return res; // Return the response to be handled by the caller

  } catch (error) {
    console.error("Error sending lottery data:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};








/////////////////////
export const bookVisit = async (date, propertyId, email, token) => {
  try {
    await api.post(
      `/user/bookVisit/${propertyId}`,
      {
        email,
        id: propertyId,
        date: dayjs(date).format("DD/MM/YYYY"),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    toast.error("Something went wrong, Please try again");
    throw error;
  }
};

export const removeBooking = async (id, email, token) => {
  try {
    await api.post(
      `/user/removeBooking/${id}`,
      {
        email,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    toast.error("Something went wrong, Please try again");

    throw error;
  }
};

export const toFav = async (id, email, token) => {
  try {
    await api.post(
      `/user/toFav/${id}`,
      {
        email,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (e) {
    throw e;
  }
};


export const getAllFav = async (email, token) => {
  if (!token) return
  try {

    const res = await api.post(
      `/user/allFav`,
      {
        email,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data["favResidenciesID"]

  } catch (e) {
    toast.error("Something went wrong while fetching favs");
    throw e
  }
}


export const getAllBookings = async (email, token) => {

  if (!token) return
  try {
    const res = await api.post(
      `/user/allBookings`,
      {
        email,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data["bookedVisits"];


  } catch (error) {
    toast.error("Something went wrong while fetching bookings");
    throw error
  }
}
