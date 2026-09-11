/**
 * Peças de UI compartilhadas entre o filtro de Veículos (FilterFlow.tsx) e o
 * seletor de veículo de Comparar (CompararScreen.tsx) — garante que os dois
 * bottom sheets tenham exatamente o mesmo layout de header e chips.
 */
import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, PanResponder } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

export function FilterSheetHeader({
  title,
  onClose,
  rightExtra,
}: {
  title: string;
  onClose: () => void;
  rightExtra?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.headerActions}>
        {rightExtra}
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Feather name="x" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function FilterClearLabel({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.clearLabel}>Limpar</Text>
    </TouchableOpacity>
  );
}

export function FilterChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <ScrollView style={styles.chipsScrollArea} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        <View style={styles.chipsWrap}>{children}</View>
      </ScrollView>
    </View>
  );
}

export function FilterLetterIndex({
  letters,
  active,
  onSelect,
}: {
  letters: string[];
  active: string | null;
  onSelect: (letter: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.letterScroll}>
      <View style={styles.letterWrap}>
        {letters.map((letter) => (
          <TouchableOpacity
            key={letter}
            style={[styles.letterBtn, active === letter && styles.letterBtnActive]}
            onPress={() => onSelect(letter)}
            activeOpacity={0.75}
          >
            <Text style={[styles.letterLabel, active === letter && styles.letterLabelActive]}>{letter}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const PRICE_THUMB = 20;

/**
 * Slider de faixa de preço com dois cursores — puramente de UI local por
 * enquanto: a FIPE não expõe preço a partir da navegação por marca/modelo
 * (só por um código oficial que essa busca não devolve), então esse valor
 * ainda não filtra os resultados de verdade. Fica pronto pra ligar assim que
 * tivermos uma fonte de preço por veículo.
 */
export function PriceRangeSlider({
  min,
  max,
  step = 1000,
  valueMin,
  valueMax,
  onChange,
}: {
  min: number;
  max: number;
  step?: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
}) {
  const [minV, setMinV] = useState(valueMin);
  const [maxV, setMaxV] = useState(valueMax);
  const minVRef = useRef(minV);
  const maxVRef = useRef(maxV);
  minVRef.current = minV;
  maxVRef.current = maxV;
  const trackWidthRef = useRef(0);
  const minStartX = useRef(0);
  const maxStartX = useRef(0);

  function valueToX(v: number): number {
    const w = trackWidthRef.current;
    if (w <= 0) return 0;
    return ((v - min) / (max - min)) * w;
  }

  function xToValue(x: number): number {
    const w = trackWidthRef.current;
    if (w <= 0) return min;
    const clamped = Math.min(Math.max(x, 0), w);
    const raw = min + (clamped / w) * (max - min);
    return Math.round(raw / step) * step;
  }

  const minPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        minStartX.current = valueToX(minVRef.current);
      },
      onPanResponderMove: (_evt, gesture) => {
        const x = Math.min(Math.max(minStartX.current + gesture.dx, 0), valueToX(maxVRef.current) - 4);
        setMinV(xToValue(x));
      },
      onPanResponderRelease: () => onChange(minVRef.current, maxVRef.current),
    }),
  ).current;

  const maxPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        maxStartX.current = valueToX(maxVRef.current);
      },
      onPanResponderMove: (_evt, gesture) => {
        const x = Math.max(
          Math.min(maxStartX.current + gesture.dx, trackWidthRef.current),
          valueToX(minVRef.current) + 4,
        );
        setMaxV(xToValue(x));
      },
      onPanResponderRelease: () => onChange(minVRef.current, maxVRef.current),
    }),
  ).current;

  return (
    <View style={styles.priceWrap}>
      <View style={styles.priceLabelsRow}>
        <Text style={styles.priceLabel}>Preço mín.</Text>
        <Text style={styles.priceLabel}>Preço máx.</Text>
      </View>

      <View
        style={styles.priceTrack}
        onLayout={(e) => {
          trackWidthRef.current = e.nativeEvent.layout.width;
        }}
      >
        <View style={styles.priceTrackBg} />
        <View
          style={[
            styles.priceTrackFill,
            { left: valueToX(minV), width: Math.max(valueToX(maxV) - valueToX(minV), 0) },
          ]}
        />
        <View {...minPan.panHandlers} style={[styles.priceThumb, { left: valueToX(minV) - PRICE_THUMB / 2 }]} />
        <View {...maxPan.panHandlers} style={[styles.priceThumb, { left: valueToX(maxV) - PRICE_THUMB / 2 }]} />
      </View>

      <View style={styles.priceValuesRow}>
        <Text style={styles.priceValueText}>R$ {minV.toLocaleString('pt-BR')}</Text>
        <Text style={styles.priceValueText}>R$ {maxV.toLocaleString('pt-BR')}</Text>
      </View>
    </View>
  );
}

