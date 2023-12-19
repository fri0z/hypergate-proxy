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

chrome.runtime.onMessage.addListener( (request)  => {
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
    urls: ["*://*/*"],
    types: ["xmlhttprequest"]
  }
);
