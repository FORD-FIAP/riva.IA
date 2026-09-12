/** Tela de busca e listagem de veículos — marca real da FIPE, em ordem alfabética */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { VeiculoResultCard } from '../components/veiculos/VeiculoResultCard';
import { VeiculoFicha } from '../components/veiculos/VeiculoFicha';
import { FilterChipRow, FilterChip, FilterLetterIndex } from '../components/shared/FilterChips';
import { Colors } from '../theme/colors';
import { getFipeBrands, getFipeModels, buildVehicleFromFipe, cacheVehicles, getCachedVehicle, FipeBrand } from '../services/fipeApi';
import { Vehicle } from '../types/vehicle';
import { useNavigation } from '../context/NavigationContext';

export function VeiculosScreen() {
  const { openSidebar, pendingVehicleId, clearPendingVehicle } = useNavigation();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [allBrands, setAllBrands] = useState<FipeBrand[]>([]);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (pendingVehicleId) {
      const vehicle = getCachedVehicle(pendingVehicleId) ?? null;
      setSelectedVehicle(vehicle);
      clearPendingVehicle();
    }
  }, [pendingVehicleId]);

  useEffect(() => {
    getFipeBrands().then((result) => {
      if (result) setAllBrands([...result].sort((a, b) => a.nome.localeCompare(b.nome)));
    });
  }, []);

  function selectLetter(letter: string) {
    setActiveLetter((prev) => (prev === letter ? null : letter));
  }

  function toggleBrand(nome: string) {
    setSelectedBrands((prev) => (prev.includes(nome) ? prev.filter((b) => b !== nome) : [...prev, nome]));
  }

  const availableLetters = [...new Set(allBrands.map((b) => b.nome[0]?.toUpperCase()).filter(Boolean))].sort();
  const visibleBrands = activeLetter ? allBrands.filter((b) => b.nome[0]?.toUpperCase() === activeLetter) : [];
  const showResults = selectedBrands.length > 0;

  // Busca os modelos reais das marcas selecionadas no alfabeto.
  useEffect(() => {
    if (!showResults) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const brands = await getFipeBrands();
      if (!brands) {
        if (!cancelled) {
          setResults([]);
          setLoading(false);
        }
        return;
      }

      const matchingBrands = brands.filter((b) => selectedBrands.includes(b.nome));
      const brandsToQuery = matchingBrands.slice(0, 6);

      const vehicleLists = await Promise.all(
        brandsToQuery.map(async (brand) => {
          const models = await getFipeModels(brand.valor);
          if (!models) return [];
          return models.slice(0, 30).map((m) => buildVehicleFromFipe(brand, m));
        }),
      );

      if (cancelled) return;
      const flat = vehicleLists.flat();
      cacheVehicles(flat);
      setResults(flat);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedBrands]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header desta tela */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Veículos</Text>
          <Text style={styles.headerSubtitle}>Busque pelos seus sonhos, aqui!</Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={openSidebar}>
          <Feather name="menu" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Marca em ordem alfabética — igual à tela de Comparar */}
      <View style={styles.inlineFilterBlock}>
        <FilterChipRow label="Marca">
          <FilterLetterIndex letters={availableLetters} active={activeLetter} onSelect={selectLetter} />
        </FilterChipRow>
        {activeLetter && (
          <View style={styles.brandWrap}>
            {visibleBrands.map((brand) => (
              <FilterChip
                key={brand.valor}
                label={brand.nome}
                active={selectedBrands.includes(brand.nome)}
                onPress={() => toggleBrand(brand.nome)}
              />
            ))}
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={!showResults ? styles.scrollEmptyContent : undefined}
        showsVerticalScrollIndicator={false}
      >
        {showResults ? (
          <View style={styles.resultsList}>
            {loading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator color={Colors.accent} />
                <Text style={styles.loadingText}>Buscando na tabela FIPE...</Text>
              </View>
            ) : results.length === 0 ? (
              <View style={styles.emptyResults}>
                <Text style={styles.emptyTitle}>Nenhum veículo encontrado</Text>
                <Text style={styles.emptySubtitle}>Tente ajustar os filtros ou a busca</Text>
              </View>
            ) : (
              results.map((vehicle) => (
                <VeiculoResultCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onPress={() => setSelectedVehicle(vehicle)}
                />
              ))
            )}
          </View>
        ) : (
          /* Empty state */
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="car-search-outline" size={32} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyStateTitle}>Comece sua busca</Text>
            <Text style={styles.emptyStateText}>
              Escolha uma letra do alfabeto e selecione a marca que procura.
            </Text>
          </View>
        )}
      </ScrollView>

      <VeiculoFicha
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
      />

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
  inlineFilterBlock: {
    paddingBottom: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  brandWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollEmptyContent: {
    flexGrow: 1,
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 20,
    paddingBottom: 40,
  },
  loadingState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },
  emptyResults: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
  emptySubtitle: {
    color: Colors.textHint,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyStateTitle: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  emptyStateText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Sora_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
});
