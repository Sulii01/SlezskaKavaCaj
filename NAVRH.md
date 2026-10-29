# Návrh: nový web Slezská káva a čaj

Tento dokument popisuje, co je v repozitáři hotové, co jsem zjistil při procházení současného e-shopu na Shoptetu, a jak navázat: administrace produktů, platby, doprava a všechny funkce, které dnes zajišťuje Shoptet.

---

## 1. Co je hotové (v tomto repozitáři)

Statický, rychlý web bez závislostí (HTML + CSS + JavaScript) připravený pro GitHub Pages:

| Část | Co umí |
|---|---|
| **Úvodní stránka** | Hero s fotkou z vašeho banneru, výhody (mletí na míru, Zásilkovna/PPL, osobní odběr), dlaždice kategorií, Top 10 produktů, „Káva z celého světa“ s přepínáním kontinentů, sekce o 5 stupních mletí, rarity (Kopi Luwak, Jamajka, Galapágy), akce Ethiopia 1+1 kg, čaje, článek z blogu, newsletter |
| **Katalog** | Káva a čaj, podkategorie, filtr podle původu, hledání, řazení (cena, název, doporučené), mobilní „chipy“ |
| **Detail produktu** | Galerie se zoomem, výběr hmotnosti s cenou každé varianty, **cena za 100 g**, výběr mletí s vizualizací hrubosti, množství, parametry, celý původní popis, podobné produkty, lepicí tlačítko „Do košíku“ na mobilu |
| **Košík** | Výsuvný panel, změna množství, ukazatel „do dopravy zdarma zbývá…“, ukládá se v prohlížeči |
| **Pokladna** | Doprava (osobní odběr, Zásilkovna, PPL Parcelshop, na adresu), platba (převod, karta, dobírka, hotově), pravidla (dobírka ne u osobního odběru, hotově jen při osobním odběru), kontaktní údaje, souhlas s VOP, děkovná stránka |
| **Obsah** | O nás, Kontakty (s mapou a formulářem), Jak nakupovat, Blog + článek „Jak vybrat kávu“, Obchodní podmínky a Ochrana osobních údajů (převzato 1:1) |
| **Ostatní** | Vyhledávání přes celý obchod (klávesa `/`), plně responzivní, přístupnost (klávesnice, aria), animace, respektuje „omezit pohyb“ |

**Data jsou skutečná:** všech 53 produktů ze Shoptetu včetně cen všech variant (hmotnost × mletí), popisů, kategorií a **původních fotografií** (ořezané, převedené do WebP, ~4× menší).

- Produkty: `data/products.json`
- Texty VOP / GDPR / blogu: `data/pages.json`
- Fotky: `assets/img/products/` (velké) a `assets/img/products/thumb/` (náhledy)

> ⚠️ Pokladna je zatím **ukázková**: objednávka se nikam neodesílá a ceny dopravy (79–119 Kč) i hranice dopravy zdarma (1 500 Kč) jsou orientační. Nastavují se na jednom místě, v objektu `SHOP` na začátku `assets/js/app.js`.

---

### Výdejní místo Zásilkovny a PPL
Provozovna v Bystřici 5 je výdejní místo Zásilkovny a PPL. Na webu je to teď vidět na několika místech:
- samostatná stránka **Výdejní místo** (`#/vydejni-misto`) s postupem pro Zásilkovnu i PPL, adresou a mapou,
- sekce na úvodní stránce, odkaz v horní liště, v menu, v patičce a na stránce Kontakty,
- zmínka u každého produktu a u osobního odběru v pokladně.

Otevírací doba (Po–Pá 9–17, So 8–11, Ne zavřeno) a telefon na prodejnu (792 370 292) jsou doplněné a web podle českého času ukazuje „Právě otevřeno / Zavřeno“. Otevírací doba se mění v objektu `HOURS` v `assets/js/app.js`. Ve variantě A se to v Shoptetu udělá jako obsahová stránka v menu a banner na úvodní stránce.

---

## 2. Co jsem našel na současném webu (stojí za opravu i teď)

