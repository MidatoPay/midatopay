# Implementación de Contratos Starknet con Starkli

## Resumen
Este documento detalla la implementación completa de contratos inteligentes en Starknet Sepolia usando `starkli`, incluyendo el despliegue de PaymentGateway y PausableERC20, y la ejecución del flujo completo de pagos ARS a Crypto.

## ¿Por qué usar Starkli?

### Problemas con Node.js/starknet.js
- **Error -32602: Invalid params**: Problemas de compatibilidad con estimación de fees
- **Error "Failed to deserialize param"**: Dificultades para pasar `ContractAddress` correctamente
- **Error "The transaction version is not supported"**: Incompatibilidades de versión entre RPC y librería

### Ventajas de Starkli
- ✅ **CLI nativo**: Herramienta oficial de Starknet
- ✅ **Manejo automático**: Gestiona automáticamente tipos de datos complejos
- ✅ **Compatibilidad**: Funciona perfectamente con todas las versiones de RPC
- ✅ **Simplicidad**: Comandos directos sin configuración compleja

## Instalación de Starkli

### Paso 1: Descargar binario para Windows
```bash
# Descargar el binario precompilado
Invoke-WebRequest -Uri "https://github.com/xJonathanLEI/starkli/releases/latest/download/starkli-x86_64-pc-windows-msvc.zip" -OutFile "starkli.zip"

# Extraer el archivo
Expand-Archive -Path "starkli.zip" -DestinationPath "starkli" -Force
```

### Paso 2: Verificar instalación
```bash
.\starkli\starkli.exe --version
# Output: 0.4.2 (77ff6b3)
```

## Configuración de Cuenta

### Paso 1: Crear keystore desde clave privada
```bash
echo "0x06daedc71dfddfe4bf48be5f540960965e46b37ffa6ef90e0f0a69581b5da083" | .\starkli\starkli.exe signer keystore from-key --private-key-stdin --password "password123" keystore.json
```

### Paso 2: Crear archivo de cuenta para dirección existente
```bash
cat > existing_account.json << 'EOF'
{
  "version": 1,
  "variant": {
    "type": "open_zeppelin",
    "version": 1,
    "public_key": "0x0623fa6030ab2cb6c0e2a3d126deb77ae9ed3b6e04915e4e53acd5ac059b2a26",
    "legacy": false
  },
  "deployment": {
    "status": "deployed",
    "class_hash": "0x5b4b537eaa2399e3aa99c4e2e0208ebd6c71bc1467938cd52c798c601e43564",
    "address": "0x0636cc3c9c85d98a40ae01bbf5af59d0462a6509ec4a30fcd0e99870efcbdd66"
  }
}
EOF
```

## Verificación de Artefactos

### Paso 1: Verificar artefactos compilados
```bash
# Verificar PaymentGateway
.\starkli\starkli.exe class-hash C:\Users\monst\midatopay\backend\starknet\target\dev\midatopay_starknet_PaymentGateway.contract_class.json
# Output: 0x0674184ffc809f038f5540cc6ebc9b09121bb254e3454ca5c0a0443688427d4f

# Verificar PausableERC20
.\starkli\starkli.exe class-hash C:\Users\monst\midatopay\starknet-token\target\dev\pausable_erc20_PausableERC20.contract_class.json
# Output: 0x06e5ae0e06989758fbe6b2c2095ebdb0351a1ee96301ba468ee0da8ffcaae70d
```

## Declaración de Contratos

### Paso 1: Declarar PaymentGateway
```bash
.\starkli\starkli.exe declare --account existing_account.json --private-key 0x06daedc71dfddfe4bf48be5f540960965e46b37ffa6ef90e0f0a69581b5da083 C:\Users\monst\midatopay\backend\starknet\target\dev\midatopay_starknet_PaymentGateway.contract_class.json
# Output: Class hash: 0x0674184ffc809f038f5540cc6ebc9b09121bb254e3454ca5c0a0443688427d4f
```

