# Organized App translation guide

All translations for Organized live in this repository under `src/locales/<locale>/`. English (`src/locales/en/`) is the source of truth. To add or update a translation, edit the JSON file directly and open a pull request.

## File layout

The localization of this application is divided into different logical parts (files), depending on their use cases:

```
src/locales/<locale>/
  ├── activities.json
  ├── congregation.json
  ├── dashboard.json
  ├── errors.json
  ├── forms-templates.json
  ├── general.json
  ├── meetings.json
  ├── ministry.json
  ├── onboarding.json
  ├── profile.json
  ├── public_talks.json
  ├── release_notes.json
  ├── source.json
  └── ui.json
```

One locale directory per supported language, JSON file per feature.

## How to contribute translations

1. **Edit directly in the repo** — Navigate to `src/locales/<your-locale>/` and edit the relevant `*.json` file(s).
2. **Run locally** — Run `npm run lint` and `npm run build` to verify JSON syntax and that the app builds.
3. **Open a PR** — Open a pull request against `main`. The PR will be reviewed for JSON syntax and i18next key coverage by a maintainer.

## Adding a new language

To add a new language:

1. Create a new directory under `src/locales/<locale>/` (use the ISO language code, e.g., `de`, `es`, `pt-POR`).
2. Copy `src/locales/en/source.json` to `src/locales/<locale>/source.json` and translate all values.
3. Add the corresponding JSON files for each feature (you can start with just `source.json` and `ui.json` for a minimal translation).
4. Open a pull request with the new locale directory.

## Translating "What's New" contents

"What's New in this release" content displayed inside the application can also be localized. The source file is `src/locales/en/release_notes.json`. Edit the corresponding file in your locale directory (`src/locales/<locale>/release_notes.json`) to translate release notes.