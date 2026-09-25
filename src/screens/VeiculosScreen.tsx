/** Tela de busca e listagem de veículos — marca real da FIPE (A-Z) ou categoria (catálogo curado) */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { VeiculoResultCard } from '../components/veiculos/VeiculoResultCard';
import { VeiculoFicha } from '../components/veiculos/VeiculoFicha';
import { FilterSheetHeader, FilterChipRow, FilterChip, FilterLetterIndex } from '../components/shared/FilterChips';
import { Colors } from '../theme/colors';
import { NATIVE_DRIVER } from '../utils/animation';
import { getFipeBrands, getFipeModels, buildVehicleFromFipe, cacheVehicles, getCachedVehicle, FipeBrand } from '../services/fipeApi';
import { Vehicle } from '../types/vehicle';
import { useNavigation } from '../context/NavigationContext';
import { CATEGORIAS, CategoriaVeiculo, MOCK_VEHICLES } from '../mock/mockVehicles';

export function VeiculosScreen() {
  const { openSidebar, pendingVehicleId, clearPendingVehicle } = useNavigation();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [allBrands, setAllBrands] = useState<FipeBrand[]>([]);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaVeiculo | null>(null);
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
    setSelectedCategoria(null);
    setActiveLetter((prev) => (prev === letter ? null : letter));
  }

  function toggleBrand(nome: string) {
    setSelectedCategoria(null);
    setSelectedBrands((prev) => (prev.includes(nome) ? prev.filter((b) => b !== nome) : [...prev, nome]));
  }

  function selectCategoria(categoria: CategoriaVeiculo) {
    setActiveLetter(null);
    setSelectedBrands([]);
    setSelectedCategoria((prev) => (prev === categoria ? null : categoria));
  }

  function limparFiltros() {
    setActiveLetter(null);
    setSelectedBrands([]);
    setSelectedCategoria(null);
  }

  const availableLetters = [...new Set(allBrands.map((b) => b.nome[0]?.toUpperCase()).filter(Boolean))].sort();
  const visibleBrands = activeLetter ? allBrands.filter((b) => b.nome[0]?.toUpperCase() === activeLetter) : [];
  const showResults = selectedBrands.length > 0 || selectedCategoria !== null;
  const temFiltrosAtivos = showResults;

  // Categoria: mostra só o catálogo curado (10 veículos com ficha completa).
  useEffect(() => {
    if (!selectedCategoria) return;
    setResults(MOCK_VEHICLES.filter((v) => v.categoria === selectedCategoria));
  }, [selectedCategoria]);

  // Marca: busca os modelos reais das marcas selecionadas no alfabeto (FIPE, ao vivo).
  useEffect(() => {
    if (selectedBrands.length === 0) {
      if (!selectedCategoria) setResults([]);
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
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.filterButton, temFiltrosAtivos && styles.filterButtonActive]}
            onPress={() => setFilterOpen(true)}
          >
            <Feather name="sliders" size={16} color={temFiltrosAtivos ? '#FFFFFF' : Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={openSidebar}>
            <Feather name="menu" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
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
              Toque no filtro pra escolher uma marca (A-Z, busca ao vivo na FIPE) ou
              uma categoria (veículos com ficha técnica completa).
            </Text>
          </View>
        )}
      </ScrollView>

      <FilterModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        temFiltrosAtivos={temFiltrosAtivos}
        onLimpar={limparFiltros}
        availableLetters={availableLetters}
        activeLetter={activeLetter}
        onSelectLetter={selectLetter}
        visibleBrands={visibleBrands}
        selectedBrands={selectedBrands}
        onToggleBrand={toggleBrand}
        selectedCategoria={selectedCategoria}
        onSelectCategoria={selectCategoria}
      />

      <VeiculoFicha
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
      />

    </SafeAreaView>
  );
}

// ─── Modal de filtro (Marca + Categoria) ──────────────────────────────────────

function FilterModal({
  visible,
  onClose,
  temFiltrosAtivos,
  onLimpar,
  availableLetters,
  activeLetter,
  onSelectLetter,
  visibleBrands,
  selectedBrands,
  onToggleBrand,
  selectedCategoria,
  onSelectCategoria,
}: {
  visible: boolean;
  onClose: () => void;
  temFiltrosAtivos: boolean;
  onLimpar: () => void;
  availableLetters: string[];
  activeLetter: string | null;
  onSelectLetter: (letter: string) => void;
  visibleBrands: FipeBrand[];
  selectedBrands: string[];
  onToggleBrand: (nome: string) => void;
  selectedCategoria: CategoriaVeiculo | null;
  onSelectCategoria: (categoria: CategoriaVeiculo) => void;
}) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: visible ? 0 : screenHeight,
        duration: 300,
        useNativeDriver: NATIVE_DRIVER,
      }),
      Animated.timing(backdropAnim, {
        toValue: visible ? 1 : 0,
        duration: 300,
        useNativeDriver: NATIVE_DRIVER,
      }),
    ]).start();
  }, [visible]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[modalStyles.backdrop, { opacity: backdropAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <Animated.View style={[modalStyles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <FilterSheetHeader
          title="Filtro"
          onClose={onClose}
          rightExtra={
            temFiltrosAtivos ? (
              <TouchableOpacity onPress={onLimpar}>
                <Text style={modalStyles.clearLabel}>Limpar</Text>
              </TouchableOpacity>
            ) : undefined
          }
        />

        <ScrollView showsVerticalScrollIndicator={false} style={modalStyles.scroll}>
          <FilterChipRow label="Marca (busca ao vivo na FIPE)">
            <FilterLetterIndex letters={availableLetters} active={activeLetter} onSelect={onSelectLetter} />
          </FilterChipRow>
          {activeLetter && (
            <View style={modalStyles.brandWrap}>
              {visibleBrands.map((brand) => (
                <FilterChip
                  key={brand.valor}
                  label={brand.nome}
                  active={selectedBrands.includes(brand.nome)}
                  onPress={() => onToggleBrand(brand.nome)}
                />
              ))}
            </View>
          )}

          <View style={modalStyles.divider} />

          <FilterChipRow label="Categoria (ficha técnica completa)">
            {CATEGORIAS.map((categoria) => (
              <FilterChip
                key={categoria}
                label={categoria}
                active={selectedCategoria === categoria}
                onPress={() => onSelectCategoria(categoria)}
              />
            ))}
          </FilterChipRow>

          <View style={{ height: 12 }} />
        </ScrollView>

        <View style={[modalStyles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={modalStyles.viewButton} onPress={onClose}>
            <Text style={modalStyles.viewLabel}>VER RESULTADOS</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const modalStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bg,
    borderTopLeftRadius: Colors.radius2xl,
    borderTopRightRadius: Colors.radius2xl,
    maxHeight: '85%',
    paddingTop: 20,
  },
  scroll: {},
  clearLabel: {
    color: Colors.accent,
    fontSize: 12,
    fontFamily: 'Sora_600SemiBold',
  },
  brandWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
    marginHorizontal: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  viewButton: {
    flex: 1,
    backgroundColor: Colors.action,
    borderRadius: Colors.radiusPill,
    paddingVertical: 15,
    alignItems: 'center',
  },
  viewLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'Sora_700Bold',
  },
});

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  filterButton: {
    width: 38,
    height: 38,
    borderRadius: Colors.radiusPill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.action,
    borderColor: Colors.action,
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