### Paso 2: Declarar PausableERC20
```bash
.\starkli\starkli.exe declare --account existing_account.json --private-key 0x06daedc71dfddfe4bf48be5f540960965e46b37ffa6ef90e0f0a69581b5da083 C:\Users\monst\midatopay\starknet-token\target\dev\pausable_erc20_PausableERC20.contract_class.json
# Output: Class hash: 0x06e5ae0e06989758fbe6b2c2095ebdb0351a1ee96301ba468ee0da8ffcaae70d
```

## Despliegue de Contratos

### Paso 1: Desplegar PaymentGateway
```bash
.\starkli\starkli.exe deploy --account existing_account.json --private-key 0x06daedc71dfddfe4bf48be5f540960965e46b37ffa6ef90e0f0a69581b5da083 0x0674184ffc809f038f5540cc6ebc9b09121bb254e3454ca5c0a0443688427d4f 0x0636cc3c9c85d98a40ae01bbf5af59d0462a6509ec4a30fcd0e99870efcbdd66
# Output: Contract deployed: 0x000c4d587ea9eb660c2e9328ca938e2d7c697a091d23d9d10328eba5fcfed749
```

### Paso 2: Desplegar PausableERC20
```bash
.\starkli\starkli.exe deploy --account existing_account.json --private-key 0x06daedc71dfddfe4bf48be5f540960965e46b37ffa6ef90e0f0a69581b5da083 0x06e5ae0e06989758fbe6b2c2095ebdb0351a1ee96301ba468ee0da8ffcaae70d 0x0636cc3c9c85d98a40ae01bbf5af59d0462a6509ec4a30fcd0e99870efcbdd66
# Output: Contract deployed: 0x046fd97134be5f07a24c1ea2b5ab7784c724cb22bcd7d40ed893fad94048fc5d
```

## Interacción con Contratos

### Paso 1: Mintear Tokens
```bash
.\starkli\starkli.exe invoke --account existing_account.json --private-key 0x06daedc71dfddfe4bf48be5f540960965e46b37ffa6ef90e0f0a69581b5da083 0x046fd97134be5f07a24c1ea2b5ab7784c724cb22bcd7d40ed893fad94048fc5d mint 0x0636cc3c9c85d98a40ae01bbf5af59d0462a6509ec4a30fcd0e99870efcbdd66 10000000 0
# Output: Invoke transaction: 0x02264b5c2a2cb2266087b1b72f15d40909079b0e5b15707423b06e1b85c085a1
```

### Paso 2: Aprobar Tokens
```bash
.\starkli\starkli.exe invoke --account existing_account.json --private-key 0x06daedc71dfddfe4bf48be5f540960965e46b37ffa6ef90e0f0a69581b5da083 0x046fd97134be5f07a24c1ea2b5ab7784c724cb22bcd7d40ed893fad94048fc5d approve 0x000c4d587ea9eb660c2e9328ca938e2d7c697a091d23d9d10328eba5fcfed749 10000000 0
# Output: Invoke transaction: 0x03eacbc491b3644821b7f32c33b180a1107c0ecdfe2e66eec091a0a1bef700c6
```

### Paso 3: Agregar Token Permitido
```bash
.\starkli\starkli.exe invoke --account existing_account.json --private-key 0x06daedc71dfddfe4bf48be5f540960965e46b37ffa6ef90e0f0a69581b5da083 0x000c4d587ea9eb660c2e9328ca938e2d7c697a091d23d9d10328eba5fcfed749 add_allowed_token 0x046fd97134be5f07a24c1ea2b5ab7784c724cb22bcd7d40ed893fad94048fc5d
# Output: Invoke transaction: 0x0702b79d3e9801b9f7fa211b3e5f5f48810f2d7ac8a66e4854b5a0f2493927ec
```

