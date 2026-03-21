"use client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useState, useRef } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, RefreshCcw, Camera, AlertTriangle, ArrowLeft, ArrowRight, Loader2, Zap, Target, Info, X, Star, BookOpen, PieChart, Users
} from "lucide-react"; 
import { toPng } from "html-to-image"; 
import Image from "next/image";
import { Prompt } from "next/font/google";

import { scenarios } from "../src/data/chatScenarios"; 
import { resultData } from "../src/data/resultData";
import DisclaimerFooter from '../app/components/DisclaimerFooter';

import { Quote } from 'lucide-react';
// 1. เพิ่มการ Import db (สมมติว่าไฟล์ config อยู่ที่พาธนี้ รบกวนเช็คพาธไฟล์ตัวเองด้วยนะครับ)
import { db } from "../src//lib/firebaseConfig"; 
import { MessageCircle } from 'lucide-react';



const saveDataToFirebase = async (
  nickname: string, 
  persona: string | null, 
  resultKey: string, 
  riskScore: number, 
  discScore: number,
  detailedResults: any[] // <--- ตัวแปรเก็บประวัติการตอบทั้งหมด
) => {
  try {
    await addDoc(collection(db, "quiz_results"), {
      nickname,
      persona,
      resultKey,
      riskScore,
      discScore,
      history: detailedResults, // <--- บันทึกลง DB
      createdAt: serverTimestamp(),
    });
    console.log("✅ บันทึกประวัติการตอบแบบละเอียดเรียบร้อย!");
  } catch (error) {
    console.error("❌ บันทึกล้มเหลว:", error);
  }
};

const promptFont = Prompt({ 
  subsets: ["thai", "latin"], 
  weight: ["300", "400", "500", "600", "700"] 
});

const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const personaOptions = [
  { id: "เสี่ย", label: "เสี่ย", emoji: "🤵‍♂️" },
  { id: "ซ้อ", label: "ซ้อ", emoji: "💅" },
  { id: "จารย์", label: "จารย์", emoji: "📚" },
  { id: "ไม่ระบุ", label: "ไม่ระบุ", emoji: "😎" },
];

