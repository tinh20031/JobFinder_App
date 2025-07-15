import { BASE_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const JobService = {
  async getJobs() {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/Job`, {
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
      const jobs = apiJobs.map((job) => ({
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
        company: job.company
          ? {
              id: job.company.id,
              fullName: job.company.fullName,
              email: job.company.email,
              companyName: job.company.companyName,
              location: job.company.location,
              urlCompanyLogo: job.company.urlCompanyLogo,
            }
          : null,
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
      }));
      return jobs;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách việc làm:', error);
      return [];
    }
  },
};
