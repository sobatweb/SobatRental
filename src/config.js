// src/config.js
export const GAS_URL = 'https://script.google.com/macros/s/AKfycbwJwx8Qa3vrrLsXN90NY0oAHN4mvSXA0oFV0BHRSgOhu-c9DiDey_I74WEB4-3VbcVd4A/exec';

// Custom fetcher untuk menghindari masalah CORS preflight dengan menggunakan text/plain
export const postData = async (payload) => {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
  return res.json();
};