1. **Obchodní podmínky obsahují nevyplněná místa `[BUDE DOPLNĚNO]`**: chybí splatnost u převodu, název a podmínky platební brány a splatnost u karty. To je právně citlivé, doporučuji doplnit hned.
2. Banner **„Dobrá zpráva – zlevněná káva“** vede na `/akce-kava`, ta vrací **chybu 404**.
3. Stránky **O nás**, **Jak nakupovat** a **Novinky** jsou prázdné. Do nového webu jsem je napsal z vašich textů a obchodních podmínek, projděte je prosím.
4. Kategorie **Zelený ochucený** čaj je prázdná.
5. Některé produkty mají jen jednu fotku (čaje). Druhá fotka, např. nálev v šálku, by výrazně pomohla.
6. U textů produktů je pár překlepů („Tarazzu“ vs. „Tarrazú“, „Snickerss“, „Vyníkající“). Nechal jsem je beze změny, ať se data shodují se Shoptetem.

---

## 3. Jak by admin jednoduše přidával produkty

Mám tři realistické cesty. Liší se tím, kolik toho zůstane na Shoptetu.

### Varianta A – zůstat na Shoptetu, jen nový vzhled *(nejrychlejší)*
- Admin, sklad, objednávky, faktury, platby i doprava zůstanou, jak je znáte.
- Nový design se přenese do Shoptetu přes **vlastní šablonu / HTML-CSS úpravy** (Shoptet to umožňuje; plná vlastní šablona je podle tarifu).
- ✅ Nejméně práce, nic se neztratí (SEO, zákazníci, historie objednávek).
- ❌ Design je omezený strukturou Shoptetu a některé prvky (výběr mletí s vizualizací, přepínání kontinentů) jdou udělat jen přes JavaScript.

### Varianta B – Shoptet jako „backend“, tento web jako front-end *(headless)*
- Produkty dál přidáváte v adminu Shoptetu a tento web si je bere přes **Shoptet API** (nebo XML feed produktů).
- Objednávky se zakládají do Shoptetu přes API, takže platby, faktury a e-maily dál řeší Shoptet.
- ✅ Admin beze změny + plná svoboda designu.
- ❌ API je dostupné jen ve vyšších tarifech Shoptetu. Je potřeba malý server (serverless funkce), který drží API klíč.

