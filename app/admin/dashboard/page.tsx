"use client";

import { useEffect, useState } from "react";
import { db } from "@/src/lib/firebaseConfig"; 
import { collection, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

const nameMap: { [key: string]: string } = {
  HIGH_RISK_LOW_DISC: "กาวสุดกราฟ",
  HIGH_RISK_MID_DISC: "ล่าเทรนด์(ดอย)",
  HIGH_RISK_HIGH_DISC: "เซียนระบบ",
  MID_RISK_LOW_DISC: "ตัวตึงสายเปย์",
  MID_RISK_MID_DISC: "มนุษย์สมดุล",
  MID_RISK_HIGH_DISC: "นักปั้นพอร์ต",
  LOW_RISK_LOW_DISC: "ผู้ประสบภัย",
  LOW_RISK_MID_DISC: "สายเซฟโซน",
  LOW_RISK_HIGH_DISC: "พิทักษ์เงินฝาก",
};

export default function AdminDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "quiz_results"));
      const results = querySnapshot.docs.map(doc => doc.data());
      const totalCount = results.length;
      setTotal(totalCount);

      const counts: { [key: string]: number } = {};
      results.forEach(res => {
        counts[res.resultKey] = (counts[res.resultKey] || 0) + 1;
      });

      const chartData = Object.keys(nameMap).map(key => {
        const value = counts[key] || 0;
        // ✨ คำนวณ % รายประเภท
        const percentage = totalCount > 0 ? ((value / totalCount) * 100).toFixed(1) : "0";
        
        return {
          name: nameMap[key],
          value: value,
          percentage: percentage,
          color: key.includes("HIGH_RISK") ? "#ef4444" : key.includes("MID_RISK") ? "#f59e0b" : "#10b981"
        };
      });

      setData(chartData);
    };

    fetchData();
  }, []);

  return (
    <div className="p-8 bg-stone-50 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-stone-900 mb-2">Money DNA Insights 📊</h1>
        <p className="text-stone-500 mb-8">สรุปสถิติผู้เข้าทำแบบประเมินทั้งหมด: <span className="font-bold text-stone-900 text-xl">{total} คน</span></p>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 h-[550px] mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20, right: 60, top: 20, bottom: 20 }}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120} 
                tick={{ fontSize: 12, fontWeight: 600, fill: '#444' }} 
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 shadow-xl rounded-2xl border border-stone-100">
                        <p className="font-bold text-stone-900">{payload[0].payload.name}</p>
                        <p className="text-sm text-amber-600">จำนวน: {payload[0].value} คน ({payload[0].payload.percentage}%)</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                {/* ✨ แสดง % ท้ายแท่งกราฟ */}
                <LabelList 
                  dataKey="percentage" 
                  position="right" 
                  formatter={(val: any) => `${val}%`}
                  style={{ fontSize: '12px', fontWeight: 'bold', fill: '#666' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* --- ตารางสรุปด้านล่าง พร้อม % --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-stone-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-stone-600 mb-1">{item.name}</span>
                <span className="text-[10px] font-black text-white px-2 py-0.5 rounded-full w-fit" style={{ backgroundColor: item.color }}>
                  {item.percentage}%
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-stone-900 leading-none">{item.value}</span>
                <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1">คน</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center text-stone-400 text-[10px] uppercase tracking-widest">
          Internal Admin Dashboard • Upskill with Fuii
        </div>
      </div>
    </div>
  );
}