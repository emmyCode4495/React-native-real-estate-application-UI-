# Haven: animated real estate app (Expo + React Native)

Part of a series on product UI animation. All data is local state. No network, no backend.
Runs in **Expo Go** (no dev build needed).

```bash
npm install
npx expo start
```

## The flow

Splash (shader sunrise) → Welcome → Log in / Sign up → front-door transition → 4 tabs:

| Tab | What it shows |
|---|---|
| **Explore** | Buy/Rent switch, search, type chips, filter sheet, featured carousel with parallax, skeleton loading |
| **Map** | Pannable stylised map, animated price pins, snapping card carousel synced to the map |
| **Saved** | Saved homes and booked tours, cancel tour with confirmation |
| **Profile** | Stats, budget slider, alert toggles, edit name, log out |

Plus two full-screen flows: **Property detail** (parallax gallery, mortgage estimator, map peek, agent) and **Book a viewing** (day, time, confirm dialog, processing, success ticket).

Four tabs is the smallest set that still shows the whole journey: discover, locate, keep, and manage.

## No spinners

Loading states are a **house that draws itself** (`HouseLoader`), shimmer skeletons, and status lines that change while a step "processes". Search for `loading` in `PrimaryButton`, `ExploreTab` and `app/tour/[id].tsx`.

## Photos and assets

**Listing photos are real photographs** from Unsplash (free to use, including commercially). They load from the Unsplash CDN, are cached on the device with `expo-image`, and are prefetched during the splash. Credits: [CREDITS.md](CREDITS.md). Photo ids live in `src/data/photos.ts`; swap in your own by changing an id, or point `photoUrl()` at local files.

If a photo can't load (offline, blocked network), that card falls back to the built-in illustration, so the app never shows a broken image.

Everything else is original and bundled, so you can share the repo freely:

| Asset | How it is made | Where |
|---|---|---|
| Illustrations (fallback, empty states, splash skyline): villa, townhouse, tower, cottage, loft, interior × day/dusk/night | Procedural SVG in TypeScript, rendered with `react-native-svg` | `src/art/scenes.ts` |
| Drifting clouds, breathing window light, parallax (illustration mode) | Reanimated on top of the SVG layers | `components/PropertyArt.tsx` |
| Photo fade-in, slow zoom, slide parallax, crossfading heroes | `expo-image` + Reanimated | `components/PropertyPhoto.tsx` |
| Sunrise sky on the splash | SkSL runtime shader in React Native Skia | `src/art/dawnShader.ts` |
| Neighbourhood map | Procedural SVG | `src/art/map.ts` |
| Logo and loader | SVG strokes animated with `strokeDashoffset` | `components/LogoMark.tsx` |
| Heart burst, key turn | Hand-authored Lottie JSON (Python generator) | `assets/lottie`, `scripts/make_lotties.py` |
| App icons | Generated from the logo geometry | `scripts/make_icons.py` |

Dev-only scripts (not part of the app): `scripts/preview-art.ts`, `preview-icons.ts`, `preview-map.ts` write SVGs you can open or rasterise to check the art without running the app (`npx tsx scripts/preview-art.ts`).

## Asset research (Nov 2026)

What I checked before choosing, and what it means for a series people will clone:

- **Rive** is the strongest option for interactive state-machine animation, but it needs a development build and does not run in Expo Go ([Rive: adding Rive to Expo](https://rive.app/docs/runtimes/react-native/adding-rive-to-expo)). It would stop readers from running the repo in one command.
- **Lottie** is great for one-shot motion. Free LottieFiles animations can be used commercially under the Simple License, but you can't redistribute them as standalone files, and using LottieFiles' tools commercially needs a paid plan ([LottieFiles licensing basics](https://help.lottiefiles.com/animation-licensing-basics-)). A public repo that bundles downloaded `.json` files would be redistributing them, so the two Lotties here are authored from scratch.
- **Skottie** (Lottie rendered by Skia) can be faster than `lottie-react-native` on low-end Android, but it is an extra native package ([discussion](https://github.com/Shopify/react-native-skia/discussions/3984)). Not worth the Expo Go trade-off for two short animations.
- **Skia runtime shaders (SkSL)** run in Expo Go and are animated by passing uniforms ([Skia shaders docs](https://shopify.github.io/react-native-skia/docs/shaders/overview)). Used for the splash sky. The shader was compiled and rendered offline with CanvasKit before shipping; if a device ever fails to compile it, the splash falls back to a gradient.
- **Reanimated shared-element transitions** are still behind a feature flag in the official release notes ([Reanimated 4.2](https://swmansion.com/blog/introducing-reanimated-4-2-0)), so cards use a custom hero entrance instead.

## Reskinning for the next episode

`src/brand.ts` holds every color. `src/data/properties.ts` holds all listings. Swap the scene functions in `src/art/scenes.ts` for another subject (restaurants, gyms, hotels) and the whole app follows.

## Demo notes

- Any email and an 8+ character password signs in.
- Listings, agents, prices and phone numbers are made up, and the photos show real buildings elsewhere (see CREDITS.md). The "Contact support" and "Call" actions use reserved placeholder addresses (`haven.example`, 555 numbers).
- Check the name "Haven" for clashes before you publish anything under it.
