// /app/api/contact/route.js (Next.js App Router)
// หรือ /pages/api/contact.js (Next.js Pages Router)

import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const data = await request.json();

    // ตรวจสอบข้อมูลเบื้องต้น (คุณสามารถปรับแต่งตามต้องการ)
    if (
      !data.fullName ||
      !data.phone ||
      !data.product ||
      !data.package ||
      !data.usageTime ||
      !data.contactTime
    ) {
      return new Response(
        JSON.stringify({ error: 'ข้อมูลไม่ครบถ้วน กรุณากรอกข้อมูลให้ครบ' }),
        { status: 400 }
      );
    }

    // สร้าง transporter สำหรับ Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sb.evesang@gmail.com',
        pass: process.env.EMAIL_PASS,
      },
    });

    // เตรียมเนื้อหาอีเมล
    const mailOptions = {
      from: `"Contact Form" <sb.evesang@gmail.com>`, // ผู้ส่ง
      to: 'sb.evesang@gmail.com', // ผู้รับ (เปลี่ยนเป็นอีเมลที่จะรับข้อความ)
      subject: `มีผู้ติดต่อสนใจโซลาร์เซลล์: ${data.fullName}`,
      html: `
        <h3>รายละเอียดจากแบบฟอร์มติดต่อ</h3>
        <p><strong>สินค้า/บริการที่สนใจ:</strong> ${data.product}</p>
        <p><strong>แพ็คเกจที่ยอมรับได้:</strong> ${data.package}</p>
        <p><strong>ช่วงเวลาที่ใช้ไฟ:</strong> ${data.usageTime}</p>
        <p><strong>ชื่อ-นามสกุล:</strong> ${data.fullName}</p>
        <p><strong>โทรศัพท์:</strong> ${data.phone}</p>
        <p><strong>ที่อยู่:</strong> ${data.subDistrict || ''} ${data.district || ''} ${data.province || ''}</p>
        <p><strong>ช่วงเวลาที่สะดวกให้ติดต่อกลับ:</strong> ${data.contactTime}</p>
        <p><strong>ข้อความเพิ่มเติม:</strong> ${data.message || '(ไม่มีข้อความเพิ่มเติม)'}</p>
      `,
    };

    // ส่งอีเมล
    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({ message: 'ส่งอีเมลเรียบร้อยแล้ว' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: 'เกิดข้อผิดพลาดในการส่งอีเมล' }),
      { status: 500 }
    );
  }
}
