// src/screens/Homescreen.js
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Image,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';

const TMDB_KEY = '3e7c1ad02e5fbb59e17cf46ef830821a';
const API_URL = `https://api.themoviedb.org/3/movie/popular?language=nl-BE&page=1&api_key=${TMDB_KEY}`;
const GENRE_URL = `https://api.themoviedb.org/3/genre/movie/list?language=nl-BE&api_key=${TMDB_KEY}`;
const IMG = {
  thumb: (p) => `https://image.tmdb.org/t/p/w154${p}`,
};

const SORTS = {
  TITLE_ASC: { key: 'TITLE_ASC', label: 'A→Z' },
  TITLE_DESC: { key: 'TITLE_DESC', label: 'Z→A' },
  SCORE_ASC: { key: 'SCORE_ASC', label: 'Score ↑' },
  SCORE_DESC: { key: 'SCORE_DESC', label: 'Score ↓' },
  YEAR_ASC: { key: 'YEAR_ASC', label: 'Jaar ↑' },
  YEAR_DESC: { key: 'YEAR_DESC', label: 'Jaar ↓' },
};

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState(SORTS.TITLE_ASC.key);
  const [filterText, setFilterText] = useState('');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [genresMap, setGenresMap] = useState({});

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [genresRes, moviesRes] = await Promise.all([fetch(GENRE_URL), fetch(API_URL)]);
        if (!genresRes.ok || !moviesRes.ok) throw new Error('Network error');

        const genresJson = await genresRes.json();
        const moviesJson = await moviesRes.json();

        if (!alive) return;

        const map = {};
        (genresJson.genres || []).forEach(g => { map[g.id] = g.name; });
        setGenresMap(map);

        const enriched = (moviesJson.results || []).map(m => ({
          ...m,
          genre_names: (m.genre_ids || []).map(id => map[id]).filter(Boolean),
        }));

        setData(enriched);
      } catch (e) {
        if (alive) setError(e.message || 'Unknown error');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const f = filterText.trim().toLowerCase();

    return (data || []).filter((m) => {
      const pool = `${m.title ?? ''} ${m.overview ?? ''} ${(m.genre_names || []).join(' ')}`.toLowerCase();
      const okQuery = !q || pool.includes(q);
      const okExtra = !f || pool.includes(f);
      return okQuery && okExtra;
    });
  }, [data, query, filterText]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sortKey) {
      case SORTS.TITLE_DESC.key:
        list.sort((a, b) => (b.title ?? '').localeCompare(a.title ?? ''));
        break;
      case SORTS.SCORE_ASC.key:
        list.sort((a, b) => (a.vote_average ?? 0) - (b.vote_average ?? 0));
        break;
      case SORTS.SCORE_DESC.key:
        list.sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
        break;
      case SORTS.YEAR_ASC.key:
        list.sort(
          (a, b) =>
            (parseInt((a.release_date || '0').slice(0, 4)) || 0) -
            (parseInt((b.release_date || '0').slice(0, 4)) || 0)
        );
        break;
      case SORTS.YEAR_DESC.key:
        list.sort(
          (a, b) =>
            (parseInt((b.release_date || '0').slice(0, 4)) || 0) -
            (parseInt((a.release_date || '0').slice(0, 4)) || 0)
        );
        break;
      case SORTS.TITLE_ASC.key:
      default:
        list.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
    }
    return list;
  }, [filtered, sortKey]);

  const keyExtractor = useCallback((item) => String(item.id), []);

  const renderItem = useCallback(
    ({ item }) => {
      const year = (item.release_date || '').slice(0, 4) || '—';
      const score = Number(item.vote_average ?? 0).toFixed(1);
      const genres = (item.genre_names || []).join(' • ');
      return (
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('Detail', { id: item.id, title: item.title })}
        >
          {item.poster_path ? (
            <Image source={{ uri: IMG.thumb(item.poster_path) }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]} />
          )}

          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{score}</Text>
              </View>
            </View>
            <Text style={styles.meta}>{year}{genres ? `  •  ${genres}` : ''}</Text>
            <Text numberOfLines={2} style={styles.desc}>
              {item.overview || '—'}
            </Text>
          </View>
        </Pressable>
      );
    },
    [navigation]
  );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.meta}>Laden…</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );

  return (
    <View style={styles.screen}>
      <HeaderControls
        query={query}
        setQuery={setQuery}
        sortKey={sortKey}
        setSortKey={setSortKey}
        filterText={filterText}
        setFilterText={setFilterText}
      />

      <FlashList
        data={sorted}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        estimatedItemSize={110}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        removeClippedSubviews={false}
      />
    </View>
  );
}

const HeaderControls = React.memo(function HeaderControls({
  query,
  setQuery,
  sortKey,
  setSortKey,
  filterText,
  setFilterText,
}) {
  return (
    <View style={styles.headerCard}>
      <Text style={styles.bigTitle}>FilmFinder</Text>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔎</Text>
        <TextInput
          placeholder="Zoek op titel of omschrijving…"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          placeholderTextColor="#9aa0a6"
          blurOnSubmit={false}
        />
      </View>

      <View style={styles.chipsRow}>
        <Chip label="A→Z" active={sortKey === 'TITLE_ASC'} onPress={() => setSortKey('TITLE_ASC')} />
        <Chip label="Z→A" active={sortKey === 'TITLE_DESC'} onPress={() => setSortKey('TITLE_DESC')} />
        <Chip label="Score ↓" active={sortKey === 'SCORE_DESC'} onPress={() => setSortKey('SCORE_DESC')} />
        <Chip label="Score ↑" active={sortKey === 'SCORE_ASC'} onPress={() => setSortKey('SCORE_ASC')} />
        <Chip label="Jaar ↑" active={sortKey === 'YEAR_ASC'} onPress={() => setSortKey('YEAR_ASC')} />
        <Chip label="Jaar ↓" active={sortKey === 'YEAR_DESC'} onPress={() => setSortKey('YEAR_DESC')} />
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🎬</Text>
        <TextInput
          placeholder="Filter op genre (bv. actie, komedie, horror)…"
          value={filterText}
          onChangeText={setFilterText}
          style={styles.searchInput}
          placeholderTextColor="#9aa0a6"
          blurOnSubmit={false}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
});

function Chip({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  headerCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
    gap: 12,
  },
  bigTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  searchWrap: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    paddingLeft: 40,
    paddingRight: 12,
    height: 44,
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  searchInput: {
    fontSize: 15,
    color: '#111827',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  chipActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  chipText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 12,
  },
  chipTextActive: {
    color: 'white',
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eef0f3',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  thumb: {
    width: 70,
    height: 105,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginRight: 8,
  },
  badge: {
    minWidth: 38,
    height: 22,
    borderRadius: 999,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
  },
  meta: {
    color: '#6b7280',
    marginTop: 2,
    marginBottom: 4,
  },
  desc: {
    color: '#374151',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: 'red' },
});
