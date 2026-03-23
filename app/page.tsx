"use client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useState, useRef, useMemo } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, RefreshCcw, Camera, AlertTriangle, ArrowLeft, ArrowRight, Loader2, Zap, Target, Info, X, Star, BookOpen, PieChart, Users, MessageCircle
} from "lucide-react"; 
import { toPng } from "html-to-image"; 
import Image from "next/image";
import { Prompt } from "next/font/google";

import { scenarios } from "../src/data/chatScenarios"; 
import { resultData } from "../src/data/resultData";
import DisclaimerFooter from '../app/components/DisclaimerFooter';
import { db } from "../src//lib/firebaseConfig"; 

const loadingQuotes = [
  {
    text: "การประสบความสำเร็จทางการเงิน ไม่ได้เกี่ยวกับความฉลาด แต่อยู่ที่ 'พฤติกรรม' ของคุณ",
    author: "Morgan Housel",
    book: "The Psychology of Money"
  },
  {
    text: "ความมั่งคั่ง คือการมีสินทรัพย์ที่ทำเงินให้คุณ... แม้ในยามที่คุณหลับ",
    author: "Naval Ravikant",
    book: "The Almanack of Naval Ravikant"
  },
  {
    text: "ตลาดหุ้นคือเครื่องมือ ย้ายเงินจาก 'คนใจร้อน' ไปสู่ 'คนใจเย็น'",
    author: "Warren Buffett",
    book: "Legendary Investor"
  },
  {
    text: "การเงินส่วนบุคคล เป็นเรื่องของจิตวิทยา 80% และกลไกตัวเลขแค่ 20%",
    author: "Dave Ramsey",
    book: "Personal Finance Expert"
  },
  // --- Charlie Munger (Legendary Investor) ---
  {
    text: "เงินก้อนโตไม่ได้เกิดจากการ 'ซื้อๆ ขายๆ' แต่เกิดจากการ 'รอคอย' ให้เป็น",
    author: "Charlie Munger",
    book: "Legendary Investor"
  },
{
    text: "คนทั่วไป 'ทำงานเพื่อเงิน' แต่คนรวยสร้างระบบให้ 'เงินทำงาน' แทนพวกเขา",
    author: "Robert Kiyosaki",
    book: "Rich Dad Poor Dad"
  },// --- Darren Hardy (The Compound Effect) ---
  {
    text: "ทางเลือกเล็กๆ ที่ชาญฉลาด + 'ความสม่ำเสมอ' + เวลา = ผลลัพธ์ที่ยิ่งใหญ่มหาศาล",
    author: "Darren Hardy",
    book: "The Compound Effect"
  },
  // --- Dan Sullivan & Dr. Benjamin Hardy (The Gap and The Gain) ---
  {
    text: "จงวัดความสำเร็จจาก 'สิ่งที่คุณทำได้แล้ว' ไม่ใช่จากช่องว่างของ 'สิ่งที่คุณยังไม่มี'",
    author: "Dr. Benjamin Hardy",
    book: "The Gap and The Gain"
  },
  // --- Peter Lynch (One Up On Wall Street) ---
  {
    text: "กลไกที่สำคัญที่สุดในการลงทุน ไม่ใช่สมอง... แต่คือ 'กระเพาะ' ที่ทนความเหวี่ยงได้",
    author: "Peter Lynch",
    book: "Legendary Fund Manager"
  },
  // --- Benjamin Graham (บิดาแห่งการลงทุนแบบเน้นคุณค่า) ---
  {
    text: "ศัตรูตัวฉกาจที่สุดของนักลงทุน... มักจะไม่ใช่ตลาด แต่เป็น 'ตัวของเขาเอง'",
    author: "Benjamin Graham",
    book: "The Intelligent Investor"
  },

  // --- James Clear (ปรมาจารย์ด้านการสร้างนิสัย) ---
  {
    text: "คุณไม่มีทางไปถึงระดับของเป้าหมายได้ คุณทำได้แค่ร่วงหล่นลงมาสู่ 'ระดับของระบบ' ที่คุณสร้างไว้",
    author: "James Clear",
    book: "Atomic Habits"
  },

  // --- George Soros (พ่อมดการเงินสายเก็งกำไร) ---
  {
    text: "สิ่งสำคัญไม่ใช่ถูกหรือผิด แต่อยู่ที่ตอนถูกคุณ 'ได้เท่าไหร่' และตอนผิดคุณ 'จำกัดความเสียหาย' ได้แค่ไหน",
    author: "George Soros",
    book: "Legendary Investor"
  },

  // --- Jim Rohn (นักปรัชญาธุรกิจ) ---
  {
    text: "การศึกษาในระบบจะทำให้คุณพอมีกิน แต่การ 'ศึกษาเรียนรู้ด้วยตัวเอง' จะทำให้คุณมั่งคั่ง",
    author: "Jim Rohn",
    book: "Business Philosopher"
  },

  // --- Bill Perkins (ผู้เขียนเรื่องการใช้เงินให้คุ้มค่า - ตรงกับข้อ 86 ในแอปคุณพอดี!) ---
  {
    text: "เป้าหมายไม่ใช่การกอดเงินให้ตายไปพร้อมกัน แต่คือการเปลี่ยนเงินเป็น 'ประสบการณ์ชีวิต' ในเวลาที่เหมาะสม",
    author: "Bill Perkins",
    book: "Dying with Zero"
  },

  // --- Jon Acuff (เรื่องการจัดการเสียงในหัว) ---
  {
    text: "การคิดมากเกินไป (Overthinking) คือจังหวะที่ 'ความกลัว' เข้ามาขวางทาง 'สิ่งที่คุณต้องการ' จริงๆ",
    author: "Jon Acuff",
    book: "Soundtracks"
  },
  // --- Ray Dalio (มหาเศรษฐีเจ้าของกองทุน Hedge Fund ที่ใหญ่ที่สุดในโลก) ---
  {
    text: "ความเจ็บปวดจากการขาดทุน + 'การทบทวนตัวเอง' = ความก้าวหน้าที่แท้จริง",
    author: "Ray Dalio",
    book: "Principles"
  },

  // --- Mark Douglas (บิดาแห่งจิตวิทยาการเทรด) ---
  {
    text: "ถ้าคุณสร้าง 'สภาวะจิตใจ' ที่ไม่หวั่นไหวไปตามตลาดได้ ความยากลำบากในการลงทุนก็จะหายไป",
    author: "Mark Douglas",
    book: "Trading in the Zone"
  },

  // --- Cal Newport (ปรมาจารย์ด้านการทำงานแบบโฟกัส) ---
  {
    text: "ความสามารถในการ 'จดจ่อขั้นสุด' (Deep Work) คือทักษะที่มีมูลค่ามหาศาลที่สุด ในยุคที่เต็มไปด้วยสิ่งรบกวน",
    author: "Cal Newport",
    book: "Deep Work"
  },

  // --- Nassim Nicholas Taleb (ปรมาจารย์ด้านความเสี่ยงและ Black Swan) ---
  {
    text: "สิ่งที่เสพติดและอันตรายต่ออิสรภาพที่สุดมี 3 อย่าง คือ เฮโรอีน, คาร์โบไฮเดรต และ 'เงินเดือนประจำ'",
    author: "Nassim Nicholas Taleb",
    book: "The Bed of Procrustes"
  },

  // --- Carl Richards (นักวางแผนการเงินสายพฤติกรรม) ---
  {
    text: "'ความเสี่ยง' คือสิ่งที่หลงเหลืออยู่... หลังจากที่คุณมั่นใจว่า คุณคิดมาดีหมดทุกอย่างแล้ว",
    author: "Carl Richards",
    book: "The Behavior Gap"
  },

  // --- Peter Thiel (ผู้ร่วมก่อตั้ง PayPal และนักลงทุนระดับตำนาน) ---
  {
    text: "สิ่งที่สวนกระแสที่สุด ไม่ใช่การทำตัวขวางโลก แต่คือการ 'คิดด้วยหัวของตัวเอง'",
    author: "Peter Thiel",
    book: "Zero to One"
  },

  // --- Seth Klarman (นักลงทุนเน้นคุณค่าชื่อดัง) ---
  {
    text: "การลงทุน ไม่ใช่แค่เรื่องของตัวเลข แต่มันคือจุดตัดระหว่าง 'เศรษฐศาสตร์' และ 'จิตวิทยามนุษย์'",
    author: "Seth Klarman",
    book: "Margin of Safety"
  },
  // --- Daniel Kahneman (บิดาแห่งเศรษฐศาสตร์พฤติกรรม ผู้ล่วงลับ) ---
  {
    text: "ความเจ็บปวดจากการสูญเสียเงิน รุนแรงกว่าความสุขที่ได้เงินจำนวนเท่ากันถึง 'สองเท่า'",
    author: "Daniel Kahneman",
    book: "Thinking, Fast and Slow"
  },

  // --- Howard Marks (ปรมาจารย์ด้านการประเมินความเสี่ยง) ---
  {
    text: "ความเสี่ยงที่แท้จริงไม่ใช่ความผันผวนของราคา แต่คือการสูญเสียเงินทุนแบบ 'ถาวร'",
    author: "Howard Marks",
    book: "The Most Important Thing"
  },

  // --- Vicki Robin (หนังสือคัมภีร์ต้นตำรับสาย FIRE) ---
  {
    text: "เงินไม่ใช่แค่ตัวเลข แต่มันคือ 'พลังชีวิต' ที่คุณยอมสละเวลาไปแลกมา",
    author: "Vicki Robin",
    book: "Your Money or Your Life"
  },

  // --- Dr. Julie Smith (การจัดการอารมณ์ ซึ่งสำคัญมากเวลาตลาดผันผวน) ---
  {
    text: "ความคิดและอารมณ์ของคุณ 'ไม่ใช่ข้อเท็จจริง' เสมอไป โดยเฉพาะเวลาที่เห็นพอร์ตติดลบ",
    author: "Dr. Julie Smith",
    book: "Why Has Nobody Told Me This Before?"
  },

  // --- Simon Sinek (การมองภาพยาว) ---
  {
    text: "ความมั่งคั่งไม่ใช่เกมที่มีจุดจบ แต่คือ 'เกมอนันต์' (Infinite Game) ที่เป้าหมายคือการอยู่รอดให้นานที่สุด",
    author: "Simon Sinek",
    book: "The Infinite Game"
  },

  // --- Tim Ferriss (เรื่องการใช้ Leverage และเวลา) ---
  {
    text: "เป้าหมายไม่ใช่การทำงานให้หนักที่สุด แต่คือการหา 'คานงัด' ที่สร้างอิสรภาพให้คุณได้เร็วที่สุด",
    author: "Tim Ferriss",
    book: "The 4-Hour Workweek"
  }
];



