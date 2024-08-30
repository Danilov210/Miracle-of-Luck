import React, { useContext, useState } from "react";
import { Modal, Button } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useMutation } from "react-query";
import { bookVisit } from "../../utils/api.js";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import UserDetailContext from "../../context/UserDetailContex.js";

const LotteryTicketPurchase = ({ opened, setOpened, lotteryId, email, }) => {
  const [value, setValue] = useState(null);
  const {
    userDetails: { token },
    setUserDetails,
  } = useContext(UserDetailContext);

  const handleLotteryTicketPurchaseSuccess = () => {
    toast.success("You have purchased your ticket successfully", {
      position: "bottom-right",
    });
    setUserDetails((prev) => ({
      ...prev,
      ticketPurchases: [
        ...prev.ticketPurchases,
        {
          id: lotteryId,
          date: dayjs(value).format("DD/MM/YYYY"),
        },
      ],
    }));
  };

  const { mutate, isLoading } = useMutation({
    mutationFn: () => bookVisit(value, lotteryId, email, token),
    onSuccess: () => handleLotteryTicketPurchaseSuccess(),
    onError: ({ response }) => toast.error(response.data.message),
    onSettled: () => setOpened(false),
  });

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)} // Correctly handle closing the modal
      title="Select your date of visit"
      centered
    >
      <div className="flexColCenter" style={{ gap: "1rem" }}>
        <DatePicker value={value} onChange={setValue} minDate={new Date()} />
        <Button disabled={!value || isLoading} onClick={() => mutate()}>
          Book visit
        </Button>
      </div>
    </Modal>
  );
};

export default LotteryTicketPurchase;
