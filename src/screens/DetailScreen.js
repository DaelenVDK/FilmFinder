import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';

const TMDB_KEY = '3e7c1ad02e5fbb59e17cf46ef830821a';
const MOVIE = (id) =>
  `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&language=nl-BE`;
const IMG = {
  poster: (path) => `https://image.tmdb.org/t/p/w342${path}`,
  backdrop: (path) => `https://image.tmdb.org/t/p/w1280${path}`,
};

const SCREEN_W = Dimensions.get('window').width;
// 16:9 container zodat we NIET croppen en volledig beeld tonen (contain)
const BANNER_H = Math.round((SCREEN_W * 9) / 16);

export default function DetailScreen({ route }) {
  const { id } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
    };
  }, [id]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.meta}>Loading…</Text>
      </View>
    );
  if (error)
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  if (!data)
    return (
      <View style={styles.center}>
        <Text style={styles.meta}>No data.</Text>
      </View>
    );

  const score = Number(data.vote_average || 0).toFixed(1);
  const year = data.release_date?.slice(0, 4) || '—';
  const backdrop = data.backdrop_path || data.poster_path || null;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      {/* Banner */}
      <View style={styles.bannerBox}>
        {backdrop ? (
          <Image
            source={{
              uri: data.backdrop_path ? IMG.backdrop(backdrop) : IMG.poster(backdrop),
            }}
            style={styles.bannerImg}
            resizeMode="contain" // belangrijk: niet croppen
          />
        ) : (
          <View style={[styles.bannerImg, { backgroundColor: '#111' }]} />
        )}
      </View>

      {/* Header card */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          {data.poster_path ? (
            <Image source={{ uri: IMG.poster(data.poster_path) }} style={styles.poster} />
          ) : (
            <View style={[styles.poster, { backgroundColor: '#eee' }]} />
          )}

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{data.title}</Text>
            <Text style={styles.kicker}>
              {year} • <Text style={styles.badgeScore}>Score {score}</Text>
            </Text>

            {/* Genres as chips */}
            <View style={styles.chipsWrap}>
              {Array.isArray(data.genres) && data.genres.length ? (
                data.genres.map((g) => (
                  <View key={g.id} style={styles.chip}>
                    <Text style={styles.chipText}>{g.name}</Text>
                  </View>
                ))
              ) : (
                <View style={[styles.chip, { opacity: 0.5 }]}>
                  <Text style={styles.chipText}>Geen genres</Text>
                </View>
              )}
            </View>

            {/* Meta grid */}
            <View style={styles.metaRow}>
              <View style={styles.metaCell}>
                <Text style={styles.metaLabel}>Speelduur</Text>
                <Text style={styles.metaValue}>
                  {data.runtime ? `${data.runtime} min` : '—'}
                </Text>
              </View>
              <View style={styles.metaCell}>
                <Text style={styles.metaLabel}>Taal</Text>
                <Text style={styles.metaValue}>
                  {data.original_language?.toUpperCase() || '—'}
                </Text>
              </View>
              <View style={styles.metaCell}>
                <Text style={styles.metaLabel}>Populariteit</Text>
                <Text style={styles.metaValue}>
                  {Number(data.popularity || 0).toFixed(0)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Omschrijving card */}
      {data.overview ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Omschrijving</Text>
          <Text style={styles.body}>{data.overview}</Text>
        </View>
      ) : null}

      {/* Extra info card (optioneel, blijft leeg als geen data) */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Extra</Text>
        <View style={styles.extraList}>
          <InfoRow label="Originele titel" value={data.original_title || '—'} />
          <InfoRow label="Budget" value={formatMoney(data.budget)} />
          <InfoRow label="Opbrengst" value={formatMoney(data.revenue)} />
          <InfoRow label="Status" value={data.status || '—'} />
        </View>
      </View>
    </ScrollView>
  );
}

/** Kleine helper voor nette rijtjes */
function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function formatMoney(n) {
  const v = Number(n || 0);
  if (!v) return '—';
  try {
    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(v);
  } catch {
    return `$${v.toLocaleString('en-US')}`;
  }
}

const styles = StyleSheet.create({
  // scherm & basis
  screen: {
    padding: 16,
    backgroundColor: '#F6F7FB',
    gap: 14,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F6F7FB',
  },
  error: { color: '#D00', fontWeight: '600' },
  meta: { color: '#667085', marginTop: 8 },

  // banner
  bannerBox: {
    width: '100%',
    height: BANNER_H,
    backgroundColor: '#0B1220',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#0B1220',
  },
  bannerImg: {
    width: '100%',
    height: '100%', // i.c.m. contain toont de hele afbeelding
  },

  // cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF5',
    // zachte schaduw (iOS/Android)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  // header
  headerRow: { flexDirection: 'row', gap: 14 },
  poster: {
    width: 112,
    height: 168,
    borderRadius: 10,
    marginRight: 6,
    backgroundColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#0B1220', marginBottom: 4 },
  kicker: { color: '#667085', marginBottom: 10 },
  badgeScore: {
    color: '#0B1220',
    fontWeight: '700',
  },

  // chips (genres)
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: '#F1F5FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  chipText: { color: '#1D4ED8', fontWeight: '600' },

  // meta grid
  metaRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F7',
    paddingTop: 12,
    gap: 12,
  },
  metaCell: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F0F2F7',
    borderRadius: 12,
    backgroundColor: '#FAFBFF',
  },
  metaLabel: {
    fontSize: 12,
    color: '#8A94A6',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metaValue: { fontSize: 16, fontWeight: '700', color: '#0B1220' },

  // secties
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1220',
    marginBottom: 8,
  },
  body: {
    color: '#384152',
    lineHeight: 20,
  },

  // extra info lijst
  extraList: { gap: 8, marginTop: 2 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
  },
  infoLabel: { color: '#8A94A6' },
  infoValue: { color: '#0B1220', fontWeight: '600' },
});
