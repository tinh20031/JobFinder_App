import { BASE_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import companyService from './companyService';

export const JobService = {
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
