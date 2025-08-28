export async function POST(req) {
  const data = await req.json(); // รับข้อมูลจาก SliderCaptcha
  console.log('Received captcha data:', data);

  // ตัวอย่างตรวจสอบ captcha แบบง่าย
  // ปกติคุณจะเช็คกับ server หรือ session ของคุณ
  const isValid = data.sliderPosition === data.expectedPosition; 

  return new Response(JSON.stringify({ success: isValid }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
