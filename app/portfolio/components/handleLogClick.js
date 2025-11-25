// app/portfolio/components/handleLogClick.js
export const handleLogPortfolioClick = async (item, baseUrl, apiKey) => {
  try {
    const logData = {
      actionType: "3",
      actionDetail: `หน้าผลงาน รหัสผลงานการติดตั้ง: ${item.portfolio_id ?? "0"} หมายเลขผลงานการติดตั้ง : ${item.portfolio_num ?? "0"} ที่อยู่: ${item.titleTH ?? "-"}`,
      typeUser: "ผู้เยี่ยมชมเว็บไซต์",
      datatype: "ผลงานการติดตั้ง",
      dataID: item.portfolio_id ?? "0",
      datatypeID: item.portfolio_typeID ?? "0",
      dataname: item.portfolio_num ?? "0",
      brandtype: "0",
    };

    await fetch(`${baseUrl}/api/logWebsitepageapi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(logData),
    });
  } catch (err) {
    console.error("💥 Error logging portfolio click:", err);
  }
};
