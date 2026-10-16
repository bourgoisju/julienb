# Julien Bourgois — sites réalisés

Portfolio des sites web que j'ai conçus et réalisés, en ligne sur https://julienb.vercel.app.
HTML / CSS / JavaScript sans dépendance ni étape de build : on modifie, on recharge, on publie.

## Structure

```
index.html                Page unique : accroche, travaux, offres, méthode, questions, contact
404.html                  Page « introuvable » servie par Vercel
assets/css/styles.css     Styles : jetons (couleurs, typo, espacements, mouvements) en tête, puis composants
assets/js/main.js         Point d'entrée (modules ES) — chaque module améliore un HTML qui marche déjà sans JS
assets/js/theme.js        Bascule clair / sombre, mémorisée dans le navigateur
assets/js/motion.js       En-tête, apparitions au défilement, parallaxe, bande de captures liée au défilement
assets/js/effects.js      Bouton aimanté, compteur animé
assets/js/preview.js      Aperçu en direct des sites dans une fenêtre (ordinateur / mobile, flèches, Échap)
assets/js/cursor.js       Bulle « Voir » qui suit la souris sur les captures
assets/img/               Captures (720 et 1440 px), image de partage, icônes
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

Les tests vérifient les liens et fichiers, les images (alt, dimensions, poids), les titres, le SEO (description,
Open Graph, JSON-LD), la configuration (CSP, manifeste, sitemap), puis lancent la page dans Chrome sans interface
pour vérifier que le JavaScript démarre sans erreur, sur ordinateur et sur téléphone.

## Ajouter un site

1. Capture en 1440 × 900 avec Chrome :
   `chrome --headless=new --hide-scrollbars --window-size=1440,900 --screenshot=nom.png https://...`
2. L'exporter en JPEG en 720 px et 1440 px de large (`nom-720.jpg`, `nom-1440.jpg`) dans `assets/img/`.
3. Dans `index.html`, copier un bloc `<li class="project" data-reveal>` puis changer numéro, textes, images,
   `href`, `data-title` et `data-meta`. Les compteurs se mettent à jour tout seuls.
4. Ajouter le site dans la bande de captures (`.reel`) et dans le JSON-LD (haut de `index.html`) et son adresse dans `frame-src` de `vercel.json`
   (sinon l'aperçu en direct est bloqué en production).
5. Lancer `tools/test.ps1` : il signale tout oubli des étapes 3 et 4.

> Si vous modifiez le petit script en ligne du `<head>`, son empreinte CSP change : le test l'indique
> et donne la nouvelle valeur `sha256-…` à recopier dans `vercel.json`.

## Mise en ligne

Le dépôt est relié à Vercel : chaque envoi sur `main` publie le site. Aucune configuration de build n'est nécessaire.

## Questions fréquentes

Les questions de la section « Questions » existent deux fois : dans la page (`<details>`) et dans le JSON-LD
`FAQPage` en haut de `index.html` (lu par Google). Modifier les deux ensemble.
