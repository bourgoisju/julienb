# Julien Bourgois — sites réalisés

Portfolio des sites web que j'ai conçus et réalisés, en ligne sur https://julienb.vercel.app.
HTML / CSS / JavaScript sans dépendance ni étape de build : on modifie, on recharge, on publie.

## Structure

```
index.html                Accueil : accroche + appareils, rubans, aperçus des réalisations et des prestations
realisations.html         Exemples de mes réalisations (projets complets + aperçu en direct)
prestations.html          Prestations, méthode et questions fréquentes
contact.html              Contact (téléphone, WhatsApp, e-mail)
mentions-legales.html     Mentions légales
404.html                  Page « introuvable » servie par Vercel
assets/css/styles.css     Styles : jetons (couleurs, typo, espacements, mouvements) en tête, puis composants
assets/js/main.js         Point d'entrée (modules ES) — chaque module améliore un HTML qui marche déjà sans JS
assets/js/theme.js        Bascule clair / sombre, mémorisée dans le navigateur
assets/js/nav.js          Menu mobile (bouton « menu », Échap, fermeture au clic)
assets/js/motion.js       En-tête, apparitions au défilement, parallaxe des captures
assets/js/devices.js      Écrans de l'ordinateur et du téléphone du hero (rotation des sites, inclinaison à la souris)
assets/js/effects.js      Bouton aimanté
assets/js/titles.js       Découpe les titres de section en mots pour leur animation d'entrée
assets/js/preview.js      Aperçu en direct des sites dans une fenêtre (ordinateur / mobile, flèches, Échap)
assets/js/cursor.js       Bulle « Voir » qui suit la souris sur les captures
assets/img/               Captures ordinateur (720 et 1440 px) et mobile (nom-mobile.jpg, 390 px), partage, icônes
vercel.json               En-têtes de sécurité (CSP) et cache
robots.txt, sitemap.xml, site.webmanifest
tools/serve.ps1           Serveur local de prévisualisation
tools/test.ps1            Tests automatiques (aussi lancés par GitHub Actions à chaque envoi)
```

## Prévisualiser et tester

```powershell
powershell -ExecutionPolicy Bypass -File tools/serve.ps1 -Port 8081
```

Puis ouvrir http://localhost:8081.

```powershell
powershell -ExecutionPolicy Bypass -File tools/test.ps1
```

Les tests vérifient les liens et fichiers, les images (alt, dimensions, poids), le poids du CSS + JS (moins de 25 Ko compressés), les titres, le SEO (description,
Open Graph, JSON-LD), la configuration (CSP, manifeste, sitemap), puis lancent la page dans Chrome sans interface
pour vérifier que le JavaScript démarre sans erreur, sur ordinateur et sur téléphone.

## Ajouter un site

1. Capture en 1440 × 900 avec Chrome (et une capture mobile 390 px pour le hero) :
   `chrome --headless=new --hide-scrollbars --window-size=1440,900 --screenshot=nom.png https://...`
2. L'exporter en JPEG en 720 px et 1440 px de large (`nom-720.jpg`, `nom-1440.jpg`) dans `assets/img/`.
3. Dans `realisations.html`, copier un bloc `<li class="project card" ...>` puis changer numéro, textes, images,
   `href`, `data-title` et `data-meta` ; ajouter aussi la carte d'aperçu sur l'accueil (`.mini-works` dans `index.html`).
4. Ajouter le site dans les écrans du hero (capture mobile `nom-mobile.jpg` en 390 px de large) et dans le JSON-LD (haut de `realisations.html`) et son adresse dans `frame-src` de `vercel.json`
   (sinon l'aperçu en direct est bloqué en production).
5. Lancer `tools/test.ps1` : il signale tout oubli des étapes 3 et 4.

> Si vous modifiez le petit script en ligne du `<head>`, son empreinte CSP change : le test l'indique
> et donne la nouvelle valeur `sha256-…` à recopier dans `vercel.json`.

## Mise en ligne

Le dépôt est relié à Vercel : chaque envoi sur `main` publie le site. Aucune configuration de build n'est nécessaire.

## Questions fréquentes

Les questions de la page Prestations existent deux fois : dans la page (`<details>`) et dans le JSON-LD
`FAQPage` en haut de `prestations.html` (lu par Google). Modifier les deux ensemble.

## Cache des navigateurs (important)

Les images sont gardées 30 jours par les navigateurs. Pour que les visiteurs voient tout de suite une mise à jour,
les fichiers sont appelés avec un numéro de version : `styles.css?v=20261026`, `main.js?v=…`, les imports de
`main.js` et les captures (`emconcept-720.jpg?v=…`).

**À chaque mise en ligne qui modifie le CSS, le JS ou une image**, remplacer ce numéro partout par la date du jour
(rechercher/remplacer le numéro dans toutes les pages `.html` et dans `assets/js/main.js`).
`tools/test.ps1` vérifie que le même numéro est utilisé partout.

## Pages, en-tête et pied de page

Chaque page est un fichier `.html` à la racine ; Vercel la sert sans extension (`/prestations`, grâce à `cleanUrls`)
et `tools/serve.ps1` fait de même en local. L'en-tête (menu ordinateur et menu mobile) et le pied de page sont
recopiés dans chaque page : **les modifier partout à la fois**. `tools/test.ps1` vérifie qu'ils sont identiques,
que chaque page se signale dans le menu (`aria-current="page"`) et qu'elle figure dans `sitemap.xml`.