export function FilterDropdown({
  label,
  placeholder,
  value,
  options,
  onSelect,
}: {
  label: string;
  placeholder: string;
  value: string | null;
  options: string[];
  onSelect: (option: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>

      <TouchableOpacity style={styles.dropdownBox} onPress={() => setOpen((v) => !v)} activeOpacity={0.75}>
        <View style={styles.dropdownIconWrap}>
          <Feather name="list" size={15} color="#FFFFFF" />
        </View>
        <Text style={[styles.dropdownValue, !value && styles.dropdownPlaceholder]}>{value ?? placeholder}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownList}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.dropdownItem}
              activeOpacity={0.7}
              onPress={() => {
                onSelect(option);
                setOpen(false);
              }}
            >
              <Text style={[styles.dropdownItemLabel, value === option && styles.dropdownItemLabelActive]}>
                {option}
              </Text>
              {value === option && <Feather name="check" size={16} color={Colors.accent} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress} activeOpacity={0.75}>
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
      {active && (
        <View style={styles.chipRemove}>
          <Feather name="x" size={10} color={Colors.accent} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  closeButton: {
    padding: 4,
  },
  clearLabel: {
    color: Colors.accent,
    fontSize: 12,
    fontFamily: 'Sora_600SemiBold',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 4,
    gap: 6,
  },
  sectionLabel: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
  chipsScrollArea: {
    maxHeight: 180,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingRight: 20,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    borderRadius: Colors.radiusPill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: 'transparent',
    borderColor: Colors.accent,
  },
  chipLabel: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
  },
  chipLabelActive: {
    color: Colors.accent,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
  chipRemove: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterScroll: {
    paddingLeft: 20,
    marginBottom: 8,
  },
  letterWrap: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: 20,
  },
  letterBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  letterLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Sora_600SemiBold',
  },
  letterLabelActive: {
    color: Colors.bg,
    fontFamily: 'Sora_700Bold',
  },
  priceWrap: {
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 10,
  },
  priceLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    color: Colors.textHint,
    fontSize: 11,
    fontFamily: 'Sora_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceTrack: {
    height: 24,
    justifyContent: 'center',
  },
  priceTrackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderStrong,
  },
  priceTrackFill: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },
  priceThumb: {
    position: 'absolute',
    top: 2,
    width: PRICE_THUMB,
    height: PRICE_THUMB,
    borderRadius: PRICE_THUMB / 2,
    backgroundColor: Colors.accent,
    borderWidth: 3,
    borderColor: Colors.bg,
  },
  priceValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceValueText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontFamily: 'Sora_600SemiBold',
    backgroundColor: Colors.surface2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Colors.radiusMd,
    overflow: 'hidden',
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Colors.radiusPill,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dropdownIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.action,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownValue: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 13,
    fontFamily: 'Sora_500Medium',
  },
  dropdownPlaceholder: {
    color: Colors.textHint,
  },
  dropdownList: {
    marginHorizontal: 20,
    marginTop: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Colors.radiusLg,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },
  dropdownItemLabelActive: {
    color: Colors.accent,
    fontFamily: 'Sora_600SemiBold',
  },
});
