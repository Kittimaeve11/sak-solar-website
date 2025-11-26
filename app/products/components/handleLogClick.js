export const handleLogClick = async (item) => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL_API}/api/logWebsitepageapi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API,
      },
      body: JSON.stringify({
        actionType: "1",
        actionDetail: `หน้าผลิตภัณฑ์ รหัส: ${item.id} หมายเลขผลิตภัณฑ์: ${item.num}`,
        typeUser: "ผู้เยี่ยมชมเว็บไซต์",
        datatype: "ผลิตภัณฑ์",
        dataID: item.id ?? "0",
        datatypeID: item.categoryId ?? "0",
        brandtype: item.brandId ?? "0",
        dataname: item.num ?? "-",
      }),
    });
  } catch (e) {}
};
