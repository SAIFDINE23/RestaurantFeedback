# 🎨 Personnalisation du Design de la Page Feedback

## Vue d'ensemble

Cette fonctionnalité permet aux entreprises de personnaliser entièrement l'apparence de la page de feedback client, incluant :
- Logo de l'entreprise
- Couleurs (primaire, secondaire, fond, texte)
- Style des étoiles (classique, moderne, cœur, pouces)
- Style des boutons (arrondi, carré, pilule)
- Police de caractères
- Message d'accueil personnalisé

## Architecture

### Base de données

**Migration** : `2026_01_27_185600_add_design_settings_to_companies_table`

Colonnes ajoutées à la table `companies` :
- `logo_url` : Chemin du logo uploadé
- `design_settings` : JSON contenant tous les paramètres de design

Structure du JSON `design_settings` :
```json
{
  "primary_color": "#3b82f6",
  "secondary_color": "#1e40af", 
  "star_style": "classic",
  "star_color": "#fbbf24",
  "font_family": "Inter",
  "background_color": "#f9fafb",
  "card_background": "#ffffff",
  "text_color": "#111827",
  "button_style": "rounded",
  "show_logo": true,
  "custom_message": "Votre avis compte pour nous!"
}
```

### Backend

**Contrôleur** : `app/Http/Controllers/FeedbackDesignController.php`
- `edit()` : Affiche la page de configuration
- `update()` : Enregistre les modifications

**Routes** :
```php
Route::get('/feedback-design', [FeedbackDesignController::class, 'edit'])
    ->name('feedback.design.edit');
    
Route::post('/feedback-design', [FeedbackDesignController::class, 'update'])
    ->name('feedback.design.update');
```

**Modèle** : `app/Models/Company.php`
- Champs ajoutés au `$fillable` : `logo_url`, `design_settings`
- Cast automatique de `design_settings` en array

### Frontend

**Page d'administration** : `resources/js/Pages/FeedbackDesign/Edit.jsx`
- Formulaire de personnalisation
- Aperçu en temps réel
- Upload de logo
- Sélection de couleurs
- Choix de styles

**Page publique** : `resources/js/Pages/Feedback/Create.jsx`
- Utilise les paramètres de design personnalisés
- Affichage dynamique du logo
- Étoiles interactives avec style personnalisé
- Boutons et couleurs personnalisés

## Utilisation

### Pour l'administrateur

1. Se connecter au dashboard
2. Cliquer sur "Design Feedback" dans le menu latéral
3. Personnaliser les éléments :
   - **Logo** : Uploader une image (max 2MB)
   - **Message** : Personnaliser le texte d'accueil
   - **Étoiles** : Choisir parmi 4 styles (⭐ ★ ❤️ 👍)
   - **Couleurs** : Sélectionner avec le color picker
   - **Boutons** : Choisir le style (arrondi, carré, pilule)
   - **Police** : Sélectionner parmi 5 polices
4. Voir l'aperçu en temps réel à droite
5. Cliquer sur "Enregistrer les modifications"

### Pour le client

Lorsqu'un client accède à la page de feedback via son token unique :
- Il voit automatiquement le design personnalisé de l'entreprise
- Logo affiché si configuré
- Couleurs et styles appliqués
- Expérience de marque cohérente

## Options de style

### Styles d'étoiles
- `classic` : ⭐ Étoile emoji classique
- `modern` : ★ Étoile unicode
- `heart` : ❤️ Cœur
- `thumbs` : 👍 Pouce levé

### Styles de boutons
- `rounded` : Coins arrondis (border-radius: 0.5rem)
- `square` : Coins carrés (border-radius: 0)
- `pill` : Complètement arrondi (border-radius: 9999px)

### Polices disponibles
- Inter
- Roboto
- Poppins
- Montserrat
- Open Sans

## Valeurs par défaut

Si aucune personnalisation n'est configurée, les valeurs par défaut sont :
```javascript
{
  primary_color: '#3b82f6',      // Bleu
  secondary_color: '#1e40af',    // Bleu foncé
  star_style: 'classic',         // ⭐
  star_color: '#fbbf24',         // Jaune
  font_family: 'Inter',
  background_color: '#f9fafb',   // Gris clair
  card_background: '#ffffff',     // Blanc
  text_color: '#111827',         // Noir
  button_style: 'rounded',
  show_logo: true,
  custom_message: 'Votre avis compte pour nous!'
}
```

## Stockage

Les logos sont stockés dans : `storage/app/public/logos/`

Pour rendre les logos accessibles publiquement, s'assurer que le lien symbolique est créé :
```bash
php artisan storage:link
```

## Exemples d'utilisation

### Style corporate classique
```json
{
  "primary_color": "#1e3a8a",
  "star_style": "modern",
  "button_style": "square",
  "font_family": "Roboto"
}
```

### Style moderne et coloré
```json
{
  "primary_color": "#ec4899",
  "star_style": "heart",
  "button_style": "pill",
  "font_family": "Poppins"
}
```

### Style minimaliste
```json
{
  "primary_color": "#000000",
  "star_style": "classic",
  "button_style": "rounded",
  "font_family": "Inter",
  "background_color": "#ffffff"
}
```

## Améliorations futures possibles

- [ ] Thèmes prédéfinis (Corporate, Modern, Fun, etc.)
- [ ] Import/export de configurations
- [ ] Prévisualisation en mode mobile
- [ ] Personnalisation de la page "Thank You"
- [ ] Choix de plusieurs logos (clair/foncé)
- [ ] Animation des étoiles
- [ ] Couleur d'accent pour chaque niveau d'étoile
- [ ] Custom CSS pour utilisateurs avancés
