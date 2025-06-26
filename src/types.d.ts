import { SocksProxyAgent } from 'socks-proxy-agent';

declare module 'express' {
  interface Request {
    proxyAgent?: SocksProxyAgent;
  }
}