### Varianta C – vlastní řešení bez Shoptetu *(nejvíc svobody, nejnižší měsíční náklady)*
**Administrace produktů přes [Decap CMS](https://decapcms.org)** (dříve Netlify CMS):
- Na adrese `/admin` se admin přihlásí přes GitHub a vidí formulář: název, krátký popis, kategorie, původ, ceny pro 150 g / 250 g / 500 g / 1 kg, mletí, fotky (nahrání přetažením), popis v textovém editoru, skladem ano/ne.
- Po uložení se změna sama uloží do repozitáře a web se za minutu aktualizuje. Žádná databáze ani server.
- Formát dat je už teď připravený (`data/products.json`), stačí přidat `admin/config.yml`. Ukázka:

```yaml
backend: { name: github, repo: Sulii01/SlezskaKavaCaj, branch: main }
media_folder: assets/img/products
collections:
  - name: produkty
    label: Produkty
    folder: content/produkty        # 1 produkt = 1 soubor, sestaví se do data/products.json
    create: true
    format: json
    fields:
      - { name: name, label: Název, widget: string }
      - { name: short, label: Krátký popis, widget: string }
      - { name: category, label: Kategorie, widget: select, options: [top-arabica, arabica, espresso, ochucena, bez-kofeinu, akce, darky, cerny, zeleny, yerba, ovocny] }
      - { name: origin, label: Původ, widget: select, required: false, options: [afrika, asie, stredni-amerika, jizni-amerika, oceanie] }
      - { name: prices, label: Ceny podle hmotnosti, widget: object, fields: [ { name: 150g, widget: number, required: false }, { name: 250g, widget: number, required: false }, { name: 500g, widget: number, required: false }, { name: 1kg, widget: number, required: false } ] }
      - { name: images, label: Fotky, widget: list, field: { name: img, widget: image } }
      - { name: description, label: Popis, widget: markdown }
      - { name: available, label: Skladem, widget: boolean, default: true }
```

Alternativy k Decap CMS: **Sanity**, **Strapi** nebo **Directus** (pohodlnější admin, ale je to další služba), nebo obyčejná **Google tabulka**, ze které se produkty načítají (nejjednodušší pro netechnického admina).

### Moje doporučení
- **Krátkodobě:** **A**. Opravte body z kapitoly 2 a přeneste nový design do Shoptetu. Nic se nerozbije a hned to zlepší dojem z webu.
- **Dlouhodobě:** **C**, pokud chcete ušetřit za Shoptet a mít web plně pod kontrolou. **B**, pokud vám admin Shoptetu vyhovuje a chcete jen lepší front-end.

---

## 4. Platby (pro variantu B a C)

GitHub Pages je statický hosting. Platby proto musí jít přes malou **serverless funkci** (Cloudflare Workers / Netlify Functions / Vercel), která:

1. přepočítá cenu košíku podle `products.json` (cenám z prohlížeče se nevěří),
2. založí platbu v bráně a přesměruje zákazníka,
3. po potvrzení platby (webhook) uloží objednávku a pošle e-maily.

| Brána | Pro koho | Poznámka |
|---|---|---|
| **Comgate** | CZ/SK e-shopy | Karty, Apple/Google Pay, **bankovní tlačítka**, česká podpora. Dobrá volba pro CZ. |
| **GoPay** | CZ/SK e-shopy | Podobné jako Comgate, rozšířené v ČR. |
| **Stripe** | Nejjednodušší integrace | Hotová platební stránka (Stripe Checkout), karty, Apple/Google Pay. Bankovní tlačítka CZ neumí. |

Bankovní převod lze vylepšit o **QR platbu** (formát SPAYD) na děkovné stránce a v e-mailu. Stačí číslo účtu a variabilní symbol = číslo objednávky.

Aktuální poplatky jednotlivých bran se mění, ověřte je prosím přímo v jejich ceníku.

---

## 5. Doprava

- **Zásilkovna:** oficiální **widget pro výběr výdejního místa** (vloží se do pokladny místo textového pole) a API pro automatické vytvoření zásilky a štítku.
- **PPL:** výběr Parcelshopu přes jejich widget a API pro štítky (nebo ručně v portálu PPL).
- **Osobní odběr Bystřice 5:** hotovo, bez poplatku.
- Ceník dopravy, hranice dopravy zdarma a příplatek za dobírku se nastavují v `SHOP` (`assets/js/app.js`). Při variantě C je přesuneme do adminu.

---

## 6. Funkce Shoptetu a čím je nahradit (varianta C)

| Funkce na současném webu | Náhrada |
|---|---|
| Produkty, varianty, kategorie | ✅ hotovo, `data/products.json` + Decap CMS |
| Košík, pokladna | ✅ hotovo (front-end); odeslání objednávky přes serverless funkci |
| Platba kartou / převodem / dobírkou / hotově | Comgate nebo Stripe + QR platba (viz kap. 4) |
| Zásilkovna, PPL, osobní odběr | Widgety a API dopravců (viz kap. 5) |
| E-mail s potvrzením objednávky | Serverless funkce + e-mailová služba (např. Resend, Brevo, SMTP) |
| Faktury | **Fakturoid** nebo **iDoklad** přes API (automaticky po zaplacení) |
| Přehled objednávek pro admina | Fakturoid / Google tabulka / jednoduchá tabulka v Supabase |
| Sklad („Skladem / Nedostupné“) | Přepínač „Skladem“ v adminu (✅ data i zobrazení připravené) |
| Newsletter | Ecomail, Mailchimp nebo Brevo (formulář už je na webu) |
| Zákaznické účty a registrace | Volitelné, většina malých e-shopů funguje bez nich. Lze doplnit přes Supabase Auth. |
| Diskuze / hodnocení u produktů | Ověřené recenze přes Heureka nebo vlastní formulář |
| Dárkový kupon, slevové kódy | Kódy ověřované v serverless funkci (Stripe/Comgate umí i samy) |
| Měna CZK / EUR | Přepínač měny + ceny v EUR v datech (Slovensko) |
| Cookie lišta, Google Analytics | Lehká cookie lišta + GA4 / Plausible |
| Feedy pro Heureku / Zboží.cz / Google | Skript, který z `products.json` vygeneruje XML feed |
| SEO (každý produkt má vlastní URL) | Při přechodu vygenerovat statické HTML stránky produktů + přesměrování ze starých URL Shoptetu |

---

## 7. Co od vás budu potřebovat

1. Kterou variantu (A / B / C) chcete.
2. Skutečný ceník dopravy, hranici dopravy zdarma a příplatek za dobírku.
3. Číslo účtu (QR platba) a jakou platební bránu preferujete.
4. Jestli chcete doručovat i na Slovensko s cenami v EUR.
5. Kontrolu textů na stránkách **O nás** a **Jak nakupovat** (napsal jsem je z vašich podkladů).
