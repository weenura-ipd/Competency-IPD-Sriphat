/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Nurse, ExperienceGroup, EXPERIENCE_GROUPS } from './types';

export const HOSPITAL_WARDS = [
  { id: 'ward_12c', name: 'หอผู้ป่วย 12C (Ortho, Surg, EYE, ENT, CVT)', type: 'adult' },
  { id: 'ward_13c', name: 'หอผู้ป่วย 13C (Adult Med, Surg, Ortho)', type: 'adult' },
  { id: 'ward_14c', name: 'หอผู้ป่วย 14C (Adult Med, Surg, Ortho, EYE)', type: 'adult' },
  { id: 'ward_14s', name: 'หอผู้ป่วย 14S (OB-Gyn, Ped)', type: 'adult' },
  { id: 'ward_15s', name: 'หอผู้ป่วย 15S (VIP รวมทุกโรค)', type: 'adult' }
];

export const EVALUATORS = [
  'พว. สุภาพร แสนดี (หัวหน้าหอผู้ป่วย)',
  'พว. จันทร์จิรา มีชัย (พยาบาลชำนาญการพิเศษ)',
  'พว. ณัฐพล มงคลสุข (หัวหน้างานการพยาบาล)'
];

// Helper to determine if nurse passed based on scores meeting expected target
export function checkPassStatus(scores: Record<string, number>, experienceGroup: ExperienceGroup, wardType: 'adult' | 'pediatric_women'): boolean {
  const expected = EXPERIENCE_GROUPS[experienceGroup].expectedEpa;
  
  // Collect active competency IDs
  const activeIds = [
    'core_1', 'core_2', 'core_3', 'core_4', 'core_5', 'core_6', 'core_7', 'core_8'
  ];
  if (wardType === 'adult') {
    activeIds.push('spec_a1', 'spec_a2', 'spec_a3', 'spec_a4', 'spec_a5');
  } else {
    activeIds.push('spec_p1', 'spec_p2', 'spec_p3', 'spec_p4', 'spec_p5');
  }

  // Calculate percentage of scores meeting or exceeding expected EPA
  let metCount = 0;
  for (const id of activeIds) {
    const score = scores[id] || 0;
    if (score >= expected) {
      metCount++;
    }
  }

  // Passing criteria: At least 80% of active competencies meet or exceed the expected level, and average score >= expected - 0.5
  const metRate = metCount / activeIds.length;
  
  let totalScore = 0;
  for (const id of activeIds) {
    totalScore += scores[id] || 0;
  }
  const avg = totalScore / activeIds.length;

  return metRate >= 0.80 && avg >= (expected - 0.5);
}

export const INITIAL_MOCK_NURSES: Nurse[] = [];

