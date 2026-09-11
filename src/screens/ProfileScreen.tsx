/** Tela de Configurações — dados do usuário logado, agrupados em cards (inspirado no Settings do Claude). */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';

const DISABLED_TOOLTIP = 'Botão atualmente desativado';

type DisabledKey = 'notif' | 'support';

const DISABLED_ITEMS: { key: DisabledKey; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { key: 'notif',   label: 'Notificações', icon: 'bell'        },
  { key: 'support', label: 'Suporte',      icon: 'help-circle' },
];

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function ProfileScreen() {
  const { user, updateProfile, logout } = useAuth();
  const { navigate } = useNavigation();

  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [preferences, setPreferences] = useState(user?.preferences ?? '');
  const [hovered, setHovered] = useState<DisabledKey | null>(null);

  if (!user) return null;

  const nicknameDirty = nickname.trim() !== user.nickname;
  const emailDirty = email.trim() !== user.email;
  const prefsDirty = preferences !== user.preferences;
  const dirty = nicknameDirty || emailDirty || prefsDirty;
  const canSave =
    dirty &&
    nickname.trim().length > 0 &&
    isValidEmail(email);

  function handleSave() {
    if (!canSave) return;
    updateProfile({
      nickname: nickname.trim(),
      email: email.trim(),
      preferences,
    });
  }

  function handleLogout() {
    logout();
    navigate('Início');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('Início')} style={styles.closeBtn}>
          <Feather name="x" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Card de conta — avatar + nome + e-mail */}
        <View style={styles.accountCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.accountName}>{user.fullName}</Text>
            <Text style={styles.accountEmail}>{user.email}</Text>
          </View>
        </View>

        {/* Conta — campos editáveis */}
        <Text style={styles.sectionLabel}>CONTA</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Nome completo</Text>
            <Text style={styles.rowValueReadonly}>{user.fullName}</Text>
          </View>
          <View style={styles.rowDivider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Nickname</Text>
            <TextInput
              style={styles.rowInput}
              placeholder="Como te chamar?"
              placeholderTextColor={Colors.textHint}
              value={nickname}
              onChangeText={setNickname}
              textAlign="right"
            />
          </View>
          <View style={styles.rowDivider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>E-mail</Text>
            <TextInput
              style={styles.rowInput}
              placeholder="seu@email.com"
              placeholderTextColor={Colors.textHint}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              textAlign="right"
            />
          </View>
        </View>
        <Text style={styles.cardHint}>A RIVA usa o nickname pra te chamar no chat.</Text>

        {/* Preferências */}
        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>PREFERÊNCIAS</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.prefsInput}
            placeholder="Ex.: gosto de picapes Ford e Toyota, prefiro motor diesel"
            placeholderTextColor={Colors.textHint}
            value={preferences}
            onChangeText={setPreferences}
            multiline
            textAlignVertical="top"
          />
        </View>
        <Text style={styles.cardHint}>Suas preferências ajudam a RIVA a personalizar as respostas.</Text>

        {/* Botão salvar */}
        <TouchableOpacity
          style={[styles.cta, !canSave && styles.ctaDisabled]}
          disabled={!canSave}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Feather name="check" size={16} color={!canSave ? Colors.textMuted : Colors.textPrimary} />
          <Text style={[styles.ctaLabel, !canSave && styles.ctaLabelDisabled]}>
            Salvar alterações
          </Text>
        </TouchableOpacity>

        {/* App — itens ainda não implementados */}
        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>APP</Text>
        <View style={styles.card}>
          {DISABLED_ITEMS.map((item, i) => {
            const isHovered = hovered === item.key;
            return (
              <React.Fragment key={item.key}>
                {i > 0 && <View style={styles.rowDivider} />}
                <View style={styles.disabledWrapper}>
                  <Pressable
                    onHoverIn={() => setHovered(item.key)}
                    onHoverOut={() => setHovered((h) => (h === item.key ? null : h))}
                    onPress={() => setHovered((h) => (h === item.key ? null : item.key))}
                    {...(Platform.OS === 'web' ? { accessibilityLabel: DISABLED_TOOLTIP } : {})}
                    style={({ hovered: rnHovered }: any) => [
                      styles.row,
                      (isHovered || rnHovered) && styles.disabledRowHovered,
                    ]}
                  >
                    <View style={styles.disabledLabelRow}>
                      <Feather name={item.icon} size={15} color={Colors.textMuted} />
                      <Text style={styles.disabledLabel}>{item.label}</Text>
                    </View>
                    <Feather name="lock" size={13} color={Colors.textHint} />
                  </Pressable>
                  {isHovered && (
                    <View style={styles.tooltip} pointerEvents="none">
                      <Text style={styles.tooltipText}>{DISABLED_TOOLTIP}</Text>
                    </View>
                  )}
                </View>
              </React.Fragment>
            );
          })}
        </View>

        {/* Log out — mesmo peso visual de uma ação destrutiva */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Feather name="log-out" size={16} color="#FF6B6B" />
          <Text style={styles.logoutLabel}>Sair da conta</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  closeBtn: {
    width: 26,
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontFamily: 'Sora_700Bold',
  },

  scroll: { paddingHorizontal: 20, paddingTop: 8 },

  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.action,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontFamily: 'Sora_700Bold',
  },
  accountName: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontFamily: 'Sora_700Bold',
  },
  accountEmail: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
    marginTop: 2,
  },

  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    fontFamily: 'Sora_600SemiBold',
    marginBottom: 8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardHint: {
    color: Colors.textHint,
    fontSize: 11,
    fontFamily: 'Sora_400Regular',
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  rowLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },
  rowValueReadonly: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },
  rowInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 13,
    fontFamily: 'Sora_500Medium',
  },
  prefsInput: {
    minHeight: 90,
    padding: 14,
    color: Colors.textPrimary,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.action,
    borderRadius: Colors.radiusPill,
    paddingVertical: 14,
    marginTop: 16,
  },
  ctaDisabled: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ctaLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Sora_700Bold',
  },
  ctaLabelDisabled: { color: Colors.textMuted },

  disabledWrapper: {
    position: 'relative',
  },
  disabledLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  disabledRowHovered: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  disabledLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Sora_500Medium',
  },
  tooltip: {
    position: 'absolute',
    top: -28,
    alignSelf: 'center',
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Colors.radiusSm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  tooltipText: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontFamily: 'Sora_500Medium',
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    borderRadius: Colors.radiusLg,
    paddingVertical: 15,
    marginTop: 28,
  },
  logoutLabel: {
    color: '#FF6B6B',
    fontSize: 14,
    fontFamily: 'Sora_700Bold',
  },
});
