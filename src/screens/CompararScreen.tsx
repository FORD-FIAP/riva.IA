/** Tela de comparação de veículos — até 4 modelos, marca/modelo/preço reais da FIPE */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Animated,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { NATIVE_DRIVER } from '../utils/animation';
import { useNavigation } from '../context/NavigationContext';
import { useFavoritesContext } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { getFipeBrands, getFipeModels, buildVehicleFromFipe, cacheVehicles, getCachedVehicle } from '../services/fipeApi';
import { useFipePrice } from '../hooks/useFipePrice';
import { useCarImage } from '../hooks/useCarImage';
import { Vehicle } from '../types/vehicle';
import { FilterSheetHeader, FilterChipRow, FilterChip, FilterLetterIndex } from '../components/shared/FilterChips';
import { FilterState, EMPTY_FILTERS } from '../components/veiculos/FilterFlow';

const MAX_SLOTS = 4;
const SLOT_COLORS = [Colors.accent, '#7B6FE8', '#FF9F45', '#F472B6'];

// ─── Tela principal ──────────────────────────────────────────────────────────

export function CompararScreen() {
  const {
    openSidebar,
    pendingComparisonIds,
    clearPendingComparison,
    pendingCompareVehicleId,
    clearPendingCompareVehicle,
  } = useNavigation();
  const { isComparisonFavorite, toggleComparison } = useFavoritesContext();
  const { isAuthenticated, requestLogin } = useAuth();
  const [slots, setSlots] = useState<(Vehicle | null)[]>([null, null]);
  const [pickingSlot, setPickingSlot] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const filledVehicles = slots.filter((v): v is Vehicle => v !== null);
  const comparisonReady = filledVehicles.length >= 2;

  useEffect(() => {
    if (comparisonReady) {
      setTimeout(() => scrollRef.current?.scrollTo({ y: 280, animated: true }), 100);
    }
  }, [comparisonReady]);

  useEffect(() => {
    if (pendingComparisonIds) {
      const [idA, idB] = pendingComparisonIds;
      const a = getCachedVehicle(idA) ?? null;
      const b = getCachedVehicle(idB) ?? null;
      if (a && b) setSlots([a, b]);
      clearPendingComparison();
    }
  }, [pendingComparisonIds]);

  useEffect(() => {
    if (pendingCompareVehicleId) {
      const vehicle = getCachedVehicle(pendingCompareVehicleId) ?? null;
      if (vehicle) {
        setSlots([vehicle, null]);
        setPickingSlot(1);
      }
      clearPendingCompareVehicle();
    }
  }, [pendingCompareVehicleId]);

  function openPicker(index: number) {
    setPickingSlot(index);
  }

  function selectVehicle(vehicle: Vehicle) {
    if (pickingSlot === null) return;
    const slotIndex = pickingSlot;
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = vehicle;
      return next;
    });
    setPickingSlot(null);
  }

  function removeVehicle(index: number) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }

  function addSlot() {
    setSlots((prev) => (prev.length < MAX_SLOTS ? [...prev, null] : prev));
  }

  function removeEmptySlot(index: number) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  // O "salvar comparação" (estrela) só existe pra pares — a API de favoritos é 1x1.
  const canSaveComparison = filledVehicles.length === 2;
  const comparisonSaved =
    canSaveComparison && isAuthenticated && isComparisonFavorite(filledVehicles[0].id, filledVehicles[1].id);

  function toggleSavedComparison() {
    if (!canSaveComparison) return;
    toggleComparison(filledVehicles[0].id, filledVehicles[1].id);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Comparar</Text>
          <Text style={styles.headerSubtitle}>Escolha até {MAX_SLOTS} modelos</Text>
        </View>
        <View style={styles.headerActions}>
          {canSaveComparison && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                if (isAuthenticated) {
                  toggleSavedComparison();
                } else {
                  requestLogin(
                    { type: 'comparison', vehicleA: filledVehicles[0], vehicleB: filledVehicles[1] },
                    () => toggleComparison(filledVehicles[0].id, filledVehicles[1].id),
                  );
                }
              }}
            >
              <MaterialCommunityIcons
                name={comparisonSaved ? 'star' : 'star-outline'}
                size={18}
                color={comparisonSaved ? Colors.accent : Colors.textMuted}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.menuButton} onPress={openSidebar}>
            <Feather name="menu" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Slots — rolagem horizontal pra caber até 4 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.slots}
        >
          {slots.map((vehicle, i) =>
            vehicle ? (
              <FilledSlot
                key={i}
                vehicle={vehicle}
                color={SLOT_COLORS[i % SLOT_COLORS.length]}
                onSwap={() => openPicker(i)}
                onRemove={() => removeVehicle(i)}
              />
            ) : (
              <EmptySlot
                key={i}
                onPress={() => openPicker(i)}
                onRemove={i >= 2 ? () => removeEmptySlot(i) : undefined}
              />
            ),
          )}
          {slots.length < MAX_SLOTS && (
            <TouchableOpacity style={styles.addSlot} activeOpacity={0.7} onPress={addSlot}>
              <Feather name="plus-circle" size={22} color={Colors.textMuted} />
              <Text style={styles.addSlotLabel}>Adicionar</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* ── Comparação (a partir de 2 selecionados) — só marca/modelo/preço, dados reais da FIPE ── */}
        {comparisonReady && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="cash-multiple" size={16} color={Colors.accent} />
              <Text style={styles.sectionTitle}>Identificação & Preço FIPE</Text>
            </View>

            {filledVehicles.map((v, i) => (
              <PriceRow key={v.id} vehicle={v} color={SLOT_COLORS[i % SLOT_COLORS.length]} />
            ))}

            <View style={styles.noticeBox}>
              <Feather name="info" size={14} color={Colors.textMuted} />
              <Text style={styles.noticeText}>
                Comparação por motor, dimensões, off-road e segurança ainda não está disponível —
                depende de uma fonte de dados específica pra ficha técnica.
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <VehiclePickerModal
        visible={pickingSlot !== null}
        excluded={filledVehicles}
        onSelect={selectVehicle}
        onClose={() => setPickingSlot(null)}
      />
    </SafeAreaView>
  );
}

