/**
 * tele-bitcoin-wallet
 * Mohammed Sohail <sohail@forfuture.tech>
 * 
 * A Bitcoin wallet For Telegram 
 */

exports = module.exports = {
    app: {
        port: 80
    },
    blocktrail: {
        apiKey: "-",
        apiSecret: "-",
        network: "BTC",
        testnet: false
    },
    mau: {
        ttl: 120000
    },
    telegram: {
        token: "-",
        administrators: [
            { "user": 0 },
            { "user": 0 },
            { "user": 0 }
        ],
        channel: "-"
    },
    wallet: {
        name: "-",
        pass: "-",
        webhook_id: "-"
    }    
}