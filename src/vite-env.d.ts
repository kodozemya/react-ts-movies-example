/// <reference types="vite/client" />

/**
 * Опис змінних оточення проєкту.
 *
 * Без цього файла `import.meta.env.VITE_TMDB_TOKEN` має тип `any` —
 * і одруківка `VITE_TMDB_TOKN` пройде перевірку типів, а впаде вже
 * у користувача. З ним редактор підказує назву й ловить помилку одразу.
 */
interface ImportMetaEnv {
  readonly VITE_TMDB_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