// 📚 พจนานุกรมศัพท์การเงิน (ฉบับอธิบายกลไกแบบเป็นกลาง + ไร้ศัพท์เทคนิคซับซ้อน)
const jargonDict = [
  // --- แนวคิดการลงทุนเบื้องต้น (Basic Investing Concepts) ---
  { keywords: ["compound effect", "ทบต้น"], word: "Compound Effect (ดอกเบี้ยทบต้น)", desc: "กลไกที่ผลกำไรหรือดอกเบี้ยที่ได้รับ ถูกนำไปลงทุนทบกับเงินต้นเดิมซ้ำๆ ทำให้ฐานเงินทุนใหญ่ขึ้นและเกิดการขยายตัวแบบทวีคูณเมื่อเวลาผ่านไป" },
  { keywords: ["dca"], word: "DCA (Dollar Cost Averaging)", desc: "กลยุทธ์การทยอยลงทุนด้วยจำนวนเงินที่เท่าๆ กันอย่างสม่ำเสมอตามรอบเวลาที่กำหนด เพื่อถัวเฉลี่ยต้นทุนโดยไม่ใช้การจับจังหวะตลาด" },
  { keywords: ["asset allocation"], word: "Asset Allocation (การจัดสรรสินทรัพย์)", desc: "กระบวนการจัดสรรและกระจายเงินทุนไปยังกลุ่มสินทรัพย์ที่หลากหลาย (เช่น หุ้น ตราสารหนี้ เงินฝาก) ตามสัดส่วนของแผนการลงทุนเพื่อลดความผันผวน" },
  { keywords: ["passive income"], word: "Passive Income (รายได้แบบไม่ต้องลงแรง)", desc: "รูปแบบรายได้ที่เกิดขึ้นอย่างต่อเนื่องจากสินทรัพย์หรือระบบที่สร้างไว้ โดยลดทอนความจำเป็นที่จะต้องใช้แรงงานและเวลาเข้าไปแลกโดยตรง" },
  { keywords: ["cashflow", "กระแสเงินสด"], word: "Cashflow (กระแสเงินสด)", desc: "การไหลเข้าและออกของเงิน การมีกระแสเงินสดบวก (Positive Cashflow) หมายถึงสภาวะที่มีรายรับหมุนเวียนเข้ามามากกว่ารายจ่าย" },
  { keywords: ["capital gain", "ส่วนต่างราคา"], word: "Capital Gain (กำไรจากส่วนต่างราคา)", desc: "กำไรที่เกิดจากมูลค่าของสินทรัพย์ที่ปรับตัวเพิ่มขึ้นเมื่อเทียบกับต้นทุนเริ่มต้นที่ซื้อมา" },
  { keywords: ["yield", "อัตราผลตอบแทน"], word: "Yield (ผลตอบแทน)", desc: "อัตราส่วนที่แสดงถึงผลตอบแทนหรือกระแสเงินสดที่เกิดจากการถือครองสินทรัพย์ เช่น เงินปันผลจากหุ้น หรือรายได้ค่าเช่า" },
  { keywords: ["roi", "return on investment", "อัตราผลตอบแทน"], word: "ROI (Return on Investment)", desc: "อัตราส่วนทางคณิตศาสตร์ที่ใช้วัดผลตอบแทนที่ได้รับจากการลงทุน โดยนำกำไรมาเปรียบเทียบกับต้นทุนที่ได้ลงทุนไป" },

  // --- สินทรัพย์และการประเมินมูลค่า (Assets & Valuation) ---
  { keywords: ["tech stock", "หุ้น tech", "หุ้นเทค", "tech"], word: "Tech Stock (หุ้นเทคโนโลยี)", desc: "หุ้นของบริษัทที่ดำเนินธุรกิจในกลุ่มเทคโนโลยีและนวัตกรรม มักมีนโยบายนำกระแสเงินสดไปลงทุนพัฒนาผลิตภัณฑ์เพื่อขยายขนาดกิจการแทนการจ่ายปันผล" },
  { keywords: ["growth stock", "หุ้น growth", "หุ้นเติบโต"], word: "Growth Stock (หุ้นเติบโต)", desc: "หุ้นของบริษัทที่มีอัตราการขยายตัวของรายได้และกำไรสูงกว่าค่าเฉลี่ยของอุตสาหกรรม" },
  { keywords: ["blue-chip", "บลูชิป"], word: "Blue-chip Stock (หุ้นบลูชิป)", desc: "หุ้นของบริษัทมหาชนขนาดใหญ่ที่เป็นผู้นำในอุตสาหกรรม มีฐานะทางการเงินและประวัติการดำเนินงานมาอย่างยาวนานและมั่นคง" },
  { keywords: ["s&p500", "ดัชนี", "index fund", "index"], word: "S&P500 / Index Fund", desc: "กองทุนรวมดัชนีที่มีนโยบายลงทุนอิงตามดัชนี S&P500 ซึ่งประกอบด้วยบริษัทมหาชนขนาดใหญ่ที่มีมูลค่าตลาดสูงสุด 500 อันดับแรกในสหรัฐอเมริกา" },
  { keywords: ["reit", "อสังหาฯ"], word: "REIT (กองทุนทรัสต์เพื่อการลงทุนในอสังหาริมทรัพย์)", desc: "กองทุนที่ระดมเงินเพื่อไปลงทุนในอสังหาริมทรัพย์ที่ก่อให้เกิดรายได้ (เช่น ห้างสรรพสินค้า อาคารสำนักงาน) และนำกระแสเงินสดมาแบ่งเป็นปันผล" },
  { keywords: ["corporate bond", "หุ้นกู้"], word: "Corporate Bond (หุ้นกู้)", desc: "ตราสารหนี้ภาคเอกชน ผู้ถือจะมีสถานะเป็นเจ้าหนี้ของบริษัทที่ออกตราสาร และจะได้รับผลตอบแทนเป็นดอกเบี้ยตามระยะเวลาที่กำหนด" },
  { keywords: ["bond", "ตราสารหนี้", "พันธบัตร"], word: "Bond (ตราสารหนี้ / พันธบัตร)", desc: "ตราสารที่ออกโดยภาครัฐหรือเอกชน โดยผู้ถือจะมีสถานะเป็นเจ้าหนี้ และได้รับผลตอบแทนในรูปของอัตราดอกเบี้ย" },
  { keywords: ["high yield", "ผลตอบแทนสูง", "junk bond"], word: "High Yield Bond (Junk Bond)", desc: "หุ้นกู้ที่ให้อัตราผลตอบแทนสูงกว่าอัตราดอกเบี้ยเฉลี่ย มักออกโดยบริษัทที่ได้รับการจัดอันดับความน่าเชื่อถือต่ำกว่าเกณฑ์การลงทุนทั่วไป" },
  { keywords: ["money market", "ตลาดเงิน"], word: "Money Market Fund (กองทุนรวมตลาดเงิน)", desc: "กองทุนที่นำเงินไปลงทุนในตราสารหนี้ระยะสั้นมาก มีความเสี่ยงต่ำที่สุดเทียบเท่าการฝากเงิน แต่ให้ผลตอบแทนดีกว่าออมทรัพย์ปกติเล็กน้อย" },
  { keywords: ["mixed fund", "กองทุนรวมผสม", "mixed"], word: "Mixed Fund (กองทุนรวมผสม)", desc: "กองทุนที่มีผู้จัดการกองทุนคอยจัดสัดส่วนกระจายการลงทุนไปในหลายสินทรัพย์ (เช่น หุ้น + ตราสารหนี้) จบในตัวเดียว เพื่อรักษาสมดุลความเสี่ยง" },
  { keywords: ["target date", "ทาร์เก็ตเดท"], word: "Target Date Fund (กองทุนปรับสัดส่วนตามอายุ)", desc: "กองทุนรวมที่จะค่อยๆ ปรับลดสัดส่วนสินทรัพย์ที่มีความผันผวนลง และเพิ่มสินทรัพย์ที่มั่นคงขึ้นโดยอัตโนมัติ ตามกรอบเวลาหรืออายุเป้าหมายที่ตั้งไว้" },
  { keywords: ["emerging market", "ตลาดเกิดใหม่"], word: "Emerging Market (ตลาดเกิดใหม่)", desc: "ตลาดการลงทุนในกลุ่มประเทศที่มีสถานะเป็นประเทศกำลังพัฒนา ซึ่งมีอัตราการขยายตัวทางเศรษฐกิจในระดับที่สูง" },
  { keywords: ["alternative assets", "alternative", "ทางเลือก"], word: "Alternative Assets (สินทรัพย์ทางเลือก)", desc: "สินทรัพย์นอกเหนือจากหุ้น ตราสารหนี้ หรือเงินสด เช่น คริปโตเคอร์เรนซี งานศิลปะ นาฬิกา ของสะสม หรือ Private Equity" },
  { keywords: ["fractional shares", "เศษหุ้น"], word: "Fractional Shares (เศษหุ้น)", desc: "ระบบที่ทำให้นักลงทุนสามารถกำหนดจำนวนเงินที่ต้องการซื้อหุ้นได้โดยอิสระ โดยจะได้รับสิทธิความเป็นเจ้าของมาในรูปแบบสัดส่วนจุดทศนิยม" },
  { keywords: ["ipo"], word: "IPO (Initial Public Offering)", desc: "การเสนอขายหุ้นของบริษัทเอกชนให้กับประชาชนทั่วไปเป็นครั้งแรกเพื่อนำเข้าจดทะเบียนในตลาดหลักทรัพย์" },
  { keywords: ["p/e", "pe"], word: "P/E Ratio", desc: "Price-to-Earnings อัตราส่วนเปรียบเทียบระหว่างราคาหุ้นกับกำไรต่อหุ้น เพื่อใช้เป็นหนึ่งในมาตรวัดประเมินมูลค่าความถูกแพงของกิจการ" },

  // --- กลยุทธ์และการซื้อขาย (Trading & Strategies) ---
  { keywords: ["vi", "value investor", "พื้นฐาน"], word: "Value Investor / VI (นักลงทุนเน้นคุณค่า)", desc: "แนวทางการลงทุนที่เน้นการวิเคราะห์งบการเงินและรูปแบบธุรกิจ เพื่อประเมินหามูลค่าที่แท้จริงของกิจการและเน้นการถือครองในระยะยาว" },
  { keywords: ["passive investing", "ตั้งรับ", "passive"], word: "Passive Investing (การลงทุนแบบตั้งรับ)", desc: "กลยุทธ์การลงทุนที่เน้นการซื้อและถือครอง (Buy and Hold) เช่น การออมกองทุนดัชนี โดยไม่พยายามซื้อขายบ่อยๆ เพื่อเอาชนะตลาด" },
  { keywords: ["time in the market"], word: "Time in the Market", desc: "แนวคิดการลงทุนที่เน้นระยะเวลาการถือครองสินทรัพย์ที่ยาวนานให้ดอกเบี้ยทำงาน แทนที่จะพยายามกะเก็งจับจังหวะตลาด (Timing the Market)" },
  { keywords: ["take profit", "take profit!", "ทำกำไร"], word: "Take Profit (จุดทำกำไร)", desc: "การตัดสินใจขายสินทรัพย์ที่ราคาปรับตัวสูงขึ้น เพื่อเก็บเกี่ยวผลกำไรเข้ากระเป๋าตามเป้าหมายแผนที่วางไว้" },
  { keywords: ["cut loss", "คัทลอส"], word: "Cut Loss (ตัดขาดทุน)", desc: "การตัดสินใจขายสินทรัพย์ออกมาในระดับราคาที่ต่ำกว่าทุน เพื่อจำกัดเพดานการขาดทุนไม่ให้เกินกว่าเกณฑ์หรือระบบที่ได้วางแผนไว้" },
  { keywords: ["profit run", "let profit run"], word: "Let Profit Run", desc: "กฎในการลงทุนที่เน้นการถือครองสินทรัพย์ที่กำลังอยู่ในสถานะมีกำไรต่อไปเรื่อยๆ ตราบใดที่แนวโน้มของราคายังคงดำเนินไปในทิศทางนั้น" },
  { keywords: ["rebalancing", "rebalance"], word: "Rebalancing (การปรับสมดุลพอร์ต)", desc: "กระบวนการปรับสัดส่วนพอร์ตการลงทุนให้กลับมาอยู่ในเกณฑ์ที่ตั้งใจไว้ เช่น การขายสินทรัพย์ที่มูลค่าเพิ่มขึ้นไปซื้อสินทรัพย์ที่สัดส่วนลดลง" },
  { keywords: ["core port", "satellite port"], word: "Core Port & Satellite Port", desc: "กลยุทธ์การจัดพอร์ตโดยแบ่งเป็นพอร์ตหลัก (Core) สำหรับเป้าหมายหลัก และพอร์ตย่อย (Satellite) สำหรับจับจังหวะโอกาสเก็งกำไรระยะสั้น" },
  { keywords: ["barbell", "บาร์เบล"], word: "Barbell Strategy (กลยุทธ์บาร์เบล)", desc: "กลยุทธ์การจัดพอร์ตแบบสุดโต่ง 2 ฝั่ง คือแบ่งเงินก้อนใหญ่ไว้ในสินทรัพย์ที่ปลอดภัยสุดๆ และเอาเงินก้อนเล็กไปเสี่ยงให้สุดขั้ว" },
  { keywords: ["trading plan", "แผนการเทรด"], word: "Trading Plan (แผนการเทรด)", desc: "แผนการที่กำหนดจุดซื้อ จุดขาย การจัดการความเสี่ยง และเป้าหมายกำไรอย่างชัดเจนอย่างเป็นระบบก่อนลงมือซื้อขายจริง" },
  { keywords: ["leverage", "มาร์จิ้น", "margin"], word: "Leverage / Margin (คานงัดการเงิน)", desc: "การใช้เครื่องมือทางการเงินหรือการกู้ยืมเพื่อเพิ่มกำลังซื้อในการลงทุน ทำให้ผลลัพธ์ของสัดส่วนทั้งกำไรและขาดทุนถูกขยายให้ใหญ่ขึ้น" },
  { keywords: ["options", "put options", "ออปชัน"], word: "Options / Put Options", desc: "เครื่องมือทางการเงินที่ให้สิทธิ (แต่ไม่บังคับ) แก่ผู้ถือในการซื้อหรือขายสินทรัพย์อ้างอิง ในอนาคต ตามราคาที่ได้ตกลงกันไว้ล่วงหน้า" },
  { keywords: ["ฟิวเจอร์", "futures"], word: "Futures (ฟิวเจอร์ส)", desc: "สัญญาซื้อขายล่วงหน้าที่ให้ข้อผูกมัดในการซื้อหรือขายสินทรัพย์ในอนาคตตามราคาที่กำหนดไว้ มักใช้ร่วมกับ Leverage และทำกำไรได้ 2 ทิศทาง" },
  { keywords: ["short", "ชอร์ต", "แทงลง"], word: "Short Selling (การชอร์ต / แทงลง)", desc: "กระบวนการยืมสินทรัพย์มาขายในตลาดก่อน และทำการซื้อคืนในภายหลัง มักใช้เพื่อทำกำไรในสภาวะที่คาดว่าราคาจะปรับตัวลดลง" },
  { keywords: ["long", "เปิด long", "แทงขึ้น"], word: "Long Position (เปิดสถานะซื้อ / แทงขึ้น)", desc: "การเปิดสถานะซื้อโดยมีความคาดหวังว่าสินทรัพย์นั้นจะมีมูลค่าเพิ่มสูงขึ้นในอนาคต (หลักการซื้อถูกเพื่อนำไปขายแพง)" },
  { keywords: ["arbitrage"], word: "Arbitrage (การทำกำไรไร้ความเสี่ยง)", desc: "กลยุทธ์การทำกำไรจากส่วนต่างของราคาสินทรัพย์ชนิดเดียวกันในสองตลาด หรือส่วนต่างของอัตราดอกเบี้ย" },
  { keywords: ["เทรดซิ่ง", "หุ้นซิ่ง", "ซิ่ง", "day trade", "momentum"], word: "Day Trade / Momentum Trade", desc: "รูปแบบการเก็งกำไรที่เน้นรอบการซื้อขายที่รวดเร็ว โดยอาศัยจังหวะการเคลื่อนไหวและการแกว่งตัวของราคาในระยะสั้น" },
  { keywords: ["all-in", "เทหน้าตัก"], word: "All-in (เทหน้าตัก)", desc: "กลยุทธ์การจัดสรรเงินทุนที่มีอยู่ทั้งหมดไปวางไว้ในสินทรัพย์ประเภทเดียว หรือการตัดสินใจเข้าซื้อด้วยเงินก้อนใหญ่ในครั้งเดียว" },
  { keywords: ["hedging"], word: "Hedging (การป้องกันความเสี่ยง)", desc: "กลยุทธ์การลงทุนหรือเครื่องมือที่นำมาใช้เพื่อชดเชย ลดทอน หรือปกป้องพอร์ตการลงทุนหลักจากการเคลื่อนไหวของราคาที่สวนทาง" },
  
  // --- คริปโตเคอร์เรนซี (Cryptocurrency) ---
  { keywords: ["btc", "bitcoin", "digital gold"], word: "BTC (Bitcoin)", desc: "สกุลเงินดิจิทัลที่ได้รับการยอมรับในฐานะ 'ทองคำดิจิทัล' (Digital Gold) มีจุดเด่นเรื่องความจำกัดของจำนวนเหรียญ เพื่อใช้รักษามูลค่า (Store of Value)" },
  { keywords: ["eth", "ethereum", "smart contract"], word: "ETH (Ethereum)", desc: "เครือข่ายบล็อกเชนที่เป็นโครงสร้างพื้นฐานหลัก โดดเด่นด้วย 'สัญญาอัจฉริยะ' (Smart Contract) ที่เปรียบเสมือนระบบปฏิบัติการสร้างแอปไร้ตัวกลาง" },
  { keywords: ["เหรียญมีม", "meme coin", "มีม"], word: "Meme Coin (เหรียญมีม)", desc: "คริปโตเคอร์เรนซีที่ถูกสร้างขึ้นโดยมีจุดเริ่มต้นจากมุกตลก วัฒนธรรมอินเทอร์เน็ต หรือกระแสในโซเชียลมีเดีย" },
  { keywords: ["rug pull"], word: "Rug Pull", desc: "เหตุการณ์ต้มตุ๋นในโลกคริปโตที่ผู้สร้างโปรเจกต์ทำการถอนสภาพคล่องหรือหอบเงินหนีหายไปอย่างกะทันหัน ส่งผลให้เหรียญหมดมูลค่า" },
  { keywords: ["to the moon", "to the moon!"], word: "To The Moon 🚀", desc: "ศัพท์เฉพาะกลุ่มในวงการลงทุน ที่ใช้แสดงความคาดหวังหรืออธิบายสภาวะที่ราคาสินทรัพย์กำลังปรับตัวสูงขึ้นอย่างรวดเร็วและรุนแรง" },

  // --- พฤติกรรมและจิตวิทยา (Behavioral Finance & Mindset) ---
  { keywords: ["fomo", "ตกรถ"], word: "FOMO (Fear Of Missing Out)", desc: "ความรู้สึกกระวนกระวายเมื่อเห็นราคาสินทรัพย์ปรับตัวสูงขึ้น และเกิดแรงกระตุ้นที่อยากจะเข้าไปมีส่วนร่วมเพื่อไม่ให้พลาดโอกาส" },
  { keywords: ["loss aversion", "กลัวขาดทุน"], word: "Loss Aversion (โรคกลัวขาดทุน)", desc: "อคติทางจิตวิทยาที่มนุษย์จะรู้สึก 'เจ็บปวดจากการสูญเสีย' มากกว่าความรู้สึก 'ดีใจเมื่อได้รับกำไร' ในจำนวนเงินที่เท่ากัน ทำให้ไม่กล้าตัดสินใจ" },
  { keywords: ["sunk cost", "ต้นทุนจม"], word: "Sunk Cost Fallacy (อคติต้นทุนจม)", desc: "อคติการยึดติดที่ทำให้ยังคงลงทุนหรือทำสิ่งเดิมต่อไป เพียงเพราะรู้สึกเสียดายเงินหรือเวลาที่ได้สูญเสียไปแล้วในอดีต แม้พื้นฐานจะพังแล้วก็ตาม" },
  { keywords: ["anchoring bias", "anchoring"], word: "Anchoring Bias (อคติการยึดติด)", desc: "อคติทางจิตวิทยาที่เกิดขึ้นเมื่อมนุษย์ยึดติดกับข้อมูลชุดแรกที่ได้รับ (เช่น เคยเห็นราคาทำจุดสูงสุด) และนำมาใช้เป็นฐานในการตัดสินใจในปัจจุบัน" },
  { keywords: ["confirmation bias", "confirmation"], word: "Confirmation Bias (อคติการยืนยัน)", desc: "สภาวะทางจิตวิทยาที่บุคคลมีแนวโน้มจะค้นหา หรือให้น้ำหนักกับข้อมูลที่สอดคล้องกับความเชื่อหรือสิ่งที่ตัวเองถือครองอยู่เท่านั้น" },
  { keywords: ["revenge trading", "เอาคืน", "เทรดล้างแค้น"], word: "Revenge Trading (การเทรดล้างแค้น)", desc: "สภาวะอารมณ์ที่หน้ามืด พยายามจะเทรดเพื่อเอาเงินที่เพิ่งขาดทุนไปกลับคืนมาให้เร็วที่สุด ซึ่งมักนำไปสู่การตัดสินใจที่ผิดพลาดและพังกว่าเดิม" },
  { keywords: ["overtrade", "โอเวอร์เทรด", "over trade"], word: "Overtrade (การเทรดเกินตัว)", desc: "การซื้อขายที่บ่อยเกินไป หรือใช้ขนาดเงินทุนและ Leverage ในสัดส่วนที่ใหญ่เกินกว่าที่ระบบหรือแผนบริหารความเสี่ยงจะรับไหว" },
  { keywords: ["panic sell"], word: "Panic Sell (การเทขายด้วยความตกใจ)", desc: "สภาวะการเทขายสินทรัพย์ออกมาอย่างรวดเร็วและเป็นวงกว้าง ซึ่งมักมีสาเหตุมาจากความตื่นตระหนกต่อข้อมูลข่าวสาร" },
  { keywords: ["yield trap", "กับดักปันผล"], word: "Yield Trap (กับดักปันผล)", desc: "สภาวะที่สินทรัพย์แสดงตัวเลขเปอร์เซ็นต์ปันผลที่สูงมาก ซึ่งเป็นภาพลวงตาจากการที่ราคาหุ้นปรับตัวลดลงอย่างหนัก มากกว่าจะเกิดจากผลกำไรจริง" },
  { keywords: ["xd", "ex-dividend"], word: "XD (Ex-Dividend Date)", desc: "เครื่องหมายแสดงวันที่ผู้ซื้อหุ้นจะ 'ไม่มีสิทธิ' ได้รับเงินปันผลในรอบนั้นๆ (หากต้องการปันผล ต้องซื้อก่อนวันขึ้นเครื่องหมาย XD)" },
  { keywords: ["laggard"], word: "Laggard (สินทรัพย์ที่ตามหลังตลาด)", desc: "สินทรัพย์หรือหุ้นที่มีการเคลื่อนไหวของราคาช้ากว่า หรือให้ผลตอบแทนตามหลังตัวอื่นๆ ในกลุ่มอุตสาหกรรมเดียวกัน" },
  { keywords: ["black swan", "แบล็กสวอน", "ไม่คาดฝัน"], word: "Black Swan (เหตุการณ์หงส์ดำ)", desc: "ทฤษฎีที่ใช้อธิบายเหตุการณ์ที่ไม่มีใครคาดคิด โอกาสเกิดขึ้นน้อยมาก แต่เมื่อเกิดขึ้นแล้วจะส่งผลกระทบรุนแรงมหาศาลต่อตลาด" },
  { keywords: ["circuit breaker"], word: "Circuit Breaker", desc: "มาตรการหยุดการซื้อขายชั่วคราวของตลาดหลักทรัพย์ เพื่อลดความตื่นตระหนก เมื่อดัชนีตลาดปรับตัวลดลงอย่างรุนแรงตามเกณฑ์ที่กำหนด" },
  { keywords: ["bull market", "ตลาดกระทิง"], word: "Bull Market (ตลาดกระทิง)", desc: "คำศัพท์ทางเทคนิคที่ใช้เรียกสภาวะตลาดที่มีทิศทางเป็นแนวโน้มขาขึ้น (Uptrend) อย่างต่อเนื่อง คึกคักเหมือนวัวกระทิงที่ขวิดขึ้น" },
  { keywords: ["bear market", "ตลาดหมี"], word: "Bear Market (ตลาดหมี)", desc: "คำศัพท์ทางเทคนิคที่ใช้เรียกสภาวะตลาดที่มีทิศทางเป็นแนวโน้มขาลง (Downtrend) อย่างต่อเนื่อง ซึมเซาเหมือนหมีจำศีลที่ตะปบลง" },
  { keywords: ["ath", "all-time high"], word: "ATH (All-Time High)", desc: "จุดสูงสุดของราคาที่สินทรัพย์ทางการเงินนั้นๆ เคยทำได้ในประวัติศาสตร์การซื้อขาย" },
  { keywords: ["black monday", "วิกฤตจันทร์ทมิฬ"], word: "Black Monday (วันจันทร์ทมิฬ)", desc: "คำศัพท์ที่ใช้บันทึกเหตุการณ์ในประวัติศาสตร์ เมื่อดัชนีตลาดหลักทรัพย์ปรับตัวลดลงอย่างรุนแรงและฉับพลันภายในวันเดียว" },

  // --- การเงินส่วนบุคคลและไลฟ์สไตล์ (Personal Finance & Lifestyle) ---
  { keywords: ["fire", "เกษียณไว"], word: "FIRE Movement", desc: "Financial Independence, Retire Early แนวคิดการจัดสรรรายได้เพื่อออมและลงทุนในสัดส่วนที่สูงกว่าปกติ เพื่อเป้าหมายอิสรภาพทางการเงินก่อนวัยเกษียณ" },
  { keywords: ["coast fire", "fat fire"], word: "Coast / Fat FIRE", desc: "Coast FIRE คือจุดที่เงินลงทุนถึงเป้าและงอกเงยไปต่อได้เองจนเกษียณ ส่วน Fat FIRE คือการเกษียณด้วยงบประมาณสำหรับไลฟ์สไตล์ที่ใช้จ่ายสูง" },
  { keywords: ["4% rule", "กฎ 4%"], word: "4% Rule (กฎ 4%)", desc: "หลักเกณฑ์การประเมินว่า หากมีพอร์ตที่เติบโตเฉลี่ยชนะเงินเฟ้อ การถอนเงินออกมาใช้ปีละ 4% จะทำให้พอร์ตอยู่รอดได้เพียงพอตลอดช่วงชีวิต" },
  { keywords: ["time freedom", "อิสรภาพทางเวลา"], word: "Time Freedom (อิสรภาพทางเวลา)", desc: "สภาวะที่มีรายได้หรือระบบการเงินรองรับค่าใช้จ่ายเพียงพอ จนสามารถเลือกใช้เวลาในชีวิตทำสิ่งต่างๆ ได้ตามต้องการ โดยไม่ต้องผูกมัดกับงานประจำ" },
  { keywords: ["emergency fund", "สำรองฉุกเฉิน"], word: "Emergency Fund (เงินสำรองฉุกเฉิน)", desc: "เงินทุนที่แยกไว้สำหรับรองรับเหตุการณ์ที่ไม่คาดฝัน มักกำหนดไว้ที่ 3-6 เดือนของค่าใช้จ่าย เน้นเก็บในสินทรัพย์สภาพคล่องสูงถอนได้ทันที" },
  { keywords: ["pay yourself first"], word: "Pay Yourself First (จ่ายให้ตัวเองก่อน)", desc: "แนวคิดการบริหารกระแสเงินสด ที่ให้ความสำคัญกับการหักรายได้ส่วนหนึ่งไปออมหรือลงทุนเป็นลำดับแรกสุด ก่อนนำไปใช้จ่ายอื่นๆ" },
  { keywords: ["lifestyle creep", "ไลฟ์สไตล์", "กับดักไลฟ์สไตล์"], word: "Lifestyle Creep (กับดักไลฟ์สไตล์)", desc: "ปรากฏการณ์ที่มาตรฐานการใช้ชีวิตและรายจ่าย ค่อยๆ ขยับตัวสูงขึ้นตามรายได้ที่เพิ่มขึ้น ทำให้หาเงินได้เยอะแค่ไหนก็ไม่เหลือเก็บ" },
  { keywords: ["rat race", "สนามแข่งหนู"], word: "Rat Race (สนามแข่งหนู)", desc: "วงจรสถานะทางการเงินของวัยทำงานที่วนเวียนอยู่กับการทำงานหาเงินเพื่อนำไปชำระหนี้สินและค่าใช้จ่ายประจำเดือนต่อเดือน" },
  { keywords: ["ภาษีสังคม", "ซองงานแต่ง", "งานบวช"], word: "Social Tax (ภาษีสังคม)", desc: "ค่าใช้จ่ายทางอ้อมที่เกิดจากการเข้าร่วมกิจกรรมทางสังคม หรือการรักษาความสัมพันธ์ตามบรรทัดฐานของสังคม เช่น ใส่ซองงานแต่ง" },
  { keywords: ["play money", "เงินเที่ยว"], word: "Play Money (กองทุนซื้อความสุข)", desc: "การแบ่งสัดส่วนเงินทุนไว้ต่างหาก สำหรับนำไปจัดสรรใช้จ่ายหรือซื้อประสบการณ์ตามความชอบ เพื่อไม่ให้งบไปกระทบกับพอร์ตเกษียณหลัก" },
  { keywords: ["e-saving", "ออมทรัพย์ดิจิทัล"], word: "e-Saving (ออมทรัพย์ดิจิทัล)", desc: "บัญชีเงินฝากออมทรัพย์รูปแบบดิจิทัล (เปิดผ่านแอป) ที่มักมีโครงสร้างอัตราดอกเบี้ยสูงกว่าบัญชีออมทรัพย์แบบมีสมุดคู่ฝากปกติ" },
  { keywords: ["rmf", "tesg", "ลดหย่อนภาษี", "ssf"], word: "RMF / TESG / SSF", desc: "กองทุนรวมที่ออกแบบมาเพื่อส่งเสริมการออมระยะยาว โดยภาครัฐให้สิทธิประโยชน์ในการนำยอดซื้อไปลดหย่อนภาษีตามเงื่อนไขที่กำหนด" },
  { keywords: ["refinance", "retention"], word: "Refinance / Retention", desc: "กระบวนการขอลดอัตราดอกเบี้ยสินเชื่อ (Refinance คือการรีไฟแนนซ์ย้ายไปธนาคารแห่งใหม่, Retention คือการขอลดอัตราดอกเบี้ยกับธนาคารเดิม)" },
  { keywords: ["mrr", "ลอยตัว", "floating rate"], word: "MRR / Floating Rate", desc: "อัตราดอกเบี้ยเงินกู้แบบลอยตัว ที่สามารถปรับอัตราขึ้นหรือลงได้ตามประกาศนโยบายของธนาคารพาณิชย์ในช่วงเวลานั้นๆ" },
  { keywords: ["แฮร์คัท", "haircut"], word: "Haircut (การแฮร์คัทหนี้)", desc: "กระบวนการเจรจาประนอมหนี้ที่เจ้าหนี้ยินยอมลดมูลค่าของยอดหนี้สินลงบางส่วน เพื่อให้ลูกหนี้มีความสามารถในการปิดยอดหนี้ได้" },
  { keywords: ["subscription", "รายเดือน", "ซับสคริปชัน", "สตรีมมิ่ง"], word: "Subscription (ระบบสมัครสมาชิก)", desc: "โมเดลธุรกิจที่ใช้วิธีเรียกเก็บค่าบริการเป็นรอบระยะเวลาต่อเนื่อง (เช่น ตัดบัตรรายเดือน) เพื่อแลกกับสิทธิในการเข้าถึงแอปหรือบริการ" },
  { keywords: ["flip", "ฟลิป", "ใบดาวน์"], word: "Flip (ฟลิปคอนโด / ขายใบดาวน์)", desc: "กลยุทธ์การซื้อสินทรัพย์ (เช่น ใบจองคอนโด) และดำเนินการขายเปลี่ยนมืออย่างรวดเร็วเพื่อทำกำไรจากส่วนต่างราคาก่อนถึงเวลารับโอนจริง" },
  { keywords: ["art toy", "อาร์ตทอย"], word: "Art Toy (อาร์ตทอย)", desc: "ผลงานประติมากรรมในรูปแบบของเล่นสะสมที่ออกแบบโดยศิลปิน มักผลิตขึ้นในจำนวนจำกัด ทำให้เกิดระบบการประเมินมูลค่าในตลาดนักสะสม" },
  { keywords: ["resell", "รีเซล"], word: "Resell (การขายต่อ)", desc: "กระบวนการนำสินค้าที่มีความต้องการสูงในตลาด (เช่น อาร์ตทอย, บัตคอนเสิร์ต) มาจำหน่ายต่อในตลาดรองด้วยราคาที่ถูกอัปขึ้นไปจากราคาป้าย" },

  // --- ทักษะและธุรกิจ (Business & Future Skills) ---
  { keywords: ["high-income skill", "high income"], word: "High-Income Skill (ทักษะรายได้สูง)", desc: "ทักษะเฉพาะทางที่มีมูลค่าสูงในตลาดแรงงาน หรือสามารถนำไปสเกลสร้างรายได้จำนวนมากได้โดยไม่ต้องใช้เงินทุนสูง (เช่น ทักษะการขาย, เขียนโค้ด)" },
  { keywords: ["specific knowledge", "ความรู้เฉพาะทาง"], word: "Specific Knowledge (ความรู้เฉพาะทาง)", desc: "ทักษะเฉพาะตัวที่ตกผลึกจากประสบการณ์ความเชี่ยวชาญส่วนบุคคล ซึ่งเป็นมิติที่ยากต่อการลอกเลียนแบบหรือทดแทนด้วยเครื่องจักร" },
  { keywords: ["sweat equity", "ลงแรง"], word: "Sweat Equity (การลงแรงแลกหุ้น)", desc: "การใช้แรงงาน เวลา หรือความสามารถส่วนตัวเข้าไปร่วมสร้างธุรกิจ แทนการใช้เงินทุน เพื่อแลกกับสัดส่วนความเป็นเจ้าของบริษัท" },
  { keywords: ["side hustle", "งานเสริม"], word: "Side Hustle / Side Business", desc: "โปรเจกต์เชิงพาณิชย์หรืองานอิสระที่ลงมือทำควบคู่ไปกับงานประจำ เพื่อเป็นแหล่งรายได้เพิ่มเติมและลดความเสี่ยงจากการพึ่งพารายได้ทางเดียว" },
  { keywords: ["personal branding", "สร้างตัวตน", "สร้างแบรนด์"], word: "Personal Branding (การสร้างแบรนด์บุคคล)", desc: "กระบวนการสร้างและสื่อสารภาพลักษณ์ ตัวตน หรือความเชี่ยวชาญเฉพาะทางผ่านสื่อต่างๆ เพื่อให้กลุ่มเป้าหมายเกิดการรับรู้และเชื่อถือ" },
  { keywords: ["content pillar", "คอนเทนต์พิลลาร์"], word: "Content Pillar (แกนคอนเทนต์)", desc: "กลุ่มหัวข้อหลักหรือโครงสร้างเนื้อหา ที่ถูกกำหนดขึ้นเพื่อใช้เป็นเข็มทิศในการควบคุมทิศทางคอนเทนต์ของช่อง โซเชียล หรือแบรนด์" },
  { keywords: ["algorithm", "อัลกอริทึม"], word: "Algorithm (อัลกอริทึม)", desc: "ชุดคำสั่งและตรรกะของแพลตฟอร์มโซเชียลมีเดีย ที่ใช้คำนวณพฤติกรรมเพื่อคัดกรองและนำเสนอเนื้อหาให้ตรงกับความสนใจของผู้ใช้งาน" },
  { keywords: ["engagement", "ยอดไลก์", "คอมเมนต์"], word: "Engagement (การมีส่วนร่วม)", desc: "ตัวชี้วัดเชิงปริมาณทางโซเชียลมีเดีย ที่แสดงถึงระดับการมีส่วนร่วมของผู้ชมที่มีต่อเนื้อหา เช่น การกดไลก์ คอมเมนต์ หรือแชร์" },
  { keywords: ["affiliate", "นายหน้า", "แปะตะกร้า"], word: "Affiliate (การตลาดแบบนายหน้า)", desc: "รูปแบบการตลาดที่ผู้แนะนำจะได้รับส่วนแบ่งหรือค่าคอมมิชชัน เมื่อมีผู้ใช้งานกดคลิกลิงก์และทำการสั่งซื้อสินค้าหรือบริการสำเร็จ" },
  { keywords: ["business model", "โมเดลธุรกิจ"], word: "Business Model (โมเดลธุรกิจ)", desc: "แบบจำลองเชิงกลยุทธ์ที่อธิบายโครงสร้างพื้นฐานว่า องค์กรจะสร้างคุณค่า ส่งมอบ และเปลี่ยนคุณค่านั้นเป็นรายได้ด้วยวิธีใด" },
  { keywords: ["exit strategy", "ทางออก"], word: "Exit Strategy (กลยุทธ์ทางออก)", desc: "กลยุทธ์ที่ถูกวางแผนไว้ล่วงหน้า สำหรับการถอนตัวจากการลงทุนหรือธุรกิจ เช่น การนำบริษัทเข้าตลาด (IPO) การขายกิจการ หรือการปิดตัว" },
  { keywords: ["นิติบุคคล", "จดบริษัท"], word: "Legal Entity (นิติบุคคล)", desc: "องค์กรหรือกลุ่มบุคคลที่กฎหมายรับรองให้มีสถานะ สิทธิ และหน้าที่ (รวมถึงการเสียภาษี) แยกต่างหากจากบุคคลธรรมดาที่เป็นเจ้าของ" },
  { keywords: ["audit", "ตรวจสอบ"], word: "Audit (การตรวจสอบ)", desc: "กระบวนการตรวจสอบและประเมินความถูกต้องตามมาตรฐาน ไม่ว่าจะเป็นการตรวจงบการเงิน หรือการประเมินประสิทธิภาพของพอร์ตลงทุน" },
  { keywords: ["หนังสือชี้ชวน", "prospectus", "filing", "ไฟลิ่ง"], word: "Prospectus / Filing (หนังสือชี้ชวน)", desc: "เอกสารทางกฎหมายที่รวบรวมข้อมูลสำคัญของบริษัท โครงสร้างผู้ถือหุ้น และความเสี่ยง เพื่อให้นักลงทุนใช้ศึกษาประกอบการตัดสินใจก่อนลงทุน" },
  { keywords: ["56-1", "แบบฟอร์ม 56-1"], word: "Form 56-1 (แบบฟอร์ม 56-1)", desc: "แบบแสดงรายการข้อมูลประจำปีที่บริษัทจดทะเบียนต้องยื่นต่อ ก.ล.ต. ซึ่งรวบรวมข้อมูลธุรกิจและผลการดำเนินงานให้นักลงทุนเข้าถึงได้" },
  { keywords: ["family office"], word: "Family Office", desc: "หน่วยงานที่จัดตั้งขึ้นเป็นการส่วนตัว เพื่อบริหารจัดการความมั่งคั่ง โครงสร้างภาษี และการลงทุนของตระกูลระดับมหาเศรษฐีโดยเฉพาะ" },
  { keywords: ["แชร์ลูกโซ่", "ponzi scheme"], word: "Ponzi Scheme (แชร์ลูกโซ่)", desc: "รูปแบบหลอกลวงที่นำกระแสเงินสดจากนักลงทุนรายใหม่มาจ่ายเป็นผลตอบแทนให้นักลงทุนรายเก่า โดยไม่ได้นำเงินไปทำธุรกิจที่สร้างกำไรจริง" },
  { keywords: ["fed", "เฟด"], word: "FED (ธนาคารกลางสหรัฐ)", desc: "Federal Reserve ระบบธนาคารกลางของสหรัฐอเมริกา ผู้มีอำนาจและหน้าที่กำหนดทิศทางนโยบายทางการเงินและอัตราดอกเบี้ยซึ่งกระทบตลาดทั่วโลก" },
  { keywords: ["automation", "ระบบอัตโนมัติ"], word: "Automation (ระบบอัตโนมัติ)", desc: "การนำเทคโนโลยี ซอฟต์แวร์ หรือโค้ด เข้ามาผูกระบบ เพื่อให้กระบวนการทำงานสามารถดำเนินต่อไปได้เองอย่างต่อเนื่องตามเงื่อนไขที่ตั้งไว้" },
  { keywords: ["ai", "เอไอ"], word: "AI (Artificial Intelligence)", desc: "ปัญญาประดิษฐ์ ระบบคอมพิวเตอร์ที่ถูกพัฒนาให้สามารถประมวลผล เรียนรู้ และวิเคราะห์ข้อมูลจำนวนมากเพื่อช่วยทุ่นแรงมนุษย์ในการทำงาน" },
  { keywords: ["agi"], word: "AGI (Artificial General Intelligence)", desc: "ปัญญาประดิษฐ์ขั้นสูง ที่มีระดับความสามารถในการเรียนรู้และแก้ปัญหาเทียบเท่าหรือเก่งกว่าสมองมนุษย์ในทุกๆ มิติ" },

  // --- การพัฒนาตนเองและปรัชญา (Self-Development & Philosophy) ---
  { keywords: ["deep work", "สมาธิจดจ่อ"], word: "Deep Work (การทำงานแบบจดจ่อขั้นสุด)", desc: "สภาวะการทำงานที่อาศัยสมาธิอย่างลึกซึ้ง โดยตัดสิ่งรบกวนภายนอกออกทั้งหมด เพื่อมุ่งเน้นการสร้างผลผลิตที่ซับซ้อนและมีคุณภาพสูง" },
  { keywords: ["the gap and the gain", "gap and gain", "the gap & the gain", "gap & gain", "the gap"], word: "The Gap and The Gain", desc: "กรอบความคิดจิตวิทยาที่แบ่งสัดส่วนการประเมินตัวเองเป็น The Gap (การมองแต่ช่องว่างสิ่งที่ยังขาด) และ The Gain (ชื่นชมความก้าวหน้าที่ทำสำเร็จแล้ว)" },
  { keywords: ["soundtracks", "เสียงในหัว"], word: "Soundtracks (เสียงในหัว)", desc: "ความเชื่อ หรือบทสนทนาภายในหัว ที่เปิดวนซ้ำๆ ซึ่งสะท้อนและมีผลตีกรอบกระบวนการคิดและพฤติกรรมการตัดสินใจในชีวิตจริง" },
  { keywords: ["delayed gratification", "อดเปรี้ยวไว้กินหวาน"], word: "Delayed Gratification (การอดเปรี้ยวไว้กินหวาน)", desc: "กลไกทางจิตวิทยาในการชะลอหรือปฏิเสธความพึงพอใจกิเลสในระยะสั้น เพื่อนำไปสู่ผลลัพธ์ที่มีมูลค่าและความคุ้มค่ามากกว่าในระยะยาว" },
  { keywords: ["wheel of life", "วงล้อชีวิต"], word: "Wheel of Life (วงล้อชีวิต)", desc: "เครื่องมือประเมินตนเอง ที่ใช้จำแนกและให้คะแนนระดับความพึงพอใจในมิติต่างๆ ของการดำเนินชีวิต (เช่น การเงิน สุขภาพ ความสัมพันธ์) เพื่อหาสมดุล" },
  { keywords: ["dying with zero"], word: "Dying with Zero", desc: "แนวทางการวางแผนการเงินที่มุ่งเน้นการจัดสรรเงินทุนเพื่อสร้างประสบการณ์ชีวิตในจังหวะเวลาที่เหมาะสม แทนการกอดสะสมตัวเลขไว้จนวันตาย" },
  { keywords: ["yolo", "ใช้ชีวิตให้คุ้ม"], word: "YOLO (You Only Live Once)", desc: "แนวคิดการใช้ชีวิตที่ยึดหลักว่าเรามีชีวิตเพียงครั้งเดียว จึงให้ความสำคัญกับการเก็บเกี่ยวความสุขหรือทำตามความรู้สึกในปัจจุบันให้เต็มที่" },
  { keywords: ["ubi", "universal basic income"], word: "UBI (Universal Basic Income)", desc: "แนวคิดสวัสดิการทางเศรษฐกิจ ที่รัฐจะแจกเงินจำนวนพื้นฐานสำหรับการดำรงชีพให้กับประชาชนทุกคนอย่างสม่ำเสมอ โดยไม่มีเงื่อนไขข้อผูกมัด" },
  { keywords: ["ko-fi", "kofi"], word: "Ko-fi", desc: "แพลตฟอร์มออนไลน์ที่เปิดพื้นที่ให้ครีเอเตอร์สามารถรับการสนับสนุน (Donate) เป็นเงินจากแฟนคลับ หรือใช้เป็นระบบตะกร้าสำหรับจัดจำหน่ายผลงานดิจิทัล" },
  { keywords: ["e-book", "อีบุ๊ก"], word: "E-book (หนังสืออิเล็กทรอนิกส์)", desc: "Electronic Book สิ่งพิมพ์ที่ถูกจัดทำและนำเสนอในรูปแบบไฟล์ดิจิทัล ซึ่งสามารถเปิดอ่านหรือวางจำหน่ายได้บนอุปกรณ์อิเล็กทรอนิกส์" },
  { 
    keywords: ["หุ้นแก๊งนางฟ้า", "แก๊งนางฟ้า", "magnificent 7", "mag 7"], 
    word: "Magnificent 7 (หุ้นแก๊งนางฟ้า)", 
    desc: "กลุ่มหุ้นบริษัทเทคโนโลยีขนาดใหญ่ยักษ์ของสหรัฐฯ 7 แห่งที่มีอิทธิพลสูงต่อทิศทางตลาดโลก (เช่น Apple, Microsoft, Alphabet, Amazon, Nvidia, Meta, Tesla) ซึ่งมักเป็นผู้นำด้านนวัตกรรมและ AI" 
  },
  { keywords: ["capital gain", "ส่วนต่างราคา", "capital loss"], word: "Capital Gain / Loss (กำไร/ขาดทุนจากส่วนต่างราคา)", desc: "ผลต่างที่เกิดจากการนำมูลค่าปัจจุบันของสินทรัพย์มาหักลบกับต้นทุนเริ่มต้น หากราคาขึ้นจะเรียกว่า Capital Gain (กำไร) และถ้าราคาลงจะเรียกว่า Capital Loss (ขาดทุน)" },
  { keywords: ["hard asset", "สินทรัพย์แข็ง"], word: "Hard Asset (สินทรัพย์ที่มีมูลค่าในตัวเอง)", desc: "สินทรัพย์ที่มีตัวตนหรือมีคุณสมบัติจำกัดในทางคณิตศาสตร์ (เช่น ที่ดิน ทองคำ) ซึ่งทนทานต่อการเสื่อมค่าและไม่สามารถถูกสร้างขึ้นใหม่ได้ง่ายๆ ด้วยนโยบายทางการเงิน" },{ keywords: ["digital gold", "ทองคำดิจิทัล"], word: "Digital Gold (ทองคำดิจิทัล)", desc: "สถานะที่ถูกยกย่องให้แก่ Bitcoin (BTC) เนื่องจากมีคุณสมบัติคล้ายทองคำ คือมีจำนวนจำกัด ไม่สามารถพิมพ์เพิ่มได้ และใช้เป็นสินทรัพย์รักษามูลค่า (Store of Value) หลบภัยจากเงินเฟ้อ" },
  // --- ศัพท์เพิ่มเติมที่เจอใน Scenarios ---
  { keywords: ["giving account", "งบบริจาค", "งบทำบุญ"], word: "Giving Account (บัญชีเพื่อการให้)", desc: "การแบ่งสัดส่วนรายได้ (เช่น 5-10%) แยกไว้เป็นกองทุนสำหรับการบริจาค ทำบุญ หรือช่วยเหลือผู้อื่นโดยเฉพาะ เพื่อให้สามารถทำดีได้โดยไม่กระทบแผนการเงินส่วนตัว" },
  { keywords: ["burnout", "หมดไฟ", "ภาวะหมดไฟ"], word: "Burnout Syndrome (ภาวะหมดไฟ)", desc: "ภาวะเหนื่อยล้าทางอารมณ์และจิตใจอย่างรุนแรงอันเกิดจากความเครียดสะสมจากการทำงานหรือทำสิ่งใดสิ่งหนึ่งหนักเกินไป จนส่งผลให้หมดแรงจูงใจ" },
  { keywords: ["reskill", "รีสกิล", "อัปสกิลอาชีพ"], word: "Reskill (การสร้างทักษะใหม่)", desc: "กระบวนการเรียนรู้ทักษะใหม่ๆ ที่แตกต่างไปจากความถนัดเดิมอย่างสิ้นเชิง เพื่อปรับตัวให้เข้ากับเทคโนโลยี สายงานใหม่ หรือเพิ่มโอกาสในการหารายได้" },
  { keywords: ["track record", "ประวัติผลงาน", "แทรคเรคคอร์ด"], word: "Track Record (ประวัติผลการดำเนินงาน)", desc: "สถิติหรือผลงานในอดีตที่ผ่านมา ซึ่งถูกบันทึกไว้เป็นหลักฐานเพื่อใช้ประเมินความเชี่ยวชาญ ความน่าเชื่อถือ หรือความสม่ำเสมอของผลตอบแทน" },
  { keywords: ["watchlist", "วอชลิสต์"], word: "Watchlist (รายการที่เฝ้าติดตาม)", desc: "รายการสินทรัพย์หรือหุ้นที่นักลงทุนได้ทำการศึกษาข้อมูลพื้นฐานไว้แล้ว และจดบันทึกไว้เพื่อเฝ้าติดตามราคา รอจังหวะที่เหมาะสมในการเข้าลงทุน" }

];

