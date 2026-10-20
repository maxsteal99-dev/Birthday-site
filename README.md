# Happy 30th, Sagarika

A one-page birthday surprise. It's a plain static website: HTML, CSS and JavaScript, with no build step, no server, no database and no tracking.

```
index.html        the page
styles.css        all styling
script.js         all behaviour (song, confetti, game, can, latte tally…)
assets/img/       photos and the can (JPG + WebP)
assets/fonts/     self-hosted fonts (Cormorant Garamond, DM Sans, Great Vibes, all SIL Open Font License)
assets/favicon.svg
original/         the original single-file page, kept as a backup
.nojekyll         tells GitHub Pages to serve files as they are
```

## Run it locally

Double-clicking `index.html` mostly works. For an accurate preview, serve the folder instead:

```
cd Birthday-site
python3 -m http.server 8000
```

Then open http://localhost:8000.

## The birthday song

Music plays in the background. Browsers only allow sound after a tap, so it starts when she taps **Open your birthday box** (or anywhere else), then loops for as long as the page is open. It pauses while the tab is hidden and resumes when she returns.

To use a recorded song, put the MP3 in `assets/audio/` named `him-and-i-instrumental.mp3` (or change `SONG_FILE` at the top of `script.js`). Only use a recording you have the rights to share. Until a file is there, the page plays its built-in music box (C – Am – F – G bells with soft pads).

## Publish it for free (recommended: GitHub Pages)

The code already lives on GitHub, so GitHub Pages is the simplest option: free, no new account, and it updates every time you push.

1. Merge the branch `claude/birthday-website-cinematic-yn9n3m` into `main` (open a pull request on GitHub and click **Merge**).
2. On GitHub, open the repository → **Settings** → **Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**, **Branch** to `main`, and **Folder** to `/ (root)`. Click **Save**.
4. Wait 1–2 minutes and refresh. The address appears at the top of the page:
   `https://maxsteal99-dev.github.io/Birthday-site/`
5. Open the link on your phone and test it (sound on!) before sending it to her.

> GitHub Pages on a free account requires the repository to be **public**. That means the code and photos can be seen on GitHub, not only on the website. If you'd rather keep the repository private, use Netlify Drop instead:

### Alternative: Netlify Drop (no Git needed, works with a private repo)

1. Download this folder (on GitHub: **Code → Download ZIP**, then unzip it).
2. Go to https://app.netlify.com/drop and sign in (free).
3. Drag the whole unzipped folder (the one containing `index.html`) onto the page.
4. Netlify gives you a link like `https://random-name.netlify.app`. Under **Site configuration → Change site name**, you can rename it to something like `happy-30th-sagarika`.

Cloudflare Pages ("Upload assets") and Vercel also work. Upload the same folder; no build command and no settings are needed.

## Privacy

Anyone who has the link can open the page: it is **not** password protected. The page asks search engines not to index it (`noindex`), but treat the link like a shared photo album and only send it to the people you want to see it. The page contains no analytics, ads or third-party scripts. The only outside link is the "Open in Maps" button.
