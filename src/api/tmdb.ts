/**
 * Усе, що стосується TMDB, зібрано в цьому файлі: адреса, токен, обробка
 * відповіді. Компоненти про TMDB не знають нічого — вони просто просять дані.
 *
 * Навіщо так: коли завтра зміниться версія API або з'явиться власний бекенд,
 * правити доведеться один файл, а не двадцять компонентів.
 */

const BASE_URL = "https://api.themoviedb.org/3";

/**
 * Токен читається з .env через import.meta.env — так Vite підставляє
 * змінні оточення. Префікс VITE_ обов'язковий: без нього змінна
 * лишиться на боці збирача й у код браузера не потрапить.
 *
 * Тип цієї змінної описано в src/vite-env.d.ts — інакше вона мала б тип
 * `any`, і одруківка VITE_TMDB_TOKN пройшла б перевірку мовчки.
 */
const TOKEN = import.meta.env.VITE_TMDB_TOKEN;

/** Бази для картинок: w500 для постера, w1280 для банера на сторінці деталей. */
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

/**
 * Виконує запит до TMDB.
 *
 * Тип-параметр `<T>` — це обіцянка того, хто викликає: «я знаю, що звідси
 * прийде TmdbListResponse». TypeScript цю обіцянку не перевіряє (перевірити
 * відповідь чужого сервера він не може в принципі), але вона робить тип
 * явним і одним — замість `any`, що розтікся б по всьому застосунку.
 *
 * Якщо потрібна справжня перевірка форми відповіді — беруть zod чи valibot.
 * Для навчального проєкту досить чесно названого типу.
 *
 * @param path шлях без бази, напр. "/movie/popular?page=1"
 * @param signal сигнал для скасування запиту
 */
export async function tmdbFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  /*
    Зрозуміла помилка замість загадкової 401. Якщо токена немає,
    краще сказати про це прямо, ніж змусити студента гадати,
    чому TMDB відповідає «Invalid API key».
  */
  if (!TOKEN) {
    throw new Error(
      "Немає токена TMDB. Скопіюй .env.example у .env і встав туди свій токен.",
    );
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/json",
    },
    signal,
  });

  /*
    ГОЛОВНЕ: fetch НЕ кидає помилку на відповідь 404 чи 500.
    Він відхиляє проміс лише коли запит не відбувся взагалі —
    немає мережі, зірвано з'єднання. Тому response.ok перевіряють руками,
    інакше застосунок спробує намалювати помилку сервера як список фільмів.
  */
  if (!response.ok) {
    throw new Error(`TMDB відповів статусом ${response.status}`);
  }

  return (await response.json()) as T;
}

/**
 * Повна адреса постера.
 *
 * Повертає `string | null`, а не `string`: poster_path у TMDB часто дорівнює
 * null, і тип змушує компонент це врахувати — тоді картка малює заглушку.
 */
export function posterUrl(posterPath: string | null): string | null {
  return posterPath ? `${POSTER_BASE_URL}${posterPath}` : null;
}

/** Повна адреса банера (широкого кадру) для сторінки деталей. */
export function backdropUrl(backdropPath: string | null): string | null {
  return backdropPath ? `${BACKDROP_BASE_URL}${backdropPath}` : null;
}
