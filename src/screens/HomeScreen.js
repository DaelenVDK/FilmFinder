import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';

const TMDB_KEY = '3e7c1ad02e5fbb59e17cf46ef830821a';
const POPULAR = `https://api.themoviedb.org/3/movie/popular?language=nl-BE&page=1&api_key=${TMDB_KEY}`;

const SORTS = {
  TITLE_ASC: { key: 'TITLE_ASC', label: 'Title A→Z' },
  TITLE_DESC: { key: 'TITLE_DESC', label: 'Title Z→A' },
  SCORE_ASC: { key: 'SCORE_ASC', label: 'Score ↑' },
  SCORE_DESC: { key: 'SCORE_DESC', label: 'Score ↓' },
  YEAR_ASC: { key: 'YEAR_ASC', label: 'Year ↑' },
  YEAR_DESC: { key: 'YEAR_DESC', label: 'Year ↓' },
};

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState(SORTS.TITLE_ASC.key);
  const [genreFilter, setGenreFilter] = useState('');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[HomeScreen] mount');
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(POPULAR);
        if (!res.ok) throw new Error('Network error');
        const json = await res.json();
        if (alive) setData(Array.isArray(json.results) ? json.results : []);
      } catch (e) {
        if (alive) setError(e.message || 'Unknown error');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
      console.log('[HomeScreen] unmount');
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const gf = genreFilter.trim().toLowerCase();
    return data.filter((m) => {
      const text = `${m.title ?? ''} ${m.overview ?? ''}`.toLowerCase();
      const matchesQuery = !q || text.includes(q);
      // simpele “genre” check via overview/title (TMDB popular bevat geen genre-namen standaard)
      const matchesGenre = !gf || text.includes(gf);
      return matchesQuery && matchesGenre;
    });
  }, [data, query, genreFilter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sortKey) {
      case SORTS.TITLE_DESC.key:
        list.sort((a, b) => (b.title ?? '').localeCompare(a.title ?? ''));
        break;
      case SORTS.SCORE_ASC.key:
        list.sort((a, b) => (Number(a.vote_average) || 0) - (Number(b.vote_average) || 0));
        break;
      case SORTS.SCORE_DESC.key:
        list.sort((a, b) => (Number(b.vote_average) || 0) - (Number(a.vote_average) || 0));
        break;
      case SORTS.YEAR_ASC.key:
        list.sort(
          (a, b) =>
            (parseInt((a.release_date || '').slice(0, 4)) || 0) -
            (parseInt((b.release_date || '').slice(0, 4)) || 0),
        );
        break;
      case SORTS.YEAR_DESC.key:
        list.sort(
          (a, b) =>
            (parseInt((b.release_date || '').slice(0, 4)) || 0) -
            (parseInt((a.release_date || '').slice(0, 4)) || 0),
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
    ({ item }) => (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate('Detail', { id: item.id, title: item.title })}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>
          {(item.release_date || '').slice(0, 4) || '—'} • score: {(Number(item.vote_average) || 0).toFixed(1)}
        </Text>
        <Text numberOfLines={3} style={styles.desc}>
          {item.overview}
        </Text>
      </Pressable>
    ),
    [navigation],
  );

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

  return (
    <View style={styles.container}>
      <HeaderControls
        query={query}
        setQuery={setQuery}
        sortKey={sortKey}
        setSortKey={setSortKey}
        genreFilter={genreFilter}
        setGenreFilter={setGenreFilter}
      />

      <FlashList
        data={sorted}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        estimatedItemSize={120}
        contentContainerStyle={{ padding: 12 }}
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
  genreFilter,
  setGenreFilter,
}) {
  return (
    <View style={styles.header}>
      <TextInput
        placeholder="Zoek op titel/omschrijving…"
        value={query}
        onChangeText={setQuery}
        style={styles.input}
        blurOnSubmit={false}
      />
      <View style={styles.row}>
        <Pressable
          style={[styles.pill, sortKey === 'TITLE_ASC' && styles.pillActive]}
          onPress={() => setSortKey('TITLE_ASC')}
        >
          <Text style={styles.pillText}>A→Z</Text>
        </Pressable>
        <Pressable
          style={[styles.pill, sortKey === 'TITLE_DESC' && styles.pillActive]}
          onPress={() => setSortKey('TITLE_DESC')}
        >
          <Text style={styles.pillText}>Z→A</Text>
        </Pressable>
        <Pressable
          style={[styles.pill, sortKey === 'SCORE_DESC' && styles.pillActive]}
          onPress={() => setSortKey('SCORE_DESC')}
        >
          <Text style={styles.pillText}>Score ↓</Text>
        </Pressable>
        <Pressable
          style={[styles.pill, sortKey === 'SCORE_ASC' && styles.pillActive]}
          onPress={() => setSortKey('SCORE_ASC')}
        >
          <Text style={styles.pillText}>Score ↑</Text>
        </Pressable>
      </View>
      <TextInput
        placeholder="Filter (vb. ‘comedy’)…"
        value={genreFilter}
        onChangeText={setGenreFilter}
        style={styles.input}
        blurOnSubmit={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 12, gap: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 },
  row: { flexDirection: 'row', gap: 8 },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pillActive: { backgroundColor: '#f0f0f0' },
  pillText: { color: '#111' },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  meta: { color: '#444', marginBottom: 6 },
  desc: { color: '#333' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: 'red' },
});
