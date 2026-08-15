import { Link, useParams } from "react-router-dom";

import StatusMessage from "../components/StatusMessage";
import { StarIcon } from "../components/icons";
import { useMediaDetails } from "../hooks/useMedia";
import { posterUrl, backdropUrl } from "../api/tmdb";
import { formatDate, isMediaType, mediaTypeLabel } from "../lib/media";

/**
 * Сторінка деталей — маршрут /title/:mediaType/:id.
 *
 * Один маршрут на фільм і на серіал: різниця між ними лише в шляху запиту,
 * і вона захована в useMediaDetails. Два окремі майже однакові маршрути
 * довелося б правити парами.
 */
export default function DetailsPage() {
  /*
    useParams дістає значення динамічних частин адреси. Для
    /title/movie/299534 це { mediaType: "movie", id: "299534" } —
    саме рядки, не числа: адреса складається з тексту.

    Тип-параметр описує, які сегменти має маршрут. Без нього одруківка
    в назві сегмента (params.type замість params.mediaType) мовчки дала б
    undefined; із ним це помилка компіляції.
  */
  const { mediaType, id } = useParams<{ mediaType: string; id: string }>();

  /*
    Сегмент адреси — це будь-який рядок: користувач може набрати
    /title/qwerty/1 руками. isMediaType — захисник типу: після нього
    компілятор ЗНАЄ, що всередині "movie" | "tv", і дозволяє
    передати значення далі. Приведення через `as MediaType`
    тут було б брехнею компілятору.
  */
  const safeType = isMediaType(mediaType) ? mediaType : undefined;

  const { details, isLoading, error, isSupported } = useMediaDetails(safeType, id);

  /*
    Адреса на кшталт /title/person/5 — не помилка мережі, а неправильне
    посилання. Без цієї гілки користувач дивився б на порожній екран:
    запиту не було, тож і завантаження, і помилки немає.
  */
  if (!isSupported) {
    return (
      <div className="container page-message">
        <StatusMessage>
          Такої сторінки немає. <Link to="/">Повернутися до каталогу</Link>
        </StatusMessage>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container page-message">
        <StatusMessage>Завантажуємо…</StatusMessage>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page-message">
        <StatusMessage tone="error">
          Не вдалося завантажити сторінку. {error.message}
        </StatusMessage>
      </div>
    );
  }

  /*
    Даних ще немає й помилки немає — перший рендер до запуску ефекту.

    Ранній вихід — це ще й звуження типу. Після цього рядка details має тип
    MediaDetails, а не MediaDetails | null, і компілятор перестає вимагати
    перевірку на кожному зверненні до полів нижче.
  */
  if (!details) return null;

  const backdrop = backdropUrl(details.backdropPath);
  const poster = posterUrl(details.posterPath);

  // "2012-04-25" — це формат бази даних. Людині показуємо «25 квітня 2012 р.».
  const releaseDate = formatDate(details.releaseDate);

  return (
    <article className="container details">
      <div className="details__backdrop">
        {backdrop && (
          <img
            className="details__backdrop-image"
            src={backdrop}
            alt=""
            /*
              alt="" навмисно порожній: банер — це декорація, а назва
              вже написана текстом поруч. Читалка пропустить його,
              замість того щоб удруге читати ту саму назву.
            */
          />
        )}

        {/*
          Модифікатор --overlap піднімає панель на банер. Вмикаємо його лише
          коли банер справді є: backdrop_path у TMDB часто дорівнює null,
          і без цієї умови панель заїжджала б угору в порожнечу — під шапку.
        */}
        <div
          className={
            backdrop ? "details__plate details__plate--overlap" : "details__plate"
          }
        >
          <ol className="breadcrumbs">
            <li>
              <Link to="/">Кінозал</Link>
            </li>
            <li className="breadcrumbs__divider" aria-hidden="true">
              /
            </li>
            <li>
              <Link to={`/?tab=${details.mediaType}`}>
                {details.mediaType === "tv" ? "Серіали" : "Фільми"}
              </Link>
            </li>
          </ol>

          <h1 className="details__title">{details.title}</h1>
        </div>
      </div>

      <div className="details__body">
        {poster && (
          <img
            className="details__poster"
            src={poster}
            alt={`Постер: ${details.title}`}
          />
        )}

        <div className="details__info">
          {details.tagline && <p className="details__tagline">{details.tagline}</p>}

          <p className="details__overview">
            {/*
              Український опис у TMDB є не для кожної стрічки — тоді overview
              приходить порожнім рядком. Порожній абзац виглядає як помилка
              верстки, тому підставляємо чесне пояснення.
            */}
            {details.overview || "Опис українською для цієї стрічки ще не додали."}
          </p>

          {details.rating > 0 && (
            <p className="rating">
              <StarIcon />
              <span className="visually-hidden">Оцінка</span>
              {details.rating.toFixed(1)}
            </p>
          )}

          {/*
            <dl> — список означень: пара «термін → опис». Саме те, що треба
            для «Тип → Фільм». Два сусідні <p> такого зв'язку не несуть.
          */}
          <dl className="facts">
            <dt className="facts__term">Тип</dt>
            <dd className="facts__value">{mediaTypeLabel(details.mediaType)}</dd>

            {/*
              Дві умови, а не одна: releaseDate — це текст для людини,
              details.releaseDate — початкове "2012-04-25" для атрибута
              dateTime. Компілятор не знає, що перше не буває без другого,
              тож перевіряються обидва — і в dateTime не потрапить null.
            */}
            {details.releaseDate && releaseDate && (
              <>
                <dt className="facts__term">Дата виходу</dt>
                {/*
                  <time dateTime> лишає машинам дату в форматі, який вони
                  розуміють, а людині показує текст. Пошуковик і читалка
                  з екрана прочитають саме dateTime.
                */}
                <dd className="facts__value">
                  <time dateTime={details.releaseDate}>{releaseDate}</time>
                </dd>
              </>
            )}

            {/*
              runtime має тип number | null, тож просто details.runtime > 0
              компілятор не пропустив би без перевірки на null.
            */}
            {details.runtime !== null && details.runtime > 0 && (
              <>
                <dt className="facts__term">Тривалість</dt>
                <dd className="facts__value">{details.runtime} хв</dd>
              </>
            )}

            {details.genres.length > 0 && (
              <>
                <dt className="facts__term">Жанри</dt>
                <dd className="facts__value">
                  {details.genres.map((genre) => genre.name).join(", ")}
                </dd>
              </>
            )}
          </dl>
        </div>
      </div>
    </article>
  );
}
