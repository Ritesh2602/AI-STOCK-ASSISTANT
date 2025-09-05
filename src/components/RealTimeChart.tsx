"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface RealTimeChartProps {
  symbol: string;
  liveData: number[];
}

export default function RealTimeChart({
  symbol,
  liveData,
}: RealTimeChartProps) {
  const [chartData, setChartData] = useState({
    labels: Array(liveData.length).fill(""),
    datasets: [
      {
        label: symbol,
        data: liveData,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
      },
    ],
  });

  useEffect(() => {
    setChartData((prev) => ({
      labels: Array(liveData.length).fill(""), // X-axis can be empty or timestamps
      datasets: [{ ...prev.datasets[0], data: liveData }],
    }));
  }, [liveData]);

  return (
    <div style={{ maxWidth: 600, margin: "20px auto" }}>
      <Line
        data={chartData}
        options={{
          animation: { duration: 0 },
          responsive: true,
          maintainAspectRatio: false,
        }}
      />
    </div>
  );
}
