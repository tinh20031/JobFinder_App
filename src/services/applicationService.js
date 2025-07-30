import { BASE_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = BASE_URL + '/api';

async function getToken() {
  try {
    return await AsyncStorage.getItem('token');
  } catch (e) {
    return null;
  }
}

const applicationService = {
  // Apply for a job
  apply: async (jobId, formData) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token found');
      const res = await fetch(`${API_URL}/Application/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) {
        let errorMsg = 'Error applying for job';
        try {
          const errorData = await res.json();
          if (errorData && errorData.message) errorMsg = errorData.message;
        } catch {}
        throw new Error(errorMsg);
      }
      return await res.json();
    } catch (error) {
      console.error('Error applying for job:', error);
      throw error;
    }
  },

  // Get applied jobs for current user
  getAppliedJobs: async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token found');
      const res = await fetch(`${API_URL}/Application/my-applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Error fetching applied jobs');
      return await res.json();
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
      throw error;
    }
  },

  // Get job applicants for a specific job
  getJobApplicants: async (jobId) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token found');
      const res = await fetch(`${API_URL}/Application/job/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Error fetching job applicants');
      return await res.json();
    } catch (error) {
      console.error('Error fetching job applicants:', error);
      throw error;
    }
  },

  // Update application status
  updateStatus: async (applicationId, status) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token found');
      const res = await fetch(`${API_URL}/Application/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Error updating application status');
      return await res.json();
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  // Withdraw application
  withdraw: async (applicationId) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token found');
      const res = await fetch(`${API_URL}/Application/${applicationId}/withdraw`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Error withdrawing application');
      return await res.json();
    } catch (error) {
      console.error('Error withdrawing application:', error);
      throw error;
    }
  },

  // Get distinct job count by user in company
  getDistinctJobCountByUserInCompany: async (userId, companyId) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token found');
      const url = `${API_URL}/Application/distinct-job-count-by-user-in-company?userId=${userId}&companyId=${companyId}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Error fetching distinct job count');
      const data = await res.json();
      return data.distinctJobCount;
    } catch (error) {
      console.error('Error fetching distinct job count:', error);
      throw error;
    }
  },

  // Get jobs applied by user in company
  getJobsAppliedByUserInCompany: async (userId, companyId) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token found');
      const url = `${API_URL}/Application/jobs-applied-by-user-in-company?userId=${userId}&companyId=${companyId}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Error fetching jobs applied by user in company');
      return await res.json();
    } catch (error) {
      console.error('Error fetching jobs applied by user in company:', error);
      throw error;
    }
  },

  // Get all applications for a specific job (for employer)
  getApplicationsByJob: async (jobId) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token found');
      const res = await fetch(`${API_URL}/Application/job/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Error fetching applications by job');
      return await res.json();
    } catch (error) {
      console.error('Error fetching applications by job:', error);
      throw error;
    }
  },

  // Get all applications (all applicants in the system)
  getAllApplications: async () => {
    try {
      const res = await fetch(`${API_URL}/Application`);
      if (!res.ok) throw new Error('Error fetching all applications');
      return await res.json();
    } catch (error) {
      console.error('Error fetching all applications:', error);
      throw error;
    }
  },

  // Get unique candidate count for a company
  getUniqueCandidatesByCompany: async (companyId) => {
    try {
      const res = await fetch(`${API_URL}/Application/company/${companyId}/unique-candidates`);
      if (!res.ok) throw new Error('Error fetching unique candidates');
      const data = await res.json();
      return data.count;
    } catch (error) {
      console.error('Error fetching unique candidates:', error);
      throw error;
    }
  },

  // Get recent applicants for a company
  getRecentApplicantsByCompany: async (companyId, take = 10) => {
    try {
      const res = await fetch(`${API_URL}/Application/company/${companyId}/recent-applicants?take=${take}`);
      if (!res.ok) throw new Error('Error fetching recent applicants');
      return await res.json();
    } catch (error) {
      console.error('Error fetching recent applicants:', error);
      throw error;
    }
  },
};

export default applicationService; 