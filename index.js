const express = require('express')
const app = express()
const port = 80


let supportMail = "support@cortexduo.com" // It is for the person who DDoS to send you an e-mail.
let ddosProtection = require('./ddosProtection.js') //DDoS protection.
let protect_urls = ["/", "/error"] // Type which URLs you want to be under DDoS protection.

app.use(async function(req, res, next) {
    let url = req.originalUrl;
    if (protect_urls.includes(url)) {
        let ddos = await ddosProtection(req)
        if (ddos == "GLOBAL_DDOS") { // If a major DDoS attack is made, access to the site is stopped in all countries except Turkey so that the site is not shut down.
            res.json({
                WARNING: "Global DDOS Detected",
                Mail: supportMail
            });
            return;
        }
        if (ddos == "USER_DDOS") { //Blocks IP addresses that perform DDoS.
            res.json({
                WARNING: "User DDOS Detected",
                "Support Mail": supportMail,
                info: "Türkçe olarak mail atabilirsin."
            });
            return;
        }
    }
    next();
});


app.get('/', (req, res) => { // ✅ This URL; Protected against DDoS.
    res.send('Hello World!')
})

app.get('/api', (req, res) => { // ✅ This URL; Protected against DDoS.
    res.send('Hello! My name is API.')
})

app.get('/welcome', (req, res) => { // ❌This URL; It is not protected against DDoS.
    res.send('Hello! My name is API.')
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
