import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import IssueCard from '../components/IssueCard';
import { colors, statusColors } from '../constants/colors';

const MyReportsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');

  const loadIssues = async () => {
    if (!user) return;
    try {
      const data = await api.getMyIssues(user.id);
      setIssues(data);
    } catch (e) {
      // ignore for now
    }
  };

  useEffect(() => {
    loadIssues();
  }, [user]);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadIssues();
    }, [user])
  );

  const filteredIssues = selectedStatus === 'All'
    ? issues
    : issues.filter(issue => {
        const statusMap = {
          'Pending': 'pending',
          'In Progress': 'inProgress',
          'Resolved': 'resolved',
        };
        return issue.status === statusMap[selectedStatus];
      });

  const statusCounts = {
    All: issues.length,
    Pending: issues.filter(i => i.status === 'pending').length,
    'In Progress': issues.filter(i => i.status === 'inProgress').length,
    Resolved: issues.filter(i => i.status === 'resolved').length,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Reports</Text>
        <Text style={styles.subtitle}>{issues.length} total reports</Text>
      </View>

      <View style={styles.statusFilter}>
        {['All', 'Pending', 'In Progress', 'Resolved'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              selectedStatus === status && styles.statusButtonActive,
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                styles.statusButtonText,
                selectedStatus === status && styles.statusButtonTextActive,
              ]}
            >
              {status}
            </Text>
            <Text
              style={[
                styles.statusCount,
                selectedStatus === status && styles.statusCountActive,
              ]}
            >
              {statusCounts[status]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredIssues}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => (
          <IssueCard
            issue={item}
            onPress={() => navigation.navigate('IssueDetail', { issue: item })}
            showUpvote={false}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reports found</Text>
            <Text style={styles.emptySubtext}>
              {selectedStatus === 'All'
                ? 'Start reporting issues to see them here'
                : `No ${selectedStatus.toLowerCase()} reports`}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.6,
  },
  statusFilter: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: colors.primary,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  statusButtonTextActive: {
    color: colors.white,
  },
  statusCount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statusCountActive: {
    color: colors.white,
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.5,
    textAlign: 'center',
  },
});

export default MyReportsScreen;

