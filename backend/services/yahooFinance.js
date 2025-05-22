import redisClient from "./redisClient.js";
import yahooFinance from "yahoo-finance2";

const CACHE_EXPIRATION_SECONDS = 3600; // 1 hour

export async function getCurrentPrice(ticker) {
  const cacheKey = `price:${ticker.toUpperCase()}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`[Cache HIT] Returning cached price for ${ticker}`);
      console.log(JSON.parse(cached).price)
      return JSON.parse(cached).price;
    }

    console.log(`[Cache MISS] Fetching price from Yahoo Finance for ${ticker}`);
    const quote = await yahooFinance.quote(ticker);
    const price = quote.regularMarketPrice;

    if (price != null) {
      await redisClient.setEx(
        cacheKey,
        CACHE_EXPIRATION_SECONDS,
        JSON.stringify({ price })
      );
      console.log(`[Cache SET] Cached price for ${ticker}`);
    }

    return price;
  } catch (err) {
    console.error("Error fetching price:", err);
    return null;
  }
}
