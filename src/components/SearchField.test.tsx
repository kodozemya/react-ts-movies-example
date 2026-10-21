import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import SearchField from "./SearchField";

type HarnessProps = {
  onSubmit: (value: string) => void;
};

/*
  SearchField кероване: текст йому дає батько. У застосунку це HomePage,
  а тут найменший батько, який тримає стан, щоб поле справді друкувало.
*/
function Harness({ onSubmit }: HarnessProps) {
  const [query, setQuery] = useState("");
  return <SearchField value={query} onChange={setQuery} onSubmit={onSubmit} />;
}

/*
  Елементи шукаємо так, як їх знаходить людина або читалка з екрана:
  поле за підписом, кнопку за роллю й назвою, помилку за роллю alert.
  Клас чи тег тест не цікавить: зміниш розмітку, а поведінка та сама,
  і тест мовчить.
*/
describe("SearchField", () => {
  it("не надсилає запит з однієї літери й показує помилку біля поля", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    const input = screen.getByLabelText("Пошук фільмів і серіалів");
    await user.type(input, "м");
    await user.click(screen.getByRole("button", { name: "Знайти" }));

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Введи щонайменше 2 символи назви.");
    // Помилка прив'язана до поля, тож читалка прочитає її разом із ним.
    expect(input).toHaveAccessibleDescription("Введи щонайменше 2 символи назви.");
    expect(input).toBeInvalid();
    expect(onSubmit).not.toHaveBeenCalled();

    // Щойно людина друкує далі, помилка зникає.
    await user.type(input, "е");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("надсилає обрізаний запит клавішею Enter", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    const input = screen.getByRole("searchbox", { name: "Пошук фільмів і серіалів" });
    await user.type(input, "  месники {Enter}");

    expect(onSubmit).toHaveBeenCalledWith("месники");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
