const { EMVQRGenerator, EMVQRParser } = require('./src/services/emvQRGenerator');

// Test del QR Generator mejorado
function testEMVQRGenerator() {
  console.log('🧪 Testing EMVCo QR Generator...\n');
  
  const generator = new EMVQRGenerator();
  const parser = new EMVQRParser();
  
  // Datos de prueba
  const merchantData = {
    id: '123',
    name: 'Kiosco XYZ',
    city: 'Córdoba'
  };
  
  const paymentData = {
    amountARS: 10000,
    targetCrypto: 'USDT',
    merchantWallet: '0xABCDEF123456789',
    cryptoAmount: 12.5,
    exchangeRate: 800.00,
    sessionId: generator.generateSessionId()
  };
  
  console.log('📋 Merchant Data:', merchantData);
  console.log('💰 Payment Data:', paymentData);
  console.log('');
  
  // Validar datos
  const validation = generator.validatePaymentData(merchantData, paymentData);
  console.log('✅ Validation:', validation);
  
  if (!validation.isValid) {
    console.error('❌ Validation failed:', validation.errors);
    return;
  }
  
  // Generar QR TLV
  const tlvData = generator.generateEMVQR(merchantData, paymentData);
  console.log('🔗 Generated TLV:', tlvData);
  console.log('');
  
  // Parsear QR
  const parsed = parser.parseEMVQR(tlvData);
  console.log('📖 Parsed QR:', JSON.stringify(parsed, null, 2));
  console.log('');
  
  // Verificar interoperabilidad
  console.log('🌐 Interoperability Check:');
  console.log('✅ EMVCo Standard Fields:', parsed.standard);
  console.log('✅ MidatoPay Extended Fields:', parsed.crypto);
  console.log('✅ Is MidatoPay QR:', parsed.isMidatoPay);
  console.log('');
  
  // Simular escaneo por app bancaria (solo campos estándar)
  console.log('🏦 Bank App Simulation:');
  console.log('   Merchant:', parsed.standard.merchantName);
  console.log('   Amount:', parsed.standard.amount, parsed.standard.currency);
  console.log('   MCC:', parsed.standard.merchantCategoryCode);
  console.log('   AID:', parsed.standard.merchantAccountInfo?.aid);
  console.log('');
  
  // Simular escaneo por app crypto (campos extendidos)
  console.log('🔗 Crypto App Simulation:');
  if (parsed.crypto) {
    console.log('   Target Crypto:', parsed.crypto.targetCrypto);
    console.log('   Crypto Amount:', parsed.crypto.cryptoAmount);
    console.log('   Exchange Rate:', parsed.crypto.exchangeRate);
    console.log('   Merchant Wallet:', parsed.crypto.merchantWallet);
    console.log('   Session ID:', parsed.crypto.sessionId);
  }
  
  console.log('\n🎉 Test completed successfully!');
}

// Ejecutar test
testEMVQRGenerator();
