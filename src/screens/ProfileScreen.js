import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Linking } from 'react-native';

const FULL_NAME = 'Daelen Vandekerckhove';
const ROLE = 'Student Graduaat Programmeren';
const BIO = 'FilmFinder examenopdracht (Tabs + Stack, FlashList, TMDB API).';
const EMAIL = 'jouw.email@example.com';

export default function ProfileScreen() {
  useEffect(() => {
    console.log('[ProfileScreen] mount');
    return () => console.log('[ProfileScreen] unmount');
  }, []);

  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://placehold.co/128x128?text=DV' }} style={styles.avatar} />
      <Text style={styles.name}>{FULL_NAME}</Text>
      <Text style={styles.role}>{ROLE}</Text>
      <Text style={styles.bio}>{BIO}</Text>
      <Text style={styles.link} onPress={() => Linking.openURL(`mailto:${EMAIL}`)}>{EMAIL}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  avatar: { width: 128, height: 128, borderRadius: 64, marginBottom: 12, backgroundColor: '#eee' },
  name: { fontSize: 20, fontWeight: '800' },
  role: { color: '#666', marginBottom: 10 },
  bio: { textAlign: 'center', marginBottom: 8 },
  link: { color: '#0a7', textDecorationLine: 'underline' },
});
