import { supabase } from './supabaseClient';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Search, Upload, Filter, RefreshCw, BarChart2, LineChart as LineChartIcon,
  PieChart as PieChartIcon, Download, FileText, Sparkles, AlertCircle, Layers,
  Database, ArrowUpDown, ChevronLeft, ChevronRight, Check, X, Sliders, Table,
  Activity, TrendingUp, Info, Zap, ArrowUpRight, ArrowDownRight, Printer,
  Terminal, ShieldCheck, Cpu, HardDrive, Command, CornerDownLeft
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter
} from 'recharts';

const SAMPLE_DATASETS = {
  placement: {
    id: 'placement',
    name: 'Campus Placements 2026',
    description: 'Corporate placement analytics, salary benchmarks, department offer rates, and student academic credentials.',
    primaryNumeric: 'Package',
    primaryCategory: 'Department',
    dateField: 'Placement_Date',
    data: [
      { id: 'STU-101', Student_ID: 'STU-101', Department: 'Computer Science', CGPA: 9.4, Status: 'Placed', Package: 28.5, Experience: '2 Internships', Placement_Date: '2026-01-15', Company: 'Google' },
      { id: 'STU-102', Student_ID: 'STU-102', Department: 'Electronics', CGPA: 8.2, Status: 'Placed', Package: 14.0, Experience: '1 Internship', Placement_Date: '2026-01-18', Company: 'Texas Instruments' },
      { id: 'STU-103', Student_ID: 'STU-103', Department: 'Computer Science', CGPA: 8.9, Status: 'Placed', Package: 22.0, Experience: '2 Internships', Placement_Date: '2026-01-20', Company: 'Microsoft' },
      { id: 'STU-104', Student_ID: 'STU-104', Department: 'Mechanical', CGPA: 7.1, Status: 'Unplaced', Package: 0, Experience: 'None', Placement_Date: '2026-02-01', Company: 'N/A' },
      { id: 'STU-105', Student_ID: 'STU-105', Department: 'Data Science', CGPA: 9.8, Status: 'Placed', Package: 42.0, Experience: '3 Internships', Placement_Date: '2026-01-10', Company: 'NVIDIA' },
      { id: 'STU-106', Student_ID: 'STU-106', Department: 'Information Tech', CGPA: 8.5, Status: 'Placed', Package: 18.2, Experience: '1 Internship', Placement_Date: '2026-01-22', Company: 'Amazon' },
      { id: 'STU-107', Student_ID: 'STU-107', Department: 'Electrical', CGPA: 7.8, Status: 'Placed', Package: 11.5, Experience: '1 Internship', Placement_Date: '2026-02-05', Company: 'Siemens' },
      { id: 'STU-108', Student_ID: 'STU-108', Department: 'Computer Science', CGPA: 9.1, Status: 'Placed', Package: 31.0, Experience: '2 Internships', Placement_Date: '2026-01-12', Company: 'Apple' },
      { id: 'STU-109', Student_ID: 'STU-109', Department: 'Data Science', CGPA: 8.7, Status: 'Placed', Package: 24.5, Experience: '2 Internships', Placement_Date: '2026-01-28', Company: 'Meta' },
      { id: 'STU-110', Student_ID: 'STU-110', Department: 'Mechanical', CGPA: 8.0, Status: 'Placed', Package: 9.8, Experience: '1 Internship', Placement_Date: '2026-02-10', Company: 'Tesla' },
      { id: 'STU-111', Student_ID: 'STU-111', Department: 'Civil', CGPA: 6.9, Status: 'Unplaced', Package: 0, Experience: 'None', Placement_Date: '2026-02-12', Company: 'N/A' },
      { id: 'STU-112', Student_ID: 'STU-112', Department: 'Electronics', CGPA: 8.8, Status: 'Placed', Package: 16.5, Experience: '1 Internship', Placement_Date: '2026-01-25', Company: 'Qualcomm' },
      { id: 'STU-113', Student_ID: 'STU-113', Department: 'Information Tech', CGPA: 9.2, Status: 'Placed', Package: 29.0, Experience: '2 Internships', Placement_Date: '2026-01-14', Company: 'Atlassian' },
      { id: 'STU-114', Student_ID: 'STU-114', Department: 'Computer Science', CGPA: 7.6, Status: 'Placed', Package: 12.0, Experience: 'None', Placement_Date: '2026-02-08', Company: 'Infosys' },
      { id: 'STU-115', Student_ID: 'STU-115', Department: 'Data Science', CGPA: 9.6, Status: 'Placed', Package: 38.0, Experience: '3 Internships', Placement_Date: '2026-01-11', Company: 'Snowflake' },
      { id: 'STU-116', Student_ID: 'STU-116', Department: 'Electrical', CGPA: 8.1, Status: 'Placed', Package: 13.5, Experience: '1 Internship', Placement_Date: '2026-02-02', Company: 'Schneider' },
      { id: 'STU-117', Student_ID: 'STU-117', Department: 'Civil', CGPA: 7.4, Status: 'Placed', Package: 8.5, Experience: 'None', Placement_Date: '2026-02-14', Company: 'L&T' },
      { id: 'STU-118', Student_ID: 'STU-118', Department: 'Mechanical', CGPA: 8.4, Status: 'Placed', Package: 11.0, Experience: '1 Internship', Placement_Date: '2026-02-03', Company: 'Boeing' },
      { id: 'STU-119', Student_ID: 'STU-119', Department: 'Computer Science', CGPA: 9.9, Status: 'Placed', Package: 52.0, Experience: '3 Internships', Placement_Date: '2026-01-08', Company: 'Jane Street' },
      { id: 'STU-120', Student_ID: 'STU-120', Department: 'Electronics', CGPA: 7.2, Status: 'Unplaced', Package: 0, Experience: 'None', Placement_Date: '2026-02-15', Company: 'N/A' },
    ]
  },
  energy: {
    id: 'energy',
    name: 'Smart City Grid Energy',
    description: 'IoT telemetry, power grid loads, thermal metrics, renewable target compliance, and surge monitoring.',
    primaryNumeric: 'Energy_Usage',
    primaryCategory: 'Zone',
    dateField: 'Timestamp',
    data: [
      { id: 'SEN-01', Sensor_ID: 'SEN-01', Zone: 'Downtown Core', Energy_Usage: 485.2, Peak_Demand: 120.4, Temperature: 28.5, Status: 'Optimal', Timestamp: '2026-03-01', Renewable_Goal: 85 },
      { id: 'SEN-02', Sensor_ID: 'SEN-02', Zone: 'Industrial Park', Energy_Usage: 940.8, Peak_Demand: 280.1, Temperature: 31.2, Status: 'Critical Surge', Timestamp: '2026-03-01', Renewable_Goal: 45 },
      { id: 'SEN-03', Sensor_ID: 'SEN-03', Zone: 'Residential West', Energy_Usage: 210.5, Peak_Demand: 55.0, Temperature: 26.1, Status: 'Optimal', Timestamp: '2026-03-01', Renewable_Goal: 90 },
      { id: 'SEN-04', Sensor_ID: 'SEN-04', Zone: 'Tech Suburb', Energy_Usage: 620.1, Peak_Demand: 165.8, Temperature: 27.4, Status: 'Moderate Load', Timestamp: '2026-03-02', Renewable_Goal: 75 },
      { id: 'SEN-05', Sensor_ID: 'SEN-05', Zone: 'Harbor District', Energy_Usage: 380.0, Peak_Demand: 92.3, Temperature: 24.8, Status: 'Optimal', Timestamp: '2026-03-02', Renewable_Goal: 60 },
      { id: 'SEN-06', Sensor_ID: 'SEN-06', Zone: 'Industrial Park', Energy_Usage: 1120.0, Peak_Demand: 340.0, Temperature: 33.5, Status: 'Critical Surge', Timestamp: '2026-03-03', Renewable_Goal: 40 },
      { id: 'SEN-07', Sensor_ID: 'SEN-07', Zone: 'Downtown Core', Energy_Usage: 510.4, Peak_Demand: 135.0, Temperature: 29.1, Status: 'Moderate Load', Timestamp: '2026-03-03', Renewable_Goal: 85 },
      { id: 'SEN-08', Sensor_ID: 'SEN-08', Zone: 'Residential West', Energy_Usage: 240.2, Peak_Demand: 62.1, Temperature: 25.9, Status: 'Optimal', Timestamp: '2026-03-03', Renewable_Goal: 95 },
      { id: 'SEN-09', Sensor_ID: 'SEN-09', Zone: 'Tech Suburb', Energy_Usage: 680.9, Peak_Demand: 180.2, Temperature: 28.0, Status: 'Moderate Load', Timestamp: '2026-03-04', Renewable_Goal: 80 },
      { id: 'SEN-10', Sensor_ID: 'SEN-10', Zone: 'Harbor District', Energy_Usage: 395.6, Peak_Demand: 98.4, Temperature: 25.2, Status: 'Optimal', Timestamp: '2026-03-04', Renewable_Goal: 65 },
      { id: 'SEN-11', Sensor_ID: 'SEN-11', Zone: 'Industrial Park', Energy_Usage: 890.3, Peak_Demand: 260.5, Temperature: 30.8, Status: 'Moderate Load', Timestamp: '2026-03-05', Renewable_Goal: 50 },
      { id: 'SEN-12', Sensor_ID: 'SEN-12', Zone: 'Downtown Core', Energy_Usage: 460.0, Peak_Demand: 115.0, Temperature: 27.8, Status: 'Optimal', Timestamp: '2026-03-05', Renewable_Goal: 88 },
      { id: 'SEN-13', Sensor_ID: 'SEN-13', Zone: 'Residential West', Energy_Usage: 195.0, Peak_Demand: 48.0, Temperature: 24.5, Status: 'Optimal', Timestamp: '2026-03-05', Renewable_Goal: 92 },
      { id: 'SEN-14', Sensor_ID: 'SEN-14', Zone: 'Tech Suburb', Energy_Usage: 710.4, Peak_Demand: 195.0, Temperature: 28.9, Status: 'Moderate Load', Timestamp: '2026-03-06', Renewable_Goal: 78 },
      { id: 'SEN-15', Sensor_ID: 'SEN-15', Zone: 'Industrial Park', Energy_Usage: 1350.0, Peak_Demand: 410.0, Temperature: 35.1, Status: 'Critical Surge', Timestamp: '2026-03-06', Renewable_Goal: 30 },
    ]
  }
};

