import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { api } from '../services/api';
import MapMarker from '../components/MapMarker';
import IssueCard from '../components/IssueCard';
import { colors } from '../constants/colors';

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const data = await api.getIssues();
        setIssues(data);
      } catch (e) {
        // silent for now
      }
    };
    loadIssues();
  }, []);

  const handleMarkerPress = (issue) => {
    setSelectedIssue(issue);
    setModalVisible(true);
  };

  // Calculate distance between two coordinates using Haversine formula
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate nearby issues using useMemo for performance
  const nearbyIssues = useMemo(() => {
    if (!location) return [];
    
    return issues
      .filter(issue => {
        if (!issue.location) return false;
        const distance = getDistance(
          location.latitude,
          location.longitude,
          issue.location.lat,
          issue.location.lng
        );
        return distance < 5; // Within 5km
      })
      .slice(0, 10);
  }, [issues, location]);

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {location && (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={location}
            showsUserLocation
            showsMyLocationButton
          >
            {issues.map(issue => (
              <MapMarker
                key={issue._id || issue.id}
                issue={issue}
                onPress={() => handleMarkerPress(issue)}
              />
            ))}
          </MapView>
        )}
      </View>

      <View style={styles.feedContainer}>
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>Nearby Issues</Text>

        </View>
        <FlatList
          data={nearbyIssues}
          keyExtractor={(item) => item._id || item.id}
          renderItem={({ item }) => (
            <IssueCard
              issue={item}
              onPress={() => navigation.navigate('IssueDetail', { issue: item })}
              showUpvote={true}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.feedList}
        />
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {selectedIssue && (
                <>
                  <Text style={styles.modalTitle}>{selectedIssue.title}</Text>
                  <Text style={styles.modalCategory}>{selectedIssue.category}</Text>
                  <Text style={styles.modalDescription}>{selectedIssue.description}</Text>
                  <Text style={styles.modalStatus}>
                    Status: {selectedIssue.status === 'inProgress' ? 'In Progress' :
                      selectedIssue.status === 'resolved' ? 'Resolved' : 'Pending'}
                  </Text>
                </>
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    height: '50%',
  },
  map: {
    flex: 1,
  },
  feedContainer: {
    flex: 1,
    padding: 16,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  feedList: {
    paddingRight: 16,
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
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  modalCategory: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 24,
  },
  modalStatus: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  closeButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;

