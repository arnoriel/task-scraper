import { Browser, Page } from 'playwright';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { config } from './config';
import { logError, logInfo } from './logger';

export class TikTokScraper {
  private browser: Browser;
  private proxyAgent: SocksProxyAgent;
  private headers: any;

  constructor(browser: Browser, proxyAgent: SocksProxyAgent, headers: any) {
    this.browser = browser;
    this.proxyAgent = proxyAgent;
    this.headers = headers;
  }

  async searchByShop(shopId: string): Promise<any> {
    const page = await this.setupPage();
    try {
      const url = `${config.tiktokBaseUrl}/shop/${shopId}`;
      logInfo(`Navigating to URL: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: config.requestTimeout });
      const jsonData = await this.extractJsonData(page);
      await page.close();
      logInfo(`Successfully scraped shopId: ${shopId}`);
      return jsonData;
    } catch (error) {
      await page.close();
      logError(`Failed to scrape shopId ${shopId}: ${error}`);
      throw error;
    }
  }

  async searchByCategory(categoryId: string): Promise<any> {
    const page = await this.setupPage();
    try {
      const url = `${config.tiktokBaseUrl}/category/${categoryId}`;
      logInfo(`Navigating to URL: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: config.requestTimeout });
      const jsonData = await this.extractJsonData(page);
      await page.close();
      logInfo(`Successfully scraped categoryId: ${categoryId}`);
      return jsonData;
    } catch (error) {
      await page.close();
      logError(`Failed to scrape categoryId ${categoryId}: ${error}`);
      throw error;
    }
  }

  async getProductDetail(productId: string): Promise<any> {
    const page = await this.setupPage();
    try {
      const url = `${config.tiktokBaseUrl}/view/product/${productId}`;
      logInfo(`Navigating to URL: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: config.requestTimeout });
      const jsonData = await this.extractJsonData(page);
      await page.close();
      logInfo(`Successfully scraped productId: ${productId}`);
      return jsonData;
    } catch (error) {
      await page.close();
      logError(`Failed to scrape productId ${productId}: ${error}`);
      throw error;
    }
  }

  private async setupPage(): Promise<Page> {
    const proxyUrl = this.getProxyUrlFromAgent();
    const context = await this.browser.newContext({
      userAgent: this.headers['user-agent'],
      extraHTTPHeaders: this.headers,
      proxy: proxyUrl ? { server: proxyUrl } : undefined,
    });
    const page = await context.newPage();
    await page.setDefaultTimeout(config.requestTimeout);
    return page;
  }

  private getProxyUrlFromAgent(): string | undefined {
    return this.proxyAgent ? (this.proxyAgent as any).proxy : undefined;
  }

  private async extractJsonData(page: Page): Promise<any> {
    const jsonData = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      for (const script of scripts) {
        if (script.id === '__UNIVERSAL_DATA_FOR_REHYDRATION__' || script.id === 'SIGI_STATE') {
          try {
            return JSON.parse(script.innerText);
          } catch (e) {
            continue;
          }
        }
      }
      return null;
    });

    if (!jsonData) {
      logError('Failed to extract JSON data from page');
      throw new Error('Failed to extract JSON data');
    }

    return jsonData;
  }
}