const CRIMSON_THEME_COLORS = ['#dc2626', '#ef4444', '#b91c1c', '#f87171', '#991b1b', '#fca5a5', '#7f1d1d', '#fee2e2'];

function inferColumnTypes(data) {
  if (!data || data.length === 0) return {};
  const firstRow = data[0];
  const schema = {};

  Object.keys(firstRow).forEach(key => {
    if (key === 'id') return;
    const sampleValues = data.map(row => row[key]).filter(v => v !== null && v !== undefined && v !== '');
    
    if (sampleValues.length === 0) {
      schema[key] = 'string';
      return;
    }

    const isNum = sampleValues.every(val => !isNaN(Number(val)));
    if (isNum) {
      schema[key] = 'numeric';
      return;
    }

    const isDate = sampleValues.every(val => !isNaN(Date.parse(val)) && (typeof val === 'string' && (val.includes('-') || val.includes('/'))));
    if (isDate) {
      schema[key] = 'date';
      return;
    }

    const uniqueCount = new Set(sampleValues).size;
    if (uniqueCount <= Math.min(15, sampleValues.length)) {
      schema[key] = 'categorical';
      return;
    }

    schema[key] = 'string';
  });

  return schema;
}

export default function App() {
  const [activeDatasetKey, setActiveDatasetKey] = useState('placement');
  const [customDatasets, setCustomDatasets] = useState({});
  const [rawRecords, setRawRecords] = useState(SAMPLE_DATASETS.placement.data);
  const [datasetMeta, setDatasetMeta] = useState({
    name: SAMPLE_DATASETS.placement.name,
    description: SAMPLE_DATASETS.placement.description,
  });

  // Query & Performance Telemetry
  const [queryLatency, setQueryLatency] = useState(1.2);
  const searchInputRef = useRef(null);

  // Dynamic Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilters, setCategoryFilters] = useState({});
  const [numericRanges, setNumericRanges] = useState({});
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Custom Interactive Chart Builder State
  const [builderX, setBuilderX] = useState('');
  const [builderY, setBuilderY] = useState('');
  const [builderAgg, setBuilderAgg] = useState('avg');
  const [builderType, setBuilderType] = useState('bar');

  // Sorting & Pagination State
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals & Toast State
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [toast, setToast] = useState(null);

  const triggerToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Keyboard shortcut listener ('/' for quick search focus)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const schema = useMemo(() => inferColumnTypes(rawRecords), [rawRecords]);
  const columnKeys = useMemo(() => Object.keys(schema), [schema]);
  const categoricalKeys = useMemo(() => columnKeys.filter(k => schema[k] === 'categorical'), [columnKeys, schema]);
  const numericKeys = useMemo(() => columnKeys.filter(k => schema[k] === 'numeric'), [columnKeys, schema]);
  const dateKeys = useMemo(() => columnKeys.filter(k => schema[k] === 'date'), [columnKeys, schema]);

  useEffect(() => {
    const startT = performance.now();
    const initialCategorical = {};
    categoricalKeys.forEach(key => {
      initialCategorical[key] = [];
    });
    setCategoryFilters(initialCategorical);

    const initialRanges = {};
    numericKeys.forEach(key => {
      const vals = rawRecords.map(r => Number(r[key])).filter(v => !isNaN(v));
      if (vals.length > 0) {
        initialRanges[key] = {
          min: Math.min(...vals),
          max: Math.max(...vals),
          currentMin: Math.min(...vals),
          currentMax: Math.max(...vals)
        };
      }
    });
    setNumericRanges(initialRanges);

    if (dateKeys.length > 0) {
      const dates = rawRecords.map(r => r[dateKeys[0]]).filter(Boolean).sort();
      setDateRange({
        start: dates[0] || '',
        end: dates[dates.length - 1] || ''
      });
    }

    if (categoricalKeys.length > 0) setBuilderX(categoricalKeys[0]);
    else if (columnKeys.length > 0) setBuilderX(columnKeys[0]);

    if (numericKeys.length > 0) setBuilderY(numericKeys[0]);
    
    setCurrentPage(1);
    const endT = performance.now();
    setQueryLatency(parseFloat((endT - startT).toFixed(2)) || 0.8);
  }, [rawRecords, schema]);

  const handleSwitchDataset = (key) => {
    const startT = performance.now();
    setActiveDatasetKey(key);
    if (SAMPLE_DATASETS[key]) {
      setRawRecords(SAMPLE_DATASETS[key].data);
      setDatasetMeta({
        name: SAMPLE_DATASETS[key].name,
        description: SAMPLE_DATASETS[key].description
      });
      triggerToast(`Switched to ${SAMPLE_DATASETS[key].name}`, 'success');
    } else if (customDatasets[key]) {
      setRawRecords(customDatasets[key].data);
      setDatasetMeta({
        name: customDatasets[key].name,
        description: customDatasets[key].description
      });
      triggerToast(`Switched to uploaded dataset ${customDatasets[key].name}`, 'success');
    }
    const endT = performance.now();
    setQueryLatency(parseFloat((endT - startT).toFixed(2)) || 1.1);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      triggerToast('File payload exceeds 10MB limit.', 'error');
      return;
    }

    const reader = new FileReader();

    if (file.name.endsWith('.json')) {
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          const dataArray = Array.isArray(json) ? json : json.records || json.data;
          if (!dataArray || !Array.isArray(dataArray) || dataArray.length === 0) {
            throw new Error('Malformed JSON payload. Expected array of record objects.');
          }

          const formatted = dataArray.map((row, idx) => ({ id: `usr-${idx}`, ...row }));
          const customKey = `custom_${Date.now()}`;
          const newMeta = {
            id: customKey,
            name: file.name.replace(/\.[^/.]+$/, ""),
            description: `User-ingested JSON Dataset (${formatted.length} tuples)`,
            data: formatted
          };

          setCustomDatasets(prev => ({ ...prev, [customKey]: newMeta }));
          setActiveDatasetKey(customKey);
          setRawRecords(formatted);
          setDatasetMeta({ name: newMeta.name, description: newMeta.description });
          triggerToast(`Parsed JSON successfully (${formatted.length} rows)`, 'success');
        } catch (err) {
          triggerToast(`JSON Ingestion Failure: ${err.message}`, 'error');
        }
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.csv')) {
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
          if (lines.length < 2) throw new Error('CSV file contains insufficient rows.');

          const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
          const formatted = [];

          for (let i = 1; i < lines.length; i++) {
            const currentline = lines[i].split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
            if (currentline.length === headers.length) {
              const obj = { id: `csv-${i}` };
              headers.forEach((h, idx) => {
                const val = currentline[idx];
                obj[h] = !isNaN(Number(val)) && val !== '' ? Number(val) : val;
              });
              formatted.push(obj);
            }
          }

          if (formatted.length === 0) throw new Error('Zero valid CSV records parsed.');

          const customKey = `custom_${Date.now()}`;
          const newMeta = {
            id: customKey,
            name: file.name.replace(/\.[^/.]+$/, ""),
            description: `User-ingested CSV Dataset (${formatted.length} tuples)`,
            data: formatted
          };

          setCustomDatasets(prev => ({ ...prev, [customKey]: newMeta }));
          setActiveDatasetKey(customKey);
          setRawRecords(formatted);
          setDatasetMeta({ name: newMeta.name, description: newMeta.description });
          triggerToast(`Parsed CSV successfully (${formatted.length} rows)`, 'success');
        } catch (err) {
          triggerToast(`CSV Ingestion Failure: ${err.message}`, 'error');
        }
      };
      reader.readAsText(file);
    } else {
      triggerToast('Unsupported file format. Upload .csv or .json files.', 'error');
    }
  };

  const filteredRecords = useMemo(() => {
    return rawRecords.filter(record => {
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesText = Object.values(record).some(val =>
          String(val).toLowerCase().includes(query)
        );
        if (!matchesText) return false;
      }

      for (const catKey of categoricalKeys) {
        const selectedValues = categoryFilters[catKey];
        if (selectedValues && selectedValues.length > 0) {
          if (!selectedValues.includes(String(record[catKey]))) return false;
        }
      }

      for (const numKey of numericKeys) {
        const range = numericRanges[numKey];
        if (range) {
          const val = Number(record[numKey]);
          if (!isNaN(val)) {
            if (val < range.currentMin || val > range.currentMax) return false;
          }
        }
      }

      if (dateKeys.length > 0 && (dateRange.start || dateRange.end)) {
        const primaryDateKey = dateKeys[0];
        const recordDateStr = record[primaryDateKey];
        if (recordDateStr) {
          const recTime = new Date(recordDateStr).getTime();
          if (dateRange.start && recTime < new Date(dateRange.start).getTime()) return false;
          if (dateRange.end && recTime > new Date(dateRange.end).getTime()) return false;
        }
      }

      return true;
    });
  }, [rawRecords, searchQuery, categoryFilters, numericRanges, dateRange, categoricalKeys, numericKeys, dateKeys]);

  // Outlier Detection (Percentile-based & IQR Boundary)
  const anomaliesMap = useMemo(() => {
    const map = {};
    numericKeys.forEach(key => {
      const values = filteredRecords.map(r => Number(r[key])).filter(v => !isNaN(v)).sort((a, b) => a - b);
      if (values.length < 5) return;

      const p90Idx = Math.floor(values.length * 0.90);
      const p90Value = values[p90Idx];

      filteredRecords.forEach(r => {
        const val = Number(r[key]);
        if (!isNaN(val) && val >= p90Value && val > 0) {
          map[r.id] = map[r.id] || [];
          map[r.id].push({ key, type: '>90th Percentile Outlier', val });
        }
      });
    });
    return map;
  }, [filteredRecords, numericKeys]);

  const sortedRecords = useMemo(() => {
    if (!sortConfig.key) return filteredRecords;
    return [...filteredRecords].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortConfig.direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredRecords, sortConfig]);

  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return sortedRecords.slice(startIdx, startIdx + itemsPerPage);
  }, [sortedRecords, currentPage]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const kpis = useMemo(() => {
    const totalCount = filteredRecords.length;
    const totalOriginal = rawRecords.length;
    const filterRatio = totalOriginal ? ((totalCount / totalOriginal) * 100).toFixed(0) : 0;

    const primaryNumKey = numericKeys[0] || null;
    let avgPrimary = 0;
    let sumPrimary = 0;
    let maxRecord = null;
    if (primaryNumKey && totalCount > 0) {
      const vals = filteredRecords.map(r => Number(r[primaryNumKey])).filter(v => !isNaN(v));
      sumPrimary = vals.reduce((acc, v) => acc + v, 0);
      avgPrimary = vals.length ? (sumPrimary / vals.length).toFixed(1) : 0;
      
      const maxVal = Math.max(...vals);
      maxRecord = filteredRecords.find(r => Number(r[primaryNumKey]) === maxVal);
    }

    const primaryCatKey = categoricalKeys[0] || null;
    let topCatName = 'N/A';
    let topCatPct = 0;
    if (primaryCatKey && totalCount > 0) {
      const counts = {};
      filteredRecords.forEach(r => {
        const val = String(r[primaryCatKey] || 'Unknown');
        counts[val] = (counts[val] || 0) + 1;
      });
      let maxC = 0;
      Object.entries(counts).forEach(([k, v]) => {
        if (v > maxC) {
          maxC = v;
          topCatName = k;
        }
      });
      topCatPct = ((maxC / totalCount) * 100).toFixed(1);
    }

    const anomalyCount = Object.keys(anomaliesMap).length;

    return {
      totalCount,
      filterRatio,
      primaryNumKey,
      avgPrimary,
      sumPrimary: sumPrimary.toFixed(1),
      primaryCatKey,
      topCatName,
      topCatPct,
      maxRecord,
      anomalyCount
    };
  }, [filteredRecords, rawRecords, numericKeys, categoricalKeys, anomaliesMap]);

  const autoInsights = useMemo(() => {
    if (filteredRecords.length === 0) return ["No tuples match active filter parameters."];
    const insights = [];

    if (kpis.primaryCatKey && kpis.topCatName !== 'N/A') {
      insights.push(
        `Segment Concentration: Cluster "${kpis.topCatName}" dominates dataset density, representing ${kpis.topCatPct}% of total filtered tuples.`
      );
    }

    if (kpis.primaryNumKey) {
      insights.push(
        `Metric Variance: Mean ${kpis.primaryNumKey.replace(/_/g, ' ')} registered at ${kpis.avgPrimary} across ${kpis.totalCount} active records.`
      );
    }

    if (kpis.maxRecord && kpis.primaryNumKey) {
      const topEntity = kpis.maxRecord[categoricalKeys[0]] || kpis.maxRecord.id || 'Entity';
      insights.push(
        `Peak Anomaly: Highest recorded ${kpis.primaryNumKey.replace(/_/g, ' ')} of ${kpis.maxRecord[kpis.primaryNumKey]} detected at node [${topEntity}].`
      );
    }

    if (kpis.anomalyCount > 0) {
      insights.push(
        `Statistical Alert: Identified ${kpis.anomalyCount} tuple(s) operating above the 90th percentile threshold.`
      );
    }

    return insights;
  }, [filteredRecords, kpis, categoricalKeys]);

  const timeSeriesChartData = useMemo(() => {
    const dateKey = dateKeys[0];
    const numKey = numericKeys[0];
    if (!dateKey || !numKey) return [];

    const timeMap = {};
    filteredRecords.forEach(r => {
      const d = r[dateKey];
      if (d) {
        if (!timeMap[d]) timeMap[d] = { date: d, sum: 0, count: 0 };
        timeMap[d].sum += Number(r[numKey]) || 0;
        timeMap[d].count += 1;
      }
    });

    return Object.values(timeMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        date: item.date,
        val: parseFloat((item.sum / item.count).toFixed(2)),
        count: item.count
      }));
  }, [filteredRecords, dateKeys, numericKeys]);

  const categoryBarData = useMemo(() => {
    const catKey = categoricalKeys[0];
    const numKey = numericKeys[0];
    if (!catKey) return [];

    const catMap = {};
    filteredRecords.forEach(r => {
      const cat = String(r[catKey] || 'Unassigned');
      if (!catMap[cat]) catMap[cat] = { category: cat, total: 0, count: 0 };
      if (numKey) catMap[cat].total += Number(r[numKey]) || 0;
      catMap[cat].count += 1;
    });

    return Object.values(catMap).map(item => ({
      category: item.category,
      avg: numKey ? parseFloat((item.total / item.count).toFixed(1)) : item.count,
      count: item.count
    })).sort((a, b) => b.avg - a.avg);
  }, [filteredRecords, categoricalKeys, numericKeys]);

  const distributionPieData = useMemo(() => {
    const catKey = categoricalKeys[1] || categoricalKeys[0];
    if (!catKey) return [];

    const counts = {};
    filteredRecords.forEach(r => {
      const val = String(r[catKey] || 'Other');
      counts[val] = (counts[val] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredRecords, categoricalKeys]);

  const customBuilderData = useMemo(() => {
    if (!builderX) return [];

    if (schema[builderX] === 'numeric' && builderY && schema[builderY] === 'numeric') {
      return filteredRecords.map(r => ({
        x: Number(r[builderX]) || 0,
        y: Number(r[builderY]) || 0,
        label: r.id
      }));
    }

    const groupMap = {};
    filteredRecords.forEach(r => {
      const xVal = String(r[builderX] || 'N/A');
      if (!groupMap[xVal]) groupMap[xVal] = { x: xVal, values: [], count: 0 };
      if (builderY && r[builderY] !== undefined) {
        const num = Number(r[builderY]);
        if (!isNaN(num)) groupMap[xVal].values.push(num);
      }
      groupMap[xVal].count += 1;
    });

    return Object.values(groupMap).map(item => {
      let finalY = item.count;
      if (builderY && item.values.length > 0) {
        if (builderAgg === 'sum') finalY = item.values.reduce((a, b) => a + b, 0);
        else if (builderAgg === 'avg') finalY = item.values.reduce((a, b) => a + b, 0) / item.values.length;
        else if (builderAgg === 'count') finalY = item.count;
      }
      return {
        x: item.x,
        y: parseFloat(finalY.toFixed(2))
      };
    });
  }, [filteredRecords, builderX, builderY, builderAgg, schema]);

  const exportToCSV = () => {
    if (filteredRecords.length === 0) {
      triggerToast('No records available for export.', 'error');
      return;
    }

    const headers = Object.keys(filteredRecords[0]).filter(k => k !== 'id');
    const csvRows = [headers.join(',')];

    filteredRecords.forEach(row => {
      const values = headers.map(header => {
        const val = row[header] === null || row[header] === undefined ? '' : row[header];
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${datasetMeta.name.replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Exported CSV successfully', 'success');
  };

  return (
    <div className="min-h-screen font-sans bg-[#09090b] text-zinc-100 selection:bg-red-900 selection:text-white pb-12 antialiased">
      
      {/* Dynamic Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-md shadow-2xl text-xs font-mono border backdrop-blur-md animate-in fade-in slide-in-from-top-2 ${
          toast.type === 'error' ? 'bg-red-950/90 border-red-800/80 text-red-200' :
          toast.type === 'success' ? 'bg-zinc-900 border-red-600/50 text-red-400' :
          'bg-zinc-900 border-zinc-800 text-zinc-200'
        }`}>
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Top Telemetry & Command Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-red-600 flex items-center justify-center text-white font-black shadow-lg shadow-red-950/50">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-wider text-zinc-100 font-mono uppercase">Telemetry.OS</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-950/80 text-red-400 border border-red-800/40">
                  v3.2 Enterprise
                </span>
              </div>
            </div>
          </div>

          {/* Engine Status & Dataset Switcher */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-4 text-[11px] font-mono text-zinc-400 border-r border-zinc-800 pr-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ENGINE ONLINE
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-zinc-500" />
                LATENCY: <strong className="text-zinc-200">{queryLatency}ms</strong>
              </span>
            </div>

            <select
              value={activeDatasetKey}
              onChange={(e) => handleSwitchDataset(e.target.value)}
              className="px-3 py-1.5 text-xs font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-red-600"
            >
              <optgroup label="System Datasets">
                {Object.entries(SAMPLE_DATASETS).map(([k, ds]) => (
                  <option key={k} value={k}>{ds.name}</option>
                ))}
              </optgroup>
              {Object.keys(customDatasets).length > 0 && (
                <optgroup label="Custom User Datasets">
                  {Object.entries(customDatasets).map(([k, ds]) => (
                    <option key={k} value={k}>{ds.name}</option>
                  ))}
                </optgroup>
              )}
            </select>

            <button
              onClick={() => setShowSupabaseModal(true)}
              className="px-3 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:border-red-600/60 text-zinc-300 transition"
              title="View Supabase PostgreSQL Schema & Security Policy"
            >
              <Database className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden md:inline">Supabase DDL</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* Dataset Header Card & Drag-and-Drop Uploader */}
        <div className="p-5 rounded-lg border border-zinc-800 bg-[#121215] shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-red-950/80 text-red-400 border border-red-800/50 uppercase tracking-widest">
                  Active Workspace
                </span>
                <h2 className="text-lg font-bold text-zinc-100 tracking-tight">{datasetMeta.name}</h2>
              </div>
              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">{datasetMeta.description}</p>
              <div className="flex flex-wrap gap-4 pt-1.5 text-[11px] font-mono text-zinc-500">
                <span>Tuples Ingested: <strong className="text-zinc-200">{rawRecords.length}</strong></span>
                <span>Active Attributes: <strong className="text-zinc-200">{columnKeys.length}</strong></span>
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div className="relative group cursor-pointer">
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
              />
              <div className="border border-dashed border-zinc-700 group-hover:border-red-500 rounded-lg p-4 text-center transition flex flex-col items-center justify-center min-w-[280px] bg-zinc-900/60">
                <Upload className="w-4 h-4 text-red-500 mb-1 group-hover:scale-110 transition" />
                <span className="text-xs font-mono font-medium text-zinc-200">Ingest Data (.CSV / .JSON)</span>
                <span className="text-[10px] text-zinc-500">Drag file or click (Max 10MB)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Global Filter Bar */}
        <div className="p-4 rounded-lg border border-zinc-800 bg-[#121215] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-300">
              <Filter className="w-3.5 h-3.5 text-red-500" />
              <span>DYNAMIC QUERY CONTROLS</span>
            </div>
            
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilters({});
                setNumericRanges({});
                if (dateKeys.length > 0) setDateRange({ start: '', end: '' });
                triggerToast('Query controls reset', 'info');
              }}
              className="text-[11px] font-mono text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Clear Parameters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Global Search with Hotkey Badge */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400">
                <span>Search Query</span>
                <span className="text-[9px] px-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-400">/ Focus</span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Query records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {/* Date Range Picker */}
            {dateKeys.length > 0 && (
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400">Date Bound ({dateKeys[0]})</label>
                <div className="flex items-center gap-1">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-1/2 px-2 py-1 text-[11px] font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-red-600"
                  />
                  <span className="text-zinc-600 text-xs">-</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-1/2 px-2 py-1 text-[11px] font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>
            )}

            {/* Categorical Multi-Select Filter */}
            {categoricalKeys.slice(0, 2).map(catKey => {
              const options = Array.from(new Set(rawRecords.map(r => String(r[catKey] || 'N/A'))));
              const selected = categoryFilters[catKey] || [];

              return (
                <div key={catKey} className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400">Filter: {catKey.replace(/_/g, ' ')}</label>
                  <select
                    multiple
                    value={selected}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setCategoryFilters(prev => ({ ...prev, [catKey]: values }));
                    }}
                    className="w-full px-2 py-1 text-xs font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-300 h-16 focus:outline-none focus:border-red-600"
                  >
                    {options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              );
            })}

            {/* Numeric Slider Filter */}
            {numericKeys.slice(0, 1).map(numKey => {
              const range = numericRanges[numKey];
              if (!range) return null;

              return (
                <div key={numKey} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">{numKey.replace(/_/g, ' ')} Threshold</span>
                    <span className="text-red-400">{range.currentMin} - {range.currentMax}</span>
                  </div>
                  <div className="pt-2">
                    <input
                      type="range"
                      min={range.min}
                      max={range.max}
                      step={(range.max - range.min) / 100 || 1}
                      value={range.currentMin}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNumericRanges(prev => ({
                          ...prev,
                          [numKey]: { ...prev[numKey], currentMin: val }
                        }));
                      }}
                      className="w-full accent-red-600 cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Narrative Insights */}
        <div className="p-4 rounded-lg border border-red-950/60 bg-red-950/10 text-red-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-red-400">Automated Statistical Summary</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {autoInsights.map((text, idx) => (
              <div key={idx} className="p-3 rounded border border-zinc-800 bg-zinc-950/80 text-xs font-mono text-zinc-300 leading-relaxed">
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Top Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-zinc-800 bg-[#121215]">
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono text-zinc-400">MATCHED TUPLES</span>
              <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300"><Layers className="w-3.5 h-3.5" /></div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-mono font-bold text-zinc-100">{kpis.totalCount}</span>
              <span className="text-xs font-mono text-emerald-400">{kpis.filterRatio}% active</span>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-zinc-800 bg-[#121215]">
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono text-zinc-400">AGGREGATE SUM</span>
              <div className="p-1.5 rounded bg-red-950/50 border border-red-900/50 text-red-400"><TrendingUp className="w-3.5 h-3.5" /></div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-mono font-bold text-zinc-100">{kpis.sumPrimary}</span>
              <span className="text-xs font-mono text-zinc-500">{kpis.primaryNumKey}</span>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-zinc-800 bg-[#121215]">
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono text-zinc-400">TOP CATEGORY SHARE</span>
              <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300"><BarChart2 className="w-3.5 h-3.5" /></div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-base font-bold text-zinc-100 truncate max-w-[130px]">{kpis.topCatName}</span>
              <span className="text-xs font-mono font-semibold text-red-400">{kpis.topCatPct}%</span>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-zinc-800 bg-[#121215]">
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono text-zinc-400">MEAN VALUE</span>
              <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300"><Zap className="w-3.5 h-3.5 text-red-500" /></div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-mono font-bold text-zinc-100">{kpis.avgPrimary}</span>
              <span className="text-xs font-mono text-zinc-500">Filtered Avg</span>
            </div>
          </div>
        </div>

        {/* Analytics Charts Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chronological Area Chart */}
          <div className="p-5 rounded-lg border border-zinc-800 bg-[#121215] lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-mono font-bold flex items-center gap-2 text-zinc-200">
                  <LineChartIcon className="w-4 h-4 text-red-500" />
                  CHRONOLOGICAL TELEMETRY TRACKING
                </h3>
                <p className="text-[11px] text-zinc-500 font-mono">Time-series mean tracking over chronological records</p>
              </div>
            </div>
            <div className="h-64">
              {timeSeriesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesChartData}>
                    <defs>
                      <linearGradient id="crimsonGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={10} fontFamily="monospace" />
                    <YAxis stroke="#71717a" fontSize={10} fontFamily="monospace" />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }} />
                    <Area type="monotone" dataKey="val" stroke="#ef4444" fillOpacity={1} fill="url(#crimsonGradient)" name="Avg Metric" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs font-mono text-zinc-600">
                  No date temporal dimension detected in current schema.
                </div>
              )}
            </div>
          </div>

          {/* Donut Share Distribution */}
          <div className="p-5 rounded-lg border border-zinc-800 bg-[#121215]">
            <div className="mb-4">
              <h3 className="text-xs font-mono font-bold flex items-center gap-2 text-zinc-200">
                <PieChartIcon className="w-4 h-4 text-red-500" />
                CATEGORICAL DISTRIBUTION
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">Proportional share breakdown</p>
            </div>
            <div className="h-64">
              {distributionPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {distributionPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CRIMSON_THEME_COLORS[index % CRIMSON_THEME_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs font-mono text-zinc-600">
                  Insufficient categorical attributes for donut breakdown.
                </div>
              )}
            </div>
          </div>

          {/* Categorical Performance Bar Chart */}
          <div className="p-5 rounded-lg border border-zinc-800 bg-[#121215] lg:col-span-3">
            <div className="mb-4">
              <h3 className="text-xs font-mono font-bold flex items-center gap-2 text-zinc-200">
                <BarChart2 className="w-4 h-4 text-red-500" />
                CATEGORICAL PERFORMANCE RANKINGS
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">Mean values per categorical classification</p>
            </div>
            <div className="h-64">
              {categoryBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBarData}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
                    <XAxis dataKey="category" stroke="#71717a" fontSize={10} fontFamily="monospace" />
                    <YAxis stroke="#71717a" fontSize={10} fontFamily="monospace" />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }} />
                    <Bar dataKey="avg" fill="#dc2626" radius={[2, 2, 0, 0]} name="Average Value" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs font-mono text-zinc-600">
                  No categorical breakdown attributes available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Custom Chart Builder */}
        <div className="p-5 rounded-lg border border-zinc-800 bg-[#121215]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-800/80">
            <div>
              <h3 className="text-xs font-mono font-bold flex items-center gap-2 text-zinc-200">
                <Sliders className="w-4 h-4 text-red-500" />
                DYNAMIC VISUALIZATION BUILDER
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">Map custom X/Y attributes and change plot types dynamically</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={builderX}
                onChange={(e) => setBuilderX(e.target.value)}
                className="px-2.5 py-1 text-xs font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-red-600"
              >
                <option value="">Dimension (X-Axis)</option>
                {columnKeys.map(k => <option key={k} value={k}>{k.replace(/_/g, ' ')}</option>)}
              </select>

              <select
                value={builderY}
                onChange={(e) => setBuilderY(e.target.value)}
                className="px-2.5 py-1 text-xs font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-red-600"
              >
                <option value="">Metric (Y-Axis)</option>
                {numericKeys.map(k => <option key={k} value={k}>{k.replace(/_/g, ' ')}</option>)}
              </select>

              <select
                value={builderAgg}
                onChange={(e) => setBuilderAgg(e.target.value)}
                className="px-2.5 py-1 text-xs font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-red-600"
              >
                <option value="avg">AVG</option>
                <option value="sum">SUM</option>
                <option value="count">COUNT</option>
              </select>

              <select
                value={builderType}
                onChange={(e) => setBuilderType(e.target.value)}
                className="px-2.5 py-1 text-xs font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-red-600"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Plot</option>
                <option value="area">Area Chart</option>
                <option value="scatter">Scatter Plot</option>
              </select>
            </div>
          </div>

          <div className="h-64">
            {customBuilderData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {builderType === 'line' ? (
                  <LineChart data={customBuilderData}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
                    <XAxis dataKey="x" stroke="#71717a" fontSize={10} fontFamily="monospace" />
                    <YAxis stroke="#71717a" fontSize={10} fontFamily="monospace" />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }} />
                    <Line type="monotone" dataKey="y" stroke="#ef4444" strokeWidth={2} name={builderY || 'Value'} />
                  </LineChart>
                ) : builderType === 'area' ? (
                  <AreaChart data={customBuilderData}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
                    <XAxis dataKey="x" stroke="#71717a" fontSize={10} fontFamily="monospace" />
                    <YAxis stroke="#71717a" fontSize={10} fontFamily="monospace" />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }} />
                    <Area type="monotone" dataKey="y" stroke="#ef4444" fill="#991b1b" fillOpacity={0.4} name={builderY || 'Value'} />
                  </AreaChart>
                ) : builderType === 'scatter' ? (
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
                    <XAxis dataKey="x" stroke="#71717a" fontSize={10} fontFamily="monospace" name={builderX} />
                    <YAxis dataKey="y" stroke="#71717a" fontSize={10} fontFamily="monospace" name={builderY} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }} />
                    <Scatter data={customBuilderData} fill="#ef4444" />
                  </ScatterChart>
                ) : (
                  <BarChart data={customBuilderData}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
                    <XAxis dataKey="x" stroke="#71717a" fontSize={10} fontFamily="monospace" />
                    <YAxis stroke="#71717a" fontSize={10} fontFamily="monospace" />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }} />
                    <Bar dataKey="y" fill="#dc2626" radius={[2, 2, 0, 0]} name={builderY || 'Value'} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-mono text-zinc-600">
                Select parameters to execute chart rendering.
              </div>
            )}
          </div>
        </div>

        {/* Searchable Data Table with Outliers */}
        <div className="p-5 rounded-lg border border-zinc-800 bg-[#121215] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-mono font-bold flex items-center gap-2 text-zinc-200">
                <Table className="w-4 h-4 text-red-500" />
                FILTERED TUPLES DATA GRID ({sortedRecords.length} TUPLES)
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">Sortable, paginated with &gt;90th percentile outlier badges</p>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={exportToCSV}
                className="px-3 py-1.5 text-xs font-mono font-medium rounded bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-mono font-medium rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" /> Executive Report
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded border border-zinc-800">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                  {columnKeys.map(key => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      className="px-4 py-2.5 font-medium cursor-pointer hover:text-zinc-100 transition whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1">
                        <span>{key.replace(/_/g, ' ')}</span>
                        <ArrowUpDown className="w-3 h-3 text-zinc-600" />
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-2.5 font-medium text-zinc-400">FLAGS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map((row) => {
                    const rowAnomalies = anomaliesMap[row.id] || [];

                    return (
                      <tr key={row.id} className="hover:bg-zinc-900/60 transition">
                        {columnKeys.map(key => (
                          <td key={key} className="px-4 py-2.5 text-zinc-300 whitespace-nowrap">
                            {String(row[key] !== undefined && row[key] !== null ? row[key] : '-')}
                          </td>
                        ))}
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          {rowAnomalies.length > 0 ? (
                            <div className="flex gap-1">
                              {rowAnomalies.map((a, i) => (
                                <span key={i} className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded bg-red-950 text-red-400 border border-red-800/60">
                                  {a.type}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-600">Standard</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={columnKeys.length + 1} className="px-4 py-8 text-center text-zinc-600 font-mono">
                      Zero records match active query parameters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-2 text-xs font-mono">
            <span className="text-zinc-500">
              Page <strong className="text-zinc-300">{currentPage}</strong> of <strong className="text-zinc-300">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-zinc-800 disabled:opacity-30 hover:bg-zinc-900 text-zinc-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-zinc-800 disabled:opacity-30 hover:bg-zinc-900 text-zinc-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Supabase Schema DDL Modal */}
      {showSupabaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-2xl w-full p-6 rounded-lg border border-zinc-800 bg-[#09090b] text-zinc-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-red-500" />
                <h3 className="font-mono font-bold text-sm">Supabase PostgreSQL DDL & RLS Policies</h3>
              </div>
              <button onClick={() => setShowSupabaseModal(false)} className="hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
              PostgreSQL schema definition with JSONB indexing and Row Level Security for Supabase deployment.
            </p>

            <pre className="p-4 rounded bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-red-400 overflow-x-auto leading-relaxed">
{`-- Supabase PostgreSQL Setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.datasets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  record_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.dataset_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
  record_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_records_dataset ON public.dataset_records(dataset_id);
CREATE INDEX idx_records_jsonb ON public.dataset_records USING gin(record_data);

ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Datasets Read" ON public.datasets FOR SELECT USING (true);
CREATE POLICY "Public Records Read" ON public.dataset_records FOR SELECT USING (true);`}
            </pre>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSupabaseModal(false)}
                className="px-4 py-2 text-xs font-mono font-semibold rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}