var geoip = require('geoip-country'); //Module (Ram-CPU) optimized. If a major attack occurs, it will not cause any problems.

const userRecently = new Set();
const usersMap = new Map();

let ddos = 0;
let DDOS_ATTACK = false;
setInterval(function() {
    if (DDOS_ATTACK == false && ddos > 44) {
        DDOS_ATTACK = true;
        for (let i = 0; i < 20; i++) {
            console.log('[DEFENSE SYSTEM] WARNING DDOS ATTACK DETECTED!')
        }
        setTimeout(function() {
            for (let i = 0; i < 20; i++) {
                console.log('[DEFENSE SYSTEM] DDOS ATTACKS NOW STOPPED!')
            }

            DDOS_ATTACK = false;
        }, 300 * 1000); // 5 dk;
        return;
    }
    ddos = 0;
}, 2 * 1000);

module.exports = async (request, log) => {

    try {
        let ipAddress = request.ipInfo;

        if (ipAddress.error) ipAddress = "1.11.111.1111"; // If the request comes from localhost, we enter a fake ip address.
        ipAddress = ipAddress.ip
        var geo = await geoip.lookup(ipAddress);
        /*if(geo?.country !== "TR") {
        if(DDOS_ATTACK) return "GLOBAL_DDOS";
        ddos = ddos + 1;
        }*/

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
                console.log("[DDOS] User Banned : " + ipAddress)
                usersMap.set('veri_' + ipAddress, getData + 999)
                return "USER_DDOS";
                return;
            }
            console.log("[DDOS] User Unlimited Banned : " + ipAddress)
            usersMap.set('veri_' + ipAddress, getData + 999)
            return "USER_DDOS";
        } else {
            if (getData) usersMap.set('veri_' + ipAddress, getData + 1)
            if (!getData || getData == 0) {
                setTimeout(function() {
                    console.log("[DDOS] User DATA Deleted : " + ipAddress)
                    usersMap.set('veri_' + ipAddress, 0)
                }, 120 * 1000);
                usersMap.set('veri_' + ipAddress, 1)
            }
            if (geo?.country !== "TR") {
                if (DDOS_ATTACK) return "GLOBAL_DDOS";
                ddos = ddos + 1;
            }
        }
        if (log) console.log("[DDOS-LOG] Joined site : " + geo?.country + " | DOS-Count : " + getData + "/25 | Global-DOS: " + ddos + "/45")
        return false;
    } catch (e) {
        console.log(e)
    }
}
