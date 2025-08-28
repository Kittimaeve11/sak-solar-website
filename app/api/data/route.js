export async function GET() {
  const data = {
    contacts: [
      {
        id: 1,
        SubjectTH: "ที่อยู่บริษัท",
        SubjectENG: "Company Address",
        WorkforceTH: "275 หมู่ 3 ต.คุ้งตะเภา อ.เมืองอุตรดิตถ์ จ.อุตรดิตถ์ 53000",
        WorkforceENG: "275 Moo 3, Khung Taphao, Mueang Uttaradit, Uttaradit 53000"
      },
      {
        id: 2,
        SubjectTH: "เบอร์โทรศัพท์",
        SubjectENG: "Phone Number",
        WorkforceTH: "โทร : 093 137 758",
        WorkforceENG: "Call : 093 137 7588 ",
        WorkforceTH1: "แฟกซ์ : 1487",
        WorkforceENG1: "Fax : 1487"

      },
      {
        id: 3,
        SubjectTH: "อีเมล",
        SubjectENG: "Email",
        WorkforceTH: "saksiam@saksiam.co.th ",
        WorkforceENG: "saksiam@saksiam.co.th ",
        WorkforceTH1: "secretary.s@saksiam.co.th",
        WorkforceENG1: "secretary.s@saksiam.co.th"

      }
    ],
    socials: [
      {
        id: 'facebook',
        name: 'Facebook',
        name1: 'ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ -Saksiam Solar Energy',
        url: 'https://www.facebook.com/profile.php?id=61569434566022',
        icon: 'facebook'
      },
      {
        id: 'line',
        name: 'Line',
        name1: '@SaksiamSolar',
        url: 'https://lin.ee/BP3uYCu',
        icon: 'line'
      },
      {
        id: 'tiktok',
        name: 'TikTok',
        name1: 'ศักดิ์สยามลิสซิ่ง',
        url: 'https://www.youtube.com/channel/UCSkTr6d-9ElKUzjQIRKUxIA',
        icon: 'tiktok'
      },
      {
        id: 'instagram',
        name: 'Instagram',
        name1: 'ศักดิ์สยามลิสซิ่ง',
        url: 'https://www.youtube.com/channel/UCSkTr6d-9ElKUzjQIRKUxIA',
        icon: 'instagram'
      },
      {
        id: 'youTube',
        name: 'YouTube',
        name1: 'ศักดิ์สยามลิสซิ่ง',
        url: 'https://www.youtube.com/channel/UCSkTr6d-9ElKUzjQIRKUxIA',
        icon: 'youtube'
      },

    ]
    
  };

  return Response.json(data);
}
