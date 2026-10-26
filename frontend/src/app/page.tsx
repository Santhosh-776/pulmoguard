"use client";

import { useState } from 'react';
import { Activity, User, Info, FileText, AlertTriangle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  const [formData, setFormData] = useState({
    age: '65',
    sex: 'Male',
    race: 'White',
    education: 'High School',
    bmi: '28.5',
    smoking_status: 'Current',
    cigarettes_per_day: '20',
    years_smoked: '40',
    pack_years: '40',
    years_since_quit: '0',
    copd: 'Yes',
    emphysema: 'No',
    chronic_bronchitis: 'No',
    personal_cancer_history: 'No',
    family_lung_cancer: 'No',
    occupational_exposure: 'None',
    secondhand_smoke: 'No',
    alcohol_use: 'Moderate',
    screening_history: 'None'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Convert necessary strings to numbers
    const payload = { ...formData };
    ['age', 'bmi', 'cigarettes_per_day', 'years_smoked', 'pack_years', 'years_since_quit'].forEach(f => {
      payload[f as keyof typeof payload] = Number(payload[f as keyof typeof payload]) as any;
    });

    try {
      const response = await fetch('http://localhost:8000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while connecting to the API.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: result?.evidence?.top_contributors?.map((c: any) => c.feature) || [],
    datasets: [
      {
        label: 'Hybrid Contribution (Log Odds)',
        data: result?.evidence?.top_contributors?.map((c: any) => c.contribution) || [],
        backgroundColor: result?.evidence?.top_contributors?.map((c: any) => 
          c.contribution > 0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)'
        ) || [],
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#e2e8f0' }
      }
    },
    plugins: {
      legend: { display: false },
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Activity size={20} className="text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">PulmoGuard AI</h2>
        </div>
        
        <nav className="flex flex-col gap-2 flex-grow">
          <a href="#" className="px-4 py-3 rounded-lg bg-blue-500/10 text-blue-400 font-medium flex items-center gap-3 transition-colors">
            <User size={18} />
            Risk Assessment
          </a>
        </nav>
        
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500/90 text-xs text-center">
          <AlertTriangle size={16} className="mx-auto mb-2" />
          Research Only<br />Not a Clinical Device
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">New Patient Risk Assessment</h1>
          <p className="text-slate-400">Enter patient demographics and clinical history to generate a hybrid ML risk probability and GenAI report.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
          
          {/* Form Panel */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <User size={18} className="text-blue-400"/> Patient Data
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} required className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Sex</label>
                  <select name="sex" value={formData.sex} onChange={handleChange} required className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Race</label>
                  <select name="race" value={formData.race} onChange={handleChange} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors">
                    <option value="White">White</option>
                    <option value="Black">Black</option>
                    <option value="Asian">Asian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Education</label>
                  <select name="education" value={formData.education} onChange={handleChange} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors">
                    <option value="High School">High School</option>
                    <option value="Bachelor's">Bachelor's</option>
                    <option value="Master's">Master's</option>
                    <option value="PhD">PhD</option>
                    <option value="None">None</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">BMI</label>
                  <input type="number" step="0.1" name="bmi" value={formData.bmi} onChange={handleChange} required className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Smoking Status</label>
                  <select name="smoking_status" value={formData.smoking_status} onChange={handleChange} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors">
                    <option value="Current">Current</option>
                    <option value="Former">Former</option>
                    <option value="Never">Never</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Pack Years</label>
                  <input type="number" step="0.1" name="pack_years" value={formData.pack_years} onChange={handleChange} required className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Cigs per Day</label>
                  <input type="number" name="cigarettes_per_day" value={formData.cigarettes_per_day} onChange={handleChange} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Years Smoked</label>
                  <input type="number" name="years_smoked" value={formData.years_smoked} onChange={handleChange} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Years Since Quit</label>
                  <input type="number" name="years_since_quit" value={formData.years_since_quit} onChange={handleChange} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">COPD</label>
                  <select name="copd" value={formData.copd} onChange={handleChange} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors">
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Family Lung Cancer</label>
                  <select name="family_lung_cancer" value={formData.family_lung_cancer} onChange={handleChange} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors">
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Emphysema</label>
                  <select name="emphysema" value={formData.emphysema} onChange={handleChange} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"><option value="Yes">Yes</option><option value="No">No</option></select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Chronic Bronchitis</label>
                  <select name="chronic_bronchitis" value={formData.chronic_bronchitis} onChange={handleChange} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"><option value="Yes">Yes</option><option value="No">No</option></select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Personal Cancer</label>
                  <select name="personal_cancer_history" value={formData.personal_cancer_history} onChange={handleChange} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"><option value="Yes">Yes</option><option value="No">No</option></select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Occ. Exposure</label>
                  <select name="occupational_exposure" value={formData.occupational_exposure} onChange={handleChange} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"><option value="Yes">Yes</option><option value="None">None</option></select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Secondhand Smoke</label>
                  <select name="secondhand_smoke" value={formData.secondhand_smoke} onChange={handleChange} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"><option value="Yes">Yes</option><option value="No">No</option></select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Alcohol Use</label>
                  <select name="alcohol_use" value={formData.alcohol_use} onChange={handleChange} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"><option value="Heavy">Heavy</option><option value="Moderate">Moderate</option><option value="None">None</option></select>
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-xs text-slate-400">Screening History</label>
                  <select name="screening_history" value={formData.screening_history} onChange={handleChange} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"><option value="Yes">Yes</option><option value="None">None</option></select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Activity size={18} />}
                {loading ? 'Analyzing...' : 'Analyze Patient Data'}
              </button>
            </form>
          </div>

          {/* Results Area */}
          <div className="space-y-6 relative">
            
            {/* Risk Gauge Panel */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity size={18} className="text-blue-400"/> Hybrid Risk Probability
              </h3>
              
              <div className="flex items-end justify-between mb-4">
                <div className="text-6xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  {result ? (result.evidence.risk_probability * 100).toFixed(1) + '%' : '--%'}
                </div>
                {result && (
                  <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
                    result.evidence.risk_level === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    result.evidence.risk_level === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  }`}>
                    {result.evidence.risk_level} RISK
                  </div>
                )}
              </div>

              <div className="h-2 bg-slate-800 rounded-full w-full relative mb-1">
                <div 
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-1000"
                  style={{ width: result ? `${result.evidence.risk_probability * 100}%` : '0%' }}
                />
                {result && (
                  <div 
                    className="absolute top-[-4px] w-0.5 h-4 bg-white"
                    style={{ left: `${result.evidence.threshold * 100}%` }}
                    title={`Threshold: ${(result.evidence.threshold * 100).toFixed(1)}%`}
                  />
                )}
              </div>
              <div className="text-xs text-slate-500 text-right">
                {result ? `Decision Threshold: ${(result.evidence.threshold * 100).toFixed(1)}%` : 'Awaiting data'}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 flex items-start gap-3">
                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* SHAP Chart Panel */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl h-80">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Info size={18} className="text-blue-400"/> Top Contributing Factors (SHAP + LR)
              </h3>
              <div className="h-64 w-full flex items-center justify-center">
                {result ? (
                  <Bar data={chartData} options={chartOptions} />
                ) : (
                  <p className="text-slate-500 text-sm">Submit patient data to view contributions.</p>
                )}
              </div>
            </div>

            {/* GenAI Report Panel */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText size={18} className="text-blue-400"/> GenAI Risk Communication Report
              </h3>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 min-h-32 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {result ? (
                  result.report
                ) : (
                  <p className="text-slate-500 text-center py-8">No report generated yet.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