// ─── Linha de preço por veículo (dado real da FIPE, com fallback) ────────────

function PriceRow({ vehicle, color }: { vehicle: Vehicle; color: string }) {
  const fipe = useFipePrice(vehicle.fipeCode, vehicle.preco ?? '');
  return (
    <View style={styles.priceRow}>
      <View style={[styles.priceDot, { backgroundColor: color }]} />
      <View style={styles.priceInfo}>
        <Text style={styles.priceBrand}>{vehicle.marca}</Text>
        <Text style={styles.priceModel} numberOfLines={1}>{vehicle.modelo}</Text>
      </View>
      <Text style={styles.priceValue}>{fipe.price || 'Indisponível'}</Text>
    </View>
  );
}

// ─── Slot vazio ──────────────────────────────────────────────────────────────

function EmptySlot({ onPress, onRemove }: { onPress: () => void; onRemove?: () => void }) {
  return (
    <TouchableOpacity style={styles.slotEmpty} activeOpacity={0.7} onPress={onPress}>
      {onRemove && (
        <TouchableOpacity style={styles.removeEmptySlot} onPress={onRemove} hitSlop={8}>
          <Feather name="x" size={14} color={Colors.textMuted} />
        </TouchableOpacity>
      )}
      <View style={styles.plusCircle}>
        <Feather name="plus" size={22} color={Colors.accent} />
      </View>
      <Text style={styles.slotSubtitle}>Clique para escolher</Text>
    </TouchableOpacity>
  );
}

// ─── Slot preenchido ─────────────────────────────────────────────────────────

