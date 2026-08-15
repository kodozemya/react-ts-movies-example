import { useEffect, useState } from "react";
import { tmdbFetch } from "../api/tmdb";

/**
 * Що повертає будь-який запит: дані, ознака завантаження, помилка.
 *
 * Іменований тип замість вбудованого об'єкта в сигнатурі — щоб форму
 * було видно з одного погляду і щоб її не довелося повторювати
 * у кожному хуку, що будується поверх цього.
 */
export type RequestState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

/**
 * Базовий хук запиту до TMDB. Уся робота з мережею — тут; хуки з useMedia.ts
 * (useMediaList, useMediaDetails) лише підставляють свій шлях.
 *
 * `<T>` тут робить справжню роботу: `useTmdb<TmdbListResponse>(path)` віддає
 * `data` типу `TmdbListResponse | null`, і `data.results` уже підказується
 * редактором. Без тип-параметра всюди був би `any`, і одруківка
 * `data.resluts` мовчки дала б undefined.
 *
 * @param path шлях запиту; `null` означає «не запитувати нічого»
 */
export function useTmdb<T>(path: string | null): RequestState<T> {
  /*
    Явний тип-параметр у useState обов'язковий саме тут: початкове значення
    null, і без <T | null> TypeScript вивів би тип `null` — після чого
    setData(відповідь) став би помилкою.
  */
  const [data, setData] = useState<T | null>(null);

  /*
    Початкове значення — true, якщо шлях є, і це не дрібниця.

    useEffect запускається ПІСЛЯ першого малювання. Якби isLoading починався
    з false, перший кадр показав би стан «даних немає» — на головній це
    повідомлення «Тут поки порожньо», яке блимало б перед кожним списком.
    Запит справді вже в дорозі на момент першого малювання, тож і стан
    від самого початку має бути «завантажуємо».

    Тут тип виводиться сам — boolean; писати <boolean> зайве.
  */
  const [isLoading, setIsLoading] = useState(Boolean(path));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!path) {
      // Запиту не буде — прибираємо і дані, і сліди попереднього запиту.
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    /*
      AbortController дозволяє скасувати запит, який більше не потрібен.
      Без нього виходить ось що: користувач швидко друкує «бет», летять три
      запити — «б», «бе», «бет» — і повертаються вони в довільному порядку.
      Якщо відповідь на «бе» прийде останньою, на екрані опиняться
      результати для «бе», хоча в полі написано «бет».
    */
    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    tmdbFetch<T>(path, controller.signal)
      .then(setData)
      .catch((requestError: unknown) => {
        /*
          catch отримує `unknown`, а не `Error`: кинути в JavaScript можна
          що завгодно, хоч рядок. Тому спершу звужуємо тип перевіркою
          instanceof — і лише потім читаємо .name і .message.
        */
        if (requestError instanceof Error) {
          /*
            Скасований запит теж потрапляє в catch — але це не помилка,
            а наше власне рішення. Показувати її користувачеві не можна.
          */
          if (requestError.name === "AbortError") return;
          setError(requestError);
          return;
        }

        setError(new Error("Невідома помилка запиту"));
      })
      .finally(() => {
        // Після скасування стан чіпати не можна: цим ефектом уже ніхто не володіє.
        if (controller.signal.aborted) return;
        setIsLoading(false);
      });

    /*
      Функція очищення. React викликає її перед наступним запуском ефекту
      і коли компонент зникає з екрана. Це те саме місце, де прибирають
      таймери й підписки.
    */
    return () => controller.abort();
  }, [path]); // ефект перезапускається лише коли змінився шлях запиту

  return { data, isLoading, error };
}
