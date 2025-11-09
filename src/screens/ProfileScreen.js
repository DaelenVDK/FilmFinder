// src/screens/ProfileScreen.js
import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Linking, ScrollView, Pressable } from 'react-native';

const FULL_NAME   = 'Daelen Vandekerckhove';
const ROLE        = 'Student Graduaat Programmeren';
const BIO         = 'FilmFinder is mijn examenapp. Tabs + Stack, FlashList, zoeken/sorteren en TMDB API.';
const EMAIL       = 'Vandekerckhove.daelen@gmail.com';
const AVATAR = require('../../assets/Profile.jpg');

export default function ProfileScreen() {
  useEffect(() => {
    console.log('[ProfileScreen] mount');
    return () => console.log('[ProfileScreen] unmount');
  }, []);

  const handleMail = () => Linking.openURL(`mailto:${EMAIL}`);

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Profiel</Text>
        <Text style={styles.bannerSub}>FilmFinder</Text>
      </View>

      {/* Overlappende header-card */}
      <View style={styles.headerCard}>
        <View style={styles.avatarWrap}>
            <Image
            source={AVATAR}
            style={styles.avatar}
            resizeMode="cover"
            />
        </View>


        <View style={{ marginTop: 56 }}>
          <Text style={styles.name}>{FULL_NAME}</Text>
          <Text style={styles.role}>{ROLE}</Text>
          <Text style={styles.bio}>{BIO}</Text>
        </View>

        <View style={styles.infoGrid}>
          <InfoRow label="E-mail" value={EMAIL} onPress={handleMail} isLink />
          <InfoRow label="Project" value="ExamenOpdrachtDaelenVandekerckhove — FilmFinder" />
          <InfoRow label="Focus" value="Films, zoeken/sorteren, API, RN navigatie" />
        </View>

        <Pressable style={styles.cta} onPress={handleMail}>
          <Text style={styles.ctaText}>Contacteer</Text>
        </Pressable>
      </View>

      {/* Kleine “about” sectie */}
      <View style={styles.section}>
        <Text style={styles.h}>Over deze app</Text>
        <Text style={styles.p}>
          FilmFinder toont populaire films via de TMDB-API. In de Home-tab kun je zoeken, sorteren en
          doorklikken naar detail. Deze Profiel-tab bevat statische gegevens volgens de examenrichtlijnen.
        </Text>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value, onPress, isLink }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, isLink && styles.link]} numberOfLines={1}>
        {value}
      </Text>
    </Pressable>
  );
}

const CARD_RADIUS = 16;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f6f7fb' },

  // Banner (simpele kleurvlakken, geen libs)
  banner: {
    height: 160,
    backgroundColor: '#0a84ff',
    paddingHorizontal: 20,
    paddingTop: 36,
    justifyContent: 'center',
  },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  bannerSub:   { color: '#e7f1ff', fontSize: 14, marginTop: 4 },

  // Card die “over” de banner valt
  headerCard: {
    marginHorizontal: 16,
    marginTop: -40,
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  avatarWrap: {
    position: 'absolute',
    top: -40,
    left: 16,
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 2,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 40, backgroundColor: '#eee' },

  name: { fontSize: 20, fontWeight: '800' },
  role: { color: '#6b7280', marginTop: 2 },
  bio:  { color: '#242424', marginTop: 8, lineHeight: 20 },

  infoGrid: {
    marginTop: 16,
    borderTopWidth: 1, borderTopColor: '#efefef',
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f2f2f2',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    gap: 12,
  },
  rowLabel: { color: '#6b7280', width: 110 },
  rowValue: { color: '#111827', flex: 1, textAlign: 'right' },
  link:     { color: '#0a84ff', textDecorationLine: 'underline' },

  cta: {
    marginTop: 16,
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '700' },

  section: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    padding: 16,
    borderWidth: 1, borderColor: '#f1f1f1',
  },
  h: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  p: { color: '#222', lineHeight: 20 },
});
