# 📱 QuantixBet Mobile App - Guía Completa de Implementación

**Última actualización:** 5 de Junio 2026  
**Tecnología:** React Native + Expo  
**Plataformas:** iOS + Android

---

## 📋 **ÍNDICE**

1. [Setup Inicial](#setup-inicial)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Configuración de Supabase](#configuración-de-supabase)
4. [Navegación](#navegación)
5. [Implementación por Fases](#implementación-por-fases)
6. [Push Notifications](#push-notifications)
7. [Deep Linking](#deep-linking)
8. [Build y Deployment](#build-y-deployment)

---

## 🚀 **SETUP INICIAL**

### Prerequisitos
```bash
# Node.js 18+ instalado
node --version

# Expo CLI
npm install -g expo-cli

# EAS CLI (para builds)
npm install -g eas-cli
```

### Crear Proyecto
```bash
# Crear proyecto con TypeScript
npx create-expo-app quantixbet-mobile --template blank-typescript

cd quantixbet-mobile

# Instalar dependencias core
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install @supabase/supabase-js @react-native-async-storage/async-storage
npm install react-native-url-polyfill
npm install expo-secure-store expo-notifications expo-linking

# Dependencias de UI
npm install react-native-svg react-native-charts-wrapper
npm install @shopify/flash-list
```

---

## 📁 **ESTRUCTURA DEL PROYECTO**

```
quantixbet-mobile/
├── app.json                  # Config de Expo
├── App.tsx                   # Entry point
├── src/
│   ├── config/
│   │   └── supabase.ts      # Config de Supabase
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   ├── pools/
│   │   │   ├── PoolsListScreen.tsx
│   │   │   ├── PoolDetailScreen.tsx
│   │   │   ├── PlaceBetScreen.tsx
│   │   │   └── HistoryScreen.tsx
│   │   ├── network/
│   │   │   ├── NetworkScreen.tsx
│   │   │   ├── PerformanceScreen.tsx
│   │   │   └── CalculatorScreen.tsx
│   │   ├── wallet/
│   │   │   ├── WalletScreen.tsx
│   │   │   └── WithdrawScreen.tsx
│   │   └── profile/
│   │       └── ProfileScreen.tsx
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Input.tsx
│   │   ├── pools/
│   │   │   ├── MarketCard.tsx
│   │   │   └── OptionButton.tsx
│   │   └── network/
│   │       └── TreeNode.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useMarkets.ts
│   │   └── useNotifications.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── markets.service.ts
│   │   └── wallet.service.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── notifications.ts
│       └── deepLinks.ts
└── assets/
    ├── images/
    └── fonts/
```

---

## ⚙️ **CONFIGURACIÓN DE SUPABASE**

### `src/config/supabase.ts`
```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

// Custom storage adapter for React Native
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

## 🧭 **NAVEGACIÓN**

### `src/navigation/RootNavigator.tsx`
```typescript
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from '../config/supabase';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### `src/navigation/TabNavigator.tsx`
```typescript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import PoolsListScreen from '../screens/pools/PoolsListScreen';
import NetworkScreen from '../screens/network/NetworkScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Pools') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Network') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Wallet') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Pools" component={PoolsListScreen} />
      <Tab.Screen name="Network" component={NetworkScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

---

## 📦 **IMPLEMENTACIÓN POR FASES**

### **FASE 1: Core Functionality (Semana 1-2)**

#### ✅ Pantallas a implementar:
1. **Auth**
   - LoginScreen
   - RegisterScreen
   - ForgotPasswordScreen

2. **Dashboard**
   - Overview de stats
   - Últimas actividades
   - Balance de wallet

3. **Market Pools**
   - Lista de mercados activos
   - Detalle de mercado
   - Colocar apuesta
   - Historial de apuestas

4. **Wallet**
   - Ver balance
   - Historial de transacciones
   - Solicitar retiro

#### Ejemplo: `src/screens/pools/PoolsListScreen.tsx`
```typescript
import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { supabase } from '../../config/supabase';
import MarketCard from '../../components/pools/MarketCard';

export default function PoolsListScreen({ navigation }) {
  const [markets, setMarkets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (!error) {
      setMarkets(data);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMarkets();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={markets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MarketCard
            market={item}
            onPress={() => navigation.navigate('PoolDetail', { marketId: item.id })}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
```

---

### **FASE 2: MLM Features (Semana 3-4)**

#### ✅ Pantallas a implementar:
1. **Red Binaria**
   - Visualización de árbol
   - Lista de referidos directos
   - Stats de red

2. **Performance MLM**
   - Dashboard de performance
   - Gráficos de crecimiento

3. **Calculadora MLM**
   - Simulador interactivo
   - Proyecciones

4. **Comisiones**
   - Historial de comisiones
   - Stats

---

### **FASE 3: Notifications & Real-Time (Semana 5)**

#### Push Notifications Setup

1. **Configurar Expo Notifications**
```typescript
// src/utils/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;

    // Save token to Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('users')
        .update({ push_token: token })
        .eq('id', user.id);
    }
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}
```

2. **Usar en App.tsx**
```typescript
useEffect(() => {
  registerForPushNotificationsAsync();

  const subscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification tapped:', response);
    // Navigate based on notification data
  });

  return () => {
    subscription.remove();
    responseSubscription.remove();
  };
}, []);
```

---

### **FASE 4: Advanced Features (Semana 6)**

#### Deep Linking

```typescript
// src/utils/deepLinks.ts
import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');

export const linking = {
  prefixes: [prefix, 'quantixbet://'],
  config: {
    screens: {
      Main: {
        screens: {
          Dashboard: 'dashboard',
          Pools: {
            path: 'pools',
            screens: {
              PoolsList: 'list',
              PoolDetail: 'detail/:marketId',
            },
          },
          Network: 'network',
          Wallet: 'wallet',
          Profile: 'profile',
        },
      },
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
        },
      },
    },
  },
};

// Uso en NavigationContainer
<NavigationContainer linking={linking}>
  {/* ... */}
</NavigationContainer>
```

#### Configurar en `app.json`
```json
{
  "expo": {
    "scheme": "quantixbet",
    "ios": {
      "bundleIdentifier": "com.saluna.quantixbet",
      "associatedDomains": ["applinks:quantixbet.app"]
    },
    "android": {
      "package": "com.saluna.quantixbet",
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "quantixbet"
            },
            {
              "scheme": "https",
              "host": "quantixbet.app"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

---

## 🏗️ **BUILD Y DEPLOYMENT**

### Configurar EAS Build

```bash
# Login a Expo
eas login

# Configurar proyecto
eas build:configure

# Build para desarrollo
eas build --profile development --platform ios
eas build --profile development --platform android

# Build para producción
eas build --profile production --platform all
```

### `eas.json`
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABC123XYZ"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

## 📝 **CHECKLIST FINAL**

### Pre-Launch
- [ ] Configurar Supabase en móvil
- [ ] Implementar auth flow completo
- [ ] Testing en iOS (físico + simulator)
- [ ] Testing en Android (físico + emulator)
- [ ] Configurar push notifications
- [ ] Configurar deep linking
- [ ] Configurar analytics (Firebase/Mixpanel)
- [ ] Testing de performance
- [ ] Optimizar imágenes y assets
- [ ] Configurar error tracking (Sentry)

### Launch
- [ ] Build de producción iOS
- [ ] Build de producción Android
- [ ] Submit a App Store
- [ ] Submit a Google Play
- [ ] Configurar metadata de stores
- [ ] Screenshots y assets de marketing
- [ ] Privacy policy y términos
- [ ] Monitoreo post-launch

---

## 🎯 **PRÓXIMOS PASOS**

1. **Crear proyecto Expo:** `npx create-expo-app quantixbet-mobile --template blank-typescript`
2. **Instalar dependencias** listadas en Setup Inicial
3. **Configurar Supabase** con las credenciales del proyecto
4. **Implementar Fase 1** (Core Functionality)
5. **Testing continuo** en ambas plataformas
6. **Deploy beta** para testing con usuarios reales

---

## 🔗 **RECURSOS**

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/quickstarts/react-native)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

---

**🚀 PROYECTO LISTO PARA DESARROLLO 🚀**
