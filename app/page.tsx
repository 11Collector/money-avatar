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

// 📚 พจนานุกรมศัพท์การเงิน (อัปเดตครอบคลุมศัพท์ใน Choice ทั้งหมด)
const jargonDict = [

  { keywords: ["compound effect", "ทบต้น"], word: "Compound Effect (ดอกเบี้ยทบต้น)", desc: "พลังของการนำผลกำไรที่ได้ ไปลงทุนต่อให้ก้อนใหญ่ขึ้นเรื่อยๆ ยิ่งเวลาผ่านไปนาน เงินยิ่งโตแบบทวีคูณ" },
  { keywords: ["dca"], word: "DCA (Dollar Cost Averaging)", desc: "การทยอยลงทุนเรื่อยๆ ด้วยเงินเท่าๆ กันทุกเดือน ช่วยเฉลี่ยต้นทุน ไม่ต้องเดาว่าตลาดจะขึ้นหรือลง" },
  { keywords: ["leverage", "มาร์จิ้น", "margin"], word: "Leverage / Margin", desc: "การกู้ยืมเงินเพื่อมาลงทุนเพิ่ม อำนาจซื้อเยอะขึ้น กำไรไวขึ้น แต่เวลาขาดทุนก็เจ็บหนักทวีคูณเช่นกัน" },
  { keywords: ["vi", "value investor", "พื้นฐาน"], word: "VI (Value Investor)", desc: "นักลงทุนสายเน้นคุณค่า ศึกษาตัวบริษัท ดูงบการเงิน ซื้อแล้วกะถือยาวๆ ให้มันเติบโต" },
  { keywords: ["fomo", "ตกรถ"], word: "FOMO (Fear Of Missing Out)", desc: "อาการ 'กลัวตกรถ' เห็นคนอื่นกำไรก็กลัวพลาดโอกาส รีบกระโดดเข้าไปซื้อตามทั้งๆ ที่ราคามันแพงไปแล้ว" },
  { keywords: ["cut loss", "คัทลอส"], word: "Cut Loss", desc: "การกัดฟันขายยอมขาดทุน เพื่อตัดไฟแต่ต้นลม ป้องกันไม่ให้เงินพอร์ตละลายหายไปมากกว่านี้" },
  { keywords: ["all-in", "เทหน้าตัก"], word: "All-in (เทหน้าตัก)", desc: "การทุ่มเงินที่มีทั้งหมดไปกับสินทรัพย์เดียว หรือการลงทุนครั้งเดียว แบบกะรวยรวดเดียวจบ (เสี่ยงมาก)" },
  { keywords: ["cashflow", "กระแสเงินสด"], word: "Cashflow (กระแสเงินสด)", desc: "สภาพคล่องของการใช้เงิน การมี Cashflow บวก คือรายรับมากกว่ารายจ่าย มีเงินหมุนเวียนสบายใจ" },
  { keywords: ["passive income"], word: "Passive Income", desc: "รายได้ที่ไหลเข้ามาเรื่อยๆ แม้ตอนเรานอนหลับ หรือไปเที่ยว (เช่น เงินปันผล, ดอกเบี้ย, ค่าเช่าบ้าน)" },
  { keywords: ["rebalancing"], word: "Rebalancing", desc: "การปรับสมดุลพอร์ต เช่น หุ้นกำไรเยอะไปก็ขายออกบ้าง เอาไปซื้อตราสารหนี้ เพื่อรักษาสัดส่วนความเสี่ยงตามแผนเดิม" },
  { keywords: ["yield trap", "กับดักปันผล"], word: "Yield Trap (กับดักปันผล)", desc: "หุ้นที่ดูเหมือนจะให้ปันผลสูงมากๆ แต่จริงๆ แล้วพื้นฐานบริษัทกำลังแย่ ปันผลสูงแค่หลอกตา" },
  { keywords: ["arbitrage"], word: "Arbitrage", desc: "การทำกำไรส่วนต่าง เช่น กู้เงินที่ดอกเบี้ยถูกมาก ไปฝากหรือลงทุนในที่ที่ให้ดอกเบี้ยสูงกว่าแบบไร้ความเสี่ยง" },
  { keywords: ["sunk cost", "ต้นทุนจม"], word: "Sunk Cost Fallacy", desc: "การดันทุรังทำอะไรต่อ (เช่น ถือหุ้นเน่าๆ ไว้) เพียงเพราะเสียดายเงินที่ขาดทุนไปแล้ว แทนที่จะตัดใจเอาเงินไปทำอย่างอื่น" },
  { keywords: ["fire", "เกษียณไว"], word: "FIRE Movement", desc: "แนวคิด Financial Independence, Retire Early คือการเร่งหาเงิน ออมเงินหนักๆ เพื่อจะได้เกษียณตั้งแต่อายุ 30-40" },
  { keywords: ["reit", "อสังหาฯ"], word: "กองทุน REIT", desc: "กองทุนรวมอสังหาริมทรัพย์ คือเราเอาเงินไปรวมกันให้กองทุนไปซื้อตึก แล้วเอาค่าเช่าตึกนั้นมาแบ่งปันผลให้เรา" },
  { keywords: ["หุ้น tech", "หุ้นเทค", "tech"], word: "หุ้น Tech", desc: "หุ้นของบริษัทด้านเทคโนโลยี นวัตกรรม (เช่น Apple, Microsoft, NVIDIA) มักจะเติบโตไว แต่ก็สวิงแรง" },
  { keywords: ["corporate bond", "หุ้นกู้"], word: "Corporate Bond (หุ้นกู้)", desc: "คล้ายๆ เราเป็นเจ้าหนี้ ให้บริษัทยืมเงินไปหมุน แล้วบริษัทจะจ่ายดอกเบี้ยให้เราทุกๆ ปี พอครบกำหนดก็คืนเงินต้น" },
  { keywords: ["high yield", "ผลตอบแทนสูง", "junk bond"], word: "High Yield Bond (Junk Bond)", desc: "หุ้นกู้ที่ให้ดอกเบี้ยสูงปรี๊ดเพื่อดึงดูดใจ แต่มักเป็นบริษัทที่เรตติ้งความน่าเชื่อถือต่ำ (Non-Investment Grade) เสี่ยงต่อการเบี้ยวหนี้ (Default) สูงมาก" },
  { keywords: ["s&p500", "ดัชนี", "index"], word: "S&P500 / Index Fund", desc: "กองทุนรวมดัชนี การซื้อ S&P500 คือการซื้อตะกร้าหุ้นที่รวมบริษัทที่ใหญ่และเจ๋งที่สุด 500 แห่งของอเมริกาไว้ด้วยกัน" },
  { keywords: ["asset allocation"], word: "Asset Allocation", desc: "การจัดสรรพอร์ต ไม่เอาไข่ทุกใบไว้ในตะกร้าใบเดียว แบ่งเงินไปลงทั้งหุ้น ทอง เงินฝาก เพื่อกระจายความเสี่ยง" },
  { keywords: ["emergency fund", "สำรองฉุกเฉิน"], word: "Emergency Fund", desc: "เงินสำรองฉุกเฉิน ก้อนเงินที่เก็บไว้เผื่อตกงานหรือป่วย ควรมีให้พอใช้สัก 3-6 เดือน โดยฝากไว้ในที่ที่ถอนง่ายๆ" },
  { keywords: ["ipo"], word: "IPO", desc: "หุ้นเพิ่งเข้าตลาดวันแรก มักจะเป็นที่จับตามองและราคาสวิงแรงมากในวันเปิดตัว" },
  { keywords: ["p/e", "pe"], word: "P/E Ratio", desc: "ตัวบอกความถูกแพงของหุ้น คือถ้าซื้อหุ้นราคานี้ บริษัทต้องทำกำไรเท่านี้ไปอีกกี่ปี เราถึงจะคืนทุน (ส่วนใหญ่ยิ่งต่ำยิ่งดี)" },
  { keywords: ["options", "put options"], word: "Options / Put Options", desc: "เครื่องมือตกลงซื้อขายล่วงหน้า ส่วน Put Option คล้ายๆ การซื้อประกัน เผื่อหุ้นตกเราก็ยังขายได้ในราคาที่ตกลงไว้" },
  { keywords: ["affiliate", "นายหน้า"], word: "Affiliate", desc: "การเป็นนายหน้าช่วยโปรโมทสินค้าคนอื่น พอมีคนกดซื้อผ่านลิงก์ของเรา เราก็จะได้ส่วนแบ่งค่าคอมมิชชัน" },
  { keywords: ["agi"], word: "AGI", desc: "AI ขั้นสุดยอดที่มีความคิดและวิเคราะห์ได้ซับซ้อนเทียบเท่าหรืออาจจะเก่งกว่าสมองมนุษย์" },
  { keywords: ["family office"], word: "Family Office", desc: "องค์กรส่วนตัวที่ตระกูลเศรษฐีตั้งขึ้นมา เพื่อบริหารเงินลงทุนและภาษีของตระกูลตัวเองโดยเฉพาะ" },
  { keywords: ["to the moon", "to the moon!"], word: "To The Moon 🚀", desc: "ศัพท์แสลงสายคริปโต แปลว่าราคากำลังจะพุ่งทะยานขึ้นไปบนดวงจันทร์ (ขึ้นแบบกาวๆ หยุดไม่อยู่)" },
  { keywords: ["automation", "ระบบอัตโนมัติ"], word: "Automation", desc: "การสร้างระบบหรือเขียนโค้ด ให้งานมันทำตัวมันเองอัตโนมัติ ช่วยทุ่นแรงและเวลาในระยะยาว" },
  { keywords: ["laggard"], word: "Laggard", desc: "หุ้นที่ขึ้นช้ากว่าเพื่อนในกลุ่มอุตสาหกรรมเดียวกัน บางคนชอบซื้อสะสมเผื่อมันจะวิ่งตามเพื่อนไป" },
  { keywords: ["เทรดซิ่ง", "หุ้นซิ่ง", "ซิ่ง"], word: "สายเทรดซิ่ง", desc: "การลงทุนระยะสั้นมากๆ เล่นรอบเร็ว เข้าไวออกไว เน้นเก็งกำไรจากความผันผวนของราคา" },
  { keywords: ["ai", "เอไอ"], word: "AI (Artificial Intelligence)", desc: "ปัญญาประดิษฐ์ที่สามารถประมวลผล คิดวิเคราะห์ และช่วยทำงานต่างๆ แทนมนุษย์ได้" },
  { keywords: ["core port", "satellite port"], word: "Core Port & Satellite Port", desc: "กลยุทธ์จัดพอร์ต โดยมี Core Port เป็นพอร์ตหลัก(เน้นมั่นคง) และแบ่งเงินส่วนน้อยไปเล่น Satellite Port(พอร์ตดาวเทียม เน้นเสี่ยงซิ่งๆ)" },
  { keywords: ["fractional shares", "เศษหุ้น"], word: "Fractional Shares (เศษหุ้น)", desc: "การซื้อหุ้นบริษัทยักษ์ใหญ่ (เช่น ซื้อหุ้น Apple) ในราคาแค่หลักร้อยบาท โดยได้มาเป็นเศษส่วนของหุ้น ไม่ต้องซื้อเต็ม 1 หุ้น" },
  { keywords: ["profit run", "let profit run"], word: "Let Profit Run", desc: "กฎการลงทุนที่ปล่อยให้หุ้นที่กำไรวิ่งขึ้นไปเรื่อยๆ ตามเทรนด์ ไม่รีบขายหมูทิ้งซะก่อน" },
  { keywords: ["panic sell"], word: "Panic Sell", desc: "การตกใจเทขายหุ้นทิ้งแบบไม่คิดชีวิต เวลาเห็นราคาดิ่งลงแรงๆ มักทำไปด้วยอารมณ์มากกว่าเหตุผล" },
  { keywords: ["rug pull"], word: "Rug Pull", desc: "วงการคริปโตเรียกว่า 'โดนดึงพรม' หรือการที่ผู้สร้างเหรียญ (มักเป็นเหรียญมีม) หอบเงินนักลงทุนหนีไปดื้อๆ เหรียญไร้มูลค่าทันที" },
  { keywords: ["circuit breaker"], word: "Circuit Breaker", desc: "ระบบเบรกฉุกเฉินของตลาดหุ้น หากหุ้นตกรุนแรงเกินไป ตลาดจะสั่งหยุดการซื้อขายชั่วคราวให้นักลงทุนไปตั้งสติ" },
  { keywords: ["hedging"], word: "Hedging", desc: "การป้องกันความเสี่ยง เช่น เรากลัวหุ้นไทยตก เลยแบ่งเงินไปซื้อทองคำหรือหุ้นต่างประเทศเผื่อไว้ถ่วงน้ำหนักกัน" },
  { keywords: ["refinance", "retention"], word: "Refinance / Retention", desc: "การขอลดดอกเบี้ยบ้าน (Refinance = ย้ายธนาคารใหม่, Retention = ขอขอลดดอกเบี้ยกับธนาคารเดิม)" },
  { keywords: ["56-1", "แบบฟอร์ม 56-1"], word: "แบบฟอร์ม 56-1", desc: "รายงานประจำปีที่บริษัทในตลาดหุ้นต้องส่งให้ ก.ล.ต. มีข้อมูลละเอียดมาก ตั้งแต่ความเสี่ยงยันงบการเงิน" },
  
  // 💡 หมวด: คริปโตพื้นฐาน & เหรียญมีม (อัปเดตใหม่)
  { keywords: ["btc", "eth", "bitcoin", "ethereum"], word: "BTC / ETH", desc: "คริปโตเคอร์เรนซีตัวหลักที่ได้รับการยอมรับมากที่สุด เปรียบเสมือนทองคำดิจิทัลและโครงสร้างพื้นฐานของโลกคริปโต" },
  { keywords: ["เหรียญมีม", "meme coin", "มีม"], word: "Meme Coin (เหรียญมีม)", desc: "เหรียญคริปโตที่สร้างขึ้นมาจากมุกตลกหรือกระแสอินเทอร์เน็ต (เช่น หมา แมว) ราคาผันผวนรุนแรงตามกระแสโซเชียล เสี่ยงสูงมาก" },

  // 💡 หมวด: เทรดดิ้ง & สายซิ่ง (Trading & Futures)
  { keywords: ["short", "ชอร์ต", "แทงลง"], word: "Short (ชอร์ตหุ้น / แทงลง)", desc: "คาดว่าราคาจะตก เลยยืมหุ้น/เหรียญมาขายก่อน พอราคาตกจริงๆ ค่อยซื้อของถูกไปคืน เพื่อกินกำไรส่วนต่าง" },
  { keywords: ["long", "เปิด long", "แทงขึ้น"], word: "Long (เปิดลอง / แทงขึ้น)", desc: "ตรงข้ามกับ Short คือการเปิดสถานะโดยคาดหวังว่าราคาสินทรัพย์จะพุ่งขึ้นไปอีก (ซื้อถูก ขายแพงแบบปกติ)" },
  { keywords: ["ฟิวเจอร์", "futures"], word: "Futures (ฟิวเจอร์ส)", desc: "สัญญาซื้อขายล่วงหน้า มักใช้คู่กับ Leverage แทงได้ทั้งขาขึ้นและลง เสี่ยงสูงปรี๊ด กำไรไว แต่พอร์ตก็แตกไวเช่นกัน" },
  { keywords: ["ตลาดหมี", "bear market"], word: "Bear Market (ตลาดหมี)", desc: "ตลาดขาลง ซึมเศร้าเหงาหงอย ข่าวร้ายเต็มฟีด (เหมือนหมีที่เวลาโจมตีจะตะปบลงพื้น)" },
  { keywords: ["ตลาดกระทิง", "bull market"], word: "Bull Market (ตลาดกระทิง)", desc: "ตลาดขาขึ้น พุ่งแรงคึกคัก ทุกคนรวยและแฮปปี้ (เหมือนกระทิงที่เวลาโจมตีจะขวิดขึ้นฟ้า)" },

  // 💡 หมวด: หนี้สิน & อสังหาริมทรัพย์ (Debt & Real Estate)
  { keywords: ["แฮร์คัท", "haircut"], word: "Haircut (แฮร์คัทหนี้)", desc: "การเจรจาขอลดหนี้กับเจ้าหนี้ (มักใช้ตอนที่วิกฤตจ่ายไม่ไหวแล้วจริงๆ) โดยเจ้าหนี้อาจยอมลดเงินต้นเพื่อแลกกับการได้เงินคืนก้อนนึง" },
  { keywords: ["mrr", "ลอยตัว", "floating rate"], word: "MRR / Floating Rate", desc: "ดอกเบี้ยเงินกู้บ้านแบบลอยตัว มักจะแพงขึ้นแบบก้าวกระโดดหลังจากหมดโปรโมชัน 3 ปีแรก เป็นสัญญาณเตือนว่าต้องรีบไป Refinance" },
  { keywords: ["flip", "ฟลิป", "ใบดาวน์"], word: "Flip (ฟลิปคอนโด / ขายใบดาวน์)", desc: "การซื้อมาขายไปอย่างรวดเร็วเพื่อกินกำไรส่วนต่าง มักเจอบ่อยในวงการคอนโด คือจองใบดาวน์ปุ๊บ รีบอัปราคาขายต่อทันที" },

  // 💡 หมวด: จิตวิทยา & การเงินส่วนบุคคล (Mindset & FIRE)
  { keywords: ["rat race", "สนามแข่งหนู"], word: "Rat Race (สนามแข่งหนู)", desc: "วงจรชีวิตมนุษย์เงินเดือน: ทำงาน > ได้เงิน > จ่ายหนี้ > เงินหมด > กลับไปทำงาน วนลูปไปเรื่อยๆ จนกว่าจะสร้างอิสรภาพทางการเงินได้" },
  { keywords: ["4% rule", "กฎ 4%"], word: "4% Rule (กฎ 4%)", desc: "กฎเหล็กของสายเกษียณ (FIRE) ถ้าเราถอนเงินจากพอร์ตลงทุนมาใช้แค่ปีละ 4% เงินก้อนนั้นจะมีโอกาสงอกเงยพอให้เราใช้ไปได้ตลอดชีวิต" },
  { keywords: ["coast fire", "fat fire"], word: "Coast FIRE / Fat FIRE", desc: "เลเวลการเกษียณ: Coast FIRE คือมีเงินลงทุนก้อนนึงพอที่จะโตไปดูแลเราตอนแก่แล้ว ตอนนี้ทำงานชิลๆ ได้ ส่วน Fat FIRE คือเกษียณแบบใช้จ่ายหรูหราฟู่ฟ่า" },
  { keywords: ["roi", "ผลตอบแทน"], word: "ROI (Return on Investment)", desc: "ผลตอบแทนจากการลงทุน (คิดเป็นเปอร์เซ็นต์) เพื่อดูว่าที่ลงเงินหรือลงแรงไปนั้น มันคุ้มค่ากลับมามากน้อยแค่ไหน" },

  // 💡 หมวด: หุ้นพื้นฐาน & เศรษฐกิจ (Macro & Stock)
  { keywords: ["fed", "เฟด"], word: "FED (ธนาคารกลางสหรัฐ)", desc: "ผู้ทรงอิทธิพลที่สุดในโลกการเงิน แค่ FED ขยับดอกเบี้ยขึ้นหรือลง ตลาดหุ้นและคริปโตทั่วโลกก็พร้อมจะพุ่งหรือพังตามได้ทันที" },
  { keywords: ["blue-chip", "บลูชิป"], word: "Blue-chip (หุ้นบลูชิป)", desc: "หุ้นของบริษัทยักษ์ใหญ่ พื้นฐานแกร่ง มั่นคง มักจะเป็นผู้นำในอุตสาหกรรมนั้นๆ (เปรียบเหมือนชิปสีฟ้าในคาสิโนที่มีมูลค่าสูงสุด)" },
  { keywords: ["10 เด้ง", "สิบเด้ง", "10-bagger"], word: "หุ้น 10 เด้ง (10-Bagger)", desc: "หุ้นที่ราคาเติบโตขึ้นไป 1,000% (หรือ 10 เท่า) จากต้นทุนที่เราซื้อมา เป็นความฝันอันสูงสุดของนักลงทุนสายถือยาว" },
  { keywords: ["rmf", "tesg", "ลดหย่อนภาษี"], word: "RMF / TESG", desc: "กองทุนรวมที่รัฐบาลส่งเสริมให้คนซื้อเพื่อนำไปลดหย่อนภาษี แต่มีเงื่อนไขว่าต้องถือนานๆ (เช่น RMF ถือจนถึงอายุ 55 ปี)" },
  { keywords: ["ตราสารหนี้", "bond"], word: "Bond (ตราสารหนี้ / พันธบัตร)", desc: "สินทรัพย์เสี่ยงต่ำ คล้ายๆ เราเอาเงินไปให้รัฐบาลหรือบริษัทยืม แล้วเค้าจะจ่ายดอกเบี้ยให้เราตามที่ตกลงกันไว้" },

  // 💡 หมวด: อคติทางการลงทุน (Investment Biases)
  { keywords: ["anchoring bias", "anchoring"], word: "Anchoring Bias", desc: "อคติการยึดติดราคาในอดีต เช่น เห็นหุ้นเคยราคา 200 บาท ตอนนี้เหลือ 50 บาท ก็คิดเอาเองว่ามันต้องกลับไป 200 บาทแน่ๆ (ทั้งที่พื้นฐานอาจจะพังไปแล้ว)" },
  { keywords: ["confirmation bias", "confirmation"], word: "Confirmation Bias", desc: "อคติการเลือกรับข้อมูล เราจะเลือกอ่านหรือฟังแต่ข่าวดีที่เข้าข้างการตัดสินใจของตัวเอง และบล็อกข้อมูลของคนที่เห็นต่าง" },
  
  // 💡 หมวด: ครีเอเตอร์ & โซเชียลมีเดีย (Content & Social Media)
  { keywords: ["ko-fi", "kofi"], word: "Ko-fi", desc: "แพลตฟอร์มสนับสนุนครีเอเตอร์ แฟนคลับสามารถโดเนทเงินสนับสนุน (อารมณ์เหมือนเลี้ยงกาแฟ) หรือใช้เป็นหน้าร้านขายผลงานดิจิทัล เช่น E-book ก็ได้" },
  { keywords: ["e-book", "อีบุ๊ก"], word: "E-book (หนังสืออิเล็กทรอนิกส์)", desc: "หนังสือในรูปแบบไฟล์ดิจิทัลที่สามารถเปิดอ่านได้บนมือถือหรือแท็บเล็ต เป็นหนึ่งในสินค้าดิจิทัลที่ครีเอเตอร์นิยมทำเพื่อสร้างรายได้" },
  { keywords: ["content pillar", "คอนเทนต์พิลลาร์"], word: "Content Pillar", desc: "เสาหลักของเนื้อหา คือหัวข้อหลักที่ช่องเราจะพูดถึง ช่วยให้แบรนด์มีทิศทางชัดเจน ไม่สะเปะสะปะ" },
  { keywords: ["algorithm", "อัลกอริทึม"], word: "Algorithm (อัลกอริทึม)", desc: "ระบบหลังบ้านของโซเชียลมีเดียที่คอยคัดเลือกคลิปไปโชว์คนดู ยิ่งคนชอบคลิปเรา ระบบยิ่งช่วยดันให้ดัง" },
  { keywords: ["personal branding", "สร้างตัวตน"], word: "Personal Branding", desc: "การสร้างตัวตนออนไลน์ให้คนจำได้ว่าเราเป็นใคร เก่งเรื่องอะไร" },
  { keywords: ["side hustle", "งานเสริม"], word: "Side Hustle / Side Business", desc: "งานที่ทำขนานไปกับงานประจำเพื่อสร้างรายได้เพิ่มและกระจายความเสี่ยง" },
  { keywords: ["engagement", "ยอดไลก์", "คอมเมนต์"], word: "Engagement", desc: "การมีส่วนร่วมของคนดู เช่น การกดไลก์ คอมเมนต์ แชร์ ซึ่งเป็นตัวชี้วัดความปังของคอนเทนต์" },

  // 🧠 หมวด: จิตวิทยา & การพัฒนาตัวเอง (Mindset & Productivity)
  { keywords: ["deep work", "สมาธิจดจ่อ"], word: "Deep Work", desc: "การทำงานในสภาวะที่มีสมาธิจดจ่อขั้นสูงสุด ตัดสิ่งรบกวนออกทั้งหมด เพื่อสร้างผลงานคุณภาพสูงในเวลาน้อยลง" },
  { keywords: ["the gap and the gain", "gap and gain"], word: "The Gap and The Gain", desc: "แนวคิดการมองความสำเร็จ โดยเน้นดูว่าเราเดินมาไกลแค่ไหนแล้ว (Gain) แทนที่จะมองแต่ระยะทางที่เหลือ (Gap)" },
  { keywords: ["soundtracks", "เสียงในหัว"], word: "Soundtracks (Mental)", desc: "ความคิดหรือความเชื่อที่เราเปิดซ้ำๆ ในหัว ถ้าเปลี่ยนเป็นเพลงดีๆ จะช่วยให้เราพัฒนาตัวเองได้ไวขึ้น" },
  { keywords: ["yolo", "ใช้ชีวิตให้คุ้ม"], word: "YOLO (You Only Live Once)", desc: "สโลแกน 'เกิดมาแค่ครั้งเดียว' มักใช้เป็นข้ออ้างในการเปย์ตัวเองแบบสุดเหวี่ยงโดยไม่สนอนาคต" },
  { keywords: ["delayed gratification", "อดเปรี้ยวไว้กินหวาน"], word: "Delayed Gratification", desc: "การยอมลำบากหรืออดทนไม่รับความสุขเล็กน้อยในตอนนี้ เพื่อรอรับรางวัลที่ใหญ่กว่าในอนาคต" },

  // 📈 หมวด: การเงิน & การลงทุนระดับสูง (Advanced Finance)
  { keywords: ["ath", "all-time high"], word: "ATH (All-Time High)", desc: "ราคาที่พุ่งขึ้นไปสูงที่สุดเท่าที่สินทรัพย์นั้นเคยมีมาในประวัติศาสตร์" },
  { keywords: ["black monday", "วิกฤตจันทร์ทมิฬ"], word: "Black Monday", desc: "เหตุการณ์ที่ตลาดหุ้นร่วงหนักอย่างรุนแรงและรวดเร็วในวันเดียว มักใช้เรียกวันจันทร์ที่เกิดวิกฤต" },
  { keywords: ["business model", "โมเดลธุรกิจ"], word: "Business Model", desc: "รูปแบบการทำธุรกิจ ว่าบริษัทนั้นหาเงินยังไง มีจุดแข็งตรงไหน และเติบโตได้อย่างไร" },
  { keywords: ["หนังสือชี้ชวน", "prospectus"], word: "หนังสือชี้ชวน (Prospectus)", desc: "เอกสารที่บอกข้อมูลบริษัทอย่างละเอียดเมื่อจะขายหุ้น IPO นักลงทุนต้องอ่านก่อนตัดสินใจลงเงิน" },
  { keywords: ["exit strategy", "ทางออก"], word: "Exit Strategy", desc: "แผนการ 'ทางออก' เช่น จะขายหุ้นตอนไหน หรือถ้าทำธุรกิจแล้วไม่รอด จะปิดตัวยังไงให้เจ็บน้อยที่สุด" },
  { keywords: ["yield", "อัตราผลตอบแทน"], word: "Yield (ผลตอบแทน)", desc: "รายรับที่เราได้จากสินทรัพย์นั้นๆ คิดเป็นเปอร์เซ็นต์ เช่น ปันผลหุ้น หรือค่าเช่าคอนโด" },
  { keywords: ["นิติบุคคล", "จดบริษัท"], word: "นิติบุคคล (Legal Entity)", desc: "การจดทะเบียนบริษัทเพื่อให้มีสถานะแยกจากตัวเรา ช่วยในเรื่องการบริหารภาษีและความน่าเชื่อถือ" },
  { keywords: ["audit", "ตรวจสอบ"], word: "Audit (การตรวจสอบ)", desc: "การตรวจเช็กความถูกต้อง ไม่ว่าจะเป็นบัญชีบริษัท หรือการกลับมาตรวจเช็กพอร์ตตัวเอง (Portfolio Audit)" },
  { keywords: ["แชร์ลูกโซ่", "ponzi scheme"], word: "แชร์ลูกโซ่ (Ponzi Scheme)", desc: "กลโกงที่เอาเงินคนใหม่ไปจ่ายคนเก่า อ้างผลตอบแทนสูงเว่อร์แต่ไม่มีการลงทุนจริง สุดท้ายระบบจะพัง" },
  { keywords: ["e-saving", "ออมทรัพย์ดิจิทัล"], word: "e-Saving", desc: "บัญชีเงินฝากออนไลน์ที่ไม่มีสมุดคู่ฝาก มักให้ดอกเบี้ยสูงกว่าบัญชีปกติ 2-3 เท่า" },

  // 🏦 หมวด: ไลฟ์สไตล์ & อื่นๆ (Lifestyle & Balance)
  { keywords: ["ภาษีสังคม", "ซองงานแต่ง", "งานบวช"], word: "ภาษีสังคม", desc: "ค่าใช้จ่ายเพื่อรักษาความสัมพันธ์ เช่น ซองงานแต่ง งานบวช หรือค่าปาร์ตี้เลี้ยงส่งเพื่อน" },
  { keywords: ["subscription", "รายเดือน"], word: "Subscription", desc: "ระบบจ่ายเงินรายเดือนเพื่อใช้บริการ (เช่น Netflix, Spotify) ถ้ามีเยอะเกินจะกลายเป็นรูรั่วทางการเงิน" },
  { keywords: ["play money", "เงินเที่ยว"], word: "Play Money", desc: "เงินก้อนที่แบ่งไว้เพื่อใช้จ่ายไร้สาระหรือเปย์ความสุขโดยเฉพาะ เพื่อให้เราไม่เครียดกับการออมจนเกินไป" },
  { keywords: ["resell", "รีเซล"], word: "Resell (การขายต่อ)", desc: "การซื้อของมาเพื่อขายต่อในราคาที่สูงกว่าเดิม มักใช้กับวงการ Art Toy, รองเท้าหรู หรือบัตรคอนเสิร์ต" },
  { keywords: ["wheel of life", "วงล้อชีวิต"], word: "Wheel of Life (วงล้อชีวิต)", desc: "เครื่องมือประเมินความสมดุลของชีวิตในด้านต่างๆ เพื่อดูว่าเราต้องอัปสกิลด้านไหนเพิ่ม" }

];

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
    
    const randomQuestions = shuffleArray(scenarios).slice(0, TOTAL_QUESTIONS);
    setActiveScenarios(randomQuestions);
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
    const finalRiskScore = newAnswers.reduce((sum, ans) => sum + (ans?.risk || 0), 0);
    const finalDiscScore = newAnswers.reduce((sum, ans) => sum + (ans?.disc || 0), 0);
    
    const r = finalRiskScore <= 3.5 ? "LOW" : finalRiskScore <= 6.5 ? "MID" : "HIGH";
    const d = finalDiscScore <= 3.5 ? "LOW" : finalDiscScore <= 6.5 ? "MID" : "HIGH";
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
    
    // เกณฑ์สำหรับ 10 ข้อ (เต็ม 10 คะแนน)
    const r = riskScore <= 3.5 ? "LOW" : riskScore <= 6.5 ? "MID" : "HIGH";
    const d = discScore <= 3.5 ? "LOW" : discScore <= 6.5 ? "MID" : "HIGH";
    
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

