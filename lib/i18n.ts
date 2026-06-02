import type { UserRole } from "@/models/User";
import type { UserDto } from "@/types";

export const pl = {
  app: {
    name: "Nido",
    description:
      "Wspólne gniazdo na dwa domy — harmonogram opieki, finanse i codzienność rodziny",
  },
  nav: {
    dashboard: "Panel",
    home: "Start",
    care: "Opieka",
    entries: "Dni",
    finance: "Finanse",
    admin: "Administracja",
  },
  auth: {
    signIn: "Zaloguj się",
    signOut: "Wyloguj",
    signedInUser: "Zalogowany użytkownik",
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
      "Panel admina nie jest skonfigurowany. Ustaw zmienne ADMIN_PASSWORD i ADMIN_SESSION_TOKEN (lokalnie w .env.local, na Vercel w Settings → Environment Variables). Po zmianie zmiennych wykonaj ponowny deploy.",
    notConfiguredMissing: (vars: string) =>
      `Brakujące zmienne: ${vars}.`,
    invalidPassword: "Nieprawidłowe hasło",
    loginFailed: "Logowanie nie powiodło się",
    overview: "Przegląd",
    users: "Użytkownicy",
    years: "Lata",
    entries: "Wpisy",
    backToApp: "Wróć do aplikacji",
    forbiddenTitle: "Brak dostępu",
    forbiddenSubtitle:
      "Nie masz uprawnień administratora. Skontaktuj się z administratorem, jeśli uważasz, że to błąd.",
    overviewSubtitle: "Zarządzaj użytkownikami, latami i wpisami opieki",
    usersSubtitle: "Dodawaj i edytuj konta rodziców",
    yearsSubtitle: "Dodawaj lata dostępne w przełączniku aplikacji",
    entriesSubtitle: "Przeglądaj i usuwaj wszystkie wpisy",
    stats: {
      users: "Użytkownicy",
      years: "Skonfigurowane lata",
      entries: "Wpisy",
    },
    yearsSection: {
      add: "Dodaj rok",
      year: "Rok",
      yearPlaceholder: "np. 2026",
      empty: "Brak skonfigurowanych lat",
      hint: "Lata z wpisami opieki pojawią się w aplikacji automatycznie. Tutaj dodajesz lata bez wpisów (np. planowany rok).",
      created: "Rok dodany",
      deleted: "Rok usunięty",
      deleteTitle: "Usunąć rok?",
      deleteDescription: (year: number) =>
        `Rok ${year} zostanie usunięty z listy dostępnych lat (o ile nie ma wpisów w tym okresie).`,
      save: "Dodaj",
      saving: "Dodawanie…",
      cancel: "Anuluj",
      delete: "Usuń",
      deleting: "Usuwanie…",
      actions: "Akcje",
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
  home: {
    title: "Start",
    subtitle: "Podgląd opieki i budżetu — dotknij karty, aby przejść do szczegółów",
    careSection: "Opieka",
    financeSection: "Finanse",
  },
  care: {
    title: "Opieka",
    subtitle: "Harmonogram i dni opieki obu rodziców",
    subtitleForYear: (year: number) =>
      `Podsumowanie opieki w ${year} roku (bez weekendów)`,
    daysSection: "Dni",
  },
  dashboard: {
    title: "Panel",
    subtitle: "Przegląd dni opieki obu rodziców",
    subtitleForYear: (year: number) =>
      `Harmonogram opieki w ${year} roku (bez weekendów)`,
    recentEntries: "Ostatnie wpisy",
    viewAll: "Zobacz wszystkie",
    empty: "Brak wpisów. Dodaj pierwszy okres opieki.",
    monthlyBreakdown: "Podział miesięczny",
    noChartData: "Brak danych do wykresu.",
  },
  entries: {
    title: "Dni",
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
    weekdaysBadge: (count: number) =>
      count === 1 ? "1 dzień rob." : `${count} dni rob.`,
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
  finance: {
    nav: {
      dashboard: "Panel",
      expenses: "Wydatki",
      personalExpenses: "Prywatne",
      analytics: "Analityka",
      more: "Więcej",
      categories: "Kategorie",
      settings: "Ustawienia",
      home: "Start",
    },
    dashboard: {
      title: "Finanse",
      subtitle: "Budżet gospodarstwa domowego",
      spent: "Wydano",
      remaining: "Pozostało",
      limit: "Limit miesięczny",
      dailyAllowance: "Średnio na pozostałe dni",
      daysLeft: (n: number) =>
        n === 1 ? "1 dzień do końca miesiąca" : `${n} dni do końca miesiąca`,
      utilization: "Wykorzystanie budżetu",
      noBudget: "Ustaw limit miesięczny w ustawieniach",
      projectedOverspend: "Prognoza: przekroczenie budżetu",
      addExpense: "Dodaj wydatek",
    },
    expenses: {
      title: "Wydatki",
      empty: "Brak wydatków w tym okresie",
      emptyHint: "Dodaj pierwszy wydatek lub zmień filtry",
      add: "Nowy wydatek",
      edit: "Edytuj wydatek",
      amount: "Kwota",
      titleLabel: "Tytuł",
      category: "Kategoria",
      date: "Data",
      notes: "Notatki (opcjonalnie)",
      deleteTitle: "Usunąć wydatek?",
      deleteDescription: "Ten wydatek zostanie trwale usunięty.",
      created: "Wydatek dodany",
      updated: "Wydatek zaktualizowany",
      deleted: "Wydatek usunięty",
      saving: "Zapisywanie…",
      save: "Zapisz",
      cancel: "Anuluj",
      delete: "Usuń",
      deleting: "Usuwanie…",
      filterCategory: "Kategoria",
      filterAll: "Wszystkie",
      fillRequired: "Uzupełnij wymagane pola",
      importButton: "Importuj z banku",
      importing: "Importowanie…",
      importSuccess: (
        imported: number,
        duplicates: number,
        outOfMonth: number,
      ) => {
        const parts = [`Zaimportowano ${imported}`];
        if (duplicates > 0) {
          parts.push(`pominięto ${duplicates} duplikatów`);
        }
        if (outOfMonth > 0) {
          parts.push(`${outOfMonth} poza wybranym miesiącem`);
        }
        return parts.join(", ");
      },
      importFailed: "Import nie powiódł się",
      importInvalidFile: "Nieobsługiwany plik CSV (oczekiwany format mBank)",
      importNoFile: "Wybierz plik CSV",
      importFileTooLarge: "Plik jest za duży (maks. 2 MB)",
      selectAll: "Zaznacz wszystkie",
      selectedCount: (n: number) =>
        n === 1 ? "1 wydatek zaznaczony" : `${n} wydatków zaznaczonych`,
      bulkAssignCategory: "Przypisz kategorię",
      bulkAssigning: "Przypisywanie…",
      bulkCategoryUpdated: (n: number) =>
        n === 1
          ? "Zaktualizowano kategorię 1 wydatku"
          : `Zaktualizowano kategorię ${n} wydatków`,
      clearSelection: "Anuluj zaznaczenie",
      bulkSelectCategory: "Wybierz kategorię",
    },
    personalExpenses: {
      title: "Prywatne wydatki",
      subtitle: "Miesięczna checklista planowanych wydatków",
      empty: "Brak pozycji w tym miesiącu",
      emptyHint: "Dodaj pierwszą pozycję lub skopiuj z poprzedniego miesiąca",
      add: "Dodaj wydatek",
      edit: "Edytuj wydatek",
      amount: "Kwota",
      titleLabel: "Tytuł",
      notes: "Notatki (opcjonalnie)",
      planned: "Zaplanowano",
      paid: "Opłacono",
      remaining: "Pozostało",
      paidCount: (paid: number, total: number) =>
        `${paid} z ${total} opłaconych`,
      deleteTitle: "Usunąć wydatek?",
      deleteDescription: "Ta pozycja zostanie trwale usunięta.",
      created: "Wydatek dodany",
      updated: "Wydatek zaktualizowany",
      deleted: "Wydatek usunięty",
      saving: "Zapisywanie…",
      save: "Zapisz",
      cancel: "Anuluj",
      delete: "Usuń",
      deleting: "Usuwanie…",
      fillRequired: "Uzupełnij wymagane pola",
      markPaid: "Oznacz jako opłacone",
      markUnpaid: "Oznacz jako nieopłacone",
      copyFromPrevious: "Skopiuj z poprzedniego miesiąca",
      copying: "Kopiowanie…",
      copySuccess: (n: number) =>
        n === 1
          ? "Skopiowano 1 pozycję z poprzedniego miesiąca"
          : `Skopiowano ${n} pozycji z poprzedniego miesiąca`,
      copyConfirmTitle: "Skopiuj z poprzedniego miesiąca",
      copyConfirmDescription:
        "Wybierz pozycje do skopiowania. Zostaną dodane jako nieopłacone.",
      copySelectAll: "Zaznacz wszystkie",
      copySelectedCount: (selected: number, total: number) =>
        `${selected} z ${total} zaznaczonych`,
      copyNoSelection: "Zaznacz co najmniej jedną pozycję",
      copyLoadError: "Nie udało się wczytać pozycji z poprzedniego miesiąca",
      errors: {
        notFound: "Nie znaleziono wydatku",
        invalid: "Nieprawidłowe dane wydatku",
        targetNotEmpty: "Ten miesiąc ma już pozycje — usuń je lub edytuj ręcznie",
        sourceEmpty: "Poprzedni miesiąc nie ma pozycji do skopiowania",
        noneSelected: "Nie wybrano żadnej pozycji do skopiowania",
        invalidSelection: "Wybrano nieprawidłowe pozycje",
      },
    },
    categories: {
      title: "Kategorie",
      add: "Dodaj kategorię",
      name: "Nazwa",
      icon: "Ikona",
      color: "Kolor",
      monthlyLimit: "Limit miesięczny (PLN)",
      limitPlaceholder: "Opcjonalnie",
      saveLimit: "Zapisz",
      limitSaved: "Limit zapisany",
      invalidLimit: "Podaj poprawną kwotę limitu",
      noLimit: "Bez limitu",
      limitsEmpty: "Ustaw limity kategorii, aby śledzić wykorzystanie",
      limitsTitle: "Limity kategorii",
      created: "Kategoria dodana",
      deleted: "Kategoria usunięta",
      empty: "Brak kategorii",
      delete: "Usuń",
      deleteAria: "Usuń kategorię",
      deleteTitle: "Usunąć kategorię?",
      deleteDescription: (name: string) =>
        `Kategoria „${name}” zostanie trwale usunięta.`,
      cancel: "Anuluj",
      deleting: "Usuwanie…",
    },
    analytics: {
      title: "Analityka",
      monthly: "Wydatki miesięczne",
      byCategory: "Według kategorii",
      categoryLimits: "Wykorzystanie limitów",
      totalAvailable: "Łącznie dostępne",
      budgetOverspend: "Przekroczenie budżetu",
      trend: "Trend (6 mies.)",
      daily: "Wydatki dzienne",
      noData: "Brak danych do wykresu",
    },
    settings: {
      title: "Ustawienia finansów",
      budgetLimit: "Limit miesięczny (PLN)",
      budgetSaved: "Limit zapisany",
      categoriesSection: "Kategorie wydatków",
      categoriesHint:
        "Dodawaj kategorie, ikony, kolory i limity miesięczne dla wydatków.",
      manageCategories: "Zarządzaj kategoriami",
      categoriesCount: (n: number) =>
        n === 1 ? "1 kategoria" : n < 5 ? `${n} kategorie` : `${n} kategorii`,
      notifications: "Powiadomienia",
      notificationsHint: "Przypomnienie o dodaniu dzisiejszych wydatków",
      reminderHour: "Godzina przypomnienia",
      timezone: "Strefa czasowa",
      enablePush: "Włącz powiadomienia push",
      disablePush: "Wyłącz powiadomienia push",
      pushEnabled: "Powiadomienia włączone",
      pushDisabled: "Powiadomienia wyłączone",
      testPush: "Wyślij test",
      testPushSent: (n: number) =>
        n === 1 ? "Wysłano 1 powiadomienie testowe" : `Wysłano ${n} powiadomień testowych`,
      saved: "Ustawienia zapisane",
    },
    ai: {
      title: "Wskazówki AI",
      paceTitle: "Tempo wydatków",
      paceFaster: (pct: string) =>
        `Wydajesz o ${pct} szybciej niż średnia z ostatnich miesięcy`,
      paceSlower: (pct: string) =>
        `Wydajesz o ${pct} wolniej niż średnia z ostatnich miesięcy`,
      budgetTitle: "Budżet",
      budgetExhausted: "Limit miesięczny został wykorzystany",
      budgetDaysLeft: (days: number) =>
        days === 1
          ? "Przy obecnym tempie budżet skończy się za 1 dzień"
          : `Przy obecnym tempie budżet skończy się za ${days} dni`,
      budgetLastsMonth:
        "Przy obecnym tempie budżet wystarczy do końca miesiąca",
      topCategoryTitle: "Największa kategoria",
      topCategory: (name: string, amount: string) =>
        `${name} — ${amount} w tym miesiącu`,
      todayTitle: "Dzisiaj",
      todayHigh: (amount: string, limit: string) =>
        `Dzisiejsze wydatki (${amount}) przekraczają dzienny limit (${limit})`,
      todayOk: (amount: string) => `Dzisiejsze wydatki: ${amount}`,
      projectionTitle: "Prognoza",
      projectionOverspend:
        "Przy obecnym tempie przekroczysz limit do końca miesiąca",
      summaryWithBudget: (spent: string, limit: string) =>
        `Wydano ${spent} z limitu ${limit} w tym miesiącu`,
      summaryNoBudget: (spent: string) => `Wydano ${spent} w tym miesiącu`,
    },
    push: {
      testTitle: "Nido — test",
      testBody: "Powiadomienia push działają poprawnie.",
      reminderTitle: "Nido — finanse",
      reminderBody: "Dodaj dzisiejsze wydatki.",
      bannerTitle: "Przypomnienia o wydatkach",
      bannerDescription:
        "Włącz powiadomienia, aby codziennie dostać przypomienie o zapisaniu wydatków.",
      browserHint: "Działa w Chrome, Firefox i Safari 17+",
    },
    errors: {
      invalidExpense: "Nieprawidłowe dane wydatku",
      invalidCategory: "Nieprawidłowe dane kategorii",
      invalidBudget: "Nieprawidłowe dane budżetu",
      invalidImport: "Nieprawidłowe parametry importu",
      importFailed: "Import wydatków nie powiódł się",
      invalidNotificationSettings: "Nieprawidłowe ustawienia powiadomień",
      expenseNotFound: "Nie znaleziono wydatku",
      categoryNotFound: "Nie znaleziono kategorii",
      categoryExists: "Kategoria o tej nazwie już istnieje",
      categoryHasExpenses:
        "Nie można usunąć kategorii z przypisanymi wydatkami",
      categoryIsDefault: "Nie można usunąć domyślnej kategorii",
      vapidNotConfigured: "VAPID keys nie są skonfigurowane",
      pushNotSupported:
        "Ta przeglądarka nie obsługuje powiadomień push (wymagany HTTPS i obsługa Push API)",
      pushServiceUnavailable:
        "Usługa push przeglądarki jest niedostępna. Użyj Chrome, Firefox lub Safari 17+, otwórz aplikację w normalnej przeglądarce (nie w podglądzie IDE) i w Brave włącz „Use Google services for push messaging” w ustawieniach prywatności.",
      pushNoServiceWorker:
        "Service worker nie jest aktywny. Odśwież stronę i spróbuj ponownie.",
      pushServiceWorkerFailed:
        "Nie udało się aktywować service workera. Wyczyść dane strony i spróbuj ponownie.",
    },
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
