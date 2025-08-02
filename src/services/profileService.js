import { BASE_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = BASE_URL + '/api';

export async function getToken() {
  try {
    return await AsyncStorage.getItem('token');
  } catch (e) {
    return null;
  }
}

// Main CandidateProfile API - consolidated from all previous separate APIs
const getCandidateProfile = async () => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
    const res = await fetch(`${BASE_URL}/api/CandidateProfile/me`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        Accept: '*/*'
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Error response:', errorText);
      return await getCandidateProfileFallback(token);
    }
    
  const data = await res.json();
  return data;
  } catch (error) {
    console.error('profileService - Network error, falling back to old API:', error);
    return await getCandidateProfileFallback(token);
  }
};

// Fallback function using old API structure
const getCandidateProfileFallback = async (token) => {
  // Get basic profile info from old endpoint
  const profileRes = await fetch(`${BASE_URL}/api/CandidateProfile/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: '*/*'
    }
  });
  
  let profileData = {};
  if (profileRes.ok) {
    try {
      profileData = await profileRes.json();
    } catch (e) {
      console.error('profileService - Could not parse profile response');
    }
  }
  
  // Return a structure that matches the expected format
  return {
    candidateProfileId: profileData.candidateProfileId || null,
    userId: profileData.userId || null,
    fullName: profileData.fullName || '',
    email: profileData.email || '',
    phone: profileData.phone || '',
    image: profileData.image || '',
    gender: profileData.gender || '',
    dob: profileData.dob || null,
    jobTitle: profileData.jobTitle || '',
    address: profileData.address || '',
    province: profileData.province || '',
    city: profileData.city || '',
    personalLink: profileData.personalLink || '',
    aboutMeDescription: '',
    skills: [],
    educations: [],
    workExperiences: [],
    highlightProjects: [],
    certificates: [],
    awards: [],
    foreignLanguages: []
  };
};

const updateCandidateProfile = async (formData) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
    const res = await fetch(`${BASE_URL}/api/CandidateProfile/me`, {
    method: 'PUT',
    headers: {
        'Authorization': `Bearer ${token}`,
    },
      body: formData,
  });
    
  if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Update error response:', errorText);
      return null;
    }
    
    const result = res.status === 204 ? null : await res.json();
    return result;
  } catch (error) {
    console.error('profileService - Update network error:', error);
    return null;
  }
};

// Profile Strength API
const getProfileStrength = async () => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
    const res = await fetch(`${BASE_URL}/api/CandidateProfile/me/profile-strength`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        Accept: '*/*'
      }
    });
    
    if (!res.ok) {
      return { percentage: 0, missingFields: [] };
    }
    
  return res.json();
  } catch (error) {
    console.error('profileService - Profile strength network error:', error);
    return { percentage: 0, missingFields: [] };
  }
};

// About Me API - using dedicated AboutMeController
const getAboutMe = async () => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
    const res = await fetch(`${BASE_URL}/api/AboutMe/me`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        Accept: '*/*'
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - AboutMe error response:', errorText);
      return { aboutMeDescription: '' };
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('profileService - AboutMe network error:', error);
    return { aboutMeDescription: '' };
  }
};

const createAboutMe = async (description) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/AboutMe/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ aboutMeDescription: description })
  });
    
  if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Create AboutMe error response:', errorText);
      throw new Error('Failed to create about me');
    }
    
  const data = await res.json();
  return data;
  } catch (error) {
    console.error('profileService - Create AboutMe network error:', error);
    throw error;
  }
};

const updateAboutMe = async (id, description) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
    const res = await fetch(`${BASE_URL}/api/AboutMe/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ aboutMeDescription: description })
  });
    
  if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Update AboutMe error response:', errorText);
      throw new Error('Failed to update about me');
    }
    
    return { aboutMeDescription: description };
  } catch (error) {
    console.error('profileService - Update AboutMe network error:', error);
    throw error;
  }
};

