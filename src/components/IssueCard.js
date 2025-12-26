import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, statusColors, categoryColors } from '../constants/colors';

const IssueCard = ({ issue, onPress, onUpvote, showUpvote = true }) => {
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
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {issue.imageUrls && issue.imageUrls.length > 0 && (
        <Image 
          source={{ uri: issue.imageUrls[0] }} 
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
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
        
        <Text style={styles.title} numberOfLines={2}>{issue.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{issue.description}</Text>
        
        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <Ionicons name="time-outline" size={14} color={colors.text} />
            <Text style={styles.date}>{formatDate(issue.createdAt)}</Text>
          </View>
          
          {showUpvote && (
            <TouchableOpacity 
              style={styles.upvoteButton} 
              onPress={() => onUpvote && onUpvote(issue.id)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={issue.upvotes?.length > 0 ? "heart" : "heart-outline"} 
                size={18} 
                color={issue.upvotes?.length > 0 ? colors.danger : colors.text} 
              />
              <Text style={styles.upvoteCount}>{issue.upvotes?.length || 0}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colors.lightGray,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  upvoteCount: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
});

export default IssueCard;

