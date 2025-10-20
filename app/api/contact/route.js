import nodemailer from 'nodemailer'

export async function POST(request) {
  try {
    const data = await request.json()
    if (!data.fullName || !data.phone || !data.product) {
      return new Response(JSON.stringify({ success: false, error: 'ข้อมูลไม่ครบถ้วน' }), { status: 400 })
    }

    // ตรวจสอบ reCAPTCHA
    if (!data.captcha) {
      return new Response(JSON.stringify({ success: false, error: 'Missing reCAPTCHA token' }), { status: 400 })
    }

    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${data.captcha}`,
    })

    const captchaData = await verifyRes.json()
    if (!captchaData.success) {
      return new Response(JSON.stringify({ success: false, error: 'reCAPTCHA verification failed' }), { status: 400 })
    }

    // ✅ ส่งอีเมล
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const mailOptions = {
      from: `"Saksiam Solar Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: ` แบบฟอร์มติดต่อจาก ${data.fullName}`,
      html: `
        <h2>รายละเอียดผู้ติดต่อ</h2>
        <p><b>ชื่อ:</b> ${data.fullName}</p>
        <p><b>โทรศัพท์:</b> ${data.phone}</p>
        <p><b>สินค้า/บริการ:</b> ${data.product}</p>
        <p><b>แพ็คเกจ:</b> ${data.package}</p>
        <p><b>ช่วงเวลาใช้ไฟ:</b> ${data.usageTime}</p>
        <p><b>ที่อยู่:</b> ${data.subDistrict || ''} ${data.district || ''} ${data.province || ''}</p>
        <p><b>ช่วงเวลาที่สะดวกให้ติดต่อกลับ:</b> ${data.contactTime}</p>
      `,
    }

    await transporter.sendMail(mailOptions)
    return new Response(JSON.stringify({ success: true, message: 'ส่งข้อความสำเร็จ' }), { status: 200 })
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(JSON.stringify({ success: false, error: 'เกิดข้อผิดพลาดในการส่งอีเมล' }), { status: 500 })
  }
}
