import { Link, useLocation, useSearchParams } from "react-router-dom";

import { LogoIcon } from "./icons";

/**
 * Навбар із макета: логотип ліворуч, посилання праворуч.
 *
 * Пропсів немає — тип пропсів теж не потрібен. Писати `type HeaderProps = {}`
 * заради симетрії не варто: порожній тип нічого не перевіряє й лише додає рядків.
 */
export default function Header() {
  /*
    Тут не можна взяти NavLink, хоч він і створений саме для навігації.

    NavLink сам підсвічує активний пункт, але порівнює лише ШЛЯХ адреси —
    те, що до знака питання. У наших посилань шлях однаковий у обох ("/"),
    а різняться вони параметром: ?tab=movie і ?tab=tv. Для NavLink вони
    невідрізнимі, тож на головній він підсвітив би обидва одразу.

    Тому беремо звичайний Link і порівнюємо параметр самі.
  */
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab");

  /*
    Параметр описаний як `string`, а не як TabId, навмисно: тут ми
    порівнюємо з тим, що прийшло з адреси, а адреса — це довільний текст.
    Тип, що повертається, TypeScript виводить сам — string.
  */
  function linkClass(tabId: string) {
    const isActive = pathname === "/" && currentTab === tabId;
    return isActive ? "header__link header__link--active" : "header__link";
  }

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo" aria-label="Кінозал, на головну">
          <LogoIcon />
          <span className="visually-hidden">Кінозал</span>
        </Link>

        <nav className="header__nav" aria-label="Головне меню">
          {/*
            Link замість <a>: він не перезавантажує сторінку, а перемикає
            маршрут усередині застосунку.

            aria-current="page" — те саме, що клас, тільки для читалки
            з екрана: колір вона не бачить, а цей атрибут почує.
          */}
          <Link
            to="/?tab=movie"
            className={linkClass("movie")}
            aria-current={currentTab === "movie" ? "page" : undefined}
          >
            Фільми
          </Link>
          <Link
            to="/?tab=tv"
            className={linkClass("tv")}
            aria-current={currentTab === "tv" ? "page" : undefined}
          >
            Серіали
          </Link>
        </nav>
      </div>
    </header>
  );
}
