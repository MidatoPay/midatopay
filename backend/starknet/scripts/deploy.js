const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });
const { Account, RpcProvider, Contract, json, stark, CallData } = require('starknet');
const fs = require('fs');

// Configuración para Starknet Sepolia
const SEPOLIA_CONFIG = {
  rpcUrl: 'https://starknet-sepolia.public.blastapi.io/rpc/v0_6',
  chainId: 'SN_SEPOLIA',
  explorerUrl: 'https://sepolia.starkscan.co'
};

class StarknetDeployer {
  constructor() {
    this.provider = new RpcProvider({ 
      nodeUrl: SEPOLIA_CONFIG.rpcUrl,
      blockIdentifier: 'latest'
    });
    this.deployedContracts = {};
  }

  // Configurar cuenta desde variables de entorno
  setupAccount() {
    const privateKey = process.env.STARKNET_PRIVATE_KEY;
    const accountAddress = process.env.STARKNET_ACCOUNT_ADDRESS;

    if (!privateKey || !accountAddress) {
      throw new Error('STARKNET_PRIVATE_KEY y STARKNET_ACCOUNT_ADDRESS son requeridos');
    }

    // Intentar con STRK como fee token
    this.account = new Account(this.provider, accountAddress, privateKey);
    console.log(`✅ Cuenta configurada: ${accountAddress}`);
    console.log(`💰 Intentando usar STRK para gas fees...`);
  }

  // Detectar ruta de Scarb automáticamente
  getScarbPath() {
    // 1. Verificar variable de entorno SCARB_PATH
    if (process.env.SCARB_PATH) {
      console.log(`🔧 Usando SCARB_PATH: ${process.env.SCARB_PATH}`);
      return process.env.SCARB_PATH;
    }

    // 2. Detectar sistema operativo y usar ruta por defecto
    const os = require('os');
    const platform = os.platform();

    if (platform === 'win32') {
      // Windows: usar ruta por defecto o buscar en PATH
      const defaultPath = 'C:\\Users\\monst\\Downloads\\scarb-v2.12.2-x86_64-pc-windows-msvc\\scarb-v2.12.2-x86_64-pc-windows-msvc\\bin\\scarb.exe';
      console.log(`🔧 Windows detectado, usando: ${defaultPath}`);
      return defaultPath;
    } else if (platform === 'darwin') {
      // macOS: buscar en ubicaciones comunes
      console.log(`🔧 macOS detectado, usando: scarb`);
      return 'scarb';
    } else if (platform === 'linux') {
      // Linux: buscar en PATH
      console.log(`🔧 Linux detectado, usando: scarb`);
      return 'scarb';
    } else {
      // Sistema desconocido: intentar con 'scarb'
      console.log(`🔧 Sistema desconocido (${platform}), usando: scarb`);
      return 'scarb';
    }
  }

