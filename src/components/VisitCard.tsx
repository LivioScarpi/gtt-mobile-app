import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarIcon, MapPinIcon } from './Icons';
import { Colors, Fonts, BorderRadius } from '../constants/theme';
import { useThemeColors } from '../store/ThemeContext';

interface VisitCardProps {
  doctorName: string;
  specialty: string;
  date: string;
  location: string;
  imageUri?: string;
  status?: 'future' | 'passed';
  onModify?: () => void;
  fullWidth?: boolean;
}

export default function VisitCard({
  doctorName,
  specialty,
  date,
  location,
  imageUri,
  status = 'future',
  onModify,
  fullWidth = false,
}: VisitCardProps) {
  const colors = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }, fullWidth && { width: '100%' }]}>
      <View style={styles.doctorRow}>
        <View style={styles.avatarContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {doctorName.charAt(0)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.doctorInfo}>
          <Text style={[styles.doctorName, { color: colors.textPrimary }]} numberOfLines={1}>
            {doctorName}
          </Text>
          <Text style={[styles.specialty, { color: colors.textPrimary }]} numberOfLines={1}>
            {specialty}
          </Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <CalendarIcon size={24} color={colors.textPrimary} />
          <Text style={[styles.detailText, { color: colors.textPrimary }]}>{date}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPinIcon size={24} color={colors.textPrimary} />
          <Text style={[styles.detailText, { color: colors.textPrimary }]}>{location}</Text>
        </View>
      </View>

      {status === 'future' && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onModify}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Modifica</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: 16,
    width: 306,
    gap: 17,
    overflow: 'hidden',
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 21.622,
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: Colors.primary,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontFamily: Fonts.semiBold,
    fontSize: 20,
    color: Colors.textPrimary,
    letterSpacing: -0.8,
  },
  specialty: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textPrimary,
    letterSpacing: -0.56,
  },
  detailsContainer: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textPrimary,
    letterSpacing: -0.64,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
    overflow: 'hidden',
  },
  buttonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 20,
    color: Colors.white,
    letterSpacing: -1.2,
    textAlign: 'center',
  },
});
