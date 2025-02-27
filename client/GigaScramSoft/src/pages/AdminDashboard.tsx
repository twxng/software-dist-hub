import '../styles/components/AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
      </header>
      
      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Users Management</h3>
            <div className="card-content">
              <p>Total Users: </p>
              <button className="dashboard-button">Manage Users</button>
            </div>
          </div>
          
          <div className="dashboard-card">
            <h3>Software Management</h3>
            <div className="card-content">
              <p>Total Applications: </p>
              <button className="dashboard-button">Manage Software</button>
            </div>
          </div>
        
          
          <div className="dashboard-card">
            <h3>Analytics</h3>
            <div className="card-content">
              <p>Total Downloads: </p>
              <button className="dashboard-button">View Details</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
