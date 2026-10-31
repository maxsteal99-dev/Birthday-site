# Project notes: "Happy 30th, Sagarika" birthday website

> **Living memory for this project.** Read this whole file before doing anything.
> After finishing **every** request, update it: add the request and what was done
> to the **Change log**, and fix any section that is no longer true.
> Last updated: 2026-10-23 (after request #34).

---

## 1. Who / what

- **Owner:** Mani (GitHub `maxsteal99-dev`, email maxsteal99@gmail.com). Building a birthday gift for his wife.
- **Recipient:** **Sagarika Sharma**, turning **30** on **4 November 2026**. She is called "Saga" (see the graffiti photo "Saga ♥ Mani").
- **The trip in the site (since #32):** **Phuket, Thailand**, **Sun 1 – Thu 5 November 2026**, at **Wings Phuket Villa by Two Villas Holiday**, Villa 1 Bedroom Private Pool, 2 adults, 68/80 Moo 4, Pasak Soi 8, Cherngtalay, Thalang, Phuket 83110 (booking voucher from the owner; the booking reference and the villa's phone number are deliberately NOT on the public site). Quiet residential Pasak; listings say Bang Tao/Surin beaches ~15 min drive; check-in ~14:00–15:00, check-out by 12:00 (listings vary, so the site says "usually"). Her birthday (Wed 4 Nov) is day 4. *(History: Mauritius/Rama Villas 1–8 Nov until #29; The Residence Resort, Choeng Thale in #29–#31.)*
- **Her favourites (used on the site):** Spanish latte; Monster Energy **Ultra** (white can); garlic bread (Domino's garlic breadsticks); McDonald's **McSpicy Paneer**; **Kurkure Solid Masti Twisteez** (Masala); the song **"Him & I"** (G-Eazy & Halsey), piano instrumental.
- **Owner tests on an iPhone.** Talks casually ("bro"), gives voice-to-text instructions; read intent, not literal words.

## 2. Live site, repo, branches, deploy

- **Live URL:** https://maxsteal99-dev.github.io/Birthday-site/ (GitHub Pages, repo is **public**).
- **Repo:** `maxsteal99-dev/Birthday-site`. Working dir `/home/user/Birthday-site`.
- **Source branch (develop here, always push here):** `claude/birthday-website-cinematic-yn9n3m` (also the repo's default branch).
- **Deploy branch:** `gh-pages` = the **built `dist/` output only**. GitHub Pages auto-enabled when it was first pushed. Owner explicitly asked us to host it (request #11), so force-pushing built output to `gh-pages` is authorised.
- Earlier, a claude.ai Artifact was also published (https://claude.ai/artifact/KY1mhzJCirinVvWgUZNe3h); the owner didn't want a Claude link, so **GitHub Pages is the real link**. Don't update the artifact unless asked.

### Build + deploy recipe (used after every change)
```bash
cd /home/user/Birthday-site
npm install            # only if node_modules is missing (vite 5.4.10, three 0.169.0)
npx vite build         # -> dist/
git add -A && git -c user.email=maxsteal99@gmail.com -c user.name=maxsteal99-dev commit -m "...

Co-Authored-By: <model line from the session's attribution reminder>
Claude-Session: <session link from the attribution reminder>"
git push -u origin claude/birthday-website-cinematic-yn9n3m
rm -rf /tmp/claude-0/deploy && cp -r dist /tmp/claude-0/deploy && cd /tmp/claude-0/deploy \
  && git init -q && git add -A && git -c user.email=maxsteal99@gmail.com -c user.name=maxsteal99-dev commit -qm "Deploy built site" \
  && git remote add origin "$(git -C /home/user/Birthday-site remote get-url origin)" && git push -q -f origin HEAD:gh-pages
# then poll the live URL (add ?v=N to bust cache) until the new marker appears, and re-run a test against it
```
- The push sometimes prints `fatal: expected 'acknowledgments'…push negotiation failed`. It still succeeds. Verify with `git ls-remote origin gh-pages`.
- **Never put the model name in commits or code.** Commit trailers come from the system's attribution reminder.
- `*.zip`, `node_modules/` and `dist/` are git-ignored.

## 3. Ground rules from the owner (keep honouring these)

From the original brief (request #1) and later messages:
- Preserve all of her content, photos and features. Never replace personal content with placeholders. Don't silently change how things work.
- Premium, cinematic, romantic, **not** childish or overly pink. Palette: night plum/black, burgundy, champagne/gold, ivory, rose. Fonts: Cormorant Garamond (display), DM Sans (body), Great Vibes (script), all self-hosted in `fonts/`.
- Single page, natural scrolling, no scroll hijacking. Must look great on **iPhone** first, and also on desktop.
- Free static hosting, no backend, no tracking or analytics, `noindex`. A public link means anyone with it can see it; say so honestly.
- Test for real before claiming anything works; never fabricate URLs or results.
- He loves "hyper-realistic", interactive, fun, creative. The tech stack is open ("use any language/tool").
- The Monster can must keep looking like the **real can photo**.
- **Liquid glass** is wanted on UI surfaces, with the **theme colours unchanged**.
- **No "Tap to begin" screen** (he asked for it to be removed, request #21).
- **No song section or player buttons**: the music plays in the background only (request #6).
- **Highest quality, no compromises** (request #31): any technology or size is fine; never reduce visual quality (resolution, blur, shadows, animation) to gain speed. Make it smooth with better techniques instead. The site must also be smooth (request #30).

## 4. Architecture (current state)

Static site built with **Vite** (`vite.config.js`: `base: './'`, `assetsInlineLimit: 0`). `index.html` loads `styles.css` and `script.js` as a module. 3D scenes are lazy-loaded chunks sharing one `three` chunk.

```
index.html          page markup (all sections)
styles.css          all styling (sections are marked with big comment headers)
script.js           all behaviour (ES module): loader, cake gate, confetti, gift box, album, latte UI,
                    badminton, Monster can (2D fallback + 3D loader), snack machine, scroll/parallax,
                    background music, balloons/sparkles, liquid glass
src/cake.js         3D cake gate (Three.js)
src/breath.js       mic breath detector
src/germs.js        "Mrs. Sagarika" germ-cleaning gag shown after the candles are blown out (lazy chunk)
src/stitch.js       Stitch plays "Happy Birthday" on a ukulele at the finale (lazy chunk)
src/haptics.js      vibration helpers (Android vibrate; iOS switch-tick, which only works on iOS 17.4–26.4)
src/latte.js        3D Spanish latte barista game
src/monster.js      3D Monster can: top view → tab → crack → swing to front → pour into glass
src/topper-font.json  only the glyphs "3" and "0" of Three's gentilis_bold font (for the gold "30" topper)
fonts/              woff2 fonts (bundled by Vite)
public/assets/      copied as-is: img/stitch/*.webp (Stitch layers), img/sagarika.(jpg|webp) portrait, img/monster-can.webp (real can photo, 300x795 RGBA),
                    img/memories/*.webp (+ -600 phone sizes), img/snacks/*.webp, audio/him-and-i-instrumental.mp3,
                    favicon.svg, .nojekyll
original/Happy_30th_Sagarika.html   the owner's original single-file page (backup; never delete)
tools/tests/        Playwright + Python test scripts (see §7)
```

### Page flow, top to bottom
1. **Loader**: "Sagarika / Preparing your surprise" with a progress line; waits for fonts, the portrait, the first album photos and the cake chunk (max 7 s; the head script falls back at 9 s).
2. **Cake gate** (`#gate`, `src/cake.js`): full-screen 3D cake with a gold stand, two cream tiers, burgundy drip glaze, rosettes, raspberries, gold pearls, a gold "30" topper and **30 candles** with shader flames, a point light and smoke. Title "Make a wish, Sagarika / Blow out your candles", plus a candle counter.
   - The **mic auto-starts** when the cake is visible (no button, no tap). Status pill `#gate-mic`: "Listening… blow on your phone 🌬️". If denied, it falls back to "Swipe across the flames…". If the phone needs a touch first, it shows "Tap the cake once, then blow".
   - Blowing (via `src/breath.js`) puts candles out, front ones first. Swipe across flames, tap a flame, or Space also work. Drag spins the cake. One **trick candle** relights once.
   - **Feedback while blowing:** the screen shakes (`shake()` in script.js, works on every phone); Android vibrates (`rumble` while blowing, `buzzTick` per candle, a finale pattern). iPhone can't vibrate from the web (see §6).
   - All out → after 250 ms: confetti ×2, "Your wish is on its way ✨", `main` opens, the song starts, and the gate fades and is disposed. **Only when the candles were really blown out** (not Skip / no WebGL), 1.7 s later the germ gag starts (step 2b). "Skip" button top-right. No WebGL → gate skipped.
2b. **Germ gag** (`src/germs.js`, `startGermGame({ buzz })`, request #24; she has a hygiene/sanitizer OCD): a full-screen overlay (`.germs`, z-index 9000, `html.cleaning` locks scroll) covers the site with the "mess she blew on the screen": grimy haze, breath fog, fingerprint whorls, frosting smears, spit droplets and red-velvet crumbs (one canvas, `.g-dirt`) plus 10 (phone) / 14 (desktop) wobbling cartoon germs with googly eyes that follow her finger (`.g-live`). Message bubble: "Oops! You blew all over the screen 😷 Grab the sanitizer, Mrs. Sagarika." Glass dock: **🧴 Sanitizer** (tap, or hold for repeat sprays every 260 ms; mist plus a *psst* sound; germs inside the radius pop with x_x eyes) and **🧻 Wipes** (drag to erase the mess with soft destination-out brush stamps and squeaks). Wiping while germs live makes them dodge: "They're dodging! Sanitize them first 🧴". The last germ auto-switches to Wipes: "Germs gone! Now wipe the screen squeaky clean 🧻". Stats pill: "🦠 N germs left · ✨ X% clean" (24×40 grid of wiped cells; shown % = raw/0.9). Win = 0 germs and ≥90% of cells wiped → chime, sparkle sweep, "Squeaky clean ✨ 99.9% germ-free. Now it's safe to open your birthday box!", fades and is removed after 2.7 s. "Skip" button above the dock. Reduced motion: germs don't wander.
2c. **The present** (request #32; `src/gift.js` `showGift({from, buzz, onClose})`, imported on her first tap of the box, opened ~750 ms after the 3rd tap pops the lid; tapping the opened box shows it again): a full-screen overlay (`.gift-reveal`, z 8500, `html.gifting` locks scroll) where **the pink iPad keyboard case** (typecase Edge, pink, which Mani bought her; never show the technical product name) flies out of the box (Web Animations from the box's rect) onto a glowing stage with rays, floats; magical chime + confetti. Then "Surprise! 🎁 / A pink keyboard for your iPad / Your iPad just turned into a little pink laptop 💗", 6 popping bubbles (🌈 Glows in 11 colours, 🧲 Your iPad floats, 👆 A real trackpad, ✏️ Holds your Pencil, 🪶 Super light, 🔋 Barely needs charging), **SAGARIKA keycaps** that cycle the 11 glow colours on tap (wave + click sound + "Colour n of 11"), 4 swipeable glass photo cards (It glows 🌈 / Your iPad floats ✨ / A real trackpad 👆 / Made for cosy nights 🌙) with dots, "From Mani, with love 💗", and "Open the rest of your surprise ↓" (→ scrolls to the letter). Images in `public/assets/img/gift/` cropped from the owner's Amazon screenshots and upscaled 4× with EDSR (keyboard.webp is a cut-out on transparent; source crops/scripts were in the session scratchpad, `upscale.py` logic mirrors `tools/stitch/layers.py`).
3. **Hero**: portrait (gold border + glow; the rotating ring was **removed** in #22), "A surprise for / Sagarika / is turning 30", a steaming-cup SVG (hidden on short screens), "4 November 2026", and the **gift box** (`#open`): 2 taps wobble with rattle sounds and lines ("Hmm… something rattles inside 👀", "It's heavy with love. One more tap!"); the 3rd tap makes the lid and bow fly off, golden rays and a chime play, confetti shoots from the box, then it scrolls to `#hello`. Balloons with parallax. The "Scroll" cue shows only after the box is opened.
4. **Letter** (`#hello`): "N days until paradise" countdown pill (to 1 Nov 2026), the letter, signed "With all my love, Mani".
5. **Memory album** (`#memories`): "Thirty of my favourite chapters" / "Thirty memories for thirty years…". **30 polaroids** (since #34; 30 memories for her 30th): swipe/drag, ‹ › buttons, arrow keys, tap to flip for a note on the back signed "with love, Mani". Only the top 3 are rendered. Confetti at the last photo (the kiss). Captions and notes are listed in §5.
5b. **"A sky full of us"** (`#sky`, `src/stars.js` `initStars(section)`, imported at 700 px; request #34): "Thirty years · thirty memories / A sky full of us". A night-sky stage (5:4, dust stars, shooting star) with **30 photo-stars** (round thumbs `public/assets/img/stars/<name>.webp`, 216 px, cropped from each album photo's object-position) scattered and twinkling, dim. **"Light up the sky ✨"** → stars glide (staggered transforms) into a golden **"30"** (points spaced evenly along the curves' length: 13 on the 3, 17 on the 0) and SVG threads draw between them (stroke-dashoffset), sparkle arpeggio + confetti. Tap a star → **memory viewer** (`.mem30`, grows out of the star; polaroid with the album photo via its srcset, "Memory n of 30", tag, caption, the back note in quotes; ‹ › / swipe / arrow keys / Esc; preloads the next photo). Seen stars get a gold ring; progress "n of 30 memories relived" (saved in localStorage `sky30-seen`, per device). **After all 30 are seen**, closing the viewer turns the stars into a pink-glowing **heart** + "Thirty memories, and a whole sky of them still to come. Happy 30th, my love. 💛" + confetti and chord. Memories are read from the album cards (single source of truth).
6. **Spanish latte** ("Barista Sagarika / Your official fuel"): 3D counter (`src/latte.js`) with a can of condensed milk, a bowl of ice, a milk bottle, an espresso cup and a tall glass. Recipe chips 1–5 (Condensed milk → Ice → Milk → Espresso → Stir) double as buttons; tapping props works too; a wrong order gives a hint. Pours have streams and sounds; the ice clinks and the glass fogs; the espresso cascades; stir by drawing circles (or tap Stir). Done → confetti, +1 to "Lattes enjoyed", tap the glass to sip, "Make another". The "Add a latte to the tally" button is kept. No WebGL → the old CSS latte.
7. **Monster can** ("Her other fuel"): 3D (`src/monster.js`). The real photo is wrapped on a can whose lathe profile is **traced from the photo silhouette** (u = sin-mapping, so the front view equals the photo). Top view → drag up lifts the ring-pull (click) → at 85% the seal cracks (snap, hiss, fizz), the flap folds in, droplets spray and bead on the lid, mist → camera swings top→front while the can spins 360° → a glass slides in → the can tilts and pours (stream, pale sparkling drink, bubbles, foam) → sets down: "Cheers! One ice-cold Monster Ultra, poured just for you. ⚡". The "Crack it open 🥤" button autoplays; "Crack open another" resets. The 2D fallback (SVG can with a pull-tab, `#canbox`) is used without WebGL.
8. **Snack machine** ("Snack break / And for the cravings"): "Sagarika's Snack Machine" with **real product images** (Domino's garlic breadsticks cut-out, McDonald's India McSpicy Paneer meal PNG, Kurkure Solid Masti Twisteez packet). Tap → drop into the tray (clunk) and a **coupon No. 0411-A1/B2/C3** "Redeem with Mani · Valid forever"; all three → gold "Snack trifecta" combo coupon plus confetti; "Surprise me 🎲" picks at random.
9. **Paradise** (Phuket intro: villa in quiet, green Pasak, Cherngtalay; villa card: **Wings Phuket Villa**, "Villa · 1 bedroom · private pool", address, chips 🏊 private pool / 🏡 whole villa / 🌿 quiet Pasak / 🏖️ ~15 min to Bang Tao, check-in Sun 1 Nov, check-out Thu 5 Nov, Open in Maps; weather note) and **"Five days in Phuket"** (`.week`): 5 day cards with summary, `<details class="plan">` time-slot items + Maps links + tips + Plan B, and "Stamp this day".
   - Day 1 Sun: arrive (HKT ~25–30 min), check in ~2 pm, stock up at Villa Market / Tops (Boat Avenue / Porto de Phuket, 10–15 min), **Sunday Walking Street / Lard Yai** (Thalang Rd, Old Town, Sundays 4–10 pm, ~40–45 min); Plan B pool + Boat Avenue.
   - Day 2 Mon: latte at Boat Avenue (Little Paris), **Layan Beach** (quiet national-park beach north of Bang Tao; "a small park fee may apply"), villa pool/nap, ~5:30 pm Bang Tao sunset walk, dinner Boat Avenue/Porto; Plan B massage + Chillva Market (Mon–Sat).
   - Day 3 Tue: **Phang Nga Bay** tour (Ao Po / Royal Phuket Marina, 8–10 h, check Cherngtalay/Pasak pickup; Hong Island canoe, James Bond Island = Khao Phing Kan facing Koh Tapu, Koh Panyi lunch); Plan B Phi Phi/Maya Bay or swap with Day 2.
   - Day 4 Wed **birthday**: pool breakfast + latte + present, lazy midday, 2–4 pm couple's spa, ~5 pm to **Catch Beach Club, Bang Tao** (~15 min), ~6 pm sunset cocktail, **birthday dinner at Catch** (seafood platters, oysters, prime cuts, Thai classics; Twinpalms lists lunch & dinner 12 pm–10:30 pm). Tip "For Mani: book ahead, beachfront table at sunset, mention the birthday". Plan B **Xana Beach Club** (Angsana Laguna, Mediterranean, quieter). (Research: Catch/Xana confirmed still open in a 2026 Bang Tao beach-structure crackdown update; Café del Mar is in Kamala and more of a party venue.)
   - Day 5 Thu: pool, check out (usually by 12), Big Buddha only if the flight is late (~45 min from Cherngtalay, ~1 h from airport), else lunch nearby, airport ~25–30 min.
   - **Live "today"**: in Asia/Bangkok time on 1–5 Nov 2026 the matching day gets `.today`, its plan auto-opens, and `#today-pill` says "Today in Phuket: …" (birthday: "Today is your birthday, Sagarika 🎂").
   - **Passport** (`#passport`): stamps (rotated double-ring rubber stamps, thunk sound) for stamped days, saved in localStorage `phuket-stamps` (per device); all 5 → confetti + "All five days stamped. Best trip ever? 💙". Tap again to unstamp.
10. **Chidi Shika** badminton canvas game (original logic kept; its canvas only animates while on screen).
11. **Finale**: portrait, "Happy 30th, Sagarika", the note, **Stitch** (request #27), then "Celebrate again 🎉" (confetti).
   - **Stitch** (`#stitch-stage`; since #28 he is the **owner-supplied Stitch picture** (`tools/stitch/stitch-source.png`, sitting, mouth open), split by `tools/stitch/layers.py` into `public/assets/img/stitch/stitch-body.webp` + `stitch-ear-l/-r.webp` (white background → clean alpha, 3× upscale; the ears sit behind the body and wiggle/flick); the ukulele and his two paws are an SVG overlay (`.st-props`, viewBox = the 269×372 source); logic `src/stitch.js` `initStitch(stage, window.__music)`, imported when the stage is within 600 px): blue Stitch sitting with a ukulele, idle breathing/blinking/ear twitches. The first time he's ≥60% on screen he wiggles and says "Aloha! 🌺", then (if a sound channel is already running) plays by himself; otherwise tapping him plays. Song: "Happy Birthday" (public-domain melody, C major, 0.43 s/beat, ~13 s) as a Karplus-Strong plucked ukulele melody + GCEA chord strums (C, G7, F) + a soft vibrato "ooh" hum; he bobs, sways, strums and opens his mouth per note; the glass bubble shows the lyric lines ("Happy birthday, dear Sagarika 💙"); notes/hearts float up. End: hearts burst + confetti + "Ohana means family. Happy 30th, Sagarika 💙"; hint becomes "Tap Stitch for an encore 🎸". Tapping while playing = giggle + ear flick. The background song is **ducked** to 0.18 while he plays (`window.__music.duck(true/false)`), restored after.

### Global systems in script.js
- **Music:** `SONG_FILE='assets/audio/him-and-i-instrumental.mp3'`, loop, decoded with Web Audio, silence trimmed for a gapless loop (~2.05 s to 265.86 s). It is **held until the cake is done** (`window.__cakeDone`), then starts within about 0.25 s. If the page's own AudioContext isn't unlocked (no tap), it plays through the **mic's still-running AudioContext** (passed in the `cakedone` event detail). 1 s fade-in. Pauses when the tab is hidden. Falls back to an `<audio>` element, then a synthesized music box.
- **`window.__music`** (end of the music module): `ctx()` returns the running song AudioContext (or the mic one), `duck(on)` turns the song down/up. Used by Stitch.
- **Confetti:** `burst(x?, y?)` with gold-foil confetti on a canvas; `window.burst` is exported for other modules.
- **Scene moods:** `body[data-mood]` cross-fades the fixed lighting layers (candle, rose, coffee, silver, lagoon, court).
- **Liquid glass:** JS adds `.lg` to `.pill, .btn-ghost, .card, .chips span, .nav-btn, .step, .barista-msg, .can3d-msg, .gate-mic, .gate-skip, .gate-toast, .game`, including elements added later (MutationObserver). Chromium (not iOS) also gets `.lg-refract` (an SVG `#lg-distort` displacement in `backdrop-filter`) on `.card, .game, .gate-mic, .barista-msg, .can3d-msg, .gate-toast, .pill`. The specular highlight follows the pointer (`--lx/--ly`). Gold `.btn-lux` buttons keep their gold with an added top gloss.
- **Quality first, then smoothness (owner's rule from #31: "I don't want any compromise in quality"; never trade visible quality for speed, find a cheaper technique instead).** Current state:
  - **3D (`src/quality.js`):** `makeQuality(renderer, resize)` renders at the full screen resolution, **up to 3×** (iPhone), shadows always on; only if frames stay >40 ms for ~60 frames (scrolling ignored) does it step down by 0.5, **never below 2×**. `smartShadows(renderer, scene)` sets `shadowMap.autoUpdate=false` and re-renders the shadow map only when a caster's matrix/visibility changed, an animation runs (`busy`), or every 30th frame: identical pixels, less GPU work. Used by cake, latte, Monster. `renderer.debug.checkShaderErrors=false`. Latte and Monster call `makeQuality` right after creating the renderer (final resolution before the first sizing, so the canvas buffer is allocated once) and compile with `renderer.compileAsync()` (background/parallel compile; frames skip drawing until `ready`). The cake still compiles synchronously behind the loader.
  - 3D scenes **animate every frame, also while scrolling** (the #30 "hold last frame while scrolling" was removed in #31). They are built ahead of time: `__whenStill(load)` when 2600 px away (the page is still), or immediately at 250 px if she got there first.
  - **Liquid glass at full quality everywhere:** `backdrop-filter: blur(14px) saturate(175%) brightness(1.06)` on every `.lg`. The light sweep is a separate GPU-only layer: JS adds `<i class="lg-sheen">` (a skewed, horizontally-faded band animated with `transform` only). Surfaces whose text is rewritten by script or hidden with `:empty` (`DYN = .pill, .barista-msg, .can3d-msg, .gate-toast, .gate-mic, .gate-skip, .g-msg, .stitch-bubble`) get `.lg-dyn` and the painted sweep in `::before` instead. Chromium refraction on `.card, .game, .gate-mic, .gate-toast, .pill` but **not on messages over WebGL canvases** (Chrome then composited the latte canvas in two visibly different halves).
  - **#33 sharpness pass:** album photos re-exported from the owner's original uploads (matched by image similarity, all 17 exact) at three sizes, `name-600.webp` (~640 px visible width), `name-1080.webp`, `name.webp` (~1440), with **correct `w` descriptors** = visible width inside the 4:5 polaroid (`min(w, h*0.8)`); the old srcset mislabelled 480/675-px files as 640w/900w, so 3× phones always got soft photos. city-walk/golden-temple originals are smaller, so they have only 2 sizes. Album cards also call `img.decode()` when loaded (5 ahead), so the decode happens before the card shows. Portrait (`sagarika.jpg/.webp`, 480→960), Monster can label texture (`monster-can.webp`, 300×795→1200×3180, UVs are normalized so nothing else changed) and the three snack images (→ up to 1000 px) were upscaled 4× with EDSR (transparent pixels filled with the nearest opaque colour first, so no dark fringe). Latte/Monster shadow maps 2048 (cake stays 1024: it spins, so its shadow re-renders every frame), max anisotropic filtering on latte canvas textures, latte wood texture 2048×1024 (line widths/amplitudes scaled).
  - **#33 smoothness:** scroll sparkles are a pool of 8 `.hrt` elements animated with the Web Animations API (transform/opacity only) and the scroll position is read in rAF; before, every scroll event read `scrollY` (forced layout) and inserted a new DOM node: 4.4 s → 0.3 s in the profile. `resize()` in latte/Monster only calls `renderer.setSize` when the size really changed.
  - Kept from #30 because they change no pixels: scroll handler writes transforms directly after one layout read; mood layers `will-change:opacity` + `visibility:hidden` once faded; germ game sprites (now with a pre-blurred soft shadow sprite, and the 0.4 px dirt blur baked into the canvas once).
  - 8 floating balloons; latte "next step" glow and vending bulbs animate their box-shadow as originally.
  - Latte counter wood texture is now seamless (grain waves with whole-number periods); the old random-walk grain showed a seam down the middle of the counter.
  - **Stitch** layers are upscaled 4× with the **EDSR super-resolution network** (opencv-contrib dnn_superres, model `EDSR_x4.pb` from github.com/Saafke/EDSR_Tensorflow) → 1076×1488 webp, crisp outlines (`tools/stitch/layers.py src out [model]`).
- Performance: `content-visibility:auto` on `.scene`; adaptive quality in the 3D scenes (lower pixel ratio, then no shadows); animations use wall-clock time (`tdt`).

## 5. Content reference

**Album (order → file, front caption, back note):**
1. coffee-laugh: "Coffee o'clock / This laugh is my favourite song." / "The cup says slow down to wake up. With you, I never want to rush a single moment."
2. golden-temple (the AI-enhanced Golden Temple photo): "Golden Temple · Amritsar / Golden hour, golden you."
3. saqqara: "Saqqara · Egypt / You, smiling under that hat."
4. sphinx: "The Sphinx · Giza / Even the Sphinx gave us a moment."
5. giza: "Giza · Egypt / Looking at the same horizon."
6. pyramid-tunnel: "Inside a pyramid / Tight squeeze, big smiles."
7. temple-bar: "Temple Bar · Dublin / A million lights, and you leaned on me."
8. saga-mani: "Our names on the wall / Saga ♥ Mani. Written in ink."
9. the-alley: "The alley / The one with the foot pop."
10. city-walk (the sideways photo, rotated upright): "City walk / Cheek to cheek, any street."
11. by-the-sea: "By the sea / Wind, sea and my whole world."
12. coffee-and-flowers: "Coffee & flowers / Flowers for my favourite flower."
13. cat-cafe: "Cat café / Two kittens and one very happy girl."
14. marigolds: "Under the marigolds / A thousand flowers, and you laughing."
15. gondola: "Gondola ride / Our own little Venice."
16. rooftop (tilted on purpose): "City lights / Top of the city, top of my world."
17. the-kiss: "My favourite one / And then you did this." / "…Happy 30th, my love."
**Added in #34 (13 more → exactly 30; duplicate check: none matched the album or each other, max similarity 0.74 vs ~0.9+ for a real duplicate; the night Golden Temple photo of her alone is a different photo from the existing AI-enhanced couple one). Order: golden-night right after golden-temple; the rest after rooftop; the-kiss stays #30:**
- golden-night: "Golden Temple at night / Peace looks a lot like you." · clock-wall: "Wall of clocks / Every clock in the room said it was our time." · lasers: "Lights and lasers / My favourite person in any crowd." · rooftop-laugh: "Rooftop nights / That laugh, that view." · full-moon: "Under the full moon / Just us, and a moon showing off." · clifftop: "Clifftop wind / Hold on to me, the wind is strong." · lift-selfie: "Lift selfie / Our favourite mirror." · detective: "Detective Sagarika / Case: who ate the last fries? 🔍" · pink-gamer: "Pink gamer girl / Cat ears, pink keys… foreshadowing? 😉" (back note ties to the keyboard present) · sparklers: "Sparklers / You light up every festival." · haldi: "Haldi day / Sunshine, in yellow." · wedding-sparks: "Our wedding / The day sparks literally flew." · s-and-m: "S ♥ M / You, looking at me like that." Each has a back note signed Mani (see index.html).
- **Removed:** "Photo by Sagarika" (Mani at the pyramids) in request #13. Four accidental Golden Temple duplicates were discarded in #12.
- Real place names are used only where obvious; the owner never supplied the other locations.

**Coupons:** garlic bread "…extra cheesy. I won't steal the last piece. (Probably.)"; McSpicy "…with fries, at any hour. Even midnight. Especially midnight."; Kurkure "…all to yourself. I'll buy my own this time."; combo "All three, a movie, a blanket and me on the couch."

## 6. Known limitations / honest facts (don't promise otherwise)

- **iPhone cannot vibrate from any website.** The `<input type=checkbox switch>` haptic trick works only on iOS 17.4–26.4 (Apple patched it in 26.5). The screen shake is the substitute. Android vibrates, but only after some user activation (e.g. a swipe).
- Phones block audio until a gesture. This is solved for the cake by the mic-context trick; elsewhere sounds play on tap anyway.
- Liquid-glass refraction (`backdrop-filter: url()`) works in Chromium only; Safari gets blur, rim and highlight only.
- The song is copyrighted (the owner supplied the MP3). It's publicly downloadable from the public repo and site; the owner was told.
- Product images (Kurkure, McDonald's, Domino's) were taken from the brands' and retailers' sites at the owner's explicit request, for a personal gift.
- The test browser renders 3D in software at about 2–4 fps; real phones run at 30–60 fps. Mic detection is decoupled (33 Hz timer) and tweens use wall-clock time because of this.

## 7. Testing toolkit (`tools/tests/`)

- Serve the build: `cd dist && python3 -m http.server 8766` (restart it after each `vite build`, because the build replaces `dist/`).
- Run Playwright scripts with `NODE_PATH=/opt/node22/lib/node_modules node tools/tests/<script>.js …`. Chromium is at /opt/pw-browsers; launch with `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader` for WebGL.
- Many scripts take `(outDir, baseUrl)` or `(baseUrl, outDir)`; check the `process.argv` usage at the top. Most press `#gate-skip` first.
- Fake mic: generate WAVs with `python3 tools/tests/gen_audio.py <dir>`, then launch Chromium with `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream --use-file-for-fake-audio-capture=<wav>`.
- Since #31 the 3D scenes render at up to 3×; in the software test browser that is extremely slow, so the Playwright scripts set `window.__maxDPR` (default 2, override with env `DPR=3`) via `addInitScript`. Real devices never set it.
- `package.json` has `"type":"module"`, so the CommonJS test scripts must be **copied to the scratchpad as `.cjs`** before running (e.g. `cp tools/tests/germtest.js $S/germtest.cjs`).
- Scripts: `skytest.js` (base, outDir, [device|desktop]: 30 stars, light up → 2 paths, open star 5, page through all 30, close → heart + final text, scroll unlocked), `presenttest.js` (base, outDir, [device|desktop]: 3 taps on the box, checks the reveal, bubbles, images loaded, scroll lock, keycap colour change, card swipe dots, close → letter, re-open), `scrollperf.js` (base, label, [profile]: scrolls the whole page with instant scrollTo — the page has `scroll-behavior:smooth`, so per-frame smooth scrollTo never moves — under 4× throttle; prints avg/p95 frame ms, per-section averages, style/layout/script ms, and with `profile` the top self-time functions), `itintest.js` (base, outDir, [device|desktop]: villa card, opens day 3 plan, stamps all 5 (persist after reload, unstamp), fakes Date to 4 Nov 2026 Bangkok for the today pill), `stitchtest.js` (base, outDir, [device|desktop]: skip cake, scroll to Stitch, checks lyrics, pluck count ~106, end text, encore), `germtest.js` (base, outDir, [device|desktop]: blows the cake out by swiping, then nag check, sprays a grid, wipes rows; expects the overlay gone, scroll unlocked), `album.js` (swipe/flip/nav/confetti), `snack.js` (coupons/combo), `lattetest.js` (full recipe + sip), `mtest.js` (Monster phases), `cake-flow.js` (gate end-to-end), `blowtest.js`/`blowtest2.js` (mic breath vs non-breath; candle counts per second, with debug), `musictest.js` (ms from last candle to song start, under a gesture-required autoplay policy), `vibtest2.js` (records `navigator.vibrate` calls / iOS ticks / shake frames), `gifttest.js` (gift box), `lgshot.js` (liquid glass screenshots), `perf.js` (frame times under 4× CPU throttle), `vendshot.js`, `ltshot.js`, `cakeshot.js` (screenshots), `det.py` (periodicity per window of a WAV), `sim.py` (simulates the breath detector at given fps: `python3 sim.py 60,30 files…`).
- Expected results: talking, music, laughter and claps → 0 candles out; soft, rumbly and hard breaths → all out; song starts about 0.26 s after the last candle.

## 8. Change log (every request, in order)

1. **Original brief:** transform the basic single-file HTML into a cinematic, premium one-page site, preserving everything, with free hosting. → Rebuilt (index.html / styles.css / script.js / assets), with a candlelight burgundy/champagne theme, scene moods, a reveal system and a README. The song at the time was a generated Web Audio music box.
2. "Change music to 'Him & I' by Halsey instrumental" → set up `SONG_FILE`. I declined to download copyrighted audio and asked the owner to supply it.
3. "Host this, give me a public URL" → published as a claude.ai Artifact.
4. Remove the floating play button and the "Your birthday song" section; music only in the background; find a "non-copyright" version → removed both. I declined to download from YouTube or other sites.
5. The owner uploaded the MP3 (Chrispi24 piano cover, KLICKAUD). → Gapless loop via Web Audio with trimmed silence; no buttons.
6. Wants a non-Claude link. → The repo was private, so I sent a zip with Netlify Drop steps.
7. The owner made the repo public. → Pushed `gh-pages`, Pages went live at github.io.
8. Sent many photos; asked to replace the first photo with an interactive memory album with cute captions. (Later sends: removed 4 accidental photos, added 6.)
9. Built the polaroid album (it replaced the pink light-room "us" photo; the portrait was kept).
10. Asked for something fun with garlic bread, McSpicy Paneer and Kurkure. → Snack vending machine with coupons.
11. Remove the "Photo by Sagarika" card; the album is laggy. → Removed it; render only the top 3 cards, smaller images, and stopped the badminton canvas when off-screen.
12. "Make it bigger, not a basic HTML site, faster, seamless" → Vite build, loading screen, content-visibility, srcset, bigger layout.
13. Hyper-realistic interactive cake to blow out before the site opens. → Three.js cake gate (mic button + swipe).
14. Make the mic primary with no button; swipe second. → Auto mic plus the breath detector.
15. The mic needed very hard blowing; a "make your own Spanish latte" game; real snack images; keep the Monster can. → Periodicity-based breath detector (tested with synthetic audio and simulation), 33 Hz mic timer, the latte game, real product images.
16. Monster can interactive opening with a realistic noise. → Pull-tab with synthesized click, snap, hiss and fizz.
17. Monster: top view → open by gesture → droplets → rotate to front in 3D → pour into a glass. → `src/monster.js`.
18. The music started late after the candles. → Start the song on the mic's AudioContext, 250 ms delay, 1 s fade.
19. Strong phone vibration when blowing. → Added haptics plus a "Tap to begin" step; explained the iPhone limits.
20. Vibration not happening on his iPhone; remove "Tap to begin". → Removed it; Apple patched the haptic trick in iOS 26.5; added the **screen shake** substitute; Android still vibrates.
21. The ring behind the portrait was misaligned; make "Open your birthday box" more fun. → Removed the ring; built the 3-tap gift box with lid pop, rays, chime and confetti; tighter hero on short phones.
22. Add "liquid glass" with the theme unchanged. → `.lg` glass surfaces, Chromium refraction, pointer highlight, press squish.
23. Create this .md memory file, update it after every prompt, and read it every time. → Created `PROJECT_NOTES.md` and `CLAUDE.md` (auto-loaded), and saved the test scripts to `tools/tests/`.

24. Fun gag for her hygiene OCD: after blowing out the cake she must clean the screen with sanitizer and wipes before the site is fully visible. → Added `src/germs.js` (see §4, step 2b), hooked from `close(true)` in script.js; CSS at the end of styles.css; test `tools/tests/germtest.js` passes on iPhone 13 and desktop.
25. Replace "Dr. Sagarika" with "Mrs. Sagarika". → Changed the germ gag's opening line (and code comments/notes).
26. She also loves **Stitch** (Lilo & Stitch). The owner asked for ideas first and will pick one. → Gave 8 ideas (see §9); nothing built yet.
27. The owner picked **"Stitch at the finale"**. → Built `src/stitch.js` + SVG Stitch with ukulele in the finale (see §4 step 11); `window.__music` ducking API; test `stitchtest.js` passes on iPhone 13 and desktop.
28. "That doesn't look like Stitch at all" + sent the real Stitch picture. → Replaced the hand-drawn SVG with his picture (layered: body + wiggling ears), ukulele across the lap with SVG paws (one on the neck, one strumming); song/behaviour unchanged. Disney artwork used because the owner supplied it for this personal gift.
29. Sent a Booking.com screenshot (The Residence Resort Villa 1bdr Private Pool, Choeng Thale, Phuket, 1–5 Nov): research and build an accurate, creative itinerary. → Researched (resort location, Lard Yai hours, Phang Nga/Phi Phi, early-Nov weather, Big Buddha, Chillva, PRU, Loy Krathong = 24 Nov 2026 so not during the trip). Replaced the Mauritius villa card and 8-day plan with the Phuket card + 5-day interactive itinerary (plans, Plan B, map links, live today, passport stamps); letter and latte lines now say Phuket / five days.
30. "The website is very laggy, make it very smooth." → Profiled a full scroll (see §4 "Performance rules"): paused 3D/badminton rendering during scroll, deferred 3D builds until still + precompiled shaders + no shader-error checks, rewrote the scroll handler (direct transforms, one layout read), live glass blur only on floating surfaces and no infinite shimmer, GPU-composited mood fades with hidden inactive layers, cheaper glows, germ game sprites instead of per-frame gradients/shadows/CSS blur. Avg frame 136 → ~35 ms in the throttled test; all feature tests pass (album test now scrolls the card into view before clicking).
31. "Quality feels compromised compared to before; use any technology, no compromise in anything." → Restored everything #30 had cut (glass blur on all surfaces, the shimmer, refraction, 8 balloons, original glows, 3D animating while scrolling, soft germ shadows, dirt softness) using cheaper techniques that keep the pixels identical (GPU-layer shimmer, smart shadow updates, preloading). Note: the software-rendered test browser draws each 3D frame in ~0.5 s, so scroll numbers there are dominated by 3D and can't represent an iPhone GPU; functional tests pass. Raised quality beyond the original: 3D renders at up to 3× (was capped at 2× and could drop to 1× without shadows), Stitch upscaled with an AI super-resolution model, seamless latte wood, no refraction seam over the latte canvas.
32. New booking (Wings Phuket Villa, Pasak Soi 8, Cherngtalay, 1–5 Nov), a thorough itinerary, a beach club for the 4 Nov birthday dinner, and the gift box should reveal his present (pink iPad keyboard case) in a cute, non-technical way. → Researched the villa area and beach clubs (chose Catch Beach Club, Plan B Xana); rewrote the villa card and all 5 days; built the present reveal (§4, 2c). Booking reference/phone kept off the public site.
33. "Increase quality and make it way smoother, no compromise." → Profiled a full scroll (unminified build + CPU profile) and fixed the main-thread hotspots without changing visuals (sparkle pool, guarded canvas resizes, pre-decoded album photos); raised quality: album photos from originals with correct srcset (were mislabelled → soft on iPhone), EDSR-upscaled portrait/Monster can texture/snacks, 2048 shadow maps on latte/Monster, max anisotropy, 2× latte wood.
34. Sent 13 more photos: check duplicates, make it 30 for the 30th, add to the album and do something magical. → No duplicates (17 + 13 = 30). All 13 exported from the originals (3 sizes, correct srcset) with captions + back notes; album now "Thirty of my favourite chapters". New section "A sky full of us": 30 photo-stars → golden "30" → tap to relive each memory → heart finale (§4, 5b). Album test now runs to the last photo, whatever the count.

## 9. Ideas mentioned but not done / open questions

- **Stitch ideas (#26)**, #7 built in #27; the rest are still available: 1) Stitch crashes the site (pod lands, he causes chaos, she catches him); 2) hidden Stitch hunt across sections; 3) Experiment 626 adoption certificate; 4) "Ohana" message with a Stitch letter; 5) feed Stitch; 6) Stitch steals a candle; 7) Stitch sings/plays ukulele at the finale; 8) Stitch pet/scratch toy. The finale Stitch layers (owner's picture) can be reused. **Never redraw Stitch by hand again; the owner rejected the hand-drawn one.**

- Birthday dinner booking is Mani's to do (Catch Beach Club, Bang Tao; Plan B Xana). Flight times and the villa's check-in/out times are unknown, so the plan stays time-flexible on days 1 and 5.
- The owner never said where most album photos were taken (only obvious places are named). He can send places or edits for the captions.
- The pour, latte and shake strengths can be tuned on request.
