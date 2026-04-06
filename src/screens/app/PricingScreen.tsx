import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { API_CONFIG } from '../../constants/config';
import { useAuthStore } from '../../store/authStore';

export default function PricingScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [currentTier, setCurrentTier] = useState<string>('trial');
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutUrl, setCheckoutUrl] = useState('');

  // Hardcoded plans matching web app exactly
  const plans = [
    {
      id: 'trial',
      name: 'Trial',
      price: 0,
      tier: 'trial',
      isTrial: true,
      features: [
        '✓ 14 dagen gratis',
        '✓ Beperkte features',
        '✓ 1 gebruiker',
        '✓ Basis projectmanagement',
        '✓ Email support',
      ],
    },
    {
      id: 'starter_monthly',
      stripeMonthlyId: 'price_starter_monthly', // Replace with actual Stripe Price ID
      stripeYearlyId: 'price_starter_yearly',
      name: 'Starter',
      monthlyPrice: 29,
      yearlyPrice: 290, // 29 * 10 months
      tier: 'starter',
      features: [
        '✓ 5 Projecten',
        '✓ 1 Gebruiker',
        '✓ Time Tracking',
        '✓ AI Assistant',
        '⊘ Advanced Analytics',
        '⊘ Team Features',
        '⊘ Program Management',
      ],
    },
    {
      id: 'team_monthly',
      stripeMonthlyId: 'price_team_monthly',
      stripeYearlyId: 'price_team_yearly',
      name: 'Team',
      monthlyPrice: 39,
      yearlyPrice: 390,
      tier: 'team',
      features: [
        '✓ Onbeperkt Projecten',
        '✓ Tot 25 Gebruikers',
        '✓ Team Collaboration',
        '✓ Priority Support',
        '✓ Advanced Analytics',
      ],
    },
    {
      id: 'professional_monthly',
      stripeMonthlyId: 'price_professional_monthly',
      stripeYearlyId: 'price_professional_yearly',
      name: 'Professional',
      monthlyPrice: 49,
      yearlyPrice: 490,
      tier: 'professional',
      popular: true,
      features: [
        '✓ 10 Projecten',
        '✓ 1 Gebruiker',
        '✓ AI Assistant',
        '✓ Program Management',
        '✓ Priority Support',
        '✓ Advanced Analytics',
        '✓ Gantt Charts',
      ],
    },
  ];

  const handleTrialSignup = () => {
    navigation.navigate('TrialRegistration');
  };

  const handleUpgrade = async (plan: any) => {
  if (plan.isTrial) {
    handleTrialSignup();
    return;
  }

  // Check if already on this tier
  if (currentTier === plan.tier) {
    Alert.alert('Info', `Je gebruikt al het ${plan.name} plan`);
    return;
  }

  setLoading(true);
  try {
    // Get token from authStore
    const token = useAuthStore.getState().token;
    
    if (!token) {
      Alert.alert('Niet Ingelogd', 'Log eerst in om je abonnement te upgraden.');
      return;
    }

    // Get Stripe price ID based on billing cycle
    const stripePriceId = selectedCycle === 'yearly' 
      ? plan.stripeYearlyId 
      : plan.stripeMonthlyId;

    const response = await fetch(`${API_CONFIG.BASE_URL}/subscriptions/create-checkout-session/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        plan_id: stripePriceId,
        success_url: 'projextpal://subscription-success',
        cancel_url: 'projextpal://pricing',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Kon checkout niet starten');
    }

    const data = await response.json();
    setCheckoutUrl(data.checkout_url);
  } catch (error: any) {
  console.error('Checkout error:', error);
  
  // Better error message
  let errorMessage = 'Upgrade is momenteel alleen beschikbaar via de web app.';
  
  if (error.message?.includes('JSON')) {
    errorMessage = 'Stripe is nog niet geconfigureerd. Gebruik de web app om te upgraden.';
  }
  
  Alert.alert(
    'Upgrade via Web App',
    errorMessage + '\n\nOpen projextpal.com/profile in je browser om je abonnement te beheren.',
    [
      { text: 'OK', style: 'cancel' },
    ]
  );
  } finally {
    setLoading(false);
  }
};

  // WebView for Stripe Checkout
  if (checkoutUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.webviewHeader}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setCheckoutUrl('')}
          >
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.webviewTitle}>Betaling Afronden</Text>
        </View>
        <WebView 
          source={{ uri: checkoutUrl }}
          onNavigationStateChange={(navState) => {
            if (navState.url.includes('subscription-success')) {
              setCheckoutUrl('');
              Alert.alert(
                'Gelukt!',
                'Je abonnement is geactiveerd',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } else if (navState.url.includes('pricing')) {
              setCheckoutUrl('');
            }
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Kies Je Plan</Text>
          <Text style={styles.subtitle}>
            Start met een gratis trial of upgrade direct
          </Text>
        </View>

        {/* Billing Cycle Toggle */}
        <View style={styles.cycleToggle}>
          <TouchableOpacity
            style={[
              styles.cycleButton,
              selectedCycle === 'monthly' && styles.cycleButtonActive,
            ]}
            onPress={() => setSelectedCycle('monthly')}
          >
            <Text
              style={[
                styles.cycleButtonText,
                selectedCycle === 'monthly' && styles.cycleButtonTextActive,
              ]}
            >
              Maandelijks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.cycleButton,
              selectedCycle === 'yearly' && styles.cycleButtonActive,
            ]}
            onPress={() => setSelectedCycle('yearly')}
          >
            <Text
              style={[
                styles.cycleButtonText,
                selectedCycle === 'yearly' && styles.cycleButtonTextActive,
              ]}
            >
              Jaarlijks
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>Bespaar 17%</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => {
            const isCurrentPlan = currentTier === plan.tier;
            const isTrial = plan.isTrial;
            const displayPrice = !isTrial && selectedCycle === 'yearly' 
              ? plan.yearlyPrice 
              : plan.monthlyPrice;
            
            return (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  plan.popular && styles.planCardPopular,
                  isCurrentPlan && styles.planCardCurrent,
                  isTrial && styles.planCardTrial,
                ]}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>⭐ Most Popular</Text>
                  </View>
                )}
                
                {isTrial && (
                  <View style={styles.trialBadge}>
                    <Text style={styles.trialBadgeText}>🎉 Gratis Trial</Text>
                  </View>
                )}
                
                {isCurrentPlan && !isTrial && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Huidig Plan</Text>
                  </View>
                )}

                <Text style={styles.planName}>{plan.name}</Text>
                
                <View style={styles.priceContainer}>
                  {isTrial ? (
                    <View>
                      <Text style={styles.freeText}>GRATIS</Text>
                      <Text style={styles.trialPeriod}>14 dagen trial</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.currency}>€</Text>
                      <Text style={styles.price}>{displayPrice}</Text>
                      <Text style={styles.period}>
                        /{selectedCycle === 'yearly' ? 'jaar' : 'maand'}
                      </Text>
                    </>
                  )}
                </View>

                {!isTrial && selectedCycle === 'yearly' && (
                  <Text style={styles.savingsText}>
                    Bespaar €{(plan.monthlyPrice! * 12) - plan.yearlyPrice!}/jaar
                  </Text>
                )}

                <View style={styles.features}>
                  {plan.features.map((feature: string, index: number) => (
                    <View key={index} style={styles.feature}>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.upgradeButton,
                    plan.popular && !isTrial && styles.upgradeButtonPopular,
                    isTrial && styles.upgradeButtonTrial,
                    isCurrentPlan && !isTrial && styles.upgradeButtonDisabled,
                  ]}
                  onPress={() => handleUpgrade(plan)}
                  disabled={(isCurrentPlan && !isTrial) || loading}
                >
                  {loading ? (
                    <ActivityIndicator color={isTrial || plan.popular ? '#fff' : '#1F2937'} />
                  ) : (
                    <Text
                      style={[
                        styles.upgradeButtonText,
                        (plan.popular || isTrial) && !isCurrentPlan && styles.upgradeButtonTextPopular,
                      ]}
                    >
                      {isTrial 
                        ? 'Start Gratis Trial 🚀' 
                        : isCurrentPlan 
                          ? 'Huidig Plan' 
                          : 'Upgrade Nu'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💳 Veilig betalen via Stripe
          </Text>
          <Text style={styles.footerText}>
            ✓ Annuleer op elk moment
          </Text>
          <Text style={styles.footerText}>
            ✓ Geen verborgen kosten
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  header: { padding: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280' },
  
  cycleToggle: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 4, margin: 16 },
  cycleButton: { flex: 1, paddingVertical: 12, borderRadius: 6, alignItems: 'center', position: 'relative' },
  cycleButtonActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cycleButtonText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  cycleButtonTextActive: { color: '#1F2937' },
  saveBadge: { position: 'absolute', top: -8, right: -8, backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  saveText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  
  plansContainer: { padding: 16 },
  planCard: { backgroundColor: '#fff', borderRadius: 12, padding: 24, marginBottom: 16, borderWidth: 2, borderColor: '#E5E7EB' },
  planCardPopular: { borderColor: '#7C3AED', transform: [{ scale: 1.02 }] },
  planCardCurrent: { borderColor: '#10B981' },
  planCardTrial: { borderColor: '#F59E0B', backgroundColor: '#FFFBEB' },
  popularBadge: { position: 'absolute', top: -12, left: 24, backgroundColor: '#7C3AED', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  popularText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  trialBadge: { position: 'absolute', top: -12, left: 24, backgroundColor: '#F59E0B', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  trialBadgeText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  currentBadge: { position: 'absolute', top: -12, right: 24, backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  currentBadgeText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  planName: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  priceContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
  currency: { fontSize: 24, fontWeight: '600', color: '#1F2937' },
  price: { fontSize: 48, fontWeight: 'bold', color: '#1F2937' },
  period: { fontSize: 16, color: '#6B7280', marginBottom: 8, marginLeft: 4 },
  freeText: { fontSize: 48, fontWeight: 'bold', color: '#F59E0B' },
  trialPeriod: { fontSize: 14, color: '#92400E', marginTop: 4 },
  savingsText: { fontSize: 14, color: '#10B981', fontWeight: '600', marginBottom: 16 },
  features: { marginBottom: 24 },
  feature: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  featureText: { fontSize: 14, color: '#374151' },
  upgradeButton: { height: 48, backgroundColor: '#F3F4F6', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  upgradeButtonPopular: { backgroundColor: '#7C3AED' },
  upgradeButtonTrial: { backgroundColor: '#F59E0B' },
  upgradeButtonDisabled: { backgroundColor: '#E5E7EB' },
  upgradeButtonText: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  upgradeButtonTextPopular: { color: '#fff' },
  
  footer: { padding: 24, alignItems: 'center' },
  footerText: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  
  webviewHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  closeButton: { marginRight: 16 },
  webviewTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
});