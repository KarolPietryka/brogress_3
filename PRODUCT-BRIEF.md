# PRODUCT-BRIEF — Brogress

## Założenia produktu

Aplikacja jest skierowana do osób z doświadczeniem na siłowni — takich, które wiedzą, co robią, i chcą **ustrukturyzować** treningi bez prowadzenia za rękę, tutoriali ani nadmiaru kroków.

**Najważniejsza zasada:** aplikacja ma być **prosta** (w oryginalnej wiadomości: „cyc prosta” — rozumiane jako *być prostą*). Interfejs i przepływy mają minimalizować tarcie: szybki start, jasny kontekst, bez zbędnej złożoności.

**Domyślny start:** po otwarciu aplikacji użytkownik od razu widzi **widok treningu** — miejsce, w którym dodaje i realizuje **dzisiejszy trening**.

**Źródło danych na start dnia:** **dzisiejszy trening** inicjuje się z **profilu** użytkownika przez **załadowanie ostatniego treningu** (w wiadomości: „prefile” — rozumiane jako *profil*). Dzięki temu użytkownik kontynuuje od realnego, ostatniego stanu zamiast od pustego formularza.

**Nawigacja po planach:** u gółu ekranu znajduje się **karuzela** — obszar wyboru **szablonu treningu** (**template**). Szablon to ustalona kolejność ćwiczeń wraz z oczekiwaną **wagą** i **obciążeniem** (parametrami serii), gotowa do szybkiego zastosowania w bieżącym treningu.

---

## Słownik

| Termin (jak w projekcie / cytat) | Znaczenie |
|----------------------------------|-----------|
| **„widok treningu”** | Główny ekran pracy: dodawanie i prowadzenie **dzisiejszego treningu** od razu po wejściu w aplikację. |
| **„dzisiejszy trening”** | Bieżąca sesja treningowa danego dnia — obiekt roboczy użytkownika (serie, ćwiczenia, obciążenia). |
| **„prefile”** (w tekście źródłowym) | Rozumiane jako **profil** użytkownika: kontekst, z którego aplikacja **pobiera ostatni trening** jako punkt wyjścia na dziś. W dokumentacji i kodzie warto stosować spójną nazwę **profil** / **profile**, żeby uniknąć niejasności. |
| **„zaciaganie ostatniego treningu”** | Inicjalizacja dzisiejszej sesji danymi z **ostatnio zapisanego treningu** (kontynuacja, nie pusty start). |
| **„karuzela”** | UI u góry ekranu do **przeglądania i wyboru** elementów w poziomie — tu: wybór **szablonu** (template) treningu. |
| **„template”** (szablon treningu) | Zdefiniowany plan: **ćwiczenia w kolejności** oraz powiązane **wagi** i **obciążenia** (parametry zestawów), które użytkownik może szybko wczytać w widoku treningu. |
| **„cyc prosta”** (cytat) | Literówka / skrót myślowy dla **„ma być prosta”** — nadrzędny cel UX: prostota aplikacji. |

---

## Ficzery (zakres funkcjonalny)

1. **Start w widoku treningu** — brak pośrednich ekranów „co dziś robimy?”; domyślnie od razu praca nad dzisiejszą sesją.
2. **Kontynuacja od ostatniego treningu** — przy starcie (lub tworzeniu dzisiejszej sesji) wczytanie **ostatniego zapisanego treningu** z **profilu** użytkownika jako bazy.
3. **Karuzela szablonów** — poziomy wybór **template’ów** u góry widoku treningu.
4. **Szablony (template)** — zapisane plany: kolejność ćwiczeń + **waga** i **obciążenie** per zestaw / ćwiczenie; zastosowanie szablonu w bieżącym treningu.
5. **Doświadczeni użytkownicy** — produkt zakłada świadome użytkowanie (bez treningu „krok po kroku” dla początkujących jako rdzenia produktu).
6. **Prostota ponad rozbudowę** — priorytetem jest czytelny, szybki przepływ zamiast rozbudowanych funkcji pobocznych.

---

*Dokument zbudowany na podstawie wiadomości produktowej; nazewnictwo w słowniku utrwala cytaty i ich zamierzone znaczenie.*
