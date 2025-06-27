export const config = {
  proxies: [
    'socks5://user:pass@proxy1.example.com:1080',
    'socks5://user:pass@proxy2.example.com:1080',
  ],
  tiktokBaseUrl: 'https://shop-id.tokopedia.com',
  maxRetries: 3,
  requestTimeout: 10000,
};