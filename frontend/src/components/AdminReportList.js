
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';
import { useDispatch } from 'react-redux';
import { HiHome, HiUser, HiDocumentReport, HiChartBar, HiLogout } from 'react-icons/hi';
import { NavLink } from 'react-router-dom';
const AdminReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    onConfirm: null,
  });
  
  const [selectedReport, setSelectedReport] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, [searchQuery, currentPage]); // Adding searchQuery and currentPage as dependencies

  const handleLogout = () => {
    dispatch(logout());
    navigate('/adminlogin');
  };

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:8000/posts/admin/reports/', {
        params: {
          page: currentPage,
          search: searchQuery,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Adjust based on your auth setup
        },
      });

      setReports(response.data.results);
      setTotalPages(Math.ceil(response.data.count / 10)); // Assuming page_size=10
      setLoading(false);
    } catch (err) {
      setError(err.response ? err.response.data : err.message);
      setLoading(false);
    }
  };

  const openConfirmModal = (report, action) => {
    setSelectedReport({ report, action });
    setModalContent({
      title: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `Are you sure you want to ${action} this report?`,
      onConfirm: () => handleAction(report.id, action),
    });
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setSelectedReport(null);
  };

  const openNotificationModal = (title, message) => {
    setModalContent({
      title,
      message,
      onConfirm: null,
    });
    setIsNotificationModalOpen(true);
  };

  const closeNotificationModal = () => {
    setIsNotificationModalOpen(false);
    setModalContent({
      title: '',
      message: '',
      onConfirm: null,
    });
  };

  const handleAction = async (reportId, action) => {
    try {
      const response = await axios.put(
        `http://localhost:8000/posts/admin/reports/${reportId}/action/`,
        { action },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Adjust based on your auth setup
          },
        }
      );

      if (response.data.error) {
        openNotificationModal('Error', response.data.error);
      } else {
        setReports((prevReports) =>
          prevReports.map((report) =>
            report.id === reportId ? { ...report, status: response.data.status } : report
          )
        );
        openNotificationModal('Success', `Report has been ${response.data.status.toLowerCase()}.`);
      }
    } catch (err) {
      openNotificationModal('Error', err.response ? err.response.data.error : 'An error occurred.');
    } finally {
      closeConfirmModal();
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(e.target.value);
    setCurrentPage(1);
    fetchReports();
  };

  const renderReports = () => {
    if (loading) return <p className="text-center text-gray-500">Loading reports...</p>;
    if (error) return <p className="text-center text-red-500">Error: {JSON.stringify(error)}</p>;
    if (reports.length === 0) return <p className="text-center text-gray-500">No reports found.</p>;

    return (
      <div className="overflow-x-auto mt-4" style={{paddingLeft:'16%'}}>
       <h1 className="text-4xl font-extrabold text-gray-800 my-6 p-4 rounded-lg shadow-lg">
  Flagged Posts
</h1>

        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">User</th>
              <th className="py-2 px-4 border-b">Post</th>
              <th className="py-2 px-4 border-b">Reason</th>
              <th className="py-2 px-4 border-b">Additional Info</th>
              <th className="py-2 px-4 border-b">Created At</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b text-center">{report.id}</td>
                <td className="py-2 px-4 border-b">{report.user_username}</td>
                <td className="py-2 px-4 border-b">{report.post_title}</td>
                <td className="py-2 px-4 border-b">{report.reason}</td>
                <td className="py-2 px-4 border-b">{report.additional_info || 'N/A'}</td>
                <td className="py-2 px-4 border-b">
                  {new Date(report.created_at).toLocaleString()}
                </td>
                <td className="py-2 px-4 border-b">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      report.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : report.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {report.status === 'PENDING' ? (
                    <div className="flex justify-center space-x-2">
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        onClick={() => openConfirmModal(report, 'approve')}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        onClick={() => openConfirmModal(report, 'reject')}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-500">No actions available</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center space-x-4 mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${
            currentPage === 1
              ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages
              ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-600 text-white shadow-lg fixed inset-y-0 left-0 flex flex-col">
            <div className="flex items-center justify-center h-20 text-2xl font-bold tracking-wider border-b border-indigo-500">
                Admin Panel
            </div>
            <nav className="flex-1 p-4 space-y-4">
                <NavLink 
                    to="/admin-dashboard" 
                    className={({ isActive }) => 
                        `flex items-center p-4 rounded-md transition-colors ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
                    }
                >
                    <HiHome className="w-6 h-6 mr-3" />
                    <span className="font-semibold">Dashboard</span>
                </NavLink>
                <NavLink 
                    to="/admin-user" 
                    className={({ isActive }) => 
                        `flex items-center p-4 rounded-md transition-colors ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
                    }
                >
                    <HiUser className="w-6 h-6 mr-3" />
                    <span className="font-semibold">Users</span>
                </NavLink>
                <NavLink 
                    to="/activity-feed" 
                    className={({ isActive }) => 
                        `flex items-center p-4 rounded-md transition-colors ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
                    }
                >
                    <HiUser className="w-6 h-6 mr-3" />
                    <span className="font-semibold">User Feed</span>
                </NavLink>
                <NavLink 
                    to="/reports" 
                    className={({ isActive }) => 
                        `flex items-center p-4 rounded-md transition-colors ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`
                    }
                >
                    <HiDocumentReport className="w-6 h-6 mr-3" />
                    <span className="font-semibold">Reports</span>
                </NavLink>
                <button 
                    onClick={handleLogout} 
                    className="flex items-center w-full text-left p-4 rounded-md hover:bg-red-600 transition-colors mt-auto"
                >
                    <HiLogout className="w-6 h-6 mr-3" />
                    <span className="font-semibold">Logout</span>
                </button>
            </nav>
        </aside>

      {/* Main Content */}
      <div className="flex-1 p-6" style={{marginTop:'3%'}}>
        {/* <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Reports</h1>
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..."
              className="border border-gray-300 p-2 rounded-l-lg w-64"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-r-lg"
            >
              Search
            </button>
          </form>
        </div> */}
        {renderReports()}
        {renderPagination()}

        {/* Confirmation Modal */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold">{modalContent.title}</h2>
                <button onClick={closeConfirmModal} className="text-gray-500 hover:text-gray-700">
                  &times;
                </button>
              </div>
              <div className="p-4">
                <p>{modalContent.message}</p>
              </div>
              <div className="flex justify-end p-4 space-x-2">
                <button
                  onClick={closeConfirmModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                {modalContent.onConfirm && (
                  <button
                    onClick={modalContent.onConfirm}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Confirm
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notification Modal */}
        {isNotificationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold">{modalContent.title}</h2>
                <button onClick={closeNotificationModal} className="text-gray-500 hover:text-gray-700">
                  &times;
                </button>
              </div>
              <div className="p-4">
                <p>{modalContent.message}</p>
              </div>
              <div className="flex justify-end p-4">
                <button
                  onClick={closeNotificationModal}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportList;





