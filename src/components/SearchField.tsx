import type { ChangeEvent } from "react";

import { SearchIcon } from "./icons";

/**
 * Поле пошуку з макета: іконка ліворуч, поле без кнопки.
 *
 * Компонент керований: значення й обробник приходять згори. Власного стану
 * він не має навмисно — той самий текст потрібен і полю, і запиту,
 * тому живе він у спільного батька (HomePage). Це і є «підняти стан».
 */
type SearchFieldProps = {
  value: string;
  /*
    Функція в пропсі теж має тип — і він каже все: що приймає, що повертає.
    `Function` тут був би те саме, що `any`.
  */
  onChange: (value: string) => void;
};

export default function SearchField({ value, onChange }: SearchFieldProps) {
  /*
    ChangeEvent<HTMLInputElement> дає event.target.value типу string.
    З ChangeEvent<HTMLElement> властивості value просто не існувало б —
    і помилку було б видно одразу, а не після кліку в браузері.
  */
  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    onChange(event.target.value);
  }

  return (
    <div className="search">
      <SearchIcon />

      {/*
        <label> обов'язковий, але за макетом його не видно: роль підпису
        виконує placeholder. Клас visually-hidden ховає текст від ока
        й лишає його читалці з екрана. display: none так не працює —
        він ховає елемент і від читалки теж.
      */}
      <label className="visually-hidden" htmlFor="media-search">
        Пошук фільмів і серіалів
      </label>

      <input
        id="media-search"
        className="search__input"
        type="search"
        placeholder="Пошук фільмів і серіалів"
        value={value}
        onChange={handleChange}
        autoComplete="off"
      />
    </div>
  );
}
