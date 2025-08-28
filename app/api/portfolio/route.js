import { products } from '@/app/data/products';

function normalizeSize(sizeStr) {
  if (!sizeStr) return null;

  // ดึงเลขจาก string เช่น "3.5 kW", "22,000 BTU"
  const numStr = sizeStr.replace(/,/g, '').match(/[\d.]+/);
  return numStr ? parseFloat(numStr[0]) : null;
}

// ฟังก์ชันจับคู่สินค้าให้โปรเจกต์
function findMatchingProduct(project) {
  const { productType, size, panelCount } = project;

  if (!productType || !size) return null;

  const projectSize = normalizeSize(size);
  const productGroup = products.find(p => p.name === productType);
  if (!productGroup) return null;

  let bestMatch = null;
  let minSizeDiff = Infinity;

  for (const brand of productGroup.brands) {
    const brandName = brand.name;
    const brandImage = brand.brandImage;

    // กรณี Solar Rooftop ที่มี packages
    if (brand.packages) {
      for (const pkg of brand.packages) {
        for (const item of pkg.items) {
          const itemSize = normalizeSize(item.size);
          const sizeDiff = Math.abs(projectSize - itemSize);

          if (item.panel_count === panelCount && sizeDiff < minSizeDiff) {
            bestMatch = {
              brand: brandName,
              brandImage,
              packageName: pkg.name,
              item,
            };
            minSizeDiff = sizeDiff;
          }
        }
      }
    }

    // กรณี Solar Air ที่มี items โดยตรง
    if (brand.items) {
      for (const item of brand.items) {
        const itemSize = normalizeSize(item.size);
        const sizeDiff = Math.abs(projectSize - itemSize);

        if (item.panel_count === panelCount && sizeDiff < minSizeDiff) {
          bestMatch = {
            brand: brandName,
            brandImage,
            packageName: null,
            item,
          };
          minSizeDiff = sizeDiff;
        }
      }
    }
  }

  return bestMatch;
}

