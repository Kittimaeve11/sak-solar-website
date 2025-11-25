// app/review/components/logReviewAction.js

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export async function logReviewAction(review) {
  try {
    const payload = {
      actionType: "4",
      actionDetail: `หน้ารีวิว รหัสวิดีโอ: ${review.vedio_id ?? "0"}  ชื่อวิดีโอ : ${review.nameTH_Vedio ?? "-"}`,
      typeUser: "ผู้เยี่ยมชมเว็บไซต์",
      datatype: "รีวิว",
      dataID: review.vedio_id ?? "0",
      dataname: review.nameTH_Vedio ?? "-",
      datatypeID: "0",
      brandtype: "0"
    };

    const res = await fetch(`${baseUrl}/api/logWebsitepageapi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("❌ Log API error:", await res.text());
    } else {
      console.log("✅ Log Sent Successfully");
    }
  } catch (err) {
    console.error("💥 Log Action Error:", err);
  }
}
