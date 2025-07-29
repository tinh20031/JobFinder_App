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
}; 