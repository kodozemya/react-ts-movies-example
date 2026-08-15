import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

/*
  getElementById повертає HTMLElement | null — сторінка могла б і не мати
  такого елемента. Тому перевірка, а не оклик `!`: `!` вимикає перевірку
  типів у тому місці, де вона єдина й потрібна.
*/
const container = document.getElementById("root");

if (!container) {
  throw new Error('У розмітці немає елемента <div id="root">');
}

/*
  StrictMode — режим суворої перевірки. У розробці він навмисно виконує
  ефекти двічі, щоб виявити ті, які не вміють прибирати за собою.
  Якщо в консолі два запити замість одного — це не помилка, а перевірка:
  саме тому в useTmdb стоїть AbortController.
  У продакшн-збірці StrictMode нічого не подвоює.
*/
createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
