import type {
  MediaItem,
  MediaType,
  TmdbDetailsResponse,
  TmdbListItem,
  TmdbMovie,
  TmdbTv,
  MediaDetails,
} from "../types/tmdb";

/**
 * Приведення відповідей TMDB до одного вигляду.
 *
 * У макеті три вкладки — «Усі», «Фільми», «Серіали», — і TMDB віддає їх
 * різними полями:
 *
 *   фільм:  { title, release_date, runtime }
 *   серіал: { name,  first_air_date, episode_run_time }
 *
 * Різниця гаситься **один раз, тут**; далі весь застосунок працює з типом
 * MediaItem і про цю різницю не знає взагалі.
 */

/** Вкладки інтерфейсу та шляхи TMDB, що за ними стоять. */
export const TABS = [
  { id: "all", label: "Усі", path: "/trending/all/week?language=uk-UA" },
  { id: "movie", label: "Фільми", path: "/movie/popular?language=uk-UA&page=1" },
  { id: "tv", label: "Серіали", path: "/tv/popular?language=uk-UA&page=1" },
] as const;

/*
  `as const` перетворює масив на кортеж літералів, а не на
  { id: string, label: string }[]. Завдяки цьому тип нижче виводиться сам
  і дорівнює "all" | "movie" | "tv" — тобто список вкладок і тип
  «яка вкладка обрана» ніколи не розійдуться.
*/
export type TabId = (typeof TABS)[number]["id"];

/** Одна вкладка — тип теж виведений із масиву, а не написаний руками. */
export type Tab = (typeof TABS)[number];

/** Вкладка за замовчуванням — коли в адресі нічого немає або написана дурниця. */
export const DEFAULT_TAB_ID: TabId = TABS[0].id;

/**
 * Найкоротший запит, який іде в пошук. Одна літера знаходить пів бази,
 * тож і форма, і живий пошук чекають на другу. Число одне на обох,
 * інакше Enter і набір тексту поводилися б по-різному.
 */
export const MIN_QUERY_LENGTH = 2;

/**
 * Знаходить вкладку за ідентифікатором.
 *
 * Приймає `string | null | undefined`, а не `TabId`, — і це не недогляд.
 * Значення приходить з адреси, а адресу пише користувач: там може бути
 * будь-що, зокрема `?tab=котики`. Тип входу має описувати реальність,
 * а не бажане; невідомий ідентифікатор тихо стає вкладкою за замовчуванням.
 *
 * `?? TABS[0]` наприкінці ще й прибирає `undefined` із типу результату:
 * find сам по собі повертає `Tab | undefined`.
 */
export function findTab(tabId: string | null | undefined): Tab {
  return TABS.find((tab) => tab.id === tabId) ?? TABS[0];
}

/**
 * Захисник типу: чи є цей запис фільмом або серіалом (а не людиною).
 *
 * `item is TmdbMovie | TmdbTv` у поверненні — не косметика. Це так званий
 * type predicate: після `if (isTitle(item))` компілятор ЗНАЄ, що людей
 * далі немає, і дозволяє читати title/name. Зі звичайним `boolean`
 * він би цього не знав.
 */
export function isTitle(item: TmdbListItem): item is TmdbMovie | TmdbTv {
  return item.media_type !== "person";
}

/**
 * Відсіює те, що не є фільмом чи серіалом.
 *
 * /trending/all і /search/multi віддають ще й людей (media_type: "person").
 * Без цього рядка в сітці фільмів час від часу з'являлися б актори
 * із порожнім постером — і це виглядало б як помилка застосунку.
 */
export function onlyTitles(items: readonly TmdbListItem[]): (TmdbMovie | TmdbTv)[] {
  return items.filter(isTitle);
}

/** Чи це серіал — за наявністю поля `name`, властивого лише серіалам. */
function isTv(item: TmdbMovie | TmdbTv): item is TmdbTv {
  return "name" in item;
}

