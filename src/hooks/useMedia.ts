import { useTmdb } from "./useTmdb";
import {
  findTab,
  normalizeDetails,
  normalizeMedia,
  onlyTitles,
  MIN_QUERY_LENGTH,
} from "../lib/media";
import type { TabId } from "../lib/media";
import type {
  MediaDetails,
  MediaItem,
  MediaType,
  TmdbDetailsResponse,
  TmdbListResponse,
} from "../types/tmdb";

/** Що повертає список для головної сторінки. */
export type MediaListResult = {
  items: MediaItem[];
  isLoading: boolean;
  error: Error | null;
  isSearching: boolean;
};

/**
 * Список для головної сторінки.
 *
 * Одна з двох речей: результати пошуку, якщо в полі щось є, або вміст
 * обраної вкладки, якщо поле порожнє. Компонентам про цю розвилку
 * знати не треба — вони просто отримують список.
 *
 * @param tabId ідентифікатор вкладки: "all" | "movie" | "tv"
 * @param query пошуковий запит ("" = показати вкладку)
 */
export function useMediaList(tabId: TabId, query: string): MediaListResult {
  /*
    Запит, коротший за MIN_QUERY_LENGTH, рахуємо порожнім: одна літера
    показує вкладку, а не тисячу випадкових збігів.
  */
  const trimmed = query.trim().length >= MIN_QUERY_LENGTH ? query.trim() : "";
  const tab = findTab(tabId);

  /*
    /search/multi шукає серед фільмів, серіалів і людей одразу — саме те,
    що потрібно полю «Пошук фільмів і серіалів» із макета.
    encodeURIComponent обов'язковий: назва може містити пробіли, & або
    кирилицю, і без кодування адреса просто зламається.
  */
  const path = trimmed
    ? `/search/multi?language=uk-UA&page=1&query=${encodeURIComponent(trimmed)}`
    : tab.path;

  // Тип-параметр — це те, що перетворює безіменний JSON на відомі дані.
  const { data, isLoading, error } = useTmdb<TmdbListResponse>(path);

  /*
    Тип, який API не назве сам: у результатах вкладки «Фільми» це "movie",
    у пошуку й у «Усі» тип приходить у самій відповіді.

    Приведення `as MediaType` тут чесне й безпечне: у цій гілці tab.id
    точно не "all", а решта двох значень TabId і є MediaType. Компілятор
    сам цього не бачить, бо звуження сталося в іншому виразі.
  */
  const fallbackType: MediaType | null =
    trimmed || tab.id === "all" ? null : (tab.id as MediaType);

  const items = onlyTitles(data?.results ?? []).map((item) =>
    normalizeMedia(item, fallbackType),
  );

  return { items, isLoading, error, isSearching: trimmed !== "" };
}

/** Що повертають деталі. */
export type MediaDetailsResult = {
  details: MediaDetails | null;
  isLoading: boolean;
  error: Error | null;
  isSupported: boolean;
};

/**
 * Деталі одного фільму або серіалу.
 *
 * Шлях залежить від типу: /movie/{id} або /tv/{id}. Це єдина відмінність,
 * і вона теж лишається тут, а не в компоненті сторінки.
 *
 * `mediaType` має тип `MediaType | undefined`, бо саме таким його віддає
 * сторінка після перевірки: сегмент адреси — це будь-який рядок,
 * і перетворити його на відомий тип можна лише захисником (isMediaType).
 */
export function useMediaDetails(
  mediaType: MediaType | undefined,
  id: string | undefined,
): MediaDetailsResult {
  /*
    Адресу пише користувач, тож у ній може бути будь-що: /title/person/5,
    /title/фільм/abc. Тип, якого TMDB не знає, у запит не відправляємо —
    інакше отримали б 404 і повідомлення про помилку мережі там,
    де насправді просто неправильне посилання.
  */
  const isSupported = Boolean(mediaType) && Boolean(id);

  const { data, isLoading, error } = useTmdb<TmdbDetailsResponse>(
    isSupported ? `/${mediaType}/${id}?language=uk-UA` : null,
  );

  /*
    isSupported повертаємо назовні окремо від error. Сторінка має сказати
    «такої сторінки немає», а не «не вдалося завантажити»: це різні речі
    для користувача, хоч результат на екрані й схожий — порожньо.

    Без цього прапорця сторінка не мала б ЖОДНОЇ ознаки, що пішло не так:
    запиту не було, тож error порожній, isLoading = false, data = null —
    і користувач дивився б на назавжди порожній екран.
  */
  if (!data || !mediaType) {
    return { details: null, isLoading, error, isSupported };
  }

  return { details: normalizeDetails(data, mediaType), isLoading, error, isSupported };
}
