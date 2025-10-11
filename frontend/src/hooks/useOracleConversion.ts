// Hook para manejar conversiones ARS → USDT usando Oracle real de blockchain
import { useState, useEffect, useRef, useCallback } from 'react';
import { starknetOracleService } from '@/services/starknetOracleService';

interface OracleConversionResult {
  cryptoAmount: number;
  exchangeRate: number;
  source: string;
}

// Cache para evitar llamadas repetidas
const conversionCache = new Map<string, OracleConversionResult>();
const CACHE_DURATION = 30000; // 30 segundos

export function useOracleConversion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallRef = useRef<number>(0);

  // Rate limiting: máximo 1 llamada por segundo
  const canMakeCall = useCallback(() => {
    const now = Date.now();
    if (now - lastCallRef.current < 1000) {
      return false;
    }
    lastCallRef.current = now;
    return true;
  }, []);

  // Llamada real al Oracle de blockchain con cache y rate limiting
  const quoteARSToUSDT = async (amountARS: number): Promise<OracleConversionResult | null> => {
    if (!amountARS || amountARS <= 0) {
      return null;
    }

    // Verificar cache primero
    const cacheKey = `ars_${amountARS}`;
    const cached = conversionCache.get(cacheKey);
    if (cached && Date.now() - (cached as any).timestamp < CACHE_DURATION) {
      console.log('📋 Usando cache para:', amountARS, 'ARS');
      return cached;
    }

    // Rate limiting
    if (!canMakeCall()) {
      console.log('⏱️ Rate limit: esperando...');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Consultando Oracle real para:', amountARS, 'ARS');
      
      // Llamar al Oracle real
      const result = await starknetOracleService.getARSToUSDTQuote(amountARS);
      
      if (!result) {
        throw new Error('Oracle no disponible');
      }
      
      const conversionResult = {
        cryptoAmount: result.amountUSDT,
        exchangeRate: result.rate,
        source: result.source
      };

      // Guardar en cache
      conversionCache.set(cacheKey, {
        ...conversionResult,
        timestamp: Date.now()
      } as any);

      return conversionResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error consultando Oracle de blockchain';
      setError(errorMessage);
      console.error('Error calling Oracle:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Calcular conversión ARS → USDT usando Oracle real con debounce
  const convertARSToCrypto = useCallback(async (amountARS: number, targetCrypto: string): Promise<OracleConversionResult | null> => {
    if (targetCrypto !== 'USDT') {
      setError('Solo USDT está soportado por el Oracle');
      return null;
    }

    // Limpiar debounce anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    return new Promise((resolve) => {
      debounceRef.current = setTimeout(async () => {
        const result = await quoteARSToUSDT(amountARS);
        resolve(result);
      }, 500); // Debounce de 500ms
    });
  }, [quoteARSToUSDT]);

  // Limpiar debounce al desmontar
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    loading,
    error,
    convertARSToCrypto,
    quoteARSToUSDT
  };
}