// --- 1. SETUP & UTILS ---
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

// --- 2. LOGIC: CALCULATE PERSONA (PRIMARY & SECONDARY) ---
const profileCenters = [
  { id: "HIGH_RISK_HIGH_DISC", risk: 10, disc: 10 },
  { id: "MID_RISK_HIGH_DISC", risk: 5, disc: 10 },
  { id: "LOW_RISK_HIGH_DISC", risk: 0, disc: 10 },
  { id: "HIGH_RISK_MID_DISC", risk: 10, disc: 5 },
  { id: "MID_RISK_MID_DISC", risk: 5, disc: 5 },
  { id: "LOW_RISK_MID_DISC", risk: 0, disc: 5 },
  { id: "HIGH_RISK_LOW_DISC", risk: 10, disc: 0 },
  { id: "MID_RISK_LOW_DISC", risk: 5, disc: 0 },
  { id: "LOW_RISK_LOW_DISC", risk: 0, disc: 0 },
];

const calculatePersona = (riskScore: number, discScore: number) => {
    const results = profileCenters.map((profile) => {
      // หาความต่างของคะแนน (Euclidean Distance)
      const distance = Math.hypot(riskScore - profile.risk, discScore - profile.disc);
      return { id: profile.id, distance, profileRisk: profile.risk, profileDisc: profile.disc };
    });

    // เรียงลำดับตัวที่ใกล้ที่สุด
    results.sort((a, b) => {
      if (a.distance === b.distance) {
        // Tie-breaker 1: ถ้าดึงดูดเท่ากัน ให้ปัดลงไปหาวินัย (Disc) ต่ำกว่าก่อน (เพราะคนเราหย่อนยานง่าย)
        if (a.profileDisc !== b.profileDisc) {
           return a.profileDisc - b.profileDisc; 
        }
        // Tie-breaker 2: ถ้าวินัยเท่ากันอีก ให้ปัดลงไปหาความเสี่ยง (Risk) ต่ำกว่า เพื่อความปลอดภัย
        return a.profileRisk - b.profileRisk;
      }
      return a.distance - b.distance;
    });
    
  const maxDist = 14.14; // ระยะไกลสุดที่เป็นไปได้ในกราฟ 10x10
  const calculateMatch = (dist: number) => Math.max(0, Math.round(((maxDist - dist) / maxDist) * 100));

  return {
    primary: { id: results[0].id, matchPercentage: calculateMatch(results[0].distance) },
    secondary: { id: results[1].id, matchPercentage: calculateMatch(results[1].distance) },
  };
};

// --- 3. DATA & CONSTANTS ---
const personaOptions = [
  { id: "เสี่ย", label: "เสี่ย", emoji: "🤵‍♂️" },
  { id: "ซ้อ", label: "ซ้อ", emoji: "💅" },
  { id: "จารย์", label: "จารย์", emoji: "📚" },
  { id: "ไม่ระบุ", label: "ไม่ระบุ", emoji: "😎" },
];

