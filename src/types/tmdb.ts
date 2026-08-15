/**
 * Типи даних TMDB.
 *
 * Це найважливіший файл проєкту. Дані з мережі — єдине місце, де TypeScript
 * не може перевірити нічого сам: сервер віддає JSON, а `response.json()`
 * повертає `any`. Далі цей `any` розтікається по всьому застосунку
 * і тихо вимикає перевірку типів там, куди потрапив.
 *
 * Тому межа проводиться тут, і проводиться двічі:
 *   1. СИРІ типи — форма, в якій дані приходять від TMDB (як є, з усіма
 *      незручностями: title у фільму, name у серіала);
 *   2. НАШ тип — форма, в якій із ними працює застосунок.
 *
 * Другий крок і є та робота, яку виконує lib/media.ts.
 */

/* ========================================================================
   1. СИРІ ТИПИ — що справді віддає TMDB
   ======================================================================== */

/** Спільна частина запису фільму й серіала. */
type TmdbCommon = {
  readonly id: number;
  /*
    `| null`, а не просто string: TMDB справді віддає null для стрічок
    без постера. Без цього `| null` компілятор дозволив би підставити
    poster_path прямо в src — і на екрані з'явився б зламаний значок.
  */
  readonly poster_path: string | null;
  readonly backdrop_path: string | null;
  readonly vote_average: number;
  readonly overview: string;
};

/** Фільм: назва в полі title, дата — release_date. */
export interface TmdbMovie extends TmdbCommon {
  readonly media_type?: "movie";
  readonly title: string;
  readonly release_date?: string;
  readonly runtime?: number | null;
}

/** Серіал: назва в полі name, дата — first_air_date. */
export interface TmdbTv extends TmdbCommon {
  readonly media_type?: "tv";
  readonly name: string;
  readonly first_air_date?: string;
  readonly episode_run_time?: readonly number[];
}

/** Людина — /trending/all і /search/multi віддають і їх теж. */
export type TmdbPerson = {
  readonly id: number;
  readonly media_type: "person";
  readonly name: string;
};

/**
 * Будь-який запис зі списку.
 *
 * Це **розмічене об'єднання**: поле `media_type` каже, який саме варіант
 * перед нами, і TypeScript уміє звужувати тип за перевіркою цього поля.
 * Саме тому lib/media.ts може написати `item.media_type === "person"`
 * і компілятор погодиться, що в решті гілки людей уже немає.
 */
export type TmdbListItem = TmdbMovie | TmdbTv | TmdbPerson;

/** Відповідь списку: TMDB загортає результати у сторінку. */
export type TmdbListResponse = {
  readonly page: number;
  readonly results: readonly TmdbListItem[];
  readonly total_pages: number;
  readonly total_results: number;
};

/** Жанр у деталях. */
export type Genre = {
  readonly id: number;
  readonly name: string;
};

/** Відповідь /movie/{id} або /tv/{id}. */
export type TmdbDetailsResponse = (TmdbMovie | TmdbTv) & {
  readonly tagline?: string;
  readonly genres?: readonly Genre[];
};

/* ========================================================================
   2. НАШ ТИП — форма, в якій дані живуть у застосунку
   ======================================================================== */

/** Фільм або серіал — те, з чим працюють усі компоненти. */
export type MediaType = "movie" | "tv";

export type MediaItem = {
  readonly id: number;
  readonly mediaType: MediaType;
  readonly title: string;
  readonly posterPath: string | null;
  readonly backdropPath: string | null;
  readonly rating: number;
  readonly year: string | null;
  readonly overview: string;
};

/** Те саме плюс поля, які приходять лише в деталях. */
export interface MediaDetails extends MediaItem {
  readonly tagline: string;
  readonly genres: readonly Genre[];
  readonly runtime: number | null;
  readonly releaseDate: string | null;
}
