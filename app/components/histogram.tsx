import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

type HistogramEntry = {
    micros: number;
    count: number;
};

type HistogramStats = {
    histogram: HistogramEntry[];
    latency?: number;
    ops?: number;
    queryableEncryptionLatencyMicros?: number;
};

type LatencyAllHistogramsGraphProps = {
    stats: {
        commands: HistogramStats;
        reads: HistogramStats;
        writes: HistogramStats;
        transactions: HistogramStats;
    };
    className?: string;
};

const colors = {
    commands: "#8884d8",
    reads: "#82ca9d",
    writes: "#ff7300",
    transactions: "#d62728",
};

export default function LatencyHistograms({ stats, className }: LatencyAllHistogramsGraphProps) {
    // Collect all unique micros values
    if(!stats) {
        return null;
    }
    const allMicros = [
        ...stats.commands.histogram.map((h) => h.micros),
        ...stats.reads.histogram.map((h) => h.micros),
        ...stats.writes.histogram.map((h) => h.micros),
        ...stats.transactions.histogram.map((h) => h.micros),
    ];
    const uniqueMicros = Array.from(new Set(allMicros)).sort((a, b) => a - b);

    // Build combined data array
    const data = uniqueMicros.map((micros) => ({
        ms: micros / 1000,
        commands: stats.commands.histogram.find((h) => h.micros === micros)?.count || 0,
        reads: stats.reads.histogram.find((h) => h.micros === micros)?.count || 0,
        writes: stats.writes.histogram.find((h) => h.micros === micros)?.count || 0,
        transactions: stats.transactions.histogram.find((h) => h.micros === micros)?.count || 0,
    }));

    // Grid data for summary
    const summary = [
        { label: "Commands", color: colors.commands, ...stats.commands },
        { label: "Reads", color: colors.reads, ...stats.reads },
        { label: "Writes", color: colors.writes, ...stats.writes },
        { label: "Transactions", color: colors.transactions, ...stats.transactions },
    ];

    return (
        <div className={className}>
            <div className="grid grid-cols-2 gap-4 mb-4 md:grid-cols-4">
                {summary.map((s, idx) => (
                    <div key={s.label} className="p-3 bg-white border">
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                style={{
                                    display: "inline-block",
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    background: s.color,
                                }}
                            />
                            <span className="font-semibold">{s.label}</span>
                        </div>
                        <div className="text-xs text-neutral-700">
                            <div>
                                <strong>Total Latency:</strong> {s.latency !== undefined ? (s.latency / 1000).toLocaleString() + " ms" : "-"}
                            </div>
                            <div>
                                <strong>Average:</strong> {s.latency !== undefined && s.ops !== undefined && s.ops > 0 ? ((s.latency / 1000)/(s.ops !== undefined ? s.ops : 1)).toFixed(3) + " ms" : "0 ms"}
                            </div>
                            <div>
                                <strong>Operations:</strong> {s.ops !== undefined ? s.ops.toLocaleString() : "-"}
                            </div>
                            <div>
                                <strong>Encryption Latency:</strong> {s.queryableEncryptionLatencyMicros !== undefined ? s.queryableEncryptionLatencyMicros + " μs" : "-"}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                    <BarChart data={data}>
                        <XAxis dataKey="ms" label={{ value: "Latency (ms)", position: "insideBottom", offset: -5 }} />
                        <YAxis label={{ value: "Count", angle: -90, position: "insideLeft" }} />
                        <Tooltip />
                        {/* <Legend /> */}
                        <Bar dataKey="commands" fill={colors.commands} name="Commands" />
                        <Bar dataKey="reads" fill={colors.reads} name="Reads" />
                        <Bar dataKey="writes" fill={colors.writes} name="Writes" />
                        <Bar dataKey="transactions" fill={colors.transactions} name="Transactions" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
