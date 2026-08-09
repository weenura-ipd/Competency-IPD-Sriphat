/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  HeartPulse, 
  Award, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Cpu, 
  Globe, 
  Search, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  TrendingDown, 
  Filter, 
  PlusCircle, 
  Printer, 
  Edit3, 
  Trash2, 
  HelpCircle, 
  Activity, 
  FileSpreadsheet, 
  GraduationCap,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

import { db } from './firebase';
import { 
  ExperienceGroup, 
  EXPERIENCE_GROUPS, 
  CORE_COMPETENCIES, 
  ADULT_SPECIFIC_COMPETENCIES, 
  PEDIATRIC_SPECIFIC_COMPETENCIES, 
  Nurse, 
  CompetencyItem,
  GapAnalysisItem
} from './types';
import { 
  HOSPITAL_WARDS, 
  EVALUATORS, 
  INITIAL_MOCK_NURSES, 
  checkPassStatus, 
  generateGapAnalysis 
} from './data';

const SriphatLogo = ({ className = "h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M 24 30 H 6 V 70 H 24"
      stroke="#00A07D"
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M 76 30 H 94 V 70 H 76"
      stroke="#00A07D"
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M 34 0 V 25 C 34 48 66 52 66 75 V 100"
      stroke="#5D2D91"
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NsoLogo = ({ className = "h-14" }: { className?: string }) => (
  <svg viewBox="0 0 120 120" className={className} xmlns="http://www.w3.org/2000/svg" fill="none">
    <path
      d="M 60,42 C 60,42 54,32 60,22 C 66,32 60,42 60,42 Z"
      fill="#FF8F00"
      className="animate-pulse"
    />
    <path
      d="M 60,39 C 60,39 57,32 60,26 C 63,32 60,39 60,39 Z"
      fill="#FFD54F"
    />
    <path
      d="M 45,74 Q 60,70 75,74 L 70,66 H 50 Z"
      fill="#5D2D91"
      opacity="0.8"
    />
    <path
      d="M 38,55 C 38,47 82,47 82,55 C 82,63 38,63 38,55 Z"
      fill="url(#lamp-grad)"
    />
    <path
      d="M 42,54 C 30,52 20,44 18,30 C 22,46 36,54 44,56 Z"
      fill="#9C27B0"
    />
    <path
      d="M 78,52 C 86,52 92,44 88,36 C 84,28 74,38 74,48"
      stroke="#FFB74D"
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="none"
    />
    <text
      x="60"
      y="94"
      textAnchor="middle"
      fill="#5D2D91"
      fontWeight="900"
      fontSize="22"
      letterSpacing="1"
      fontFamily="sans-serif"
    >
      NSO
    </text>
    <text
      x="60"
      y="110"
      textAnchor="middle"
      fill="#00A07D"
      fontWeight="bold"
      fontSize="10"
      letterSpacing="0.5"
      fontFamily="sans-serif"
    >
      Sriphat Hospital
    </text>
    <defs>
      <linearGradient id="lamp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7E57C2" />
        <stop offset="100%" stopColor="#5D2D91" />
      </linearGradient>
    </defs>
  </svg>
);

export default function App() {
  // --- States ---
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [activeTab, setActiveTab] = useState<'individual' | 'evaluate' | 'organizational' | 'gaps'>('individual');
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWard, setFilterWard] = useState<string>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Selected nurse for dashboard/reports
  const [selectedNurseId, setSelectedNurseId] = useState<string>('');
  
  // Form States for Evaluation
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    surname: '',
    employeeId: '',
    ward: HOSPITAL_WARDS[0].name,
    experienceYears: 1.0,
    experienceGroup: 'advanced_beginner' as ExperienceGroup,
    evaluationDate: new Date().toISOString().split('T')[0],
    evaluatorName: '',
    scores: {} as Record<string, number>,
    notes: ''
  });

  // UI States
  const [collapsedDomains, setCollapsedDomains] = useState<Record<string, boolean>>({
    'core': false,
    'specific': false
  });
  const [chartType, setChartType] = useState<'radar' | 'bar'>('radar');
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Gap Analysis per Ward & Experience Group States
  const [gapSelectedWard, setGapSelectedWard] = useState<string>(HOSPITAL_WARDS[0].name);
  const [gapSelectedGroup, setGapSelectedGroup] = useState<ExperienceGroup>('novice');
  const [gapChartType, setGapChartType] = useState<'radar' | 'bar'>('radar');

// Initialize data from Firebase Firestore
useEffect(() => {
  const loadNursesFromFirebase = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'nurses'));
      const firebaseNurses: Nurse[] = querySnapshot.docs.map(
        (docSnap) => ({
          ...(docSnap.data() as Nurse),
          id: docSnap.id
        })
      );

      setNurses(firebaseNurses);

      if (firebaseNurses.length > 0) {
        setSelectedNurseId(firebaseNurses[0].id);
      } else {
        setSelectedNurseId('');
      }
    } catch (error) {
      console.error('Error loading nurses from Firebase:', error);
    }
  };

  loadNursesFromFirebase();
}, []);

// Sync nurses to Firebase Firestore

const saveNursesToLocalStorage = async (updated: Nurse[]) => {

  setNurses(updated);

  try {

    for (const nurse of updated) {

      if (!nurse.id) continue;

      await setDoc(

        doc(db, 'nurses', nurse.id),

        nurse,

        { merge: true }

      );

    }

  } catch (error: any) {

    console.error('Error saving nurses to Firebase:', error);

    alert('Firebase Error: ' + (error?.message || error));

    throw error;

  }

};

  // Auto-detect experience group based on years of experience
  const handleExperienceYearsChange = (years: number) => {
    let group: ExperienceGroup = 'novice';
    if (years <= 1) group = 'novice';
    else if (years <= 3) group = 'advanced_beginner';
    else if (years <= 5) group = 'competent';
    else if (years <= 10) group = 'proficient';
    else group = 'expert';

    setFormData(prev => ({
      ...prev,
      experienceYears: years,
      experienceGroup: group
    }));
  };

  // Determine ward type based on ward name
  const currentWardType = useMemo(() => {
    const wardObj = HOSPITAL_WARDS.find(w => w.name === formData.ward);
    return (wardObj?.type || 'adult') as 'adult' | 'pediatric_women';
  }, [formData.ward]);

  // Load appropriate specific competencies
  const specificCompetenciesForForm = useMemo(() => {
    return currentWardType === 'adult' ? ADULT_SPECIFIC_COMPETENCIES : PEDIATRIC_SPECIFIC_COMPETENCIES;
  }, [currentWardType]);

  // Pre-fill score fields when ward or experience group changes
  useEffect(() => {
    // Fill default score for unpopulated items
    const expected = EXPERIENCE_GROUPS[formData.experienceGroup].expectedEpa;
    const defaultScores: Record<string, number> = { ...formData.scores };
    
    CORE_COMPETENCIES.forEach(c => {
      if (!defaultScores[c.id]) {
        defaultScores[c.id] = expected; // Pre-fill with expected value as starting point
      }
    });

    specificCompetenciesForForm.forEach(s => {
      if (!defaultScores[s.id]) {
        defaultScores[s.id] = expected;
      }
    });

    setFormData(prev => ({
      ...prev,
      scores: defaultScores
    }));
  }, [formData.experienceGroup, formData.ward]);

  // Handle Score selection
  const handleScoreChange = (competencyId: string, val: number) => {
    setFormData(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [competencyId]: val
      }
    }));
  };

  // Save/Submit Form Handler
  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.surname.trim() || !formData.employeeId.trim()) {
      alert('กรุณากรอกข้อมูลพื้นฐานพยาบาลให้ครบถ้วน');
      return;
    }

    const wardType = HOSPITAL_WARDS.find(w => w.name === formData.ward)?.type as 'adult' | 'pediatric_women' || 'adult';
    const isPassed = checkPassStatus(formData.scores, formData.experienceGroup, wardType);

    const targetNurse: Nurse = {
      id: isEditing ? formData.id : 'n_' + Date.now(),
      name: formData.name.trim(),
      surname: formData.surname.trim(),
      employeeId: formData.employeeId.trim(),
      ward: formData.ward,
      wardType,
      experienceYears: Number(formData.experienceYears),
      experienceGroup: formData.experienceGroup,
      evaluationDate: formData.evaluationDate,
      evaluatorName: formData.evaluatorName,
      scores: formData.scores,
      notes: formData.notes.trim(),
      isPassed
    };

    let updated: Nurse[];
    if (isEditing) {
      updated = nurses.map(n => n.id === formData.id ? targetNurse : n);
      setSuccessMessage('แก้ไขบันทึกผลการประเมินสำเร็จเรียบร้อยแล้ว');
    } else {
      updated = [targetNurse, ...nurses];
      setSuccessMessage('บันทึกผลการประเมินชุดใหม่สำเร็จเรียบร้อยแล้ว');
    }

   await saveNursesToLocalStorage(updated);
    setSelectedNurseId(targetNurse.id);
    setIsEditing(false);
    
    // Clear success banner after 4 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);

    // Switch to individual tab to view the results
    setActiveTab('individual');
  };

  // Start Editing of existing nurse
  const handleEditNurse = (nurse: Nurse) => {
    setFormData({
      id: nurse.id,
      name: nurse.name,
      surname: nurse.surname,
      employeeId: nurse.employeeId,
      ward: nurse.ward,
      experienceYears: nurse.experienceYears,
      experienceGroup: nurse.experienceGroup,
      evaluationDate: nurse.evaluationDate,
      evaluatorName: nurse.evaluatorName,
      scores: { ...nurse.scores },
      notes: nurse.notes || ''
    });
    setIsEditing(true);
    setActiveTab('evaluate');
  };

