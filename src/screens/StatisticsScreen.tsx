import { Ionicons } from '@expo/vector-icons';
import React, {
  useEffect,
  useState
} from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { MedicalItem } from '../types/MedicalItem';

export default function StatisticsScreen() {

  const { user, logout } = useAuth();

  const [items, setItems] = useState<MedicalItem[]>([]);

  const [loading, setLoading] = useState(true);





  const fetchItems = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        'http://192.168.1.10:3000/articulos'
      );

      const data = await response.json();

      const mappedData: MedicalItem[] = data.map((item: any) => ({

        id: item.id.toString(),

        name: item.nombre,

        category:
          item.categoria ||
          item.categoria_nombre ||
          'Sin categoría',

        quantity: item.cantidad,

        unit: item.unidad_medida,

        location: item.ubicacion,

        expiryDate:
          item.fecha_vencimiento || '',

        minStock:
          item.min_stock || 0,

        supplier:
          item.proveedor ||
          item.proveedor_nombre ||
          'Sin proveedor',

      }));

      setItems(mappedData);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };





  useEffect(() => {

    fetchItems();

  }, []);





  const totalItems = items.length;

  const lowStockItems = items.filter(
    (item) => item.quantity <= item.minStock
  ).length;

  const outOfStockItems = items.filter(
    (item) => item.quantity === 0
  ).length;





  const expiringItems = items.filter((item) => {

    if (!item.expiryDate) return false;

    const today = new Date();

    const expiry = new Date(item.expiryDate);

    const daysUntilExpiry = Math.floor(
      (expiry.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    return daysUntilExpiry <= 30 &&
      daysUntilExpiry >= 0;

  }).length;





  const StatCard = ({
    title,
    value,
    icon,
    color,
    bgColor,
  }: {
    title: string;
    value: number;
    icon: any;
    color: string;
    bgColor: string;
  }) => (

    <View style={styles.statCard}>

      <View
        style={[
          styles.iconContainer,
          { backgroundColor: bgColor }
        ]}
      >

        <Ionicons
          name={icon}
          size={24}
          color={color}
        />

      </View>

      <View style={styles.statContent}>

        <Text style={styles.statValue}>
          {value}
        </Text>

        <Text style={styles.statTitle}>
          {title}
        </Text>

      </View>

    </View>

  );





  if (loading) {

    return (

      <View style={styles.loadingContainer}>

        <Text style={styles.loadingText}>
          Cargando estadísticas...
        </Text>

      </View>

    );

  }





  return (

    <View style={styles.container}>

      <View style={styles.header}>

        <View>

          <Text style={styles.greeting}>
            Hola, {user?.name}
          </Text>

          <Text style={styles.role}>

            {user?.role === 'admin'
              ? 'Administrador'
              : 'Médico'}

          </Text>

        </View>





  <TouchableOpacity
  onPress={() => {

    logout();

    router.replace('/login');

  }}
  style={styles.logoutButton}
>
  <Ionicons
    name="log-out-outline"
    size={24}
    color="#ef4444"
  />
</TouchableOpacity>

      </View>





      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.sectionTitle}>
          Estadísticas del Inventario
        </Text>

        <Text style={styles.sectionSubtitle}>
          Vista general del estado del inventario médico
        </Text>





        <View style={styles.statsGrid}>

          <StatCard
            title="Total de Artículos"
            value={totalItems}
            icon="cube-outline"
            color="#2563eb"
            bgColor="#dbeafe"
          />

          <StatCard
            title="Stock Bajo"
            value={lowStockItems}
            icon="alert-circle-outline"
            color="#f59e0b"
            bgColor="#fef3c7"
          />

          <StatCard
            title="Sin Stock"
            value={outOfStockItems}
            icon="close-circle-outline"
            color="#ef4444"
            bgColor="#fee2e2"
          />

          <StatCard
            title="Próximos a Vencer"
            value={expiringItems}
            icon="time-outline"
            color="#8b5cf6"
            bgColor="#ede9fe"
          />

        </View>

      </ScrollView>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 18,
  },

  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },

  role: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },

  logoutButton: {
    padding: 8,
  },

  content: {
    flex: 1,
    padding: 20,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },

  statsGrid: {
    gap: 16,
  },

  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  statContent: {
    flex: 1,
  },

  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },

  statTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },

});