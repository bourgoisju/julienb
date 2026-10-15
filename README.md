# Julien Bourgois — sites réalisés

Page qui répertorie les sites web que j'ai conçus et réalisés.
HTML / CSS / JavaScript sans dépendance ni étape de build, sur le modèle d'E-Mconcept.

## Structure

```
index.html              Page unique (présentation, réalisations, démarche)
assets/css/styles.css   Styles (couleurs en tête de fichier, mode sombre automatique)
assets/js/main.js       Petites animations à l'apparition, année du pied de page
assets/img/             Captures des sites (720 px et 1440 px), favicon
tools/serve.ps1         Petit serveur local pour prévisualiser
```

## Prévisualiser en local

```powershell
powershell -ExecutionPolicy Bypass -File tools/serve.ps1 -Port 8081
```

Puis ouvrir http://localhost:8081.

## Ajouter un site

1. Faire une capture du site en 1440 × 900, par exemple avec Chrome :
   `chrome --headless=new --hide-scrollbars --window-size=1440,900 --screenshot=nom.png https://...`
2. L'exporter en JPEG en 720 px et 1440 px de large (`nom-720.jpg`, `nom-1440.jpg`) dans `assets/img/`.
3. Copier un bloc `<li class="project">` dans `index.html`, puis changer le numéro, les textes, les images et les liens.
   Le compteur « sites en ligne » se met à jour tout seul.

## Mise en ligne

Comme les autres sites, il peut être publié sur Vercel (importer le dépôt `bourgoisju/julienb`, sans configuration)
ou sur GitHub Pages (Settings → Pages → branche `main`, dossier `/ (root)`).