// Education API - using dedicated EducationController
const getEducationList = async () => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/Education/me`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        Accept: '*/*'
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Education error response:', errorText);
      return [];
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('profileService - Education network error:', error);
    return [];
  }
};

const createEducation = async (data) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/Education/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });
    
  if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Create Education error response:', errorText);
      throw new Error('Failed to create education');
    }
    
    const result = await res.json();
    return result;
  } catch (error) {
    console.error('profileService - Create Education network error:', error);
    throw error;
  }
};

const updateEducation = async (id, data) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/Education/me/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });
    
  if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Update Education error response:', errorText);
      throw new Error('Failed to update education');
    }
    
    return { id, ...data };
  } catch (error) {
    console.error('profileService - Update Education network error:', error);
    throw error;
  }
};

const deleteEducation = async (id) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/Education/${id}`, {
    method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Delete Education error response:', errorText);
      throw new Error('Failed to delete education');
    }
    
    return true;
  } catch (error) {
    console.error('profileService - Delete Education network error:', error);
    throw error;
  }
};

// Work Experience API - using dedicated WorkExperienceController
const getWorkExperienceList = async () => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/WorkExperience/me`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        Accept: '*/*'
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Work Experience error response:', errorText);
      return [];
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('profileService - Work Experience network error:', error);
    return [];
  }
};

const createWorkExperience = async (data) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/WorkExperience/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });
    
  if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Create Work Experience error response:', errorText);
    throw new Error('Failed to create work experience');
    }
    
    const result = await res.json();
    return result;
  } catch (error) {
    console.error('profileService - Create Work Experience network error:', error);
    throw error;
  }
};

const updateWorkExperience = async (data) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
    const res = await fetch(`${BASE_URL}/api/WorkExperience/me/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });
    
  if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Update Work Experience error response:', errorText);
      throw new Error('Failed to update work experience');
    }
    
    return data;
  } catch (error) {
    console.error('profileService - Update Work Experience network error:', error);
    throw error;
  }
};

const deleteWorkExperience = async (id) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/WorkExperience/${id}`, {
    method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Delete Work Experience error response:', errorText);
      throw new Error('Failed to delete work experience');
    }
    
    return true;
  } catch (error) {
    console.error('profileService - Delete Work Experience network error:', error);
    throw error;
  }
};

// Skills API - using dedicated SkillController
const getSkillsList = async () => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/Skill/me`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        Accept: '*/*'
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Skills error response:', errorText);
      return [];
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('profileService - Skills network error:', error);
    return [];
  }
};

const createSkill = async (data) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/Skill/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });
    
  if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Create Skill error response:', errorText);
    throw new Error('Failed to create skill');
    }
    
    const result = await res.json();
    return result;
  } catch (error) {
    console.error('profileService - Create Skill network error:', error);
    throw error;
  }
};

const updateSkill = async (id, data) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/Skill/me/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });
    
  if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Update Skill error response:', errorText);
      throw new Error('Failed to update skill');
    }
    
    return data;
  } catch (error) {
    console.error('profileService - Update Skill network error:', error);
    throw error;
  }
};

const deleteSkill = async (id) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
    const res = await fetch(`${BASE_URL}/api/Skill/me/${id}`, {
    method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Delete Skill error response:', errorText);
      throw new Error('Failed to delete skill');
    }
    
    return true;
  } catch (error) {
    console.error('profileService - Delete Skill network error:', error);
    throw error;
  }
};

// Foreign Language API - using dedicated ForeignLanguageController
const getForeignLanguageList = async () => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/ForeignLanguage/me`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        Accept: '*/*'
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Foreign Language error response:', errorText);
      return [];
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('profileService - Foreign Language network error:', error);
    return [];
  }
};

const createForeignLanguage = async (data) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/ForeignLanguage/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });
    
  if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Create Foreign Language error response:', errorText);
    throw new Error('Failed to create foreign language');
    }
    
    const result = await res.json();
    return result;
  } catch (error) {
    console.error('profileService - Create Foreign Language network error:', error);
    throw error;
  }
};

const updateForeignLanguage = async (id, data) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/ForeignLanguage/me/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });
    
  if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Update Foreign Language error response:', errorText);
      throw new Error('Failed to update foreign language');
    }
    
    return data;
  } catch (error) {
    console.error('profileService - Update Foreign Language network error:', error);
    throw error;
  }
};

const deleteForeignLanguage = async (id) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/ForeignLanguage/${id}`, {
    method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Delete Foreign Language error response:', errorText);
      throw new Error('Failed to delete foreign language');
    }
    
    return true;
  } catch (error) {
    console.error('profileService - Delete Foreign Language network error:', error);
    throw error;
  }
};

