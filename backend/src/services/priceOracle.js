const axios = require('axios');
const prisma = require('../config/database');
const cron = require('node-cron');

// Configuración de APIs
const RIPIO_API_BASE = 'https://api.ripio.com/v1';
const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

// Cache de precios en memoria (para MVP)
const priceCache = new Map();
const CACHE_DURATION = 30 * 1000; // 30 segundos

// Precios de fallback para cuando las APIs externas no estén disponibles
const FALLBACK_PRICES = {
  'USDT_ARS': 800,  // Precio aproximado de USDT en ARS (actualizado)
  'STRK_ARS': 200,  // Precio aproximado de STRK en ARS
  'BTC_ARS': 15000000,  // Precio aproximado de BTC en ARS
  'ETH_ARS': 4500000   // Precio aproximado de ETH en ARS
};

// Función para obtener precio desde Ripio
async function getRipioPrice(currency, baseCurrency = 'ARS') {
  try {
    const response = await axios.get(`${RIPIO_API_BASE}/rates/`, {
      timeout: 5000,
      headers: {
        'User-Agent': 'MidatoPay/1.0'
      }
    });

    const rates = response.data;
    
    // Buscar el par de monedas
    const pair = rates.find(rate => 
      rate.pair === `${currency}_${baseCurrency}` || 
      rate.pair === `${baseCurrency}_${currency}`
    );

    if (!pair) {
      throw new Error(`Par ${currency}/${baseCurrency} no encontrado en Ripio`);
    }

    // Ripio devuelve el precio de compra y venta
    const price = parseFloat(pair.sell_rate || pair.buy_rate);
    
    return {
      price,
      source: 'RIPIO',
      timestamp: new Date(),
      buyRate: parseFloat(pair.buy_rate),
      sellRate: parseFloat(pair.sell_rate)
    };
  } catch (error) {
    console.error('Error obteniendo precio de Ripio:', error.message);
    throw error;
  }
}

// Función para obtener precio desde Criptoya
async function getCriptoyaPrice(currency, baseCurrency = 'ARS') {
  try {
    const response = await axios.get(`https://criptoya.com/api/ripio/${currency}/${baseCurrency}/0.1`, {
      timeout: 5000,
      headers: {
        'User-Agent': 'MidatoPay/1.0'
      }
    });

    const data = response.data;
    
    // Criptoya devuelve ask (precio de venta) y bid (precio de compra)
    // Usamos el precio promedio para ser justos
    const averagePrice = (data.ask + data.bid) / 2;
    
    return {
      price: averagePrice,
      source: 'CRIPTOYA',
      timestamp: new Date(),
      ask: data.ask,
      bid: data.bid,
      totalAsk: data.totalAsk,
      totalBid: data.totalBid
    };
  } catch (error) {
    console.error('Error obteniendo precio de Criptoya:', error.message);
    throw error;
  }
}

// Función para obtener precio desde Binance
async function getBinancePrice(currency, baseCurrency = 'ARS') {
  try {
    // Para Binance, necesitamos convertir ARS a USDT primero
    // ya que Binance no tiene par directo ARS/crypto
    const usdtArsResponse = await axios.get(`${BINANCE_API_BASE}/ticker/price?symbol=USDTARS`, {
      timeout: 5000
    });
    
    const usdtArsRate = parseFloat(usdtArsResponse.data.price);
    
    // Manejo especial para STRK - usar precio de fallback si no está disponible en Binance
    if (currency === 'STRK') {
      const fallbackKey = `${currency}_${baseCurrency}`;
      const fallbackPrice = FALLBACK_PRICES[fallbackKey];
      
      if (fallbackPrice) {
        console.log(`⚠️ STRK no disponible en Binance, usando precio de fallback: $${fallbackPrice}`);
        return {
          price: fallbackPrice,
          source: 'BINANCE_FALLBACK',
          timestamp: new Date(),
          usdtArsRate,
          cryptoUsdtRate: fallbackPrice / usdtArsRate
        };
      }
    }
    
    // Obtener precio de la crypto en USDT
    const cryptoUsdtResponse = await axios.get(`${BINANCE_API_BASE}/ticker/price?symbol=${currency}USDT`, {
      timeout: 5000
    });
    
    const cryptoUsdtRate = parseFloat(cryptoUsdtResponse.data.price);
    
    // Calcular precio en ARS
    const priceInArs = cryptoUsdtRate * usdtArsRate;
    
    return {
      price: priceInArs,
      source: 'BINANCE',
      timestamp: new Date(),
      usdtArsRate,
      cryptoUsdtRate
    };
  } catch (error) {
    console.error('Error obteniendo precio de Binance:', error.message);
    
    // Si es STRK y falla, usar precio de fallback
    if (currency === 'STRK') {
      const fallbackKey = `${currency}_${baseCurrency}`;
      const fallbackPrice = FALLBACK_PRICES[fallbackKey];
      
      if (fallbackPrice) {
        console.log(`⚠️ STRK fallback por error en Binance: $${fallbackPrice}`);
        return {
          price: fallbackPrice,
          source: 'BINANCE_FALLBACK',
          timestamp: new Date(),
          usdtArsRate: 1,
          cryptoUsdtRate: fallbackPrice
        };
      }
    }
    
    throw error;
  }
}