export const jargonDict = [
  // --- แนวคิดการลงทุนเบื้องต้น ---
  { keywords: ["compound effect", "ทบต้น"], word: "Compound Effect (ดอกเบี้ยทบต้น)", desc: "กลไกที่ผลกำไรถูกนำไปลงทุนทบกับเงินต้นเดิมซ้ำๆ ทำให้ฐานเงินทุนใหญ่ขึ้นแบบทวีคูณเมื่อเวลาผ่านไป" },
  { keywords: ["dca"], word: "DCA (Dollar Cost Averaging)", desc: "กลยุทธ์การทยอยลงทุนด้วยจำนวนเงินที่เท่าๆ กันอย่างสม่ำเสมอ เพื่อถัวเฉลี่ยต้นทุนโดยไม่ใช้การจับจังหวะตลาด" },
  { keywords: ["asset allocation", "กระจายความเสี่ยง"], word: "Asset Allocation", desc: "การจัดสรรเงินทุนไปยังกลุ่มสินทรัพย์ที่หลากหลายเพื่อลดความผันผวนของพอร์ต" },
  { keywords: ["passive"], word: "Passive Income / Investing", desc: "รูปแบบการลงทุนหรือรายได้ที่เน้นให้ระบบทำงานแทน โดยลดการใช้แรงงานและเวลาเข้าไปแลกโดยตรง" },
  { keywords: ["cashflow", "กระแสเงินสด"], word: "Cashflow (กระแสเงินสด)", desc: "การไหลเข้าและออกของเงิน การมีกระแสเงินสดบวกหมายถึงรายรับมากกว่ารายจ่าย" },
  { keywords: ["yield"], word: "Yield (ผลตอบแทน)", desc: "อัตราส่วนผลตอบแทนที่เกิดจากการถือครองสินทรัพย์ เช่น เงินปันผลจากหุ้น หรือค่าเช่า" },

  // --- สินทรัพย์และการประเมินมูลค่า ---
  { keywords: ["tech", "เทค"], word: "Tech Stock (หุ้นเทคโนโลยี)", desc: "หุ้นของบริษัทในกลุ่มนวัตกรรม มักเติบโตสูงแต่มีความผันผวนตามกระแสเทคโนโลยี" },
  { keywords: ["growth", "เติบโต"], word: "Growth Stock (หุ้นเติบโต)", desc: "หุ้นที่มีอัตราการขยายตัวของรายได้และกำไรสูงกว่าค่าเฉลี่ยของตลาด" },
  { keywords: ["blue-chip", "บลูชิป"], word: "Blue-chip Stock", desc: "หุ้นของบริษัทขนาดใหญ่ที่มีฐานะทางการเงินมั่นคงและเป็นผู้นำในอุตสาหกรรม" },
  { keywords: ["index fund", "ดัชนี", "กองทุนดัชนี"], word: "Index Fund (กองทุนรวมดัชนี)", desc: "กองทุนที่ลงทุนเลียนแบบดัชนีตลาด เพื่อให้ได้ผลตอบแทนใกล้เคียงกับภาพรวมตลาด" },
  { keywords: ["reit", "อสังหาฯ"], word: "REIT", desc: "กองทุนที่ลงทุนในอสังหาริมทรัพย์เพื่อรับรายได้จากค่าเช่าและนำมาแบ่งเป็นปันผล" },
  { keywords: ["หุ้นกู้"], word: "Corporate Bond (หุ้นกู้)", desc: "ตราสารหนี้ภาคเอกชนที่เราเป็นเจ้าหนี้บริษัท และได้รับผลตอบแทนเป็นดอกเบี้ยตามกำหนด" },
  { keywords: ["พันธบัตร", "ตราสารหนี้"], word: "Bond (พันธบัตร)", desc: "ตราสารหนี้ที่ออกโดยรัฐบาล มีความเสี่ยงต่ำและได้รับดอกเบี้ยสม่ำเสมอ" },
  { keywords: ["mixed fund", "กองทุนผสม"], word: "Mixed Fund", desc: "กองทุนที่มีนโยบายกระจายการลงทุนในหลายสินทรัพย์พร้อมกันเพื่อรักษาสมดุลความเสี่ยง" },
  { keywords: ["เศษหุ้น"], word: "Fractional Shares", desc: "ระบบที่ทำให้นักลงทุนซื้อหุ้นได้ด้วยจำนวนเงินตามต้องการ ไม่ต้องซื้อเต็มหุ้น" },
  { keywords: ["ipo"], word: "IPO", desc: "การเสนอขายหุ้นของบริษัทต่อประชาชนทั่วไปเป็นครั้งแรกเพื่อเข้าตลาดหลักทรัพย์" },
  { keywords: ["hard assets", "สินทรัพย์คงทน"], word: "Hard Assets", desc: "สินทรัพย์ที่มีมูลค่าในตัวเองและทนทานต่อเงินเฟ้อ เช่น ทองคำ อสังหาริมทรัพย์ หรือ Bitcoin" },
  { keywords: ["art toy", "ของสะสม", "สินทรัพย์ทางเลือก"], word: "Alternative Assets (Art Toy)", desc: "การลงทุนในสิ่งของนอกเหนือจากตลาดเงินทุนปกติ เช่น ของเล่นสะสม งานศิลปะ หรือนาฬิกาหรู" },

  // --- กลยุทธ์และการซื้อขาย ---
  { keywords: ["time in the market"], word: "Time in the Market", desc: "แนวคิดการเน้นระยะเวลาถือครองสินทรัพย์ที่ยาวนานเพื่อให้เงินทำงาน แทนการกะจังหวะซื้อขาย" },
  { keywords: ["ปันผล"], word: "Dividend (เงินปันผล)", desc: "ผลกำไรส่วนหนึ่งที่บริษัทแบ่งจ่ายให้กับผู้ถือหุ้นตามสัดส่วนที่ถือครอง" },
  { keywords: ["ทำกำไร", "profit run"], word: "Take Profit / Let Profit Run", desc: "การขายเมื่อได้กำไรตามเป้า หรือการถือต่อเพื่อให้กำไรเติบโตไปเรื่อยๆ" },
  { keywords: ["cut loss", "คัทลอส", "ตัดขาดทุน"], word: "Cut Loss", desc: "การตัดสินใจขายสินทรัพย์ในราคาที่ต่ำกว่าทุนเพื่อจำกัดความเสียหายไม่ให้พอร์ตพัง" },
  { keywords: ["rebalance", "ปรับสมดุล"], word: "Rebalancing", desc: "การปรับสัดส่วนพอร์ตให้กลับมาตามแผนที่ตั้งไว้ เช่น ขายตัวที่กำไรเยอะไปซื้อตัวที่สัดส่วนลดลง" },
  { keywords: ["คานงัด", "leverage"], word: "Leverage (คานงัด)", desc: "เครื่องมือทวีคูณผลลัพธ์ เช่น การกู้ยืมมาลงทุน หรือการใช้เทคโนโลยีมาช่วยสเกลรายได้" },
  { keywords: ["สวิงเทรด", "เล่นรอบ"], word: "Swing Trade", desc: "กลยุทธ์การเก็งกำไรระยะสั้นถึงกลาง โดยอาศัยจังหวะการแกว่งตัวของราคาเป็นรอบๆ" },
  { keywords: ["options"], word: "Options", desc: "เครื่องมือทางการเงินที่ให้สิทธิในการซื้อหรือขายสินทรัพย์ในอนาคตตามราคาที่ตกลงกันไว้" },
  { keywords: ["arbitrage"], word: "Arbitrage", desc: "การทำกำไรจากส่วนต่างของราคาสินทรัพย์ชนิดเดียวกันในสองตลาดที่ต่างกัน" },
  { keywords: ["day trade"], word: "Day Trade", desc: "รูปแบบการเก็งกำไรที่เน้นการซื้อและขายจบภายในวันเดียว" },
  { keywords: ["all-in"], word: "All-in", desc: "การทุ่มเงินทุนทั้งหมดที่มีลงไปในสินทรัพย์เดียวหรือครั้งเดียว" },
  { keywords: ["hedging"], word: "Hedging", desc: "การใช้เครื่องมือทางการเงินเพื่อป้องกันหรือลดความเสี่ยงจากการเคลื่อนไหวของราคาที่สวนทาง" },

  // --- คริปโตเคอร์เรนซี ---
  { keywords: ["btc", "bitcoin"], word: "BTC (Bitcoin)", desc: "สกุลเงินดิจิทัลที่มีจำนวนจำกัด มักถูกเรียกว่าเป็นทองคำดิจิทัลเพื่อใช้รักษามูลค่าเงินในระยะยาว" },
  { keywords: ["คริปโต", "มีม", "เหรียญมีม"], word: "Cryptocurrency / Meme Coin", desc: "สินทรัพย์ดิจิทัลที่ทำงานบนบล็อกเชน รวมถึงเหรียญที่เกิดจากกระแสโซเชียลที่มีความผันผวนสูง" },

  // --- พฤติกรรมและจิตวิทยา ---
  { keywords: ["panic sell"], word: "Panic Sell", desc: "สภาวะการเทขายสินทรัพย์ด้วยความตื่นตระหนกจากข่าวลือหรือตลาดที่ร่วงแรง" },
  { keywords: ["yield trap", "กับดักปันผล"], word: "Yield Trap", desc: "หุ้นที่ดูเหมือนปันผลสูงมาก แต่จริงๆ แล้วเกิดจากราคาหุ้นที่ร่วงหนักเพราะพื้นฐานธุรกิจพัง" },
  { keywords: ["xd"], word: "XD (Ex-Dividend)", desc: "วันที่ผู้ซื้อหุ้นจะไม่มีสิทธิได้รับเงินปันผลในรอบนั้น" },
  { keywords: ["black swan"], word: "Black Swan", desc: "เหตุการณ์ที่ไม่มีใครคาดคิด โอกาสเกิดน้อยมาก แต่ส่งผลกระทบรุนแรงต่อตลาด" },
  { keywords: ["bear market"], word: "Bear Market (ตลาดหมี)", desc: "สภาวะตลาดขาลงที่ซึมเซาและมีแรงขายต่อเนื่องยาวนาน" },
  { keywords: ["all-time high", "new high"], word: "All-Time High (ATH)", desc: "จุดสูงสุดของราคาที่สินทรัพย์นั้นๆ เคยทำได้ในประวัติศาสตร์" },
  { keywords: ["sunk cost"], word: "Sunk Cost Fallacy", desc: "อคติที่ทำให้เราไม่ยอมเลิกทำสิ่งเดิมเพราะเสียดายเงินหรือเวลาที่จ่ายไปแล้ว" },
  { keywords: ["anchoring"], word: "Anchoring Bias", desc: "อคติการยึดติดกับข้อมูลชุดแรกที่เห็น เช่น ยึดติดกับราคาที่เคยขึ้นไปสูงสุดในอดีต" },
  { keywords: ["revenge trading", "เทรดแก้มือ"], word: "Revenge Trading", desc: "สภาวะอารมณ์ที่พยายามเทรดเพื่อเอาเงินที่เพิ่งขาดทุนไปกลับคืนมาให้เร็วที่สุด" },
  { keywords: ["lifestyle creep", "กับดักความสุข"], word: "Lifestyle Creep", desc: "ปรากฏการณ์ที่ค่าใช้จ่ายขยับตัวสูงขึ้นตามรายได้ที่เพิ่มขึ้น ทำให้หาเงินได้เยอะแต่ไม่มีเงินเหลือเก็บ" },
  { keywords: ["loss aversion", "กลัวขาดทุน"], word: "Loss Aversion", desc: "อคติที่มนุษย์จะรู้สึกเจ็บปวดจากการสูญเสีย มากกว่ารู้สึกดีใจเมื่อได้รับกำไรในจำนวนที่เท่ากัน" },
  { keywords: ["comfort zone trap", "พื้นที่ปลอดภัย"], word: "Comfort Zone Trap", desc: "การยึดติดกับความสบายใจจนไม่กล้ารับความเสี่ยงเพิ่ม ซึ่งอาจทำให้เสียโอกาสสร้างความมั่งคั่ง" },
  { keywords: ["over-optimization", "สูตรสำเร็จ"], word: "Over-Optimization", desc: "การพยายามปรับจูนระบบให้สมบูรณ์แบบเกินไปจนยึดติดกับอดีตและไม่เผื่อใจให้ความไม่แน่นอน" },
  { keywords: ["relative wealth envy", "ริษยา"], word: "Relative Wealth Envy", desc: "สภาวะจิตใจที่รู้สึกกดดันเมื่อเห็นคนอื่นได้รับผลตอบแทนที่สูงกว่าในระยะเวลาอันสั้น" },
  { keywords: ["degen", "กาว"], word: "Degen (Degenerate)", desc: "ศัพท์แสลงใช้เรียกนักลงทุนที่ชอบความเสี่ยงสูงมากเหมือนการเดิมพัน โดยไม่สนปัจจัยพื้นฐาน" },

  // --- การเงินส่วนบุคคลและไลฟ์สไตล์ ---
  { keywords: ["fire", "เกษียณไว"], word: "FIRE Movement", desc: "แนวคิดการออมและลงทุนอย่างหนักเพื่อเป้าหมายอิสรภาพทางการเงินก่อนวัยเกษียณ" },
  { keywords: ["สำรองฉุกเฉิน"], word: "Emergency Fund", desc: "เงินที่แยกไว้เพื่อใช้ยามจำเป็นจริงๆ เช่น ป่วยกะทันหัน หรือตกงาน" },
  { keywords: ["pay yourself first"], word: "Pay Yourself First", desc: "หลักการหักเงินไปลงทุนทันทีที่รายได้เข้า ก่อนจะนำไปใช้จ่ายส่วนอื่น" },
  { keywords: ["สนามแข่งหนู"], word: "Rat Race", desc: "วงจรชีวิตวัยทำงานที่ต้องทำงานหาเงินเพื่อจ่ายหนี้และค่าใช้จ่ายวนไปไม่จบสิ้น" },
  { keywords: ["ภาษีสังคม"], word: "Social Tax", desc: "ค่าใช้จ่ายที่เกิดจากการเข้าสังคม เช่น ใส่ซองงานแต่งหรืองานบวช" },
  { keywords: ["play money"], word: "Play Money", desc: "เงินงบประมาณที่ตั้งไว้สำหรับซื้อความสุขหรือลงทุนเสี่ยงๆ โดยเฉพาะ" },
  { keywords: ["e-saving"], word: "e-Saving", desc: "บัญชีเงินฝากดิจิทัลที่มักให้ดอกเบี้ยสูงกว่าบัญชีออมทรัพย์ปกติ" },
  { keywords: ["ลดหย่อนภาษี", "rmf", "ssf", "กองทุนลดหย่อนภาษี"], word: "ภาษี & กองทุนลดหย่อน", desc: "การใช้สิทธิประโยชน์ทางภาษีผ่านการลงทุนในกองทุนต่างๆ ตามเงื่อนไขของรัฐ" },
  { keywords: ["refinance"], word: "Refinance", desc: "การขอลดดอกเบี้ยสินเชื่อบ้านโดยการย้ายธนาคารหรือปรับสัญญาใหม่" },
  { keywords: ["floating rate"], word: "Floating Rate", desc: "อัตราดอกเบี้ยแบบลอยตัวที่ปรับขึ้นลงตามประกาศนโยบายการเงิน" },
  { keywords: ["subscription"], word: "Subscription", desc: "โมเดลการจ่ายค่าบริการรายเดือน เช่น แอปสตรีมมิ่งต่างๆ" },
  { keywords: ["flip"], word: "Flip", desc: "การซื้อสินทรัพย์และขายเปลี่ยนมืออย่างรวดเร็วเพื่อทำกำไรส่วนต่าง" },
  { keywords: ["จ่ายขั้นต่ำ"], word: "Minimum Payment", desc: "การจ่ายหนี้บัตรเครดิตเพียงบางส่วน ซึ่งจะนำไปสู่ภาระดอกเบี้ยทบต้นฝั่งรายจ่าย" },
  { keywords: ["โปะหนี้"], word: " Debt Repayment (Prepayment)", desc: "การจ่ายเงินคืนหนี้เกินกว่ายอดขั้นต่ำเพื่อลดเงินต้นและประหยัดดอกเบี้ยในระยะยาว" },

  // --- ทักษะและธุรกิจ ---
  { keywords: ["specific knowledge", "ความรู้เฉพาะทาง"], word: "Specific Knowledge", desc: "ทักษะเฉพาะตัวที่เลียนแบบยาก ซึ่งสร้างมูลค่าได้มหาศาลในตลาดแรงงานยุคใหม่" },
  { keywords: ["สร้างตัวตน", "personal branding"], word: "Personal Branding", desc: "การสร้างภาพลักษณ์และความเชื่อถือในตัวเองผ่านสื่อเพื่อให้คนจดจำความเชี่ยวชาญของเรา" },
  { keywords: ["affiliate"], word: "Affiliate", desc: "การตลาดแบบนายหน้าที่เราได้รับค่าคอมมิชชันจากการแนะนำสินค้าให้ผู้อื่นซื้อ" },
  { keywords: ["นิติบุคคล"], word: "Legal Entity", desc: "การจดทะเบียนบริษัทเพื่อแยกสถานะทางการเงินและภาษีออกจากบุคคลธรรมดา" },
  { keywords: ["หนังสือชี้ชวน"], word: "Prospectus", desc: "เอกสารข้อมูลสำคัญของบริษัทและความเสี่ยงที่นักลงทุนต้องศึกษาก่อนตัดสินใจ" },
  { keywords: ["family office"], word: "Family Office", desc: "หน่วยงานบริหารจัดการความมั่งคั่งและมรดกสำหรับครอบครัวระดับมหาเศรษฐี" },
  { keywords: ["แชร์ลูกโซ่"], word: "Ponzi Scheme", desc: "การหลอกลวงที่นำเงินจากคนใหม่มาจ่ายคนเก่า โดยไม่มีการทำธุรกิจจริง" },
  { keywords: ["fed"], word: "FED", desc: "ธนาคารกลางสหรัฐฯ ผู้กำหนดทิศทางดอกเบี้ยโลก" },
  { keywords: ["automation", "ระบบอัตโนมัติ"], word: "Automation", desc: "การใช้เทคโนโลยีหรือโค้ดมาทำงานแทนเราแบบต่อเนื่องตามเงื่อนไขที่ตั้งไว้" },
  { keywords: ["ai", "เอไอ"], word: "AI (Artificial Intelligence)", desc: "ปัญญาประดิษฐ์ที่ช่วยวิเคราะห์ข้อมูลและทำงานทุ่นแรงมนุษย์" },
  { keywords: ["agi"], word: "AGI", desc: "AI ขั้นสูงที่มีความสามารถรอบด้านเทียบเท่าหรือเหนือกว่ามนุษย์" },

  // --- พัฒนาตนเองและปรัชญา ---
  { keywords: ["deep work"], word: "Deep Work", desc: "การทำงานแบบจดจ่อขั้นสุดโดยตัดสิ่งรบกวน เพื่อสร้างผลงานที่มีคุณภาพสูง" },
  { keywords: ["the gap and the gain"], word: "The Gap & The Gain", desc: "แนวคิดการวัดความสำเร็จจากความก้าวหน้าที่ทำได้แล้ว (Gain) แทนการมองแต่สิ่งที่ขาด (Gap)" },
  { keywords: ["soundtracks"], word: "Soundtracks", desc: "เสียงในหัวหรือความเชื่อซ้ำๆ ที่ส่งผลต่อการตัดสินใจและพฤติกรรมในชีวิต" },
  { keywords: ["wheel of life", "วงล้อชีวิต"], word: "Wheel of Life", desc: "เครื่องมือประเมินความสมดุลของชีวิตในมิติต่างๆ เช่น การเงิน สุขภาพ และความสัมพันธ์" },
  { keywords: ["dying with zero"], word: "Dying with Zero", desc: "แนวคิดการใช้เงินซื้อประสบการณ์ชีวิตในจังหวะที่เหมาะสม แทนการเก็บเงินไว้จนวันตาย" },
  { keywords: ["ubi"], word: "UBI", desc: "แนวคิดสวัสดิการที่รัฐแจกเงินพื้นฐานให้ทุกคนอย่างเท่าเทียม" },
  { keywords: ["10 เด้ง"], word: "10-Bagger", desc: "การลงทุนที่มูลค่าเติบโตขึ้นเป็น 10 เท่าจากเงินต้น" },
  { keywords: ["กงสี"], word: "Family Business / กงสี", desc: "ระบบการเงินส่วนรวมของครอบครัวที่ใช้ดูแลสมาชิกทุกคน" },
  { keywords: ["burnout", "หมดไฟ"], word: "Burnout Syndrome", desc: "ภาวะเหนื่อยล้าทางอารมณ์และจิตใจจากการทำงานหนักเกินไป" },
  { keywords: ["อัปสกิล", "skill up"], word: "Skill Up", desc: "การลงทุนพัฒนาทักษะใหม่ๆ เพื่อเพิ่มขีดความสามารถในการหารายได้" },
  // --- หมวด: รูปแบบการเกษียณ (FIRE Movement) ---
  { keywords: ["coast fire"], word: "Coast FIRE", desc: "การมีเงินเก็บลงทุนสะสมมากพอที่ปล่อยให้ดอกเบี้ยทำงานดูแลตัวเองไปจนเกษียณได้ ทำให้สามารถเลือกทำงานที่รักได้โดยไม่ต้องกังวลเรื่องเงินอีกต่อไป" },
  { keywords: ["fat fire"], word: "Fat FIRE", desc: "เป้าหมายการเกษียณด้วยพอร์ตลงทุนขนาดใหญ่มาก ทำให้สามารถใช้ชีวิตหรูหรา ซื้อความสุข และเปย์ไลฟ์สไตล์ได้เต็มที่หลังเกษียณ" },

  // --- หมวด: คำศัพท์สายเทรด & คริปโต ---
  { keywords: ["ดอย", "ติดดอย"], word: "Holding the Bag (ติดดอย)", desc: "สถานการณ์ที่ซื้อสินทรัพย์ในราคาสูง แล้วต่อมาราคาร่วงลงมาอย่างหนัก ทำให้ขายไม่ได้เพราะจะขาดทุนยับเยิน" },
  { keywords: ["ช้อน", "ช้อนซื้อ"], word: "Buy the Dip (ช้อนซื้อ)", desc: "การเข้าไปซื้อสินทรัพย์ในช่วงที่ราคาร่วงหรือตกต่ำลงมา โดยหวังว่าราคาจะปรับตัวเด้งขึ้นไปในอนาคต" },
  { keywords: ["short", "แทงลง"], word: "Short (แทงลง)", desc: "กลยุทธ์ทำกำไรในตลาดขาลง โดยยืมสินทรัพย์มาขายก่อนในราคาสูง แล้วค่อยซื้อคืนในราคาต่ำเพื่อทำกำไรส่วนต่าง" },
  { keywords: ["margin", "มาร์จิ้น"], word: "Margin (มาร์จิ้น)", desc: "การกู้ยืมเงินจากโบรกเกอร์มาซื้อสินทรัพย์หรือเก็งกำไร เพื่อเพิ่มอำนาจซื้อให้ได้ผลตอบแทนสูงขึ้น (แต่ก็เสี่ยงสูงขึ้นเช่นกัน)" },
  { keywords: ["แนวรับ", "แนวต้าน", "โซนรับ"], word: "Support & Resistance (แนวรับ-แนวต้าน)", desc: "ระดับราคาในกราฟทางเทคนิคที่คาดว่าราคาจะตกลงมาแล้วเด้งกลับ (แนวรับ) หรือขึ้นไปชนแล้วร่วงลง (แนวต้าน)" },
  { keywords: ["trading plan", "แผนการเทรด"], word: "Trading Plan (แผนการเทรด)", desc: "แผนการที่วางไว้ล่วงหน้าอย่างเป็นระบบ ว่าจะเข้าซื้อสินทรัพย์จุดไหน ตัดขาดทุน (Cut loss) ตรงไหน และทำกำไรที่ราคาใด" },

  // --- หมวด: เศรษฐศาสตร์ & การเงินพื้นฐาน ---
  { keywords: ["เงินเฟ้อ", "inflation"], word: "Inflation (เงินเฟ้อ)", desc: "ภาวะที่ราคาสินค้าและบริการทั่วไปเพิ่มสูงขึ้นเรื่อยๆ ทำให้มูลค่าและอำนาจการซื้อของเงินในกระเป๋าลดลง" },
  { keywords: ["สภาพคล่อง", "liquidity"], word: "Liquidity (สภาพคล่อง)", desc: "ความสามารถในการเปลี่ยนสินทรัพย์ให้เป็นเงินสดได้อย่างรวดเร็ว รวมถึงการมีเงินสดหมุนเวียนเพียงพอต่อค่าใช้จ่าย" },
  { keywords: ["ค่าเสื่อม", "depreciation"], word: "Depreciation (ค่าเสื่อมราคา)", desc: "การลดลงของมูลค่าสินทรัพย์เมื่อเวลาผ่านไปหรือจากการใช้งาน เช่น รถยนต์ อุปกรณ์อิเล็กทรอนิกส์" },
  { keywords: ["ตลาดเกิดใหม่", "emerging market"], word: "Emerging Market (ตลาดเกิดใหม่)", desc: "ตลาดทุนในประเทศที่กำลังพัฒนาเศรษฐกิจ ซึ่งมีโอกาสเติบโตสูงแต่ก็มีความเสี่ยงจากความผันผวนสูงเช่นกัน" },
  { keywords: ["วัฏจักร", "cycle"], word: "Market Cycle (วัฏจักรตลาด)", desc: "รอบการเคลื่อนไหวของตลาดเศรษฐกิจหรือราคาสินทรัพย์ ที่มักเกิดสลับกันไประหว่างช่วงเติบโตและช่วงหดตัว" },

  // --- หมวด: ธุรกิจ & การจัดการหนี้ ---
  { keywords: ["จุดคุ้มทุน", "break-even"], word: "Break-even Point (จุดคุ้มทุน)", desc: "จุดที่รายได้จากการทำธุรกิจหรือการลงทุน มีมูลค่าเท่ากับต้นทุนที่ลงไปพอดี (ไม่ขาดทุนและไม่ได้กำไร)" },
  { keywords: ["outsource"], word: "Outsource (การจ้างคนนอก)", desc: "การจ้างบุคคลหรือหน่วยงานภายนอกให้มาทำงานแทน เพื่อประหยัดเวลาและให้เราโฟกัสกับงานส่วนอื่นที่ถนัดกว่าได้" },
  { keywords: ["ประนอมหนี้"], word: "Debt Restructuring (การประนอมหนี้)", desc: "การเจรจากับเจ้าหนี้เพื่อขอปรับเปลี่ยนเงื่อนไขการชำระหนี้ เช่น ขอยืดเวลา หรือลดดอกเบี้ย เพื่อให้สามารถผ่อนจ่ายต่อได้ไหว" },
  { keywords: ["ประกันสะสมทรัพย์"], word: "Endowment Insurance (ประกันสะสมทรัพย์)", desc: "ประกันชีวิตรูปแบบหนึ่งที่เน้นการออมเงินควบคู่กับความคุ้มครอง โดยจะได้เงินก้อนคืนพร้อมผลตอบแทนเมื่อครบสัญญา" },

  // --- หมวด: จิตวิทยา & เหตุการณ์ ---
  { keywords: ["fomo"], word: "FOMO (อาการกลัวตกรถ)", desc: "อาการกลัวตกรถหรือพลาดโอกาสทำกำไรเมื่อเห็นคนอื่นได้เงิน ทำให้รีบตัดสินใจกระโดดเข้าไปลงทุนด้วยอารมณ์" },
  { keywords: ["black monday"], word: "Black Monday (วันจันทร์ทมิฬ)", desc: "เหตุการณ์ประวัติศาสตร์ที่ตลาดหุ้นทั่วโลกร่วงลงอย่างรุนแรงในวันจันทร์ มักใช้เปรียบเปรยถึงวันที่ตลาดพังยับเยิน" }
];