// Award API - using dedicated AwardController
const getAwardList = async () => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/Award/me`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        Accept: '*/*'
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Award error response:', errorText);
      return [];
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('profileService - Award network error:', error);
    return [];
  }
};

const createAward = async (data) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/Award/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorText = await res.text();
      console.error('profileService - Create Award error response:', errorText);
      throw new Error('Failed to create award');
  }

  const result = await res.json();
  return result;
  } catch (error) {
    console.error('profileService - Create Award network error:', error);
    throw error;
  }
};

const updateAward = async (id, data) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/Award/me/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });
    
  if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Update Award error response:', errorText);
      throw new Error('Failed to update award');
    }
    
    return data;
  } catch (error) {
    console.error('profileService - Update Award network error:', error);
    throw error;
  }
};

const deleteAward = async (id) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/Award/${id}`, {
    method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Delete Award error response:', errorText);
      throw new Error('Failed to delete award');
    }
    
    return true;
  } catch (error) {
    console.error('profileService - Delete Award network error:', error);
    throw error;
  }
};

// Certificate API - using dedicated CertificateController
const getCertificateList = async () => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/Certificate/me`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        Accept: '*/*'
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Certificate error response:', errorText);
      return [];
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('profileService - Certificate network error:', error);
    return [];
  }
};

const createCertificate = async (data) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/Certificate/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorText = await res.text();
      console.error('profileService - Create Certificate error response:', errorText);
      throw new Error('Failed to create certificate');
  }

  const result = await res.json();
  return result;
  } catch (error) {
    console.error('profileService - Create Certificate network error:', error);
    throw error;
  }
};

const updateCertificate = async (id, data) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/Certificate/me/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });
    
  if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Update Certificate error response:', errorText);
      throw new Error('Failed to update certificate');
    }
    
    return data;
  } catch (error) {
    console.error('profileService - Update Certificate network error:', error);
    throw error;
  }
};

const deleteCertificate = async (id) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/Certificate/${id}`, {
    method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Delete Certificate error response:', errorText);
      throw new Error('Failed to delete certificate');
    }
    
    return true;
  } catch (error) {
    console.error('profileService - Delete Certificate network error:', error);
    throw error;
  }
};

// Highlight Project API - using dedicated HighlightProjectController
const getHighlightProjectList = async () => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/HighlightProject/me`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        Accept: '*/*'
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Highlight Project error response:', errorText);
      return [];
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('profileService - Highlight Project network error:', error);
    return [];
  }
};

const createHighlightProject = async (data) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/HighlightProject/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorText = await res.text();
      console.error('profileService - Create Highlight Project error response:', errorText);
      throw new Error('Failed to create highlight project');
  }

  const result = await res.json();
  return result;
  } catch (error) {
    console.error('profileService - Create Highlight Project network error:', error);
    throw error;
  }
};

const updateHighlightProject = async (id, data) => {
  const token = await getToken();
  if (!token) throw new Error('No authentication');
  
  try {
  const res = await fetch(`${BASE_URL}/api/HighlightProject/me/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });
    
  if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Update Highlight Project error response:', errorText);
      throw new Error('Failed to update highlight project');
    }
    
    return data;
  } catch (error) {
    console.error('profileService - Update Highlight Project network error:', error);
    throw error;
  }
};

const deleteHighlightProject = async (id) => {
    const token = await getToken();
    if (!token) throw new Error('No authentication');
  
  try {
    const res = await fetch(`${BASE_URL}/api/HighlightProject/${id}`, {
    method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('profileService - Delete Highlight Project error response:', errorText);
      throw new Error('Failed to delete highlight project');
    }
    
    return true;
  } catch (error) {
    console.error('profileService - Delete Highlight Project network error:', error);
    throw error;
  }
};

export default {
  getCandidateProfile,
  updateCandidateProfile,
  getAboutMe,
  createAboutMe,
  updateAboutMe,
  getEducationList,
  createEducation,
  updateEducation,
  deleteEducation,
  getWorkExperienceList,
  createWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  getSkillsList,
  createSkill,
  updateSkill,
  deleteSkill,
  getForeignLanguageList,
  createForeignLanguage,
  updateForeignLanguage,
  deleteForeignLanguage,
  getAwardList,
  createAward,
  updateAward,
  deleteAward,
  getCertificateList,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  getHighlightProjectList,
  createHighlightProject,
  updateHighlightProject,
  deleteHighlightProject,
  getProfileStrength,
}; 