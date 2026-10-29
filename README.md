# Slezská káva a čaj – nový web

Moderní redesign e-shopu [slezskakava.cz](https://www.slezskakava.cz/) se všemi 53 produkty, cenami variant, popisy a původními fotkami.

- **Návrh řešení** (admin, platby, doprava, náhrada funkcí Shoptetu): [NAVRH.md](NAVRH.md)
- Statický web bez build kroku: `index.html`, `assets/`, `data/`

## Lokální spuštění

```bash
python3 -m http.server 8000
```

Pak otevřete http://localhost:8000. Data se načítají přes `fetch`, takže samotné otevření souboru `index.html` nestačí.

## Struktura

| Cesta | Obsah |
|---|---|
| `index.html` | Kostra stránky (hlavička, patička, košík, vyhledávání) |
| `assets/css/style.css` | Design |
| `assets/js/app.js` | Router, katalog, detail, košík, pokladna. Nastavení dopravy a plateb je v objektu `SHOP` |
| `data/products.json` | Produkty (ceny podle hmotnosti, mletí, fotky, popisy) |
| `data/pages.json` | Obchodní podmínky, ochrana osobních údajů, článek blogu |
| `assets/img/` | Fotky produktů (WebP), bannery, logo |

## GitHub Pages

V repozitáři otevřete **Settings → Pages → Build and deployment → Source: Deploy from a branch**, vyberte větev s webem a složku `/ (root)`.
