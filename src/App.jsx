import React, { useState, useMemo, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import { supabase } from './supabaseClient';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Upload, Database, Search, ArrowUpDown, Download, Printer,
  Sparkles, Filter, AlertTriangle, ShieldCheck, Cpu,
  TrendingUp, Activity, PieChart as PieIcon, RefreshCw, X, ChevronRight, Layers
} from 'lucide-react';

const PRELOADED_DATASETS = {
  placements: {
    name: 'Campus Placements 2026',
    category: 'Higher Ed & Recruitment',
    data: [
      { id: 1, student_id: 'CS-101', dept: 'CSE', gpa: 9.2, salary_lpa: 24.5, company: 'Google', offers: 2, status: 'Placed', date: '2026-01-15' },
      { id: 2, student_id: 'ECE-204', dept: 'ECE', gpa: 8.7, salary_lpa: 14.0, company: 'Intel', offers: 1, status: 'Placed', date: '2026-01-18' },
      { id: 3, student_id: 'CS-108', dept: 'CSE', gpa: 9.6, salary_lpa: 42.0, company: 'Atlassian', offers: 3, status: 'Placed', date: '2026-02-01' },
      { id: 4, student_id: 'ME-302', dept: 'MECH', gpa: 7.8, salary_lpa: 8.5, company: 'Tata Motors', offers: 1, status: 'Placed', date: '2026-02-10' },
      { id: 5, student_id: 'CS-142', dept: 'CSE', gpa: 8.1, salary_lpa: 12.0, company: 'TCS', offers: 1, status: 'Placed', date: '2026-02-12' },
      { id: 6, student_id: 'ECE-211', dept: 'ECE', gpa: 9.0, salary_lpa: 18.5, company: 'Qualcomm', offers: 2, status: 'Placed', date: '2026-02-20' },
      { id: 7, student_id: 'CS-199', dept: 'CSE', gpa: 7.2, salary_lpa: 0.0, company: 'N/A', offers: 0, status: 'Unplaced', date: '2026-03-01' },
      { id: 8, student_id: 'EE-401', dept: 'EEE', gpa: 8.9, salary_lpa: 16.0, company: 'Schneider', offers: 1, status: 'Placed', date: '2026-03-05' },
      { id: 9, student_id: 'CS-205', dept: 'CSE', gpa: 9.4, salary_lpa: 38.0, company: 'Microsoft', offers: 2, status: 'Placed', date: '2026-03-12' },
      { id: 10, student_id: 'ME-315', dept: 'MECH', gpa: 8.4, salary_lpa: 10.2, company: 'Mahindra', offers: 1, status: 'Placed', date: '2026-03-15' }
    ]
  },
  energy: {
    name: 'Smart Grid Power Metrics',
    category: 'IoT Infrastructure',
    data: [
      { id: 101, zone: 'Zone-A (North)', node: 'Node-11', load_kw: 450, peak_temp_c: 38.2, status: 'Optimal', carbon_index: 120, date: '2026-03-01' },
      { id: 102, zone: 'Zone-B (South)', node: 'Node-04', load_kw: 890, peak_temp_c: 44.1, status: 'Overload', carbon_index: 240, date: '2026-03-02' },
      { id: 103, zone: 'Zone-C (East)', node: 'Node-19', load_kw: 310, peak_temp_c: 32.0, status: 'Optimal', carbon_index: 95, date: '2026-03-03' },
      { id: 104, zone: 'Zone-A (North)', node: 'Node-12', load_kw: 520, peak_temp_c: 39.5, status: 'Warning', carbon_index: 145, date: '2026-03-04' },
      { id: 105, zone: 'Zone-D (West)', node: 'Node-22', load_kw: 980, peak_temp_c: 47.8, status: 'Critical', carbon_index: 310, date: '2026-03-05' },
      { id: 106, zone: 'Zone-B (South)', node: 'Node-08', load_kw: 400, peak_temp_c: 35.1, status: 'Optimal', carbon_index: 110, date: '2026-03-06' },
      { id: 107, zone: 'Zone-C (East)', node: 'Node-21', load_kw: 630, peak_temp_c: 41.2, status: 'Warning', carbon_index: 180, date: '2026-03-07' }
    ]
  }
};

