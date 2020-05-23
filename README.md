## furry-bear

This is a discord bot.

## Commands
All commnads should add prefix `!` to trigger it.

- !help: list all commands.
- !banana: banana message.
- !turnip: reply a `turnip` emoji.(need to add an emoji for using).
- !talk [text]: let the bot talk the `text` with tts support.
- !chat [text]: let bot response your meesage `text` with DialogFlow's support.

## Install and Run the bot
Before you start to run the bot, you may need to add the token by create two files `config.dev.json` and `config.prod.json` in the furry-bear project's folder

### Token
```
//config.dev.json and config.prod.json content
{
    "DISCORD_BOT_TOKEN": token-for-discord-bot
    "DIALOGFLOW_BOT_TOKEN": token-for-dialogflow-bot
}
```

### Install and run
```
//install
npm install

// run as dev mode
npm run dev

// run as prod mode
npm start
```
