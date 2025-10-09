const { EMVQRGenerator, EMVQRParser } = require('./emvQRGenerator');
const CavosService = require('./cavosService');
const prisma = require('../config/database');

class MidatoPayService {
  constructor() {
    this.qrGenerator = new EMVQRGenerator();
    this.qrParser = new EMVQRParser();
    this.cavosService = new CavosService();
  }

  // Generar QR de pago para comercio
  async generatePaymentQR(merchantId, amountARS, concept = 'Pago QR') {
    try {
      // 1. Obtener datos del comercio
      const merchant = await this.getMerchant(merchantId);
      if (!merchant) {
        throw new Error('Merchant not found');
      }

      // 2. Generar payment ID único
      const paymentId = this.qrGenerator.generatePaymentId();
      
      // 3. Validar datos básicos
      const validation = this.qrGenerator.validatePaymentData(
        merchant.walletAddress, 
        amountARS, 
        paymentId
      );
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // 4. Generar TLV data con solo 3 campos
      const tlvData = this.qrGenerator.generateEMVQR(
        merchant.walletAddress,
        amountARS,
        paymentId
      );
      
      // 5. Generar QR visual
      const qrCodeImage = await this.qrGenerator.generateQRCodeImage(tlvData);
      
      // 6. Guardar sesión en base de datos
      console.log('💾 Guardando pago con paymentId:', paymentId);
      console.log('💾 MerchantId:', merchantId);
      console.log('💾 Amount:', amountARS);
      await this.savePaymentSession(paymentId, merchantId, {
        amountARS,
        concept,
        merchantWallet: merchant.walletAddress
      });
      console.log('✅ Pago guardado exitosamente');
      
      return {
        success: true,
        qrCodeImage,
        tlvData,
        paymentData: {
          paymentId,
          amountARS,
          merchantAddress: merchant.walletAddress,
          merchantName: merchant.name,
          concept
        }
      };
      
    } catch (error) {
      console.error('Error generating payment QR:', error);
      throw error;
    }
  }

  // Obtener comercio por ID
  async getMerchant(merchantId) {
    try {
      // Verificar que prisma esté disponible
      if (!prisma || !prisma.user) {
        throw new Error('Prisma client not initialized');
      }
      
      const merchant = await prisma.user.findUnique({
        where: { id: merchantId }
      });
      
      if (!merchant) {
        throw new Error('Merchant not found');
      }

      // Por ahora usamos un wallet temporal (aquí entraría Cavos)
      if (!merchant.walletAddress) {
        merchant.walletAddress = `temp_wallet_${merchantId}`;
      }

      return merchant;
    } catch (error) {
      console.error('Error getting merchant:', error);
      throw error;
    }
  }

  // Generar wallet para comercio (placeholder para Cavos)
  async generateMerchantWallet(merchantId) {
    // TODO: Integrar con Cavos Aegis para generar wallet automático
    // Por ahora retornamos un placeholder
    const timestamp = Date.now();
    const randomHex = Math.random().toString(16).substring(2, 10);
    return `0x${merchantId}_${timestamp}_${randomHex}`;
  }