// API handler
export async function GET() {
  const projectData = [
    {
      id: 1,
      title: "ต.ในเมือง อ.พิชัย จ.อุตรดิตถ์ ",
      type: "โรงงาน",
      description: "12,500 BTU",
      size: "12,500 BTU",
      postDate: "12 มิถุนายน 2568",
      productType: "Solar Air",
      coverImage: "/success/factory/F1/main-F1.png",
      content: "...",
      panelCount: 3,
      gallery: [
        "/success/factory/F1/gallery-F1-1.png",
        "/success/factory/F1/gallery-F1-2.png",
        "/success/factory/F1/gallery-F1-3.png",
        "/success/factory/F1/gallery-F1-4.png",
        "/success/factory/F1/gallery-F1-5.png"
      ]
    },
    {
      id: 2,
      title: "ต.ในเมือง อ.พิชัย จ.อุตรดิตถ์ ",
      type: "โรงงาน",
      description: "22,000 BTU",
      model: 'SIHC 24BIF/ SOHC - 24BIF',
      panelCount: 5,
      size: "22,000 BTU",
      postDate: "12 มิถุนายน 2568",
      productType: "Solar Air",
      coverImage: "/success/factory/F2/main-F2.jpg",
      content: "...",
      gallery: [
        "/success/factory/F2/gallery-f2-1.jpg",
        "/success/factory/F2/gallery-f2-2.jpg",
        "/success/factory/F2/gallery-f2-3.jpg",
        "/success/factory/F2/gallery-f2-4.jpg",
        "/success/factory/F2/gallery-f2-5.jpg"
      ]
    },
    {
      id: 3,
      title: "ต.ไร่อ้อย อ.พิชัย จ.อุตรดิตถ์ ",
      type: "โรงงาน",
      description: "3.3kW",
      size: "3.5 kW",
      panelCount: 6,
      postDate: "12 มิถุนายน 2568",
      productType: "Solar Rooftop",
      coverImage: "/success/factory/F3/main-F3.jpg",
      content: `แบบติดตั้งระบบผลิตไฟฟ้าพลังงานแสงอาทิตย์บนหลังคาและอาคาร ขนาด 30125 กิโลวัตต์
(3.125 kWp PV ROOFTOP PROJECT)
สถานที่ติดตั้ง  ตําบล ไร่อ้อย อําเภอ พิชัย จังหวัด อุตรดิตถ์ 53120`,
      gallery: [
        "/success/factory/F3/gallery-f3-1.jpg",
        "/success/factory/F3/gallery-f3-2.jpg",
        "/success/factory/F3/gallery-f3-3.jpg",
        "/success/factory/F3/gallery-f3-4.jpg",
        "/success/factory/F3/gallery-f3-5.jpg"
      ]
    },
    {
      id: 4,
      title: "ต.ขุนฝาง อ.เมือง จ.อุตรดิตถ์  ",
      type: "โรงงาน",
      description: "17,500 BTU",
      size: "3.5 kW",
      panelCount: 6,
      postDate: "12 มิถุนายน 2568",
      productType: "Solar Rooftop",
      coverImage: "/success/factory/F4/main-F4.png",
      content: `...`,
      gallery: [
        "/success/factory/F4/gallery-f4-1.png",
        "/success/factory/F4/gallery-f4-2.png",
        "/success/factory/F4/gallery-f4-3.png",
        "/success/factory/F4/gallery-f4-4.png",
        "/success/factory/F4/gallery-f4-5.png"
      ]
    },
    {
      id: 5,
      title: "ต.ชมพู อ.เนินมะปราง จ.พิษณุโลก  ",
      type: "โรงงาน",
      description: "20kW",
      size: "10 kW",
      panelCount: 16,
      postDate: "12 มิถุนายน 2568",
      productType: "Solar Rooftop",
      coverImage: "/success/factory/F5/main-F5.jpg",
      content: `
แบบติดตั้งระบบผลิตไฟฟ้าพลังงานแสงอาทิตย์บนหลังคาและอาคาร ขนาด 20.00 กิโลวัตต์
(20.00 kWp PV ROOFTOP PROJECT)
บานคุณ สมเกียรติ ปคุณพูลสิน
สถานที่ติดตั้ง 206/1 หมู่ 6 ตําบล ชมพู
อําเภอ เนินมะปราง จังหวัด พิษณุโลก 65190`,
      gallery: [
        "/success/factory/F5/gallery-f5-1.jpg",
        "/success/factory/F5/gallery-f5-2.jpg",
        "/success/factory/F5/gallery-f5-3.jpg",
        "/success/factory/F5/gallery-f5-4.jpg",
        "/success/factory/F5/gallery-f5-5.jpg"
      ]
    },
    {
      id: 6,
      title: "ต.ท่าอิฐ อ.เมือง จ.อุตรดิตถ์ ",
      type: "บ้าน",
      description: "10kW",
      size: "3.5 kW",
      panelCount: 6,
      postDate: "12 มิถุนายน 2568",
      productType: "Solar Rooftop",
      coverImage: "/success/house/H1/main-H1.jpg",
      content: `
แบบติดตั้งระบบผลิตไฟฟ้าพลังงานแสงอาทิตย์บนหลังคาและอาคาร ขนาด 10.00 กิโลวัตต์
(10.00 kWp PV ROOFTOP PROJECT)
บ้านคุณ มณฑี พลอยสีสังข์
สถานที่ติดตั้ง 39/226 ตําบล ท่าอิฐ อําเภอ เมืองอุตรดิตถ์ จังหวัด อุตรดิตถ์ 53000`,
      gallery: [
        "/success/house/H1/gallery-H1-1.jpg",
        "/success/house/H1/gallery-H1-2.jpg",
        "/success/house/H1/gallery-H1-3.jpg",
        "/success/house/H1/gallery-H1-4.jpg",
        "/success/house/H1/gallery-H1-5.jpg"
      ]
    },
  ];

  const projects = projectData.map(project => ({
    ...project,
    matchedProduct: findMatchingProduct(project),
  }));

  return Response.json({ projects });
}
