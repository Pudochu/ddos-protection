var geoip = require('geoip-lite'); //Module (Ram-CPU) optimized. If a major attack occurs, it will not cause any problems.

const userRecently = new Set();
const usersMap = new Map();

let ddos = 0;
let DDOS_ATTACK = false;
setInterval(function() {
    if (DDOS_ATTACK == false && ddos > 44) {
        DDOS_ATTACK = true;
        for (let i = 0; i < 20; i++) {
            if (log) console.log('[DEFENSE SYSTEM] WARNING DDOS ATTACK DETECTED!')
        }
        setTimeout(function() {
            for (let i = 0; i < 20; i++) {
                if (log) console.log('[DEFENSE SYSTEM] DDOS ATTACKS NOW STOPPED!')
            }
            DDOS_ATTACK = false;
        }, 300 * 1000); // 5 dk;
        return;
    }
    ddos = 0;
}, 2 * 1000);

async function ipGet(req) {
    var ip = (req.headers['x-forwarded-for'] || '').replace(/:\d+$/, '') || req.connection.remoteAddress;
    if (ip.includes('::ffff:')) {
        ip = ip.split(':').reverse()[0]
    }
    var lookedUpIP = await geoip.lookup(ip);
    if ((ip === '127.0.0.1' || ip === '::1')) {
        return "1.11.111.1111"; // If the request comes from localhost, we enter a no-valid ip address.
    }
    if (!lookedUpIP) {
        return "1.11.111.1111"; // If the request comes from localhost, we enter a no-valid ip address.
    }
    return lookedUpIP;
}

module.exports = async (request, main_country, log) => {
    try {
        let ipAddress = request.headers['cf-connecting-ip'] || await ipGet(request);
        var geo = request.headers['cf-ipcountry'] || await geoip.lookup(ipAddress).country;
        let getData = await usersMap.get('veri_' + ipAddress) || 0;
        if (getData > 24) {
            if (getData > 99) {
                return "USER_DDOS";
                return;
            }
            if (!DDOS_ATTACK) {
                setTimeout(function() {
                    console.log("[DDOS] User Ban Deleted : " + ipAddress)
                    usersMap.set('veri_' + ipAddress, 0)
                }, 3600 * 1000);
                if (log) console.log("[DDOS] User Banned : " + ipAddress)
                usersMap.set('veri_' + ipAddress, getData + 999)
                return "USER_DDOS";
                return;
            }
            if (log) console.log("[DDOS] User Unlimited Banned : " + ipAddress)
            usersMap.set('veri_' + ipAddress, getData + 999)
            return "USER_DDOS";
        } else {
            if (getData) usersMap.set('veri_' + ipAddress, getData + 1)
            if (!getData || getData == 0) {
                setTimeout(function() {
                    if (log) console.log("[DDOS] User DATA Deleted : " + ipAddress)
                    usersMap.set('veri_' + ipAddress, 0)
                }, 120 * 1000);
                usersMap.set('veri_' + ipAddress, 1)
            }
            if (geo?.country !== main_country) {
                if (DDOS_ATTACK) return "GLOBAL_DDOS";
                ddos = ddos + 1;
            }
        }
    if (log) console.log("[DDOS-LOG] Joined site : " + geo + " | DOS-Count : " + getData + "/25 | Global-DOS: " + ddos + "/45")
    return false;
    } catch (e) {
        console.log(e)
    }
}