  // Guardar sesión de pago
  async savePaymentSession(paymentId, merchantId, paymentData) {
    try {
      // Calcular tiempo de expiración (30 minutos)
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + 30);

      console.log('💾 Creando pago en BD con datos:', {
        paymentId,
        merchantId,
        amount: paymentData.amountARS,
        concept: paymentData.concept || 'Pago QR',
        orderId: paymentId,
        status: 'PENDING',
        qrCode: 'QR_SIMPLE',
        expiresAt: expirationTime
      });

      const createdPayment = await prisma.payment.create({
        data: {
          amount: paymentData.amountARS, // Campo obligatorio del schema
          currency: 'ARS', // Campo obligatorio del schema
          concept: paymentData.concept || 'Pago QR', // Campo obligatorio del schema
          orderId: paymentId, // Usar paymentId como orderId
          status: 'PENDING', // Campo obligatorio del schema
          qrCode: 'QR_SIMPLE', // Campo obligatorio del schema
          expiresAt: expirationTime, // Campo obligatorio del schema
          userId: merchantId // Campo obligatorio del schema para la relación
        }
      });
      
      console.log('✅ Payment session saved successfully:', createdPayment);
    } catch (error) {
      console.error('Error saving payment session:', error);
      throw error;
    }
  }

  // Obtener sesión de pago
  async getPaymentSession(sessionId) {
    try {
      return await prisma.payment.findUnique({
        where: { sessionId }
      });
    } catch (error) {
      console.error('Error getting payment session:', error);
      throw error;
    }
  }

  // Actualizar sesión de pago
  async updatePaymentSession(sessionId, updateData) {
    try {
      await prisma.payment.update({
        where: { sessionId },
        data: updateData
      });
    } catch (error) {
      console.error('Error updating payment session:', error);
      throw error;
    }
  }

  // Ejecutar conversión crypto (placeholder para Cavos)
  async executeCryptoConversion(paymentSession) {
    // TODO: Integrar con Cavos Aegis para ejecutar conversión automática
    // Por ahora simulamos la transacción
    const transactionHash = `0x${Date.now().toString(16)}_${Math.random().toString(16).substring(2)}`;
    
    return {
      success: true,
      transactionHash,
      gasUsed: '0x1234',
      blockNumber: '0x5678',
      timestamp: new Date()
    };
  }

  // Notificar comercio
  async notifyMerchant(merchantId, notificationData) {
    // TODO: Implementar notificaciones (WebSocket, email, SMS)
    console.log(`📬 Notifying merchant ${merchantId}:`, notificationData);
  }

  // Obtener historial de pagos del comercio
  async getMerchantPaymentHistory(merchantId, limit = 50) {
    try {
      const payments = await prisma.payment.findMany({
        where: { merchantId },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
      
      return payments;
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  }

  // Obtener estadísticas del comercio
  async getMerchantStats(merchantId) {
    try {
      const stats = await prisma.payment.aggregate({
        where: { merchantId },
        _sum: {
          amountARS: true,
          cryptoAmount: true
        },
        _count: {
          sessionId: true
        }
      });

      const completedPayments = await prisma.payment.count({
        where: {
          merchantId,
          status: 'COMPLETED'
        }
      });

      return {
        totalPayments: stats._count.sessionId,
        completedPayments,
        totalARS: stats._sum.amountARS || 0,
        totalCrypto: stats._sum.cryptoAmount || 0,
        successRate: stats._count.sessionId > 0 ? (completedPayments / stats._count.sessionId) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting merchant stats:', error);
      throw error;
    }
  }

  // Escanear QR y obtener datos del pago
  async scanPaymentQR(qrData) {
    try {
      // Parsear el QR simplificado
      const qrInfo = this.qrParser.parseEMVQR(qrData);
      
      if (!qrInfo.isValid) {
        throw new Error(`QR Code no válido: ${qrInfo.error}`);
      }

      const { merchantAddress, amount, paymentId } = qrInfo.data;

      // Buscar el pago en la base de datos
      console.log('Buscando pago con paymentId:', paymentId);
      
      const payment = await prisma.payment.findFirst({
        where: { orderId: paymentId },
        include: { user: true }
      });

      if (!payment) {
        throw new Error('Pago no encontrado');
      }

      // Verificar si el pago ha expirado
      if (new Date() > payment.expiresAt) {
        throw new Error('El QR ha expirado');
      }

      // Verificar si el pago ya fue procesado
      if (payment.status !== 'PENDING') {
        throw new Error('El pago ya fue procesado');
      }
      
      return {
        success: true,
        paymentData: {
          paymentId,
          merchantAddress,
          amountARS: amount,
          merchantName: payment.user.name,
          concept: payment.concept,
          expiresAt: payment.expiresAt.toISOString(),
          status: payment.status
        }
      };
    } catch (error) {
      console.error('Error scanning payment QR:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Procesar pago ARS
  async processARSPayment(paymentId, arsPaymentData) {
    try {
      console.log('🔄 Procesando pago ARS:', { paymentId, arsPaymentData });
      
      // Buscar el pago
      const payment = await prisma.payment.findFirst({
        where: { orderId: paymentId },
        include: { user: true }
      });

      if (!payment) {
        throw new Error('Pago no encontrado');
      }

      // Verificar estado
      if (payment.status !== 'PENDING') {
        throw new Error('El pago ya fue procesado');
      }

      // Verificar expiración
      if (new Date() > payment.expiresAt) {
        throw new Error('El pago ha expirado');
      }

      // Validar monto
      if (Math.abs(payment.amount - arsPaymentData.amount) > 0.01) {
        throw new Error('El monto no coincide');
      }

      // Simular procesamiento de pago ARS
      // En producción, aquí se integraría con el sistema bancario argentino
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 🚀 EJECUTAR SWAP REAL CON ORACLE DE BLOCKCHAIN
      console.log('🚀 Ejecutando swap ARS → Crypto con Oracle de blockchain...');
      
      const swapResult = await this.cavosService.executeARSToCryptoSwap({
        merchantWalletAddress: payment.user.walletAddress || `temp_wallet_${payment.user.id}`,
        amountARS: arsPaymentData.amount,
        targetCrypto: arsPaymentData.targetCrypto || 'USDT',
        cryptoAmount: null, // El Oracle calculará esto
        exchangeRate: null, // El Oracle calculará esto
        paymentId: paymentId
      });

      if (!swapResult.success) {
        throw new Error(`Swap falló: ${swapResult.error}`);
      }

      console.log('✅ Swap ejecutado exitosamente:', swapResult);

      // Actualizar estado del pago
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: 'PAID',
          updatedAt: new Date()
        }
      });

      // Crear transacción de crypto con datos del Oracle
      const transaction = await prisma.transaction.create({
        data: {
          paymentId: payment.id,
          amount: swapResult.cryptoAmount, // Del Oracle
          currency: arsPaymentData.targetCrypto || 'USDT',
          exchangeRate: swapResult.exchangeRate, // Del Oracle
          finalAmount: parseFloat(payment.amount),
          finalCurrency: 'ARS',
          status: 'CONFIRMED',
          blockchainTxHash: swapResult.transactionHash, // Hash real de Starknet
          walletAddress: payment.user.walletAddress || `temp_wallet_${payment.user.id}`,
          userId: payment.userId,
          confirmationCount: 1,
          requiredConfirmations: 1
        }
      });

      console.log('✅ Pago procesado exitosamente:', {
        paymentId: payment.id,
        transactionId: transaction.id,
        cryptoAmount: swapResult.cryptoAmount, // Del Oracle
        targetCrypto: arsPaymentData.targetCrypto || 'USDT',
        blockchainTxHash: swapResult.transactionHash,
        explorerUrl: swapResult.explorerUrl,
        mode: swapResult.mode || 'REAL'
      });

      return {
        success: true,
        transactionId: transaction.id,
        message: swapResult.mode === 'SIMULATION' 
          ? 'Pago procesado exitosamente (Modo Simulación)' 
          : 'Pago procesado exitosamente',
        cryptoAmount: swapResult.cryptoAmount, // Del Oracle
        targetCrypto: arsPaymentData.targetCrypto || 'USDT',
        exchangeRate: swapResult.exchangeRate, // Del Oracle
        blockchainTxHash: swapResult.transactionHash,
        explorerUrl: swapResult.explorerUrl,
        gasUsed: swapResult.gasUsed,
        gasPrice: swapResult.gasPrice,
        mode: swapResult.mode || 'REAL'
      };
    } catch (error) {
      console.error('Error processing ARS payment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

}

module.exports = MidatoPayService;
