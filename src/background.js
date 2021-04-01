
const ARRAY_PROXY_STRING = ["HTTPS nl.truenet.monster:443;", "HTTPS pl1.truenet.monster:443;", "HTTPS pl2.truenet.monster:443;"];
const ARRAY_PROXY_SORTED = ARRAY_PROXY_STRING.sort(function () { return Math.random() - 0.5 });
const PROXY_STRING = ARRAY_PROXY_SORTED[0] + ARRAY_PROXY_SORTED[1] + ARRAY_PROXY_SORTED[2] + " HTTPS uk37.tcdn.me:443; HTTPS nl95.tcdn.me:443; HTTPS uk35.tcdn.me:443; HTTPS us34.tcdn.me:443; DIRECT";
const PROXY_MASK = "HTTPS nl95.tcdn.me:443; HTTPS nl94.tcdn.me:443; HTTPS uk28.tcdn.me:443; DIRECT";
const PROXY_GLOBAL = "HTTPS nl65.tcdn.me:443; HTTPS nl66.tcdn.me:443; HTTPS nl67.tcdn.me:443; HTTPS nl68.tcdn.me:443; DIRECT";
const ARRAY_PROXY_NL = ["HTTPS nl81.tcdn.me:443;", "HTTPS nl82.tcdn.me:443;", "HTTPS nl83.tcdn.me:443;", "HTTPS nl84.tcdn.me:443;", "HTTPS nl85.tcdn.me:443;", "HTTPS nl86.tcdn.me:443;", "HTTPS nl87.tcdn.me:443;", "HTTPS nl88.tcdn.me:443;", "HTTPS nl89.tcdn.me:443;", "HTTPS nl90.tcdn.me:443;"];
const ARRAY_PROXY_UK = ["HTTPS uk31.tcdn.me:443;", "HTTPS uk32.tcdn.me:443;", "HTTPS uk33.tcdn.me:443;", "HTTPS uk34.tcdn.me:443;", "HTTPS uk35.tcdn.me:443;", "HTTPS uk36.tcdn.me:443;", "HTTPS uk37.tcdn.me:443;"];
const PROXY_UK = ARRAY_PROXY_UK[Math.floor(Math.random() * ARRAY_PROXY_UK.length)] + ARRAY_PROXY_UK[Math.floor(Math.random() * ARRAY_PROXY_UK.length)] + ARRAY_PROXY_UK[Math.floor(Math.random() * ARRAY_PROXY_UK.length)] + PROXY_GLOBAL;
const PROXY_NL = ARRAY_PROXY_NL[Math.floor(Math.random() * ARRAY_PROXY_NL.length)] + PROXY_GLOBAL;
const PROXY_SG = "HTTPS sg1.tcdn.me:443; HTTPS sg2.tcdn.me:443; HTTPS sg3.tcdn.me:443; DIRECT";
const PROXY_US = "HTTPS us30.tcdn.me:443; HTTPS us31.tcdn.me:443; HTTPS us32.tcdn.me:443; DIRECT";
const PROXY_PL = "HTTPS pl2.truenet.monster:443; DIRECT";

console.log('HyperGate starting...');

chrome.runtime.onStartup.addListener(function () {
  chrome.storage.local.remove('visitedSites', () => {
    console.log('Clear visited sites.');
  });

  chrome.proxy.settings.clear({ scope: "regular" }, () => {
    console.log('Clear old proxy settings.');
  });
});

async function getProxiedSites() {
  return new Promise(resolve => {

    chrome.storage.local.get(['proxiedSites'], function ({ proxiedSites }) {
      resolve(proxiedSites);
    });

  })

}

async function getVisitedSites() {
  return new Promise(resolve => {

    chrome.storage.local.get(['visitedSites'], function ({ visitedSites }) {
      resolve(visitedSites);
    });

  })

}

async function updateProxySettings() {
  let proxiedSites = await getProxiedSites();

  if (!proxiedSites) {
    proxiedSites = [];
  }

  let proxyList = [
    'HTTPS proxy-ssl.antizapret.prostovpn.org:3143',
    'PROXY proxy-nossl.antizapret.prostovpn.org:29976',
  ];
  
  proxyList  = ARRAY_PROXY_UK;

  const proxyConfig = {
    mode: 'pac_script',
    pacScript: {
      data: "function FindProxyForURL(url, host) { console.log(url, host); var schema = url.substring(0, 5); if (schema != 'https' && schema != 'http:') { return 'DIRECT'; } var sites = " + JSON.stringify(proxiedSites) + "; if(sites.includes(host)) {  return '" + proxyList.join('; ') + "; DIRECT'; } return 'DIRECT'; }"
    }
  };

  chrome.proxy.settings.set({ value: proxyConfig, scope: "regular" }, () => {
    console.log('Use proxy for ' + JSON.stringify(proxiedSites));
  });

  chrome.proxy.onProxyError.addListener((details) => {
    console.error(details);
  })
}

chrome.extension.onMessage.addListener( (request)  => {
  if(request.action === 'updateProxySettings') {
    updateProxySettings();
  }
});

updateProxySettings();

chrome.webRequest.onBeforeRequest.addListener(
  async (request) => {
    const url = new URL(request.url);
    const host = url.host;
    const protocol = url.protocol;

    if (!['http:', 'https:'].includes(protocol)) {
      return;
    }

    let proxiedSites = await getProxiedSites();
    let visitedSites = await getVisitedSites();

    if (!proxiedSites) {
      proxiedSites = [];
    }

    if (!visitedSites) {
      visitedSites = proxiedSites;
    }

    if (visitedSites && !visitedSites.includes(host)) {
      visitedSites.unshift(host)

      // save changes in to storage
      chrome.storage.local.set({ visitedSites: visitedSites });
    }
  },
  {
    urls: ["<all_urls>"],
    types: ["main_frame"]
  },
  ["blocking"]
);
