import React from "react";
import { isError, useQuery } from "react-query";
import { getAllLotteriesLike } from "../utils/api";

const useLotteriesLike = () => {
  const { data, isError, isLoading, refetch } = useQuery(
    "allLotteriesLike",
    getAllLotteriesLike,
    { refetchOnWindowFocus: false }
  );
  return {
    data,
    isError,
    isLoading,
    refetch,
  };
};

export default useLotteriesLike;
