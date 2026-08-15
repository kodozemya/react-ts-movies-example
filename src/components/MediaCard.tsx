import { Link } from "react-router-dom";

import { posterUrl } from "../api/tmdb";
import { StarIcon } from "./icons";
import type { MediaItem } from "../types/tmdb";

/**
 * Картка з макета: постер, оцінка в куті, назва під ним.
 *
 * `item: MediaItem` — не `item: object` і не `any`. Компонент отримує
 * запис, який уже пройшов normalizeMedia, і про сирі поля TMDB
 * (title проти name) нічого не знає.
 */
type MediaCardProps = {
  item: MediaItem;
};

export default function MediaCard({ item }: MediaCardProps) {
  /*
    poster має тип string | null — саме тому нижче стоїть перевірка.
    Це не «зайва обережність», а вимога типу: підставити null у src
    компілятор просто не дозволить.
  */
  const poster = posterUrl(item.posterPath);

  // vote_average приходить як 7.834 — на картці потрібна одна цифра після коми.
  const rating = item.rating > 0 ? item.rating.toFixed(1) : null;

  return (
    <li className="card">
      <Link className="card__link" to={`/title/${item.mediaType}/${item.id}`}>
        <div className="card__poster">
          {poster ? (
            /*
              loading="lazy" каже браузеру не вантажити постери, до яких
              користувач ще не долистав. На сторінці з двадцятьма картками
              це різниця між двома мегабайтами й двадцятьма.
            */
            <img src={poster} alt={`Постер: ${item.title}`} loading="lazy" />
          ) : (
            /*
              poster_path у TMDB часто дорівнює null. Без цієї гілки
              на місці постера був би зламаний значок зображення.
            */
            <p className="card__poster-empty">Постера немає</p>
          )}

          {rating && (
            <p className="rating card__rating">
              <StarIcon />
              <span className="visually-hidden">Оцінка</span>
              {rating}
            </p>
          )}
        </div>

        <h3 className="card__title">{item.title}</h3>
      </Link>
    </li>
  );
}
