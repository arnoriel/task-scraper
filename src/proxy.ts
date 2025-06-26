import { logError, logInfo } from './logger';

export class ProxyManager {
  private proxies: string[];
  private usedProxies: Set<string>;

  constructor(proxies: string[]) {
    this.proxies = proxies;
    this.usedProxies = new Set();
    logInfo(`ProxyManager initialized with ${proxies.length} proxies.`);
  }

  getRandomProxy(): string {
    if (this.proxies.length === 0) {
      const errorMsg = 'No proxies available';
      logError(errorMsg);
      throw new Error(errorMsg);
    }

    const availableProxies = this.proxies.filter(p => !this.usedProxies.has(p));
    if (availableProxies.length === 0) {
      this.usedProxies.clear();
      const reusedProxy = this.proxies[Math.floor(Math.random() * this.proxies.length)];
      logInfo(`Reusing proxy: ${reusedProxy}`);
      return reusedProxy;
    }

    const proxy = availableProxies[Math.floor(Math.random() * availableProxies.length)];
    this.usedProxies.add(proxy);
    logInfo(`Selected new proxy: ${proxy}`);
    return proxy;
  }
}