const CRIMSON_PALETTE = ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#f87171', '#fca5a5'];

// Safe label formatter preventing str.replace errors
const formatLabel = (str) => {
  if (str === null || str === undefined) return '';
  const valStr = String(str);
  return valStr
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
};

export default function App() {
  const [selectedKey, setSelectedKey] = useState('placements');
  const [rawData, setRawData] = useState(PRELOADED_DATASETS.placements.data);
  const [datasetTitle, setDatasetTitle] = useState(PRELOADED_DATASETS.placements.name);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [minNumericFilter, setMinNumericFilter] = useState(0);

  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [chartXKey, setChartXKey] = useState('');
  const [chartYKey, setChartYKey] = useState('');
  const [chartType, setChartType] = useState('bar');

  const [statusMessage, setStatusMessage] = useState({ type: 'info', text: 'System ready. Dataset operational.' });
  const searchInputRef = useRef(null);

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

  const saveDatasetToSupabase = async (datasetName, records) => {
    try {
      setStatusMessage({ type: 'info', text: `Saving ${records.length} items to database...` });
      
      const { data: dataset, error: dsError } = await supabase
        .from('datasets')
        .insert([{ name: datasetName, record_count: records.length, category: 'User Upload' }])
        .select()
        .single();

      if (dsError) throw dsError;

      const recordRows = records.map(row => ({
        dataset_id: dataset.id,
        record_data: row
      }));

      const { error: recError } = await supabase
        .from('dataset_records')
        .insert(recordRows);

      if (recError) throw recError;

      setStatusMessage({ type: 'success', text: `Saved to database: ${datasetName}` });
    } catch (err) {
      console.error('Supabase Sync Error:', err);
      setStatusMessage({ type: 'error', text: `Database Notice: ${err.message || 'Data shown locally'}` });
    }
  };

  const handleDatasetSwitch = (key) => {
    setSelectedKey(key);
    setRawData(PRELOADED_DATASETS[key].data);
    setDatasetTitle(PRELOADED_DATASETS[key].name);
    resetFilters();
  };

  const processFile = (file) => {
    if (!file) return;
    const fileName = file.name;

    if (file.type === 'application/json' || fileName.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          const dataArray = Array.isArray(parsed) ? parsed : [parsed];
          setRawData(dataArray);
          setDatasetTitle(fileName);
          setSelectedKey('custom');
          resetFilters();
          saveDatasetToSupabase(fileName, dataArray);
        } catch (err) {
          setStatusMessage({ type: 'error', text: 'Could not read JSON file.' });
        }
      };
      reader.readAsText(file);
    } else {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setRawData(results.data);
            setDatasetTitle(fileName);
            setSelectedKey('custom');
            resetFilters();
            saveDatasetToSupabase(fileName, results.data);
          } else {
            setStatusMessage({ type: 'error', text: 'CSV File appears to be empty.' });
          }
        },
        error: (err) => {
          setStatusMessage({ type: 'error', text: `CSV Error: ${err.message}` });
        }
      });
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategoryFilter('ALL');
    setSelectedStatusFilter('ALL');
    setMinNumericFilter(0);
    setCurrentPage(1);
  };

  const schemaKeys = useMemo(() => {
    if (!rawData || rawData.length === 0) return { numeric: [], categorical: [], all: [] };
    const sample = rawData[0];
    const all = Object.keys(sample);
    const numeric = all.filter(k => typeof sample[k] === 'number');
    const categorical = all.filter(k => typeof sample[k] === 'string');
    return { numeric, categorical, all };
  }, [rawData]);

  useEffect(() => {
    if (schemaKeys.all.length > 0) {
      setChartXKey(schemaKeys.categorical[0] || schemaKeys.all[0] || '');
      setChartYKey(schemaKeys.numeric[0] || schemaKeys.all[1] || schemaKeys.all[0] || '');
    }
  }, [schemaKeys]);

  const categoricalValues = useMemo(() => {
    if (!rawData.length || !schemaKeys.categorical.length) return [];
    const key = schemaKeys.categorical[0];
    return Array.from(new Set(rawData.map(r => r[key]))).filter(Boolean);
  }, [rawData, schemaKeys]);

  const statusValues = useMemo(() => {
    const key = schemaKeys.categorical.find(k => k.includes('status')) || schemaKeys.categorical[1];
    if (!key || !rawData.length) return [];
    return Array.from(new Set(rawData.map(r => r[key]))).filter(Boolean);
  }, [rawData, schemaKeys]);

  const filteredData = useMemo(() => {
    let data = [...rawData];

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      data = data.filter(row =>
        Object.values(row).some(val => String(val).toLowerCase().includes(term))
      );
    }

    if (selectedCategoryFilter !== 'ALL' && schemaKeys.categorical[0]) {
      const catKey = schemaKeys.categorical[0];
      data = data.filter(row => String(row[catKey]) === selectedCategoryFilter);
    }

    const statusKey = schemaKeys.categorical.find(k => k.includes('status')) || schemaKeys.categorical[1];
    if (selectedStatusFilter !== 'ALL' && statusKey) {
      data = data.filter(row => String(row[statusKey]) === selectedStatusFilter);
    }

    if (minNumericFilter > 0 && schemaKeys.numeric[0]) {
      const numKey = schemaKeys.numeric[0];
      data = data.filter(row => Number(row[numKey] || 0) >= minNumericFilter);
    }

    if (sortColumn) {
      data.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return data;
  }, [rawData, searchTerm, selectedCategoryFilter, selectedStatusFilter, minNumericFilter, sortColumn, sortDirection, schemaKeys]);

  const anomalyThreshold = useMemo(() => {
    if (!schemaKeys.numeric[0] || !filteredData.length) return Infinity;
    const key = schemaKeys.numeric[0];
    const vals = filteredData.map(d => Number(d[key]) || 0).sort((a, b) => a - b);
    const p90Index = Math.floor(vals.length * 0.9);
    return vals[p90Index] || Infinity;
  }, [filteredData, schemaKeys]);

  const kpiMetrics = useMemo(() => {
    const totalRecords = filteredData.length;
    if (totalRecords === 0) return { total: 0, primaryAvg: 0, secondaryMax: 0, ratio: '0%' };

    const primaryNumKey = schemaKeys.numeric[0] || null;
    const secondaryNumKey = schemaKeys.numeric[1] || primaryNumKey;

    const primaryAvg = primaryNumKey
      ? (filteredData.reduce((acc, curr) => acc + Number(curr[primaryNumKey] || 0), 0) / totalRecords).toFixed(1)
      : 0;

    const secondaryMax = secondaryNumKey
      ? Math.max(...filteredData.map(curr => Number(curr[secondaryNumKey] || 0)))
      : 0;

    const ratio = Math.round((totalRecords / (rawData.length || 1)) * 100);

    return { total: totalRecords, primaryAvg, secondaryMax, ratio: `${ratio}%` };
  }, [filteredData, rawData, schemaKeys]);

  const autoInsights = useMemo(() => {
    if (!filteredData.length) {
      return ['No items match your current search or filter selection. Try adjusting or resetting your filters.'];
    }

    const insights = [];
    const total = filteredData.length;
    const totalRaw = rawData.length;
    const numKey = schemaKeys.numeric[0];
    const catKey = schemaKeys.categorical[0];

    if (total === totalRaw) {
      insights.push(`Showing all ${total} total records in this view.`);
    } else {
      const pct = Math.round((total / totalRaw) * 100);
      insights.push(`Currently displaying ${total} out of ${totalRaw} total items (${pct}% of the dataset).`);
    }

    if (catKey) {
      const counts = {};
      filteredData.forEach(d => {
        const val = d[catKey] || 'Unspecified';
        counts[val] = (counts[val] || 0) + 1;
      });
      const topCat = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (topCat) {
        const pct = Math.round((topCat[1] / total) * 100);
        insights.push(`The largest group is "${topCat[0]}", making up ${pct}% of the items shown.`);
      }
    }

    if (numKey) {
      const values = filteredData.map(d => Number(d[numKey]) || 0);
      const maxVal = Math.max(...values);
      insights.push(`The highest recorded value for ${formatLabel(numKey)} is ${maxVal.toLocaleString()}.`);
    }

    return insights;
  }, [filteredData, rawData, schemaKeys]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;

  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    if (!filteredData.length) return;
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `data_summary_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMessage({ type: 'success', text: 'Downloaded CSV report.' });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-red-900 selection:text-red-100">
      <header className="border-b border-zinc-800 bg-[#121215]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-950/60 border border-red-800/80 rounded-md text-red-500">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-wide text-zinc-100 uppercase">
                Data Analytics Studio
              </h1>
              <p className="text-xs text-zinc-400">Interactive Data & Insights Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 rounded transition"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-400" />
              <span>Print PDF</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
      </header>

      {statusMessage && (
        <div className={`text-xs px-4 py-2 flex items-center justify-between border-b ${
          statusMessage.type === 'error' ? 'bg-red-950/90 text-red-200 border-red-800' :
          statusMessage.type === 'success' ? 'bg-emerald-950/80 text-emerald-200 border-emerald-800' :
          'bg-zinc-900/90 text-zinc-300 border-zinc-800'
        }`}>
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-[#121215] border border-zinc-800 p-4 rounded-lg flex flex-col justify-between space-y-3">
            <div>
              <label className="text-xs uppercase text-zinc-400 flex items-center space-x-1 font-semibold">
                <Database className="w-3.5 h-3.5 text-red-500" />
                <span>Sample Datasets</span>
              </label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.keys(PRELOADED_DATASETS).map(key => (
                  <button
                    key={key}
                    onClick={() => handleDatasetSwitch(key)}
                    className={`px-3 py-2 text-xs font-medium rounded border text-left transition ${
                      selectedKey === key
                        ? 'bg-red-950/60 border-red-600 text-red-200'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-semibold text-zinc-200 truncate">{PRELOADED_DATASETS[key].name}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{PRELOADED_DATASETS[key].category}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="text-xs text-zinc-400">
              Active Dataset: <span className="text-zinc-100 font-medium">{datasetTitle}</span>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#121215] border border-dashed border-zinc-800 hover:border-red-600/80 p-4 rounded-lg transition group relative flex flex-col items-center justify-center text-center">
            <input
              type="file"
              accept=".csv, .json"
              onChange={(e) => processFile(e.target.files[0])}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <div className="p-2 bg-zinc-900 group-hover:bg-red-950/40 rounded-full text-red-500 border border-zinc-800 group-hover:border-red-800/80 transition mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-zinc-200">
              Drag & Drop your <span className="text-red-400">CSV</span> or <span className="text-red-400">JSON</span> file here
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Upload any spreadsheet up to 10MB to analyze it instantly.
            </p>
          </div>
        </div>

        <div className="bg-[#121215] border border-zinc-800 p-4 rounded-lg space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-red-500" />
              <h2 className="text-xs font-semibold uppercase text-zinc-200 tracking-wider">Filter Data</h2>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search anything... (Press '/' to focus)"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-600 rounded pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none transition"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-zinc-400 uppercase">
                {formatLabel(schemaKeys.categorical[0]) || 'Filter Category'}
              </label>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full mt-1 bg-zinc-900 border border-zinc-800 focus:border-red-600 rounded px-2.5 py-1.5 text-xs text-zinc-200 outline-none"
              >
                <option value="ALL">Show All Categories</option>
                {categoricalValues.map((val, idx) => (
                  <option key={idx} value={val}>{String(val)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-400 uppercase">
                {formatLabel(schemaKeys.categorical.find(k => k.includes('status')) || schemaKeys.categorical[1]) || 'Filter Status'}
              </label>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full mt-1 bg-zinc-900 border border-zinc-800 focus:border-red-600 rounded px-2.5 py-1.5 text-xs text-zinc-200 outline-none"
              >
                <option value="ALL">Show All Statuses</option>
                {statusValues.map((val, idx) => (
                  <option key={idx} value={val}>{String(val)}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs text-zinc-400 uppercase">
                <span>Minimum {formatLabel(schemaKeys.numeric[0]) || 'Value'}</span>
                <span className="text-red-400 font-semibold">{minNumericFilter}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={minNumericFilter}
                onChange={(e) => setMinNumericFilter(Number(e.target.value))}
                className="w-full mt-2 accent-red-600 bg-zinc-900 cursor-pointer h-1.5 rounded-lg"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#121215] border border-zinc-800 p-4 rounded-lg relative overflow-hidden">
            <div className="text-xs text-zinc-400 uppercase font-medium">Total Items</div>
            <div className="text-2xl font-bold text-zinc-100 mt-1">{kpiMetrics.total}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Items matching current filter</div>
            <div className="absolute top-3 right-3 text-red-500/20">
              <Database className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-[#121215] border border-zinc-800 p-4 rounded-lg relative overflow-hidden">
            <div className="text-xs text-zinc-400 uppercase font-medium">
              Average {formatLabel(schemaKeys.numeric[0]) || 'Value'}
            </div>
            <div className="text-2xl font-bold text-red-400 mt-1">{kpiMetrics.primaryAvg}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Average across items</div>
            <div className="absolute top-3 right-3 text-red-500/20">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-[#121215] border border-zinc-800 p-4 rounded-lg relative overflow-hidden">
            <div className="text-xs text-zinc-400 uppercase font-medium">
              Highest {formatLabel(schemaKeys.numeric[1] || schemaKeys.numeric[0]) || 'Value'}
            </div>
            <div className="text-2xl font-bold text-zinc-100 mt-1">{kpiMetrics.secondaryMax}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Highest value recorded</div>
            <div className="absolute top-3 right-3 text-red-500/20">
              <Activity className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-[#121215] border border-zinc-800 p-4 rounded-lg relative overflow-hidden">
            <div className="text-xs text-zinc-400 uppercase font-medium">Percentage Shown</div>
            <div className="text-2xl font-bold text-red-500 mt-1">{kpiMetrics.ratio}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Of full dataset selected</div>
            <div className="absolute top-3 right-3 text-red-500/20">
              <PieIcon className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-[#121215] border border-zinc-800 p-4 rounded-lg">
          <div className="flex items-center space-x-2 border-b border-zinc-800/80 pb-2 mb-3">
            <Sparkles className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Key Findings & Summary Insights
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {autoInsights.map((text, idx) => (
              <div key={idx} className="bg-zinc-900/80 border border-zinc-800/80 p-3 rounded text-xs text-zinc-300 leading-relaxed flex items-start space-x-2">
                <ChevronRight className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#121215] border border-zinc-800 p-4 rounded-lg">
            <h3 className="text-xs font-medium text-zinc-300 uppercase mb-4 flex items-center justify-between">
              <span>Category Comparison</span>
              <span className="text-zinc-500 text-[10px]">BAR CHART</span>
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey={schemaKeys.categorical[0] || schemaKeys.all[0]} stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '11px', color: '#f4f4f5' }} />
                  <Bar dataKey={schemaKeys.numeric[0] || schemaKeys.all[1]} name={formatLabel(schemaKeys.numeric[0] || schemaKeys.all[1])} fill="#dc2626" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#121215] border border-zinc-800 p-4 rounded-lg">
            <h3 className="text-xs font-medium text-zinc-300 uppercase mb-4 flex items-center justify-between">
              <span>Trend Over Time</span>
              <span className="text-zinc-500 text-[10px]">LINE CHART</span>
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey={schemaKeys.all.find(k => k.includes('date') || k.includes('id')) || schemaKeys.all[0]} stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '11px', color: '#f4f4f5' }} />
                  <Line type="monotone" dataKey={schemaKeys.numeric[0] || schemaKeys.all[1]} name={formatLabel(schemaKeys.numeric[0] || schemaKeys.all[1])} stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-[#121215] border border-zinc-800 p-4 rounded-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                Custom Chart Explorer
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 mr-2">X-Axis Group:</label>
                <select
                  value={chartXKey}
                  onChange={(e) => setChartXKey(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 outline-none"
                >
                  {schemaKeys.all.map((key, i) => (
                    <option key={i} value={key}>{formatLabel(key)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 mr-2">Y-Axis Metric:</label>
                <select
                  value={chartYKey}
                  onChange={(e) => setChartYKey(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 outline-none"
                >
                  {schemaKeys.numeric.map((key, i) => (
                    <option key={i} value={key}>{formatLabel(key)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 mr-2">Chart Style:</label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 outline-none"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Donut Chart</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey={chartXKey} stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '11px', color: '#f4f4f5' }} />
                  <Line type="monotone" dataKey={chartYKey} name={formatLabel(chartYKey)} stroke="#dc2626" strokeWidth={2} />
                </LineChart>
              ) : chartType === 'pie' ? (
                <PieChart>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '11px', color: '#f4f4f5' }} />
                  <Pie data={filteredData} dataKey={chartYKey} nameKey={chartXKey} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {filteredData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CRIMSON_PALETTE[index % CRIMSON_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
                </PieChart>
              ) : (
                <BarChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey={chartXKey} stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '11px', color: '#f4f4f5' }} />
                  <Bar dataKey={chartYKey} name={formatLabel(chartYKey)} fill="#b91c1c" radius={[2, 2, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#121215] border border-zinc-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center space-x-2">
              <Database className="w-4 h-4 text-red-500" />
              <span>Data Records Table</span>
            </h3>
            <span className="text-xs text-zinc-400">
              Displaying {paginatedData.length} of {filteredData.length} entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/90 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
                <tr>
                  {schemaKeys.all.map((col, idx) => (
                    <th
                      key={idx}
                      onClick={() => handleSort(col)}
                      className="px-4 py-3 cursor-pointer hover:text-red-400 transition"
                    >
                      <div className="flex items-center space-x-1">
                        <span>{formatLabel(col)}</span>
                        <ArrowUpDown className="w-3 h-3 text-zinc-600" />
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">Highlights</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, rIdx) => {
                    const primaryNumVal = Number(row[schemaKeys.numeric[0]]) || 0;
                    const isOutlier = primaryNumVal >= anomalyThreshold;

                    return (
                      <tr key={rIdx} className="hover:bg-zinc-900/60 transition">
                        {schemaKeys.all.map((col, cIdx) => (
                          <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap">
                            {String(row[col] ?? 'N/A')}
                          </td>
                        ))}
                        <td className="px-4 py-2.5 text-right whitespace-nowrap">
                          {isOutlier && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-red-950/80 text-red-400 border border-red-800/80">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Top 10% High Value</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={schemaKeys.all.length + 1} className="px-4 py-8 text-center text-zinc-400">
                      No matching records found for active search filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between text-xs">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 rounded transition"
            >
              Previous
            </button>
            <span className="text-zinc-400">
              Page <span className="text-zinc-100 font-semibold">{currentPage}</span> of <span className="text-zinc-100 font-semibold">{totalPages}</span>
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 rounded transition"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}