const DEPRECATED_MOCK_NURSES: any[] = [
  {
    id: 'n_1',
    name: 'กานดา',
    surname: 'ใจเย็น',
    employeeId: 'SP-69001',
    ward: 'หอผู้ป่วย 12C (IPD 12C - อายุรกรรม)',
    wardType: 'adult',
    experienceYears: 0.8,
    experienceGroup: 'novice',
    evaluationDate: '2026-06-15',
    evaluatorName: 'พว. สุภาพร แสนดี (หัวหน้าหอผู้ป่วย)',
    scores: {
      core_1: 2,
      core_2: 2,
      core_3: 3,
      core_4: 1, // Gap: expected 2, got 1
      core_5: 2,
      core_6: 2,
      core_7: 2,
      core_8: 2,
      spec_a1: 2,
      spec_a2: 2,
      spec_a3: 1, // Gap: expected 2, got 1 (High Alert Meds)
      spec_a4: 2,
      spec_a5: 2
    },
    notes: 'มีความตั้งใจดี มีความรอบคอบด้านการดูแลผิวหนัง แต่ยังมีจุดต้องระมัดระวังเป็นพิเศษเรื่องความเร็วในการรายงานแพทย์ระบบ SBAR และความรู้ด้านยาความเสี่ยงสูง (High Alert Meds) ต้องการพี่เลี้ยงดูแลประเมินซ้ำแบบคู่ขนาน',
    isPassed: false // didn't meet some core elements
  },
  {
    id: 'n_2',
    name: 'วิภาดา',
    surname: 'รักษ์ไทย',
    employeeId: 'SP-68045',
    ward: 'หอผู้ป่วย 12C (IPD 12C - อายุรกรรม)',
    wardType: 'adult',
    experienceYears: 1.5,
    experienceGroup: 'advanced_beginner',
    evaluationDate: '2026-05-20',
    evaluatorName: 'พว. สุภาพร แสนดี (หัวหน้าหอผู้ป่วย)',
    scores: {
      core_1: 3,
      core_2: 3,
      core_3: 4,
      core_4: 3,
      core_5: 2, // Gap: expected 3, got 2 (Academics)
      core_6: 3,
      core_7: 3,
      core_8: 3,
      spec_a1: 3,
      spec_a2: 3,
      spec_a3: 3,
      spec_a4: 2, // Gap: expected 3, got 2 (Discharge plan)
      spec_a5: 3
    },
    notes: 'ปฏิบัติงานการพยาบาลทั่วไปได้ดีมาก แนะนำให้ส่งเสริมด้านการวางแผนจำหน่ายผู้ป่วย (Discharge planning) เพิ่มเติม รวมถึงทักษะการสืบค้นแนวปฏิบัติทางคลินิก (CPG) เพื่อประกอบการตัดสินใจพยาบาล',
    isPassed: true
  },
  {
    id: 'n_3',
    name: 'อรัญญา',
    surname: 'พรประเสริฐ',
    employeeId: 'SP-65012',
    ward: 'หอผู้ป่วย 13C (IPD 13C - ศัลยกรรม)',
    wardType: 'adult',
    experienceYears: 4.2,
    experienceGroup: 'competent',
    evaluationDate: '2026-07-02',
    evaluatorName: 'พว. จันทร์จิรา มีชัย (พยาบาลชำนาญการพิเศษ)',
    scores: {
      core_1: 4,
      core_2: 4,
      core_3: 4,
      core_4: 4,
      core_5: 3, // Gap: expected 4, got 3 (Research)
      core_6: 4,
      core_7: 4,
      core_8: 4,
      spec_a1: 4,
      spec_a2: 4,
      spec_a3: 3, // Gap: expected 4, got 3 (High-Alert Meds)
      spec_a4: 4,
      spec_a5: 4
    },
    notes: 'เป็นกำลังหลักของวอร์ดในการช่วยเตรียมตัวผู้ป่วยผ่าตัดและดูแลบาดแผลได้อย่างดีเยี่ยม ได้รับคำชื่นชมจากญาติ มีจุดพัฒนาเล็กน้อยเรื่องทักษะวิชาการ/วิจัย และความแม่นยำในการปรับขนาดยาความเสี่ยงสูงทางหลอดเลือดดำในหอผู้ป่วยศัลยกรรม',
    isPassed: true
  },
  {
    id: 'n_4',
    name: 'สมชาย',
    surname: 'ดีเสนาะ',
    employeeId: 'SP-60114',
    ward: 'หอผู้ป่วย 13C (IPD 13C - ศัลยกรรม)',
    wardType: 'adult',
    experienceYears: 8.5,
    experienceGroup: 'proficient',
    evaluationDate: '2026-04-18',
    evaluatorName: 'พว. จันทร์จิรา มีชัย (พยาบาลชำนาญการพิเศษ)',
    scores: {
      core_1: 5,
      core_2: 4,
      core_3: 5,
      core_4: 4,
      core_5: 4,
      core_6: 5,
      core_7: 4,
      core_8: 4,
      spec_a1: 4,
      spec_a2: 4,
      spec_a3: 4,
      spec_a4: 4,
      spec_a5: 5
    },
    notes: 'พฤติกรรมและความรู้ความสามารถอยู่ในเกณฑ์ดีเลิศ เป็นแบบอย่างด้านจริยธรรมและการทำหน้าที่ควบคุมความปลอดภัยห้องผ่าตัด/หอผู้ป่วยศัลยกรรม เป็นโค้ชที่ดีแก่น้องๆ แนะนำให้พัฒนาต่อสู่ระดับผู้ชำนาญการพิเศษ',
    isPassed: true
  },
  {
    id: 'n_5',
    name: 'พัชรินทร์',
    surname: 'ศรีอุบล',
    employeeId: 'SP-54002',
    ward: 'หอผู้ป่วย 14S (IPD 14S - พิเศษศัลยกรรมและอายุรกรรม)',
    wardType: 'adult',
    experienceYears: 12.0,
    experienceGroup: 'expert',
    evaluationDate: '2026-06-30',
    evaluatorName: 'พว. ณัฐพล มงคลสุข (หัวหน้างานการพยาบาล)',
    scores: {
      core_1: 5,
      core_2: 5,
      core_3: 5,
      core_4: 5,
      core_5: 5,
      core_6: 5,
      core_7: 5,
      core_8: 4, // Gap: expected 5, got 4 (Social - minor gap)
      spec_a1: 5,
      spec_a2: 5,
      spec_a3: 5,
      spec_a4: 5,
      spec_a5: 5
    },
    notes: 'ระดับ Expert ทำหน้าที่เป็นเสาหลักด้านการนิเทศดูแลผู้ป่วยวิกฤต พัฒนาแนวปฏิบัติทางคลินิก (CPG) ของหอผู้ป่วยพิเศษ 14S และการจัดการเครื่องช่วยหายใจที่ทันสมัย ปฏิบัติงานเป็นแบบอย่างที่โดดเด่นมากของฝ่ายการพยาบาลศูนย์ศรีพัฒน์',
    isPassed: true
  },
  {
    id: 'n_6',
    name: 'สุจิรา',
    surname: 'พงษ์พาณิชย์',
    employeeId: 'SP-69044',
    ward: 'หอผู้ป่วย 14C (IPD 14C - กุมารเวชกรรมและนรีเวชกรรม)',
    wardType: 'pediatric_women',
    experienceYears: 0.5,
    experienceGroup: 'novice',
    evaluationDate: '2026-07-01',
    evaluatorName: 'พว. จันทร์จิรา มีชัย (พยาบาลชำนาญการพิเศษ)',
    scores: {
      core_1: 2,
      core_2: 1, // Gap: expected 2, got 1 (Nursing practice)
      core_3: 2,
      core_4: 2,
      core_5: 1, // Gap: expected 2, got 1 (Academics)
      core_6: 2,
      core_7: 2,
      core_8: 2,
      spec_p1: 2,
      spec_p2: 1, // Gap: expected 2, got 1 (Critically ill peds)
      spec_p3: 2,
      spec_p4: 2,
      spec_p5: 2
    },
    notes: 'พยาบาลแรกเข้าหอผู้ป่วยกุมารเวชกรรม 14C มีความระมัดระวังในเรื่องความลับผู้ป่วยดี แต่ยังขาดทักษะเรื่องกู้ชีพเด็ก (Pediatric BLS/PALS) และสัญญานเตือนวิกฤตในเด็ก (PEWS) ต้องการการดูแลอย่างใกล้ชิดและส่งเข้าฝึกอบรมคอร์สช่วยชีวิตทารก/เด็กแรกเกิดเร่งด่วน',
    isPassed: false
  },
  {
    id: 'n_7',
    name: 'ณัฐนันท์',
    surname: 'ปัญญาไว',
    employeeId: 'SP-67022',
    ward: 'หอผู้ป่วย 14C (IPD 14C - กุมารเวชกรรมและนรีเวชกรรม)',
    wardType: 'pediatric_women',
    experienceYears: 2.8,
    experienceGroup: 'advanced_beginner',
    evaluationDate: '2026-05-15',
    evaluatorName: 'พว. จันทร์จิรา มีชัย (พยาบาลชำนาญการพิเศษ)',
    scores: {
      core_1: 3,
      core_2: 3,
      core_3: 3,
      core_4: 3,
      core_5: 3,
      core_6: 4,
      core_7: 3,
      core_8: 3,
      spec_p1: 3,
      spec_p2: 2, // Gap: expected 3, got 2 (PALS/PEWS)
      spec_p3: 3,
      spec_p4: 3,
      spec_p5: 3
    },
    notes: 'สื่อสารกับกุมารแพทย์และพ่อแม่เด็กในหอผู้ป่วย 14C ได้อย่างอบอุ่นน่ารัก มีมนุษยสัมพันธ์ดีเลิศ จุดที่ต้องเพิ่มพูนความมั่นใจคือความเชี่ยวชาญในการช่วยประเมินผู้ป่วยเด็กวิกฤต (PEWS) และการเฝ้าระวังทารกแรกเกิดที่เจ็บป่วยรุนแรง',
    isPassed: true
  },
  {
    id: 'n_8',
    name: 'วิไลวรรณ',
    surname: 'งามดี',
    employeeId: 'SP-64112',
    ward: 'หอผู้ป่วย 14C (IPD 14C - กุมารเวชกรรมและนรีเวชกรรม)',
    wardType: 'pediatric_women',
    experienceYears: 4.8,
    experienceGroup: 'competent',
    evaluationDate: '2026-06-18',
    evaluatorName: 'พว. ณัฐพล มงคลสุข (หัวหน้างานการพยาบาล)',
    scores: {
      core_1: 4,
      core_2: 4,
      core_3: 4,
      core_4: 3, // Gap: expected 4, got 3 (Leadership)
      core_5: 4,
      core_6: 4,
      core_7: 4,
      core_8: 4,
      spec_p1: 4,
      spec_p2: 3, // Gap: expected 4, got 3
      spec_p3: 4,
      spec_p4: 4,
      spec_p5: 4
    },
    notes: 'มีความเชี่ยวชาญการดูแลผู้ป่วยนรีเวชกรรมและผ่าตัดมดลูก/ปีกมดลูกดีเยี่ยม ทว่าเมื่อได้หมุนเวียนไปดูแลสตรีตั้งครรภ์เสี่ยงสูงหรือเด็ก ยังมีความประหม่าเล็กน้อย แนะนำให้ส่งอบรมทักษะความเป็นผู้นำและการรายงานวิกฤต',
    isPassed: true
  },
  {
    id: 'n_9',
    name: 'พัชรา',
    surname: 'ทองกวาว',
    employeeId: 'SP-61205',
    ward: 'หอผู้ป่วย 14C (IPD 14C - กุมารเวชกรรมและนรีเวชกรรม)',
    wardType: 'pediatric_women',
    experienceYears: 7.2,
    experienceGroup: 'proficient',
    evaluationDate: '2026-07-05',
    evaluatorName: 'พว. ณัฐพล มงคลสุข (หัวหน้างานการพยาบาล)',
    scores: {
      core_1: 5,
      core_2: 4,
      core_3: 4,
      core_4: 4,
      core_5: 4,
      core_6: 4,
      core_7: 4,
      core_8: 4,
      spec_p1: 4,
      spec_p2: 4,
      spec_p3: 5,
      spec_p4: 4,
      spec_p5: 5
    },
    notes: 'ดูแลผู้ป่วยสตรีและโรคทางนรีเวชในหอผู้ป่วย 14C ได้อย่างเป็นเลิศ ส่งเสริมสัมพันธภาพและการเลี้ยงลูกด้วยนมแม่สำเร็จ มีส่วนร่วมในงานวิชาการของโรงพยาบาลและเป็นกำลังสำคัญด้านความปลอดภัย',
    isPassed: true
  },
  {
    id: 'n_10',
    name: 'มยุรี',
    surname: 'วรสาร',
    employeeId: 'SP-69022',
    ward: 'หอผู้ป่วย 14S (IPD 14S - พิเศษศัลยกรรมและอายุรกรรม)',
    wardType: 'adult',
    experienceYears: 0.9,
    experienceGroup: 'novice',
    evaluationDate: '2026-07-10',
    evaluatorName: 'พว. จันทร์จิรา มีชัย (พยาบาลชำนาญการพิเศษ)',
    scores: {
      core_1: 2,
      core_2: 2,
      core_3: 3,
      core_4: 2,
      core_5: 2,
      core_6: 2,
      core_7: 1, // Gap: expected 2, got 1 (Technology)
      core_8: 2,
      spec_a1: 1, // Gap: expected 2, got 1 (Complex care)
      spec_a2: 2,
      spec_a3: 2,
      spec_a4: 2,
      spec_a5: 2
    },
    notes: 'พยาบาลแรกเข้าหอผู้ป่วยพิเศษ 14S ยังพบความไม่มั่นใจในเรื่องเทคโนโลยีการช่วยชีวิตระดับสูง (เช่น การอ่านคลื่นไฟฟ้าหัวใจ, ระบบไอทีของวอร์ด) และการดูแลประเมินสัญญาณวิกฤตซับซ้อน แนะนำให้เพิ่มความเข้มข้นของการสังเกตการณ์พยาบาล',
    isPassed: false
  },
  {
    id: 'n_11',
    name: 'รวีวรรณ',
    surname: 'ชื่นจิตร',
    employeeId: 'SP-67104',
    ward: 'หอผู้ป่วย 14S (IPD 14S - พิเศษศัลยกรรมและอายุรกรรม)',
    wardType: 'adult',
    experienceYears: 2.1,
    experienceGroup: 'advanced_beginner',
    evaluationDate: '2026-04-12',
    evaluatorName: 'พว. ณัฐพล มงคลสุข (หัวหน้างานการพยาบาล)',
    scores: {
      core_1: 3,
      core_2: 3,
      core_3: 3,
      core_4: 2, // Gap: expected 3, got 2 (Quality/Risk)
      core_5: 3,
      core_6: 3,
      core_7: 3,
      core_8: 3,
      spec_a1: 3,
      spec_a2: 3,
      spec_a3: 2, // Gap: expected 3, got 2 (High-Alert Meds)
      spec_a4: 3,
      spec_a5: 3
    },
    notes: 'มีความเชี่ยวชาญการประเมินเบื้องต้นในวอร์ดพิเศษ 14S แต่อัตราความผิดพลาดเรื่องการรายงาน Near miss และความตื่นตระหนกยามเจอภาวะแทรกซ้อนยายังต้องแก้ไขเป็นจุดเฉพาะ ได้ให้คำแนะนำแบบรายสัปดาห์แล้ว',
    isPassed: true // passed by met count >= 80% but has important gaps to develop
  },
  {
    id: 'n_12',
    name: 'สุชาดา',
    surname: 'รักสุข',
    employeeId: 'SP-63022',
    ward: 'หอผู้ป่วย 15S (IPD 15S - พิเศษพรีเมียม)',
    wardType: 'adult',
    experienceYears: 5.5,
    experienceGroup: 'proficient',
    evaluationDate: '2026-06-25',
    evaluatorName: 'พว. สุภาพร แสนดี (หัวหน้าหอผู้ป่วย)',
    scores: {
      core_1: 4,
      core_2: 4,
      core_3: 4,
      core_4: 4,
      core_5: 4,
      core_6: 4,
      core_7: 4,
      core_8: 4,
      spec_a1: 4,
      spec_a2: 4,
      spec_a3: 4,
      spec_a4: 4,
      spec_a5: 4
    },
    notes: 'มีความรู้ความเชี่ยวชาญในการพยาบาลผู้ป่วยพิเศษพรีเมียมอย่างสมบูรณ์แบบ ทั้งการประเมินสัญญาณวิกฤตและการเฝ้าระวัง มีทัศนคติเชิงบวกเป็นเลิศ ได้รับคำชื่นชมจากผู้ป่วยและญาติอย่างต่อเนื่อง เป็นแบบอย่างที่ดีแก่น้องๆ ในหอผู้ป่วย 15S',
    isPassed: true
  },
  {
    id: 'n_8',
    name: 'สิรินุช',
    surname: 'กล้าหาญ',
    employeeId: 'SP-64112',
    ward: 'หอผู้ป่วย 14C (IPD 14C - กุมารเวชกรรมและนรีเวชกรรม)',
    wardType: 'pediatric_women',
    experienceYears: 4.8,
    experienceGroup: 'competent',
    evaluationDate: '2026-06-18',
    evaluatorName: 'พว. ณัฐพล มงคลสุข (หัวหน้างานการพยาบาล)',
    scores: {
      core_1: 4,
      core_2: 4,
      core_3: 4,
      core_4: 3, // Gap: expected 4, got 3 (Leadership)
      core_5: 4,
      core_6: 4,
      core_7: 4,
      core_8: 4,
      spec_p1: 4,
      spec_p2: 3, // Gap: expected 4, got 3
      spec_p3: 4,
      spec_p4: 4,
      spec_p5: 4
    },
    notes: 'มีความเชี่ยวชาญการดูแลผู้ป่วยนรีเวชกรรมและผ่าตัดมดลูก/ปีกมดลูกดีเยี่ยม ทว่าเมื่อได้หมุนเวียนไปดูแลสตรีตั้งครรภ์เสี่ยงสูงหรือเด็ก ยังมีความประหม่าเล็กน้อย แนะนำให้ส่งอบรมทักษะความเป็นผู้นำและการรายงานวิกฤต',
    isPassed: true
  },
  {
    id: 'n_9',
    name: 'พัชรา',
    surname: 'ทองกวาว',
    employeeId: 'SP-61205',
    ward: 'หอผู้ป่วยนรีเวชกรรม 6 (OB-GYN)',
    wardType: 'pediatric_women',
    experienceYears: 7.2,
    experienceGroup: 'proficient',
    evaluationDate: '2026-07-05',
    evaluatorName: 'พว. ณัฐพล มงคลสุข (หัวหน้างานการพยาบาล)',
    scores: {
      core_1: 5,
      core_2: 4,
      core_3: 4,
      core_4: 4,
      core_5: 4,
      core_6: 4,
      core_7: 4,
      core_8: 4,
      spec_p1: 4,
      spec_p2: 4,
      spec_p3: 5,
      spec_p4: 4,
      spec_p5: 5
    },
    notes: 'ดูแลผู้ป่วยสตรีและโรคทางนรีเวชได้อย่างเป็นเลิศ ส่งเสริมสัมพันธภาพและการเลี้ยงลูกด้วยนมแม่สำเร็จ มีส่วนร่วมในงานวิชาการของโรงพยาบาลและเป็นกำลังสำคัญด้านความปลอดภัย',
    isPassed: true
  },
  {
    id: 'n_10',
    name: 'มยุรี',
    surname: 'วรสาร',
    employeeId: 'SP-69022',
    ward: 'หอผู้ป่วยวิกฤตอายุรกรรม (ICU)',
    wardType: 'adult',
    experienceYears: 0.9,
    experienceGroup: 'novice',
    evaluationDate: '2026-07-10',
    evaluatorName: 'พว. จันทร์จิรา มีชัย (พยาบาลชำนาญการพิเศษ)',
    scores: {
      core_1: 2,
      core_2: 2,
      core_3: 3,
      core_4: 2,
      core_5: 2,
      core_6: 2,
      core_7: 1, // Gap: expected 2, got 1 (Technology)
      core_8: 2,
      spec_a1: 1, // Gap: expected 2, got 1 (Complex care)
      spec_a2: 2,
      spec_a3: 2,
      spec_a4: 2,
      spec_a5: 2
    },
    notes: 'พยาบาลแรกเข้า ICU ยังพบความไม่มั่นใจในเรื่องเทคโนโลยีการช่วยชีวิตระดับสูง (เช่น การอ่านคลื่นไฟฟ้าหัวใจ, ระบบไอที ICU) และการดูแลประเมินสัญญาณวิกฤตซับซ้อน แนะนำให้เพิ่มความเข้มข้นของการสังเกตการณ์พยาบาล',
    isPassed: false
  },
  {
    id: 'n_11',
    name: 'รวีวรรณ',
    surname: 'ชื่นจิตร',
    employeeId: 'SP-67104',
    ward: 'หอผู้ป่วยวิกฤตอายุรกรรม (ICU)',
    wardType: 'adult',
    experienceYears: 2.1,
    experienceGroup: 'advanced_beginner',
    evaluationDate: '2026-04-12',
    evaluatorName: 'พว. ณัฐพล มงคลสุข (หัวหน้างานการพยาบาล)',
    scores: {
      core_1: 3,
      core_2: 3,
      core_3: 3,
      core_4: 2, // Gap: expected 3, got 2 (Quality/Risk)
      core_5: 3,
      core_6: 3,
      core_7: 3,
      core_8: 3,
      spec_a1: 3,
      spec_a2: 3,
      spec_a3: 2, // Gap: expected 3, got 2 (High-Alert Meds)
      spec_a4: 3,
      spec_a5: 3
    },
    notes: 'มีความเชี่ยวชาญการประเมินเบื้องต้นใน ICU แต่อัตราความผิดพลาดเรื่องการรายงาน Near miss และความตื่นตระหนกยามเจอภาวะแทรกซ้อนยายังต้องแก้ไขเป็นจุดเฉพาะ ได้ให้คำแนะนำแบบรายสัปดาห์แล้ว',
    isPassed: true // passed by met count >= 80% but has important gaps to develop
  },
  {
    id: 'n_12',
    name: 'สุชาดา',
    surname: 'รักสุข',
    employeeId: 'SP-63022',
    ward: 'หอผู้ป่วยกุมารเวชกรรม 5 (Pediatrics)',
    wardType: 'pediatric_women',
    experienceYears: 5.5,
    experienceGroup: 'proficient',
    evaluationDate: '2026-06-25',
    evaluatorName: 'พว. สุภาพร แสนดี (หัวหน้าหอผู้ป่วย)',
    scores: {
      core_1: 4,
      core_2: 4,
      core_3: 4,
      core_4: 4,
      core_5: 4,
      core_6: 4,
      core_7: 4,
      core_8: 4,
      spec_p1: 4,
      spec_p2: 4,
      spec_p3: 4,
      spec_p4: 4,
      spec_p5: 4
    },
    notes: 'มีความรู้ความเชี่ยวชาญในการพยาบาลกุมารเวชกรรมอย่างสมบูรณ์แบบ ทั้งการช่วยชีวิตเด็ก (PALS) และการเฝ้าระวัง ทัศนคติเชิงบวกเป็นที่รักใคร่ของกุมารแพทย์และพยาบาลทุกท่านในองค์กรพยาบาล',
    isPassed: true
  }
];

