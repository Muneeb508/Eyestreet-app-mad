import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const EmergencyScreen = () => {
  const emergencyHotlines = [
    { name: 'Police', number: '15', icon: 'shield-outline', color: colors.primary },
    { name: 'Ambulance / Rescue', number: '1122', icon: 'medical-outline', color: colors.danger },
    { name: 'Fire Brigade', number: '16', icon: 'flame-outline', color: colors.danger },
    { name: 'Edhi', number: '115', icon: 'heart-outline', color: colors.danger },
    { name: 'Gas Emergency', number: '1199', icon: 'warning-outline', color: colors.warning },
    { name: 'K-Electric', number: '118', icon: 'flash-outline', color: colors.warning },
    { name: 'Citizen Portal', number: '1334', icon: 'call-outline', color: colors.info },
  ];

  const cityServices = [
    { name: 'Karachi Water & Sewerage Board', number: '1339' },
    { name: 'Lahore Waste Management', number: '1139' },
    { name: 'Islamabad Capital Territory', number: '051-111-222-111' },
    { name: 'Traffic Police Helpline', number: '1915' },
    { name: 'Complaint Cell', number: '1334' },
  ];

  const handleCall = (number) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      Alert.alert('Error', 'Unable to make call');
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency & Support</Text>
        <Text style={styles.subtitle}>Quick access to emergency services</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Hotlines</Text>
        {emergencyHotlines.map((hotline, index) => (
          <TouchableOpacity
            key={index}
            style={styles.hotlineCard}
            onPress={() => handleCall(hotline.number)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${hotline.color}20` }]}>
              <Ionicons name={hotline.icon} size={28} color={hotline.color} />
            </View>
            <View style={styles.hotlineInfo}>
              <Text style={styles.hotlineName}>{hotline.name}</Text>
              <Text style={styles.hotlineNumber}>{hotline.number}</Text>
            </View>
            <Ionicons name="call" size={24} color={colors.primary} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>City Services</Text>
        {cityServices.map((service, index) => (
          <TouchableOpacity
            key={index}
            style={styles.serviceCard}
            onPress={() => handleCall(service.number)}
            activeOpacity={0.7}
          >
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceNumber}>{service.number}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} opacity={0.5} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={24} color={colors.info} />
        <Text style={styles.infoText}>
          Tap any number to call directly. For non-emergency issues, use the Report Issue feature.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  hotlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  hotlineInfo: {
    flex: 1,
  },
  hotlineName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  hotlineNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  serviceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: `${colors.info}20`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});

export default EmergencyScreen;

