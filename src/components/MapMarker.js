import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { categoryColors, statusColors } from '../constants/colors';

const MapMarker = ({ issue, onPress }) => {
  const getCategoryColor = (category) => {
    return categoryColors[category] || categoryColors.Other;
  };

  const getStatusColor = (status) => {
    return statusColors[status] || statusColors.pending;
  };

  return (
    <Marker
      coordinate={{
        latitude: issue.location.lat,
        longitude: issue.location.lng,
      }}
      onPress={onPress}
      title={issue.title}
      description={issue.category}
    >
      <View style={[styles.marker, { backgroundColor: getCategoryColor(issue.category) }]}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(issue.status) }]} />
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default MapMarker;

