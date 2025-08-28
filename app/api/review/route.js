// app/api/review/route.js
import { NextResponse } from 'next/server';

const mockReviews = [
  {
    id: '1',
    title: 'รีวิวแอร์บ้าน ประหยัดไฟ',
    date: '6 กรกฎาคม 2568',
    url: 'https://www.youtube.com/watch?v=V79Hfn7EYGU',
  },
  {
    id: '2',
    title: 'สินเชื่อโซลาร์เซลล์ ประหยัด ลดค่าไฟฟ้าได้จริง',
    date: '6 กรกฎาคม 2568',
    url: 'https://www.youtube.com/watch?v=MXjpk4iM2nM',
  },
    {
    id: '3',
    title: 'อีก 1 เสียง!! ของผู้ใช้งานจริงจากการติดโซลาร์เซลล์',
    date: '7 กรกฎาคม 2568',
    url: 'https://www.youtube.com/watch?v=TzsFWlQARW0',
  },
    {
    id: '4',
    title: 'มีความสุข ค่าไฟลดเห็นได้ชัดเลย',
    date: '15 กรกฎาคม 2568',
    url: 'https://www.youtube.com/watch?v=Vxks19_rW4k',
  },
  {
    id: '5',
    title: 'ค่าไฟลดแรง⚡จาก 50,000 บาท เหลือเพียง 20,000 บาท',
    date: '15 กรกฎาคม 2568',
    url: 'https://www.youtube.com/watch?v=dkjPy04cggI',
  },
    {
    id: '6',
    title: 'ติดแล้วแฮปปี้ ค่าไฟเป็นอันดับหนึ่งของค่าใช้จ่าย',
    date: '15 กรกฎาคม 2568',
    url: 'https://www.youtube.com/watch?v=4AdSPHMBEWA',
  },
  
];

export async function GET() {
  return NextResponse.json(mockReviews);
}
