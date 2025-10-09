const qrData = 'sess_1759617104852_09e77dc46908';
const regex = /sess_(\d+)_([a-f0-9]+)(?=[A-Z]|$)/i;
const match = qrData.match(regex);

console.log('QR Data:', qrData);
console.log('Regex:', regex);
console.log('Match:', match);

if (match) {
  console.log('Full Match:', match[0]);
  console.log('Timestamp:', match[1]);
  console.log('Hash:', match[2]);
} else {
  console.log('No match found');
}

// Probar con el QR completo
const fullQR = '00020101021126510008A00000070135MIDATOPAY_cmflvr5ju00012o02poaq7lxa52046012530303254075000.005802AR5915Café del Barrio6012BUENOS AIRES6437temp_wallet_cmflvr5ju00012o02poaq7lxa6504USDT66083.31043667071510.386827sess_1759617104852_09e77dc46908ARS_ONLYF0D9';
const fullMatch = fullQR.match(regex);

console.log('\n--- QR COMPLETO ---');
console.log('Full QR Match:', fullMatch);
if (fullMatch) {
  console.log('Full Match:', fullMatch[0]);
  console.log('Timestamp:', fullMatch[1]);
  console.log('Hash:', fullMatch[2]);
} else {
  console.log('No match found in full QR');
}
