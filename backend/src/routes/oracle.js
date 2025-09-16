const express = require('express');
const { getCurrentPrice, getAveragePrice, getPriceHistory } = require('../services/priceOracle');

const router = express.Router();

// Obtener precio actual de una criptomoneda
router.get('/price/:currency', async (req, res, next) => {
  try {
    const { currency } = req.params;
    const { baseCurrency = 'ARS' } = req.query;

    const price = await getCurrentPrice(currency.toUpperCase(), baseCurrency.toUpperCase());

    res.json({
      currency: currency.toUpperCase(),
      baseCurrency: baseCurrency.toUpperCase(),
      price: price.price,
      source: price.source,
      timestamp: price.timestamp,
      validFor: 30 // segundos
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo precio',
      message: error.message,
      code: 'PRICE_ERROR'
    });
  }
});

// Obtener precios de múltiples criptomonedas
router.get('/prices', async (req, res, next) => {
  try {
    const { baseCurrency = 'ARS' } = req.query;
    const currencies = ['USDT', 'BTC', 'ETH'];
    
    const prices = {};
    
    for (const currency of currencies) {
      try {
        const price = await getCurrentPrice(currency, baseCurrency.toUpperCase());
        prices[currency] = {
          price: price.price,
          source: price.source,
          timestamp: price.timestamp
        };
      } catch (error) {
        console.warn(`Error obteniendo precio de ${currency}:`, error.message);
        prices[currency] = {
          error: 'Precio no disponible',
          message: error.message
        };
      }
    }

    res.json({
      baseCurrency: baseCurrency.toUpperCase(),
      prices,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo precios',
      message: error.message,
      code: 'PRICES_ERROR'
    });
  }
});

// Obtener precio promedio de múltiples fuentes
router.get('/average/:currency', async (req, res, next) => {
  try {
    const { currency } = req.params;
    const { baseCurrency = 'ARS' } = req.query;

    const averagePrice = await getAveragePrice(currency.toUpperCase(), baseCurrency.toUpperCase());

    res.json({
      currency: currency.toUpperCase(),
      baseCurrency: baseCurrency.toUpperCase(),
      averagePrice: averagePrice.price,
      source: averagePrice.source,
      sources: averagePrice.sources,
      timestamp: averagePrice.timestamp
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo precio promedio',
      message: error.message,
      code: 'AVERAGE_PRICE_ERROR'
    });
  }
});

// Obtener historial de precios
router.get('/history/:currency', async (req, res, next) => {
  try {
    const { currency } = req.params;
    const { baseCurrency = 'ARS', hours = 24 } = req.query;

    const history = await getPriceHistory(
      currency.toUpperCase(), 
      baseCurrency.toUpperCase(), 
      parseInt(hours)
    );

    res.json({
      currency: currency.toUpperCase(),
      baseCurrency: baseCurrency.toUpperCase(),
      hours: parseInt(hours),
      history: history.map(price => ({
        price: price.price,
        source: price.source,
        timestamp: price.timestamp
      }))
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo historial',
      message: error.message,
      code: 'HISTORY_ERROR'
    });
  }
});

// Endpoint para calcular conversión
router.post('/convert', async (req, res, next) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({
        error: 'Datos requeridos',
        message: 'amount, fromCurrency y toCurrency son requeridos',
        code: 'MISSING_PARAMETERS'
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        error: 'Monto inválido',
        message: 'El monto debe ser un número positivo',
        code: 'INVALID_AMOUNT'
      });
    }

    let result;

    if (fromCurrency === toCurrency) {
      result = {
        amount: numericAmount,
        convertedAmount: numericAmount,
        rate: 1,
        source: 'Directo'
      };
    } else {
      const price = await getCurrentPrice(toCurrency, fromCurrency);
      const convertedAmount = numericAmount / price.price;
      
      result = {
        amount: numericAmount,
        convertedAmount: convertedAmount,
        rate: price.price,
        source: price.source,
        timestamp: price.timestamp
      };
    }

    res.json({
      conversion: result,
      validFor: 30 // segundos
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error en conversión',
      message: error.message,
      code: 'CONVERSION_ERROR'
    });
  }
});

module.exports = router;
