import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Image, Dimensions } from 'react-native';

const TMDB_KEY = '3e7c1ad02e5fbb59e17cf46ef830821a';
const MOVIE = (id) => `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&language=nl-BE`;
const IMG = {
  poster: (path) => `https://image.tmdb.org/t/p/w342${path}`,
  backdrop: (path) => `https://image.tmdb.org/t/p/w1280${path}`,
};

const SCREEN_W = Dimensions.get('window').width;
const BANNER_H = Math.round((SCREEN_W * 9) / 16); // 16:9, met contain

export default function DetailScreen({ route }) {
  const { id } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[DetailScreen] mount id=', id);
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(MOVIE(id));
        if (!res.ok) throw new Error('Network error');
        const json = await res.json();
        if (alive) setData(json);
      } catch (e) {
        if (alive) setError(e.message || 'Unknown error');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
      console.log('[DetailScreen] unmount');
    };
  }, [id]);

  if (loading) return (<View style={styles.center}><ActivityIndicator size="large" /><Text>Loading…</Text></View>);
  if (error) return (<View style={styles.center}><Text style={styles.error}>Error: {error}</Text></View>);
  if (!data) return (<View style={styles.center}><Text>No data.</Text></View>);

  const score = Number(data.vote_average || 0).toFixed(1);
  const year = data.release_date?.slice(0, 4) || '—';
  const backdrop = data.backdrop_path || data.poster_path || null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.bannerBox}>
        {backdrop ? (
          <Image
            source={{ uri: data.backdrop_path ? IMG.backdrop(backdrop) : IMG.poster(backdrop) }}
            style={styles.bannerImg}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.bannerImg, { backgroundColor: '#111' }]} />
        )}
      </View>

      <View style={styles.headerRow}>
        {data.poster_path ? (
          <Image source={{ uri: IMG.poster(data.poster_path) }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, { backgroundColor: '#eee' }]} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.meta}>{year} • Score: {score}</Text>

          <Text style={styles.h}>Genres</Text>
          <Text style={styles.p}>
            {Array.isArray(data.genres) && data.genres.length
              ? data.genres.map(g => g.name).join(', ')
              : '—'}
          </Text>

          <Text style={styles.h}>Speelduur</Text>
          <Text style={styles.p}>{data.runtime ? `${data.runtime} min` : '—'}</Text>
        </View>
      </View>

      {data.overview ? (
        <>
          <Text style={styles.h}>Omschrijving</Text>
          <Text style={styles.p}>{data.overview}</Text>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: 'red' },

  bannerBox: {
    width: '100%',
    height: BANNER_H,
    backgroundColor: '#000', // zwarte balken wanneer nodig
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  bannerImg: {
    width: '100%',
    height: '100%', // samen met contain: volledige afbeelding zichtbaar
  },

  headerRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  poster: { width: 110, height: 165, borderRadius: 8 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  meta: { color: '#444', marginBottom: 12 },
  h: { marginTop: 10, fontWeight: '700' },
  p: { color: '#222' },
});
