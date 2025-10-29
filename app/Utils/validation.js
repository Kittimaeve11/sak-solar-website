// ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลในฟอร์ม "ติดต่อสอบถามเพิ่มเติม"
export const validateFieldmoreInfo = (formData, messages) => {
  const errors = {}; // เก็บข้อความ error สำหรับแต่ละช่องที่ไม่ผ่านการตรวจสอบ

  // กำหนดรูปแบบข้อมูลที่อนุญาต
  const nameRegex = /^[\u0E01-\u0E4E\u0E50-\u0E59a-zA-Z\s]+$/; // ชื่อ: ต้องเป็นอักษรไทยหรืออังกฤษเท่านั้น
  const repeatRegex = /(.)\1{4,}/; // ห้ามตัวอักษรหรือสัญลักษณ์ใดซ้ำกันเกิน 4 ตัว
  const wordRegex = /[ก-๙]{3,}|[a-zA-Z]{3,}/; // ต้องมีคำที่มีอย่างน้อย 3 ตัวอักษร
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // ตรวจสอบรูปแบบอีเมลมาตรฐาน
  const pattern = /^[ก-๙a-zA-Z0-9\s.,!?()'"-]+$/; // อนุญาตเฉพาะตัวอักษรไทย อังกฤษ ตัวเลข และเครื่องหมายพื้นฐาน

  // ตรวจจับคำที่เขียนเพี้ยน เช่น มีสระหรือวรรณยุกต์ซ้อน หรือพิมพ์พยัญชนะซ้ำผิดปกติ
  const gibberishPattern = /[ะัาิีึืุูเแโใไ่้๋็์]{2,}|([ก-ฮ])\1{2,}/;
  // - สระหรือวรรณยุกต์ติดกันเกิน 1 ตัว เช่น "ถิถิย"
  // - ตัวอักษรไทยซ้ำกันมากกว่า 2 ตัว เช่น "พพพ"

  // เริ่มตรวจสอบข้อมูลในแต่ละช่องของฟอร์ม
  Object.keys(formData).forEach((field) => {
    switch (field) {
      // ตรวจสอบหัวข้อที่เลือก
      case "topic":
        if (!formData.topic) {
          errors.topic = messages.Infovalidate.topic; // ถ้าไม่เลือกหัวข้อ
        }
        break;

      // ตรวจสอบชื่อ-นามสกุล
      case "name":
        if (!formData.name) {
          errors.name = messages.Infovalidate.fullname.fullnamenull; // ถ้าไม่กรอกชื่อ
        } else if (
          !nameRegex.test(formData.name) || // ถ้ามีอักขระที่ไม่ใช่ไทยหรืออังกฤษ
          repeatRegex.test(formData.name) || // ถ้ามีตัวอักษรซ้ำเกิน 4 ตัว
          !wordRegex.test(formData.name) // ถ้าไม่มีคำที่เป็นจริง
        ) {
          errors.name = messages.Infovalidate.fullname.name;
        }
        break;

      // ตรวจสอบหมายเลขโทรศัพท์
      case "phone":
        if (!formData.phone) {
          errors.phone = messages.Infovalidate.phone.phonenull; // ถ้าไม่กรอกเบอร์โทร
        } else if (formData.phone.length !== 10) {
          errors.phone = messages.Infovalidate.phone.phonenumber; // ต้องมีความยาว 10 หลักเท่านั้น
        }
        break;

      // ตรวจสอบอีเมล (ไม่บังคับกรอก แต่ถ้ากรอกต้องถูกต้อง)
      case "email":
        if (formData.email && !emailRegex.test(formData.email)) {
          errors.email = messages.Infovalidate.email; // ถ้ากรอกแต่รูปแบบไม่ถูกต้อง
        }
        break;

      // ตรวจสอบข้อความฝากข้อความ
      case "message":
        const clean = formData.message ? formData.message.trim() : ""; // ลบช่องว่างหัวท้ายข้อความ
        const repeatMsg = repeatRegex.test(clean); // ตรวจว่ามีอักษรซ้ำกันเกิน 4 ตัวไหม
        const repeatedWords = /(.)\1{3,}|([ก-๙a-zA-Z]{2,})(?:\s?\2){2,}/i.test(clean); // ตรวจคำหรือข้อความที่ซ้ำต่อเนื่อง
        const long = clean.length > 1000; // จำกัดความยาวไม่เกิน 1000 ตัวอักษร
        const hasWords = clean.split(/\s+/).length >= 1; // ต้องมีคำอย่างน้อย 1 คำ

        if (!clean) {
          errors.message = messages.Infovalidate.message.clean; // ถ้าไม่ได้กรอกข้อความเลย
        } else if (
          !pattern.test(clean) || // มีอักขระแปลกที่ไม่ได้อนุญาต
          repeatMsg || // ตัวอักษรซ้ำยาว
          repeatedWords || // คำซ้ำต่อเนื่อง
          gibberishPattern.test(clean) || // มีคำเพี้ยน สระมั่ว หรือวรรณยุกต์ซ้อน
          long || // ยาวเกินกำหนด
          !hasWords // ไม่มีคำจริงเลย
        ) {
          errors.message = messages.Infovalidate.message.patternmessage;
        }
        break;

      // ถ้ามีฟิลด์อื่นในอนาคต (กันไว้)
      default:
        break;
    }
  });

  // ส่งคืนผลลัพธ์ errors (ว่างถ้าผ่านทั้งหมด)
  return errors;
};
