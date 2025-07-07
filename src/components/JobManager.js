import React from 'react';

const JobManager = ({ businessData, dbOperations }) => {
  return (
    <div className="job-manager">
      <h2>Job Manager</h2>
      <div className="jobs-list">
        {businessData.jobs.map(job => (
          <div key={job.id} className="job-item">
            <h3>{job.title}</h3>
            <p>Status: {job.status}</p>
            <p>Date: {new Date(job.scheduled_date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobManager;