// 🗂️ แยกตะกร้าคำถามตามช่วงชีวิต (รวม 100 ข้อ - อัปเดตจัดหมวดหมู่ใหม่)
const levelMapping = {
  level1: [8, 9, 11, 13, 14, 15, 18, 21, 24, 32, 33, 36, 39, 41, 43, 45, 47, 49, 50, 51, 52, 53, 54, 67, 68, 69, 70, 76, 77, 79, 81, 95, 100],
  level2: [1, 2, 3, 5, 6, 7, 16, 17, 19, 22, 23, 28, 30, 35, 37, 38, 40, 44, 55, 57, 58, 59, 60, 73, 74, 75, 78, 83, 84, 91, 92, 97],
  level3: [4, 10, 12, 20, 25, 26, 27, 29, 31, 34, 42, 46, 48, 56, 61, 62, 63, 64, 65, 66, 71, 72, 80, 82, 85, 86, 87, 88, 89, 90, 93, 94, 96, 98, 99]
};

export default function Home() {
  const [gameState, setGameState] = useState<"start" | "playing" | "loading" | "result">("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{risk: number, disc: number, choiceIndex: number}[]>([]);
  
  const [nickname, setNickname] = useState("");
  const [persona, setPersona] = useState<string | null>(null); 
  const [isCapturing, setIsCapturing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeScenarios, setActiveScenarios] = useState<any[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [showJargon, setShowJargon] = useState(false); 
  
  const [matrixRotation, setMatrixRotation] = useState(0);

  const printRef = useRef<HTMLDivElement>(null);
  const TOTAL_QUESTIONS = 10; 

  const handleStart = () => {
    if (!persona) { alert("เลือกทรงทางการเงินของคุณก่อนนะ!"); return; }
    if (!nickname.trim()) { alert("พิมพ์ชื่อเล่นของคุณก่อนนะ!"); return; }
    
    // 🎯 ดึงคำถามแยกตาม Level
    const l1Questions = scenarios.filter(q => levelMapping.level1.includes(q.id));
    const l2Questions = scenarios.filter(q => levelMapping.level2.includes(q.id));
    const l3Questions = scenarios.filter(q => levelMapping.level3.includes(q.id));

    // 🎯 สุ่มข้อในแต่ละ Level และตัดมาตามโควต้า 3-4-3
    const pickedL1 = shuffleArray(l1Questions).slice(0, 3); // ด่านฝ่ากิเลส 3 ข้อ
    const pickedL2 = shuffleArray(l2Questions).slice(0, 4); // ด่านลงทุน 4 ข้อ
    const pickedL3 = shuffleArray(l3Questions).slice(0, 3); // ด่านจิตวิทยา 3 ข้อ

    // 🎯 รวมคำถาม โดยเรียงจาก Level 1 -> 2 -> 3 เพื่อให้รู้สึกเหมือนเติบโตขึ้น
    const journeyQuestions = [...pickedL1, ...pickedL2, ...pickedL3];

    setActiveScenarios(journeyQuestions);
    setAnswers([]); 
    setCurrentIndex(0);
    setGameState("playing");
  };

const handleChoice = async (riskPoint: number, discPoint: number, index: number) => {
  if (isTransitioning) return;
  setIsTransitioning(true);

  const newAnswers = [...answers];
  newAnswers[currentIndex] = { risk: riskPoint, disc: discPoint, choiceIndex: index };
  setAnswers(newAnswers);

  if (currentIndex < TOTAL_QUESTIONS - 1) {
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsTransitioning(false); 
    }, 250);
  } else {
    // 1. คำนวณคะแนนรวม
    // 1. คำนวณคะแนนรวม
    const finalRiskScore = newAnswers.reduce((sum, ans) => sum + (ans?.risk || 0), 0);
    const finalDiscScore = newAnswers.reduce((sum, ans) => sum + (ans?.disc || 0), 0);
    
    // ✨ ปรับเกณฑ์ใหม่ บีบแกนกลางให้แคบลง (เต็ม 10 คะแนน)
    // LOW: <= 4.0 | MID: 4.5 - 5.5 | HIGH: >= 6.0
    const r = finalRiskScore <= 4.0 ? "LOW" : finalRiskScore < 6.0 ? "MID" : "HIGH";
    const d = finalDiscScore <= 4.0 ? "LOW" : finalDiscScore < 6.0 ? "MID" : "HIGH";
    const finalKey = `${r}_RISK_${d}_DISC`;

    // 2. ✨ สร้างชุดข้อมูล Q&A แบบละเอียด
    const detailedResults = activeScenarios.map((scenario, i) => {
      const selectedChoice = scenario.choices[newAnswers[i].choiceIndex];
      return {
        q_id: scenario.id,
        npc: scenario.npcName,
        question: scenario.message, // เก็บตัวประโยคคำถาม
        answer: selectedChoice.text, // เก็บตัวประโยคคำตอบที่เลือก
        points: { risk: selectedChoice.risk, disc: selectedChoice.disc }
      };
    });

    // 3. ยิงข้อมูลทั้งหมดเข้า Firebase
    await saveDataToFirebase(
      nickname, 
      persona, 
      finalKey, 
      finalRiskScore, 
      finalDiscScore, 
      detailedResults // <--- ส่งก้อนประวัติไปด้วย
    );

    setIsTransitioning(false);
    setGameState("loading");
    setTimeout(() => setGameState("result"), 2500);
  }
};

  const handleBack = () => {
    if (currentIndex > 0 && !isTransitioning) setCurrentIndex((prev) => prev - 1);
  };

  const handleForward = () => {
    if (answers[currentIndex] !== undefined && currentIndex < TOTAL_QUESTIONS - 1 && !isTransitioning) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleMatrixClick = () => setMatrixRotation(prev => prev + 360);

const getFinalResultKey = () => {
    const riskScore = answers.reduce((sum, ans) => sum + ans.risk, 0);
    const discScore = answers.reduce((sum, ans) => sum + ans.disc, 0);
    
    // ✨ ปรับเกณฑ์ใหม่เหมือนใน handleChoice
    const r = riskScore <= 4.0 ? "LOW" : riskScore < 6.0 ? "MID" : "HIGH";
    const d = discScore <= 4.0 ? "LOW" : discScore < 6.0 ? "MID" : "HIGH";
    
    return `${r}_RISK_${d}_DISC`;
  };

  const currentResultKey = gameState === "result" ? getFinalResultKey() : null;
  const currentResult = currentResultKey ? resultData[currentResultKey as keyof typeof resultData] : null;

  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    setIsCapturing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const dataUrl = await toPng(printRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: "#FCFBF8" });
      const link = document.createElement("a");
      link.download = `Money-DNA-${nickname}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเซฟรูป ลองแคปหน้าจอแทนนะครับ");
    } finally {
      setIsCapturing(false);
    }
  };

const resetGame = () => {
    setNickname(""); 
    setPersona(null); 
    setAnswers([]); 
    setGameState("start"); 
    setMatrixRotation(0);
    setIsTransitioning(false); // ✨ แก้บั๊ก: เคลียร์ค่าตัวล็อกปุ่มเมื่อเริ่มเกมใหม่
  };

  const getMatrixClass = (key: string) => {
    const isActive = currentResultKey === key;
    return `h-10 rounded-lg flex justify-center items-center text-[10px] font-bold transition-all ${
      isActive 
      ? 'bg-amber-400 text-stone-900 shadow-md ring-2 ring-amber-500 scale-[1.08] z-10' 
      : 'bg-white text-stone-400'
    }`;
  };

// ✨ ฟังก์ชันค้นหาศัพท์ยาก (รองรับทั้งตอนเล่นควิซ และหน้าผลลัพธ์)
const getCurrentJargons = () => {
  let textPool = "";

  if (gameState === "playing" && activeScenarios[currentIndex]) {
    const currentQ = activeScenarios[currentIndex];
    textPool = [
      currentQ.npcName,
      currentQ.role,
      currentQ.message,
      ...currentQ.choices.map((c: any) => c.text)
    ].join(" ").toLowerCase();
  } else if (gameState === "result" && currentResult) {
    // ✨ ดึง Text ทั้งหมดในหน้าผลลัพธ์มาสแกนหาศัพท์ยาก
    textPool = [
      currentResult.title,
      currentResult.subtitle,
      currentResult.desc,
      currentResult.motto,
      currentResult.bestPartner.name,
      currentResult.bestPartner.desc,
      currentResult.kryptonite.name,
      currentResult.kryptonite.desc
    ].join(" ").toLowerCase();
  } else {
    return [];
  }

  // กรอง Dictionary
  return jargonDict.filter(jargon => {
    return jargon.keywords.some(kw => {
      const keyword = kw.toLowerCase().trim();
      if (/^[a-z0-9\s&%]+$/.test(keyword)) {
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?:^|[^a-zA-Z0-9])(${escapedKeyword})(?:$|[^a-zA-Z0-9])`, 'i');
        return regex.test(textPool);
      }
      return textPool.includes(keyword);
    });
  });
};
  

  const activeJargons = getCurrentJargons();

  return (
    <div className={`min-h-[100dvh] bg-stone-950 flex flex-col items-center justify-center sm:p-4 ${promptFont.className}`}>
     <div className={`w-full max-w-md shadow-2xl overflow-hidden h-[100dvh] sm:h-[850px] flex flex-col relative sm:rounded-[2.5rem] sm:border-[4px] sm:border-stone-800 ${gameState === 'playing' ? 'bg-[#F4F3ED]' : 'bg-[#FCFBF8]'}`}>
        
        {/* === 1. START SCREEN === */}
        {gameState === "start" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-6 sm:p-8 bg-gradient-to-br from-[#FCFBF8] via-[#F4EDE4] to-[#E8DCC4] overflow-y-auto">
            <div className="flex flex-col items-center justify-center text-center pt-2 pb-4">
              
              <div className="w-full max-w-[320px] mb-4 relative">
                <Image src="/money-avatar-logo.png" alt="Money Avatar จะรวย หรือ ซวย" width={500} height={200} className="w-full h-auto drop-shadow-md" priority />
              </div>

              <button onClick={() => setShowInfo(true)} className="mb-6 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-100/80 hover:bg-amber-200 px-3 py-1.5 rounded-full transition-colors border border-amber-300/50 shadow-sm">
                <Info size={14} /> ทรง AVATAR ทางการเงิน
              </button>

              <div className="w-full bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-red-200 mb-6 flex items-start gap-3 text-left">
                <span className="text-2xl mt-0.5 drop-shadow-sm">⚠️</span>
                <div>
                  <p className="font-bold text-red-600 text-[13px] mb-1">คำเตือน</p>
                  <p className="text-[12px] text-stone-600 leading-relaxed font-light">
                    โปรดใช้วิจารณญาณก่อนการใช้เงิน เพื่อหาสไตล์ตัวเอง กดเลือก <span className="font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">"ตามสัญชาตญาณ"</span> คิดเยอะๆ เพราะเงินคุณไม่ใช่เงินผม !
                  </p>
                </div>
              </div>

              <div className="w-full mb-6">
                <label className="block text-[13px] font-bold text-stone-700 mb-3 text-center uppercase tracking-wider">คุณมาในทรงไหน?</label>
                <div className="grid grid-cols-4 gap-2">
                  {personaOptions.map((opt) => (
                    <button key={opt.id} onClick={() => setPersona(opt.id)} className={`py-3 px-1 rounded-xl font-bold flex flex-col items-center justify-center transition-all duration-300 ${persona === opt.id ? "bg-stone-900 text-amber-400 shadow-md border-transparent scale-105 -translate-y-1" : "bg-white text-stone-500 border border-stone-200 hover:border-amber-300 shadow-sm"}`}>
                      <span className="text-[24px] mb-1">{opt.emoji}</span>
                      <span className="text-[11px] leading-tight text-center">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full space-y-4 mb-2">
                <input type="text" placeholder="พิมพ์ชื่อเล่นของคุณ..." value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full px-5 py-4 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-center font-semibold text-stone-800 transition-all bg-white/80 backdrop-blur-sm shadow-inner" />
                <button onClick={handleStart} className="w-full bg-gradient-to-r from-stone-900 to-stone-800 hover:from-black hover:to-stone-900 text-amber-400 font-bold py-4 rounded-xl shadow-xl transition-all active:scale-95 border border-stone-700 tracking-wide">🌍 เปิดโลกการเงิน</button>
              </div>
               <DisclaimerFooter />
              <div className="mt-6 text-center text-[10px] font-medium text-stone-500/70 uppercase tracking-widest">
                Created by <span className="font-bold text-stone-600">อัพสกิลกับฟุ้ย</span>
              </div>
             
            </div>
          </motion.div>
        )}

        {/* === 2. PLAYING SCREEN === */}
        {gameState === "playing" && activeScenarios.length > 0 && (
          <div className="flex flex-col h-full bg-[#F4F3ED]">
            <div className="bg-stone-950 text-white px-3 py-3 flex items-center justify-between shadow-md shrink-0 border-b border-amber-500/20">
              
              <div className="flex items-center gap-2 max-w-[65%]">
                {currentIndex > 0 && (
                  <button onClick={handleBack} className="p-2 mr-1 bg-stone-800/80 text-stone-300 hover:text-white rounded-full transition-all active:scale-90 shrink-0 border border-stone-700/50">
                    <ArrowLeft size={16} />
                  </button>
                )}
                
                <div className="text-xl bg-gradient-to-br from-stone-800 to-stone-900 p-2 rounded-full w-10 h-10 flex items-center justify-center border border-stone-700 shadow-inner shrink-0">
                  {activeScenarios[currentIndex]?.avatar}
                </div>
                <div className="overflow-hidden">
                  <h2 className="font-semibold text-[13px] text-stone-100 truncate w-full">{activeScenarios[currentIndex]?.npcName}</h2>
                  <p className="text-[10px] text-amber-400 font-light tracking-wide truncate w-full">{activeScenarios[currentIndex]?.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button 
                  onClick={() => setShowJargon(true)} 
                  className="p-1.5 bg-stone-800/80 text-[#00bfff] hover:text-white hover:bg-stone-700 rounded-full transition-all active:scale-90 shrink-0 border border-stone-700/50 relative"
                >
                  <BookOpen size={16} />
                  {activeJargons.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 w-2.5 h-2.5 rounded-full border border-stone-900 animate-pulse"></span>
                  )}
                </button>

                <div className="text-[10px] font-bold text-amber-300 bg-stone-800/80 px-2.5 py-1 rounded-full border border-amber-500/30 shrink-0">
                  {currentIndex + 1} / {TOTAL_QUESTIONS}
                </div>
                {answers[currentIndex] !== undefined && currentIndex < TOTAL_QUESTIONS - 1 && (
                  <button onClick={handleForward} className="p-1.5 bg-stone-800/80 text-amber-400 hover:text-white hover:bg-stone-700 rounded-full transition-all active:scale-90 shrink-0 border border-stone-700/50">
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 p-5 overflow-y-auto flex flex-col justify-center min-h-[250px]"> 
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="bg-stone-800 p-6 pt-7 rounded-2xl shadow-xl w-full max-w-[92%] border-l-4 border-amber-400 relative mx-auto my-auto"
                >
                  <div className="absolute -top-3 left-4 bg-amber-400 text-stone-900 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm">
                    <AlertTriangle size={12}/> Situation
                  </div>
                  <p className="text-[15px] text-center leading-relaxed font-medium text-stone-100 drop-shadow-sm">
                    {activeScenarios[currentIndex]?.message}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="bg-[#FCFBF8] p-4 pb-6 border-t border-stone-200 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.03)] shrink-0 z-20">
              <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-4"></div>
              {/* ✨ ปรับแต่ง Box คำตอบให้ Layout ไม่พังเวลากดตอบ ✨ */}
         {/* เพิ่ม pb-6 ให้กล่องไม่ตัดขอบล่าง และเพิ่ม p-1 กันเงาโดนตัด */}
<div className="space-y-3 max-h-[45vh] overflow-y-auto p-1 pb-6">
{activeScenarios[currentIndex]?.choices.map((choice: any, index: number) => {
  const isSelected = answers[currentIndex]?.choiceIndex === index;
  return (
    <button
      key={`${currentIndex}-${index}`} // ✅ เพิ่ม currentIndex เข้าไป ให้มันเคลียร์ปุ่มใหม่ทุกข้อ
      disabled={isTransitioning}
      onClick={() => handleChoice(choice.risk, choice.disc, index)}
        // เอา scale ออกตอน select แล้วใช้ ring-2 ทำไฮไลท์ขอบแทน จะสวยและไม่โดนตัดชัวร์ๆ
        className={`w-full text-left px-5 py-4 rounded-xl text-[13px] leading-relaxed font-medium border-2 transition-all active:scale-[0.98] shadow-sm 
          ${isSelected 
            ? "bg-[#004D7A] border-[#004D7A] text-white shadow-md ring-2 ring-sky-300 ring-offset-1" 
            : "bg-white border-stone-200 text-stone-700 hover:border-amber-400 hover:bg-amber-50" 
          }
        `}
      >
                    
                      {choice.text}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* === 3. LOADING SCREEN === */}
        {gameState === "loading" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-stone-950">
            <Loader2 size={50} className="text-amber-500 animate-spin mb-6" />
            <h2 className="text-xl font-bold text-white mb-2 text-center tracking-wide">กำลังประมวลผล...</h2>
            <p className="text-stone-400 text-[13px] text-center font-light">สแกน AVATAR ทางการเงินของคุณ 📉📈</p>
          </motion.div>
        )}

        {/* === 4. RESULT SCREEN === */}
        {gameState === "result" && currentResult && currentResultKey && (
          <div className="flex-1 flex flex-col bg-[#FCFBF8] relative overflow-hidden">
            <div className="flex-1 overflow-y-auto pb-60"> {/* เพิ่ม pb ให้ปุ่มไม่บัง */}
              <div ref={printRef} className="flex flex-col bg-[#FCFBF8] w-full relative">
                
              <div className={`${currentResult.color} text-white p-6 pb-16 text-center flex flex-col items-center relative shadow-lg shrink-0 rounded-b-[2rem]`}>
  
  {/* ✨ ปุ่มคลังศัพท์มุมขวาบนสุด (Top Right) ✨ */}
  <button 
    onClick={() => setShowJargon(true)} 
    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all active:scale-90 backdrop-blur-sm border border-white/20 flex items-center justify-center z-20 shadow-sm"
  >
    <BookOpen size={18} />
    {activeJargons.length > 0 && (
      <span className="absolute -top-0.5 -right-0.5 bg-red-500 w-2.5 h-2.5 rounded-full border border-stone-900 animate-pulse shadow-sm"></span>
    )}
  </button>
  {/* ✨ จบโค้ดปุ่ม ✨ */}

  <Trophy size={28} className="text-white/80 mb-2 mt-2 drop-shadow-md" />
  <p className="text-white/90 text-[10px] font-semibold tracking-widest uppercase mb-3 opacity-80">Financial Avatar</p>
  <p className="text-white/95 text-[11px] bg-black/25 px-4 py-1.5 rounded-full font-medium tracking-wide border border-white/10 backdrop-blur-sm">{currentResult.subtitle}</p>
</div>

                <div className="p-5 pt-10 flex flex-col relative">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-5xl w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-[4px] border-[#FCFBF8] z-10">
                    {currentResult.emoji}
                  </div>

                  <div className="text-center mt-3 mb-5">
                    <p className="text-stone-400 text-[11px] font-semibold tracking-widest uppercase mb-1">AVATAR การเงินของคุณ</p>
                   <h1 className="text-2xl font-black text-stone-900 leading-tight mb-1">
  {persona === "ไม่ระบุ" ? nickname : `${persona}${nickname}`}
</h1>
                    <p className={`text-lg font-bold leading-tight ${currentResult.titleColor}`}>{currentResult.title}</p>
                  </div>
                  
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 mb-4 text-center">
                    <p className="text-[13px] text-stone-600 leading-relaxed font-light">{currentResult.desc}</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 mb-4 overflow-hidden">
                    <h3 className="font-bold text-stone-800 mb-4 text-[13px] border-b border-stone-100 pb-3 flex items-center justify-between w-full">
  <div className="flex items-center gap-2">
    <span className="text-[16px]">🌍</span> เปิดโลกการเงิน
  </div>
  <button 
    onClick={() => setShowInfo(true)} 
    className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors font-medium active:scale-95"
  >
    <Info size={12} />
  </button>
</h3>
                    
                    <div className="flex flex-col items-center">
                      <div className="flex w-full justify-center pl-4 pr-1">
                        <div className="relative w-8 flex justify-center items-center mr-1.5 shrink-0">
                          <div className="absolute flex flex-row-reverse items-center gap-2 whitespace-nowrap text-[10px] font-bold text-stone-400 tracking-widest -rotate-90">
                            <span>เสี่ยงสูง 🚀</span>
                            <span>➔</span>
                            <span>เสี่ยงต่ำ 🛡️</span>
                          </div>
                        </div>

                        <motion.div 
                          className="grid grid-cols-3 gap-1.5 w-full max-w-[260px] bg-stone-100 p-1.5 rounded-xl border border-stone-200 relative cursor-pointer"
                          animate={{ rotate: matrixRotation }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 260, damping: 20 }}
                          onClick={handleMatrixClick}
                        >
                          <div className={getMatrixClass('HIGH_RISK_LOW_DISC')}>กาวสุดกราฟ</div>
                          <div className={getMatrixClass('HIGH_RISK_MID_DISC')}>ล่าเทรนด์(ดอย)</div>
                          <div className={getMatrixClass('HIGH_RISK_HIGH_DISC')}>เซียนระบบ</div>
                          <div className={getMatrixClass('MID_RISK_LOW_DISC')}>ตัวตึงสายเปย์</div>
                          <div className={getMatrixClass('MID_RISK_MID_DISC')}>มนุษย์สมดุล</div>
                          <div className={getMatrixClass('MID_RISK_HIGH_DISC')}>นักปั้นพอร์ต</div>
                          <div className={getMatrixClass('LOW_RISK_LOW_DISC')}>ผู้ประสบภัย</div>
                          <div className={getMatrixClass('LOW_RISK_MID_DISC')}>สายเซฟโซน</div>
                          <div className={getMatrixClass('LOW_RISK_HIGH_DISC')}>พิทักษ์เงินฝาก</div>
                        </motion.div>
                      </div>
                      
                      <div className="flex justify-between w-full max-w-[260px] mt-2 px-2 text-[9px] font-semibold text-stone-400 uppercase tracking-widest ml-6">
                        <span>ใช้ตามฟีล</span>
                        <span>มีระบบ (วินัย) ➔</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-stone-400 text-center mt-3 italic">ลองจิ้มที่ตารางเพื่อหมุนโลกการเงินดูสิ! 💫</p>
                  </div>

        

               {/* --- จุดที่เอาโค้ดมาแทรก (ใต้กรอบแผนอัปสกิลพอร์ต) --- */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 mb-4">
                    <h3 className="font-bold text-stone-800 mb-4 text-[13px] border-b border-stone-100 pb-3 flex items-center gap-2">
                      <span className="text-[16px]">🎯</span> แผนอัปสกิลพอร์ต
                    </h3>
                    <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl mb-3">
                      <p className="text-[11px] font-bold text-stone-500 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide"><Target size={14} className="text-amber-500"/> คำแนะนำเชิงกลยุทธ์</p>
                      <p className="font-bold text-stone-800 text-[13px] mb-1">{currentResult.bestPartner.name}</p>
                      <p className="text-[11px] text-stone-500 leading-relaxed font-light">{currentResult.bestPartner.desc}</p>
                    </div>
                    <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-xl">
                      <p className="text-[11px] font-bold text-sky-500 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide"><Zap size={14} className="text-sky-500"/> หลุมพรางทางการเงิน</p>
                      <p className="font-bold text-sky-800 text-[13px] mb-1">{currentResult.kryptonite.name}</p>
                      <p className="text-[11px] text-sky-700/80 leading-relaxed font-light">{currentResult.kryptonite.desc}</p>
                    </div>
                  </div>

                  {/* ✨ เริ่มโค้ดปุ่ม 2 เว็บไซต์ที่เพิ่มเข้ามา ✨ */}
                  <div className="flex flex-col items-center justify-center gap-2 mb-4">
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-8 h-px bg-stone-200"></span>
                      เครื่องมืออัปสกิลอื่นๆ
                      <span className="w-8 h-px bg-stone-200"></span>
                    </p>
                    <div className="flex items-center justify-center gap-2 w-full">
                      <a 
                        href="https://wheel-of-life-upskill.vercel.app/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 bg-white text-stone-600 border border-stone-200 shadow-sm py-2.5 px-1 rounded-xl hover:bg-stone-50 hover:border-amber-300 hover:text-amber-600 transition-all active:scale-95"
                      >
                        <PieChart size={14} className="text-amber-500" /> 
                        <span className="text-[10px] font-bold">เช็กสมดุลชีวิต</span>
                      </a>
                      <a 
                        href="https://disc-office.vercel.app/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 bg-white text-stone-600 border border-stone-200 shadow-sm py-2.5 px-1 rounded-xl hover:bg-stone-50 hover:border-sky-400 hover:text-sky-600 transition-all active:scale-95"
                      >
                        <Users size={14} className="text-sky-500" /> 
                        <span className="text-[10px] font-bold">ค้นหาจุดแข็ง</span>
                      </a>
                    </div>
                  </div>
                  {/* ✨ จบโค้ดปุ่ม ✨ */}

                  <div className="mt-2 text-center text-stone-400 text-[9px] uppercase tracking-widest font-semibold pb-4">
                    Created by อัพสกิลกับฟุ้ย
                  </div>
                  {/* -------------------------------------------------------- */}
                </div>
              </div>
            </div>
            

            {/* ส่วน Fixed Bottom Navbar */}
            <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl p-4 border-t border-stone-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex flex-col gap-2.5 z-20">
              <button onClick={handleDownloadImage} disabled={isCapturing} className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-bold py-3.5 rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all text-[14px] shadow-lg disabled:opacity-50">
                <Camera size={18} /> {isCapturing ? "กำลังประมวลผลรูปภาพ..." : "เซฟรูปอวดเพื่อนลง Story"}
              </button>

            <a href="https://lin.ee/rQawKUM" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-stone-900 text-amber-400 font-bold py-3.5 rounded-xl hover:bg-black transition-all text-[14px] shadow-lg border border-stone-700">
  <MessageCircle size={18} className="fill-amber-400 text-amber-400" /> อัปสกิลหารายได้เพิ่ม
</a>

              <button onClick={resetGame} className="flex-1 bg-stone-100 text-stone-600 font-semibold py-3 rounded-xl text-center text-[12px] flex items-center justify-center gap-1.5 hover:bg-stone-200 transition-colors">
                <RefreshCcw size={14} /> สแกน AVATAR อีกครั้ง
              </button>
            </div>
          </div>
        )}
      </div>

      {/* === POPUP 9 DNA === */}
      <AnimatePresence>
        {showInfo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowInfo(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#FCFBF8] w-full max-w-[340px] max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="bg-stone-900 text-amber-400 p-4 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-[14px] flex items-center gap-2"><Info size={16}/> 9 AVATAR ทางการเงิน</h3>
                <button onClick={() => setShowInfo(false)} className="bg-stone-800 p-1.5 rounded-full hover:bg-stone-700 transition"><X size={16}/></button>
              </div>
              <div className="overflow-y-auto p-4 space-y-4">
                {Object.values(resultData).map((type, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-stone-200 flex items-start gap-3 shadow-sm">
                    <div className="text-3xl mt-0.5 shrink-0">{type.emoji}</div>
                    <div>
                      <p className={`font-bold text-[13px] ${type.titleColor}`}>{type.title}</p>
                      <p className="text-[11px] text-stone-500 font-medium mb-1.5">{type.subtitle}</p>
                      <p className="text-[11px] text-stone-600 leading-relaxed font-light">{type.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === POPUP คลังศัพท์การเงิน === */}
      <AnimatePresence>
        {showJargon && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowJargon(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-[320px] max-h-[70vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border-2 border-sky-100" onClick={e => e.stopPropagation()}>
              <div className="bg-sky-50 text-sky-800 p-4 flex justify-between items-center shrink-0 border-b border-sky-100">
                <h3 className="font-bold text-[14px] flex items-center gap-2"><BookOpen size={16} className="text-sky-600"/> คลังศัพท์น่ารู้</h3>
                <button onClick={() => setShowJargon(false)} className="bg-white p-1.5 rounded-full hover:bg-sky-100 text-sky-600 transition"><X size={16}/></button>
              </div>
              <div className="overflow-y-auto p-5 space-y-4">
                {activeJargons.length > 0 ? (
                  <>
                    <p className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-2">ศัพท์ที่เจอในข้อนี้</p>
                    {activeJargons.map((jargon, idx) => (
                      <div key={idx} className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                        <p className="font-bold text-[13px] text-stone-800 mb-1">{jargon.word}</p>
                        <p className="text-[12px] text-stone-600 leading-relaxed font-light">{jargon.desc}</p>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-2">🤷‍♂️</div>
                    <p className="font-bold text-stone-700 text-[14px]">ข้อนี้ไม่มีศัพท์ยาก</p>
                    <p className="text-[12px] text-stone-500 font-light mt-1">อ่านเข้าใจง่าย ลุยตอบต่อได้เลย!</p>
                  </div>
                )}
                
                <div className="pt-4 mt-2 border-t border-stone-100">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">ศัพท์น่ารู้เพิ่มเติม</p>
                  {jargonDict.filter(j => !activeJargons.includes(j)).slice(0, 3).map((jargon, idx) => (
                    <div key={idx} className="mb-3">
                      <p className="font-bold text-[12px] text-stone-700">{jargon.word}</p>
                      <p className="text-[11px] text-stone-500 font-light">{jargon.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}