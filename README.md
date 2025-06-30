# 🍭️ TikTok Shop Scraper API

A scalable and undetectable API for scraping product data from TikTok Shop using **Express.js**, **TypeScript**, and **Playwright**.

This API fetches JSON responses from TikTok Shop’s internal endpoints (shop, category, product detail) with anti-detection techniques like **proxy rotation** and **user-agent spoofing**.

---

## 📚 Table of Contents

* [📦 Setup Instructions](#-setup-instructions)
* [🚀 Usage Documentation](#-usage-documentation)
* [🤩 API Documentation](#-api-documentation)
* [🛡️ Proxy Configuration](#-proxy-configuration)
* [👵️ Scraper Techniques](#-scraper-techniques)
* [📊 Logging](#-logging)
* [📝 Notes](#-notes)

---

## 📦 Setup Instructions

### ✅ Prerequisites

* **Node.js** (v18+)
* **npm** (bundled with Node.js)
* **Git** (optional)
* List of **SOCKS5 proxies** (e.g., from Smartproxy or Oxylabs)

### 🛠️ Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/arnoriel/task-scraper.git
   cd task-scraper
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Install Playwright browsers:

   ```bash
   npx playwright install
   ```

4. Configure your proxy list in `src/config.ts`:

   ```ts
   export const config = {
     proxies: [
       'socks5://user:pass@proxy1.example.com:1080',
       'socks5://user:pass@proxy2.example.com:1080',
     ],
     tiktokBaseUrl: 'https://shop-id.tokopedia.com',
     maxRetries: 3,
     requestTimeout: 10000,
   };
   ```

> ⚠️ At least one valid proxy is required.

### ▶️ Running the App

Build the project:

```bash
npm run build
```

Start the server:

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### 🌍 Expose Publicly with Ngrok (Optional)

1. Install Ngrok globally:

```bash
npm install -g ngrok
```

2. Add your Ngrok authtoken:

```bash
ngrok config add-authtoken <your-authtoken>
```
> 📝 Get your authtoken from Registering/Login to https://dashboard.ngrok.com/

3. (Optional) Edit your `ngrok.yml` file if needed:

```yml
agent:
  authtoken: <your-authtoken>
```

4. Run Ngrok to expose your server:

```bash
ngrok http 3000
```

Use the public URL provided by Ngrok (e.g., `https://abcd1234.ngrok.io`).

---

## 🚀 Usage Documentation

### 🔍 Testing the API

Use Postman or cURL. Ensure the server is running locally on `http://localhost:3000`.

#### Example with Postman

* **Method**: GET
* **URL**: `http://localhost:3000/tiktok/search-by-shop`
* **Params**: `shopId=12345`
* Click **Send**

#### Example with cURL

Search by shop:

```bash
curl "http://localhost:3000/tiktok/search-by-shop?shopId=12345"
```

Search by category:

```bash
curl "http://localhost:3000/tiktok/search-by-category?categoryId=98765"
```

Product detail:

```bash
curl "http://localhost:3000/tiktok/product-detail?productId=11111"
```

### 🔧 Getting TikTok Shop IDs

* **Manual**: Use browser DevTools and inspect network requests.
* **Placeholder**: Use `12345`, `98765`, `11111` for testing.
* **Seller Center**: Log in to your TikTok Shop Seller Center.

---

## 🤩 API Documentation

### 🌐 Base URLs

* **Local**: `http://localhost:3000`
* **Public (Ngrok)**: `https://abcd1234.ngrok.io`

### 📌 Endpoints

#### 1. `/tiktok/search-by-shop`

**Description**: Fetch products by shop ID.

**Query Param**: `shopId` (required)

**Success**:

```json
200 OK
{
  "status_code": 200,
  "message": "Successfully retrieved data from shopId: 12345",
  "products": [...]
}
```

**Errors**:

```json
400 Bad Request
{
  "status_code": 400,
  "error": "shopId is required",
  "message": "missing value for shopId on the Parameters."
}
```

```json
500 Internal Server Error
{
  "status_code": 500,
  "error": "Browser or proxy not initialized",
  "message": "The browser or proxy agent failed to initialize properly."
}
```

#### 2. `/tiktok/search-by-category`

**Description**: Fetch products by category ID.

**Query Param**: `categoryId` (required)

**Success**:

```json
200 OK
{
  "status_code": 200,
  "message": "Successfully retrieved data from categoryId: 98765",
  "products": [...]
}
```

#### 3. `/tiktok/product-detail`

**Description**: Fetch product detail by product ID.

**Query Param**: `productId` (required)

**Success**:

```json
200 OK
{
  "status_code": 200,
  "message": "Successfully retrieved data from productId: 11111",
  "product": {...}
}
```

---

## 🛡️ Proxy Configuration

* Defined in `src/config.ts` → `config.proxies`
* Format: `socks5://user:pass@host:port`
* Managed by `ProxyManager` class
* One proxy is **mandatory**
* Use free trial proxies from trusted providers

---

## 👵️ Scraper Techniques

* ✅ **User-Agent rotation** (via `user-agents`)
* ✅ **SOCKS5 proxy rotation** (via `socks-proxy-agent`)
* ✅ **Playwright headless browsing**
* ✅ **Custom headers** and request timeouts
* ✅ **Retry logic** for unstable network
* ✅ Extracts JSON from script tags like `__UNIVERSAL_DATA_FOR_REHYDRATION__`

---

## 📊 Logging

This project includes a built-in logging system that writes logs to a file located in the `/logs` directory.

**Logging Features**:

* ✅ Logs all system-level errors and runtime exceptions
* ✅ Logs successful startup and proxy usage
* ✅ Centralized logging via `logError` and `logInfo` functions from `logger.ts`

**Location**:

* Folder: `logs/`
* File: `error.log`

**Log Format**:

```text
[2025-06-26T14:21:00.000Z] Selected new proxy: socks5://user:pass@proxy1.example.com:1080
[2025-06-26T14:21:03.000Z] Error: Browser not initialized
```

> ❓ Use logs to debug failed requests, network issues, or track which proxies are being used.

---

## 📝 Notes

* ⚖️ **Legal**: Ensure compliance with TikTok’s Terms of Service.
* ⚡ **Performance**: Built for 1000+ requests/hour, latency ≤ 30s, error rate < 5%.
* ⚠️ **Limitations**: Placeholder IDs won’t return real data.
* 🔀 **Updates**: TikTok API changes may require updates.

---

> 🧺 **Disclaimer**: This project is intended for **educational and learning purposes only**. Do not use it for commercial scraping or any activity that violates platform rules.