export const levelMapping = {
  // Level 1: พื้นฐานการเอาตัวรอด, นิสัยการเงิน, และการจัดการกิเลส (34 ข้อ)
  level1: [
    8, 9, 11, 13, 14, 15, 18, 21, 24, 32, 
    33, 36, 39, 41, 43, 45, 47, 49, 50, 51, 
    52, 53, 54, 56, 67, 68, 69, 70, 76, 77, 
    79, 81, 95, 100
  ],

  // Level 2: โลกการลงทุน, การประเมินโอกาส, และการรับมือความผันผวน (33 ข้อ)
  level2: [
    1, 2, 3, 4, 5, 6, 7, 17, 19, 22, 
    23, 28, 30, 35, 37, 38, 40, 44, 46, 55, 
    57, 58, 59, 60, 73, 74, 75, 78, 83, 84, 
    91, 92, 97
  ],

  // Level 3: บททดสอบจิตวิทยา, ความลำเอียง (Biases), และปรัชญาความมั่งคั่ง (33 ข้อ)
  level3: [
    10, 12, 16, 20, 25, 26, 27, 29, 31, 34, 
    42, 48, 61, 62, 63, 64, 65, 66, 71, 72, 
    80, 82, 85, 86, 87, 88, 89, 90, 93, 94, 
    96, 98, 99
  ]
};

