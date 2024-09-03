import React from "react";
import { isError, useQuery } from "react-query";
import { getAllLotteriesClassic } from "../utils/api";

const useLotteriesClassic = () => {
  const { data, isError, isLoading, refetch } = useQuery(
    "allLotteriesclassic",
    getAllLotteriesClassic,
    { refetchOnWindowFocus: false }
  );
  return {
    data,
    isError,
    isLoading,
    refetch,
  };
};

export default useLotteriesClassic;
