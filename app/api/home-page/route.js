
export async function GET() {
  const data = {
    contacts: [
      {
        id: 1,
        SubjectTH: "ค่าบำรุงรักษา 1 ปี",
        SubjectENG: "Company Address",
        image: "/images/free-service/wrench.png"

      },
      {
        id: 2,
        SubjectTH: "สำรวจพื้นที่การติดตั้ง",
        SubjectENG: "Survey the installation area",
        image: "/images/free-service/home.png"

      },
      {
        id: 3,
        SubjectTH: "ค่าแบบโยธาพื้นที่การติดตั้ง",
        SubjectENG: "Civil engineering cost for installation area",
        image: "/images/free-service/size.png"

      },
      {
        id: 4,
        SubjectTH: "ค่าติดตั้งและอุปกรณ์",
        SubjectENG: "Installation and equipment costs",
        image: "/images/free-service/house.png"

      },
      {
        id: 5,
        SubjectTH: "ค่าเปลี่ยนมิเตอร์ไฟฟ้า",
        SubjectENG: "Electric meter replacement cost",
        image: "/images/free-service/power-meter.png"
      },
      {
        id: 6,
        SubjectTH: "ค่าดำเนินการขออนุญาตการไฟฟ้าและท้องถิ่น",
        SubjectENG: "Fees for requesting permission from electricity and local authorities",
        image: "/images/free-service/flash.png"
      },
      {
        id: 7,
        SubjectTH: "รับประกันประสิทธิภาพการผลิตกระแสไฟฟ้า 30 ปี",
        SubjectENG: "Guaranteed power generation efficiency for 30 years",
        image: "/images/free-service/thumb-up.png"
      },
      {
        id: 8,
        SubjectTH: "แผงโซลาร์ รับประกันการใช้งาน 12 ปี",
        SubjectENG: "Solar panels are guaranteed for 12 years.",
        image: "/images/free-service/solar-panels.png"
      },
      {
        id: 9,
        SubjectTH: "อินเวอร์เตอร์ รับประกันการใช้งาน 10 ปี",
        SubjectENG: "Inverter, 10-year usage guarantee",
        image: "/images/free-service/solar-panel.png"
      }
      
    ],

  };

  return Response.json(data);
}
