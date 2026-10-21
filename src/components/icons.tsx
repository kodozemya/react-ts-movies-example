/**
 * Іконки застосунку.
 *
 * Чому окремий файл. Зірочку малюють і картка, і сторінка деталей.
 * Поки вона лежала всередині MediaCard.tsx, сторінка деталей мусила
 * імпортувати шматок картки — виходило, що сторінка залежить від картки,
 * хоча спільна в них лише картинка.
 *
 * Правило просте: **щойно річ потрібна двом, вона переїжджає туди,
 * де до неї однаково близько обом.**
 *
 * Типів тут немає навмисно: у жодної іконки немає пропсів, тож і описувати
 * нічого. `type LogoIconProps = {}` заради симетрії — це зайвий рядок,
 * який нічого не перевіряє. Тип, що повертається (JSX.Element), TypeScript
 * виводить сам.
 *
 * Усі три знаки намальовано вручну: набір vuesax і фірмовий логотип
 * із макета не експортувалися.
 *
 * aria-hidden="true" на кожній іконці навмисно: це декорація, а не зміст.
 * Читалка з екрана має прочитати підпис поруч («Оцінка»), а не описувати
 * картинку.
 */

/** Знак застосунку в шапці. Розмір із макета — 40×40. */
export function LogoIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M3 4 L3 28 L15 16 Z" fill="var(--color-primary)" />
      <path
        d="M14 4 L14 28 L26 16 Z"
        fill="var(--color-secondary)"
        opacity="0.85"
      />
    </svg>
  );
}

/** Лупа в полі пошуку. */
export function SearchIcon() {
  return (
    <svg
      className="search__icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

/** Зірочка біля оцінки. Розмір із макета — 16×16. */
export function StarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.4l6-.8Z" />
    </svg>
  );
}

/** Сонце на кнопці світлої теми. */
export function SunIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