// ฟังก์ชันสุ่มดึงคำถามแบบ Progressive Difficulty (ดึงตามสัดส่วนความยาก)
const getProgressiveQuestionSet = (allScenarios: any[], numQuestions: number) => {
  const selectedIDs: number[] = [];
  const pool = {
    level1: [...levelMapping.level1],
    level2: [...levelMapping.level2],
    level3: [...levelMapping.level3]
  };

  const drawFromLevel = (level: "level1" | "level2" | "level3") => {
    if (pool[level].length === 0) return null;
    const randomIndex = Math.floor(Math.random() * pool[level].length);
    const id = pool[level][randomIndex];
    pool[level].splice(randomIndex, 1);
    return id;
  };

  for (let i = 1; i <= numQuestions; i++) {
    const progressPercent = (i / numQuestions) * 100;
    let drawnId: number | null = null;

    if (progressPercent <= 25) { // ช่วงต้นเกม
      const rand = Math.random();
      drawnId = rand <= 0.80 
        ? (drawFromLevel('level1') || drawFromLevel('level2'))
        : (drawFromLevel('level2') || drawFromLevel('level1'));
    } else if (progressPercent <= 75) { // ช่วงกลางเกม
      const rand = Math.random();
      if (rand <= 0.60) drawnId = drawFromLevel('level2') || drawFromLevel('level1') || drawFromLevel('level3');
      else if (rand <= 0.80) drawnId = drawFromLevel('level1') || drawFromLevel('level2') || drawFromLevel('level3');
      else drawnId = drawFromLevel('level3') || drawFromLevel('level2') || drawFromLevel('level1');
    } else { // ช่วงท้ายเกม
      const rand = Math.random();
      drawnId = rand <= 0.80 
        ? (drawFromLevel('level3') || drawFromLevel('level2'))
        : (drawFromLevel('level2') || drawFromLevel('level3'));
    }

    if (drawnId) selectedIDs.push(drawnId);
  }

  return selectedIDs.map(id => allScenarios.find(s => s.id === id)).filter(Boolean);
};

// --- 4. MAIN COMPONENT ---
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

  // --- DERIVED RESULTS (For the Result Screen) ---
// --- DERIVED RESULTS (For the Result Screen) ---
  const matchStats = useMemo(() => {
    if (gameState !== "result" || answers.length < TOTAL_QUESTIONS) return null;
    
    const rawRiskScore = answers.reduce((sum, ans) => sum + (ans?.risk || 0), 0);
    const rawDiscScore = answers.reduce((sum, ans) => sum + (ans?.disc || 0), 0);
    
    // แปลงให้เป็นสเกลเต็ม 10 เสมอ (Normalization) 
    // เผื่ออนาคตเปลี่ยน TOTAL_QUESTIONS เป็น 15 หรือ 20 ข้อ ระบบประเมินก็ยังแม่นยำ
    const finalRiskScore = (rawRiskScore / TOTAL_QUESTIONS) * 10;
    const finalDiscScore = (rawDiscScore / TOTAL_QUESTIONS) * 10;

    return calculatePersona(finalRiskScore, finalDiscScore);
  }, [gameState, answers, TOTAL_QUESTIONS]);

