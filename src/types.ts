/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ExperienceGroup = 'novice' | 'advanced_beginner' | 'competent' | 'proficient' | 'expert';

export interface ExperienceGroupDetail {
  id: ExperienceGroup;
  title: string;
  thaiTitle: string;
  rangeYears: string;
  expectedEpa: number;
  description: string;
}

export const EXPERIENCE_GROUPS: Record<ExperienceGroup, ExperienceGroupDetail> = {
  novice: {
    id: 'novice',
    title: 'Novice',
    thaiTitle: 'พยาบาลระดับเริ่มต้น (0-1 ปี)',
    rangeYears: '0-1 ปี',
    expectedEpa: 2,
    description: 'สามารถปฏิบัติงานได้บางส่วน ภายใต้การดูแลแนะนำของพี่เลี้ยงอย่างใกล้ชิด'
  },
  advanced_beginner: {
    id: 'advanced_beginner',
    title: 'Advanced Beginner',
    thaiTitle: 'พยาบาลระดับพัฒนาการ (>1-3 ปี)',
    rangeYears: '>1-3 ปี',
    expectedEpa: 3,
    description: 'สามารถปฏิบัติงานพื้นฐานได้ตามมาตรฐาน มีความมั่นใจมากขึ้น และต้องการคำปรึกษาในรายที่ซับซ้อน'
  },
  competent: {
    id: 'competent',
    title: 'Competent',
    thaiTitle: 'พยาบาลระดับชำนาญการ (>3-5 ปี)',
    rangeYears: '>3-5 ปี',
    expectedEpa: 4,
    description: 'สามารถปฏิบัติงานได้อย่างมีประสิทธิภาพ วางแผนและจัดลำดับความสำคัญของงานได้ด้วยตนเอง'
  },
  proficient: {
    id: 'proficient',
    title: 'Proficient',
    thaiTitle: 'พยาบาลระดับชำนาญการพิเศษ (>5-10 ปี)',
    rangeYears: '>5-10 ปี',
    expectedEpa: 4,
    description: 'มีความเชี่ยวชาญ คล่องแคล่ว มีบทบาทนำทางคลินิกและสอนงานรุ่นน้องได้'
  },
  expert: {
    id: 'expert',
    title: 'Expert',
    thaiTitle: 'พยาบาลผู้เชี่ยวชาญ (>10 ปี)',
    rangeYears: '>10 ปี',
    expectedEpa: 5,
    description: 'เป็นต้นแบบทางคลินิก ตัดสินใจในกรณีวิกฤต/ซับซ้อน และขับเคลื่อนเชิงนโยบาย'
  }
};

export interface CompetencyItem {
  id: string;
  code: string;
  title: string;
  thaiTitle: string;
  description: string;
  domain: string;
  indicators: string[];
}