// Delete nurse profile from Firebase Firestore
const handleDeleteNurse = async (id: string) => {
  if (
    window.confirm(
      'คุณแน่ใจหรือไม่ว่าต้องการลบผลการประเมินของบุคลากรรายนี้? (การกระทำนี้ไม่สามารถย้อนกลับได้)'
    )
  ) {
    try {
      // Delete from Firebase
      await deleteDoc(doc(db, 'nurses', id));

      // Update screen immediately
      const updated = nurses.filter(n => n.id !== id);
      setNurses(updated);

      if (selectedNurseId === id) {
        if (updated.length > 0) {
          setSelectedNurseId(updated[0].id);
        } else {
          setSelectedNurseId('');
        }
      }
    } catch (error) {
      console.error('Error deleting nurse from Firebase:', error);
      alert('ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
  }
};

  // Prepare form for empty state / Add New Evaluation
  const handleAddNewEvaluation = () => {
    setIsEditing(false);
    setFormData({
      id: '',
      name: '',
      surname: '',
      employeeId: '',
      ward: HOSPITAL_WARDS[0].name,
      experienceYears: 1.0,
      experienceGroup: 'advanced_beginner' as ExperienceGroup,
      evaluationDate: new Date().toISOString().split('T')[0],
      evaluatorName: '',
      scores: {},
      notes: ''
    });
    setActiveTab('evaluate');
  };

  // Selected Nurse computed statistics
  const selectedNurse = useMemo(() => {
    return nurses.find(n => n.id === selectedNurseId) || null;
  }, [nurses, selectedNurseId]);

  // List of active competencies for selected nurse
  const selectedNurseCompetencies = useMemo(() => {
    if (!selectedNurse) return { cores: [], specifics: [] };
    const cores = CORE_COMPETENCIES;
    const specifics = selectedNurse.wardType === 'adult' ? ADULT_SPECIFIC_COMPETENCIES : PEDIATRIC_SPECIFIC_COMPETENCIES;
    return { cores, specifics };
  }, [selectedNurse]);

  // Compute Gap Analysis for selected Nurse
  const selectedNurseGaps = useMemo((): GapAnalysisItem[] => {
    if (!selectedNurse) return [];
    const gaps: GapAnalysisItem[] = [];
    const expected = EXPERIENCE_GROUPS[selectedNurse.experienceGroup].expectedEpa;

    const { cores, specifics } = selectedNurseCompetencies;

    cores.forEach(c => {
      const actual = selectedNurse.scores[c.id] || 0;
      const gapVal = actual - expected;
      const gapInfo = generateGapAnalysis(c.code, c.thaiTitle, actual, expected, c.thaiTitle);
      
      gaps.push({
        competencyId: c.id,
        competencyCode: c.code,
        competencyTitle: c.thaiTitle,
        actualScore: actual,
        expectedScore: expected,
        gap: gapVal,
        severity: gapInfo.severity,
        trainingNeed: gapInfo.trainingNeed,
        recommendation: gapInfo.recommendation
      });
    });

    specifics.forEach(s => {
      const actual = selectedNurse.scores[s.id] || 0;
      const gapVal = actual - expected;
      const gapInfo = generateGapAnalysis(s.code, s.thaiTitle, actual, expected, s.thaiTitle);

      gaps.push({
        competencyId: s.id,
        competencyCode: s.code,
        competencyTitle: s.thaiTitle,
        actualScore: actual,
        expectedScore: expected,
        gap: gapVal,
        severity: gapInfo.severity,
        trainingNeed: gapInfo.trainingNeed,
        recommendation: gapInfo.recommendation
      });
    });

    return gaps;
  }, [selectedNurse, selectedNurseCompetencies]);

  // Compute stats for Chart (Selected Nurse)
  const radarChartData = useMemo(() => {
    if (!selectedNurse) return [];
    const expected = EXPERIENCE_GROUPS[selectedNurse.experienceGroup].expectedEpa;
    const { cores, specifics } = selectedNurseCompetencies;

    return [
      ...cores.map(c => ({
        subject: c.code,
        thaiName: c.thaiTitle,
        'คะแนนที่ได้ (Actual)': selectedNurse.scores[c.id] || 0,
        'คะแนนคาดหวัง (Expected)': expected
      })),
      ...specifics.map(s => ({
        subject: s.code,
        thaiName: s.thaiTitle,
        'คะแนนที่ได้ (Actual)': selectedNurse.scores[s.id] || 0,
        'คะแนนคาดหวัง (Expected)': expected
      }))
    ];
  }, [selectedNurse, selectedNurseCompetencies]);

  // Filtered Nurse list for selection sidebar
  const filteredNursesList = useMemo(() => {
    return nurses.filter(n => {
      const matchSearch = (n.name + ' ' + n.surname + ' ' + n.employeeId).toLowerCase().includes(searchQuery.toLowerCase());
      const matchWard = filterWard === 'all' || n.ward === filterWard;
      const matchGroup = filterGroup === 'all' || n.experienceGroup === filterGroup;
      const matchStatus = filterStatus === 'all' || 
                          (filterStatus === 'passed' && n.isPassed) || 
                          (filterStatus === 'failed' && !n.isPassed);
      return matchSearch && matchWard && matchGroup && matchStatus;
    });
  }, [nurses, searchQuery, filterWard, filterGroup, filterStatus]);

  // --- Organizational Analytics Computations ---
  const orgKPIs = useMemo(() => {
    if (nurses.length === 0) return { passRate: 0, total: 0, hasGapsCount: 0, avgCore: 0, avgSpecific: 0 };
    
    const total = nurses.length;
    const passedCount = nurses.filter(n => n.isPassed).length;
    const passRate = (passedCount / total) * 100;

    // Count how many nurses have at least one gap
    let hasGapsCount = 0;
    nurses.forEach(n => {
      const expected = EXPERIENCE_GROUPS[n.experienceGroup].expectedEpa;
      let hasGap = false;
      
      // check cores
      CORE_COMPETENCIES.forEach(c => {
        if ((n.scores[c.id] || 0) < expected) hasGap = true;
      });
      // check specifics
      const specs = n.wardType === 'adult' ? ADULT_SPECIFIC_COMPETENCIES : PEDIATRIC_SPECIFIC_COMPETENCIES;
      specs.forEach(s => {
        if ((n.scores[s.id] || 0) < expected) hasGap = true;
      });

      if (hasGap) hasGapsCount++;
    });

    // Averages
    let coreSum = 0;
    let coreCount = 0;
    let specSum = 0;
    let specCount = 0;

    nurses.forEach(n => {
      CORE_COMPETENCIES.forEach(c => {
        coreSum += n.scores[c.id] || 0;
        coreCount++;
      });

      const specs = n.wardType === 'adult' ? ADULT_SPECIFIC_COMPETENCIES : PEDIATRIC_SPECIFIC_COMPETENCIES;
      specs.forEach(s => {
        specSum += n.scores[s.id] || 0;
        specCount++;
      });
    });

    return {
      passRate: Math.round(passRate * 10) / 10,
      total,
      hasGapsCount,
      avgCore: Math.round((coreSum / coreCount) * 100) / 100,
      avgSpecific: Math.round((specSum / specCount) * 100) / 100
    };
  }, [nurses]);

  // Group stats for chart (by tenure group)
  const experienceGroupChartData = useMemo(() => {
    return Object.keys(EXPERIENCE_GROUPS).map(key => {
      const groupKey = key as ExperienceGroup;
      const groupNurses = nurses.filter(n => n.experienceGroup === groupKey);
      const groupTotal = groupNurses.length;
      const groupPassed = groupNurses.filter(n => n.isPassed).length;
      const groupPassRate = groupTotal > 0 ? Math.round((groupPassed / groupTotal) * 100) : 0;
      
      // Calculate averages
      let totalScores = 0;
      let count = 0;
      groupNurses.forEach(n => {
        Object.keys(n.scores).forEach(cId => {
          totalScores += n.scores[cId] || 0;
          count++;
        });
      });
      const avgScore = count > 0 ? Math.round((totalScores / count) * 100) / 100 : 0;

      return {
        name: EXPERIENCE_GROUPS[groupKey].title,
        thaiName: EXPERIENCE_GROUPS[groupKey].thaiTitle.split(' ')[0],
        'จำนวนพยาบาล (คน)': groupTotal,
        'อัตราผ่าน (%)': groupPassRate,
        'คะแนนเฉลี่ย': avgScore,
        'ค่ามาตรฐาน': EXPERIENCE_GROUPS[groupKey].expectedEpa
      };
    });
  }, [nurses]);

  // Ward comparison statistics
  const wardComparisonData = useMemo(() => {
    return HOSPITAL_WARDS.map(w => {
      const wardNurses = nurses.filter(n => n.ward === w.name);
      const total = wardNurses.length;
      const passed = wardNurses.filter(n => n.isPassed).length;
      const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

      let scoreSum = 0;
      let count = 0;
      wardNurses.forEach(n => {
        Object.keys(n.scores).forEach(cid => {
          scoreSum += n.scores[cid] || 0;
          count++;
        });
      });
      const avgScore = count > 0 ? Math.round((scoreSum / count) * 100) / 100 : 0;

      return {
        name: w.name.split(' (')[0], // Short name
        fullName: w.name,
        'จำนวนคน': total,
        'ผ่านเกณฑ์ (%)': passRate,
        'คะแนนเฉลี่ยสะสม': avgScore
      };
    });
  }, [nurses]);

  // Overall Common Competency Gaps (Hospital-wide analysis)
  const commonGapsList = useMemo(() => {
    const gapFrequencies: Record<string, { code: string; thaiTitle: string; count: number; totalAssessed: number; severes: number }> = {};
    
    nurses.forEach(n => {
      const expected = EXPERIENCE_GROUPS[n.experienceGroup].expectedEpa;
      const specs = n.wardType === 'adult' ? ADULT_SPECIFIC_COMPETENCIES : PEDIATRIC_SPECIFIC_COMPETENCIES;

      CORE_COMPETENCIES.forEach(c => {
        const actual = n.scores[c.id] || 0;
        if (!gapFrequencies[c.id]) {
          gapFrequencies[c.id] = { code: c.code, thaiTitle: c.thaiTitle, count: 0, totalAssessed: 0, severes: 0 };
        }
        gapFrequencies[c.id].totalAssessed++;
        if (actual < expected) {
          gapFrequencies[c.id].count++;
          if (expected - actual >= 2) {
            gapFrequencies[c.id].severes++;
          }
        }
      });

      specs.forEach(s => {
        const actual = n.scores[s.id] || 0;
        if (!gapFrequencies[s.id]) {
          gapFrequencies[s.id] = { code: s.code, thaiTitle: s.thaiTitle, count: 0, totalAssessed: 0, severes: 0 };
        }
        gapFrequencies[s.id].totalAssessed++;
        if (actual < expected) {
          gapFrequencies[s.id].count++;
          if (expected - actual >= 2) {
            gapFrequencies[s.id].severes++;
          }
        }
      });
    });

    return Object.keys(gapFrequencies)
      .map(key => ({
        id: key,
        ...gapFrequencies[key],
        percentage: gapFrequencies[key].totalAssessed > 0 ? Math.round((gapFrequencies[key].count / gapFrequencies[key].totalAssessed) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count); // Most frequent gaps first
  }, [nurses]);

  // Gap analysis for selected ward and experience group
  const wardGroupGapData = useMemo(() => {
    const wardObj = HOSPITAL_WARDS.find(w => w.name === gapSelectedWard);
    const wardType = (wardObj?.type || 'adult') as 'adult' | 'pediatric_women';
    const activeCompetencies = wardType === 'adult' 
      ? [...CORE_COMPETENCIES, ...ADULT_SPECIFIC_COMPETENCIES] 
      : [...CORE_COMPETENCIES, ...PEDIATRIC_SPECIFIC_COMPETENCIES];

    const targetNurses = nurses.filter(n => n.ward === gapSelectedWard && n.experienceGroup === gapSelectedGroup);
    const expected = EXPERIENCE_GROUPS[gapSelectedGroup].expectedEpa;

    return activeCompetencies.map(c => {
      let sum = 0;
      let count = 0;
      targetNurses.forEach(n => {
        const score = n.scores[c.id];
        if (score !== undefined) {
          sum += score;
          count++;
        }
      });
      const actualAvg = count > 0 ? Math.round((sum / count) * 100) / 100 : 0;
      const gapVal = count > 0 ? Math.round((actualAvg - expected) * 100) / 100 : 0;
      
      // Determine severity
      let severity: 'none' | 'low' | 'high' = 'none';
      if (count > 0 && gapVal < 0) {
        severity = gapVal <= -2 ? 'high' : 'low';
      }

      // Generate training needs and recommendation
      const gapInfo = generateGapAnalysis(c.code, c.thaiTitle, actualAvg, expected, c.thaiTitle);

      return {
        id: c.id,
        code: c.code,
        title: c.thaiTitle,
        actualScore: actualAvg,
        expectedScore: expected,
        gap: gapVal,
        countAssessed: count,
        severity: count > 0 ? severity : 'none' as const,
        trainingNeed: count > 0 ? gapInfo.trainingNeed : 'ไม่มีข้อมูลประเมินในกลุ่มนี้',
        recommendation: count > 0 ? gapInfo.recommendation : 'กรุณาประเมินผลพยาบาลในกลุ่มนี้เพิ่มเติมเพื่อรับคำแนะนำหลักสูตร'
      };
    });
  }, [nurses, gapSelectedWard, gapSelectedGroup]);

  // Formatted data for the Selected Ward & Experience Group Chart
  const gapChartData = useMemo(() => {
    return wardGroupGapData.map(item => ({
      subject: item.code,
      thaiName: item.title,
      'คะแนนที่ได้ (Actual)': item.actualScore,
      'คะแนนคาดหวัง (Expected)': item.expectedScore
    }));
  }, [wardGroupGapData]);

  const countSelectedSubNurses = useMemo(() => {
    return nurses.filter(n => n.ward === gapSelectedWard && n.experienceGroup === gapSelectedGroup).length;
  }, [nurses, gapSelectedWard, gapSelectedGroup]);

  // Trigger print dialog specifically tailored via index.css overrides
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Hospital Brand Header */}
      <header className="no-print bg-sriphat-purple text-white shadow-md border-b-4 border-sriphat-green">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-full shadow-inner border border-sriphat-green flex items-center justify-center">
              <SriphatLogo className="h-10 w-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-sriphat-green text-white text-xs font-bold px-2 py-0.5 rounded">SRIPHAT</span>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">ระบบประเมินสมรรถนะพยาบาลหอผู้ป่วยใน</h1>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5 font-light">
                ตามหลักเกณฑ์มาตรฐานองค์กรพยาบาล ศูนย์ศรีพัฒน์ คณะแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAddNewEvaluation}
              className="bg-sriphat-green hover:bg-sriphat-green-dark text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              <span>ประเมินพยาบาลใหม่</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className="no-print bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-4 py-1.5 scrollbar-thin">
            <button
              onClick={() => setActiveTab('individual')}
              className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'individual'
                  ? 'border-sriphat-purple text-sriphat-purple'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="h-4.5 w-4.5" />
              <span>ผลการประเมินรายบุคคล (IDP)</span>
            </button>
            
            <button
              onClick={() => setActiveTab('evaluate')}
              className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'evaluate'
                  ? 'border-sriphat-purple text-sriphat-purple'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Edit3 className="h-4.5 w-4.5" />
              <span>{isEditing ? 'แก้ไขการประเมิน' : 'แบบบันทึกผลการประเมิน'}</span>
            </button>

            <button
              onClick={() => setActiveTab('organizational')}
              className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'organizational'
                  ? 'border-sriphat-purple text-sriphat-purple'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="h-4.5 w-4.5" />
              <span>แดชบอร์ดภาพรวมหอผู้ป่วย</span>
            </button>

            <button
              onClick={() => setActiveTab('gaps')}
              className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'gaps'
                  ? 'border-sriphat-purple text-sriphat-purple'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="h-4.5 w-4.5" />
              <span>การวิเคราะห์ช่องว่าง Gaps & แผนอบรม</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Toast Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="no-print bg-emerald-500 text-white text-center py-3 px-4 font-medium flex items-center justify-center gap-2 shadow-md relative z-30"
          >
            <CheckCircle className="h-5 w-5" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
        
        {/* ======================================================================= */}
        {/* 1. INDIVIDUAL EVALUATE / IDP TAB */}
        {/* ======================================================================= */}
        {activeTab === 'individual' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Sidebar List of Nurses */}
            <div className="no-print lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Users className="h-5 w-5 text-sriphat-purple" />
                  <span>รายชื่อผู้รับการประเมิน ({filteredNursesList.length})</span>
                </h3>
                
                {/* Search Bar */}
                <div className="mt-3 relative">
                  <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ, สกุล, รหัสพนักงาน..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sriphat-purple"
                  />
                </div>

                {/* Filters Collapse Panel */}
                <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">หอผู้ป่วย</label>
                    <select
                      value={filterWard}
                      onChange={(e) => setFilterWard(e.target.value)}
                      className="w-full bg-white text-xs border border-slate-300 rounded px-2 py-1"
                    >
                      <option value="all">ทั้งหมด</option>
                      {HOSPITAL_WARDS.map(w => (
                        <option key={w.id} value={w.name}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">กลุ่มอายุงาน</label>
                      <select
                        value={filterGroup}
                        onChange={(e) => setFilterGroup(e.target.value)}
                        className="w-full bg-white text-xs border border-slate-300 rounded px-2 py-1"
                      >
                        <option value="all">ทั้งหมด</option>
                        {Object.entries(EXPERIENCE_GROUPS).map(([key, val]) => (
                          <option key={key} value={key}>{val.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">ผลประเมิน</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full bg-white text-xs border border-slate-300 rounded px-2 py-1"
                      >
                        <option value="all">ทั้งหมด</option>
                        <option value="passed">ผ่านตามเกณฑ์</option>
                        <option value="failed">ต้องปรับปรุง (มี Gaps)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nurses list */}
              <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100">
                {filteredNursesList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    ไม่มีข้อมูลพยาบาลที่ค้นหา
                  </div>
                ) : (
                  filteredNursesList.map(n => {
                    const group = EXPERIENCE_GROUPS[n.experienceGroup];
                    return (
                      <button
                        key={n.id}
                        onClick={() => setSelectedNurseId(n.id)}
                        className={`w-full p-4 text-left transition-all flex items-start justify-between gap-2 hover:bg-slate-50 ${
                          selectedNurseId === n.id ? 'bg-sriphat-purple/5 border-l-4 border-sriphat-purple' : 'border-l-4 border-transparent'
                        }`}
                      >
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-900 truncate">
                            {n.name} {n.surname}
                          </h4>
                          <div className="text-xs text-slate-500 mt-1 flex flex-col gap-0.5">
                            <span>รหัส: {n.employeeId}</span>
                            <span className="truncate">{n.ward.split(' (')[0]}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                            <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-bold">
                              {group.title} ({n.experienceYears} ปี)
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1.5">
                          {n.isPassed ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                              <span>ผ่านเกณฑ์</span>
                            </span>
                          ) : (
                            <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                              <span>ต้องพัฒนา</span>
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">{n.evaluationDate}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Individual Detailed Report / IDP Report Sheet */}
            <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative p-6">
              {selectedNurse ? (
                <div>
                  {/* Action Bar (Print / Edit / Delete) */}
                  <div className="no-print flex flex-wrap justify-between items-center pb-4 mb-6 border-b border-slate-100 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase font-mono">IDP REPORT</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500 text-xs">ประเมินโดย: {selectedNurse.evaluatorName || 'ไม่ได้ระบุ'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>พิมพ์รายงาน</span>
                      </button>
                      <button
                        onClick={() => handleEditNurse(selectedNurse)}
                        className="bg-sriphat-purple/10 text-sriphat-purple hover:bg-sriphat-purple/20 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>แก้ไขคะแนน</span>
                      </button>
                      <button
                        onClick={() => handleDeleteNurse(selectedNurse.id)}
                        className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>ลบ</span>
                      </button>
                    </div>
                  </div>

                  {/* HEADER FOR PRINTING - Sriphat Official Report Card */}
                  <div className="hidden print-only flex items-center justify-between pb-6 mb-6 border-b-2 border-slate-800 gap-4 text-center">
                    <SriphatLogo className="h-16 w-16 shrink-0" />
                    <div className="flex-1 text-center">
                      <h2 className="text-xl font-bold text-slate-900">บันทึกรายงานสรุปผลการประเมินสมรรถนะพยาบาลรายบุคคล</h2>
                      <h3 className="text-md font-semibold text-slate-700 mt-1">องค์กรพยาบาล ศูนย์ศรีพัฒน์ คณะแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">เอกสารอย่างเป็นทางการใช้เพื่อการวิเคราะห์ช่องว่างและการพัฒนาทรัพยากรบุคคลพยาบาล (IDP)</p>
                    </div>
                    <NsoLogo className="h-16 w-16 shrink-0" />
                  </div>

                  {/* Individual Profile Section */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 relative overflow-hidden">
                    {/* Floating Watermark */}
                    <div className="absolute right-4 top-4 opacity-[0.06] no-print pointer-events-none">
                      <NsoLogo className="h-32 w-32" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">ชื่อ-นามสกุล</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900 mt-1">{selectedNurse.name} {selectedNurse.surname}</p>
                      
                      <div className="mt-3 flex flex-col gap-1 text-sm text-slate-600">
                        <span><strong className="text-slate-800">รหัสพนักงาน:</strong> {selectedNurse.employeeId}</span>
                        <span><strong className="text-slate-800">หอผู้ป่วย:</strong> {selectedNurse.ward}</span>
                        <span><strong className="text-slate-800">หอผู้ป่วยเฉพาะทาง:</strong> {selectedNurse.wardType === 'adult' ? 'หอผู้ป่วยผู้ใหญ่ (Adult Ward)' : 'หอผู้ป่วยมารดา-ทารก เด็ก และสตรี'}</span>
                      </div>
                    </div>

                    <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">ระดับสมรรถนะอายุงาน</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-md font-bold text-sriphat-purple">
                            {EXPERIENCE_GROUPS[selectedNurse.experienceGroup].title} ({selectedNurse.experienceYears} ปี)
                          </span>
                          <span className="bg-sriphat-purple/10 text-sriphat-purple text-[11px] px-2 py-0.5 rounded font-bold">
                            Expected EPA Level: {EXPERIENCE_GROUPS[selectedNurse.experienceGroup].expectedEpa}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-light italic">
                          "{EXPERIENCE_GROUPS[selectedNurse.experienceGroup].description}"
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">ผลการประเมินภาพรวม:</span>
                        {selectedNurse.isPassed ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>ผ่านตามเกณฑ์มาตรฐาน</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-600 font-bold text-sm bg-rose-50 px-3 py-1 rounded-full">
                            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                            <span>ต้องปรับปรุงพัฒนา (มี Gaps)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* VISUAL COMPETENCY GAP CHART */}
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="text-sriphat-purple h-5 w-5" />
                        <span>แผนภาพการวิเคราะห์ความต่าง (Competency Radar Chart)</span>
                      </h3>
                      
                      {/* Chart Toggle */}
                      <div className="no-print bg-slate-100 p-0.5 rounded-lg flex text-xs">
                        <button
                          onClick={() => setChartType('radar')}
                          className={`px-3 py-1 rounded-md font-bold transition-all ${chartType === 'radar' ? 'bg-white shadow text-sriphat-purple' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          แผนภาพเรดาร์
                        </button>
                        <button
                          onClick={() => setChartType('bar')}
                          className={`px-3 py-1 rounded-md font-bold transition-all ${chartType === 'bar' ? 'bg-white shadow text-sriphat-purple' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          แผนภาพแท่ง
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-center min-h-[350px]">
                      {chartType === 'radar' ? (
                        <div className="w-full h-[350px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                              <PolarGrid stroke="#e2e8f0" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }} />
                              <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94a3b8' }} />
                              <Radar 
                                name="คะแนนที่ได้ (Actual)" 
                                dataKey="คะแนนที่ได้ (Actual)" 
                                stroke="#5d2d91" 
                                fill="#5d2d91" 
                                fillOpacity={0.25} 
                              />
                              <Radar 
                                name="คะแนนคาดหวัง (Expected)" 
                                dataKey="คะแนนคาดหวัง (Expected)" 
                                stroke="#00a07d" 
                                fill="#00a07d" 
                                fillOpacity={0.1} 
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="w-full h-[350px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={radarChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }} />
                              <YAxis domain={[0, 5]} tick={{ fill: '#94a3b8' }} />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                              <Bar dataKey="คะแนนที่ได้ (Actual)" fill="#5d2d91" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="คะแนนคาดหวัง (Expected)" fill="#00a07d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* INDIVIDUAL GAP ANALYSIS TABLE */}
                  <div className="mt-8 page-break">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                      <TrendingDown className="text-amber-600 h-5 w-5" />
                      <span>ผลวิเคราะห์ช่องว่างและการพัฒนา (Gap Analysis & Development Plan)</span>
                    </h3>

                    {selectedNurseGaps.filter(g => g.gap < 0).length === 0 ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                        <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        <p className="font-bold text-emerald-800">ไม่มีประเด็นความแตกต่าง (No Competency Gaps)</p>
                        <p className="text-emerald-600 text-sm mt-1">สมรรถนะพยาบาลของบุคลากรท่านนี้ผ่านเกณฑ์คาดหวังตามระดับอายุงานทั้งหมด</p>
                      </div>
                    ) : (
                      <div className="overflow-hidden border border-slate-200 rounded-xl">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 tracking-wider">รหัส / หัวข้อประเมิน</th>
                              <th className="px-3 py-3 text-center text-xs font-bold text-slate-500 tracking-wider w-16">เป้าหมาย</th>
                              <th className="px-3 py-3 text-center text-xs font-bold text-slate-500 tracking-wider w-16">ที่ได้</th>
                              <th className="px-3 py-3 text-center text-xs font-bold text-slate-500 tracking-wider w-16">Gap</th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 tracking-wider">ความจำเป็นในการฝึกอบรม & แนวทางพัฒนา</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200 text-sm">
                            {selectedNurseGaps.filter(g => g.gap < 0).map(gap => (
                              <tr key={gap.competencyId} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="bg-amber-100 text-amber-900 font-mono text-xs px-2 py-0.5 rounded font-bold">
                                      {gap.competencyCode}
                                    </span>
                                  </div>
                                  <p className="font-medium text-slate-900 mt-1">{gap.competencyTitle}</p>
                                </td>
                                <td className="px-3 py-3 text-center text-slate-600 font-bold">{gap.expectedScore}</td>
                                <td className="px-3 py-3 text-center text-slate-900 font-bold bg-rose-50/40 text-rose-700">{gap.actualScore}</td>
                                <td className="px-3 py-3 text-center text-rose-600 font-mono font-bold">
                                  {gap.gap}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-start gap-1">
                                    {gap.severity === 'high' ? (
                                      <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 mt-0.5">High Gap</span>
                                    ) : (
                                      <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 mt-0.5">Low Gap</span>
                                    )}
                                  </div>
                                  <p className="text-slate-700 text-xs mt-1.5 font-bold">🎯 {gap.trainingNeed}</p>
                                  <p className="text-slate-600 text-xs mt-1">📚 <span className="underline decoration-slate-200">ข้อเสนอแนะ:</span> {gap.recommendation}</p>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* OBSERVATIONAL NOTES & EVALUATOR SUGGESTIONS */}
                  <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                      <FileText className="text-sriphat-purple h-5 w-5" />
                      <span>บันทึกความเห็นและข้อเสนอแนะเพื่อพัฒนาเป็นรายบุคคล (IDP Notes)</span>
                    </h4>
                    
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-white p-4 border border-slate-200 rounded-lg shadow-inner">
                      {selectedNurse.notes || 'ไม่มีบันทึกความคิดเห็นเพิ่มเติมจากผู้ประเมิน'}
                    </p>
                  </div>

                  {/* SIGNATURE SECTION FOR OFFICIAL PRINTING */}
                  <div className="hidden print-only mt-20 grid grid-cols-3 gap-8 text-center text-sm">
                    <div>
                      <p className="mb-12">ลงชื่อ...................................................... ผู้ประเมิน</p>
                      <p className="font-medium">({selectedNurse.evaluatorName})</p>
                      <p className="text-slate-500 text-xs mt-1">วันที่ {selectedNurse.evaluationDate}</p>
                    </div>
                    <div>
                      <p className="mb-12">ลงชื่อ...................................................... หัวหน้าหอผู้ป่วย</p>
                      <p className="font-medium">(............................................................)</p>
                      <p className="text-slate-500 text-xs mt-1">หัวหน้าหอผู้ป่วยใน</p>
                    </div>
                    <div>
                      <p className="mb-12">ลงชื่อ...................................................... ผู้รับการประเมิน</p>
                      <p className="font-medium">({selectedNurse.name} {selectedNurse.surname})</p>
                      <p className="text-slate-500 text-xs mt-1">พยาบาลประจำการ</p>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-20 text-slate-400">
                  <UserCheck className="h-16 w-16 mx-auto opacity-30 mb-4" />
                  <p className="text-lg font-semibold">ไม่พบบันทึกการประเมินพยาบาล</p>
                  <p className="text-sm mt-1">กรุณากดปุ่ม "ประเมินพยาบาลใหม่" เพื่อกรอกสิทธิ์ข้อมูลประเมินพยาบาลรายแรก</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ======================================================================= */}
        {/* 2. ADD / EDIT EVALUATION TAB */}
        {/* ======================================================================= */}
        {activeTab === 'evaluate' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="text-sriphat-purple" />
                  <span>{isEditing ? 'แก้ไขการบันทึกประเมินสมรรถนะ' : 'แบบบันทึกผลการประเมินสมรรถนะพยาบาลใหม่ (EPA Scale)'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  กรุณากรอกข้อมูลพยาบาล อายุงาน และให้ระดับคะแนนตามความสามารถจริง (1-5) ตามเกณฑ์คู่มือศูนย์ศรีพัฒน์
                </p>
              </div>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false) || setActiveTab('individual')}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded"
                >
                  ยกเลิกการแก้ไข
                </button>
              )}
            </div>

            <form onSubmit={handleSaveEvaluation} className="p-6">
              
              {/* SECTION 1: Evaluated Nurse Demographics */}
              <div className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 text-sm mb-4 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                  <Users className="h-4.5 w-4.5 text-sriphat-purple" />
                  <span>1. ข้อมูลทั่วไปของผู้รับการประเมิน</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">ชื่อพยาบาล *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                      placeholder="เช่น กานดา"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sriphat-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">นามสกุล *</label>
                    <input
                      type="text"
                      required
                      value={formData.surname}
                      onChange={(e) => setFormData(p => ({ ...p, surname: e.target.value }))}
                      placeholder="เช่น ใจดี"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sriphat-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">รหัสพนักงาน *</label>
                    <input
                      type="text"
                      required
                      value={formData.employeeId}
                      onChange={(e) => setFormData(p => ({ ...p, employeeId: e.target.value }))}
                      placeholder="เช่น SP-69001"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sriphat-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">อายุงานการพยาบาล (ปี) *</label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      min="0"
                      value={formData.experienceYears}
                      onChange={(e) => handleExperienceYearsChange(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sriphat-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">กลุ่มอายุงานวิชาชีพ (คำนวณอัตโนมัติ)</label>
                    <span className="w-full bg-slate-200 border border-slate-300 rounded-lg px-3 py-2 text-sm block font-bold text-slate-700 h-9.5">
                      {EXPERIENCE_GROUPS[formData.experienceGroup].title} ({EXPERIENCE_GROUPS[formData.experienceGroup].thaiTitle.split(' ')[1]})
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">หอผู้ป่วยประจำการ (Ward)</label>
                    <select
                      value={formData.ward}
                      onChange={(e) => setFormData(p => ({ ...p, ward: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sriphat-purple"
                    >
                      {HOSPITAL_WARDS.map(w => (
                        <option key={w.id} value={w.name}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">วันที่ประเมินผล</label>
                    <input
                      type="date"
                      required
                      value={formData.evaluationDate}
                      onChange={(e) => setFormData(p => ({ ...p, evaluationDate: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sriphat-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">ผู้ทำหน้าที่ประเมิน</label>
                    <input
                      type="text"
                      list="evaluators-list"
                      required
                      value={formData.evaluatorName}
                      onChange={(e) => setFormData(p => ({ ...p, evaluatorName: e.target.value }))}
                      placeholder="ระบุชื่อผู้ประเมิน..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sriphat-purple"
                    />
                    <datalist id="evaluators-list">
                      {EVALUATORS.map(ev => (
                        <option key={ev} value={ev} />
                      ))}
                    </datalist>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-xs text-amber-800 flex items-start gap-1.5">
                    <HelpCircle className="h-4.5 w-4.5 text-amber-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold">ข้อมูลระดับเป้าหมาย:</span>
                      <p className="mt-0.5">อายุงาน {formData.experienceYears} ปี อยู่ในระดับพยาบาล <strong className="underline">{EXPERIENCE_GROUPS[formData.experienceGroup].title}</strong></p>
                      <p className="mt-1">เกณฑ์สมรรถนะเป้าหมายคาดหวังคือคะแนน <strong className="text-base text-sriphat-purple">{EXPERIENCE_GROUPS[formData.experienceGroup].expectedEpa}</strong> ขึ้นไป</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* GUIDE CARD - scoring explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h4 className="font-bold text-blue-900 text-xs mb-2">มาตรฐานเกณฑ์การให้คะแนนความน่าไว้วางใจ EPA Entrustment Scale</h4>
                <div className="grid grid-cols-5 gap-2 text-[11px] text-blue-800">
                  <div className="bg-white/60 p-2 rounded"><strong className="text-blue-950 font-bold block">1 คะแนน</strong> ไม่สามารถปฏิบัติได้</div>
                  <div className="bg-white/60 p-2 rounded"><strong className="text-blue-950 font-bold block">2 คะแนน</strong> ปฏิบัติบางส่วน (กำกับดูแลใกล้ชิด)</div>
                  <div className="bg-white/60 p-2 rounded"><strong className="text-blue-950 font-bold block">3 คะแนน</strong> ปฏิบัติได้ตามมาตรฐานวิชาชีพ</div>
                  <div className="bg-white/60 p-2 rounded"><strong className="text-blue-950 font-bold block">4 คะแนน</strong> ปฏิบัติได้ดี สม่ำเสมอ</div>
                  <div className="bg-white/60 p-2 rounded"><strong className="text-blue-950 font-bold block">5 คะแนน</strong> เป็นต้นแบบ สอนงาน/นิเทศได้</div>
                </div>
              </div>

              {/* SECTION 2: Assessment Areas */}
              <div className="space-y-8">
                
                {/* 2.1 Core Competencies */}
                <div>
                  <button
                    type="button"
                    onClick={() => setCollapsedDomains(p => ({ ...p, core: !p.core }))}
                    className="w-full flex justify-between items-center bg-sriphat-purple text-white px-4 py-3 rounded-t-lg font-bold"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-sriphat-green" />
                      <span>สมรรถนะหลักพยาบาลวิชาชีพทั่วไป 8 ด้าน (Core Competencies)</span>
                    </span>
                    {collapsedDomains.core ? <ChevronDown /> : <ChevronUp />}
                  </button>
                  
                  {!collapsedDomains.core && (
                    <div className="bg-white border-x border-b border-slate-200 rounded-b-lg p-5 space-y-5">
                      {CORE_COMPETENCIES.map((comp) => {
                        const score = formData.scores[comp.id] || EXPERIENCE_GROUPS[formData.experienceGroup].expectedEpa;
                        const expected = EXPERIENCE_GROUPS[formData.experienceGroup].expectedEpa;
                        const isGap = score < expected;

                        return (
                          <div 
                            key={comp.id} 
                            className={`p-4 rounded-xl border transition-all ${isGap ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50/50 border-slate-200'}`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="bg-slate-700 text-white font-mono text-xs font-bold px-2 py-0.5 rounded">
                                    {comp.code}
                                  </span>
                                  <h4 className="font-bold text-slate-900">{comp.thaiTitle}</h4>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 font-light">{comp.description}</p>
                                
                                <div className="mt-2.5">
                                  <span className="text-[11px] font-bold text-slate-400 block mb-1">พฤติกรรมบ่งชี้หลัก:</span>
                                  <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-600 font-light">
                                    {comp.indicators.map((ind, i) => <li key={i}>{ind}</li>)}
                                  </ul>
                                </div>
                              </div>

                              <div className="flex flex-col items-start sm:items-end justify-between self-stretch sm:min-w-48">
                                <div className="flex items-center gap-2 mb-2 text-xs">
                                  <span className="text-slate-500 font-medium">เกณฑ์เป้าหมาย:</span>
                                  <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">Level {expected}</span>
                                  
                                  {isGap && (
                                    <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold flex items-center gap-0.5">
                                      <AlertTriangle className="h-3 w-3" />
                                      <span>ต่ำเกณฑ์</span>
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 bg-white p-1 border border-slate-200 rounded-lg">
                                  {[1, 2, 3, 4, 5].map((val) => (
                                    <button
                                      key={val}
                                      type="button"
                                      onClick={() => handleScoreChange(comp.id, val)}
                                      className={`h-9 w-9 rounded-md font-bold text-sm transition-all ${
                                        score === val
                                          ? isGap 
                                            ? 'bg-rose-600 text-white shadow' 
                                            : 'bg-sriphat-purple text-white shadow'
                                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {val}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2.2 Ward Specific Competencies */}
                <div>
                  <button
                    type="button"
                    onClick={() => setCollapsedDomains(p => ({ ...p, specific: !p.specific }))}
                    className="w-full flex justify-between items-center bg-sriphat-purple text-white px-4 py-3 rounded-t-lg font-bold"
                  >
                    <span className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-sriphat-green" />
                      <span>สมรรถนะทางคลินิกเฉพาะสาขาหอผู้ป่วยใน (Functional Specific - {currentWardType === 'adult' ? 'หอผู้ใหญ่' : 'หอแม่และเด็ก'})</span>
                    </span>
                    {collapsedDomains.specific ? <ChevronDown /> : <ChevronUp />}
                  </button>

                  {!collapsedDomains.specific && (
                    <div className="bg-white border-x border-b border-slate-200 rounded-b-lg p-5 space-y-5">
                      {specificCompetenciesForForm.map((comp) => {
                        const score = formData.scores[comp.id] || EXPERIENCE_GROUPS[formData.experienceGroup].expectedEpa;
                        const expected = EXPERIENCE_GROUPS[formData.experienceGroup].expectedEpa;
                        const isGap = score < expected;

                        return (
                          <div 
                            key={comp.id} 
                            className={`p-4 rounded-xl border transition-all ${isGap ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50/50 border-slate-200'}`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="bg-slate-700 text-white font-mono text-xs font-bold px-2 py-0.5 rounded">
                                    {comp.code}
                                  </span>
                                  <h4 className="font-bold text-slate-900">{comp.thaiTitle}</h4>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 font-light">{comp.description}</p>
                                
                                <div className="mt-2.5">
                                  <span className="text-[11px] font-bold text-slate-400 block mb-1">พฤติกรรมบ่งชี้หลัก:</span>
                                  <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-600 font-light">
                                    {comp.indicators.map((ind, i) => <li key={i}>{ind}</li>)}
                                  </ul>
                                </div>
                              </div>

                              <div className="flex flex-col items-start sm:items-end justify-between self-stretch sm:min-w-48">
                                <div className="flex items-center gap-2 mb-2 text-xs">
                                  <span className="text-slate-500 font-medium">เกณฑ์เป้าหมาย:</span>
                                  <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">Level {expected}</span>
                                  
                                  {isGap && (
                                    <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold flex items-center gap-0.5">
                                      <AlertTriangle className="h-3 w-3" />
                                      <span>ต่ำเกณฑ์</span>
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 bg-white p-1 border border-slate-200 rounded-lg">
                                  {[1, 2, 3, 4, 5].map((val) => (
                                    <button
                                      key={val}
                                      type="button"
                                      onClick={() => handleScoreChange(comp.id, val)}
                                      className={`h-9 w-9 rounded-md font-bold text-sm transition-all ${
                                        score === val
                                          ? isGap 
                                            ? 'bg-rose-600 text-white shadow' 
                                            : 'bg-sriphat-purple text-white shadow'
                                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {val}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* SECTION 3: Observational Notes */}
              <div className="mt-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                  <FileText className="text-sriphat-purple h-5 w-5" />
                  <span>3. ความคิดเห็นเชิงพัฒนารายบุคคลและบันทึกเพิ่มเติม (IDP Guidance Notes)</span>
                </h3>
                
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                  placeholder="กรอกบันทึกการสังเกตการปฏิบัติพยาบาลข้างเตียง จุดแข็ง จุดที่ต้องพัฒนาแผนพัฒนารายบุคคล (IDP) เช่น ควรเข้ารับการอบรมเรื่องใดเป็นพิเศษ มีพี่เลี้ยงคนใดคอยประกบดูแล..."
                  rows={4}
                  className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sriphat-purple"
                />
              </div>

              {/* Submit Buttons */}
              <div className="mt-8 pt-5 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('individual')}
                  className="bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="bg-sriphat-purple hover:bg-sriphat-purple-dark text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95"
                >
                  {isEditing ? 'บันทึกการแก้ไข' : 'บันทึกผลการประเมิน'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ======================================================================= */}
        {/* 3. ORGANIZATIONAL STATS / KPI TAB */}
        {/* ======================================================================= */}
        {activeTab === 'organizational' && (
          <div className="space-y-6">
            
            {/* KPI STATS CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block uppercase">อัตราการผ่านเกณฑ์ภาพรวม</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-2xl font-bold ${orgKPIs.passRate >= 90 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {orgKPIs.passRate}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">เป้าหมาย &ge; 90%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {orgKPIs.passRate >= 90 ? 'ผ่านเป้าหมายประจำปีองค์กรพยาบาล' : 'ต่ำกว่าเป้าหมายเล็กน้อย ต้องการแผนอบรม'}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${orgKPIs.passRate >= 90 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  <Award className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block uppercase">พยาบาลรับการประเมินแล้ว</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-slate-900">{orgKPIs.total}</span>
                    <span className="text-xs text-slate-500">คน</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    ครอบคลุม 5 หอผู้ป่วยใน (IPD) ทั้งหมด
                  </p>
                </div>
                <div className="p-3 bg-slate-50 text-slate-600 rounded-full">
                  <Users className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block uppercase">สัดส่วนผู้ต้องจัดทำ IDP / อบรม</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-amber-600">{orgKPIs.hasGapsCount}</span>
                    <span className="text-xs text-slate-500">คน (คิดเป็น {orgKPIs.total > 0 ? Math.round((orgKPIs.hasGapsCount / orgKPIs.total) * 100) : 0}%)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    มีช่องว่างสมรรถนะอย่างน้อย 1 ข้อ
                  </p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
                  <TrendingDown className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block uppercase">คะแนนเฉลี่ยสะสม (พยาบาล)</span>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 font-medium">สมรรถนะหลัก:</span>
                      <strong className="text-slate-900">{orgKPIs.avgCore}</strong>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 font-medium">เฉพาะทาง IPD:</span>
                      <strong className="text-slate-900">{orgKPIs.avgSpecific}</strong>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-sriphat-purple/5 text-sriphat-purple rounded-full">
                  <Activity className="h-6 w-6" />
                </div>
              </div>

            </div>

            {/* CHARTS CONTAINER GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Pass Rate and count by Tenure Group */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="font-bold text-slate-800 text-sm mb-4">อัตราการผ่านเกณฑ์มาตรฐาน แยกตามกลุ่มอายุงาน (Tenure Groups)</h3>
                
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={experienceGroupChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }} />
                      <YAxis yAxisId="left" domain={[0, 100]} tick={{ fill: '#475569' }} label={{ value: 'อัตราผ่าน (%)', angle: -90, position: 'insideLeft', offset: 10 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: '#475569' }} label={{ value: 'พยาบาล (คน)', angle: 90, position: 'insideRight' }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar yAxisId="left" dataKey="อัตราผ่าน (%)" fill="#5d2d91" radius={[4, 4, 0, 0]} name="อัตราผ่านตามมาตรฐาน (%)" />
                      <Bar yAxisId="right" dataKey="จำนวนพยาบาล (คน)" fill="#00a07d" radius={[4, 4, 0, 0]} name="จำนวนบุคลากร (คน)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Ward Comparisons */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="font-bold text-slate-800 text-sm mb-4">เปรียบเทียบผลการประเมินวิชาชีพ แยกตามหอผู้ป่วยใน (IPD Wards)</h3>

                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={wardComparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }} />
                      <YAxis yAxisId="left" domain={[0, 100]} label={{ value: 'ผ่านเกณฑ์ (%)', angle: -90, position: 'insideLeft', offset: 10 }} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 5]} label={{ value: 'คะแนนเฉลี่ย', angle: 90, position: 'insideRight' }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar yAxisId="left" dataKey="ผ่านเกณฑ์ (%)" fill="#5d2d91" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="คะแนนเฉลี่ยสะสม" fill="#00a07d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* WARD SUMMARY TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="font-bold text-slate-800 text-sm mb-4">ตารางเปรียบเทียบ KPI สมรรถนะพยาบาลของแต่ละหอผู้ป่วย</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
                  <thead className="bg-slate-50 font-bold text-slate-700">
                    <tr>
                      <th className="px-6 py-3">หอผู้ป่วยประจำการ (IPD Wards)</th>
                      <th className="px-4 py-3 text-center">จำนวนบุคลากรทั้งหมด (คน)</th>
                      <th className="px-4 py-3 text-center">จำนวนผู้ผ่านตามเกณฑ์ (คน)</th>
                      <th className="px-4 py-3 text-center">อัตราส่วนผ่านเกณฑ์ (%)</th>
                      <th className="px-4 py-3 text-center">คะแนนสะสมเฉลี่ย (เต็ม 5.0)</th>
                      <th className="px-4 py-3">สถานะ KPI หอผู้ป่วย (เป้าหมาย &ge;90%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-600">
                    {wardComparisonData.map(w => (
                      <tr key={w.fullName} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-bold text-slate-900">{w.fullName}</td>
                        <td className="px-4 py-4 text-center font-mono font-medium">{w['จำนวนคน']}</td>
                        <td className="px-4 py-4 text-center font-mono font-medium">{Math.round(w['จำนวนคน'] * (w['ผ่านเกณฑ์ (%)'] / 100))}</td>
                        <td className="px-4 py-4 text-center font-mono font-bold text-sriphat-purple">
                          {w['ผ่านเกณฑ์ (%)']}%
                        </td>
                        <td className="px-4 py-4 text-center font-mono font-bold text-amber-600">{w['คะแนนเฉลี่ยสะสม']}</td>
                        <td className="px-4 py-4">
                          {w['ผ่านเกณฑ์ (%)'] >= 90 ? (
                            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">
                              Passed (ผ่านเป้าหมาย)
                            </span>
                          ) : (
                            <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-1 rounded-full font-bold">
                              Below target (ต้องเพิ่มแผนพัฒนา)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================================= */}
        {/* 4. GAP ANALYSIS & TRAINING NEEDS TAB */}
        {/* ======================================================================= */}
        {activeTab === 'gaps' && (
          <div className="space-y-6">
            
            {/* Top Analysis Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-center">
              <div className="bg-amber-50 p-4 rounded-full border border-amber-200">
                <GraduationCap className="h-12 w-12 text-amber-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">การวิเคราะห์ความต้องการพัฒนาทักษะ (Training Needs & Gap Analysis)</h2>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  ระบบวิเคราะห์ข้อมูลจะสืบค้นคะแนนผลการประเมินจากบุคลากรพยาบาลทุกคนในระบบเพื่อสืบค้นหา <strong className="text-amber-600">Competency Gaps</strong> ที่พบบ่อยที่สุดในองค์กรพยาบาลศรีพัฒน์ และนำมาจับคู่กับหลักสูตรพัฒนาพยาบาลที่สมควรจัดขึ้นเพื่อเติมเต็มทักษะต่อไปอย่างยั่งยืน
                </p>
              </div>
            </div>

            {/* WARD AND EXPERIENCE GROUP GAP ANALYSIS SECTION */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              
              {/* Filter controls and Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <Activity className="text-sriphat-purple" />
                    <span>วิเคราะห์ช่องว่างผลประเมินรายหอผู้ป่วยและกลุ่มอายุงาน</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    เปรียบเทียบค่าเฉลี่ยคะแนนประเมิน (Actual) กับเกณฑ์เป้าหมายมาตรฐาน (Expected) แยกตามแผนกและประสบการณ์
                  </p>
                </div>
                
                <div className="no-print bg-slate-100 p-0.5 rounded-lg flex text-xs self-start md:self-auto">
                  <button
                    onClick={() => setGapChartType('radar')}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all ${gapChartType === 'radar' ? 'bg-white shadow text-sriphat-purple' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    แผนภาพเรดาร์ (Radar)
                  </button>
                  <button
                    onClick={() => setGapChartType('bar')}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all ${gapChartType === 'bar' ? 'bg-white shadow text-sriphat-purple' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    แผนภาพแท่ง (Bar)
                  </button>
                </div>
              </div>

              {/* Selectors Panel */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Ward Selector */}
                <div className="md:col-span-5 space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">เลือกหอผู้ป่วย (Ward)</label>
                  <select
                    value={gapSelectedWard}
                    onChange={(e) => setGapSelectedWard(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-sriphat-purple focus:ring-1 focus:ring-sriphat-purple"
                  >
                    {HOSPITAL_WARDS.map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experience Group Selector */}
                <div className="md:col-span-7 space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">เลือกกลุ่มอายุงาน (Experience Group)</label>
                  <div className="grid grid-cols-5 gap-1">
                    {(Object.keys(EXPERIENCE_GROUPS) as ExperienceGroup[]).map((gKey) => {
                      const isActive = gapSelectedGroup === gKey;
                      const g = EXPERIENCE_GROUPS[gKey];
                      return (
                        <button
                          key={gKey}
                          type="button"
                          onClick={() => setGapSelectedGroup(gKey)}
                          className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all flex flex-col justify-center items-center gap-0.5 ${
                            isActive
                              ? 'bg-sriphat-purple border-sriphat-purple text-white shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <span className="truncate max-w-full">{g.title}</span>
                          <span className={`text-[9px] ${isActive ? 'text-purple-200' : 'text-slate-400'} font-normal`}>
                            ({g.rangeYears})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Status Indicator / Summary of nurses found */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 border-l-4 border-sriphat-purple p-3 rounded-r-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-sriphat-purple" />
                  <span className="text-slate-700 font-medium">
                    หอผู้ป่วย: <strong className="text-slate-900">{gapSelectedWard}</strong> | 
                    กลุ่มอายุงาน: <strong className="text-slate-900">{EXPERIENCE_GROUPS[gapSelectedGroup].thaiTitle}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500">จำนวนบุคลากรในกลุ่มนี้:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-sm ${
                    countSelectedSubNurses > 0 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {countSelectedSubNurses} คน
                  </span>
                </div>
              </div>

              {/* Grid content containing Chart and Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Chart Box */}
                <div className="lg:col-span-5 bg-slate-50 rounded-xl border border-slate-100 p-4 flex flex-col justify-between min-h-[360px]">
                  <div className="mb-2">
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Award className="text-sriphat-green h-4 w-4" />
                      <span>แผนภาพเปรียบเทียบสมรรถนะ (EPA Level)</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 font-normal">เป้าหมายมาตรฐาน (Expected) = {EXPERIENCE_GROUPS[gapSelectedGroup].expectedEpa} คะแนน</p>
                  </div>

                  {countSelectedSubNurses === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-white border border-dashed border-slate-200 rounded-lg min-h-[280px]">
                      <AlertCircle className="h-10 w-10 text-amber-500 animate-pulse" />
                      <div>
                        <p className="text-sm font-bold text-slate-700">ไม่มีข้อมูลผลประเมินในหอผู้ป่วยและกลุ่มอายุงานที่เลือก</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                          ยังไม่มีการทำบันทึกประเมินพยาบาลที่มีอายุงานกลุ่มนี้ในวอร์ดนี้ กรุณาเพิ่มแบบประเมินพยาบาลรายใหม่ในเมนู "แบบบันทึกผลการประเมิน"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 bg-white border border-slate-100 rounded-lg p-2 h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        {gapChartType === 'radar' ? (
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={gapChartData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                            <Radar
                              name="คะแนนเฉลี่ยจริง (Actual)"
                              dataKey="คะแนนที่ได้ (Actual)"
                              stroke="#5d2d91"
                              fill="#5d2d91"
                              fillOpacity={0.25}
                            />
                            <Radar
                              name="เกณฑ์เป้าหมาย (Expected)"
                              dataKey="คะแนนคาดหวัง (Expected)"
                              stroke="#00a07d"
                              fill="#00a07d"
                              fillOpacity={0.08}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                          </RadarChart>
                        ) : (
                          <BarChart data={gapChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} />
                            <YAxis domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                            <Bar dataKey="คะแนนเฉลี่ยจริง (Actual)" fill="#5d2d91" radius={[3, 3, 0, 0]} />
                            <Bar dataKey="เกณฑ์เป้าหมาย (Expected)" fill="#00a07d" radius={[3, 3, 0, 0]} />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  )}
                  
                  {countSelectedSubNurses > 0 && (
                    <p className="text-[10px] text-slate-400 mt-2 text-center font-normal">
                      * คำนวณจากคะแนนเฉลี่ยสะสมของบุคลากรกลุ่มนี้จำนวน {countSelectedSubNurses} คน
                    </p>
                  )}
                </div>

                {/* Gap Table and Recommendations */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-inner flex-1 flex flex-col">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <TrendingDown className="text-rose-500 h-4 w-4" />
                        <span>รายละเอียด Gap Analysis แยกตามรายข้อประเมิน (Competencies)</span>
                      </h4>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                        {wardGroupGapData.length} หัวข้อ
                      </span>
                    </div>

                    {countSelectedSubNurses === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-center p-8 text-slate-400 text-xs italic font-light">
                        ไม่มีข้อมูลประเมินในกลุ่มนี้เพื่อคำนวณช่องว่างสมรรถนะ
                      </div>
                    ) : (
                      <div className="overflow-y-auto max-h-[360px] divide-y divide-slate-100 flex-1">
                        {wardGroupGapData.map((item) => {
                          const hasGap = item.gap < 0;
                          return (
                            <div key={item.id} className={`p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 transition-colors ${hasGap ? 'bg-rose-50/20 hover:bg-rose-50/40' : 'hover:bg-slate-50'}`}>
                              <div className="space-y-1 max-w-lg">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold font-mono bg-slate-700 text-white px-1.5 py-0.5 rounded">
                                    {item.code}
                                  </span>
                                  <span className="text-sm font-semibold text-slate-800">{item.title}</span>
                                </div>
                                <p className="text-xs text-slate-500 italic leading-relaxed">
                                  {hasGap ? `⚠️ ${item.trainingNeed}` : `✨ ${item.trainingNeed}`}
                                </p>
                                <p className="text-[10px] text-slate-400 font-light leading-relaxed">
                                  <strong className="font-semibold text-slate-500">แผนพัฒนา:</strong> {item.recommendation}
                                </p>
                              </div>

                              <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 shrink-0">
                                <div className="text-right">
                                  <div className="text-slate-400 text-[10px]">Actual vs Expected</div>
                                  <div className="text-sm font-bold font-mono text-slate-700">
                                    {item.actualScore} <span className="text-slate-300 font-normal">/</span> {item.expectedScore}
                                  </div>
                                </div>

                                {item.gap === 0 ? (
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                    เท่าเป้าหมาย (Met)
                                  </span>
                                ) : item.gap > 0 ? (
                                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-0.5">
                                    +{item.gap} เกินเกณฑ์
                                  </span>
                                ) : (
                                  <span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                                    item.severity === 'high' ? 'bg-rose-600 animate-pulse' : 'bg-rose-400'
                                  }`}>
                                    {item.gap} ต่ำกว่าเกณฑ์
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* TOP GAPS HOSPITAL-WIDE LIST */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-2">
                  <TrendingDown className="text-rose-500" />
                  <span>จัดอันดับหัวข้อสมรรถนะที่พบ Gap มากที่สุด (Competency Gaps Ranking)</span>
                </h3>
                <p className="text-xs text-slate-500 mb-4">แสดงสัดส่วนพยาบาลที่ได้คะแนนต่ำกว่าเกณฑ์เป้าหมายในแต่ละหัวข้อประเมิน</p>

                <div className="space-y-4">
                  {commonGapsList.slice(0, 7).map((item, idx) => (
                    <div key={item.id} className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <div className="flex justify-between items-center text-sm font-semibold mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono bg-slate-700 text-white px-2 py-0.5 rounded">
                            {item.code}
                          </span>
                          <span className="text-slate-800 truncate max-w-64 sm:max-w-md">{item.thaiTitle}</span>
                        </div>
                        <span className="text-rose-600 font-bold">{item.percentage}% ({item.count}/{item.totalAssessed} คน)</span>
                      </div>

                      {/* Progress bar representing gap frequency */}
                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.percentage >= 50 ? 'bg-rose-500' : 'bg-amber-500'}`} 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      
                      <div className="mt-2 text-xs flex justify-between text-slate-500 font-light">
                        <span>ประเมินทั้งหมด: {item.totalAssessed} คน</span>
                        <span className="text-rose-600 font-medium">มี Gap ระดับรุนแรง (ต่าง &ge;2 คะแนน): {item.severes} คน</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CURRICULUM BLUEPRINT BASED ON GAP ANALYSIS */}
              <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-2">
                  <GraduationCap className="text-sriphat-purple" />
                  <span>หลักสูตรแนะนำสำหรับพัฒนาสมรรถนะ (Sriphat Training Blueprint)</span>
                </h3>
                <p className="text-xs text-slate-500 mb-4">แผนหลักสูตรที่ควรเปิดสอนด่วนที่สุดอิงตามสถิติความต่างในกลุ่มตัวอย่างพยาบาล</p>

                <div className="space-y-4">
                  
                  {/* Standard High Alert Med Course */}
                  <div className="border border-slate-200 rounded-xl p-4 hover:border-sriphat-green transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-rose-50 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold">เปิดอบรมด่วนที่สุด (Urgent)</span>
                      <span className="text-xs text-slate-400 font-medium">เป้าหมาย: พยาบาลทั่วไป/IPD</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">หลักสูตรการบริหารยาความเสี่ยงสูงอย่างปลอดภัย (High-Alert Medications Safety)</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      มุ่งเน้นการคำนวณอัตราไหล เจือจาง และระบบการตรวจทานความถูกต้อง 7 Rights แบบคู่ขนาน
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-sriphat-purple font-semibold">อิงสมรรถนะ: SPEC-A3, CORE-4</span>
                      <span className="text-slate-400">ระยะเวลา: 4 ชม.</span>
                    </div>
                  </div>

                  {/* Standard PALS/PEWS */}
                  <div className="border border-slate-200 rounded-xl p-4 hover:border-sriphat-green transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-rose-50 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold">เปิดอบรมด่วนที่สุด (Urgent)</span>
                      <span className="text-xs text-slate-400 font-medium">เป้าหมาย: กุมาร/แม่และเด็ก</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">การช่วยชีวิตเด็กขั้นสูงและการเฝ้าระวังวิกฤต (PALS & PEWS Protocol Training)</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      สอนการแปลผลประเมินอาการเด็กทรุดลงเฉียบพลันด้วย PEWS และการช่วยฟื้นคืนชีพตามไกด์ไลน์ล่าสุด
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-sriphat-purple font-semibold">อิงสมรรถนะ: SPEC-P1, SPEC-P2</span>
                      <span className="text-slate-400">ระยะเวลา: 8 ชม.</span>
                    </div>
                  </div>

                  {/* CPG Evidence Based Practice Course */}
                  <div className="border border-slate-200 rounded-xl p-4 hover:border-sriphat-green transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">เปิดประจำไตรมาส (Routine)</span>
                      <span className="text-xs text-slate-400 font-medium">เป้าหมาย: ทุกกลุ่มอายุงาน</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">การเขียนแผนและพัฒนาแนวปฏิบัติพยาบาลเชิงประจักษ์ (Evidence-Based Practice CPG)</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      พัฒนาทักษะการสืบค้นงานพยาบาลชั้นสูงและการนำ CPG มาใช้เขียนแผนการดูแลพยาบาลจริง
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-sriphat-purple font-semibold">อิงสมรรถนะ: CORE-5, SPEC-A4</span>
                      <span className="text-slate-400">ระยะเวลา: 6 ชม.</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Hospital Footer Info */}
      <footer className="no-print bg-sriphat-purple text-white border-t-4 border-sriphat-green mt-12 py-8 text-center text-xs sm:text-sm font-light">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© 2026 ฝ่ายการพยาบาล ศูนย์ศรีพัฒน์ คณะแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่. All Rights Reserved.</p>
          <p className="text-purple-200">ระบบถูกประเมินและจัดเก็บข้อมูลอย่างเป็นความลับตามมาตรฐานความปลอดภัยข้อมูลสุขภาพ PDPA & HIPAA</p>
        </div>
      </footer>
    </div>
  );
}

// --- Custom components ---

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-lg text-xs shadow-md border border-slate-700 font-sans">
        <p className="font-bold mb-1.5">{payload[0].payload.thaiName || payload[0].payload.subject}</p>
        <div className="space-y-1">
          <p className="flex justify-between gap-4">
            <span className="text-slate-300">คะแนนที่ได้ (Actual):</span>
            <strong className="text-amber-400 font-mono text-sm">{payload[0].value}</strong>
          </p>
          <p className="flex justify-between gap-4">
            <span className="text-slate-300">คะแนนเป้าหมาย (Expected):</span>
            <strong className="text-sky-300 font-mono text-sm">{payload[1].value}</strong>
          </p>
        </div>
      </div>
    );
  }
  return null;
}
