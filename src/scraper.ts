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
      const url = `${config.tiktokBaseUrl}/view/shop/${shopId}`;
      logInfo(`Navigating to URL: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: config.requestTimeout });
      const jsonData = await this.extractJsonData(page);
      logInfo(`Successfully scraped shopId: ${shopId}`);
      return jsonData;
    } catch (error) {
      logError(`Failed to scrape shopId ${shopId}: ${error}`);
      throw error;
    } finally {
      await page.close();
    }
  }

  async searchByCategory(categoryId: string): Promise<any> {
    const page = await this.setupPage();
    try {
      const url = `${config.tiktokBaseUrl}/category/${categoryId}`;
      logInfo(`Navigating to URL: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: config.requestTimeout });
      const jsonData = await this.extractJsonData(page);
      logInfo(`Successfully scraped categoryId: ${categoryId}`);
      return jsonData;
    } catch (error) {
      logError(`Failed to scrape categoryId ${categoryId}: ${error}`);
      throw error;
    } finally {
      await page.close();
    }
  }

  async getProductDetail(productId: string): Promise<any> {
    const page = await this.setupPage();
    try {
      const url = `${config.tiktokBaseUrl}/view/product/${productId}`;
      logInfo(`Navigating to URL: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: config.requestTimeout });
      const jsonData = await this.extractJsonData(page);
      logInfo(`Successfully scraped productId: ${productId}`);
      return jsonData;
    } catch (error) {
      logError(`Failed to scrape productId ${productId}: ${error}`);
      throw error;
    } finally {
      await page.close();
    }
  }

  private async setupPage(): Promise<Page> {
    const proxyConfig = this.buildProxyConfig();

    const context = await this.browser.newContext({
      userAgent: this.headers['user-agent'],
      extraHTTPHeaders: this.headers,
      proxy: proxyConfig,
    });

    const page = await context.newPage();
    await page.setDefaultTimeout(config.requestTimeout);
    return page;
  }

  private getProxyUrl(): string | undefined {
    return this.headers['x-proxy-url'];
  }

  private buildProxyConfig():
    | { server: string; bypass?: string; username?: string; password?: string }
    | undefined {
    const proxyUrl = this.getProxyUrl();
    if (!proxyUrl) return undefined;
    return { server: proxyUrl };
  }

  private async extractJsonData(page: Page): Promise<any> {
    const jsonData = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      for (const script of scripts) {
        if (
          script.id === '__UNIVERSAL_DATA_FOR_REHYDRATION__' ||
          script.id === 'SIGI_STATE'
        ) {
          try {
            return JSON.parse(script.innerText);
          } catch {
            continue;
          }
        }
      }
      return null;
    });

    if (!jsonData) {
      throw new Error('Failed to extract JSON data from page');
    }

    return jsonData;
  }
}