export const CORE_COMPETENCIES: CompetencyItem[] = [
  {
    id: 'core_1',
    code: 'CORE-1',
    title: 'Ethics and Law',
    thaiTitle: 'ด้านจริยธรรม จรรยาบรรณ และกฎหมาย',
    description: 'ความรู้และการปฏิบัติตนตามจรรยาบรรณวิชาชีพ กฎหมายสุขภาพ สิทธิผู้ป่วย และความลับผู้ป่วย',
    domain: 'Core',
    indicators: [
      'เข้าใจและพิทักษ์สิทธิผู้ป่วยตามที่กฎหมายกำหนด',
      'รักษาความลับและข้อมูลส่วนบุคคลของผู้ป่วยอย่างเคร่งครัด',
      'ตระหนักและปฏิบัติตามจรรยาบรรณวิชาชีพพยาบาลในทุกสถานการณ์',
      'ตัดสินใจเชิงจริยธรรมภายใต้ความขัดแย้งของญาติและสิทธิ์ผู้ป่วย'
    ]
  },
  {
    id: 'core_2',
    code: 'CORE-2',
    title: 'Professional Nursing Practice & Safety',
    thaiTitle: 'ด้านการปฏิบัติการพยาบาลและความปลอดภัย',
    description: 'การทำหัตถการ การดูแลผู้ป่วยแบบองค์รวม และการบริหารความเสี่ยงเพื่อความปลอดภัยสูงสุดของผู้ป่วย',
    domain: 'Core',
    indicators: [
      'ประเมินสภาพร่างกายและจิตใจของผู้ป่วยอย่างถูกต้องและครอบคลุม',
      'ปฏิบัติตามมาตรฐานการระบุตัวตนผู้ป่วยและความปลอดภัย 2P Safety อย่างเคร่งครัด',
      'ทำหัตถการทางการพยาบาลด้วยเทคนิคปลอดเชื้อ (Aseptic technique) อย่างถูกต้อง',
      'ลงบันทึกรายงานเหตุการณ์อุบัติการณ์และความเสี่ยงทางการพยาบาลได้อย่างเหมาะสม'
    ]
  },
  {
    id: 'core_3',
    code: 'CORE-3',
    title: 'Clinical Judgment & Reasoning',
    thaiTitle: 'ด้านการตัดสินใจทางคลินิกและการประเมินสภาวะ',
    description: 'ความสามารถในการวิเคราะห์อาการแสดง ข้อมูลทางคลินิก และการประเมินสัญญาณวิกฤต',
    domain: 'Core',
    indicators: [
      'ประเมินและตรวจจับอาการแสดงของภาวะวิกฤตหรือสภาวะที่แย่ลงได้อย่างทันท่วงที',
      'วิเคราะห์เชื่อมโยงผลแล็บ สัญญาณชีพ และพยาธิสภาพของผู้ป่วยได้ถูกต้อง',
      'เลือกวิธีการพยาบาลแก้ไขปัญหาเฉพาะหน้าได้อย่างปลอดภัยและเป็นระบบ',
      'ประสานรายงานแพทย์ด้วยเหตุผลเชิงคลินิกที่กระชับและตรงประเด็น'
    ]
  },
  {
    id: 'core_4',
    code: 'CORE-4',
    title: 'Leadership and Quality Management',
    thaiTitle: 'ด้านภาวะผู้นำและการจัดการคุณภาพ',
    description: 'ทักษะความเป็นผู้นำเวร การเฝ้าระวังความเสี่ยง และการรายงานอุบัติการณ์อย่างเป็นระบบ',
    domain: 'Core',
    indicators: [
      'ทำหน้าที่หัวหน้าเวรหรือผู้ประสานงานทีมได้อย่างมีประสิทธิภาพ',
      'จัดลำดับความเร่งด่วนในการดูแลผู้ป่วยในทีมได้อย่างเหมาะสม',
      'ตระหนักและรายงานอุบัติการณ์หรือความเสี่ยงทางการพยาบาลทันที',
      'มีส่วนร่วมในโครงการพัฒนาคุณภาพงานพยาบาลอย่างต่อเนื่อง'
    ]
  },
  {
    id: 'core_5',
    code: 'CORE-5',
    title: 'Academic and Research',
    thaiTitle: 'ด้านวิชาการและการวิจัย',
    description: 'การใช้หลักฐานเชิงประจักษ์ (Evidence-Based Practice) การสืบค้นแนวปฏิบัติ และงานวิชาการพยาบาล',
    domain: 'Core',
    indicators: [
      'สืบค้นข้อมูลเชิงวิชาการและแนวปฏิบัติทางคลินิก (CPG) ที่ทันสมัย',
      'ประยุกต์ใช้หลักฐานเชิงประจักษ์ในการให้การดูแลพยาบาลผู้ป่วย',
      'เข้าร่วมประชุมวิชาการหรือเวิร์กชอปขององค์กรพยาบาลสม่ำเสมอ',
      'มีส่วนร่วมในการทำวิจัยหรือนำเสนอผลงานทางวิชาการพยาบาล'
    ]
  },
  {
    id: 'core_6',
    code: 'CORE-6',
    title: 'Communication and Collaboration',
    thaiTitle: 'ด้านการสื่อสารและการทำงานเป็นทีม',
    description: 'การส่งต่อข้อมูลแบบ SBAR การประสานงานทีมสหวิชาชีพ และมนุษยสัมพันธ์ดีเลิศ',
    domain: 'Core',
    indicators: [
      'รายงานการเปลี่ยนแปลงอาการผู้ป่วยด้วยระบบ SBAR ได้อย่างถูกต้องชัดเจน',
      'สื่อสารและให้ข้อมูลกับผู้ป่วยและญาติด้วยความสุภาพและเห็นอกเห็นใจ',
      'ประสานงานดูแลรักษาร่วมกับแพทย์และทีมสหวิชาชีพอย่างไร้รอยต่อ',
      'ให้เกียรติและร่วมมือทำงานร่วมกับเพื่อนร่วมทีมทุกคนอย่างราบรื่น'
    ]
  },
  {
    id: 'core_7',
    code: 'CORE-7',
    title: 'Informatics and Technology',
    thaiTitle: 'ด้านสารสนเทศและเทคโนโลยี',
    description: 'การใช้ระบบบันทึกเวชระเบียนอิเล็กทรอนิกส์ (EMR) และเทคโนโลยีช่วยชีวิตในวอร์ด',
    domain: 'Core',
    indicators: [
      'บันทึกข้อมูลการพยาบาลในระบบสารสนเทศโรงพยาบาล (HIS/EMR) ครบถ้วนถูกต้อง',
      'รักษาความปลอดภัยรหัสผ่านระบบคอมพิวเตอร์และไม่ทิ้งหน้าจอค้างไว้',
      'ใช้งานเครื่องมือแพทย์ระบบไอทีและเทคโนโลยีช่วยชีวิตประจำวอร์ดได้ถูกต้อง',
      'ติดตามผลการตรวจทางห้องปฏิบัติการและรังสีผ่านระบบอิเล็กทรอนิกส์อย่างแม่นยำ'
    ]
  },
  {
    id: 'core_8',
    code: 'CORE-8',
    title: 'Sociomedical Care',
    thaiTitle: 'ด้านการดูแลทางสังคมและมิติทางสังคมศาสตร์',
    description: 'ความเข้าใจสิทธิ์รักษา มิติเศรษฐานะ และวัฒนธรรมที่ละเอียดอ่อนในการดูแลผู้ป่วย',
    domain: 'Core',
    indicators: [
      'ประเมินสิทธิ์การรักษาพยาบาลและความกังวลด้านค่าใช้จ่ายของผู้ป่วย',
      'ประสานงานดูแลร่วมกับนักสังคมสงเคราะห์ในรายที่มีปัญหาเศรษฐานะ',
      'เคารพและตอบสนองความต้องการด้านจิตวิญญาณและวัฒนธรรมอย่างเท่าเทียม',
      'ดูแลผู้ป่วยในมิติความเป็นมนุษย์โดยคำนึงถึงบริบทครอบครัวและสังคม'
    ]
  }
];

