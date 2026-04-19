# PRODUCT-BRIEF — Brogress

## Persona

**Damian, 31 lat** — ok. **15 lat** regularnej pracy na siłowni; traktuje trening jako rutynę, zna swoje wzorce i nie potrzebuje edukacji od zera.

- **Nie szuka coacha** w aplikacji — ani gotowych planów „pod siebie”, ani motywacji z narracji trenera.
- **Szuka czegoś lekkiego** — szybkiego wejścia w dzisiejszą sesję, bez onboardingów i bez przeklikiwania hubów.
- Chce **uporządkować** to, co i tak robi: szablony, serie, ciężary — bez narzucania mu stylu treningu.

---

## Priorytety segmentu

1. **Prostota i szybkość** — minimalne tarcie, mało decyzji przed realnym treningiem.
2. **Widok treningu jako domyślny start** — po otwarciu aplikacji od razu praca nad dzisiejszą sesją.
3. **Prefill** — dzisiejszy trening **inicjuje się z danych profilu**: automatyczne **wypełnienie** sesji na podstawie **ostatniego treningu** (punkt wyjścia zamiast pustego formularza).
4. **Szablony (template) i karuzela** — szybki wybór ułożonego planu (kolejność ćwiczeń, waga, obciążenie).

---

## Założenia produktu

Aplikacja jest skierowana do osób z doświadczeniem na siłowni — takich, które wiedzą, co robią, i chcą **ustrukturyzować** treningi bez prowadzenia za rękę, tutoriali ani nadmiaru kroków.

**Najważniejsza zasada:** aplikacja ma być **prosta** (w oryginalnej wiadomości: „cyc prosta” — rozumiane jako *być prostą*). Interfejs i przepływy mają minimalizować tarcie: szybki start, jasny kontekst, bez zbędnej złożoności.

**Domyślny start:** po otwarciu aplikacji użytkownik od razu widzi **widok treningu** — miejsce, w którym dodaje i realizuje **dzisiejszy trening**.

**Prefill na start dnia:** **dzisiejszy trening** dostaje **wstępnie wypełnione** pola na podstawie **ostatniego zapisanego treningu** z **profilu** (historycznie w cytacie: „prefile” → *profil*). Użytkownik startuje od realnego stanu, nie od zera.

**Nawigacja po planach:** u góry ekranu znajduje się **karuzela** — obszar wyboru **szablonu treningu** (**template**). Szablon to ustalona kolejność ćwiczeń wraz z oczekiwaną **wagą** i **obciążeniem** (parametrami serii), gotowa do szybkiego zastosowania w bieżącym treningu.

---

## Model treningu i API (twarde reguły)

Te zasady są spójne z regułą Cursor **`.cursor/rules/product-brief.mdc`** (agent powinien je tam utrzymywać przy zmianach).

1. **Jeden trening na dzień** — dla użytkownika co najwyżej **jeden** zapis treningu na **jedną datę kalendarzową**; backend wymusza to (np. unikalny indeks), a zapis bez `workoutId` na ten sam dzień **aktualizuje** istniejący rekord zamiast tworzyć duplikat.
2. **Brak „zrobione / planowane”** — nie ma w produkcie stanu ukończenia ćwiczenia vs planu; w modelu i UI **brak** pól w stylu `done` / `completed` / `planned`.
3. **Waga i powtórzenia jako `int`** — w kontrakcie API i w typach domenowych **`weight`** oraz **`reps`** to **liczby całkowite**, nie stringi.

---

## Słownik

| Termin (jak w projekcie / cytat) | Znaczenie |
|----------------------------------|-----------|
| **„widok treningu”** | Główny ekran pracy: dodawanie i prowadzenie **dzisiejszego treningu** od razu po wejściu w aplikację. |
| **„dzisiejszy trening”** | Bieżąca sesja treningowa danego dnia — obiekt roboczy użytkownika (serie, ćwiczenia, obciążenia). |
| **prefill** | **Wstępne wypełnienie** dzisiejszej sesji danymi z **ostatniego treningu** (przez **profil**), żeby nie zaczynać od pustej listy. |
| **„prefile”** (w tekście źródłowym) | Rozumiane jako **profil** użytkownika: źródło danych do **prefill** (ostatnia sesja). W kodzie i docs preferuj **profil** / **profile**. |
| **„zaciaganie ostatniego treningu”** | Mechanika leżąca u podstaw **prefill**: wczytanie ostatnio zapisanego treningu jako punktu startowego. |
| **„karuzela”** | UI u góry ekranu do **przeglądania i wyboru** elementów w poziomie — tu: wybór **szablonu** (template) treningu. |
| **pasek ćwiczenia** („exercise bar”) | W liście planu: **jednolity obszar** z tagiem partii, **nazwą** oraz wierszem **kg → waga → × → powtórzenia** (`exerciseBarSets`). **Waga i powtórzenia** w modelu danych i API to **liczby całkowite**; UI może używać pól edycji, ale bez semantyki „ukończone / planowane”. W widoku treningu **jedna** obwódka i tło na **całym** `.exerciseRow`; edycja pól nie wewnątrz `<button>` (poprawny HTML). |
| **„template”** (szablon treningu) | Zdefiniowany plan: **ćwiczenia w kolejności** oraz powiązane **wagi** i **obciążenia** (parametry zestawów), które użytkownik może szybko wczytać w widoku treningu. |
| **„cyc prosta”** (cytat) | Literówka / skrót myślowy dla **„ma być prosta”** — nadrzędny cel UX: prostota aplikacji. |

---

## Ficzery (zakres funkcjonalny)

1. **Start w widoku treningu** — brak pośrednich ekranów „co dziś robimy?”; domyślnie od razu praca nad dzisiejszą sesją.
2. **Prefill z profilu** — przy starcie dzisiejszej sesji **wstępne wypełnienie** na podstawie **ostatniego zapisanego treningu** (nie pusty formularz).
3. **Karuzela szablonów** — poziomy wybór **template’ów** u góry widoku treningu.
4. **Szablony (template)** — zapisane plany: kolejność ćwiczeń + **waga** i **obciążenie** per zestaw / ćwiczenie; zastosowanie szablonu w bieżącym treningu.
5. **Prostota ponad rozbudowę** — priorytetem jest czytelny, szybki przepływ zamiast rozbudowanych funkcji pobocznych.

---

*Dokument zbudowany na podstawie wiadomości produktowej; nazewnictwo w słowniku utrwala cytaty i ich zamierzone znaczenie.*
