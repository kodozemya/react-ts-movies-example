import { Route, Routes } from "react-router-dom";

import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import DetailsPage from "./pages/DetailsPage";
import ScrollToTop from "./components/ScrollToTop";
import StatusMessage from "./components/StatusMessage";

/**
 * Каркас застосунку: спільна шапка й таблиця маршрутів.
 *
 * У App немає ні стану, ні запитів — лише «що показувати за якою адресою».
 * Щойно сюди почне переїжджати логіка, її місце — у сторінці або хуку.
 */
export default function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/title/:mediaType/:id" element={<DetailsPage />} />

          {/*
            path="*" ловить усі інші адреси. Без нього /якась-дурниця
            показала б порожню сторінку без жодного пояснення.
          */}
          <Route
            path="*"
            element={
              <div className="container page-message">
                <StatusMessage>Такої сторінки немає.</StatusMessage>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
