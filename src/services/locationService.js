import { BASE_URL } from '../constants/api';

const BASE_API_URL = "https://34tinhthanh.com/api";

const locationService = {
  // Lấy danh sách tỉnh/thành phố từ API
  getProvinces: async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/provinces`);
      if (response.ok) {
        const data = await response.json();
        // API trả về { value: [...], Count: 34 }, cần trả về array provinces
        return data.value || data;
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
      throw error;
    }
  },

  // Lấy danh sách quận/huyện theo mã tỉnh/thành phố
  getDistricts: async (provinceCode) => {
    try {
      const response = await fetch(`${BASE_API_URL}/districts?province_code=${provinceCode}`);
      if (response.ok) {
        const data = await response.json();
        // API trả về array trực tiếp hoặc { value: [...], Count: X }
        const districts = Array.isArray(data) ? data : (data.value || data);
        // Map cấu trúc dữ liệu mới về format cũ
        return districts.map(district => ({
          code: district.district_code || district.code,
          name: district.district_name || district.name
        }));
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
      throw error;
    }
  },

  // Lấy danh sách phường/xã của một tỉnh/thành phố
  getWards: async (provinceCode) => {
    try {
      const response = await fetch(`${BASE_API_URL}/wards?province_code=${provinceCode}`);
      if (response.ok) {
        const data = await response.json();
        // API trả về array trực tiếp hoặc { value: [...], Count: X }
        const wards = Array.isArray(data) ? data : (data.value || data);
        // Map cấu trúc dữ liệu mới về format cũ
        return wards.map(ward => ({
          code: ward.ward_code || ward.code,
          name: ward.ward_name || ward.name
        }));
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching wards:", error);
      throw error;
    }
  },
};

export default locationService; 