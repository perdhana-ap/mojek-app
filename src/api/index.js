// Ganti URL ini dengan URL Web App Google Apps Script Anda (jika ada yang baru)
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzUzj4XxwrVYT_g5yLFkYWxwtQIrz1JmDQD9A5Rppzt0516t0IOuT0upB4bRALg-HsmwA/exec';

// FUNGSI UNTUK MENGIRIM DATA (POST)
export const apiPost = async (path, payload) => {
  const targetUrl = `${GAS_URL}?path=${path}`;
  console.log("Menembak API (POST):", targetUrl); 

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8', 
    },
    body: JSON.stringify(payload),
    redirect: 'follow'
  });

  const text = await response.text();
  
  try {
      return JSON.parse(text);
  } catch (e) {
      return { success: false, message: "Response bukan JSON: " + text };
  }
};

// FUNGSI BARU UNTUK MENGAMBIL DATA (GET)
export const apiGet = async (path) => {
  const targetUrl = `${GAS_URL}?path=${path}`;
  console.log("Menembak API (GET):", targetUrl);

  const response = await fetch(targetUrl, {
    method: 'GET',
    redirect: 'follow'
  });

  const text = await response.text();
  
  try {
      return JSON.parse(text);
  } catch (e) {
      return { success: false, message: "Response bukan JSON: " + text };
  }
};