// Función principal para obtener precio actual
async function getCurrentPrice(currency, baseCurrency = 'ARS') {
  const cacheKey = `${currency}_${baseCurrency}`;
  const cached = priceCache.get(cacheKey);
  
  // Verificar cache
  if (cached && (Date.now() - cached.timestamp.getTime()) < CACHE_DURATION) {
    return cached;
  }

  const prices = [];
  
  try {
    // Obtener precio de Criptoya (Ripio) - Solo para USDT, BTC, ETH
    if (currency === 'USDT' || currency === 'BTC' || currency === 'ETH') {
      const criptoyaPrice = await getCriptoyaPrice(currency, baseCurrency);
      prices.push(criptoyaPrice);
    }
  } catch (error) {
    console.warn('No se pudo obtener precio de Criptoya:', error.message);
  }

  try {
    // Obtener precio de Ripio (fallback)
    if (currency === 'USDT' || currency === 'STRK' || currency === 'BTC' || currency === 'ETH') {
      const ripioPrice = await getRipioPrice(currency, baseCurrency);
      prices.push(ripioPrice);
    }
  } catch (error) {
    console.warn('No se pudo obtener precio de Ripio:', error.message);
  }

  try {
    // Obtener precio de Binance (fallback)
    if (currency === 'USDT' || currency === 'STRK' || currency === 'BTC' || currency === 'ETH') {
      const binancePrice = await getBinancePrice(currency, baseCurrency);
      prices.push(binancePrice);
    }
  } catch (error) {
    console.warn('No se pudo obtener precio de Binance:', error.message);
  }

  if (prices.length === 0) {
    // Usar precio de fallback si no se pueden obtener precios de APIs externas
    const fallbackKey = `${currency}_${baseCurrency}`;
    const fallbackPrice = FALLBACK_PRICES[fallbackKey];
    
    if (fallbackPrice) {
      console.log(`⚠️ Usando precio de fallback para ${currency}/${baseCurrency}: $${fallbackPrice}`);
      
      const fallbackData = {
        price: fallbackPrice,
        source: 'FALLBACK',
        timestamp: new Date()
      };
      
      // Actualizar cache
      priceCache.set(cacheKey, fallbackData);
      
      // Guardar en base de datos
      try {
        await prisma.priceOracle.create({
          data: {
            currency,
            baseCurrency,
            price: fallbackPrice,
            source: 'FALLBACK'
          }
        });
      } catch (error) {
        console.warn('Error guardando precio de fallback en BD:', error.message);
      }
      
      return fallbackData;
    }
    
    throw new Error(`No se pudieron obtener precios para ${currency}/${baseCurrency}`);
  }

  // Calcular precio promedio ponderado
  // Para el MVP, usamos el mejor precio de venta (más favorable para el comercio)
  let bestPrice = prices[0];
  
  for (const price of prices) {
    if (price.source === 'RIPIO' && price.sellRate) {
      // Para Ripio, usamos el precio de venta (mejor para el comercio)
      if (price.sellRate > bestPrice.price) {
        bestPrice = {
          ...price,
          price: price.sellRate
        };
      }
    } else if (price.price > bestPrice.price) {
      bestPrice = price;
    }
  }

  // Actualizar cache
  priceCache.set(cacheKey, bestPrice);
  
  // Guardar en base de datos (solo si el precio es válido)
  if (bestPrice.price && !isNaN(bestPrice.price) && bestPrice.price > 0) {
    try {
      await prisma.priceOracle.create({
        data: {
          currency,
          baseCurrency,
          price: bestPrice.price,
          source: bestPrice.source
        }
      });
    } catch (error) {
      console.warn('Error guardando precio en BD:', error.message);
    }
  } else {
    console.warn(`Precio inválido para ${currency}/${baseCurrency}: ${bestPrice.price}`);
  }

  return bestPrice;
}

