/**
 * Tela de Notícias — "jornal da manhã" do setor automotivo, com notícias
 * reais (APITube). Não exige login: qualquer pessoa pode abrir e ler.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useNavigation } from '../context/NavigationContext';
import { noticias as noticiasMock, Noticia } from '../mock/noticias';
import { fetchNoticias } from '../services/newsApi';

function formatarTempo(publicadoEm?: string): string | null {
  if (!publicadoEm) return null;
  const data = new Date(publicadoEm);
  if (isNaN(data.getTime())) return null;

  const diffMs = Date.now() - data.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `há ${Math.max(diffMin, 1)} min`;
  const diffHoras = Math.floor(diffMin / 60);
  if (diffHoras < 24) return `há ${diffHoras}h`;
  const diffDias = Math.floor(diffHoras / 24);
  if (diffDias === 1) return 'ontem';
  return `há ${diffDias} dias`;
}

export function NoticiasScreen() {
  const { openSidebar } = useNavigation();
  const [noticias, setNoticias] = useState<Noticia[]>(noticiasMock);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchNoticias().then((result) => {
      if (cancelled) return;
      if (result && result.length > 0) setNoticias(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function abrirNoticia(url?: string) {
    if (url) Linking.openURL(url).catch(() => {});
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notícias</Text>
          <Text style={styles.headerSubtitle}>O que rola no mercado automotivo hoje</Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={openSidebar}>
          <Feather name="menu" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={Colors.accent} />
            <Text style={styles.centerStateText}>Buscando as últimas notícias...</Text>
          </View>
        ) : noticias.length === 0 ? (
          <View style={styles.centerState}>
            <View style={styles.emptyIconCircle}>
              <Feather name="file-text" size={26} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Nenhuma novidade por enquanto</Text>
            <Text style={styles.emptyText}>Volta mais tarde pra ver as próximas notícias.</Text>
          </View>
        ) : (
          noticias.map((n, i) => (
            <TouchableOpacity
              key={n.id}
              style={[styles.card, i === 0 && styles.cardFirst]}
              activeOpacity={n.url ? 0.7 : 1}
              onPress={() => abrirNoticia(n.url)}
            >
              <View style={styles.cardMetaRow}>
                <Text style={styles.cardSource}>{n.fonte.toUpperCase()}</Text>
                {formatarTempo(n.publicadoEm) && (
                  <>
                    <Text style={styles.cardMetaDot}>·</Text>
                    <Text style={styles.cardTime}>{formatarTempo(n.publicadoEm)}</Text>
                  </>
                )}
              </View>
              <Text style={styles.cardTitle}>{n.titulo}</Text>
              {n.descricao && (
                <Text style={styles.cardDescription} numberOfLines={3}>
                  {n.descricao}
                </Text>
              )}
              {n.url && (
                <View style={styles.readMoreRow}>
                  <Text style={styles.readMoreLabel}>Ler matéria completa</Text>
                  <Feather name="external-link" size={12} color={Colors.accent} />
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 16,
    minHeight: 82,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 30,
    letterSpacing: -1,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  headerSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
    marginTop: 2,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: Colors.radiusPill,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Colors.radiusLg,
    padding: 16,
    gap: 8,
  },
  cardFirst: {
    borderColor: Colors.borderStrong,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardSource: {
    color: Colors.accent,
    fontSize: 10,
    fontFamily: 'Sora_700Bold',
    letterSpacing: 0.8,
  },
  cardMetaDot: {
    color: Colors.textHint,
    fontSize: 11,
  },
  cardTime: {
    color: Colors.textHint,
    fontSize: 11,
    fontFamily: 'Sora_400Regular',
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    lineHeight: 22,
  },
  cardDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Sora_400Regular',
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  readMoreLabel: {
    color: Colors.accent,
    fontSize: 12,
    fontFamily: 'Sora_600SemiBold',
  },
  centerState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  centerStateText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
    textAlign: 'center',
  },
});
