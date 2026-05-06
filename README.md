# GLOBAL 2 — SaaS PRO Cloudflare KV

Version renforcée pour Cloudflare Pages :

- Comptes utilisateurs serveur
- Sessions sécurisées par cookie HttpOnly
- Rôles : Administrateur / Caisse
- Sauvegarde Cloudflare KV par utilisateur
- Synchronisation automatique régulière
- Gestion admin des comptes : création, blocage/activation, changement de mot de passe
- Obligations mensuelles séparées par mois
- Journal d’activité dans KV (`audit:YYYY-MM-DD`)

## Identifiants par défaut

- Admin : `admin` / `ADMIN2026`
- Caisse : `caisse` / `CAISSE2026`

Après connexion admin, crée tes vrais comptes puis change les mots de passe.

## Déploiement GitHub + Cloudflare Pages

1. Décompresse le ZIP.
2. Envoie le contenu du dossier sur GitHub, pas le ZIP lui-même.
3. Dans Cloudflare Pages : **Create project → Connect to GitHub**.
4. Paramètres de build :
   - Build command : laisser vide
   - Build output directory : `public`
5. Dans Cloudflare Pages : **Settings → Functions → KV namespace bindings**.
6. Ajoute un binding KV nommé exactement : `GLOBAL2_KV`.
7. Associe-le à ton namespace KV.
8. Redéploie le projet.

## Structure

```text
public/index.html
functions/_lib/common.js
functions/api/auth/login.js
functions/api/auth/me.js
functions/api/auth/logout.js
functions/api/admin/users.js
functions/api/data/load.js
functions/api/data/save.js
wrangler.json
package.json
```

## Important

Le fichier `wrangler.json` ne contient pas d’ID KV volontairement, pour éviter les erreurs GitHub/Cloudflare. Le binding KV se fait dans le tableau de bord Cloudflare Pages.
