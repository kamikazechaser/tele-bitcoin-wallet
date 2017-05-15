/**
 * tele-bitcoin-wallet
 * Mohammed Sohail <sohail@forfuture.tech>
 * 
 * A Bitcoin wallet For Telegram 
 */

// npm installed modules
const _ = require("lodash");
const bodyParser = require("body-parser");
const blocktrail = require("blocktrail-sdk");
const express = require("express");
const mau = require("mau");
const TelegramBot = require("node-telegram-bot-api");


// own modules
const config = require("./config");


// module variables
const client = blocktrail.BlocktrailSDK(config.blocktrail);

const bot = new TelegramBot(config.telegram.token);

const app = express();
app.use(bodyParser.json());

const formset = new mau.FormSet(config.mau);


// webhooks
app.post("/wallet", (req, res) => {
    bot.sendMessage(config.telegram.channel, `<b>New Transaction</b>\n\n<code>${blocktrail.toBTC(req.body.data.estimated_value)} BTC</code>`, {
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [
                [{ text: "📑 See transaction", url: `https://blockchain.info/tx/${req.body.data.hash}` }]
            ]
        }
    });
    return res.sendStatus(200);
});

app.post("/bot", (req, res) => {
    bot.processUpdate(req.body);
    return res.sendStatus(200);
});


app.listen(config.app.port, () => {
    return console.log("Express server started");
});


// core
bot.onText(/^\/start$/, msg => {
    const isAdmin = _.some(config.telegram.administrators, { "user": msg.from.id });

    if (isAdmin) {
        return bot.sendMessage(msg.from.id, "<b>Wallet Dashboard:</b>", {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: [
                    [{ text: "⬆️ Send Bitcoins" }],
                    [{ text: "♻️ Check Balance" }, { text: "⬇️ Receive Bitcoins" }]
                ],
                resize_keyboard: true
            }
        });
    } else {
        return bot.sendMessage(msg.from.id, "You are not authorised to use this bot.");
    }   
});


bot.onText(/♻️ Check Balance/, msg => {
    const isAdmin = _.some(config.telegram.administrators, { "user": msg.from.id });

    if (isAdmin) {
        return client.initWallet(config.wallet.name, config.wallet.pass, (error, wallet) => {
            if (error) {
                return bot.sendMessage(msg.from.id, error.message);
            } else {
                return wallet.getBalance((error, confirmedBalance, unconfirmedBalance) => {
                    if (error) {
                        return bot.sendMessage(msg.from.id, error.message);
                    } else {
                        return bot.sendMessage(msg.from.id, `<b>Balance:</b> <code>${blocktrail.toBTC(confirmedBalance)} BTC</code>\n<b>Unconfirmed Balance:</b> <code>${blocktrail.toBTC(unconfirmedBalance)} BTC</code>`, {
                            parse_mode: "HTML"
                        });
                    }
                });
            }
        });
    } else {
        return bot.sendMessage(msg.from.id, "You are not authorised to use this bot.");
    }
});

bot.onText(/⬇️ Receive Bitcoins/, msg => {
    const isAdmin = _.some(config.telegram.administrators, { "user": msg.from.id });

    if (isAdmin) {
        return client.initWallet(config.wallet.name, config.wallet.pass, (error, wallet) => {
            if (error) {
                return bot.sendMessage(msg.from.id, error.message);
            } else {
                return wallet.getNewAddress((error, address) => {
                    if (error) {
                        return bot.sendMessage(msg.from.id, error.message);
                    } else {
                        bot.sendMessage(msg.from.id, `<b>Receive Bitcoins At:</b>\n\n <code>${address} </code>`, {
                            parse_mode: "HTML",
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "⏹ QR Code", callback_data: `qr_${address}`}, { text: "🔊 Share", url: `https://t.me/share/url?url=https://blockchain.info/payment_request?address=${address}&text=You%20can%20send%20btc%20to%20the%20following%20address`}]
                                ]
                            }
                        });
                        bot.sendMessage(config.telegram.channel, `<b>New address generated</b>\n\n<code>${address}</code>`, {
                            parse_mode: "HTML",
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "📑 See transactions", url: `https://blockchain.info/address/${address}`}]
                                ]
                            }
                        });
                        return client.subscribeAddressTransactions(config.wallet.webhook_id, address, 6, (error, result) => {
                            if (error) {
                                return console.log(error);
                            } else {
                                return console.log("Subscribed to event.");
                            }
                        });
                    }
                });
            }
        });
    } else {
        return bot.sendMessage(msg.from.id, "You are not authorised to use this bot.");
    }
});