### Paso 4: Ejecutar Pago
```bash
.\starkli\starkli.exe invoke --account existing_account.json --private-key 0x06daedc71dfddfe4bf48be5f540960965e46b37ffa6ef90e0f0a69581b5da083 0x000c4d587ea9eb660c2e9328ca938e2d7c697a091d23d9d10328eba5fcfed749 pay 0x01deadbeefcafebabefeedfacec0ffee123456789abcdef123456789abcdef12 5000000 0 0x046fd97134be5f07a24c1ea2b5ab7784c724cb22bcd7d40ed893fad94048fc5d 0x1
# Output: Invoke transaction: 0x011359d8efca0b3267702a873807c772a81e4793f1f787e27dd80849bb13323c
```

## Direcciones Finales

### Contratos Desplegados
- **PaymentGateway**: `0x000c4d587ea9eb660c2e9328ca938e2d7c697a091d23d9d10328eba5fcfed749`
- **PausableERC20**: `0x046fd97134be5f07a24c1ea2b5ab7784c724cb22bcd7d40ed893fad94048fc5d`

### Transacciones de Interacción
- **Mint**: `0x02264b5c2a2cb2266087b1b72f15d40909079b0e5b15707423b06e1b85c085a1`
- **Approve**: `0x03eacbc491b3644821b7f32c33b180a1107c0ecdfe2e66eec091a0a1bef700c6`
- **Add Token**: `0x0702b79d3e9801b9f7fa211b3e5f5f48810f2d7ac8a66e4854b5a0f2493927ec`
- **Payment**: `0x011359d8efca0b3267702a873807c772a81e4793f1f787e27dd80849bb13323c`

## Verificación en Starkscan

Todas las transacciones pueden ser verificadas en:
- **Base URL**: https://sepolia.starkscan.co/tx/
- **Ejemplo**: https://sepolia.starkscan.co/tx/0x011359d8efca0b3267702a873807c772a81e4793f1f787e27dd80849bb13323c

## Flujo ARS → Crypto Completado

### Resumen del Flujo
1. **Cliente paga en ARS** (simulado)
2. **Sistema mintea tokens PST** en Starknet
3. **Tokens son aprobados** para PaymentGateway
4. **PaymentGateway procesa el pago** y transfiere tokens al merchant
5. **Transacción verificable** en Starkscan

### Beneficios Logrados
- ✅ **Transacciones reales** en Starknet Sepolia
- ✅ **Gas pagado en STRK** (no ETH)
- ✅ **Verificación pública** en block explorer
- ✅ **Flujo completo** ARS → Crypto implementado
- ✅ **Contratos desplegados** y funcionales

## Comandos Útiles

### Verificar estado de contrato
```bash
.\starkli\starkli.exe call <CONTRACT_ADDRESS> <FUNCTION_NAME>
```

### Verificar balance de tokens
```bash
.\starkli\starkli.exe call <TOKEN_ADDRESS> balance_of <ACCOUNT_ADDRESS>
```

### Verificar nombre del token
```bash
.\starkli\starkli.exe call <TOKEN_ADDRESS> name
```

## Próximos Pasos

1. **Actualizar backend** con direcciones reales de contratos
2. **Integrar flujo completo** en aplicación MidatoPay
3. **Configurar Oracle** para tasas de cambio en tiempo real
4. **Implementar monitoreo** de transacciones en frontend
5. **Testing completo** del flujo de pagos

## Lecciones Aprendidas

### Problemas Resueltos
- **Error -32602**: Resuelto usando `starkli` en lugar de `starknet.js`
- **ContractAddress vs felt252**: `starkli` maneja automáticamente la conversión
- **u256 parameters**: `starkli` acepta formato `low high` automáticamente
- **RPC compatibility**: `starkli` funciona con cualquier versión de RPC

### Mejores Prácticas
- ✅ Usar `starkli` para operaciones de desarrollo y testing
- ✅ Verificar artefactos con `class-hash` antes de declarar
- ✅ Usar direcciones hexadecimales completas
- ✅ Verificar transacciones en block explorer
- ✅ Documentar todas las direcciones y hashes

---

**Fecha de implementación**: 9 de octubre de 2025  
**Red**: Starknet Sepolia  
**Herramientas**: Starkli v0.4.2, Scarb v2.12.2  
**Estado**: ✅ Completado y verificado
