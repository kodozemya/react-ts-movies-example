import { TABS } from "../lib/media";
import type { TabId } from "../lib/media";

/**
 * Вкладки «Усі / Фільми / Серіали».
 *
 * `active: TabId` замість `active: string` — і це головне тут. TabId
 * виводиться із самого масиву TABS, тому `<FilterTabs active="films" />`
 * не скомпілюється, а редактор підкаже три правильні значення.
 * Додаси четверту вкладку в TABS — тип розшириться сам.
 *
 * Те саме стосується onChange: `(tabId: TabId) => void` каже, що назад
 * прийде лише одне з трьох значень. `Function` тут був би те саме, що `any`.
 */
type FilterTabsProps = {
  active: TabId;
  onChange: (tabId: TabId) => void;
};

export default function FilterTabs({ active, onChange }: FilterTabsProps) {
  return (
    /*
      Виглядає як вкладки — але це група кнопок, і розмітка каже саме це.

      Спокуса написати role="tablist" + role="tab" велика, проте цю роль
      не можна брати наполовину. Пообіцявши читалці вкладки, ти зобов'язаний
      дати ще й aria-controls на пов'язану панель, role="tabpanel" на самій
      панелі та перемикання стрілками ← → замість Tab. Без цього незрячий
      користувач почує «вкладка 1 з 3», натисне стрілку — і нічого
      не станеться. Збрехана роль гірша за її відсутність.

      Тому тут звичайні кнопки, а стан «обрана» передає aria-pressed —
      атрибут кнопки-перемикача, який працює без жодної додаткової логіки.

      group + aria-label дають читалці почути «Що показувати, група»,
      тобто зрозуміти, що три кнопки пов'язані між собою.
    */
    <div className="tabs" role="group" aria-label="Що показувати">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={tab.id === active ? "tab tab--active" : "tab"}
          type="button"
          aria-pressed={tab.id === active}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
