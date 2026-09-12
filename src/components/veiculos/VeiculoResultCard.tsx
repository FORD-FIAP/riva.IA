/** Card usado na listagem de resultados da tela de Veículos — marca/modelo reais da FIPE */
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Vehicle } from '../../types/vehicle';
import { Colors } from '../../theme/colors';
import { useFipePrice } from '../../hooks/useFipePrice';
import { useCarImage } from '../../hooks/useCarImage';

interface VeiculoResultCardProps {
  vehicle: Vehicle;
  onPress: () => void;
}

export function VeiculoResultCard({ vehicle, onPress }: VeiculoResultCardProps) {
  const fipe = useFipePrice(vehicle.fipeCode, vehicle.preco ?? '');
  const carImage = useCarImage(vehicle.marca, vehicle.modelo);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.iconArea}>
        {carImage.url ? (
          <Image source={{ uri: carImage.url }} style={styles.iconImage} resizeMode="cover" />
        ) : (
          <MaterialCommunityIcons name="car-side" size={32} color={Colors.action} />
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.brand}>{vehicle.marca.toUpperCase()}</Text>
        <Text style={styles.name} numberOfLines={2}>{vehicle.modelo}</Text>
        <Text style={styles.price}>{fipe.price || 'Preço FIPE indisponível'}</Text>
      </View>

      <Feather name="chevron-right" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Colors.radiusLg,
    padding: 14,
  },
  iconArea: {
    width: 56,
    height: 56,
    borderRadius: Colors.radiusMd,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  brand: {
    color: Colors.accent,
    fontSize: 11,
    fontFamily: 'Sora_600SemiBold',
    letterSpacing: 0.5,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    lineHeight: 19,
  },
  price: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
    marginTop: 2,
  },
});
