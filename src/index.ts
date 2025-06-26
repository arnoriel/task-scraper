import express, { Request, Response, NextFunction } from 'express';
import { Browser, chromium } from 'playwright';
import { SocksProxyAgent } from 'socks-proxy-agent';
import UserAgent from 'user-agents';
import { config } from './config';
import { TikTokScraper } from './scraper';
import { ProxyManager } from './proxy';
import cors from 'cors';
import { logError, logInfo } from './logger';

// Extend Request type
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

// Initialize browser
async function initializeBrowser() {
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    logInfo('Browser initialized successfully');
  } catch (error) {
    logError(error);
    console.error('Failed to initialize browser:', error);
    throw error;
  }
}

// Middleware for proxy rotation and headers
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proxy = proxyManager.getRandomProxy();
    req.proxyAgent = new SocksProxyAgent(proxy);
    const userAgentInstance = new UserAgent();
    req.headers['user-agent'] = userAgentInstance.toString();
    req.headers['accept-language'] = 'en-US,en;q=0.9';
    req.headers['accept'] = 'application/json, text/plain, */*';
    next();
  } catch (error) {
    logError(error);
    next(error);
  }
});

// API Endpoints
app.get('/tiktok/search-by-shop', async (req: Request, res: Response) => {
  try {
    const shopId = req.query.shopId as string;
    if (!shopId) {
      return res.status(400).json({
        status_code: 400,
        error: 'shopId is required',
        message: 'missing value for shopId on the Parameters.'
      });
    }

    if (!browser || !req.proxyAgent) {
      return res.status(500).json({
        status_code: 500,
        error: 'Browser or proxy not initialized',
        message: 'The browser or proxy agent failed to initialize properly.'
      });
    }

    const scraper = new TikTokScraper(browser, req.proxyAgent, req.headers);
    const data = await scraper.searchByShop(shopId);
    logInfo(`Successfully retrieved data from shopId: ${shopId}`);
    res.status(200).json({
      status_code: 200,
      message: `Successfully retrieved data from shopId: ${shopId}`,
      products: data
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      status_code: 500,
      error: 'Internal server error',
      message: (error as Error).message || 'An unexpected error occurred during the request.'
    });
  }
});

app.get('/tiktok/search-by-category', async (req: Request, res: Response) => {
  try {
    const categoryId = req.query.categoryId as string;
    if (!categoryId) {
      return res.status(400).json({
        status_code: 400,
        error: 'categoryId is required',
        message: 'missing value for categoryId on the Parameters.'
      });
    }

    if (!browser || !req.proxyAgent) {
      return res.status(500).json({
        status_code: 500,
        error: 'Browser or proxy not initialized',
        message: 'The browser or proxy agent failed to initialize properly.'
      });
    }

    const scraper = new TikTokScraper(browser, req.proxyAgent, req.headers);
    const data = await scraper.searchByCategory(categoryId);
    logInfo(`Successfully retrieved data from categoryId: ${categoryId}`);
    res.status(200).json({
      status_code: 200,
      message: `Successfully retrieved data from categoryId: ${categoryId}`,
      products: data
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      status_code: 500,
      error: 'Internal server error',
      message: (error as Error).message || 'An unexpected error occurred during the request.'
    });
  }
});

app.get('/tiktok/product-detail', async (req: Request, res: Response) => {
  try {
    const productId = req.query.productId as string;
    if (!productId) {
      return res.status(400).json({
        status_code: 400,
        error: 'productId is required',
        message: 'missing value for productId on the Parameters.'
      });
    }

    if (!browser || !req.proxyAgent) {
      return res.status(500).json({
        status_code: 500,
        error: 'Browser or proxy not initialized',
        message: 'The browser or proxy agent failed to initialize properly.'
      });
    }

    const scraper = new TikTokScraper(browser, req.proxyAgent, req.headers);
    const data = await scraper.getProductDetail(productId);
    logInfo(`Successfully retrieved data from productId: ${productId}`);
    res.status(200).json({
      status_code: 200,
      message: `Successfully retrieved data from productId: ${productId}`,
      product: data
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      status_code: 500,
      error: 'Internal server error',
      message: (error as Error).message || 'An unexpected error occurred during the request.'
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  logError(err);
  res.status(500).json({
    status_code: 500,
    error: 'Internal server error',
    message: 'An unexpected error occurred on the server. Please try again later.'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await initializeBrowser();
    logInfo(`Server running on port ${PORT}`);
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    logError(error);
    console.error('Server failed to start:', error);
    process.exit(1);
  }
});
