import { BASE_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import companyService from './companyService';

export const JobService = {
  async getIndustries() {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/Industry`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách ngành nghề');
      }
      const industries = await response.json();
      return industries;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách ngành nghề:', error);
      throw error;
    }
  },

  async getJobTypes() {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/JobType`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách loại công việc');
      }
      const jobTypes = await response.json();
      return jobTypes;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách loại công việc:', error);
      throw error;
    }
  },

  async getLevels() {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/Level`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách cấp độ');
      }
      const levels = await response.json();
      return levels;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách cấp độ:', error);
      throw error;
    }
  },

  async getExperienceLevels() {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/ExperienceLevel`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách kinh nghiệm');
      }
      const experienceLevels = await response.json();
      return experienceLevels;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách kinh nghiệm:', error);
      throw error;
    }
  },

  async getSalaryRanges() {
    // Temporarily disable API call and use fallback data only
    // TODO: Re-enable API call when backend is ready
    console.log('Using fallback salary ranges data');
    return [
      { id: 1, minSalary: 0, maxSalary: 1000, rangeName: '0 - 1000' },
      { id: 2, minSalary: 1000, maxSalary: 2000, rangeName: '1000 - 2000' },
      { id: 3, minSalary: 2000, maxSalary: 3000, rangeName: '2000 - 3000' },
      { id: 4, minSalary: 3000, maxSalary: 5000, rangeName: '3000 - 5000' },
      { id: 5, minSalary: 5000, maxSalary: 7000, rangeName: '5000 - 7000' },
      { id: 6, minSalary: 7000, maxSalary: 10000, rangeName: '7000 - 10000' },
      { id: 7, minSalary: 10000, maxSalary: 15000, rangeName: '10000 - 15000' },
      { id: 8, minSalary: 15000, maxSalary: 20000, rangeName: '15000 - 20000' }
    ];
  },

  async getJobById(jobId) {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/Job/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error('Không thể lấy chi tiết việc làm');
      }
      const job = await response.json();
      return job;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết việc làm:', error);
      throw error;
    }
  },

  async getJobs() {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/Job`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách việc làm');
      }
      const apiJobs = await response.json();
      // Map dữ liệu từ API sang cấu trúc frontend
      const jobs = await Promise.all(apiJobs.map(async (job) => {
        let company = null;
        if (job.company) {
          // Lấy chi tiết công ty nếu thiếu trường quan trọng
          let detail = {};
          try {
            detail = await companyService.getCompanyDetail(job.company.id || job.company.companyId || job.companyId);
          } catch {}
          company = {
            id: job.company.id,
            fullName: job.company.fullName,
            email: job.company.email,
            companyName: job.company.companyName,
            location: job.company.location || detail.location,
            urlCompanyLogo: job.company.urlCompanyLogo || detail.urlCompanyLogo,
            industryName: job.company.industryName || detail.industryName || job.industry?.industryName || '-',
            teamSize: job.company.teamSize || detail.teamSize || job.company.company_size || job.teamSize || job.company_size || '-',
            contact: job.company.contact || detail.contact || job.company.contact_info || job.contact || job.contact_info || '-',
            website: job.company.website || detail.website || job.company.company_website || job.website || job.company_website || '-',
          };
        }
        return {
          id: job.jobId,
          jobTitle: job.title,
          description: job.description,
          education: job.education,
          yourSkill: job.yourSkill,
          yourExperience: job.yourExperience,
          location: `${job.addressDetail || ''}${job.addressDetail && job.provinceName ? ', ' : ''}${job.provinceName || ''}`.trim(),
          provinceName: job.provinceName,
          isSalaryNegotiable: job.isSalaryNegotiable,
          minSalary: job.minSalary,
          maxSalary: job.maxSalary,
          logo: job.company?.urlCompanyLogo || '',
          companyId: job.companyId,
          company,
          industryId: job.industryId,
          industry: job.industry
            ? {
                industryId: job.industry.industryId,
                industryName: job.industry.industryName,
              }
            : null,
          jobTypeId: job.jobTypeId,
          jobType: job.jobType
            ? {
                id: job.jobType.id,
                jobTypeName: job.jobType.jobTypeName,
              }
            : null,
          levelId: job.levelId,
          level: job.level
            ? {
                id: job.level.id,
                levelName: job.level.levelName,
              }
            : null,
          experienceLevelId: job.experienceLevelId,
          experienceLevel: job.experienceLevel
            ? {
                id: job.experienceLevel.id,
                name: job.experienceLevel.name,
              }
            : null,
          expiryDate: job.expiryDate,
          timeStart: job.timeStart,
          timeEnd: job.timeEnd,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          status: job.status,
          addressDetail: job.addressDetail,
          skills: job.skills || [],
          descriptionWeight: job.descriptionWeight ?? null,
          skillsWeight: job.skillsWeight ?? null,
          experienceWeight: job.experienceWeight ?? null,
          educationWeight: job.educationWeight ?? null,
          quantity: job.quantity,
          numberOfPositions: job.quantity || job.numberOfPositions || 1,
        };
      }));
      return jobs;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách việc làm:', error);
      return [];
    }
  },

  async getTrendingJobs({ role = "candidate", companyId = null, page = 1, pageSize = 10 } = {}) {
    try {
      const token = await AsyncStorage.getItem('token');
      const params = new URLSearchParams();
      if (role) params.append("role", role);
      if (companyId) params.append("companyId", companyId);
      if (page) params.append("page", page);
      if (pageSize) params.append("pageSize", pageSize);
      
      const response = await fetch(`${BASE_URL}/api/job/trending?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách việc làm trending');
      }
      
      const trendingJobs = await response.json();
      return trendingJobs;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách việc làm trending:', error);
      throw error;
    }
  },
};
