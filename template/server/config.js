// server configuration
export default {
  // a crude randomized number as an identifier for the header being sent
  id: String(Date.now() + Math.random()),
  // server details
  server: {
    dev: {
      hostname: 'dev.local',
      port: 443,
      cache: 10, // 0 seconds
      ssl: {
        key: '../dev.local.key',
        cert: '../dev.local.crt'
      }
    },
    host: {
      hostname: 'puppsy_server',
      port: 80,
      cache: 60 * 10, // 10 minutes
      ssl: {
        key: '../dev.local.key',
        cert: '../dev.local.crt'
      }
    }
  },
  // root frontend location
  root: '../frontend/public/',
  // only allow origins.
  allowOrigin: ['https://dev.local*'],
  // SSR, which types of requests should be allowed?
  allowlist: [
    'document', 
    'script', 
    'fetch', 
    'stylesheet', 
    'image',
  ],
  // puppeteer launch options
  // https://pptr.dev/#?product=Puppeteer&version=v5.5.0&show=api-puppeteerlaunchoptions
  puppeteer: {
    // ignoreHTTPSErrors: true,
  }
}