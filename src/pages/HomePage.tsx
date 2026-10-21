import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import SearchField from "../components/SearchField";
import FilterTabs from "../components/FilterTabs";
import MediaGrid from "../components/MediaGrid";
import StatusMessage from "../components/StatusMessage";
import { useMediaList } from "../hooks/useMedia";
import { useDebounced } from "../hooks/useDebounced";
import { findTab, DEFAULT_TAB_ID } from "../lib/media";
import type { TabId } from "../lib/media";

/**
 * Головна сторінка: титул, пошук, вкладки й сітка.
 *
 * Тут живе спільний стан — обрана вкладка й текст пошуку. Їх потребують
 * і поле, і вкладки, і запит, тож вони підняті до їхнього найближчого
 * спільного батька. Це і є правило «підняти стан».
 *
 * Але живуть вони в РІЗНИХ місцях, і це головна ідея цього файлу.
 */
export default function HomePage() {
  /*
    ВКЛАДКА ЖИВЕ В АДРЕСІ, а не в useState.

    Причина не в красі. У шапці є посилання «Фільми» → /?tab=movie.
    Якби вкладка лежала в useState, таке посилання перемкнуло б адресу
    й нічого більше: сторінка лишилася б на вкладці «Усі». Компонент
    просто не має звідки дізнатися, що адреса змінилася.

    Наслідки того, що вкладка тепер в адресі:
      • посилання в шапці й хлібні крихти нарешті працюють;
      • кнопка «назад» повертає на попередню вкладку;
      • посиланням на вкладку можна поділитися.

    Це загальне правило: **якщо стан має пережити перезавантаження
    сторінки або потрапити в чуже посилання — його місце в адресі.**

    Типи тут теж лягають інакше, ніж із useState. searchParams.get("tab")
    віддає `string | null` — і жодного TabId звідти взятися не може:
    в адресі буває що завгодно. Перетворює одне на інше findTab, тому
    activeTab.id уже має тип TabId і підходить пропсу FilterTabs.
  */
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = findTab(searchParams.get("tab"));

  function handleTabChange(tabId: TabId): void {
    /*
      Вкладку за замовчуванням в адресу не пишемо: /?tab=all і / — це
      та сама сторінка, і зайвий параметр тільки засмічує посилання.
    */
    setSearchParams(tabId === DEFAULT_TAB_ID ? {} : { tab: tabId });
  }

  /*
    А ТЕКСТ ПОШУКУ ЛИШАЄТЬСЯ В useState — навмисно.

    Він змінюється на кожне натискання клавіші. В адресі це означало б
    сім записів в історії на слово «месники»: сім натискань «назад»,
    щоб повернутися туди, звідки прийшов.

    Тип-параметр тут не потрібен: із "" TypeScript виводить `string`,
    а це саме те, що треба. Явний <TabId> був би потрібен для вкладки —
    але вкладка тепер живе в адресі, а не в стані.
  */
  const [query, setQuery] = useState("");

  /*
    У полі — те, що користувач друкує зараз (query). У запит іде те,
    що «встоялося» (debouncedQuery). Завдяки цьому поле не гальмує,
    а запит летить один раз на слово, а не на кожну літеру.
  */
  const debouncedQuery = useDebounced(query);

  /*
    Enter або кнопка «Знайти» не чекають на дебаунс: форма вже перевірила
    текст, тож він іде в запит одразу. Щойно людина друкує далі, query
    відходить від надісланого, і знову працює дебаунс.
  */
  const [submittedQuery, setSubmittedQuery] = useState("");
  const searchQuery = query.trim() === submittedQuery ? submittedQuery : debouncedQuery;

  const { items, isLoading, error, isSearching } = useMediaList(
    activeTab.id,
    searchQuery,
  );

  return (
    <>
      <section className="container hero">
        <h1 className="hero__title">Кінозал</h1>
        <p className="hero__text">
          Каталог фільмів і серіалів на даних{" "}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            /*
              rel="noopener noreferrer" — обов'язкова пара до target="_blank".
              noopener не дає чужій сторінці керувати нашою вкладкою через
              window.opener, noreferrer не розповідає їй, звідки прийшов
              користувач.
            */
            rel="noopener noreferrer"
          >
            The Movie Database
          </a>
          . Погортай популярне або знайди щось конкретне через пошук.
        </p>

        {/*
          setQuery і setSubmittedQuery підходять під типи пропсів напряму:
          сеттер із useState приймає значення типу T. Обгортка
          (value) => setQuery(value) нічого не додала б.
        */}
        <SearchField
          value={query}
          onChange={setQuery}
          onSubmit={setSubmittedQuery}
        />

        {/*
          Вкладки ховаємо під час пошуку: результати пошуку не належать
          жодній із них, і підсвічена вкладка над чужим списком
          просто збиває з пантелику.
        */}
        {!isSearching && (
          <FilterTabs active={activeTab.id} onChange={handleTabChange} />
        )}
      </section>

      <section className="container">
        <h2 className="section-title">
          {isSearching ? `Пошук: «${searchQuery.trim()}»` : activeTab.label}
          {/*
            Кількість показуємо лише коли є що рахувати — «Усі (0)»
            під час завантаження виглядає як порожній каталог.
          */}
          {items.length > 0 && (
            <span className="section-title__count">({items.length})</span>
          )}
        </h2>

        {/*
          Чотири стани, і кожен має свій вигляд. Порядок важливий:
          помилка йде перед завантаженням, бо після невдалого запиту
          isLoading уже false, а error — заповнений.
        */}
        {error && (
          <StatusMessage tone="error">
            Не вдалося завантажити дані. {error.message}
          </StatusMessage>
        )}

        {isLoading && <StatusMessage>Завантажуємо…</StatusMessage>}

        {/*
          Умова довша, ніж хотілося б, але кожна її частина потрібна:
          порожній список — це «нічого не знайдено» тільки тоді, коли запит
          уже завершився і не впав. Інакше повідомлення блимало б
          під час кожного завантаження.
        */}
        {!isLoading && !error && items.length === 0 && (
          <StatusMessage>
            {isSearching
              ? `За запитом «${searchQuery.trim()}» нічого не знайшлося. Спробуй іншу назву.`
              : "Тут поки порожньо."}
          </StatusMessage>
        )}

        {!isLoading && !error && items.length > 0 && <MediaGrid items={items} />}
      </section>
    </>
  );
}
