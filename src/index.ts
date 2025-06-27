import express, { Request, Response, NextFunction } from 'express';
import { Browser, chromium } from 'playwright';
import { SocksProxyAgent } from 'socks-proxy-agent';
import UserAgent from 'user-agents';
import { config } from './config';
import { TikTokScraper } from './scraper';
import { ProxyManager } from './proxy';
import cors from 'cors';
import { logError, logInfo } from './logger';

// Custom Error class
class HttpError extends Error {
  statusCode: number; 
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Extend Express Request with proxyAgent
declare module 'express' {
  interface Request {
    proxyAgent?: SocksProxyAgent;
  }
}

const app = express();
app.use(cors());
app.use(express.json());

let browser: Browser | null = null;
const proxyManager = new ProxyManager(config.proxies);

// Browser initialization
async function initializeBrowser() {
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    logInfo('Browser initialized successfully');
  } catch (error) {
    logError(error);
    console.error('Failed to initialize browser:', error);
    throw error;
  }
}

// Proxy + header middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  try {
    const proxyUrl = proxyManager.getRandomProxy();
    req.headers['x-proxy-url'] = proxyUrl;
    req.proxyAgent = new SocksProxyAgent(proxyUrl);
    const userAgentInstance = new UserAgent();
    req.headers['user-agent'] = userAgentInstance.toString();
    req.headers['accept-language'] = 'en-US,en;q=0.9';
    req.headers['accept'] = 'application/json, text/plain, */*';
    next();
  } catch (error) {
    next(error);
  }
});

// Routes
app.get('/tiktok/search-by-shop', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shopId = req.query.shopId as string;
    if (!shopId) {
      throw new HttpError(400, 'shopId is required - missing value for shopId on the Parameters.');
    }

    if (!browser || !req.proxyAgent) {
      throw new HttpError(500, 'Browser or proxy not initialized properly.');
    }

    const scraper = new TikTokScraper(browser, req.proxyAgent, req.headers);
    const data = await scraper.searchByShop(shopId);
    logInfo(`Successfully retrieved data from shopId: ${shopId}`);
    res.status(200).json({
      status_code: 200,
      message: `Successfully retrieved data from shopId: ${shopId}`,
      products: data,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/tiktok/search-by-category', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryId = req.query.categoryId as string;
    if (!categoryId) {
      throw new HttpError(400, 'categoryId is required - missing value for categoryId on the Parameters.');
    }

    if (!browser || !req.proxyAgent) {
      throw new HttpError(500, 'Browser or proxy not initialized properly.');
    }

    const scraper = new TikTokScraper(browser, req.proxyAgent, req.headers);
    const data = await scraper.searchByCategory(categoryId);
    logInfo(`Successfully retrieved data from categoryId: ${categoryId}`);
    res.status(200).json({
      status_code: 200,
      message: `Successfully retrieved data from categoryId: ${categoryId}`,
      products: data,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/tiktok/product-detail', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.query.productId as string;
    if (!productId) {
      throw new HttpError(400, 'productId is required - missing value for productId on the Parameters.');
    }

    if (!browser || !req.proxyAgent) {
      throw new HttpError(500, 'Browser or proxy not initialized properly.');
    }

    const scraper = new TikTokScraper(browser, req.proxyAgent, req.headers);
    const data = await scraper.getProductDetail(productId);
    logInfo(`Successfully retrieved data from productId: ${productId}`);
    res.status(200).json({
      status_code: 200,
      message: `Successfully retrieved data from productId: ${productId}`,
      product: data,
    });
  } catch (error) {
    next(error);
  }
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred';
  logError(err);

  res.status(statusCode).json({
    status_code: statusCode,
    error: statusCode === 500 ? 'Internal server error' : 'Bad Request',
    message,
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await initializeBrowser();
    logInfo(`Server running on port ${PORT}`);
    console.log(`🚀 Server running on port ${PORT}`);
  } catch (error) {
    logError(error);
    console.error('Server failed to start:', error);
    process.exit(1);
  }
});
