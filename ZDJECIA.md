# Zdjęcia – gdzie wrzucić i skąd wziąć

Strona działa **bez zdjęć** (eleganckie grafiki zastępcze). Gdy wrzucisz plik do folderu `img/` pod poniższą nazwą, zdjęcie pojawi się **automatycznie** – bez zmian w kodzie.

| Plik w `img/` | Gdzie na stronie | Proporcje / rozmiar | Co pasuje |
|---|---|---|---|
| `hero.jpg` | tło sekcji głównej | 16:9, min. 1920×1080 | ciemniejsze lub spokojne ujęcie (Kraków, architektura); strona sama przyciemnia tło |
| `o-nas.jpg` | sekcja „O nas” | 4:5 pionowe, ok. 900×1125 | biuro, wnętrze lub architektura |
| `oferta-1.jpg` … `oferta-12.jpg` | karty ofert | 3:2, ok. 1200×800 | **własne zdjęcia danej nieruchomości** |

Wskazówki: format JPG lub WebP (nazwa pliku musi zostać `.jpg`, jeśli nie zmienisz jej w kodzie), jakość ok. 80, **do 250 KB na zdjęcie** (np. squoosh.app).

## Ważne
- **Oferty:** zdjęcia w prawdziwych ogłoszeniach muszą przedstawiać prawdziwą nieruchomość. Zdjęć stockowych użyj tylko w ofertach przykładowych na czas budowy strony. Oferty przykładowe (`"demo": true` w `data/offers.json`) mają na stronie widoczną etykietę – **usuń je lub zastąp prawdziwymi przed publikacją**.
- Nazwiska autorów dopisz w stopce (pole `Zdjęcia: [UZUPEŁNIĆ…]` w `index.html`) – dla Unsplash i Pexels nie jest to wymagane, ale to dobra praktyka. Sprawdź aktualne licencje: unsplash.com/license, pexels.com/license. Zdjęcia z „Unsplash+” są płatne – nie używaj ich bez subskrypcji.

## Propozycje zdjęć z oficjalnych banków (wolne licencje)
Wybrałem je po opisach w wynikach wyszukiwania – **obejrzyj je przed użyciem**. Na każdej stronie jest przycisk „Download”.

**hero.jpg (Kraków)**
- Zamek na Wawelu nad rzeką (Wojciech Wyszkowski): https://unsplash.com/photos/historic-wawel-castle-above-river-with-boats-under-blue-sky-GmSsN0gdsmg
- Katedra na Wawelu (Pexels): https://www.pexels.com/photo/wawel-cathedral-in-krakow-18120818/
- Więcej: https://unsplash.com/s/photos/krakow · https://www.pexels.com/search/krakow/

**o-nas.jpg (architektura)**
- Wysoki budynek z balkonami (Andre Morales Kalamar): https://unsplash.com/photos/a-tall-building-with-multiple-balconies-and-windows-fpsUex--kes
- Szara szklana elewacja (Joel Filipe): https://unsplash.com/photos/gray-glass-building-D1S4F_SKY2I

**oferta-1.jpg, oferta-3.jpg, oferta-4.jpg (wnętrza – tylko przykładowe)**
- https://unsplash.com/photos/modern-and-bright-living-room-with-outdoor-view-hUtDSA03-eo
- https://unsplash.com/photos/modern-and-bright-living-space-with-minimalist-design-Hu_6KP4m9xA
- https://unsplash.com/photos/modern-living-room-with-a-chic-neutral-color-scheme--jk2BBoQxSk

**oferta-2.jpg (dom – tylko przykładowa)**
- Nowoczesny szary dom z trawnikiem (Roger Starnes Sr): https://unsplash.com/photos/a-modern-grey-house-with-a-green-lawn-and-trees-1XRV7Z4lhGo (zdjęcie może przedstawiać dom spoza Polski)

`oferta-5.jpg` (lokal) i `oferta-6.jpg` (działka) – do wyszukania lub własne: https://unsplash.com/s/photos/shop-front · https://unsplash.com/s/photos/land-plot

## Ilustracje zastępcze ofert
`img/oferta-1.jpg` … `oferta-12.jpg` to **wygenerowane ilustracje** (nie zdjęcia) dla ofert przykładowych – nie wymagają licencji i nie przedstawiają prawdziwych nieruchomości. Przy prawdziwych ofertach zastąp je własnymi zdjęciami pod tymi samymi nazwami (lub wskaż inne w polu `photos`).
