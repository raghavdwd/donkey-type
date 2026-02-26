import { RefreshCcw, Trophy, Target, Zap } from 'lucide-react'
import useStore from '../store'
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'

export default function StatsPanel({ onRestart }: { onRestart: () => void }) {
  const { stats, calcWPM, calcAccuracy } = useStore()
  const wpm = calcWPM()
  const acc = calcAccuracy()
  
  // Fake chart data for visual aesthetic (in a real app, track WPM over time during the test)
  const [chartData] = useState(() => 
    Array.from({ length: 10 }).map((_, i) => ({
      time: i,
      wpm: Math.max(0, wpm - 10 + Math.random() * 20)
    }))
  )

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
    <div className="w-full max-w-4xl flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-bg-secondary p-6 rounded-2xl border border-neutral-800 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-neutral-800 group-hover:text-brand/10 transition-colors">
            <Trophy className="w-24 h-24" />
          </div>
          <span className="text-text-muted font-mono text-sm relative z-10">wpm</span>
          <span className="text-6xl font-bold text-brand relative z-10">{wpm}</span>
        </div>
        
        <div className="bg-bg-secondary p-6 rounded-2xl border border-neutral-800 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-neutral-800 group-hover:text-brand/10 transition-colors">
            <Target className="w-24 h-24" />
          </div>
          <span className="text-text-muted font-mono text-sm relative z-10">acc</span>
          <span className="text-5xl font-bold text-text relative z-10 mt-1">{acc}%</span>
        </div>

        <div className="bg-bg-secondary p-6 rounded-2xl border border-neutral-800 flex flex-col gap-2">
          <span className="text-text-muted font-mono text-sm">characters</span>
          <span className="text-3xl font-bold text-text mt-auto">{stats.typedCharCount}</span>
        </div>

        <div className="bg-bg-secondary p-6 rounded-2xl border border-neutral-800 flex flex-col gap-2">
          <span className="text-text-muted font-mono text-sm">time</span>
          <span className="text-3xl font-bold text-text mt-auto">{stats.secElapsed}s</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full h-48 bg-bg-secondary/50 rounded-2xl border border-neutral-800 p-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Tooltip 
              contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
              itemStyle={{ color: '#eab308' }}
            />
            <Line 
              type="monotone" 
              dataKey="wpm" 
              stroke="#eab308" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#111', stroke: '#eab308', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#eab308' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        <button 
          onClick={onRestart}
          className="group flex items-center gap-3 bg-brand text-bg px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-light transition-all hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(234,179,8,0.4)]"
        >
          <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          Next Test
        </button>
      </div>

    </div>
  )
}