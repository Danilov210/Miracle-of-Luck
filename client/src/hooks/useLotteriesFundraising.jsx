import React from "react";
import { isError, useQuery } from "react-query";
import { getAllLotteriesFundraising } from "../utils/api";

const useLotteriesFundraising = () => {
  const { data, isError, isLoading, refetch } = useQuery(
    "allLotteriesfundraising",
    getAllLotteriesFundraising,
    { refetchOnWindowFocus: false }
  );
  return {
    data,
    isError,
    isLoading,
    refetch,
  };
};

export default useLotteriesFundraising;
