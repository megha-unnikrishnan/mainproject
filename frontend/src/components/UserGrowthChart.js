


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UserGrowthChart = () => {
    const [userGrowth, setUserGrowth] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeFrame, setTimeFrame] = useState('daily'); // New state for time frame
    const [filteredUserGrowth, setFilteredUserGrowth] = useState([]); // New state for filtered data

    useEffect(() => {
        const fetchUserGrowth = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error('Authentication token not found. Please log in.');
                }

                const response = await axios.get('http://localhost:8000/api/user_growth/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setUserGrowth(response.data);
            } catch (err) {
                if (err.response) {
                    setError(`Error: ${err.response.status} ${err.response.data.detail || err.response.statusText}`);
                } else if (err.request) {
                    setError('Error: No response from server. Please try again later.');
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserGrowth();
    }, []);

    useEffect(() => {
        const filterUserGrowth = () => {
            const now = new Date();
            const filteredData = userGrowth.filter(user => {
                const createdAt = new Date(user.created_at);
                switch (timeFrame) {
                    case 'daily':
                        return createdAt >= new Date(now.setDate(now.getDate() - 30)); // Last 30 days
                    case 'weekly':
                        return createdAt >= new Date(now.setDate(now.getDate() - 7)); // Last 7 days
                    case 'monthly':
                        return createdAt >= new Date(now.setMonth(now.getMonth() - 1)); // Last month
                    default:
                        return true;
                }
            });
            setFilteredUserGrowth(filteredData);
        };

        filterUserGrowth();
    }, [userGrowth, timeFrame]);

    if (loading) return <p>Loading User Growth Data...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    // Aggregate user registrations by date
    const registrationsByDate = filteredUserGrowth.reduce((acc, user) => {
        const date = new Date(user.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const sortedDates = Object.keys(registrationsByDate).sort((a, b) => new Date(a) - new Date(b));

    const chartData = {
        labels: sortedDates,
        datasets: [
            {
                label: 'User Registrations',
                data: sortedDates.map(date => registrationsByDate[date]),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'User Growth Over Time',
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Date',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Number of Registrations',
                },
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
    };

    const handleTimeFrameChange = (frame) => {
        setTimeFrame(frame);
    };

    return (
        <div className="w-full max-w-md mx-auto p-4">
            <h2 className="text-center text-xl font-bold mb-4">User Growth</h2>
            <div className="flex justify-center mb-4">
                <button onClick={() => handleTimeFrameChange('daily')} className={`mx-2 p-2 ${timeFrame === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                    Daily
                </button>
                <button onClick={() => handleTimeFrameChange('weekly')} className={`mx-2 p-2 ${timeFrame === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                    Weekly
                </button>
                <button onClick={() => handleTimeFrameChange('monthly')} className={`mx-2 p-2 ${timeFrame === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                    Monthly
                </button>
            </div>
            <div style={{ position: 'relative', height: '300px' }}>
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};

export default UserGrowthChart;

