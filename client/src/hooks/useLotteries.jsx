import React from "react";
import { isError, useQuery } from "react-query";
import { getAllLotteries } from "../utils/api";

const useLotteries = () => {
  const { data, isError, isLoading, refetch } = useQuery(
    "allLotteries",
    getAllLotteries,
    { refetchOnWindowFocus: false }
  );
  return {
    data,
    isError,
    isLoading,
    refetch,
  };
};

export default useLotteries;
