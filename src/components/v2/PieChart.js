// src/components/PieChart.js
import React from "react";
import { Pie } from "react-chartjs-2";

function PieChart({ chartData }) {
    return (
        <div className="chart-container">
            <Pie
                data={chartData}
                options = {{
                    plugins: {
                        // responsive: true,
                        legend: {
                            display: true,
                            position: 'top',
                        },
                        // title: {
                        //     display: true,
                        //     text: 'Chart.js Doughnut Chart'
                        // },
                        animation: {
                            animateScale: true,
                            animateRotate: true
                        }
                    }
                    }
                }

            />
        </div>
    );
}
export default PieChart;