bot.on("callback_query", msg => {
    bot.answerCallbackQuery(msg.id, "✅ Generating QR code...");
    
    const address = msg.data.split("_")[1];

    return bot.sendPhoto(msg.message.chat.id, `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=bitcoin:${address}`, {
        caption: address
    });
});

formset.addForm("send_form", [{
        name: "send_address",
        text: "Please enter the recepients Bitcoin address.",

        post(answer, done) {
            const isBitcoinAddress = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(answer);

            if (!isBitcoinAddress) {
                return this.retry("You need to send me a valid Bitcoin address.", done);
            }

            return done();
        }
    },
    {
        name: "send_amount",
        text: "Please enter the amount you want to send in Bitcoins.",

        post(answer, done) {
            const isNumber = !isNaN(answer);

            if (!isNumber) {
                return this.retry("You need to send me a valid amount.", done);
            }

            return done();
        }
    },
    {
        name: "send_confirm",
        question: {
            text: "Are you sure you want to send your Bitcoins to the above address?",
            choices: ["Yes", "No"],
            strict: true
        }
    }
], {
    cb: sendBitcoins,
});

function sendBitcoins(answers, tg) {
    switch (answers.send_confirm) {
        case "Yes":
            const amount = blocktrail.toSatoshi(answers.send_amount);
            const bitcoinAddress = answers.send_address;

            let pay = {
                address: amount
            }
           
            pay[bitcoinAddress] = pay["address"];
            delete pay["address"];

            client.initWallet(config.wallet.name, config.wallet.pass, (error, wallet) => {
                if (error) {
                    return bot.sendMessage(tg.chatId, error.message);
                } else {
                    return wallet.pay(pay, null, false, true, blocktrail.Wallet.FEE_STRATEGY_OPTIMAL, null, (error, result) => {
                        if (error) {
                            return bot.sendMessage(tg.chatId, error.message);
                        } else {
                            bot.sendMessage(tg.chatId, "Bitcoins sent!", {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: "📄 Transaction", url: `https://blockchain.info/tx/${result}` }]
                                    ]
                                }
                            });
                        }
                    });
                }
            });
            break;
        case "No":
            bot.sendMessage(tg.chatId, "Transaction cancelled.", {
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: [
                        [{ text: "⬆️ Send Bitcoins" }],
                        [{ text: "♻️ Check Balance"}, { text: "⬇️ Receive Bitcoins" }]
                    ],
                    resize_keyboard: true
                }
            });
            break;
    }
}

formset.on("query", (question, data) => {
    const opts = {};

    if (question.choices) {
        opts["reply_markup"] = {
            keyboard: [question.choices.map(c => c.id)],
            "resize_keyboard": true,
            "one_time_keyboard": true,
        };
    }

    return bot.sendMessage(data.chatId, question.text, opts).catch(error => console.error(error));
});

bot.on("message", function (msg) { 
    const isAdmin = _.some(config.telegram.administrators, { "user": msg.from.id });

    const chatId = msg.chat.id;
    const text = msg.text;

    const data = {
        chatId,
        text
    }

    return formset.process(chatId, text, data, onProcess);

    function onProcess(error) {
        if (error) {
            if (error.code === "ENOENT") {
                if (msg.text === "⬆️ Send Bitcoins") {
                    if (isAdmin) {
                        return formset.processForm("send_form", chatId, data, onSelectFormProcess);
                    } else {
                        bot.sendMessage(msg.from.id, "You are not authorised to use this bot.");
                    }
                }
            }
        }
    }

    function onSelectFormProcess(error) {
        if (error) {
            return console.error(error);
        }
    }
});