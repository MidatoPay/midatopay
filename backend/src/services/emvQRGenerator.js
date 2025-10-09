const QRCode = require('qrcode');
const crypto = require('crypto');

class EMVQRGenerator {
  constructor() {
    // Campos EMVCo estándar
    this.EMV_FIELDS = {
      PAYLOAD_FORMAT_INDICATOR: '00',
      POINT_OF_INITIATION: '01',
      MERCHANT_ACCOUNT_INFO: '26',
      MERCHANT_CATEGORY_CODE: '52',
      TRANSACTION_CURRENCY: '53',
      TRANSACTION_AMOUNT: '54',
      COUNTRY_CODE: '58',
      MERCHANT_NAME: '59',
      MERCHANT_CITY: '60',
      CRC: '63'
    };
    
    // Campos extendidos para MidatoPay (custom)
    this.MIDATOPAY_FIELDS = {
      MERCHANT_WALLET: '64',
      CRYPTO_TARGET: '65',
      CRYPTO_AMOUNT: '66',
      EXCHANGE_RATE: '67',
      SESSION_ID: '68',
      PAYMENT_METHOD: '69'
    };
  }

  // Generar QR EMVCo con campos extendidos para crypto
  generateEMVQR(merchantData, paymentData) {
    const tlvData = [];
    
    // Campos EMVCo estándar
    tlvData.push({ tag: this.EMV_FIELDS.PAYLOAD_FORMAT_INDICATOR, value: '01' });
    tlvData.push({ tag: this.EMV_FIELDS.POINT_OF_INITIATION, value: '11' });
    tlvData.push({ tag: this.EMV_FIELDS.MERCHANT_ACCOUNT_INFO, value: this.generateMerchantAccountInfo(merchantData.id) });
    tlvData.push({ tag: this.EMV_FIELDS.MERCHANT_CATEGORY_CODE, value: '6012' }); // Servicios financieros
    tlvData.push({ tag: this.EMV_FIELDS.TRANSACTION_CURRENCY, value: '032' }); // ARS = 032
    tlvData.push({ tag: this.EMV_FIELDS.TRANSACTION_AMOUNT, value: paymentData.amountARS.toFixed(2) });
    tlvData.push({ tag: this.EMV_FIELDS.COUNTRY_CODE, value: 'AR' });
    tlvData.push({ tag: this.EMV_FIELDS.MERCHANT_NAME, value: merchantData.name });
    tlvData.push({ tag: this.EMV_FIELDS.MERCHANT_CITY, value: merchantData.city || 'BUENOS AIRES' });
    
    // Campos extendidos MidatoPay
    tlvData.push({ tag: this.MIDATOPAY_FIELDS.MERCHANT_WALLET, value: paymentData.merchantWallet });
    tlvData.push({ tag: this.MIDATOPAY_FIELDS.CRYPTO_TARGET, value: paymentData.targetCrypto });
    tlvData.push({ tag: this.MIDATOPAY_FIELDS.CRYPTO_AMOUNT, value: paymentData.cryptoAmount.toFixed(6) });
    tlvData.push({ tag: this.MIDATOPAY_FIELDS.EXCHANGE_RATE, value: paymentData.exchangeRate.toFixed(2) });
    tlvData.push({ tag: this.MIDATOPAY_FIELDS.SESSION_ID, value: paymentData.sessionId });
    tlvData.push({ tag: this.MIDATOPAY_FIELDS.PAYMENT_METHOD, value: 'ARS_ONLY' });
    
    // Serializar a formato TLV
    const tlvString = this.serializeTLV(tlvData);
    
    // Calcular CRC
    const crc = this.calculateCRC(tlvString);
    
    // Agregar CRC al final
    const finalTLV = tlvString + crc;
    
    return finalTLV;
  }

  // Serializar datos TLV
  serializeTLV(tlvData) {
    return tlvData.map(item => {
      const length = item.value.length.toString().padStart(2, '0');
      return `${item.tag}${length}${item.value}`;
    }).join('');
  }