function FilledSlot({
  vehicle,
  color,
  onSwap,
  onRemove,
}: {
  vehicle: Vehicle;
  color: string;
  onSwap: () => void;
  onRemove: () => void;
}) {
  const fipe = useFipePrice(vehicle.fipeCode, vehicle.preco ?? '');
  const carImage = useCarImage(vehicle.marca, vehicle.modelo);

  return (
    <View style={styles.slotFilled}>
      <View style={styles.imageArea}>
        {carImage.url ? (
          <Image source={{ uri: carImage.url }} style={styles.slotImage} resizeMode="cover" />
        ) : (
          <MaterialCommunityIcons name="car-side" size={56} color={color} />
        )}
        <Text style={[styles.brandBadgeOverlay, { color }]}>{vehicle.marca.toUpperCase()}</Text>
      </View>

      <View style={styles.filledInfo}>
        <Text style={[styles.filledBrand, { color }]}>{vehicle.marca.toUpperCase()}</Text>
        <Text style={styles.filledName} numberOfLines={2}>{vehicle.modelo}</Text>
        <Text style={[styles.filledPrice, { color }]} numberOfLines={1}>{fipe.price || 'Indisponível'}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={onSwap} activeOpacity={0.8}>
            <MaterialCommunityIcons name="swap-horizontal" size={14} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDanger]}
            onPress={onRemove}
            activeOpacity={0.8}
          >
            <Feather name="trash-2" size={14} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Modal de seleção (busca real na FIPE) ───────────────────────────────────

function VehiclePickerModal({
  visible,
  excluded,
  onSelect,
  onClose,
}: {
  visible: boolean;
  excluded: Vehicle[];
  onSelect: (v: Vehicle) => void;
  onClose: () => void;
}) {
  const { height: screenHeight } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const [appliedFilters, setAppliedFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [allBrands, setAllBrands] = useState<{ nome: string; valor: string }[]>([]);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [results, setResults] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && allBrands.length === 0) {
      getFipeBrands().then((result) => {
        if (result) setAllBrands([...result].sort((a, b) => a.nome.localeCompare(b.nome)));
      });
    }
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: NATIVE_DRIVER }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 300, useNativeDriver: NATIVE_DRIVER }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: screenHeight, duration: 300, useNativeDriver: NATIVE_DRIVER }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 300, useNativeDriver: NATIVE_DRIVER }),
      ]).start();
      setAppliedFilters(EMPTY_FILTERS);
      setActiveLetter(null);
      setResults([]);
    }
  }, [visible]);

  function toggleBrandFilter(nome: string) {
    setAppliedFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(nome) ? prev.brands.filter((b) => b !== nome) : [...prev.brands, nome],
    }));
  }

  function selectLetter(letter: string) {
    setActiveLetter((prev) => (prev === letter ? null : letter));
  }

  const availableLetters = [...new Set(allBrands.map((b) => b.nome[0]?.toUpperCase()).filter(Boolean))].sort();
  const visibleBrands = activeLetter ? allBrands.filter((b) => b.nome[0]?.toUpperCase() === activeLetter) : [];

  const hasFilters = appliedFilters.brands.length > 0;
  const excludedIds = new Set(excluded.map((v) => v.id));

  // Busca só por marca (alfabeto) — igual à tela de Veículos.
  useEffect(() => {
    if (!visible || !hasFilters) {
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

      const matchingBrands = brands.filter((b) => appliedFilters.brands.includes(b.nome));
      const brandsToQuery = matchingBrands.slice(0, 6);

      const vehicleLists = await Promise.all(
        brandsToQuery.map(async (brand) => {
          const models = await getFipeModels(brand.valor);
          if (!models) return [];
          return models.slice(0, 30).map((m) => buildVehicleFromFipe(brand, m));
        }),
      );

      if (cancelled) return;
      const flat = vehicleLists.flat().filter((v) => !excludedIds.has(v.id));
      cacheVehicles(flat);
      setResults(flat);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, appliedFilters]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[styles.modalBackdrop, { opacity: backdropAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <Animated.View style={[styles.modalSheet, { transform: [{ translateY: slideAnim }] }]}>
        <FilterSheetHeader title="Escolher veículo" onClose={onClose} />

        {/* Marca em ordem alfabética — único jeito de buscar aqui */}
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
                  active={appliedFilters.brands.includes(brand.nome)}
                  onPress={() => toggleBrandFilter(brand.nome)}
                />
              ))}
            </View>
          )}
        </View>

        {!hasFilters ? (
          <View style={styles.listEmpty}>
            <Text style={styles.listEmptyText}>Escolha uma letra pra ver as marcas</Text>
          </View>
        ) : loading ? (
          <View style={styles.listEmpty}>
            <ActivityIndicator color={Colors.accent} />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(v) => v.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            style={styles.list}
            ListEmptyComponent={
              <View style={styles.listEmpty}>
                <Text style={styles.listEmptyText}>Nenhum veículo encontrado</Text>
              </View>
            }
            renderItem={({ item }) => <PickerListRow vehicle={item} onPress={() => onSelect(item)} />}
          />
        )}
      </Animated.View>
    </View>
  );
}