  // Compilar contrato (requiere scarb)
  async compileContract(contractName) {
    console.log(`🔨 Compilando contrato: ${contractName}`);
    
    const { exec } = require('child_process');
    
    // Detectar ruta de Scarb automáticamente
    const scarbPath = this.getScarbPath();
    
    return new Promise((resolve, reject) => {
      exec(`"${scarbPath}" build`, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
        if (error) {
          console.error('Error compilando:', stderr);
          reject(error);
        } else {
          console.log('✅ Compilación exitosa');
          resolve(stdout);
        }
      });
    });
  }

  // Compilar PausableERC20 desde su directorio específico
  async compilePausableERC20() {
    console.log(`🔨 Compilando PausableERC20 desde starknet-token`);
    
    const { exec } = require('child_process');
    
    // Detectar ruta de Scarb automáticamente
    const scarbPath = this.getScarbPath();
    
    return new Promise((resolve, reject) => {
      exec(`"${scarbPath}" build`, { cwd: path.join(__dirname, '../../../starknet-token') }, (error, stdout, stderr) => {
        if (error) {
          console.error('Error compilando PausableERC20:', stderr);
          reject(error);
        } else {
          console.log('✅ Compilación PausableERC20 exitosa');
          resolve(stdout);
        }
      });
    });
  }

  // Leer archivos compilados (Sierra + CASM)
  readCompiledContract(contractName) {
    const targetDir = path.join(__dirname, '..', 'target', 'dev');
    
    const sierraPath = path.join(targetDir, `midatopay_starknet_${contractName}.contract_class.json`);
    const casmPath = path.join(targetDir, `midatopay_starknet_${contractName}.compiled_contract_class.json`);

    if (!fs.existsSync(sierraPath) || !fs.existsSync(casmPath)) {
      throw new Error(`Archivos compilados no encontrados para ${contractName}`);
    }

    const sierra = json.parse(fs.readFileSync(sierraPath, 'utf8'));
    const casm = json.parse(fs.readFileSync(casmPath, 'utf8'));

    console.log(`📁 Leyendo artefactos: Sierra + CASM para ${contractName}`);
    return { sierra, casm };
  }

  // Leer archivos compilados de PausableERC20 (Sierra + CASM)
  readCompiledPausableERC20() {
    const targetDir = path.join(__dirname, '../../../starknet-token/target/dev');
    
    const sierraPath = path.join(targetDir, `pausable_erc20_PausableERC20.contract_class.json`);
    const casmPath = path.join(targetDir, `pausable_erc20_PausableERC20.compiled_contract_class.json`);

    if (!fs.existsSync(sierraPath) || !fs.existsSync(casmPath)) {
      throw new Error(`Archivos compilados no encontrados para PausableERC20`);
    }

    const sierra = json.parse(fs.readFileSync(sierraPath, 'utf8'));
    const casm = json.parse(fs.readFileSync(casmPath, 'utf8'));

    console.log(`📁 Leyendo artefactos: Sierra + CASM para PausableERC20`);
    return { sierra, casm };
  }

  // Declarar contrato
  async declareContract(contractName) {
    console.log(`📋 Declarando contrato: ${contractName}`);

    const { sierra, casm } = this.readCompiledContract(contractName);

    try {
      // Usar declare con maxFee explícito para evitar problemas de estimación
      const declareResponse = await this.account.declare({
        contract: sierra,
        casm: casm
      }, {
        maxFee: '1000000000000000000', // 1 ETH en wei
        skipValidate: true
      });

      await this.provider.waitForTransaction(declareResponse.transaction_hash);
      
      console.log(`✅ Contrato declarado: ${declareResponse.class_hash}`);
      console.log(`🔗 TX: ${SEPOLIA_CONFIG.explorerUrl}/tx/${declareResponse.transaction_hash}`);

      return declareResponse.class_hash;
    } catch (error) {
      console.error('❌ Error declarando contrato:', error);
      throw error;
    }
  }

  // Declarar PausableERC20
  async declarePausableERC20() {
    console.log(`📋 Declarando PausableERC20`);

    const { sierra, casm } = this.readCompiledPausableERC20();

    try {
      // Usar declare con maxFee explícito para evitar problemas de estimación
      const declareResponse = await this.account.declare({
        contract: sierra,
        casm: casm
      }, {
        maxFee: '1000000000000000000', // 1 ETH en wei
        skipValidate: true
      });

      await this.provider.waitForTransaction(declareResponse.transaction_hash);
      
      console.log(`✅ PausableERC20 declarado: ${declareResponse.class_hash}`);
      console.log(`🔗 TX: ${SEPOLIA_CONFIG.explorerUrl}/tx/${declareResponse.transaction_hash}`);

      return declareResponse.class_hash;
    } catch (error) {
      console.error('❌ Error declarando PausableERC20:', error);
      throw error;
    }
  }

  // Desplegar PaymentGateway
  async deployPaymentGateway(classHash) {
    console.log('🚀 Desplegando PaymentGateway...');

    const ownerAddress = this.account.address;
    const constructorCalldata = CallData.compile([ownerAddress]);

    try {
      const deployResponse = await this.account.deployContract({
        classHash,
        constructorCalldata
      });

      await this.provider.waitForTransaction(deployResponse.transaction_hash);

      const contractAddress = deployResponse.contract_address;
      
      console.log(`✅ PaymentGateway desplegado: ${contractAddress}`);
      console.log(`🔗 TX: ${SEPOLIA_CONFIG.explorerUrl}/tx/${deployResponse.transaction_hash}`);
      console.log(`🔗 Contrato: ${SEPOLIA_CONFIG.explorerUrl}/contract/${contractAddress}`);

      this.deployedContracts.paymentGateway = contractAddress;
      return contractAddress;
    } catch (error) {
      console.error('❌ Error desplegando PaymentGateway:', error);
      throw error;
    }
  }

  // Desplegar PausableERC20
  async deployPausableERC20(classHash) {
    console.log('🚀 Desplegando PausableERC20...');

    const adminAddress = this.account.address;
    const constructorCalldata = CallData.compile([adminAddress]);

    try {
      const deployResponse = await this.account.deployContract({
        classHash,
        constructorCalldata
      });

      await this.provider.waitForTransaction(deployResponse.transaction_hash);

      const contractAddress = deployResponse.contract_address;
      
      console.log(`✅ PausableERC20 desplegado: ${contractAddress}`);
      console.log(`🔗 TX: ${SEPOLIA_CONFIG.explorerUrl}/tx/${deployResponse.transaction_hash}`);
      console.log(`🔗 Contrato: ${SEPOLIA_CONFIG.explorerUrl}/contract/${contractAddress}`);

      this.deployedContracts.pausableERC20 = contractAddress;
      return contractAddress;
    } catch (error) {
      console.error('❌ Error desplegando PausableERC20:', error);
      throw error;
    }
  }

  // Verificar despliegue
  async verifyDeployment(contractAddress) {
    console.log('🔍 Verificando despliegue...');

    try {
      const { sierra } = this.readCompiledContract('PaymentGateway');
      const contract = new Contract(sierra.abi, contractAddress, this.provider);
      contract.connect(this.account);

      // Verificar que el admin sea correcto
      const admin = await contract.get_admin();
      
      if (BigInt(admin) === BigInt(this.account.address)) {
        console.log('✅ Verificación exitosa - Admin correcto');
        return contract;
      } else {
        console.error('❌ Verificación fallida - Admin incorrecto');
        return false;
      }
    } catch (error) {
      console.error('❌ Error verificando despliegue:', error);
      return false;
    }
  }

  // Verificar despliegue PausableERC20
  async verifyPausableERC20Deployment(contractAddress) {
    console.log('🔍 Verificando despliegue PausableERC20...');

    try {
      const { sierra } = this.readCompiledPausableERC20();
      const contract = new Contract(sierra.abi, contractAddress, this.provider);
      contract.connect(this.account);

      // Verificar que el admin sea correcto (PausableERC20 usa admin como parámetro del constructor)
      const admin = await contract.get_admin();
      
      if (BigInt(admin) === BigInt(this.account.address)) {
        console.log('✅ Verificación PausableERC20 exitosa - Admin correcto');
        return contract;
      } else {
        console.error('❌ Verificación PausableERC20 fallida - Admin incorrecto');
        return false;
      }
    } catch (error) {
      console.error('❌ Error verificando despliegue PausableERC20:', error);
      return false;
    }
  }

  // Configurar tokens permitidos
  async setupAllowedTokens(contract) {
    console.log('🪙 Configurando tokens permitidos...');

    // Usar el PausableERC20 desplegado como token permitido
    const allowedTokens = [
      this.deployedContracts.pausableERC20 || '0x0000000000000000000000000000000000000000000000000000000000000000' // PausableERC20
    ];

    try {
      for (const tokenAddress of allowedTokens) {
        console.log(`📝 Agregando token: ${tokenAddress.substring(0, 10)}...`);
        
        const invocation = {
          contractAddress: contract.address,
          entrypoint: 'add_allowed_token',
          calldata: CallData.compile([tokenAddress])
        };
        const result = await this.account.execute([invocation]);
        
        await this.provider.waitForTransaction(result.transaction_hash);
        console.log(`✅ Token agregado: ${result.transaction_hash}`);
      }

      console.log('🎉 Todos los tokens configurados exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error configurando tokens:', error);
      return false;
    }
  }


  // Guardar configuración de despliegue
  saveDeploymentConfig() {
    const config = {
      network: 'sepolia',
      timestamp: new Date().toISOString(),
      deployer: this.account.address,
      contracts: this.deployedContracts,
      rpcUrl: SEPOLIA_CONFIG.rpcUrl,
      explorerUrl: SEPOLIA_CONFIG.explorerUrl
    };

    const configPath = path.join(__dirname, '..', 'deployment.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log(`💾 Configuración guardada en: ${configPath}`);
    return config;
  }

  // Generar .env.example
  generateEnvExample() {
    const envExample = `# Starknet Configuration for Sepolia Testnet

# Account Configuration (Deploy & Backend)
STARKNET_PRIVATE_KEY=your_private_key_here
STARKNET_ACCOUNT_ADDRESS=your_account_address_here

# Contract Addresses
STARKNET_PAYMENT_GATEWAY_ADDRESS=${this.deployedContracts.paymentGateway || 'contract_address_after_deployment'}
STARKNET_PAUSABLE_ERC20_ADDRESS=${this.deployedContracts.pausableERC20 || 'token_address_after_deployment'}
STARKNET_USDT_ADDRESS=0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8
STARKNET_STRK_ADDRESS=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d

# Network Configuration
STARKNET_RPC_URL=https://starknet-sepolia.public.blastapi.io/rpc/v0_9
STARKNET_CHAIN_ID=SN_SEPOLIA

# Frontend Environment Variables (add NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_STARKNET_GATEWAY_ADDRESS=${this.deployedContracts.paymentGateway || 'contract_address_after_deployment'}
NEXT_PUBLIC_STARKNET_PAUSABLE_ERC20_ADDRESS=${this.deployedContracts.pausableERC20 || 'token_address_after_deployment'}
NEXT_PUBLIC_STARKNET_USDT_ADDRESS=0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8
NEXT_PUBLIC_STARKNET_STRK_ADDRESS=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
NEXT_PUBLIC_STARKNET_RPC_URL=https://starknet-sepolia.public.blastapi.io/rpc/v0_6

# Scarb Configuration (optional - auto-detected if not set)
# SCARB_PATH=C:\\path\\to\\scarb.exe  # Windows
# SCARB_PATH=/usr/local/bin/scarb     # macOS/Linux
`;

    fs.writeFileSync(path.join(__dirname, '..', '..', '.env.starknet.example'), envExample);
    console.log('📝 Archivo .env.starknet.example generado');
  }

  // Proceso completo de despliegue
  async deployAll() {
    try {
      console.log('🚀 Iniciando despliegue completo en Starknet Sepolia...\n');

      // 1. Configurar cuenta
      this.setupAccount();

      // 2. Compilar contratos
      await this.compileContract('PaymentGateway');
      await this.compilePausableERC20();

      // 3. Declarar contratos
      const gatewayClassHash = await this.declareContract('PaymentGateway');
      const tokenClassHash = await this.declarePausableERC20();

      // 4. Desplegar contratos
      const gatewayAddress = await this.deployPaymentGateway(gatewayClassHash);
      const tokenAddress = await this.deployPausableERC20(tokenClassHash);

      // 5. Verificar despliegues y obtener contratos
      const gatewayContract = await this.verifyDeployment(gatewayAddress);
      const tokenContract = await this.verifyPausableERC20Deployment(tokenAddress);
      
      if (!gatewayContract || !tokenContract) {
        throw new Error('Verificación de despliegue falló');
      }

      // 6. Configurar tokens permitidos
      const tokensConfigured = await this.setupAllowedTokens(gatewayContract);
      
      if (!tokensConfigured) {
        console.warn('⚠️ Algunos tokens no se pudieron configurar');
      }

      // 7. Guardar configuración
      const config = this.saveDeploymentConfig();

      // 8. Generar .env.example
      this.generateEnvExample();

      console.log('\n🎉 ¡Despliegue completado exitosamente!');
      console.log('\n📋 Resumen:');
      console.log(`   PaymentGateway: ${gatewayAddress}`);
      console.log(`   PausableERC20: ${tokenAddress}`);
      console.log(`   Explorer Gateway: ${SEPOLIA_CONFIG.explorerUrl}/contract/${gatewayAddress}`);
      console.log(`   Explorer Token: ${SEPOLIA_CONFIG.explorerUrl}/contract/${tokenAddress}`);
      console.log(`   Network: Starknet Sepolia`);
      console.log('\n📝 Próximos pasos:');
      console.log('   1. Copiar las variables de entorno desde .env.starknet.example');
      console.log('   2. Obtener tokens de prueba del faucet de Sepolia');
      console.log('   3. Configurar el backend con las nuevas direcciones');
      console.log('   4. Ejecutar manualmente las funciones según README:');
      console.log('      - mint(recipient, amount) en PausableERC20');
      console.log('      - approve(spender, amount) en PausableERC20');
      console.log('      - pay(merchant_address, amount, token_address, payment_id) en PaymentGateway');

      return config;
    } catch (error) {
      console.error('\n❌ Error en despliegue:', error);
      throw error;
    }
  }
}

