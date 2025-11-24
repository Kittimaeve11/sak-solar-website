const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export async function handleLogClick(item) {
  try {
    const logData = {
      actionType: '2',
      actionDetail: `หน้าบทความ รหัสบทความ: ${item.editoria_id ?? '-'} หมายเลข: ${item.editoria_num ?? '-'} ชื่อบทความ: ${item.editoria_titieTH ?? '-'}`,
      typeUser: 'ผู้เยี่ยมชมเว็บไซต์',
      datatype: 'บทความ',
      dataID: item.editoria_id ?? '0',
      datatypeID: item.editoria_typeID ?? '0',
      brandtype: '0',
      dataname: item.editoria_titieTH ?? '-',
    };

    await fetch(`${baseUrl}/api/logWebsitepageapi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify(logData),
    });
  } catch (err) {
    console.error('Log error:', err);
  }
}
