import type { UserRole } from "@/models/User";
import type { UserDto } from "@/types";

export const pl = {
  app: {
    name: "Dni opieki",
    tagline: "Wspólne śledzenie dni opieki",
    description: "Śledzenie dni opieki wspólnej",
  },
  nav: {
    dashboard: "Panel",
    home: "Start",
    entries: "Wpisy",
    admin: "Administracja",
  },
  admin: {
    title: "Administracja",
    loginTitle: "Logowanie administratora",
    loginSubtitle: "Wprowadź hasło, aby zarządzać aplikacją",
    password: "Hasło",
    login: "Zaloguj się",
    loggingIn: "Logowanie…",
    logout: "Wyloguj",
    notConfigured:
      "Panel admina nie jest skonfigurowany. Ustaw zmienną ADMIN_PASSWORD w pliku .env.local.",
    invalidPassword: "Nieprawidłowe hasło",
    loginFailed: "Logowanie nie powiodło się",
    overview: "Przegląd",
    users: "Użytkownicy",
    entries: "Wpisy",
    backToApp: "Wróć do aplikacji",
    overviewSubtitle: "Zarządzaj użytkownikami i wpisami opieki",
    usersSubtitle: "Dodawaj i edytuj konta rodziców",
    entriesSubtitle: "Przeglądaj i usuwaj wszystkie wpisy",
    stats: {
      users: "Użytkownicy",
      entries: "Wpisy",
    },
    usersSection: {
      add: "Dodaj użytkownika",
      edit: "Edytuj użytkownika",
      name: "Imię i nazwisko",
      email: "E-mail",
      role: "Rola",
      actions: "Akcje",
      empty: "Brak użytkowników",
      created: "Użytkownik utworzony",
      updated: "Użytkownik zaktualizowany",
      deleted: "Użytkownik usunięty",
      deleteTitle: "Usunąć użytkownika?",
      deleteDescription:
        "Konto oraz wszystkie przypisane wpisy opieki zostaną trwale usunięte.",
      save: "Zapisz",
      saving: "Zapisywanie…",
      cancel: "Anuluj",
      delete: "Usuń",
      deleting: "Usuwanie…",
    },
  },
  parentA: "Rodzic A",
  parentB: "Rodzic B",
  combined: "Razem",
  days: "dni",
  daysShort: "d",
  dashboard: {
    title: "Panel",
    subtitle: "Przegląd dni opieki obu rodziców",
    subtitleForYear: (year: number) =>
      `Dni opieki w ${year} roku (bez weekendów)`,
    recentEntries: "Ostatnie wpisy",
    viewAll: "Zobacz wszystkie",
    empty: "Brak wpisów. Dodaj pierwszy okres opieki.",
    monthlyBreakdown: "Podział miesięczny",
    noChartData: "Brak danych do wykresu.",
  },
  entries: {
    title: "Wpisy",
    subtitle: "Zarządzaj okresami opieki",
    add: "Dodaj wpis",
    edit: "Edytuj wpis",
    all: "Wszystkie",
    empty: "Nie znaleziono wpisów",
    emptyHint: "Zmień filtr lub dodaj nowy okres opieki.",
    unknownParent: "Nieznany rodzic",
    deleteTitle: "Usunąć wpis?",
    deleteDescription:
      "Ten okres opieki zostanie trwale usunięty, a statystyki zaktualizowane.",
    deleted: "Wpis usunięty",
    deleteFailed: "Nie udało się usunąć",
    deleting: "Usuwanie…",
    delete: "Usuń",
    cancel: "Anuluj",
    saving: "Zapisywanie…",
    saveChanges: "Zapisz zmiany",
    created: "Wpis utworzony",
    updated: "Wpis zaktualizowany",
    dateRange: "Okres opieki",
    pickDateRange: "Wybierz zakres dat w kalendarzu",
    weekdaysCount: (count: number) =>
      count === 1 ? "1 dzień roboczy" : `${count} dni roboczych`,
    weekendsExcluded: "bez weekendów",
    noWeekdaysInRange: "Wybrany okres nie zawiera dni roboczych",
    parent: "Rodzic",
    selectParent: "Wybierz rodzica",
    notesOptional: "Notatki (opcjonalnie)",
    notesPlaceholder: "Dodaj kontekst dla tego okresu…",
    pickDate: "Wybierz datę",
    fillRequired: "Uzupełnij wszystkie wymagane pola",
    endBeforeStart: "Data zakończenia musi być nie wcześniejsza niż data rozpoczęcia",
    somethingWrong: "Coś poszło nie tak",
    editAria: "Edytuj wpis",
    deleteAria: "Usuń wpis",
  },
  year: {
    label: "Rok",
  },
  common: {
    loading: "Ładowanie…",
    toggleTheme: "Przełącz motyw",
    requestFailed: "Żądanie nie powiodło się",
    loadStatsFailed: "Nie udało się załadować statystyk",
    loadEntriesFailed: "Nie udało się załadować wpisów",
    notFound: "Nie znaleziono zasobu",
    internalError: "Błąd wewnętrzny serwera",
    invalidQuery: "Nieprawidłowe parametry zapytania",
    invalidEntryData: "Nieprawidłowe dane wpisu",
    entryNotFound: "Nie znaleziono wpisu",
    ownerNotFound: "Nie znaleziono rodzica",
    overlap:
      "Ten zakres dat nachodzi na istniejący wpis dla tego rodzica",
  },
} as const;

export function getParentLabel(role: UserRole): string {
  return role === "parentA" ? pl.parentA : pl.parentB;
}

export function getParentDisplayName(
  users: Pick<UserDto, "name" | "role">[],
  role: UserRole,
): string {
  return users.find((u) => u.role === role)?.name ?? getParentLabel(role);
}
