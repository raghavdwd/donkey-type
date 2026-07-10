import {
  X,
  TrendingUp,
  Clock,
  Target,
  Gauge,
  Layers,
  Activity,
  Flame,
  Award,
} from 'lucide-react'
import useStore from '../store'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'

export default function HistoryModal() {
  const { history, isHistoryOpen, toggleHistory, streak } = useStore()

  if (!isHistoryOpen) return null

  const chartData = [...history].reverse().map((run, i) => ({
    testNumber: i + 1,
    wpm: run.wpm,
    raw: run.rawWpm ?? run.wpm,
    accuracy: run.accuracy,
    date: new Date(run.date).toLocaleDateString(),
    mode: run.mode,
  }))

  const bestWpm =
    history.length > 0 ? Math.max(...history.map((h) => h.wpm)) : 0
  const avgWpm =
    history.length > 0
      ? Math.round(history.reduce((a, b) => a + b.wpm, 0) / history.length)
      : 0
  const avgAcc =
    history.length > 0
      ? Math.round(history.reduce((a, b) => a + b.accuracy, 0) / history.length)
      : 0
  const consistency =
    history.length > 1
      ? Math.round(
          100 -
            (Math.sqrt(
              history.reduce((a, b) => a + (b.wpm - avgWpm) ** 2, 0) /
                history.length,
            ) /
              avgWpm) *
              100,
        )
      : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bg w-full max-w-7xl h-[94vh] rounded-2xl border border-neutral-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <h2 className="text-2xl font-bold font-mono text-text">
            performance <span className="text-brand">history</span>
          </h2>
          <button
            onClick={() => toggleHistory(false)}
            className="p-2 text-text-muted hover:text-text hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-12">
          {history.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted font-mono">
              <TrendingUp className="w-16 h-16 mb-4 opacity-20" />
              <p>Complete a test to see your history.</p>
            </div>
          ) : (
            <>
              {/* Stats overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-bg-secondary p-5 rounded-xl border border-neutral-800 flex items-center gap-4">
                  <div className="p-3 bg-brand/10 text-brand rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-text-muted font-mono text-xs">
                      Best WPM
                    </p>
                    <p className="text-2xl font-bold text-text">{bestWpm}</p>
                  </div>
                </div>
                <div className="bg-bg-secondary p-5 rounded-xl border border-neutral-800 flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-text-muted font-mono text-xs">Avg WPM</p>
                    <p className="text-2xl font-bold text-text">{avgWpm}</p>
                  </div>
                </div>
                <div className="bg-bg-secondary p-5 rounded-xl border border-neutral-800 flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 text-green-400 rounded-lg">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-text-muted font-mono text-xs">
                      Avg Accuracy
                    </p>
                    <p className="text-2xl font-bold text-text">{avgAcc}%</p>
                  </div>
                </div>
                <div className="bg-bg-secondary p-5 rounded-xl border border-neutral-800 flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-text-muted font-mono text-xs">
                      Avg Raw WPM
                    </p>
                    <p className="text-2xl font-bold text-text">
                      {Math.round(
                        history.reduce((a, b) => a + (b.rawWpm ?? b.wpm), 0) /
                          history.length,
                      )}
                    </p>
                  </div>
                </div>
                <div className="bg-bg-secondary p-5 rounded-xl border border-neutral-800 flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 text-orange-400 rounded-lg">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-text-muted font-mono text-xs">
                      Tests Done
                    </p>
                    <p className="text-2xl font-bold text-text">
                      {history.length}
                    </p>
                  </div>
                </div>
                <div className="bg-bg-secondary p-5 rounded-xl border border-neutral-800 flex items-center gap-4">
                  <div className="p-3 bg-pink-500/10 text-pink-400 rounded-lg">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-text-muted font-mono text-xs">
                      Consistency
                    </p>
                    <p className="text-2xl font-bold text-text">
                      {consistency}%
                    </p>
                  </div>
                </div>
                <div className="bg-bg-secondary p-5 rounded-xl border border-neutral-800 flex items-center gap-4">
                  <div className="p-3 bg-red-500/10 text-red-400 rounded-lg">
                    <Flame className="w-5 h-5" color="orange" />
                  </div>
                  <div>
                    <p className="text-text-muted font-mono text-xs">Streak</p>
                    <p className="text-2xl font-bold text-text">
                      {streak.count}
                    </p>
                  </div>
                </div>
                <div className="bg-bg-secondary p-5 rounded-xl border border-neutral-800 flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-text-muted font-mono text-xs">
                      Longest Streak
                    </p>
                    <p className="text-2xl font-bold text-text">
                      {streak.longest}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold font-mono text-text">
                  wpm progress
                </h3>
                <div className="w-full h-[400px] bg-bg-secondary/30 rounded-xl border border-neutral-800 p-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#333"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="testNumber"
                        stroke="#737373"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `#${value}`}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#737373"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 100]}
                        stroke="#3b82f6"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111',
                          border: '1px solid #333',
                          borderRadius: '8px',
                          fontFamily: 'monospace',
                        }}
                        itemStyle={{ color: '#eab308' }}
                        labelStyle={{ color: '#737373' }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ paddingBottom: '12px' }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="wpm"
                        name="wpm"
                        stroke="#eab308"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: '#111',
                          stroke: '#eab308',
                          strokeWidth: 2,
                        }}
                        activeDot={{ r: 6, fill: '#eab308' }}
                        animationDuration={1500}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="raw"
                        name="raw"
                        stroke="#444"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        activeDot={{ r: 4, fill: '#444' }}
                        animationDuration={1500}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="accuracy"
                        name="accuracy"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#3b82f6' }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
