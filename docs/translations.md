# Translate OTT Web App

The OTT Web App has multilingual support and is enabled by default. The default languages are English and Spanish.

Before changing or adding languages, read the sections below to understand the moving parts better.

## Translation status

Here is a list of all supported translations included in the OTT Web App. The status indicates if the translations are 
generated using Google Translate/ChatGTP or validated by a person.

| Language | Code | Status    | Validated by             |
|----------|------|-----------|--------------------------|
| English  | en   | Validated | Dev team                 |
| Spanish  | es   | Validated | Jose Alfredo Lopez Urrea |
| ...      |      |           |                          |

## Translation files

The web app uses the [react-i18next](https://react.i18next.com/) library for displaying translated strings. Translation 
files are defined in JSON format and can be found in the `./public/locales` directory. Translation files are separated 
by namespace.

The structure of all translation files is generated automatically using the `yarn i18next` command. This script 
extracts all namespaces and translation keys from the source code. Refrain from editing the structure (e.g., adding or 
removing keys) of translation files manually because this is prone to mistakes.

To add a new language, create a new subdirectory in the `./public/locales` directory using the language code or 
LCID string if the language is region specific. For example, using the `fr` language code will be available for all 
French-speaking regions (e.g., Belgium, Canada, France, Luxembourg, etc.). But if you have different translations for 
one or more French-speaking regions, use the LCID string (e.g., `fr-be`, `fr-ca`, `fr-lu`, or `fr-fr`) instead of the 
language code. The downside of this, when having multiple French-speaking regions, a lot of translations will be 
duplicate.

After adding the subdirectory, run the `yarn i18next` command to generate all the added 
language(s) translation files. You can now translate each key for the added language(s). 

## Defined languages

When a language is added to the `./public/locales` folder, the OTT Web App doesn't automatically recognize this. 
Instead, the language must first be added to the "defined languages" list. This is for two reasons:

- As OTT Web App we want to be able to include many languages without enabling them all by default
- For each language, the display name must be defined, which is shown in the language selection menu

Navigate to the `./src/i18n/config.ts` file and find the `DEFINED_LANGUAGES` constant. Each entry specifies the 
language code (or LCID string) and display name. 

> If you have added multiple languages using the LCID string identifier, each much be added to the list of defined 
> languages and ensure to include the region in the `displayName`. For example: `Français Canadien`

The `displayName` is always translated for the language it is written for. This ensures that when the current language is 
wrong for the current user, he/her will still be able to recognize the language.

```ts
export const DEFINED_LANGUAGES: LanguageDefinition[] = [
  {
    code: 'en',
    displayName: 'English',
  },
  {
    code: 'fr',
    displayName: 'Français',
  },
];
```

> You won't have to delete entries with languages that are not supported for your OTT Web App. Instead, don't enable 
> the language in the app (see the next step). 

## Enabled languages

Languages can be enabled or disabled by updating the `APP_ENABLED_LANGUAGES` environment variable. This can be changed 
in the `.env` file or by adding the environment variable to the start/build commands.

This disables the multilingual feature by only supporting the English language. The language selection icon will be 
hidden in the header.

```shell
$ APP_ENABLED_LANGUAGES=en yarn build 
```

This builds an OTT Web App supporting the English and French languages. The language selection icon will be shown in 
the header. 

```shell
$ APP_ENABLED_LANGUAGES=en,fr yarn build 
```

## Default language

OTT Web App will try to predict the user language by looking at the Browser language. When the language can't be 
predicted, or there is no support for the Browser language, the default language will be used. By default, this is set 
to `en`.

The default language can be changed in the `.env` file as well or by adding the `APP_DEFAULT_LANGUAGE` environment 
variable to the start/build commands.

Build an OTT Web App with English and French translations, but default to French when the language couldn't be 
predicted.

```shell
$ APP_ENABLED_LANGUAGES=en,fr APP_DEFAULT_LANGUAGE=fr yarn build 
```
