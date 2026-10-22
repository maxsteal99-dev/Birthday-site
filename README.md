# Happy 30th, Sagarika

A one-page birthday surprise, built with [Vite](https://vitejs.dev) into a fast static site (minified code, fingerprinted file names so phones always get the latest version). No server, no database, no tracking.

```
index.html          the page
styles.css          all styling
script.js           all behaviour (loading screen, cake gate, music, album, snack machine, game…)
src/cake.js         the 3D birthday cake (Three.js): candles, flames, smoke, mic + swipe blowing
src/breath.js       breath detection from the microphone (no pitch + louder than the room)
src/haptics.js      vibration: Android Vibration API; light haptic ticks on iPhone iOS 17.4-26.4 only
src/latte.js        Barista Sagarika: build a Spanish latte in 3D (pour, ice, espresso, stir, sip)
src/monster.js      the 3D Monster can: top view, pull the tab, crack, swing to front, pour into a glass
src/topper-font.json  the two glyphs "3" and "0" for the gold topper (Gentilis, MAGENTA Ltd license)
fonts/              self-hosted fonts (SIL Open Font License), bundled by Vite
public/assets/      photos, album images, snack product photos, the song and the favicon (copied as-is)
original/           the original single-file page, kept as a backup
vite.config.js      build settings
```

## Work on it locally

```
npm install
npm run dev        # live preview at http://localhost:5173
npm run build      # production build in dist/
```

## Publish an update

The live site is the `gh-pages` branch, which holds the contents of `dist/`:

```
npm run build
cd dist && git init -q && git add -A && git commit -qm deploy \
  && git push -f https://github.com/maxsteal99-dev/Birthday-site.git HEAD:gh-pages
```

Live at https://maxsteal99-dev.github.io/Birthday-site/

## The cake

The page opens on a real-time 3D cake with 30 lit candles (Three.js, loaded as its own chunk while the loading screen shows). The microphone is the main way: the page asks for it as soon as the cake appears, then `src/breath.js` listens for a real breath (loud, broadband, flat-spectrum noise), so talking, laughing or music do not blow the candles out. She can also swipe across the flames, tap a candle or press Space; dragging spins the cake. One candle is a trick candle that relights once. As she blows, the screen shakes (every phone) and Android phones also vibrate: a rumble while she blows, a buzz per candle and a big celebration buzz at the end. iPhones do not let websites vibrate (the old switch-toggle haptic trick was closed in iOS 26.5). When the last flame is out, confetti fires, the song starts and the site opens. Slow devices automatically get a lower resolution and no shadows. Browsers without WebGL skip straight to the site.

## The birthday song

`assets/audio/him-and-i-instrumental.mp3` (a piano cover of "Him & I") plays in the background on a seamless loop, with no controls. The silence at the start and end of the file is trimmed in the browser, so the loop has no gap. It tries to start as soon as the page loads. Most phones only allow sound after a tap, so there it starts once the candles are out. It pauses while the tab is hidden and resumes when she returns. If the file can't be played, the page falls back to its built-in music box.

To change the song, replace the file or edit `SONG_FILE` at the top of `script.js`.

## Privacy

Anyone who has the link can open the page: it is **not** password protected. The page asks search engines not to index it (`noindex`), but treat the link like a shared photo album and only send it to the people you want to see it. The page contains no analytics, ads or third-party scripts. The only outside link is the "Open in Maps" button.