function PickerListRow({ vehicle, onPress }: { vehicle: Vehicle; onPress: () => void }) {
  const carImage = useCarImage(vehicle.marca, vehicle.modelo);

  return (
    <TouchableOpacity style={styles.listRow} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.listThumb}>
        {carImage.url ? (
          <Image source={{ uri: carImage.url }} style={styles.listThumbImage} resizeMode="cover" />
        ) : (
          <MaterialCommunityIcons name="car-side" size={28} color={Colors.action} />
        )}
      </View>
      <View style={styles.listText}>
        <Text style={styles.listBrand}>{vehicle.marca.toUpperCase()}</Text>
        <Text style={styles.listName} numberOfLines={2}>{vehicle.modelo}</Text>
      </View>
      <Feather name="plus" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

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
    gap: 8,
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

  scroll: { paddingBottom: 20 },

  slots: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 24,
  },

  // Slot vazio
  slotEmpty: {
    width: 160,
    backgroundColor: Colors.surface,
    borderRadius: Colors.radiusLg,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
    position: 'relative',
  },
  removeEmptySlot: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  plusCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
    textAlign: 'center',
  },
  addSlot: {
    width: 90,
    borderRadius: Colors.radiusLg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addSlotLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: 'Sora_500Medium',
  },

  // Slot preenchido
  slotFilled: {
    width: 160,
    backgroundColor: Colors.surface,
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 8,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: Colors.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(56,109,189,0.22)',
  },
  actionBtnDanger: {
    backgroundColor: 'rgba(255,107,107,0.12)',
  },
  imageArea: {
    height: 100,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  slotImage: {
    width: '100%',
    height: '100%',
  },
  brandBadgeOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    letterSpacing: 1.5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Colors.radiusPill,
    overflow: 'hidden',
  },
  filledInfo: { padding: 10, gap: 3 },
  filledBrand: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
    letterSpacing: 1,
  },
  filledName: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    lineHeight: 18,
  },
  filledPrice: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    marginTop: 4,
  },

  // Seção de comparação simples
  section: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: Colors.surface,
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  priceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priceInfo: {
    flex: 1,
    gap: 1,
  },
  priceBrand: {
    color: Colors.textHint,
    fontSize: 10,
    fontFamily: 'Sora_600SemiBold',
    letterSpacing: 0.5,
  },
  priceModel: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
  priceValue: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  noticeBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Colors.radiusMd,
    padding: 12,
    marginTop: 14,
  },
  noticeText: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Sora_400Regular',
  },

  // Modal
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bg,
    borderTopLeftRadius: Colors.radius2xl,
    borderTopRightRadius: Colors.radius2xl,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '85%',
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
  listEmpty: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  listEmptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },
  list: { flex: 1 },
  listContent: { paddingBottom: 20, paddingHorizontal: 20, gap: 4 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listThumb: {
    width: 72,
    height: 52,
    borderRadius: Colors.radiusMd,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  listThumbImage: {
    width: '100%',
    height: '100%',
  },
  listText: { flex: 1, gap: 1 },
  listBrand: {
    color: Colors.accent,
    fontSize: 10,
    fontFamily: 'Sora_600SemiBold',
    letterSpacing: 0.5,
  },
  listName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
});
