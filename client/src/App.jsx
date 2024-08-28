import { Suspense, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Website from "./pages/Website";
import Layout from "./components/Layout/Layout";
import LotteriesLike from "./pages/LotteriesLike/LotteriesLike";
import LotteriesMenu from "./pages/LotteriesMenu/LotteriesMenu";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import { ReactQueryDevtools } from "react-query/devtools";
import "react-toastify/dist/ReactToastify.css";
import LotteryLike from "./pages/LotteryLike/LotteryLike";
import UserDetailContext from "./context/UserDetailsContex";
import LotteriesMenuPage from "./pages/LotteriesMenuPage/LotteriesMenuPage";
import ResultsMenuPage from "./pages/ResultsMenuPage/ResultsMenuPage";
import CreateMenuPage from "./pages/CreateMenuPage/CreateMenuPage";

function App() {
  const queryClient = new QueryClient();

  const [userDetails, setUserDetails] = useState({
    favorite: [],
    lotteries: [],
    token: null,
  });
  return (
    <UserDetailContext.Provider value={{ userDetails, setUserDetails }}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Website />} />
                <Route path="/lotteries">
                  <Route index element={<LotteriesMenuPage />} />
                  <Route path=":lotteryId" element={<LotteryLike />} />
                </Route>
                <Route path="/results">
                  <Route index element={<ResultsMenuPage />} />
                  <Route path=":resultId" element={<ResultsMenuPage />} />
                </Route>
                <Route path="/create">
                  <Route index element={<CreateMenuPage />} />
                  <Route path=":createId" element={<CreateMenuPage />} />
                </Route>

                <Route path="/lotteries">
                  <Route path="like">
                    <Route index element={<LotteriesLike />} />{" "}
                    <Route path=":lotteryId" element={<LotteriesLike />} />{" "}
                  </Route>
                </Route>


              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        <ToastContainer />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </UserDetailContext.Provider>
  );
}

export default App;