/**
 * Перетворює запис TMDB на MediaItem.
 *
 * @param item сирий запис
 * @param fallbackType тип, коли API не назвав його сам
 */
export function normalizeMedia(
  item: TmdbMovie | TmdbTv,
  fallbackType: MediaType | null = null,
): MediaItem {
  /*
    /trending/all повертає media_type у кожному записі, а /movie/popular
    і /tv/popular — ні: там тип відомий із самого запиту. Тому спершу
    дивимось на відповідь, потім на те, звідки вона прийшла.
  */
  const mediaType: MediaType =
    item.media_type ?? fallbackType ?? (isTv(item) ? "tv" : "movie");

  /*
    `in` — оператор звуження типу. Після цієї перевірки TypeScript
    знає, з яким саме варіантом об'єднання має справу, і дозволяє
    читати поля, властиві лише йому. Без неї `item.name` був би помилкою.
  */
  const title = isTv(item) ? item.name : item.title;
  const releaseDate = isTv(item) ? item.first_air_date : item.release_date;

  return {
    id: item.id,
    mediaType,
    title: title || "Без назви",
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    rating: item.vote_average,
    // Дата приходить як "2019-04-24"; беремо перші чотири символи — рік.
    year: releaseDate ? releaseDate.slice(0, 4) : null,
    overview: item.overview,
  };
}

/** Перетворює відповідь /movie/{id} або /tv/{id} на MediaDetails. */
export function normalizeDetails(
  data: TmdbDetailsResponse,
  mediaType: MediaType,
): MediaDetails {
  /*
    Тривалість теж названа по-різному: у фільму це число runtime,
    у серіала — масив episode_run_time (тривалість однієї серії).
    `?? null` наприкінці прибирає undefined: у нашому типі поле
    оголошене як number | null, і третього стану бути не повинно.
  */
  const runtime = isTv(data)
    ? (data.episode_run_time?.[0] ?? null)
    : (data.runtime ?? null);
  const releaseDate = isTv(data) ? data.first_air_date : data.release_date;

  return {
    ...normalizeMedia(data, mediaType),
    tagline: data.tagline ?? "",
    genres: data.genres ?? [],
    runtime,
    releaseDate: releaseDate ?? null,
  };
}

/** Український підпис типу — для хлібних крихт і поля «Тип». */
export function mediaTypeLabel(mediaType: MediaType): string {
  return mediaType === "tv" ? "Серіал" : "Фільм";
}

/** Перевіряє, що рядок з адреси справді є типом, який ми знаємо. */
export function isMediaType(value: string | undefined): value is MediaType {
  return value === "movie" || value === "tv";
}

/**
 * Дата у вигляді, придатному для читання людиною.
 *
 * TMDB віддає дату рядком "2012-04-25". Показувати її як є — значить
 * показувати формат бази даних; українською це «25 квітня 2012 р.».
 *
 * Тип каже все про поведінку: на вході може не бути дати, на виході може
 * не бути тексту. `string | null → string | null` змушує викличну сторону
 * врахувати обидва випадки — саме тому в DetailsPage стоїть перевірка.
 *
 * Intl.DateTimeFormat — вбудований у браузер інструмент, окрема бібліотека
 * для цього не потрібна.
 */
export function formatDate(isoDate: string | null): string | null {
  if (!isoDate) return null;

  const date = new Date(isoDate);

  // Некоректний рядок дає Invalid Date; краще не показати нічого, ніж «Invalid Date».
  if (Number.isNaN(date.getTime())) return null;

  /*
    timeZone: "UTC" обов'язковий. Рядок "2012-04-25" без часу браузер читає
    як опівніч ЗА UTC, а форматує вже за годинним поясом користувача. Тому
    в будь-якому поясі на захід від Гринвіча (обидві Америки) дата з'їхала б
    на добу назад: замість 25 квітня показалося б 24-те.
  */
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
