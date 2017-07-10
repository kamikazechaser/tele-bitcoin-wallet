 [![Telegram](https://img.shields.io/badge/%F0%9F%92%AC_Telegram-kamikazechaser-blue.svg?style=flat-square)](https://telegram.me/kamikazechaser)
 [![Imgur](https://img.shields.io/badge/screenshots-imgur-brightgreen.svg?style=flat-square)](https://imgur.com/gallery/juYrG)
 > Tele Bitcoin Wallet

 A simple Bitcoin bot for Telegram

 > Powered by Blocktrail

 ## About

A lot (in fact, I have come across none) of Bitcoin bots on Telegram do not give you full control over your private keys, which therefore puts your Bitcoins at risk of getting lost/stolen. This bot, like most other Bitcoin wallet bots, doesn't implement a [pure solution](https://github.com/bitcoinjs/bitcoinjs-lib) and relies on a trustable third party i.e [Blocktrail](https://www.blocktrail.com/api). This means that this bot is simply a mirror of your Blocktrail wallet.

**Important Information**

- Blocktrail is a trustable third party which gives you full access to your wallet
- You can always recover your funds from [here](https://github.com/blocktrail/wallet-recovery-tool)
- You will need to host this bot separately

 ## Installation

 Before running the bot, populate the `config.js` (Don't forget to rename `config.dist.js > config.js`) file with the required info:

 *Webhooks configuration*

 **Note: You will need a domain or a tunnel like [ngrok](https://ngrok.com/) to setup the webhooks**

 - Telegram webhook should point to: `https://[yourdomain]/bot`
 - Blocktrail webhook should point to: `https://[yourdomain]/wallet`

 **Note: To setup a Blocktaril webhook, go to Wallets > Manage wallet > Webhook**

 *Blocktrail configuration*

 - 1st step is to signup [here](https://www.blocktrail.com/dev/signup)
 - Create a wallet and add the identifier and password you choose to the config file in the `wallet` section, i.e, name and pass respectively
 - Headover to the settings tab in Blocktrail and create  a new API key. Add these values to the `blocktrail` section of the config file

 **Note: Make sure you save the PDF recovery file to a safe location!**

 *Telegram configuration*

 - Create a bot with [@botfather](https://t.me/botfather)
 - Add the token to its respective field in the config file
 - Add your Telegram ID (can be obtained from [@myidbot](https://t.me/myidbot)) to its respective field inside the administrators block of the config file. i.e replace the `0` with your ID
 - If you would like to give some other Telegram user access, add their IDs too, else you can either remove the objects or leave them there
 - Add your channel ID to receive notifications. If you are the sole user of the bot, you can use your own ID instead 


 ```bash
 $ git clone https://github.com/kamikazechaser/tele-bitcoin-wallet.git
 $ cd tele-bitcoin-wallet
 $ npm i
 # Start the bot with your favourite node process manager i.e forever
 $ node wallet.js
 ```

## Issues And Contribution

Fork the repository and submit a pull request for whatever change you want to be added to this project. If you have any questions, just open an issue.

## License

Released under AGPL-3.0