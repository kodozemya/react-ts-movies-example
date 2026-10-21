import { useState } from "react";
import type { ChangeEvent, SubmitEvent } from "react";

import { SearchIcon } from "./icons";
import { MIN_QUERY_LENGTH } from "../lib/media";

const ERROR_ID = "media-search-error";

/**
 * Форма пошуку: іконка, поле й кнопка «Знайти».
 *
 * Поле кероване: значення й обробник приходять згори. Сам текст тут
 * не зберігається навмисно: той самий рядок потрібен і полю, і запиту,
 * тому живе він у спільного батька (HomePage). Це і є «підняти стан».
 *
 * Власний стан у форми лише один: текст помилки. Він більше нікому
 * не потрібен, тож піднімати його нема чого.
 */
type SearchFieldProps = {
  value: string;
  /*
    Функція в пропсі теж має тип, і він каже все: що приймає, що повертає.
    `Function` тут був би те саме, що `any`.
  */
  onChange: (value: string) => void;
  /** Отримує вже перевірений і обрізаний запит. */
  onSubmit: (value: string) => void;
};

export default function SearchField({ value, onChange, onSubmit }: SearchFieldProps) {
  /*
    Тип-параметр не потрібен: із "" TypeScript виводить `string`,
    а «немає помилки» тут і є порожній рядок.
  */
  const [error, setError] = useState("");

  /*
    ChangeEvent<HTMLInputElement> дає event.target.value типу string.
    З ChangeEvent<HTMLElement> властивості value просто не існувало б,
    і помилку було б видно одразу, а не після кліку в браузері.
  */
  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    onChange(event.target.value);
    /*
      Помилку прибираємо, щойно людина почала її виправляти. Інакше
      червоний текст висів би під полем, де вже написано правильно.
    */
    if (error) setError("");
  }

  /*
    SubmitEvent<HTMLFormElement>: подія надсилання, і надсилає її саме
    форма. Значення беремо з пропа value, а не з event.target: поле
    кероване, і правда про його текст живе в стані.
  */
  function handleSubmit(event: SubmitEvent<HTMLFormElement>): void {
    /*
      Без preventDefault браузер відправив би форму по-старому:
      перезавантажив би сторінку, і весь стан React пропав би.
    */
    event.preventDefault();

    const trimmed = value.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setError(`Введи щонайменше ${MIN_QUERY_LENGTH} символи назви.`);
      return;
    }

    onSubmit(trimmed);
  }

  return (
    /*
      noValidate вимикає вбудовані підказки браузера: перевірку тут робить
      наш код, і повідомлення має бути одне, наше, а не два різні.
      role="search" підказує читалці з екрана, що це за форма.
    */
    <form className="search-form" role="search" onSubmit={handleSubmit} noValidate>
      {/*
        <label> обов'язковий, але за макетом його не видно: роль підпису
        виконує placeholder. Клас visually-hidden ховає текст від ока
        й лишає його читалці з екрана. display: none так не працює:
        він ховає елемент і від читалки теж.
      */}
      <label className="visually-hidden" htmlFor="media-search">
        Пошук фільмів і серіалів
      </label>

      <div className="search">
        <SearchIcon />

        <input
          id="media-search"
          className="search__input"
          type="search"
          placeholder="Пошук фільмів і серіалів"
          value={value}
          onChange={handleChange}
          autoComplete="off"
          /*
            aria-invalid і aria-describedby зв'язують поле з помилкою:
            читалка скаже «недійсне» і прочитає текст під полем.
          */
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? ERROR_ID : undefined}
        />

        <button type="submit" className="search__button">
          Знайти
        </button>
      </div>

      {/* role="alert" читалка оголошує одразу, без переходу фокусу. */}
      {error && (
        <p id={ERROR_ID} className="search__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