// Map actual gap levels to customized Training Needs & Recommendations
export function generateGapAnalysis(
  compCode: string,
  compTitle: string,
  actual: number,
  expected: number,
  thaiTitle: string
): { severity: 'none' | 'low' | 'high'; trainingNeed: string; recommendation: string } {
  const gap = actual - expected;
  if (gap >= 0) {
    return {
      severity: 'none',
      trainingNeed: 'ไม่มีช่องว่างสมรรถนะ (มีสมรรถนะตรงตามเกณฑ์หรือดีกว่าคาดหวัง)',
      recommendation: 'ส่งเสริมรักษามาตรฐาน ปฏิบัติงานเป็นแบบอย่าง (Role Model) หรือเป็นพี่เลี้ยง (Mentor) แก่พยาบาลร่วมงาน'
    };
  }

  const severity = gap <= -2 ? 'high' : 'low';

  // Customize based on Competency code
  let trainingNeed = '';
  let recommendation = '';

  switch (compCode) {
    case 'CORE-1':
      trainingNeed = 'ต้องการทบทวนความเข้าใจเชิงลึกเกี่ยวกับกฎหมายสุขภาพ สิทธิผู้ป่วย จรรยาบรรณวิชาชีพพยาบาล และการรักษาข้อมูลความลับ';
      recommendation = 'จัดอบรมสั้น (Micro-learning) เรื่องกฎหมายสุขภาพจริยธรรม หรือเข้ากลุ่มศึกษากรณีศึกษาทางจริยธรรม (Ethics case study) ของโรงพยาบาล';
      break;
    case 'CORE-2':
      trainingNeed = 'ต้องการพัฒนาความแม่นยำในการใช้กระบวนการพยาบาล การเฝ้าระวังความเสี่ยง และเทคนิคการปฏิบัติการดูแลปลอดเชื้อทางวิชาชีพ';
      recommendation = 'จัดโปรแกรมสังเกตการณ์ข้างเตียง (Bedside Direct Observation) โดยพี่เลี้ยง และทบทวนแนวทางการพยาบาลผู้ป่วยเสี่ยงสูง (แผลกดทับ/พลัดตกหกล้ม)';
      break;
    case 'CORE-3':
      trainingNeed = 'ต้องการปรับปรุงด้านบุคลิกภาพวิชาชีพ การยอมรับข้อมูลย้อนกลับ และวินัยความรับผิดชอบในการปฏิบัติงานพยาบาล';
      recommendation = 'นัดคุยแบบตัวต่อตัว (1:1 Coaching) เพื่อพัฒนาทัศนคติและเปิดใจรับฟังฟีดแบ็ก พร้อมจัดทำสมุดบันทึกสะท้อนคิดประจำเวร (Reflective Journal)';
      break;
    case 'CORE-4':
      trainingNeed = 'ต้องการพัฒนาทักษะความเป็นผู้นำเวร การรายงานความเสี่ยง (Incident Report) อย่างเป็นระบบ และการจัดลำดับความเร่งด่วนดูแลผู้ป่วย';
      recommendation = 'ส่งอบรมหลักสูตรหัวหน้าเวร/พยาบาลประสานงาน การประยุกต์ใช้เครื่องมือรายงานความเสี่ยง และให้ร่วมทีมทำโครงการพัฒนางานคุณลักษณะ (CQI)';
      break;
    case 'CORE-5':
      trainingNeed = 'ต้องการเพิ่มพูนความสามารถในการสืบค้นข้อมูลเชิงวิชาการ การทำความเข้าใจแนวปฏิบัติทางคลินิก (CPG) และการทบทวนงานวิจัย';
      recommendation = 'มอบหมายการศึกษาทบทวนวารสารการพยาบาล (Journal Club Review) หรือให้นำเสนอวิชาการย่อยในการประชุมพยาบาล (Ward conference)';
      break;
    case 'CORE-6':
      trainingNeed = 'ต้องการพัฒนาทักษะการรายงานแพทย์ด้วยระบบ SBAR และการสื่อสารกับญาติผู้ป่วยภายใต้สถานการณ์กดดันตึงเครียด';
      recommendation = 'ร่วมฝึกซ้อมสถานการณ์จำลอง (Simulation) ด้านการสื่อสารในวิกฤตพยาบาล การให้ข้อมูลข่าวร้าย และการรายงานผู้ป่วยแบบ SBAR format';
      break;
    case 'CORE-7':
      trainingNeed = 'ต้องการทบทวนการบันทึกข้อมูลการพยาบาลลงเวชระเบียนอิเล็กทรอนิกส์ (EMR) และวินัยความปลอดภัยด้านรหัสผ่านไอที';
      recommendation = 'จัดฝึกอบรมทวนซ้ำการใช้งานระบบ HIS/EMR สำหรับพยาบาล และทำคู่มือพกพาเรื่องระบบคำสั่งยาและข้อพึงปฏิบัติด้านความปลอดภัยไซเบอร์';
      break;
    case 'CORE-8':
      trainingNeed = 'ต้องการเพิ่มความเข้าใจเกี่ยวกับสิทธิ์การรักษาพยาบาล และทัศนคติการพยาบาลแบบเท่าเทียมและละเอียดอ่อนในมิติสังคมเศรษฐกิจ';
      recommendation = 'ให้ศึกษาดูงานร่วมกับทีมนักสังคมสงเคราะห์ หรือร่วมกิจกรรมพยาบาลชุมชนของกลุ่ม เพื่อสร้างความตระหนักรู้วัฒนธรรมที่ละเอียดอ่อน';
      break;
    // SPECIFIC ADULT
    case 'SPEC-A1':
      trainingNeed = 'ต้องการความแม่นยำในการดูแลผู้ป่วยอายุรกรรม/ศัลยกรรมที่มีภาวะซับซ้อนสูง และการประเมินผู้ป่วยที่อาการเปลี่ยนแปลงฉับพลัน';
      recommendation = 'จัดฝึกซ้อมแบบจำลองการดูแลผู้ป่วยอาการทรุดลงเฉียบพลัน และให้ร่วมทีมนิเทศพยาบาลข้างเตียงกับพยาบาลผู้เชี่ยวชาญ (Adult APN)';
      break;
    case 'SPEC-A2':
      trainingNeed = 'ต้องการพัฒนาทักษะการป้องกันภาวะแทรกซ้อนหลัก เช่น แผลกดทับ การติดเชื้อจากการคาสายสวนปัสสาวะ/สายหลอดเลือด และสับสนเฉียบพลัน';
      recommendation = 'ทบทวนการประยุกต์ใช้ Care Bundles (CAUTI/CLABSI Bundles) และเฝ้าประเมินการตรวจเช็คผิวหนังและประเมิน Delirium สม่ำเสมอ';
      break;
    case 'SPEC-A3':
      trainingNeed = 'ต้องการความถูกต้องแม่นยำสูงสุดในการจัดเตรียม คำนวณขนาดยา และปรับยาความเสี่ยงสูง (High-Alert Medications)';
      recommendation = 'จัดสอนเสริม 1:1 กับเภสัชกรวอร์ดเรื่องการเจือจางกลุ่มยาสุ่มเสี่ยง และฝึกหัดการสอบทานคู่อย่างเคร่งครัด (Double check system)';
      break;
    case 'SPEC-A4':
      trainingNeed = 'ต้องการพัฒนาทักษะการวางแผนจำหน่ายผู้ป่วย (Discharge planning) และการสอนสุขศึกษาในการดูแลต่อเมื่อกลับบ้าน';
      recommendation = 'มอบหมายให้รับผิดชอบเคสพยาบาลหลักเพื่อดูแลตั้งแต่แรกรับจนถึงจำหน่าย และประเมินทักษะการใช้วิธีพูดคุยย้อนกลับ (Teach-back method)';
      break;
    case 'SPEC-A5':
      trainingNeed = 'ต้องการทบทวนความรู้การประเมินสภาวะผู้ป่วยก่อนผ่าตัด และความพร้อมในการฟื้นตัวจากวิสัญญี (PACU score / Aldrete score)';
      recommendation = 'มอบหมายให้ร่วมฝึกงานในหน่วยห้องพักฟื้นผ่าตัด (PACU) เป็นเวลา 1-2 สัปดาห์ และทบทวนเช็คลิสต์ตรวจสอบความเสี่ยงห้องผ่าตัด';
      break;
    // SPECIFIC PEDS/WOMEN
    case 'SPEC-P1':
      trainingNeed = 'ต้องการเพิ่มพูนความเร็วในการประเมินคัดกรองเด็กเจ็บป่วยรุนแรงด้วยเครื่องมือ PAT และความแม่นยำคำนวณยาตามน้ำหนักเด็ก';
      recommendation = 'จัดโปรแกรมทดสอบคำนวณขนาดเวชภัณฑ์เด็ก และเข้าชั้นเรียนทบทวนเรื่องพยาธิสรีรวิทยาทางเดินหายใจเด็กแรกเกิดถึงกุมารปฐมวัย';
      break;
    case 'SPEC-P2':
      trainingNeed = 'ต้องการการพัฒนาเร่งด่วนในเรื่องกระบวนการช่วยชีวิตกุมารกู้ชีพเด็ก (PALS) และการใช้ระบบคะแนนสัญญาณวิกฤตเด็ก (PEWS)';
      recommendation = 'บังคับส่งฝึกอบรมหลักสูตรกู้ชีพกุมารช่วยชีวิตเด็กขั้นสูง (PALS) และจัดฝึกสถานการณ์จำลอง (Simulation drill) ในวอร์ดกุมาร';
      break;
    case 'SPEC-P3':
      trainingNeed = 'ต้องการพัฒนาความเชี่ยวชาญการเตรียมพร้อมก่อน-หลังผ่าตัดทางนรีเวชกรรม และการพิทักษ์ความลับความเป็นส่วนตัวคนไข้สตรี';
      recommendation = 'เข้าร่วมกิจกรรมแลกเปลี่ยนเรียนรู้เคสผ่าตัดนรีเวช และทบทวนคู่มือพยาบาลดูแลผู้ป่วยที่มีภาวะสุ่มเสี่ยงมะเร็งระบบสืบพันธุ์สตรี';
      break;
    case 'SPEC-P4':
      trainingNeed = 'ต้องการความแม่นยำในการดูแลพยาบาลหญิงตั้งครรภ์ความเสี่ยงสูงที่มีภาวะความดันโลหิตสูงและเบาหวาน (GDM)';
      recommendation = 'อบรมทบทวน Magnesium Sulfate protocol และการตรวจเช็คอัตราเต้นหัวใจทารกในครรภ์ผ่านเครื่องตรวจแบบต่อเครื่อง (CTG Monitoring)';
      break;
    case 'SPEC-P5':
      trainingNeed = 'ต้องการพัฒนาทักษะประเมินพัฒนาการเด็กแบบ DSPM และกระตุ้นความสำเร็จในการเลี้ยงลูกด้วยนมแม่ของมารดาหลังคลอด';
      recommendation = 'ฝึกหัดประเมินเด็กด้วยชุดทดสอบ DSPM ร่วมกับทีมพี่เลี้ยง และทบทวนท่าทางช่วยอุ้มทารกดูดนมแม่ตามแนวทางโรงพยาบาลรักเด็ก';
      break;
    default:
      trainingNeed = `ต้องการการปรับปรุงสมรรถนะในหัวข้อ ${compTitle}`;
      recommendation = 'ร่วมมือกับหัวหน้าหอผู้ป่วยและพี่เลี้ยงประจำตัว เพื่อกำกับดูแลติดตามพฤติกรรมและการทำงานพยาบาลในสัปดาห์ถัดไป';
  }

  return {
    severity,
    trainingNeed,
    recommendation
  };
}
