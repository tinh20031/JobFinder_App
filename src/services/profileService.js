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

// About Me API
const getAboutMe = async (token) => {
  console.log('Token when calling getAboutMe:', token);
  const res = await fetch(`${BASE_URL}/api/AboutMe/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch About Me');
  const data = await res.json();
  console.log('getAboutMe response:', data);
  return data;
};

const createAboutMe = async (description, token) => {
  console.log('Token when calling createAboutMe:', token);
  const res = await fetch(`${BASE_URL}/api/AboutMe/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ aboutMeDescription: description })
  });
  if (!res.ok) {
    const text = await res.text();
    console.log('Create About Me error:', res.status, text);
    throw new Error('Failed to create About Me');
  }
  const data = await res.json();
  console.log('Create About Me response:', data);
  return data;
};

const updateAboutMe = async (id, description, token) => {
  console.log('Token when calling updateAboutMe:', token);
  const res = await fetch(`${BASE_URL}/api/AboutMe/me/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ aboutMeDescription: description })
  });
  if (!res.ok) {
    const text = await res.text();
    console.log('Update About Me error:', res.status, text);
    throw new Error('Failed to update About Me');
  }
};

// Education API
const getEducationList = async (token) => {
  const res = await fetch(`${BASE_URL}/api/Education/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch education list');
  return res.json();
};

const createEducation = async (data, token) => {
  const res = await fetch(`${BASE_URL}/api/Education/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create education');
  return res.json();
};

const updateEducation = async (id, data, token) => {
  const res = await fetch(`${BASE_URL}/api/Education/me/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update education');
};

const deleteEducation = async (id, token) => {
  const res = await fetch(`${BASE_URL}/api/Education/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete education');
};

// Work Experience API
const getWorkExperienceList = async (token) => {
  const res = await fetch(`${BASE_URL}/api/WorkExperience/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch work experience list');
  return res.json();
};

const createWorkExperience = async (data, token) => {
  const res = await fetch(`${BASE_URL}/api/WorkExperience/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const text = await res.text();
    console.log('Create Work Experience error:', res.status, text);
    throw new Error('Failed to create work experience');
  }
  return res.json();
};

const updateWorkExperience = async (id, data, token) => {
  const res = await fetch(`${BASE_URL}/api/WorkExperience/me/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update work experience');
};

const deleteWorkExperience = async (id, token) => {
  const res = await fetch(`${BASE_URL}/api/WorkExperience/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete work experience');
};

// Skills API
const getSkillsList = async (token) => {
  const res = await fetch(`${BASE_URL}/api/Skill/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch skills list');
  return res.json();
};

const createSkill = async (data, token) => {
  const res = await fetch(`${BASE_URL}/api/Skill/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const text = await res.text();
    console.log('Create Skill error:', res.status, text);
    throw new Error('Failed to create skill');
  }
  return res.json();
};

const updateSkill = async (id, data, token) => {
  const res = await fetch(`${BASE_URL}/api/Skill/me/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update skill');
};

const deleteSkill = async (id, token) => {
  const res = await fetch(`${BASE_URL}/api/Skill/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete skill');
};

// Foreign Language API
const getForeignLanguageList = async (token) => {
  const res = await fetch(`${BASE_URL}/api/ForeignLanguage/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch foreign language list');
  return res.json();
};

const createForeignLanguage = async (data, token) => {
  const res = await fetch(`${BASE_URL}/api/ForeignLanguage/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      languageName: data.languageName,
      languageLevel: data.languageLevel
    })
  });
  if (!res.ok) {
    const text = await res.text();
    console.log('Create Foreign Language error:', res.status, text);
    throw new Error('Failed to create foreign language');
  }
  return res.json();
};

const updateForeignLanguage = async (id, data, token) => {
  const res = await fetch(`${BASE_URL}/api/ForeignLanguage/me/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      languageName: data.languageName,
      languageLevel: data.languageLevel
    })
  });
  if (!res.ok) throw new Error('Failed to update foreign language');
};

const deleteForeignLanguage = async (id, token) => {
  const res = await fetch(`${BASE_URL}/api/ForeignLanguage/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete foreign language');
};

// Award API
const getAwardList = async (token) => {
  const res = await fetch(`${BASE_URL}/api/Award/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch award list');
  return res.json();
};

const createAward = async (data, token) => {
  console.log('createAward - URL:', `${BASE_URL}/api/Award/me`);
  console.log('createAward - Data:', data);
  console.log('createAward - Token:', token);

  const res = await fetch(`${BASE_URL}/api/Award/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  console.log('createAward - Response status:', res.status);
  console.log('createAward - Response ok:', res.ok);

  if (!res.ok) {
    const errorText = await res.text();
    console.log('createAward - Error response:', errorText);
    throw new Error('Failed to create award: ' + errorText);
  }

  const result = await res.json();
  console.log('createAward - Success result:', result);
  return result;
};

const updateAward = async (id, data, token) => {
  const res = await fetch(`${BASE_URL}/api/Award/me/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update award');
};

const deleteAward = async (id, token) => {
  const res = await fetch(`${BASE_URL}/api/Award/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete award');
};

// Certificate API
const getCertificateList = async (token) => {
  const res = await fetch(`${BASE_URL}/api/Certificate/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch certificate list');
  return res.json();
};

const createCertificate = async (data, token) => {
  console.log('createCertificate - URL:', `${BASE_URL}/api/Certificate/me`);
  console.log('createCertificate - Data:', data);
  console.log('createCertificate - Token:', token);

  const res = await fetch(`${BASE_URL}/api/Certificate/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  console.log('createCertificate - Response status:', res.status);
  console.log('createCertificate - Response ok:', res.ok);

  if (!res.ok) {
    const errorText = await res.text();
    console.log('createCertificate - Error response:', errorText);
    throw new Error('Failed to create certificate: ' + errorText);
  }

  const result = await res.json();
  console.log('createCertificate - Success result:', result);
  return result;
};

const updateCertificate = async (id, data, token) => {
  const res = await fetch(`${BASE_URL}/api/Certificate/me/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update certificate');
};

const deleteCertificate = async (id, token) => {
  const res = await fetch(`${BASE_URL}/api/Certificate/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete certificate');
};

// Highlight Project API
const getHighlightProjectList = async (token) => {
  const res = await fetch(`${BASE_URL}/api/HighlightProject/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch highlight project list');
  return res.json();
};

const createHighlightProject = async (data, token) => {
  console.log('createHighlightProject - URL:', `${BASE_URL}/api/HighlightProject/me`);
  console.log('createHighlightProject - Data:', data);
  console.log('createHighlightProject - Token:', token);

  const res = await fetch(`${BASE_URL}/api/HighlightProject/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  console.log('createHighlightProject - Response status:', res.status);
  console.log('createHighlightProject - Response ok:', res.ok);

  if (!res.ok) {
    const errorText = await res.text();
    console.log('createHighlightProject - Error response:', errorText);
    throw new Error('Failed to create highlight project: ' + errorText);
  }

  const result = await res.json();
  console.log('createHighlightProject - Success result:', result);
  return result;
};

const updateHighlightProject = async (id, data, token) => {
  const res = await fetch(`${BASE_URL}/api/HighlightProject/me/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update highlight project');
};

const deleteHighlightProject = async (id, token) => {
  const res = await fetch(`${BASE_URL}/api/HighlightProject/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete highlight project');
};

// Profile Strength API
const getProfileStrength = async (token) => {
  const res = await fetch(`${BASE_URL}/api/CandidateProfile/me/profile-strength`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      Accept: '*/*'
    }
  });
  if (!res.ok) throw new Error('Failed to fetch profile strength');
  return res.json();
};

const profileService = {
  getCandidateProfile: async () => {
    const token = await getToken();
    if (!token) throw new Error('No authentication');
    const res = await fetch(`${API_URL}/CandidateProfile/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch candidate profile');
    return await res.json();
  },

  updateCandidateProfile: async (formData) => {
    const token = await getToken();
    if (!token) throw new Error('No authentication');
    const res = await fetch(`${API_URL}/CandidateProfile/me`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to update candidate profile');
    return res.status === 204 ? null : await res.json();
  },
};

export default {
  ...profileService,
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