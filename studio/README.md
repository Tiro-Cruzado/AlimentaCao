# Admin panel (Sanity Studio)

This is where volunteers register the animals and the wall posts. It runs
separately from the site.

The panel itself is in Portuguese (field titles and descriptions), because the
volunteers read it. Field names, document types and option values are in
English and match the objects the site uses.

## What can be registered

- **Animal** (document type `animal`) — full profile, with photos and videos.
  Becomes the `/animal/animal-name` page and the card in the list of those who
  are waiting.
- **Mural** (document type `wallPost`) — fairs, completed adoptions, rescues
  and behind the scenes. Each post has a title (`title`), a date (`date`), a
  category (`category`: `event`, `adoption`, `rescue` or `behind_the_scenes`),
  an optional short text (`text`), the animals that appear in it (`animals`,
  optional) and one or more photos and videos (`media`). It shows up on the
  `/mural` page, and the three most recent ones on the home page too.

In photos and videos of both, tick **Conteúdo sensível** (field `sensitive`)
when it shows an injury, blood, surgery or abuse: on the site it is shown
blurred until the visitor chooses to see it.

## First time

```
cd studio
npm install
npx sanity init --bare
```

`sanity init --bare` asks for a login (Google or GitHub will do), creates the
project and the `production` dataset (keep it **public**: the site reads it
without a token) and prints the project id. It does not touch the files here.

Then create `studio/.env` with that id:

```
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production
```

`sanity.config.js` and `sanity.cli.js` both read those two variables.

## Run the panel locally

```
cd studio
npm run dev
```

Opens at http://localhost:3333.

## Publish the panel for the volunteers

```
cd studio
npm run deploy
```

Pick an address like `alimentacao.sanity.studio`. From then on the volunteer
uses that link, from any computer, without installing anything.

## Give a volunteer access

In the Sanity dashboard (sanity.io/manage), invite them by e-mail. The free
plan fits 20 people.

## Connect it to the site

In the project root, create `.env.local`:

```
SANITY_PROJECT_ID=your-project-id
SANITY_DATASET=production
```

Then run `npm run sync` (`scripts/sync-content.mjs`) to pull the animals and
the wall into `src/data/animals.generated.json` and
`src/data/wall.generated.json`.
