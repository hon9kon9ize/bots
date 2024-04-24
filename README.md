# Discord Bot for HON9KON9IZE's Discord Server

This is a Discord bot for HON9KON9IZE's Discord server. It is written in Nodejs and uses the discord.js library.

## Features

- HKEval Quiz, a quiz game where you have to guess the correct answer to a question, the question is come from the HKEval benchmark.

## Development

```bash
yarn install

yarn dev
```

## Database

We use Airtable as our database, which connected to the Google Sheet for the HKEval benchmark curation.

## TODO:

- [] Show category name in the quiz(The category name which is the table name in Airtable database, but somehow cannot get the table name via the Airtable API)
- [] Collect the correct rate of the quiz, so we can know the difficulty of the question
