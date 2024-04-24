# Discord Bot for HON9KON9IZE's Discord Server

This is a Discord bot for HON9KON9IZE's Discord server. It is written in Nodejs and uses the discord.js library.

If you want to contribute or have any questions, please join our [Discord server](https://discord.gg/gG6GPp8XxQ).

## Features

- HKEval Quiz, a quiz game where you have to guess the correct answer to a question, the question is come from the HKEval benchmark.

## Development

### Prerequisites

Please go to our Discord server and ask for the `.env` file, which contains the necessary environment variables for the bot to run.

```
.env
DISCORD_TOKEN=<discord bot token>
DISCORD_CLIENT_ID=<discord application id>
AIRTABLE_API_KEY=<airtable api key>
AIRTABLE_BASE_ID=<airtable database id>
AIRTABLE_TABLE_IDS=<comma separated table id>
```

### Running the bot

```bash
yarn install

yarn dev
```

### Deployment

This bot is deployed on a cloud server, and the deployment is done automatically when the code is pushed to the `release` branch.

For the deployment details, please refer to the `.github/workflows/deploy.yml` file.

## Database

We use Airtable as our database, which connected to the Google Sheet for the HKEval benchmark curation.

## TODO:

- [] Show category name in the quiz(The category name which is the table name in Airtable database, but somehow cannot get the table name via the Airtable API)
- [] Collect the correct rate of the quiz, so we can know the difficulty of the question