// Funciones de utilidad para testing
async function fundAccountWithFaucet(accountAddress) {
  console.log('\n💧 Para obtener ETH y tokens de prueba:');
  console.log(`1. Sepolia ETH Faucet: https://starknet-faucet.vercel.app/`);
  console.log(`2. Ingresa tu dirección: ${accountAddress}`);
  console.log('3. USDT de prueba: usar bridge de tokens de Goerli/Sepolia');
  console.log('4. Verificar balance antes de hacer transacciones');
}

async function deployToMainnet() {
  console.log('\n🚨 MIGRACIÓN A MAINNET:');
  console.log('1. Cambiar RPC_URL a mainnet');
  console.log('2. Usar cuenta con ETH real');
  console.log('3. Actualizar direcciones de tokens reales');
  console.log('4. Verificar todas las configuraciones de seguridad');
  console.log('5. Hacer testing exhaustivo en testnet primero');
}

// Exportar para uso programático
module.exports = {
  StarknetDeployer,
  SEPOLIA_CONFIG,
  fundAccountWithFaucet,
  deployToMainnet
};

// Ejecutar si se llama directamente
if (require.main === module) {
  (async () => {
    const deployer = new StarknetDeployer();
    const config = await deployer.deployAll();
    console.log('\n✅ Despliegue finalizado:', config);
  })().catch(error => {
    console.error('\n❌ Despliegue falló:', error);
    process.exitCode = 1; // en lugar de exit(1) para evitar cortar stdout bruscamente
  });
}