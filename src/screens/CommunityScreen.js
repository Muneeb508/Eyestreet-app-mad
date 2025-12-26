import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';
import { colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const CommunityScreen = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [postCity, setPostCity] = useState(''); // City for new post
  const [showPostInput, setShowPostInput] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editCity, setEditCity] = useState('');
  const [loading, setLoading] = useState(false);

  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta'];
  const filterCities = ['All', ...cities];

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getCommunityPosts(selectedCity);
        setPosts(data);
      } catch (e) {
        // ignore
      }
    };
    load();
  }, [selectedCity]);

  const handlePost = async () => {
    if (!newPost.trim() || !user || !postCity) {
      alert('Please fill in the post content and select a city');
      return;
    }

    try {
      await api.createCommunityPost({
        userId: user.id,
        userName: user.name || 'Anonymous',
        content: newPost.trim(),
        city: postCity,
      });
      const data = await api.getCommunityPosts(selectedCity);
      setPosts(data);
      setNewPost('');
      setPostCity('');
      setShowPostInput(false);
    } catch (error) {
      console.error('Error posting:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleLike = async (postId) => {
    if (!user) return;

    try {
      await api.likeCommunityPost(postId, user.id);
      const data = await api.getCommunityPosts(selectedCity);
      setPosts(data);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setEditContent(post.content);
    setEditCity(post.city || '');
  };

  const handleUpdatePost = async () => {
    if (!editContent.trim() || !editCity || !editingPost || !user) {
      alert('Please fill in the post content and select a city');
      return;
    }

    try {
      setLoading(true);
      await api.updateCommunityPost(editingPost._id || editingPost.id, {
        userId: user.id,
        content: editContent.trim(),
        city: editCity,
      });
      const data = await api.getCommunityPosts(selectedCity);
      setPosts(data);
      setEditingPost(null);
      setEditContent('');
      setEditCity('');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (post) => {
    if (!user) return;

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.deleteCommunityPost(post._id || post.id, user.id);
              const data = await api.getCommunityPosts(selectedCity);
              setPosts(data);
            } catch (error) {
              console.error('Error deleting post:', error);
              alert('Failed to delete post. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const isPostOwner = (post) => {
    if (!user || !post) return false;
    return post.userId === user.id || post.userId?._id === user.id || post.userId?.toString() === user.id;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <TouchableOpacity
          style={styles.postButton}
          onPress={() => setShowPostInput(!showPostInput)}
        >
          <Ionicons name="create-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {showPostInput && (
        <View style={styles.postInputContainer}>
          <Text style={styles.label}>Select City *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.citySelectorList}
            style={styles.citySelectorScroll}
          >
            {cities.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.citySelectButton,
                  postCity === item && styles.citySelectButtonActive,
                ]}
                onPress={() => {
                  console.log('City selected:', item);
                  setPostCity(item);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.citySelectButtonText,
                    postCity === item && styles.citySelectButtonTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.label}>Post Content *</Text>
          <TextInput
            style={styles.postInput}
            placeholder="Share your thoughts or report a local problem..."
            value={newPost}
            onChangeText={setNewPost}
            multiline
            numberOfLines={3}
          />
          <View style={styles.postInputActions}>
            <TouchableOpacity onPress={() => {
              setShowPostInput(false);
              setNewPost('');
              setPostCity('');
            }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <CustomButton
              title="Post"
              onPress={handlePost}
              disabled={!newPost.trim() || !postCity}
              style={styles.postSubmitButton}
            />
          </View>
        </View>
      )}

      <View style={styles.cityFilter}>
        <FlatList
          data={filterCities}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.cityButton,
                selectedCity === item && styles.cityButtonActive,
              ]}
              onPress={() => setSelectedCity(item)}
            >
              <Text
                style={[
                  styles.cityButtonText,
                  selectedCity === item && styles.cityButtonTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.cityFilterList}
        />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.postUserInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.userName?.charAt(0).toUpperCase() || 'A'}
                  </Text>
                </View>
                <View style={styles.postUserInfoContent}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName}>{item.userName || 'Anonymous'}</Text>
                    {item.city && (
                      <View style={styles.cityBadge}>
                        <Ionicons name="location" size={12} color={colors.primary} />
                        <Text style={styles.cityBadgeText}>{item.city}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.postTime}>{formatDate(item.createdAt)}</Text>
                </View>
              </View>
              {isPostOwner(item) && (
                <View style={styles.postActionsMenu}>
                  <TouchableOpacity
                    style={styles.actionMenuButton}
                    onPress={() => handleEdit(item)}
                  >
                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionMenuButton}
                    onPress={() => handleDelete(item)}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <Text style={styles.postContent}>{item.content}</Text>
            <View style={styles.postActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleLike(item._id || item.id)}
              >
                <Ionicons
                  name={item.likes?.includes(user?.id) ? 'heart' : 'heart-outline'}
                  size={20}
                  color={item.likes?.includes(user?.id) ? colors.danger : colors.text}
                />
                <Text style={styles.actionText}>{item.likes?.length || 0}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share something!</Text>
          </View>
        }
      />

      {/* Edit Post Modal */}
      <Modal
        visible={editingPost !== null}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setEditingPost(null);
          setEditContent('');
          setEditCity('');
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Post</Text>
              <TouchableOpacity
                onPress={() => {
                  setEditingPost(null);
                  setEditContent('');
                  setEditCity('');
                }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Select City *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.citySelectorList}
              style={styles.citySelectorScroll}
            >
              {cities.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.citySelectButton,
                    editCity === item && styles.citySelectButtonActive,
                  ]}
                  onPress={() => setEditCity(item)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.citySelectButtonText,
                      editCity === item && styles.citySelectButtonTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Post Content *</Text>
            <TextInput
              style={styles.postInput}
              placeholder="Share your thoughts or report a local problem..."
              value={editContent}
              onChangeText={setEditContent}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <CustomButton
                title="Cancel"
                onPress={() => {
                  setEditingPost(null);
                  setEditContent('');
                  setEditCity('');
                }}
                variant="secondary"
                style={styles.modalButton}
              />
              <CustomButton
                title="Update"
                onPress={handleUpdatePost}
                disabled={!editContent.trim() || !editCity || loading}
                loading={loading}
                style={styles.modalButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  postButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postInputContainer: {
    backgroundColor: colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  citySelectorScroll: {
    marginBottom: 16,
  },
  citySelectorList: {
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  citySelectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  citySelectButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  citySelectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  citySelectButtonTextActive: {
    color: colors.white,
  },
  postInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  postInputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  cancelText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  postSubmitButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cityFilter: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  cityFilterList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    marginRight: 8,
  },
  cityButtonActive: {
    backgroundColor: colors.primary,
  },
  cityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  cityButtonTextActive: {
    color: colors.white,
  },
  list: {
    padding: 16,
  },
  postCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postUserInfoContent: {
    flex: 1,
  },
  postActionsMenu: {
    flexDirection: 'row',
    gap: 8,
  },
  actionMenuButton: {
    padding: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  cityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  postTime: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
  },
  postContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
  },
});

export default CommunityScreen;

