const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });
const { Account, RpcProvider, Contract, json, stark, CallData } = require('starknet');

// Configuración para Starknet Sepolia
const SEPOLIA_CONFIG = {
  rpcUrl: 'https://starknet-sepolia.public.blastapi.io/rpc/v0_6',
  chainId: '0x534e5f5345504f4c4941', // SN_SEPOLIA en hexadecimal
  explorerUrl: 'https://sepolia.starkscan.co'
};

// Direcciones de contratos desplegados
const CONTRACTS = {
  paymentGateway: '0x000c4d587ea9eb660c2e9328ca938e2d7c697a091d23d9d10328eba5fcfed749',
  pausableERC20: '0x046fd97134be5f07a24c1ea2b5ab7784c724cb22bcd7d40ed893fad94048fc5d',
  account: '0x0636cc3c9c85d98a40ae01bbf5af59d0462a6509ec4a30fcd0e99870efcbdd66',
  merchant: '0x01deadbeefcafebabefeedfacec0ffee123456789abcdef123456789abcdef12'
};

class ContractInteractor {
  constructor() {
    this.provider = new RpcProvider({ 
      nodeUrl: SEPOLIA_CONFIG.rpcUrl,
      chainId: SEPOLIA_CONFIG.chainId
    });
    
    const privateKey = process.env.STARKNET_PRIVATE_KEY;
    const accountAddress = process.env.STARKNET_ACCOUNT_ADDRESS;

    if (!privateKey || !accountAddress) {
      throw new Error('STARKNET_PRIVATE_KEY y STARKNET_ACCOUNT_ADDRESS son requeridos');
    }

    this.account = new Account(this.provider, accountAddress, privateKey);
    console.log(`✅ Cuenta configurada: ${accountAddress}`);
  }

  // Mintear tokens en PausableERC20
  async mintTokens(recipient, amount) {
    console.log(`🪙 Minteando ${amount} tokens a ${recipient.substring(0, 10)}...`);

    try {
      const invocation = {
        contractAddress: CONTRACTS.pausableERC20,
        entrypoint: 'mint',
        calldata: CallData.compile([recipient, amount, 0])
      };
      
      const result = await this.account.execute([invocation]);
      await this.provider.waitForTransaction(result.transaction_hash);
      
      console.log(`✅ Tokens minteados: ${SEPOLIA_CONFIG.explorerUrl}/tx/${result.transaction_hash}`);
      return result.transaction_hash;
    } catch (error) {
      console.error('❌ Error minteando tokens:', error);
      throw error;
    }
  }

  // Aprobar tokens para PaymentGateway
  async approveTokens(spender, amount) {
    console.log(`✅ Aprobando ${amount} tokens para ${spender.substring(0, 10)}...`);

    try {
      const invocation = {
        contractAddress: CONTRACTS.pausableERC20,
        entrypoint: 'approve',
        calldata: CallData.compile([spender, amount, 0])
      };
      
      const result = await this.account.execute([invocation]);
      await this.provider.waitForTransaction(result.transaction_hash);
      
      console.log(`✅ Tokens aprobados: ${SEPOLIA_CONFIG.explorerUrl}/tx/${result.transaction_hash}`);
      return result.transaction_hash;
    } catch (error) {
      console.error('❌ Error aprobando tokens:', error);
      throw error;
    }
  }

  // Agregar token permitido en PaymentGateway
  async addAllowedToken(tokenAddress) {
    console.log(`📝 Agregando token permitido: ${tokenAddress.substring(0, 10)}...`);

    try {
      const invocation = {
        contractAddress: CONTRACTS.paymentGateway,
        entrypoint: 'add_allowed_token',
        calldata: CallData.compile([tokenAddress])
      };
      
      const result = await this.account.execute([invocation]);
      await this.provider.waitForTransaction(result.transaction_hash);
      
      console.log(`✅ Token agregado: ${SEPOLIA_CONFIG.explorerUrl}/tx/${result.transaction_hash}`);
      return result.transaction_hash;
    } catch (error) {
      console.error('❌ Error agregando token:', error);
      throw error;
    }
  }

  // Ejecutar pago en PaymentGateway
  async executePayment(merchantAddress, amount, tokenAddress, paymentId) {
    console.log(`💸 Ejecutando pago de ${amount} tokens...`);

    try {
      const invocation = {
        contractAddress: CONTRACTS.paymentGateway,
        entrypoint: 'pay',
        calldata: CallData.compile([merchantAddress, amount, 0, tokenAddress, paymentId])
      };
      
      const result = await this.account.execute([invocation]);
      await this.provider.waitForTransaction(result.transaction_hash);
      
      console.log(`✅ Pago ejecutado: ${SEPOLIA_CONFIG.explorerUrl}/tx/${result.transaction_hash}`);
      return result.transaction_hash;
    } catch (error) {
      console.error('❌ Error ejecutando pago:', error);
      throw error;
    }
  }

  // Ejecutar todos los pasos
  async executeAllSteps() {
    try {
      console.log('🚀 Iniciando interacción completa con contratos...\n');

      // Paso 1: Mint tokens
      console.log('📋 Paso 1: Mintear tokens');
      const mintTx = await this.mintTokens(CONTRACTS.account, 10000000);
      console.log(`   TX: ${mintTx}\n`);

      // Paso 2: Approve tokens
      console.log('📋 Paso 2: Aprobar tokens');
      const approveTx = await this.approveTokens(CONTRACTS.paymentGateway, 10000000);
      console.log(`   TX: ${approveTx}\n`);

      // Paso 3: Add allowed token
      console.log('📋 Paso 3: Agregar token permitido');
      const addTokenTx = await this.addAllowedToken(CONTRACTS.pausableERC20);
      console.log(`   TX: ${addTokenTx}\n`);

      // Paso 4: Execute payment
      console.log('📋 Paso 4: Ejecutar pago');
      const paymentTx = await this.executePayment(
        CONTRACTS.merchant,
        5000000,
        CONTRACTS.pausableERC20,
        '0x1'
      );
      console.log(`   TX: ${paymentTx}\n`);

      console.log('🎉 ¡Todos los pasos completados exitosamente!');
      console.log('\n📋 Resumen de transacciones:');
      console.log(`   Mint: ${SEPOLIA_CONFIG.explorerUrl}/tx/${mintTx}`);
      console.log(`   Approve: ${SEPOLIA_CONFIG.explorerUrl}/tx/${approveTx}`);
      console.log(`   Add Token: ${SEPOLIA_CONFIG.explorerUrl}/tx/${addTokenTx}`);
      console.log(`   Payment: ${SEPOLIA_CONFIG.explorerUrl}/tx/${paymentTx}`);

      return {
        mintTx,
        approveTx,
        addTokenTx,
        paymentTx
      };
    } catch (error) {
      console.error('\n❌ Error en interacción:', error);
      throw error;
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  (async () => {
    const interactor = new ContractInteractor();
    const result = await interactor.executeAllSteps();
    console.log('\n✅ Interacción finalizada:', result);
  })().catch(error => {
    console.error('\n❌ Interacción falló:', error);
    process.exitCode = 1;
  });
}

module.exports = { ContractInteractor, CONTRACTS };
