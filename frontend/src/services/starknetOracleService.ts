// Servicio para interactuar con contratos Starknet desplegados
import { Account, RpcProvider, Contract, CallData } from 'starknet';

// Configuración de contratos desplegados
const CONTRACTS = {
  oracle: '0x0288338f6ffeccff8d74780f2758cf031605cd38c867da249006982ca9b53692',
  usdtToken: '0x040898923d06af282d4a647966fc65c0f308020c43388026b56ef833eda0efdc'
};

// Configuración de Sepolia
const SEPOLIA_CONFIG = {
  rpcUrl: 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_9/b6oJemkCmlgEGq1lXC5uTXwOHZA14WNP',
  chainId: '0x534e5f5345504f4c4941' // SN_SEPOLIA
};

// ABI mínimo para Oracle
const ORACLE_ABI = [
  {
    name: 'quote_ars_to_usdt',
    type: 'function',
    inputs: [
      {
        name: 'amount_ars',
        type: 'core::integer::u128'
      }
    ],
    outputs: [
      {
        type: 'core::integer::u128'
      }
    ],
    stateMutability: 'view'
  }
];

// ABI mínimo para ERC20 (USDT Token)
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [
      { name: 'account', type: 'core::starknet::contract_address::ContractAddress' }
    ],
    outputs: [
      { type: 'core::integer::u256' }
    ],
    stateMutability: 'view'
  }
];

export class StarknetOracleService {
  private provider: RpcProvider;
  private oracleContract: Contract;
  private usdtContract: Contract;

  constructor() {
    this.provider = new RpcProvider({ 
      nodeUrl: SEPOLIA_CONFIG.rpcUrl,
      chainId: SEPOLIA_CONFIG.chainId as any
    });
    this.oracleContract = new Contract(ORACLE_ABI, CONTRACTS.oracle, this.provider);
    this.usdtContract = new Contract(ERC20_ABI, CONTRACTS.usdtToken, this.provider);
  }

  // Llamada RPC directa al Oracle (sin block_id específico)
  private async callOracleDirect(functionName: string, calldata: any[]): Promise<any> {
    const selector = this.getFunctionSelector(functionName);
    
    const response = await fetch(SEPOLIA_CONFIG.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'starknet_call',
        params: [
          {
            contract_address: CONTRACTS.oracle,
            entry_point_selector: selector,
            calldata: calldata.map(val => val.toString())
          },
          'latest'
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`RPC Error: ${data.error.message}`);
    }
    
    return data.result;
  }

  // Llamada RPC directa al USDT Token (sin block_id específico)
  private async callUSDTDirect(functionName: string, calldata: any[]): Promise<any> {
    const selector = this.getUSDTFunctionSelector(functionName);
    
    const response = await fetch(SEPOLIA_CONFIG.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'starknet_call',
        params: [
          {
            contract_address: CONTRACTS.usdtToken,
            entry_point_selector: selector,
            calldata: calldata.map(val => val.toString())
          },
          'latest'
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`RPC Error: ${data.error.message}`);
    }
    
    return data.result;
  }

  // Obtener selector de función Oracle
  private getFunctionSelector(functionName: string): string {
    const selectors: { [key: string]: string } = {
      'quote_ars_to_usdt': '0x35cc48151d07616d346a3d1d328772a9944e6564a7dca5339beb8915634d309'
    };
    return selectors[functionName] || '0x0';
  }

  // Obtener selector de función USDT
  private getUSDTFunctionSelector(functionName: string): string {
    const selectors: { [key: string]: string } = {
      'balanceOf': '0x2e4263afad30923c891518314c3c95dbe830a16874e8a5761d37084e37954567'
    };
    return selectors[functionName] || '0x0';
  }

  // Obtener cotización ARS a USDT desde el Oracle
  async getARSToUSDTQuote(amountARS: number): Promise<{
    amountARS: number;
    amountUSDT: number;
    rate: number;
    source: string;
  } | null> {
    try {
      console.log('🔍 Consultando Oracle para:', amountARS, 'ARS');
      
      // Convertir ARS a u128 con escala de 6 decimales (SCALE = 1_000_000)
      const amountARSWei = BigInt(Math.floor(amountARS * 1000000));
      
      // Llamar al Oracle usando RPC directo (sin block_id específico)
      const result = await this.callOracleDirect('quote_ars_to_usdt', [amountARSWei]);
      
      // Convertir resultado de u128 a número (dividir por escala de 6 decimales)
      const amountUSDTWei = Array.isArray(result) ? result[0] : result;
      const amountUSDT = Number(amountUSDTWei) / 1000000;
      
      // Calcular rate
      const rate = amountARS / amountUSDT;
      
      console.log('✅ Oracle response:', {
        amountARS,
        amountUSDT,
        rate,
        amountARSWei: amountARSWei.toString(),
        amountUSDTWei: amountUSDTWei.toString()
      });

      return {
        amountARS,
        amountUSDT,
        rate,
        source: 'Oracle Blockchain'
      };

    } catch (error) {
      console.error('❌ Error consultando Oracle:', error);
      return null;
    }
  }

  // Obtener balance USDT de una dirección
  async getUSDTBalance(accountAddress: string): Promise<{
    balance: number;
    balanceWei: string;
    address: string;
  } | null> {
    try {
      console.log('🔍 Consultando balance USDT para:', accountAddress);
      
      // Llamar al contrato USDT usando RPC directo (sin block_id específico)
      const result = await this.callUSDTDirect('balanceOf', [accountAddress]);
      
      // Convertir resultado de u256 a número (dividir por escala de 6 decimales)
      const balanceWei = Array.isArray(result) ? result[0] : result;
      const balance = Number(balanceWei) / 1000000;
      
      console.log('✅ USDT Balance response:', {
        address: accountAddress,
        balance,
        balanceWei: balanceWei.toString()
      });

      return {
        balance,
        balanceWei: balanceWei.toString(),
        address: accountAddress
      };

    } catch (error) {
      console.error('❌ Error consultando balance USDT:', error);
      return null;
    }
  }

  // Obtener información completa del Oracle
  async getOracleInfo(): Promise<{
    address: string;
    isActive: boolean;
    rate: number;
  } | null> {
    try {
      console.log('🔍 Obteniendo información del Oracle...');
      
      // Probar con una cotización pequeña para verificar que está activo
      const testQuote = await this.getARSToUSDTQuote(1);
      
      if (!testQuote) {
        return null;
      }

      return {
        address: CONTRACTS.oracle,
        isActive: true,
        rate: testQuote.rate
      };

    } catch (error) {
      console.error('❌ Error obteniendo información del Oracle:', error);
      return null;
    }
  }

  // Obtener información completa del token USDT
  async getUSDTTokenInfo(): Promise<{
    address: string;
    symbol: string;
    decimals: number;
  } | null> {
    try {
      console.log('🔍 Obteniendo información del token USDT...');
      
      return {
        address: CONTRACTS.usdtToken,
        symbol: 'USDT',
        decimals: 18
      };

    } catch (error) {
      console.error('❌ Error obteniendo información del token USDT:', error);
      return null;
    }
  }
}

// Instancia singleton
export const starknetOracleService = new StarknetOracleService();