// ✨ ฟังก์ชันค้นหาศัพท์ยากแบบฉลาด (Smart Keyword Matching)
 // ✨ ฟังก์ชันค้นหาศัพท์ยากจากคำถามหน้าปัจจุบัน (Smart Exact Match)
const getCurrentJargons = () => {
  if (gameState !== "playing" || !activeScenarios[currentIndex]) return [];
  
  const currentQ = activeScenarios[currentIndex];

  // 1. รวมข้อความทุกจุดที่ User มีโอกาสเห็น (NPC Name + Message + ทุก Choices)
  const textPool = [
    currentQ.npcName,
    currentQ.message,
    ...currentQ.choices.map((c: any) => c.text)
  ].join(" ").toLowerCase();

  // 2. กรอง Dictionary แบบ Deep Scan
  return jargonDict.filter(jargon => {
    return jargon.keywords.some(kw => {
      const keyword = kw.toLowerCase().trim();
      
      // กรณีคำภาษาอังกฤษ หรือคำที่มีตัวเลข/สัญลักษณ์ (เช่น S&P500, 4% Rule)
      if (/^[a-z0-9\s&%]+$/.test(keyword)) {
        // ใช้ Regex ที่ฉลาดขึ้น: 
        // เช็คว่าต้องไม่ใช่ส่วนหนึ่งของคำอื่น (\b) 
        // แต่ยอมให้ติดกับสัญลักษณ์พิเศษได้ (เช่น (DCA), "DCA", หรือ DCA!)
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?:^|[^a-zA-Z0-9])(${escapedKeyword})(?:$|[^a-zA-Z0-9])`, 'i');
        return regex.test(textPool);
      }

      // กรณีภาษาไทย: ใช้ .includes() ตรงๆ 
      // เพราะภาษาไทยไม่มีเว้นวรรค การใช้ Regex Boundary จะทำให้หาไม่เจอ
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
                    โปรดใช้วิจารณญาณก่อนการใช้เงิน เพื่อหาสไตล์ตัวเอง กดเลือก <span className="font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">"ตามสัญชาตญาณ"</span> ไม่ต้องคิดเยอะ เพราะเงินคุณไม่ใช่ของผม !
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
                      <p className="text-[11px] font-bold text-stone-500 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide"><Target size={14} className="text-amber-500"/> สิ่งที่ควรทำเพิ่ม</p>
                      <p className="font-bold text-stone-800 text-[13px] mb-1">{currentResult.bestPartner.name}</p>
                      <p className="text-[11px] text-stone-500 leading-relaxed font-light">{currentResult.bestPartner.desc}</p>
                    </div>
                    <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-xl">
                      <p className="text-[11px] font-bold text-sky-500 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide"><Zap size={14} className="text-sky-500"/> Asset ที่ควรมีติดพอร์ต</p>
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
  <MessageCircle size={18} className="fill-amber-400 text-amber-400" /> คุยผลลัพธ์ต่อ (LINE)
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
                <h3 className="font-bold text-[14px] flex items-center gap-2"><BookOpen size={16} className="text-sky-600"/> คลังศัพท์การเงิน</h3>
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