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
      // Fallback to hardcoded data if API fails
      return [
        { industryId: 1, industryName: 'Technology' },
        { industryId: 2, industryName: 'Finance' },
        { industryId: 3, industryName: 'Healthcare' },
        { industryId: 4, industryName: 'Education' },
        { industryId: 5, industryName: 'Manufacturing' },
        { industryId: 6, industryName: 'Retail' },
        { industryId: 7, industryName: 'Marketing' },
        { industryId: 8, industryName: 'Consulting' },
        { industryId: 9, industryName: 'Real Estate' },
        { industryId: 10, industryName: 'Transportation' },
      ];
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
      // Fallback to hardcoded data if API fails
      return [
        { id: 1, jobTypeName: 'Onsite (Work from Office)' },
        { id: 2, jobTypeName: 'Remote (Work from Home)' },
        { id: 3, jobTypeName: 'Hybrid (Work from Office & Home)' },
        { id: 4, jobTypeName: 'Part-time' },
        { id: 5, jobTypeName: 'Full-time' },
        { id: 6, jobTypeName: 'Contract' },
        { id: 7, jobTypeName: 'Internship' },
        { id: 8, jobTypeName: 'Freelance' },
      ];
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
      // Fallback to hardcoded data if API fails
      return [
        { id: 1, levelName: 'Intern' },
        { id: 2, levelName: 'Junior' },
        { id: 3, levelName: 'Senior' },
        { id: 4, levelName: 'Lead' },
        { id: 5, levelName: 'Manager' },
        { id: 6, levelName: 'Director' },
        { id: 7, levelName: 'Executive' },
      ];
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
      // Fallback to hardcoded data if API fails
      return [
        { id: 1, name: '0-1 years' },
        { id: 2, name: '1-3 years' },
        { id: 3, name: '3-5 years' },
        { id: 4, name: '5-7 years' },
        { id: 5, name: '7-10 years' },
        { id: 6, name: '10+ years' },
      ];
    }
  },

  async getSalaryRanges() {
    // Return hardcoded salary ranges directly since API is not available
    return [
      { id: 1, name: 'Under $2,000', minSalary: 0, maxSalary: 2000 },
      { id: 2, name: '$2,000 - $4,000', minSalary: 2000, maxSalary: 4000 },
      { id: 3, name: '$4,000 - $6,000', minSalary: 4000, maxSalary: 6000 },
      { id: 4, name: '$6,000 - $8,000', minSalary: 6000, maxSalary: 8000 },
      { id: 5, name: '$8,000 - $10,000', minSalary: 8000, maxSalary: 10000 },
      { id: 6, name: '$10,000 - $12,000', minSalary: 10000, maxSalary: 12000 },
      { id: 7, name: '$12,000 - $14,000', minSalary: 12000, maxSalary: 14000 },
      { id: 8, name: '$14,000 - $16,000', minSalary: 14000, maxSalary: 16000 },
      { id: 9, name: '$16,000 - $18,000', minSalary: 16000, maxSalary: 18000 },
      { id: 10, name: '$18,000 - $20,000', minSalary: 18000, maxSalary: 20000 },
      { id: 11, name: 'Over $20,000', minSalary: 20000, maxSalary: 999999 },
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
};
