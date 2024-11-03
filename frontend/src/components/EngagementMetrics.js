import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const EngagementMetrics = () => {
    const [engagementMetrics, setEngagementMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEngagementMetrics = async () => {
            try {
                const token = localStorage.getItem('token'); // Get the token from localStorage
                const response = await axios.get('http://localhost:8000/api/engagement_metrics/', {
                    headers: {
                        Authorization: `Bearer ${token}` // Include the Authorization header
                    }
                });
                setEngagementMetrics(response.data);
            } catch (err) {
                setError(err.message || 'Error fetching engagement metrics');
            } finally {
                setLoading(false);
            }
        };

        fetchEngagementMetrics();
    }, []);

    if (loading) return <p>Loading Engagement Metrics...</p>;
    if (error) return <p>Error: {error}</p>;

    // Calculate total likes and comments
    const totalLikes = engagementMetrics.reduce((acc, post) => acc + (post.total_likes || 0), 0);
    const totalComments = engagementMetrics.reduce((acc, post) => acc + (post.total_comments || 0), 0);
    const totalShares = 0; // Implement shares tracking if applicable

    const chartData = {
        labels: ['Likes', 'Comments'],
        datasets: [
            {
                data: [totalLikes, totalComments],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // Allow for flexible height
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Engagement Metrics',
            },
        },
    };

    return (
        <div className="w-full max-w-md mx-auto p-4">
            <h2 className="text-center text-xl font-bold mb-4">Engagement Metrics</h2>
            <div style={{ position: 'relative', height: '300px' }}>
                <Pie data={chartData} options={options} />
            </div>
        </div>
    );
};

export default EngagementMetrics;
