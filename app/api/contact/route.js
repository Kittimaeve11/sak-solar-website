import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const data = await request.json();

    // ตรวจสอบข้อมูลบางส่วนก่อน (เพิ่มตามต้องการ)
    if (!data.fullName || !data.phone || !data.product) {
      return new Response(JSON.stringify({ error: 'ข้อมูลไม่ครบถ้วน' }), { status: 400 });
    }

    // สร้าง transporter ด้วย Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // ใช้ SSL
      auth: {
        user: 'sb.evesang@gmail.com',
        pass: process.env.EMAIL_PASS, // กำหนดใน .env.local
      },
    });

    // สร้างข้อความ email
    const mailOptions = {
      from: '"เว็บโซลาร์เซลล์" <sb.evesang@gmail.com>',
      to: 'sb.evesang@gmail.com', // อีเมลที่รับข้อความ
      subject: `แบบฟอร์มติดต่อจาก ${data.fullName}`,
      html: `
        <h2>รายละเอียดผู้ติดต่อ</h2>
        <p><strong>ชื่อ-นามสกุล:</strong> ${data.fullName}</p>
        <p><strong>โทรศัพท์:</strong> ${data.phone}</p>
        <p><strong>สินค้า/บริการ:</strong> ${data.product}</p>
        <p><strong>แพ็คเกจ:</strong> ${data.package}</p>
        <p><strong>ช่วงเวลาที่ใช้ไฟ:</strong> ${data.usageTime}</p>
        <p><strong>ที่อยู่:</strong> ${data.subDistrict || ''} ${data.district || ''} ${data.province || ''}</p>
        <p><strong>ช่วงเวลาที่สะดวกให้ติดต่อกลับ:</strong> ${data.contactTime}</p>
      `,
    };

    // ส่งอีเมล
    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: 'ส่งข้อความสำเร็จ' }), { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการส่งอีเมล' }), { status: 500 });
  }
}
