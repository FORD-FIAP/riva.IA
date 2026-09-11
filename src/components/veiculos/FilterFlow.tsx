/** Bottom sheet de filtros da tela de Veículos — sobe de baixo, cobrindo a tela */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { NATIVE_DRIVER } from '../../utils/animation';
import { getFipeBrands, FipeBrand } from '../../services/fipeApi';
import {
  FilterSheetHeader,
  FilterClearLabel,
  FilterChip,
  FilterLetterIndex,
  FilterDropdown,
  PriceRangeSlider,
} from '../shared/FilterChips';

export interface FilterState {
  brands: string[];
  bodyStyle: string | null;
  priceMin: number | null;
  priceMax: number | null;
}

export const EMPTY_FILTERS: FilterState = {
  brands: [],
  bodyStyle: null,
  priceMin: null,
  priceMax: null,
};

const PRICE_MIN = 0;
const PRICE_MAX = 500000;

const BODY_STYLES = ['Hatch', 'Sedan', 'SUV', 'Picape', 'Esportivo', 'Conversível', 'Perua', 'Minivan'];

interface FilterSheetProps {
  visible: boolean;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClose: () => void;
}

export function FilterSheet({ visible, filters, onChange, onClose }: FilterSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [brands, setBrands] = useState<FipeBrand[]>([]);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  useEffect(() => {
    if (visible && brands.length === 0) {
      getFipeBrands().then((result) => {
        if (result) setBrands([...result].sort((a, b) => a.nome.localeCompare(b.nome)));
      });
    }
  }, [visible]);

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

  const temFiltrosAtivos =
    filters.brands.length > 0 ||
    filters.bodyStyle !== null ||
    filters.priceMin !== null ||
    filters.priceMax !== null;

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((i) => i !== value) : [...list, value];
  }

  function toggleBrand(brand: string) {
    onChange({ ...filters, brands: toggle(filters.brands, brand) });
  }

  function selectBodyStyle(style: string) {
    onChange({ ...filters, bodyStyle: filters.bodyStyle === style ? null : style });
  }

  function changePriceRange(priceMin: number, priceMax: number) {
    onChange({ ...filters, priceMin, priceMax });
  }

  const availableLetters = [...new Set(brands.map((b) => b.nome[0]?.toUpperCase()).filter(Boolean))].sort();
  const visibleBrands = activeLetter ? brands.filter((b) => b.nome[0]?.toUpperCase() === activeLetter) : [];

  function selectLetter(letter: string) {
    setActiveLetter((prev) => (prev === letter ? null : letter));
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Painel que sobe de baixo */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <FilterSheetHeader
          title="Filtro"
          onClose={onClose}
          rightExtra={temFiltrosAtivos ? <FilterClearLabel onPress={() => { setActiveLetter(null); onChange(EMPTY_FILTERS); }} /> : undefined}
        />

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Marca</Text>
            <FilterLetterIndex letters={availableLetters} active={activeLetter} onSelect={selectLetter} />
            {activeLetter && (
              <ScrollView style={styles.brandScroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                <View style={styles.brandWrap}>
                  {visibleBrands.map((brand) => (
                    <FilterChip
                      key={brand.valor}
                      label={brand.nome}
                      active={filters.brands.includes(brand.nome)}
                      onPress={() => toggleBrand(brand.nome)}
                    />
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          <FilterDropdown
            label="Categoria"
            placeholder="Selecione uma categoria"
            value={filters.bodyStyle}
            options={BODY_STYLES}
            onSelect={selectBodyStyle}
          />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Preço</Text>
            <PriceRangeSlider
              min={PRICE_MIN}
              max={PRICE_MAX}
              valueMin={filters.priceMin ?? PRICE_MIN}
              valueMax={filters.priceMax ?? PRICE_MAX}
              onChange={changePriceRange}
            />
          </View>

          <View style={{ height: 12 }} />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={styles.viewButton} onPress={onClose}>
            <Text style={styles.viewLabel}>VER RESULTADOS</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  section: {
    paddingTop: 16,
    marginTop: 4,
    gap: 6,
  },
  sectionLabel: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  brandScroll: {
    maxHeight: 180,
  },
  brandWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 4,
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
