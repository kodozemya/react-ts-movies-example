import type { ReactNode } from "react";

/**
 * Одне повідомлення на всі «нецікаві» стани: завантаження, помилка, порожньо.
 *
 * Винесено в окремий компонент, бо ці три стани трапляються на кожній
 * сторінці, і без нього однакова розмітка розповзлася б по всьому проєкту.
 *
 * `tone` — об'єднання літералів, а не `string`. Завдяки цьому
 * `<StatusMessage tone="errr">` не скомпілюється, а редактор
 * підкаже обидва можливі значення.
 *
 * `ReactNode` — тип «будь-що, що React уміє намалювати»: текст, число,
 * елемент, масив елементів. Саме його беруть для children.
 */
type StatusMessageProps = {
  tone?: "info" | "error";
  children: ReactNode;
};

export default function StatusMessage({ tone = "info", children }: StatusMessageProps) {
  return (
    <p
      className={tone === "error" ? "status status--error" : "status"}
      /*
        role="status" каже читалці з екрана прочитати цей текст, щойно він
        з'явиться, не перериваючи користувача. Без нього незрячий користувач
        просто не дізнається, що пошук нічого не знайшов.
      */
      role="status"
    >
      {children}
    </p>
  );
}
