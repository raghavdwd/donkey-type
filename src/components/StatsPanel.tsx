import { RefreshCcw, Trophy, Target, Info, Keyboard, Activity } from 'lucide-react'
import useStore from '../store'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { useEffect, useMemo } from 'react'

export default function StatsPanel({ onRestart }: { onRestart: () => void }) {
  const { stats, calcWPM, calcAccuracy, history } = useStore()
  
  // Use the most recent test result from history for the chart
  const lastResult = history[0]
  const wpm = lastResult?.wpm ?? calcWPM()
  const rawWpm = lastResult?.rawWpm ?? wpm
  const acc = lastResult?.accuracy ?? calcAccuracy()
  
  const chartData = useMemo(() => {
    if (lastResult?.chartData && lastResult.chartData.length > 0) {
      return lastResult.chartData
    }
    // Fallback if no chart data (shouldn't happen with new tests)
    return Array.from({ length: 10 }).map((_, i) => ({
      time: i + 1,
      wpm: Math.max(0, wpm - 10 + Math.random() * 20),
      raw: Math.max(0, wpm + Math.random() * 10),
      errors: 0
    }))
  }, [lastResult, wpm])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        onRestart()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onRestart])

  return (
    <div className="w-full max-w-5xl flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-12">
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Side: Major Stats */}
        <div className="flex flex-col gap-4 w-full md:w-1/3">
           <div className="bg-bg-secondary p-8 rounded-2xl border border-neutral-800 flex flex-col gap-1 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 text-neutral-800 group-hover:text-brand/10 transition-colors">
              <Trophy className="w-32 h-32" />
            </div>
            <span className="text-brand font-mono text-lg font-medium relative z-10">wpm</span>
            <span className="text-8xl font-black text-brand relative z-10 tabular-nums">{wpm}</span>
          </div>

          <div className="bg-bg-secondary p-8 rounded-2xl border border-neutral-800 flex flex-col gap-1 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 text-neutral-800 group-hover:text-brand/10 transition-colors">
              <Target className="w-32 h-32" />
            </div>
            <span className="text-text-muted font-mono text-lg font-medium relative z-10">accuracy</span>
            <span className="text-7xl font-black text-text relative z-10 tabular-nums">{acc}<span className="text-3xl text-text-muted">%</span></span>
          </div>
        </div>

        {/* Right Side: Chart and Secondary Stats */}
        <div className="flex flex-col gap-4 flex-1 w-full">
          {/* Chart Area */}
          <div className="w-full h-80 bg-bg-secondary/30 rounded-2xl border border-neutral-800 p-6 relative">
            <div className="absolute top-4 left-6 flex items-center gap-2 text-text-muted text-sm font-mono">
              <Activity className="w-4 h-4 text-brand" />
              performance over time
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 40, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#444" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#666' }}
                />
                <YAxis 
                  stroke="#444" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#666' }}
                />
                <Tooltip 
                  cursor={{ stroke: '#444', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#666', marginBottom: '4px', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ top: 0, right: 0, paddingBottom: '20px' }} />
                <Line 
                  name="wpm" 
                  type="monotone" 
                  dataKey="wpm" 
                  stroke="#eab308" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, fill: '#eab308', strokeWidth: 0 }}
                  animationDuration={1500}
                />
                <Line 
                  name="raw" 
                  type="monotone" 
                  dataKey="raw" 
                  stroke="#444" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 4, fill: '#444', strokeWidth: 0 }}
                  strokeDasharray="5 5"
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Secondary Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-bg-secondary/50 p-5 rounded-xl border border-neutral-800 flex flex-col">
              <span className="text-text-muted font-mono text-xs uppercase tracking-widest mb-1">test type</span>
              <span className="text-xl font-bold text-text truncate">{lastResult?.mode} {lastResult?.timeAmount || lastResult?.wordsAmount}</span>
            </div>
            <div className="bg-bg-secondary/50 p-5 rounded-xl border border-neutral-800 flex flex-col">
              <span className="text-text-muted font-mono text-xs uppercase tracking-widest mb-1">raw wpm</span>
              <span className="text-xl font-bold text-text">{rawWpm}</span>
            </div>
            <div className="bg-bg-secondary/50 p-5 rounded-xl border border-neutral-800 flex flex-col">
              <span className="text-text-muted font-mono text-xs uppercase tracking-widest mb-1">characters</span>
              <span className="text-xl font-bold text-text">{stats.typedCharCount}</span>
            </div>
            <div className="bg-bg-secondary/50 p-5 rounded-xl border border-neutral-800 flex flex-col">
              <span className="text-text-muted font-mono text-xs uppercase tracking-widest mb-1">errors</span>
              <span className="text-xl font-bold text-error">{stats.typos}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Extra Details Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-bg-secondary/20 p-4 rounded-2xl border border-dashed border-neutral-800">
        <div className="flex gap-6">
          <div className="items-center gap-2 text-text-muted hidden md:flex">
            <Keyboard className="w-4 h-4" />
            <span className="text-sm">{lastResult?.language} {lastResult?.difficulty}</span>
          </div>
          <div className="items-center gap-2 text-text-muted hidden lg:flex">
            <Info className="w-4 h-4" />
            <span className="text-sm italic truncate max-w-xs">"{lastResult?.textUsed.slice(0, 40)}..."</span>
          </div>
        </div>

        <button 
          onClick={onRestart}
          className="group flex items-center gap-3 bg-brand text-bg px-10 py-4 rounded-xl font-black text-lg hover:bg-brand-light transition-all active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_40px_rgba(234,179,8,0.4)]"
        >
          <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
          RESTART TEST
        </button>
      </div>

    </div>
  )
}
