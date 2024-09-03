import { Suspense, useState } from "react";
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
import { MantineProvider } from "@mantine/core";


function App() {
  const queryClient = new QueryClient();

  const [userDetails, setUserDetails] = useState({
    favorite: [],
    LotteryTicketPurchase: [],
    token: null,
    DataOfBirth: null,
    accountStatus: null,
    balance: null,

  });

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS> {/* Wrap with MantineProvider */}
      <UserDetailContext.Provider value={{ userDetails, setUserDetails }}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Website />} />

                  {/* Main Lotteries route */}
                  <Route path="/lotteries">
                    <Route index element={<LotteriesMenuPage />} />

                    {/* Nested route for LotteriesLike */}
                    <Route path="LotteryLike">
                      <Route index element={<LotteriesLike />} />
                      <Route path=":lotteryId" element={<LotteryLike />} />
                    </Route>

                    {/* Nested route for LotteriesFundraising */}
                    <Route path="LotteryFundraising">
                      <Route index element={<LotteriesFundraising />} />
                      <Route path=":lotteryId" element={<LotteryFundraising />} />
                    </Route>

                    {/* Nested route for LotteriesClassic */}
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
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
          <ToastContainer />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </UserDetailContext.Provider>
    </MantineProvider >
  );
}

export default App;
