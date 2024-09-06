import React, { Suspense, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Website from "./pages/Website";
import Layout from "./components/Layout/Layout";
import LotteryLike from "./pages/LotteryLike/LotteryLike";
import LotteriesLike from "./pages/LotteriesLike/LotteriesLike";
import LotteryFundraising from "./pages/LotteryFundraising/LotteryFundraising";
import LotteriesFundraising from "./pages/LotteriesFundraising/LotteriesFundraising";
import LotteryClassic from "./pages/LotteryClassic/LotteryClassic";
import LotteriesClassic from "./pages/LotteriesClassic/LotteriesClassic";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import { ReactQueryDevtools } from "react-query/devtools";
import "react-toastify/dist/ReactToastify.css";
import UserDetailContext from "./context/UserDetailContext";
import LotteriesMenuPage from "./pages/LotteriesMenuPage/LotteriesMenuPage";
import ResultsMenuPage from "./pages/ResultsMenuPage/ResultsMenuPage";
import CreateMenuPage from "./pages/CreateMenuPage/CreateMenuPage";
import OwnedLotteries from "./pages/OwnedLotteries/OwnedLotteries";
import OwnedTickets from "./pages/OwnedTickets/OwnedTickets";
import { MantineProvider } from "@mantine/core";
import UserDetails from "./pages/UserDetails/UserDetails";
import Transactions from "./pages/Transactions/Transactions";


function App() {
  const queryClient = new QueryClient();

  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    fullName: "",
    picture: "",
    token: null,
    DataOfBirth: null,
    balance: null,
    email: ""
  });

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <UserDetailContext.Provider value={{ userDetails, setUserDetails }}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Website />} />
                  <Route path="/lotteries">
                    <Route index element={<LotteriesMenuPage />} />
                    <Route path="LotteryLike">
                      <Route index element={<LotteriesLike />} />
                      <Route path=":lotteryId" element={<LotteryLike />} />
                    </Route>
                    <Route path="LotteryFundraising">
                      <Route index element={<LotteriesFundraising />} />
                      <Route path=":lotteryId" element={<LotteryFundraising />} />
                    </Route>
                    <Route path="LotteryClassic">
                      <Route index element={<LotteriesClassic />} />
                      <Route path=":lotteryId" element={<LotteryClassic />} />
                    </Route>
                  </Route>
                  <Route path="/results">
                    <Route index element={<ResultsMenuPage />} />
                    <Route path=":resultId" element={<ResultsMenuPage />} />
                  </Route>
                  <Route path="/create">
                    <Route index element={<CreateMenuPage />} />
                    <Route path=":createId" element={<CreateMenuPage />} />
                  </Route>

                  {/*  Owned Tickets Route*/}
                  <Route path="/ownedtickets">
                    <Route index element={<OwnedTickets />} />
                    <Route path="Fundraising/:lotteryId" element={<LotteryFundraising />} />
                    <Route path="Classic/:lotteryId" element={<LotteryClassic />} />
                    <Route path="Like/:lotteryId" element={<LotteryLike />} />
                  </Route>

                  {/*  Owned Lotteries Route */}
                  <Route path="/ownedlotteries">
                    <Route index element={<OwnedLotteries />} />
                    <Route path="LotteryLike/:lotteryId" element={<LotteryLike />} />
                    <Route path="LotteryFundraising/:lotteryId" element={<LotteryFundraising />} />
                    <Route path="LotteryClassic/:lotteryId" element={<LotteryClassic />} />
                  </Route>
                  {/* User Details Route */}
                  <Route path="/userdetails">
                    <Route index element={<UserDetails />} />
                  </Route>

                  {/* User Details Route */}
                  <Route path="/Transactions">
                    <Route index element={<Transactions />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
          <ToastContainer />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </UserDetailContext.Provider>
    </MantineProvider>
  );
}

export default App;
