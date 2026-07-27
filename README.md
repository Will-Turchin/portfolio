# Will Turchin — Personal Website

A dependency-free, single-page portfolio built with semantic HTML, CSS, and a custom canvas particle system.

## Run locally

Open `index.html` directly, or serve the folder with any static server:

```powershell
python -m http.server 4173
```

Then visit `http://localhost:4173`.

## Publishing notes

- The GitHub link uses Will's public `@wturchin` handle.
- The closing contact section includes Message, LinkedIn, GitHub, and Resume actions; Message opens the Formspree-powered contact dialog.
- The Formspree endpoint in `index.html` is configured for this site. If you fork the portfolio, replace the `/f/...` endpoint with your own Formspree form ID. The form includes client-side validation, AJAX feedback, and a honeypot spam field.
- Motion automatically simplifies when the visitor requests reduced motion.

## Project image assets

The existing project images remain in `assets/projects/` for future use, but the site does not currently render project image galleries.
