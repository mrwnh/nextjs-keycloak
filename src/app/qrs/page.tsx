'use client';
   
import { useState } from 'react';

export default function AdminPage() {
  const [message, setMessage] = useState('');

  const regenerateQRCodes = async () => {
    setMessage('Regenerating QR codes...');
    try {
      const response = await fetch('/api/create-qrs', { method: 'POST' });
      const data = await response.json();
      setMessage(data.message || 'QR codes updated successfully');
    } catch (error) {
      setMessage('Error updating QR codes');
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={regenerateQRCodes}>Regenerate All QR Codes</button>
      {message && <p>{message}</p>}
    </div>
  );
}