const randomQuote = useMemo(() => {
    if (gameState === "loading") {
      return loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)];
    }
    return loadingQuotes[0];
  }, [gameState]);

  const currentResult = matchStats ? resultData[matchStats.primary.id as keyof typeof resultData] : null;
  const secondaryResult = matchStats ? resultData[matchStats.secondary.id as keyof typeof resultData] : null;

  const handleStart = () => {
    if (!persona) { alert("เลือกทรงทางการเงินของคุณก่อนนะ!"); return; }
    if (!nickname.trim()) { alert("พิมพ์ชื่อเล่นของคุณก่อนนะ!"); return; }
    
    // เรียกใช้ระบบสุ่มคำถามแบบใหม่
    const selectedScenarios = getProgressiveQuestionSet(scenarios, TOTAL_QUESTIONS);

    setActiveScenarios(selectedScenarios);
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
      const riskTotal = newAnswers.reduce((sum, ans) => sum + ans.risk, 0);
      const discTotal = newAnswers.reduce((sum, ans) => sum + ans.disc, 0);
      const calculated = calculatePersona(riskTotal, discTotal);

      const detailedResults = activeScenarios.map((scenario, i) => {
        const selectedChoice = scenario.choices[newAnswers[i].choiceIndex];
        return {
          q_id: scenario.id,
          npc: scenario.npcName,
          question: scenario.message,
          answer: selectedChoice.text,
          points: { risk: selectedChoice.risk, disc: selectedChoice.disc }
        };
      });

      // สั่งบันทึกลง Firebase แบบ Fire-and-forget (เอา await และ try...catch ออก)
      // เพื่อไม่ให้ UI ต้องรอโหลด หากเน็ตช้า
      addDoc(collection(db, "quiz_results"), {
        nickname,
        persona,
        resultKey: calculated.primary.id,
        riskScore: riskTotal,
        discScore: discTotal,
        history: detailedResults,
        createdAt: serverTimestamp(),
      }).catch(error => console.error("❌ บันทึกล้มเหลว:", error));

      // หน่วงเวลา 600ms ให้ User เห็นหลอดสีวิ่งเต็ม 100% ฟินๆ ก่อนเปลี่ยนฉาก
     setTimeout(() => {
        setIsTransitioning(false);
        setGameState("loading");
        
        // 👇 ปรับตัวเลขตรงนี้ครับ เปลี่ยนจาก 2500 เป็น 4000 หรือ 4500
        setTimeout(() => setGameState("result"), 4500); 
        
      }, 600);
    }
  };

  const handleBack = () => { if (currentIndex > 0 && !isTransitioning) setCurrentIndex((prev) => prev - 1); };
  const handleForward = () => { if (answers[currentIndex] !== undefined && currentIndex < TOTAL_QUESTIONS - 1 && !isTransitioning) setCurrentIndex((prev) => prev + 1); };
  const handleMatrixClick = () => setMatrixRotation(prev => prev + 360);

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
    setNickname(""); setPersona(null); setAnswers([]); setGameState("start"); setMatrixRotation(0); setIsTransitioning(false);
  };
  const getMatrixClass = (key: string) => {
    const isActive = matchStats?.primary.id === key;
    
    // 💡 ปรับลดขนาดลงเป็น text-[9px] (มือถือ) และ text-[9.5px] (จอใหญ่ขึ้น) 
    // เพิ่ม px-1 และ text-center เผื่อคำยาวจะได้ไม่ชนขอบ
    return `h-11 rounded-xl flex justify-center items-center text-[9px] sm:text-[9.5px] px-1 text-center transition-all ${
      isActive 
      ? 'bg-amber-500 text-stone-900 font-bold shadow-md ring-[2px] ring-amber-500 scale-[1.08] z-10 tracking-tight' 
      : 'bg-white text-stone-400 font-medium tracking-tight'
    }`;
  };