  // Calcular CRC16-CCITT
  calculateCRC(data) {
    const polynomial = 0x1021;
    let crc = 0xFFFF;
    
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ polynomial;
        } else {
          crc <<= 1;
        }
        crc &= 0xFFFF;
      }
    }
    
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  // Generar Merchant Account Info con AID MidatoPay
  generateMerchantAccountInfo(merchantId) {
    const aid = 'A0000007'; // AID reservado para MidatoPay
    const merchantIdValue = `MIDATOPAY_${merchantId}`;
    
    // Estructura: AID + Merchant ID
    const aidLength = aid.length.toString().padStart(2, '0');
    const merchantIdLength = merchantIdValue.length.toString().padStart(2, '0');
    
    return `00${aidLength}${aid}01${merchantIdLength}${merchantIdValue}`;
  }

  // Generar QR visual
  async generateQRCodeImage(tlvData, options = {}) {
    const defaultOptions = {
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    };
    
    const qrOptions = { ...defaultOptions, ...options };
    
    try {
      const qrCodeImage = await QRCode.toDataURL(tlvData, qrOptions);
      return qrCodeImage;
    } catch (error) {
      console.error('Error generando QR code:', error);
      throw error;
    }
  }

  // Generar session ID único
  generateSessionId() {
    return `sess_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  // Validar datos antes de generar QR
  validatePaymentData(merchantData, paymentData) {
    const errors = [];
    
    // Validaciones EMVCo obligatorias
    if (!merchantData.id) errors.push('Merchant ID es requerido');
    if (!merchantData.name) errors.push('Merchant name es requerido');
    if (!paymentData.amountARS || paymentData.amountARS <= 0) errors.push('Amount ARS debe ser mayor a 0');
    if (!paymentData.targetCrypto) errors.push('Target crypto es requerido');
    if (!paymentData.merchantWallet) errors.push('Merchant wallet es requerido');
    if (!paymentData.cryptoAmount || paymentData.cryptoAmount <= 0) errors.push('Crypto amount debe ser mayor a 0');
    if (!paymentData.exchangeRate || paymentData.exchangeRate <= 0) errors.push('Exchange rate debe ser mayor a 0');
    
    // Validaciones específicas EMVCo
    if (merchantData.name.length > 25) errors.push('Merchant name no puede exceder 25 caracteres');
    if (merchantData.city && merchantData.city.length > 15) errors.push('Merchant city no puede exceder 15 caracteres');
    if (paymentData.amountARS > 999999999.99) errors.push('Amount ARS excede el límite máximo');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Parser para leer QR EMVCo
class EMVQRParser {
  constructor() {
    this.EMV_FIELDS = {
      '00': 'PAYLOAD_FORMAT_INDICATOR',
      '01': 'POINT_OF_INITIATION',
      '26': 'MERCHANT_ACCOUNT_INFO',
      '52': 'MERCHANT_CATEGORY_CODE',
      '53': 'TRANSACTION_CURRENCY',
      '54': 'TRANSACTION_AMOUNT',
      '58': 'COUNTRY_CODE',
      '59': 'MERCHANT_NAME',
      '60': 'MERCHANT_CITY',
      '63': 'CRC'
    };
    
    this.MIDATOPAY_FIELDS = {
      '64': 'MERCHANT_WALLET',
      '65': 'CRYPTO_TARGET',
      '66': 'CRYPTO_AMOUNT',
      '67': 'EXCHANGE_RATE',
      '68': 'SESSION_ID',
      '69': 'PAYMENT_METHOD'
    };
  }

  // Parsear QR EMVCo
  parseEMVQR(qrData) {
    try {
      const parsed = this.parseTLV(qrData);
      
      // Verificar CRC
      if (!this.validateCRC(qrData)) {
        throw new Error('Invalid CRC');
      }
      
      // Extraer campos estándar
      const merchantAccountInfo = this.parseMerchantAccountInfo(parsed['26']);
      
      const standardData = {
        version: parsed['00'],
        pointOfInitiation: parsed['01'],
        merchantAccountInfo,
        merchantCategoryCode: parsed['52'],
        amount: parseFloat(parsed['54']),
        currency: parsed['53'] === '032' ? 'ARS' : parsed['53'],
        merchantName: parsed['59'],
        merchantCity: parsed['60'],
        country: parsed['58']
      };
      
      // Extraer campos extendidos (crypto)
      const cryptoData = parsed['64'] ? {
        merchantWallet: parsed['64'],
        targetCrypto: parsed['65'],
        cryptoAmount: parseFloat(parsed['66']),
        exchangeRate: parseFloat(parsed['67']),
        sessionId: parsed['68'],
        paymentMethod: parsed['69']
      } : null;
      
      return {
        type: 'EMV',
        standard: standardData,
        crypto: cryptoData,
        isMidatoPay: !!cryptoData,
        rawData: parsed
      };
      
    } catch (error) {
      console.error('EMV QR parsing error:', error);
      return null;
    }
  }

  // Parsear Merchant Account Info
  parseMerchantAccountInfo(merchantAccountData) {
    if (!merchantAccountData) return null;
    
    try {
      // Estructura: 00[length][AID]01[length][MerchantID]
      let i = 0;
      const result = {};
      
      while (i < merchantAccountData.length) {
        const tag = merchantAccountData.substring(i, i + 2);
        i += 2;
        
        const length = parseInt(merchantAccountData.substring(i, i + 2));
        i += 2;
        
        const value = merchantAccountData.substring(i, i + length);
        i += length;
        
        if (tag === '00') {
          result.aid = value;
        } else if (tag === '01') {
          result.merchantId = value;
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error parsing merchant account info:', error);
      return { merchantId: merchantAccountData }; // Fallback
    }
  }

  // Parsear formato TLV
  parseTLV(data) {
    const result = {};
    let i = 0;
    
    while (i < data.length) {
      const tag = data.substring(i, i + 2);
      i += 2;
      
      const length = parseInt(data.substring(i, i + 2));
      i += 2;
      
      const value = data.substring(i, i + length);
      i += length;
      
      result[tag] = value;
    }
    
    return result;
  }

  // Validar CRC
  validateCRC(data) {
    const dataWithoutCRC = data.substring(0, data.length - 4);
    const providedCRC = data.substring(data.length - 4);
    const calculatedCRC = this.calculateCRC(dataWithoutCRC);
    
    return providedCRC === calculatedCRC;
  }

  // Calcular CRC16-CCITT
  calculateCRC(data) {
    const polynomial = 0x1021;
    let crc = 0xFFFF;
    
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ polynomial;
        } else {
          crc <<= 1;
        }
        crc &= 0xFFFF;
      }
    }
    
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }
}

module.exports = {
  EMVQRGenerator,
  EMVQRParser
};
