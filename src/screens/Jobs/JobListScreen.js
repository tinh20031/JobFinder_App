import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { JobService } from '../../services/JobService';

const JobListScreen = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await JobService.getJobs();
        setJobs(data);
      } catch (err) {
        setError('Không thể tải danh sách việc làm.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.jobItem}>
      <Text style={styles.title}>{item.jobTitle}</Text>
      <Text style={styles.company}>{item.company?.companyName || 'Không rõ công ty'}</Text>
      <Text style={styles.location}>{item.location}</Text>
      <Text style={styles.salary}>
        {item.isSalaryNegotiable
          ? 'Lương thỏa thuận'
          : `${item.minSalary?.toLocaleString() || ''} - ${item.maxSalary?.toLocaleString() || ''} VNĐ`}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Đang tải danh sách việc làm...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item) => item.id?.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text>Không có việc làm nào.</Text>}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
    backgroundColor: '#fff',
  },
  jobItem: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  company: {
    fontSize: 16,
    color: '#007bff',
    marginBottom: 4,
  },
  location: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
  },
  salary: {
    fontSize: 15,
    color: '#28a745',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default JobListScreen;