// Función para obtener precio promedio de múltiples fuentes
async function getAveragePrice(currency, baseCurrency = 'ARS') {
  const prices = [];
  
  try {
    const ripioPrice = await getRipioPrice(currency, baseCurrency);
    prices.push(ripioPrice.price);
  } catch (error) {
    console.warn('Error obteniendo precio de Ripio:', error.message);
  }

  try {
    const binancePrice = await getBinancePrice(currency, baseCurrency);
    prices.push(binancePrice.price);
  } catch (error) {
    console.warn('Error obteniendo precio de Binance:', error.message);
  }

  if (prices.length === 0) {
    throw new Error(`No se pudieron obtener precios para ${currency}/${baseCurrency}`);
  }

  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  
  return {
    price: averagePrice,
    source: 'AVERAGE',
    timestamp: new Date(),
    sources: prices.length
  };
}

// Función para actualizar precios periódicamente
async function updatePrices() {
  console.log('🔄 Actualizando precios...');
  
  const currencies = ['USDT', 'STRK', 'BTC', 'ETH'];
  
  for (const currency of currencies) {
    try {
      const priceData = await getCurrentPrice(currency, 'ARS');
      if (priceData.source === 'FALLBACK') {
        console.log(`⚠️ Precio ${currency}/ARS usando fallback: $${priceData.price}`);
      } else {
        console.log(`✅ Precio ${currency}/ARS actualizado: $${priceData.price} (${priceData.source})`);
      }
    } catch (error) {
      console.error(`❌ Error actualizando ${currency}/ARS:`, error.message);
    }
  }
}

// Iniciar actualización automática de precios
function startPriceOracle() {
  console.log('🚀 Iniciando oráculo de precios...');
  
  // Actualizar precios cada 30 segundos
  cron.schedule('*/30 * * * * *', updatePrices);
  
  // Actualizar precios al inicio
  updatePrices();
  
  console.log('✅ Oráculo de precios iniciado');
}

// Función para obtener historial de precios
async function getPriceHistory(currency, baseCurrency = 'ARS', hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const prices = await prisma.priceOracle.findMany({
    where: {
      currency,
      baseCurrency,
      timestamp: {
        gte: since
      }
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: 100
  });

  return prices;
}

// Función específica para conversión ARS → Crypto (MidatoPay)
async function convertARSToCrypto(amountARS, targetCrypto) {
  try {
    const priceData = await getCurrentPrice(targetCrypto, 'ARS');
    const cryptoAmount = amountARS / priceData.price;
    
    return {
      amountARS,
      targetCrypto,
      cryptoAmount,
      exchangeRate: priceData.price,
      source: priceData.source,
      timestamp: priceData.timestamp,
      // Agregar margen de seguridad del 2%
      cryptoAmountWithMargin: cryptoAmount * 0.98
    };
  } catch (error) {
    console.error(`Error convirtiendo ${amountARS} ARS a ${targetCrypto}:`, error.message);
    throw error;
  }
}

// Función para obtener rate con margen de seguridad
async function getExchangeRateWithMargin(targetCrypto, marginPercent = 2) {
  try {
    const priceData = await getCurrentPrice(targetCrypto, 'ARS');
    const margin = marginPercent / 100;
    
    return {
      baseRate: priceData.price,
      rateWithMargin: priceData.price * (1 + margin),
      marginPercent,
      targetCrypto,
      source: priceData.source,
      timestamp: priceData.timestamp
    };
  } catch (error) {
    console.error(`Error obteniendo rate con margen para ${targetCrypto}:`, error.message);
    throw error;
  }
}

// Función para validar si un rate está dentro del rango aceptable
async function validateExchangeRate(targetCrypto, expectedRate, tolerancePercent = 5) {
  try {
    const currentRate = await getCurrentPrice(targetCrypto, 'ARS');
    const tolerance = tolerancePercent / 100;
    const minRate = expectedRate * (1 - tolerance);
    const maxRate = expectedRate * (1 + tolerance);
    
    const isValid = currentRate.price >= minRate && currentRate.price <= maxRate;
    
    return {
      isValid,
      currentRate: currentRate.price,
      expectedRate,
      tolerancePercent,
      minRate,
      maxRate,
      deviation: Math.abs(currentRate.price - expectedRate) / expectedRate * 100
    };
  } catch (error) {
    console.error(`Error validando rate para ${targetCrypto}:`, error.message);
    throw error;
  }
}

module.exports = {
  getCurrentPrice,
  getAveragePrice,
  getRipioPrice,
  getBinancePrice,
  startPriceOracle,
  getPriceHistory,
  updatePrices,
  convertARSToCrypto,
  getExchangeRateWithMargin,
  validateExchangeRate
};
