import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = '636796df44d8accb3ad28d29d3f049d1522529d36275b5bd2d8d95062a622963';
const encryptedText = 'U2FsdGVkX1/ii1CPam4itkU44YedycYt+cdrXcEXNjoCLUpuRSei6sz9XThLW5Hjq/pgZOBQq7j+dLziPyB/uw==';

const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
const decrypted = bytes.toString(CryptoJS.enc.Utf8);

console.log('Decrypted Company ID:', decrypted);