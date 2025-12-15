import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { decrypt } from '../../utils/encryption';

const TestDecrypt = () => {
  const { encryptedId } = useParams<{ encryptedId: string }>();

  console.log('TestDecrypt component rendered, encryptedId:', encryptedId);

  useEffect(() => {
    console.log('ENCRYPTION_KEY in client:', process.env.ENCRYPTION_KEY);
    if (encryptedId) {
      try {
        const decryptedId = decrypt(encryptedId);
        console.log('Decrypted Company ID:', decryptedId);
      } catch (error) {
        console.error('Decryption failed:', error);
      }
    }
  }, [encryptedId]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Decryption Test</h2>
      <p>Check the browser console for the ENCRYPTION_KEY and decrypted company ID.</p>
      <p>Encrypted ID: {encryptedId}</p>
    </div>
  );
};

export default TestDecrypt;