const getCurrentJargons = () => {
    let textPool = "";
    if (gameState === "playing" && activeScenarios[currentIndex]) {
      const currentQ = activeScenarios[currentIndex];
      textPool = [currentQ.npcName, currentQ.role, currentQ.message, ...currentQ.choices.map((c: any) => c.text)].join(" ").toLowerCase();
    } else if (gameState === "result" && currentResult) {
      // ดึงข้อมูลจากตัวตนหลัก
      let resultTexts = [
        currentResult.title, 
        currentResult.subtitle, 
        currentResult.desc, 
        currentResult.motto, 
        currentResult.bestPartner.name, 
        currentResult.bestPartner.desc, 
        currentResult.kryptonite.name, 
        currentResult.kryptonite.desc
      ];

      // เพิ่มข้อมูล Asset ที่แนะนำจากตัวตนรอง (Secondary Persona)
      if (secondaryResult) {
        resultTexts.push(
          secondaryResult.bestPartner.name,
          secondaryResult.bestPartner.desc
        );
      }

      textPool = resultTexts.join(" ").toLowerCase();
    } else return [];

    return jargonDict.filter(jargon => jargon.keywords.some(kw => {
      const keyword = kw.toLowerCase().trim();
      if (/^[a-z0-9\s&%]+$/.test(keyword)) {
        const regex = new RegExp(`(?:^|[^a-zA-Z0-9])(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?:$|[^a-zA-Z0-9])`, 'i');
        return regex.test(textPool);
      }
      return textPool.includes(keyword);
    }));
  };
  
  const activeJargons = getCurrentJargons();

  return (
    <div className={`min-h-[100dvh] bg-stone-950 flex flex-col items-center justify-center sm:p-4 ${promptFont.className}`}>
      <div className={`w-full max-w-md shadow-2xl overflow-hidden h-[100dvh] sm:h-[850px] flex flex-col relative sm:rounded-[2.5rem] sm:border-[4px] sm:border-stone-800 ${gameState === 'playing' ? 'bg-[#F4F3ED]' : 'bg-[#FCFBF8]'}`}>
        
        {/* --- START SCREEN --- */}
        {gameState === "start" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-6 sm:p-8 bg-gradient-to-br from-[#FCFBF8] via-[#F4EDE4] to-[#E8DCC4] overflow-y-auto">
            <div className="flex flex-col items-center justify-center text-center pt-2 pb-4">
              <div className="w-full max-w-[320px] mb-4 relative">
                <Image src="/money-avatar-logo.png" alt="Money Avatar" width={500} height={200} className="w-full h-auto drop-shadow-md" priority />
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

{/* --- PLAYING SCREEN --- */}
        {gameState === "playing" && activeScenarios.length > 0 && (
          <div className="flex flex-col h-full bg-[#F4F3ED]">
            <div className="bg-stone-950 text-white px-3 py-3 flex items-center justify-between shadow-md shrink-0 border-b border-amber-500/20">
              <div className="flex items-center gap-2 max-w-[65%]">
                <div className="text-xl bg-gradient-to-br from-stone-800 to-stone-900 p-2 rounded-full w-10 h-10 flex items-center justify-center border border-stone-700 shadow-inner shrink-0">
                  {activeScenarios[currentIndex]?.avatar}
                </div>
                <div className="overflow-hidden">
                  <h2 className="font-semibold text-[13px] text-stone-100 truncate w-full">{activeScenarios[currentIndex]?.npcName}</h2>
                  <p className="text-[10px] text-amber-400 font-light tracking-wide truncate w-full">{activeScenarios[currentIndex]?.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-2.5 shrink-0 mr-1 sm:mr-3">
                  
                 
           
  
{/* Progress Bar Section */}
<div className="relative w-28 sm:w-36 flex items-center pr-8"> {/* เพิ่ม pr นิดหน่อยเผื่อเหรียญชนถ้วยทอง */}
  
  {/* 👇 เพิ่ม Wrapper นี้ครอบหลอดและเหรียญไว้ด้วยกัน เพื่อให้อ้างอิงความกว้างเดียวกัน */}
  <div className="relative w-full">
    
    {/* หลอด Progress */}
    <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden border border-stone-700/50 shadow-inner relative">
      <motion.div 
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-yellow-300"
        initial={{ width: '2%' }}
        animate={{ width: `${Math.max(2, (answers.length / TOTAL_QUESTIONS) * 100)}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      <motion.div 
        className="absolute top-0 bottom-0 w-4 bg-white/30 blur-[2px]"
        initial={{ left: '-10%' }}
        animate={{ left: `calc(${Math.max(2, (answers.length / TOTAL_QUESTIONS) * 100)}% - 8px)` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>

    {/* ไอคอนเหรียญทอง (ตัววิ่ง) */}
    <motion.div
      className="absolute top-1/2 -translate-y-1/2 text-[18px] drop-shadow-md z-10"
      initial={{ left: '0%', rotate: 0 }}
      animate={{ 
        left: `calc(${Math.max(2, (answers.length / TOTAL_QUESTIONS) * 100)}% - 12px)`,
        rotate: answers.length * 360,
        scale: [1, 1.3, 1] 
      }}
      transition={{ 
        left: { type: "spring", bounce: 0.4, duration: 0.5 },
        rotate: { type: "spring", bounce: 0.4, duration: 0.5 },
        scale: { duration: 0.3 } 
      }}
    >
      💰
    </motion.div>
    
  </div>
  {/* 👆 จบ Wrapper ใหม่ */}

  {/* Emoji เป้าหมายปลายทาง (Target) */}
  <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[20px] drop-shadow-sm opacity-80 z-0">
    🏆 
  </div>

</div>

                </div>
              </div>
            </div>
            
            <div className="flex-1 p-5 overflow-y-auto flex flex-col justify-center min-h-[250px]"> 
              <AnimatePresence mode="wait">
                <motion.div key={currentIndex} initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} className="bg-stone-800 p-6 pt-7 rounded-2xl shadow-xl w-full max-w-[92%] border-l-4 border-amber-400 relative mx-auto my-auto">
                  
                  {/* Tag Situation ด้านซ้าย */}
                  <div className="absolute -top-3 left-4 bg-amber-400 text-stone-900 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm">
                    <AlertTriangle size={12}/> Situation
                  </div>

                  {/* 2. ปุ่มคลังศัพท์ (ย้ายมาตรงบนขวากรอบ Situation) */}
                  <button 
                    onClick={() => setShowJargon(true)} 
                    className="absolute -top-3 right-4 p-1.5 bg-stone-900 text-[#00bfff] hover:text-white hover:bg-stone-700 rounded-full transition-all active:scale-90 border border-stone-600 shadow-md flex items-center justify-center z-10"
                  >
                    <BookOpen size={14} />
                    {activeJargons.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 w-2.5 h-2.5 rounded-full border border-stone-800 animate-pulse"></span>}
                  </button>

                  <p className="text-[15px] text-center leading-relaxed font-medium text-stone-100 drop-shadow-sm mt-1">{activeScenarios[currentIndex]?.message}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="bg-[#FCFBF8] p-4 pb-6 border-t border-stone-200 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.03)] shrink-0 z-20">
              <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-4"></div>
              <div className="space-y-3 max-h-[45vh] overflow-y-auto p-1 pb-6">
                {activeScenarios[currentIndex]?.choices.map((choice: any, index: number) => {
                  const isSelected = answers[currentIndex]?.choiceIndex === index;
                  return (
                    <button key={`${currentIndex}-${index}`} disabled={isTransitioning} onClick={() => handleChoice(choice.risk, choice.disc, index)} className={`w-full text-left px-5 py-4 rounded-xl text-[13px] leading-relaxed font-medium border-2 transition-all active:scale-[0.98] shadow-sm ${isSelected ? "bg-[#004D7A] border-[#004D7A] text-white shadow-md ring-2 ring-sky-300 ring-offset-1" : "bg-white border-stone-200 text-stone-700 hover:border-amber-400 hover:bg-amber-50"}`}>
                      {choice.text}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
      {/* --- LOADING SCREEN --- */}
{gameState === "loading" && (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="flex-1 flex flex-col items-center justify-center p-8 bg-stone-950 relative overflow-hidden"
  >
    {/* เอฟเฟกต์แสงเงาด้านหลัง (Glow Effect) */}
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none"></div>

    <Loader2 size={52} className="text-amber-500 animate-spin mb-6 z-10 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
    
    <h2 className="text-xl font-bold text-white mb-2 text-center tracking-wide z-10">กำลังประมวลผล...</h2>
    <p className="text-stone-400 text-[13px] text-center font-light mb-12 z-10">สแกน AVATAR การเงินของคุณ 📉📈</p>

    {/* กรอบโชว์ Quote */}
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
      className="max-w-[280px] text-center z-10 bg-stone-900/60 p-5 rounded-2xl border border-stone-800/80 backdrop-blur-sm shadow-xl"
    >
      <div className="text-amber-500/40 text-4xl leading-none absolute -top-3 -left-2 font-serif">"</div>
      
      <p className="text-stone-300 text-[12px] italic leading-relaxed mb-4 relative z-10">
        {randomQuote.text.split("'").map((part, i) => 
          i % 2 === 1 ? <span key={i} className="text-amber-400 font-semibold">{part}</span> : part
        )}
      </p>
      
      <div className="flex flex-col items-center justify-center gap-0.5 relative z-10">
        <span className="text-stone-100 text-[10px] font-bold tracking-wide uppercase">
          — {randomQuote.author} —
        </span>
        <span className="text-stone-500 text-[9px] tracking-wider">
          {randomQuote.book}
        </span>
      </div>
    </motion.div>

  </motion.div>
)}

        {/* --- RESULT SCREEN --- */}
        {gameState === "result" && currentResult && matchStats && (
          <div className="flex-1 flex flex-col bg-[#FCFBF8] relative overflow-hidden">
            <div className="flex-1 overflow-y-auto pb-60">
              <div ref={printRef} className="flex flex-col bg-[#FCFBF8] w-full relative">
                <div className={`${currentResult.color} text-white p-6 pb-16 text-center flex flex-col items-center relative shadow-lg shrink-0 rounded-b-[2rem]`}>
                  <button onClick={() => setShowJargon(true)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all active:scale-90 backdrop-blur-sm border border-white/20 flex items-center justify-center z-20 shadow-sm">
                    <BookOpen size={18} />
                    {activeJargons.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 w-2.5 h-2.5 rounded-full border border-stone-900 animate-pulse shadow-sm"></span>}
                  </button>
                  <Trophy size={28} className="text-white/80 mb-2 mt-2 drop-shadow-md" />
                  <p className="text-white/90 text-[10px] font-semibold tracking-widest uppercase mb-3 opacity-80">Money Avatar</p>
                  <p className="text-white/95 text-[11px] bg-black/25 px-4 py-1.5 rounded-full font-medium tracking-wide border border-white/10 backdrop-blur-sm">{currentResult.subtitle}</p>
                </div>

           <div className="p-5 pt-10 flex flex-col relative">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-5xl w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-[4px] border-[#FCFBF8] z-10">
                    {currentResult.emoji}
                  </div>
                  <div className="text-center mt-3 mb-5">
                    <p className="text-stone-400 text-[11px] font-semibold tracking-widest uppercase mb-1">AVATAR การเงินของคุณ</p>
                    <h1 className="text-2xl font-black text-stone-900 leading-tight mb-1">{persona === "ไม่ระบุ" ? nickname : `${persona}${nickname}`}</h1>
                    <p className={`text-lg font-bold leading-tight ${currentResult.titleColor}`}>{currentResult.title}</p>
                    <div className="flex items-center justify-center mt-2">
                       <span className="bg-stone-100 text-stone-500 px-3 py-1 rounded-full text-[10px] font-bold border border-stone-200 shadow-sm">
                         ตรงกับคุณ {matchStats.primary.matchPercentage}%
                       </span>
                    </div>
                  </div>
                  
       {/* 1️⃣ จุดแข็ง / มุมมองต่อเงิน */}
<div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 mb-3 text-center">
  <p className="text-[13px] text-stone-600 leading-relaxed font-light">
    {/* ใช้ highlightText ตรงนี้ */}
    {highlightText(currentResult.desc)}
  </p>
</div>

{/* 2️⃣ หลุมพรางทางการเงิน */}
<div className="bg-sky-50/60 border border-sky-100 p-4 rounded-2xl mb-4 shadow-sm relative overflow-hidden">
  <div className="absolute top-0 left-0 w-1 h-full bg-sky-400"></div>
  <p className="text-[11px] font-bold text-sky-600 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
    <Zap size={14} className="text-sky-500"/> หลุมพรางทางการเงิน
  </p>
  <p className="font-bold text-sky-900 text-[13px] mb-1">{currentResult.kryptonite.name}</p>
  <p className="text-[12px] text-sky-800/80 leading-relaxed font-light">
    {/* ใช้ highlightText ตรงนี้ และเปลี่ยนสีให้เข้ากับกล่องฟ้า */}
    {highlightText(currentResult.kryptonite.desc, "font-bold text-sky-900 bg-sky-200/50 px-1 rounded-sm")}
  </p>
</div>

     {/* 🌍 เปิดโลกการเงิน + 🎭 ตัวตนรอง */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 mb-4 overflow-hidden text-center">
                    <h3 className="font-bold text-stone-800 mb-4 text-[13px] border-b border-stone-100 pb-3 flex items-center justify-between w-full">
                      <div className="flex items-center gap-2"><span className="text-[16px]">🧭</span> พิกัดตัวตนการเงิน</div>
                      <button onClick={() => setShowInfo(true)} className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors font-medium active:scale-95"><Info size={12} /></button>
                    </h3>
                    
                    {/* ตาราง 3x3 */}
                    <div className="flex flex-col items-center">
                      <div className="flex w-full justify-center pl-4 pr-1">
                        <div className="relative w-8 flex justify-center items-center mr-1.5 shrink-0">
                          <div className="absolute flex flex-row-reverse items-center gap-2 whitespace-nowrap text-[10px] font-bold text-stone-400 tracking-widest -rotate-90">
                            <span>เสี่ยงสูง 🚀</span><span>➔</span><span>เสี่ยงต่ำ 🛡️</span>
                          </div>
                        </div>
                        <motion.div className="grid grid-cols-3 gap-1.5 w-full max-w-[260px] bg-stone-100 p-1.5 rounded-xl border border-stone-200 relative cursor-pointer" animate={{ rotate: matrixRotation }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} onClick={handleMatrixClick}>
                          <div className={getMatrixClass('HIGH_RISK_LOW_DISC')}>กาวสุดกราฟ</div>
                          <div className={getMatrixClass('HIGH_RISK_MID_DISC')}>ล่าเทรนด์(ดอย)</div>
                          <div className={getMatrixClass('HIGH_RISK_HIGH_DISC')}>เซียนระบบ</div>
                          <div className={getMatrixClass('MID_RISK_LOW_DISC')}>ตัวตึงสายเปย์</div>
                          <div className={getMatrixClass('MID_RISK_MID_DISC')}>มนุษย์สมดุล</div>
                          <div className={getMatrixClass('MID_RISK_HIGH_DISC')}>นักปั้นพอร์ต</div>
                          <div className={getMatrixClass('LOW_RISK_LOW_DISC')}>ผู้ประสบภัย</div>
                          <div className={getMatrixClass('LOW_RISK_MID_DISC')}>สายเซฟโซน</div>
                          <div className={getMatrixClass('LOW_RISK_HIGH_DISC')}>พิทักษ์เงินต้น</div>
                        </motion.div>
                      </div>
                     {/* แกน X แนวนอน (ใช้ตามฟีล ➔ มีระบบ) */}
                      <div className="flex justify-between items-center w-full max-w-[280px] mt-3 px-3 text-[10px] font-bold text-stone-400 tracking-widest ml-10">
                        <span>💖 ใช้ตามฟีล</span>
                        <span>➔</span>
                        <span>มีระบบ ⚙️</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-stone-400 text-center mt-3 italic mb-1">ลองจิ้มที่ตารางเพื่อหมุนโลกการเงินดูสิ! 💫</p>

                    {/* ตัวตนรอง (ย้ายมาต่อท้ายตารางแบบมินิมอล) */}
                    {secondaryResult && (
                      <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                        <div className="flex flex-col items-start text-left">
                          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                            🎭 ตัวตนรองที่ซ่อนอยู่
                          </p>
                          <p className={`font-bold text-[13px] ${secondaryResult.titleColor} flex items-center gap-1`}>
                            {secondaryResult.emoji} {secondaryResult.title}
                          </p>
                        </div>
                        <div className="bg-stone-50 text-stone-500 text-[10px] px-2.5 py-1.5 rounded-lg font-bold border border-stone-200 shadow-sm shrink-0">
                          เหมือน {matchStats.secondary.matchPercentage}%
                        </div>
                      </div>
                    )}
                  </div>

            {/* 5️⃣ Asset ที่แนะนำสำหรับสไตล์คุณ (Primary + Secondary) */}
<div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 mb-4">
  <div className="border-b border-stone-100 pb-3 mb-4 flex items-center justify-between">
    <h3 className="font-bold text-stone-800 text-[13px] flex items-center gap-2">
      <span className="text-[16px]">🎯</span> Asset ที่แนะนำ
    </h3>
    <span className="text-[9px] text-stone-400 bg-stone-100/80 border border-stone-200 px-2 py-0.5 rounded-md font-semibold tracking-wide">
      *Not Financial Advice
    </span>
  </div>
  
  <div className="flex flex-col gap-3">
    {/* อันดับ 1 จากตัวตนหลัก */}
    <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl relative overflow-hidden shadow-sm">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
      <p className="text-[10px] font-bold text-amber-600 mb-1.5 uppercase tracking-wide flex items-center gap-1">
        🥇 อันดับ 1 (จากตัวตนหลัก)
      </p>
      <p className="font-bold text-stone-800 text-[13px] mb-1">{currentResult.bestPartner.name}</p>
      <p className="text-[12px] text-stone-600 leading-relaxed font-light">
        {highlightText(currentResult.bestPartner.desc, "font-bold text-amber-900 bg-amber-200/50 px-1 rounded-sm")}
      </p>
    </div>

    {/* อันดับ 2 จากตัวตนรอง */}
    {secondaryResult && (
      <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-stone-300"></div>
        <p className="text-[10px] font-bold text-stone-500 mb-1.5 uppercase tracking-wide flex items-center gap-1">
          🥈 อันดับ 2 (จากตัวตนรอง)
        </p>
        <p className="font-bold text-stone-700 text-[13px] mb-1">{secondaryResult.bestPartner.name}</p>
        <p className="text-[12px] text-stone-500 leading-relaxed font-light">
          {highlightText(secondaryResult.bestPartner.desc, "font-bold text-stone-700 bg-stone-200/50 px-1 rounded-sm")}
        </p>
      </div>
    )}
  </div>
</div>

                  {/* 6️⃣ เครื่องมืออัปสกิลอื่นๆ */}
                  <div className="flex flex-col items-center justify-center gap-2 mb-4">
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2"><span className="w-8 h-px bg-stone-200"></span>เครื่องมืออัปสกิลอื่นๆ<span className="w-8 h-px bg-stone-200"></span></p>
                    <div className="flex items-center justify-center gap-2 w-full">
                      <a href="https://wheel-of-life-upskill.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 bg-white text-stone-600 border border-stone-200 shadow-sm py-2.5 px-1 rounded-xl hover:bg-stone-50 hover:border-amber-300 hover:text-amber-600 transition-all active:scale-95"><PieChart size={14} className="text-amber-500" /><span className="text-[10px] font-bold">เช็กสมดุลชีวิต</span></a>
                      <a href="https://disc-office.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 bg-white text-stone-600 border border-stone-200 shadow-sm py-2.5 px-1 rounded-xl hover:bg-stone-50 hover:border-sky-400 hover:text-sky-600 transition-all active:scale-95"><Users size={14} className="text-sky-500" /><span className="text-[10px] font-bold">ค้นหาจุดแข็ง</span></a>
                    </div>
                  </div>
                  <div className="mt-2 text-center text-stone-400 text-[9px] uppercase tracking-widest font-semibold pb-4">Created by อัพสกิลกับฟุ้ย</div>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl p-4 border-t border-stone-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex flex-col gap-2.5 z-20">
              <button onClick={handleDownloadImage} disabled={isCapturing} className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-bold py-3.5 rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all text-[14px] shadow-lg disabled:opacity-50"><Camera size={18} /> {isCapturing ? "กำลังประมวลผลรูปภาพ..." : "เซฟรูปอวดเพื่อนลง Story"}</button>
              <a href="https://lin.ee/rQawKUM" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-stone-900 text-amber-400 font-bold py-3.5 rounded-xl hover:bg-black transition-all text-[14px] shadow-lg border border-stone-700"><MessageCircle size={18} className="fill-amber-400 text-amber-400" /> อัปสกิลหารายได้เพิ่ม</a>
              <button onClick={resetGame} className="flex-1 bg-stone-100 text-stone-600 font-semibold py-3 rounded-xl text-center text-[12px] flex items-center justify-center gap-1.5 hover:bg-stone-200 transition-colors"><RefreshCcw size={14} /> สแกน AVATAR อีกครั้ง</button>
            </div>
          </div>
        )}
      </div>

      {/* --- POPUPS --- */}
     {/* === POPUP 9 DNA === */}
      <AnimatePresence>
        {showInfo && (
          // เปลี่ยนจาก absolute เป็น fixed และให้ inset-0 ทำงานเต็มหน้าจอ
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4" 
            onClick={() => setShowInfo(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              className="bg-[#FCFBF8] w-full max-w-[360px] max-h-[80vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-stone-200" 
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-stone-900 text-amber-400 p-5 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-[15px] flex items-center gap-2"><Info size={18}/> 9 AVATAR ทางการเงิน</h3>
                <button onClick={() => setShowInfo(false)} className="bg-stone-800 p-2 rounded-full hover:bg-stone-700 transition-all active:scale-90 text-stone-400"><X size={20}/></button>
              </div>
              <div className="overflow-y-auto p-5 space-y-4">
                {Object.values(resultData).map((type, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-stone-100 flex items-start gap-4 shadow-sm hover:border-amber-200 transition-colors">
                    <div className="text-4xl mt-1 shrink-0">{type.emoji}</div>
                    <div>
                      <p className={`font-bold text-[14px] ${type.titleColor}`}>{type.title}</p>
                      <p className="text-[11px] text-stone-400 font-medium mb-2 uppercase tracking-tight">{type.subtitle}</p>
                     <p className="text-[12px] text-stone-600 leading-relaxed font-light">
   {highlightText(type.desc, "font-bold text-stone-800 bg-amber-100/60 px-1 rounded-sm")}
</p>
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
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4" 
            onClick={() => setShowJargon(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              className="bg-white w-full max-w-[340px] max-h-[75vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border-2 border-sky-100" 
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-sky-50 text-sky-800 p-5 flex justify-between items-center shrink-0 border-b border-sky-100">
                <h3 className="font-bold text-[15px] flex items-center gap-2"><BookOpen size={18} className="text-sky-600"/> คลังศัพท์น่ารู้</h3>
                <button onClick={() => setShowJargon(false)} className="bg-white p-2 rounded-full hover:bg-sky-100 text-sky-400 transition-all active:scale-90"><X size={20}/></button>
              </div>
              <div className="overflow-y-auto p-6 space-y-5">
                {activeJargons.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-[11px] font-bold text-sky-500 uppercase tracking-widest mb-1">ศัพท์ที่เกี่ยวข้อง</p>
                    {activeJargons.map((jargon, idx) => (
                      <div key={idx} className="bg-sky-50/30 p-4 rounded-2xl border border-sky-100">
                        <p className="font-bold text-[14px] text-stone-800 mb-1.5">{jargon.word}</p>
                        <p className="text-[13px] text-stone-600 leading-relaxed font-light">{jargon.desc}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="text-5xl mb-4">📖</div>
                    <p className="font-bold text-stone-700 text-[15px]">ไม่มีคลังศัพท์น่ารู้ในข้อนี้</p>
                    <p className="text-[12px] text-stone-500 font-light mt-2 px-4">อ่านแล้วลุยตอบตามสัญชาตญาณได้เลย!</p>
                  </div>
                )}
                
                {/* ศัพท์เพิ่มเติม (แสดงเสมอเพื่อให้ดูมีคอนเทนต์) */}
                <div className="pt-6 border-t border-stone-100">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">ศัพท์การเงินอื่นๆ ที่น่าสนใจ</p>
                  {jargonDict.filter(j => !activeJargons.includes(j)).slice(0, 2).map((jargon, idx) => (
                    <div key={idx} className="mb-4 last:mb-0">
                      <p className="font-bold text-[13px] text-stone-700 mb-1">{jargon.word}</p>
                      <p className="text-[12px] text-stone-500 font-light leading-snug">{jargon.desc}</p>
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

// ฟังก์ชันสำหรับแปลง **ข้อความ** ให้เป็นตัวหนาและมีสีไฮไลท์
const highlightText = (text: string, colorClass: string = "font-bold text-stone-900 bg-amber-100/60 px-1 rounded-md") => {
  if (!text) return null;
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, index) => 
    index % 2 === 1 ? (
      <span key={index} className={colorClass}>
        {part}
      </span>
    ) : (
      part
    )
  );
};