export const ADULT_SPECIFIC_COMPETENCIES: CompetencyItem[] = [
  {
    id: 'spec_a1',
    code: 'SPEC-A1',
    title: 'Complex Patient Care',
    thaiTitle: 'การดูแลผู้ป่วยที่มีความซับซ้อน',
    description: 'ทักษะการประเมิน ตรวจจับความผิดปกติ และวางแผนดูแลผู้ป่วยที่มีพยาธิสภาพซับซ้อนสูงหรืออาการเปลี่ยนแปลงฉับพลัน',
    domain: 'Specific',
    indicators: [
      'ประเมินสภาพร่างกายและระบบสำคัญอย่างรวดเร็วและเป็นระบบ (ABCDE Assessment)',
      'ระบุสัญญาณเตือนภัยเร่งด่วน (Clinical Red Flags) และรายงานสถานะผู้ป่วยได้ถูกต้อง',
      'วางแผนและปรับเปลี่ยนการจัดกิจกรรมพยาบาลร่วมกับทีมสหวิชาชีพอย่างมีประสิทธิภาพ',
      'ดูแลผู้ป่วยในภาวะวิกฤตหรือรายที่มีปัญหาเจ็บป่วยซับซ้อนหลายระบบร่วมกัน'
    ]
  },
  {
    id: 'spec_a2',
    code: 'SPEC-A2',
    title: 'Complication Surveillance',
    thaiTitle: 'การเฝ้าระวังและป้องกันภาวะแทรกซ้อนในโรงพยาบาล',
    description: 'การประเมินความเสี่ยงและมาตรการป้องกันการเกิดภาวะแทรกซ้อนที่พบบ่อยระหว่างนอนรักษาในโรงพยาบาล',
    domain: 'Specific',
    indicators: [
      'ใช้แบบประเมินความเสี่ยงมาตรฐานอย่างถูกต้องสม่ำเสมอ (เช่น แผลกดทับ พลัดตกหกล้ม)',
      'ปฏิบัติตามแนวทางการป้องกันการติดเชื้อในโรงพยาบาลอย่างเคร่งครัด (CAUTI, CLABSI, VAP)',
      'เฝ้าระวังและประเมินภาวะสับสนเฉียบพลัน (Delirium) หรือภาวะถดถอยทางคลินิกอย่างใกล้ชิด',
      'รายงานเหตุการณ์เกือบพลาด (Near Miss) และเหตุการณ์ไม่พึงประสงค์อย่างครบถ้วน'
    ]
  },
  {
    id: 'spec_a3',
    code: 'SPEC-A3',
    title: 'High-Alert Medication Management',
    thaiTitle: 'การบริหารยาและการดูแลผู้ป่วยที่ได้รับยาความเสี่ยงสูง',
    description: 'ความถูกต้อง ปลอดภัย และรอบคอบในการเตรียม เจือจาง ปรับอัตราการไหล และเฝ้าระวังยาความเสี่ยงสูง',
    domain: 'Specific',
    indicators: [
      'ยึดหลักความถูกต้องในการบริหารยา (7 Rights) และระเบียบความปลอดภัยด้านยาอย่างเคร่งครัด',
      'บริหารยาและสารน้ำกลุ่มความเสี่ยงสูง (High-Alert Medications) ด้วยความระมัดระวังเป็นพิเศษ',
      'คำนวณขนาดและอัตราหยดของยาทางหลอดเลือดดำได้อย่างถูกต้องรวดเร็ว',
      'สอบทานคู่ (Double check) ติดตามผลข้างเคียง และทำความเข้าใจปฏิกิริยาระหว่างยาอย่างถูกต้อง'
    ]
  },
  {
    id: 'spec_a4',
    code: 'SPEC-A4',
    title: 'Discharge Planning & Seamless Care',
    thaiTitle: 'การวางแผนจำหน่ายและการดูแลแบบไร้รอยต่อ',
    description: 'กระบวนการเตรียมความพร้อม วางแผนจำหน่าย และการสอนสุขศึกษาเพื่อส่งมอบการดูแลที่ต่อเนื่องและไร้รอยต่อ',
    domain: 'Specific',
    indicators: [
      'เริ่มประเมินความต้องการและวางแผนจำหน่ายผู้ป่วย (Discharge Planning) ตั้งแต่แรกรับ',
      'ให้คำแนะนำและสอนสุขศึกษาแก่ผู้ป่วยและญาติในการดูแลตนเองต่อด้วยวิธี Teach-back',
      'ประสานข้อมูลและเตรียมเครื่องมือเวชภัณฑ์ในการดูแลผู้ป่วยต่อเนื่องกับทีมสุขภาพ',
      'วิเคราะห์ปัจจัยเสี่ยงและหาแนวทางร่วมกันเพื่อลดอัตราการกลับมารักษาซ้ำ (Readmission)'
    ]
  },
  {
    id: 'spec_a5',
    code: 'SPEC-A5',
    title: 'Perioperative & Procedural Care',
    thaiTitle: 'การดูแลผู้ป่วยระยะก่อนและหลังผ่าตัดหรือหัตถการ',
    description: 'การประเมิน เตรียมความพร้อม และการเฝ้าระวังดูแลความปลอดภัยของผู้ป่วยในระยะก่อนและหลังทำผ่าตัด/หัตถการ',
    domain: 'Specific',
    indicators: [
      'เตรียมความพร้อมผู้ป่วย ตรวจสอบความถูกต้องของแผนการรักษาและใบยินยอม (Pre-op Checklist)',
      'ดูแลพยาบาลผู้ป่วยหลังผ่าตัด/หัตถการ ประเมินสัญญาณชีพ ความปวด แผลผ่าตัด และสายระบายต่างๆ',
      'ประเมินเกณฑ์ความปลอดภัยในการฟื้นตัวจากวิสัญญีหรือหัตถการ (Aldrete Score)',
      'สังเกต ตรวจจับ และรายงานภาวะแทรกซ้อนหลังผ่าตัด/หัตถการได้อย่างรวดเร็ว ทันเวลา'
    ]
  }
];
export const PEDIATRIC_SPECIFIC_COMPETENCIES: CompetencyItem[] = [
  {
    id: 'spec_p1',
    code: 'SPEC-P1',
    title: 'Acute Pediatric Illness Assessment',
    thaiTitle: 'การประเมินและดูแลผู้ป่วยเด็กและทารกที่มีภาวะเจ็บป่วยเฉียบพลัน',
    description: 'ทักษะการประเมินทางคลินิกอย่างรวดเร็วด้วย Pediatric Assessment Triangle (PAT) และการคำนวณยาตามน้ำหนัก',
    domain: 'Specific_Peds',
    indicators: [
      'ใช้เครื่องมือประเมินสภาวะเด็กเฉียบพลัน Pediatric Assessment Triangle (PAT): Appearance, Work of Breathing, Circulation',
      'คำนวณและเตรียมขนาดยาพาราเซตามอล ยาฆ่าเชื้อ และสารน้ำอย่างถูกต้องแม่นยำตามน้ำหนักตัวเด็ก',
      'ประเมินระดับการขาดน้ำในเด็ก (Dehydration Scale) และติดตามความพร้อมในการทดแทนน้ำ',
      'ตรวจจับและรายงานอาการชักจากไข้สูง (Febrile Seizure) หรือภาวะหลอดลมหดเกร็ง (Croup)'
    ]
  },
  {
    id: 'spec_p2',
    code: 'SPEC-P2',
    title: 'Critically Ill Pediatric Care',
    thaiTitle: 'การดูแลผู้ป่วยเด็กและทารกที่มีภาวะวิกฤต',
    description: 'ทักษะการช่วยเหลือช่วยชีวิตเด็กขั้นสูง (PALS) และการเฝ้าระวังอย่างต่อเนื่องด้วยเครื่องตรวจสัญญาณชีพวิกฤต',
    domain: 'Specific_Peds',
    indicators: [
      'ตระหนักและใช้ระบบสัญญาณเตือนวิกฤตเด็ก Pediatric Early Warning Score (PEWS) เพื่อเรียกทีมพยาบาลวิกฤต',
      'ปฏิบัติทักษะกู้ชีพช่วยชีวิตเด็กขั้นสูง (Pediatric Advanced Life Support: PALS) ตามมาตรฐาน',
      'เตรียมและตรวจสอบอุปกรณ์กู้ชีพเด็กตามขนาดตัว โดยอิงระบบรหัสสี Broselow Tape',
      'เฝ้าระวังและพยาบาลดูแลผู้ป่วยทารกแรกเกิดวิกฤต (Sick Neonate) เช่น ภาวะน้ำตาลในเลือดต่ำ หรือการติดเชื้อกระแสเลือด'
    ]
  },
  {
    id: 'spec_p3',
    code: 'SPEC-P3',
    title: 'Gynecological Patient Care',
    thaiTitle: 'การดูแลผู้ป่วยสตรีและโรคทางนรีเวช',
    description: 'ความละเอียดอ่อน พยาธิสรีรวิทยาของระบบสืบพันธุ์สตรี การเตรียมผ่าตัดและการช่วยเหลือดูแลทางนรีเวช',
    domain: 'Specific_Peds',
    indicators: [
      'เตรียมสตรีกลุ่มผ่าตัดนรีเวช (Hysterectomy, Laparoscopy) ทั้งทางด้านร่างกาย ลำไส้ และเอกสารสำคัญ',
      'ดูแลระงับความปวด บันทึกปริมาณเลือด แผลผ่าตัด และสายระบายทางนรีเวช',
      'ให้คำปรึกษาเกี่ยวกับสุขภาพสตรี การป้องกันมะเร็งปากมดลูก และการดูแลตนเองในวัยหมดประจำเดือน',
      'รักษาความลับขั้นสูงสุดและให้การพยาบาลพิทักษ์เกียรติยศความเป็นส่วนตัวของสตรี'
    ]
  },
  {
    id: 'spec_p4',
    code: 'SPEC-P4',
    title: 'High-Risk Pregnancy Care',
    thaiTitle: 'การดูแลหญิงตั้งครรภ์ที่มีภาวะเสี่ยงสูง',
    description: 'ทักษะการเฝ้าระวังภาวะความดันโลหิตสูงขณะตั้งครรภ์ เบาหวานขณะตั้งครรภ์ และการติดตามสุขภาพมารดาและทารกในครรภ์',
    domain: 'Specific_Peds',
    indicators: [
      'เฝ้าระวัง ตรวจจับสัญญาณแทรกซ้อนรุนแรงในครรภ์เสี่ยงสูง เช่น ครรภ์เป็นพิษ (Pre-eclampsia) และกลุ่มอาการ HELLP',
      'บริหารยาสำคัญ เช่น Magnesium Sulfate ตามโปรโตคอลความปลอดภัย เฝ้าระวังสารพิษ',
      'ประเมินการเคลื่อนไหวของทารกในครรภ์ (Kick Count) และเฝ้าระวังเสียงหัวใจทารกด้วย CTG/EFM',
      'ให้คำปรึกษาและการสนับสนุนด้านจิตใจและสังคมแก่หญิงตั้งครรภ์ที่มีความวิตกกังวลสูง'
    ]
  },
  {
    id: 'spec_p5',
    code: 'SPEC-P5',
    title: 'Health & Development Promotion',
    thaiTitle: 'การส่งเสริมสุขภาพและพัฒนาการเด็กและสตรี',
    description: 'ความรู้เกี่ยวกับตารางวัคซีน พัฒนาการตามวัย โภชนาการ และการเลี้ยงลูกด้วยนมแม่สำเร็จ',
    domain: 'Specific_Peds',
    indicators: [
      'ประเมินและคัดกรองพัฒนาการเด็กปฐมวัยตามแบบประเมินคู่มือเฝ้าระวังพัฒนาการ (DSPM / Denver II)',
      'สนับสนุนมารดาในการส่งเสริมและกระตุ้นการดูดนมแม่ตามหลัก 10 ขั้นตอนโรงพยาบาลรักเด็ก (BFHI)',
      'ให้คำแนะนำเกี่ยวกับตารางสร้างเสริมภูมิคุ้มกันโรค (Immunization Schedule) และโภชนาการตามวัย',
      'ส่งเสริมและให้สุขศึกษาแก่ผู้ปกครองในการป้องกันอุบัติเหตุในบ้าน (Fall Prevention)'
    ]
  }
];

export interface Nurse {
  id: string;
  name: string;
  surname: string;
  employeeId: string;
  ward: string;
  wardType: 'adult' | 'pediatric_women';
  experienceYears: number;
  experienceGroup: ExperienceGroup;
  evaluationDate: string;
  evaluatorName: string;
  scores: Record<string, number>; // competency ID -> score (1-5)
  notes?: string;
  isPassed: boolean; // whether they meet minimum expected target overall or average >= expected
}

export interface GapAnalysisItem {
  competencyId: string;
  competencyCode: string;
  competencyTitle: string;
  actualScore: number;
  expectedScore: number;
  gap: number; // actual - expected
  severity: 'none' | 'low' | 'high';
  trainingNeed: string;
  recommendation: string;
}

export interface WardStatistics {
  wardName: string;
  totalNurses: number;
  passedNurses: number;
  passRate: number;
  avgScores: Record<string, number>;
}
