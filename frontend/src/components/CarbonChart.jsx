import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './CarbonChart.css';

const CarbonChart = ({ data }) => {
  // Sample data if no data provided
  const chartData = data && data.length > 0 ? data : [
    { period: '2023-Q1', calculated: 12.5, verified: 12.5 },
    { period: '2023-Q2', calculated: 15.2, verified: 14.8 },
    { period: '2023-Q3', calculated: 18.7, verified: 18.7 },
    { period: '2023-Q4', calculated: 22.3, verified: 21.5 }
  ];

  return (
    <div className="carbon-chart">
      <h3>Carbon Credits by Period</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis label={{ value: 'Carbon Credits', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="calculated" fill="#8884d8" name="Calculated" />
          <Bar dataKey="verified" fill="#82ca9d" name="Verified" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CarbonChart;