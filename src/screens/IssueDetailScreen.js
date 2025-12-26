import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, statusColors, categoryColors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import CustomButton from '../components/CustomButton';

const IssueDetailScreen = ({ route, navigation }) => {
  const { issue: initialIssue } = route.params;
  const { user } = useAuth();
  const [issue, setIssue] = useState(initialIssue);
  const [loading, setLoading] = useState(false);

  const isOwner = user && (issue.userId === user.id || issue.userId?._id === user.id || issue.userId?.toString() === user.id);

  const getStatusColor = (status) => {
    return statusColors[status] || colors.gray;
  };

  const getCategoryColor = (category) => {
    return categoryColors[category] || colors.gray;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleMarkDone = async () => {
    if (!user || !isOwner) return;

    Alert.alert(
      'Mark as Done',
      'Are you sure you want to mark this issue as resolved?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Done',
          onPress: async () => {
            try {
              setLoading(true);
              const updatedIssue = await api.markIssueDone(issue._id || issue.id, user.id);
              setIssue(updatedIssue);
              Alert.alert('Success', 'Issue marked as resolved!');
              // Refresh the screen or navigate back
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to mark issue as done');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = async () => {
    if (!user || !isOwner) return;

    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.deleteIssue(issue._id || issue.id, user.id);
              Alert.alert('Success', 'Report deleted successfully!');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete report');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {issue.imageUrls && issue.imageUrls.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {issue.imageUrls.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.image} />
          ))}
        </ScrollView>
      )}

      <View style={styles.header}>
        <View style={styles.badges}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(issue.category) }]}>
            <Text style={styles.categoryText}>{issue.category}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(issue.status) }]}>
            <Text style={styles.statusText}>
              {issue.status === 'inProgress' ? 'In Progress' :
               issue.status === 'resolved' ? 'Resolved' : 'Pending'}
            </Text>
          </View>
        </View>
        <Text style={styles.title}>{issue.title}</Text>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={colors.text} />
            <Text style={styles.metaText}>{formatDate(issue.createdAt)}</Text>
          </View>
          {issue.upvotes && (
            <View style={styles.metaItem}>
              <Ionicons name="heart" size={16} color={colors.danger} />
              <Text style={styles.metaText}>{issue.upvotes.length} upvotes</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{issue.description}</Text>
      </View>

      {issue.address && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <Text style={styles.address}>{issue.address}</Text>
          </View>
          {issue.location && (
            <Text style={styles.coords}>
              {issue.location.lat.toFixed(6)}, {issue.location.lng.toFixed(6)}
            </Text>
          )}
        </View>
      )}

      {isOwner && (
        <View style={styles.actionsContainer}>
          {issue.status !== 'resolved' && (
            <CustomButton
              title="Mark as Done"
              onPress={handleMarkDone}
              loading={loading}
              style={styles.doneButton}
              icon={<Ionicons name="checkmark-circle" size={20} color={colors.white} />}
            />
          )}
          <CustomButton
            title="Delete Report"
            onPress={handleDelete}
            loading={loading}
            variant="danger"
            style={styles.deleteButton}
            icon={<Ionicons name="trash" size={20} color={colors.white} />}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  imageScroll: {
    maxHeight: 300,
  },
  image: {
    width: 400,
    height: 300,
    resizeMode: 'cover',
  },
  header: {
    backgroundColor: colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  section: {
    backgroundColor: colors.white,
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  coords: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
    fontFamily: 'monospace',
  },
  actionsContainer: {
    backgroundColor: colors.white,
    padding: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  doneButton: {
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
});

export default IssueDetailScreen;

