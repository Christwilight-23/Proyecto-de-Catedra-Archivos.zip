import { Ionicons } from '@expo/vector-icons';

import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { MedicalItem } from '../types/MedicalItem';

export default function InsightsScreen() {

  const [items, setItems] =
    useState<MedicalItem[]>([]);

  const [loading, setLoading] =
    useState(true);





  const fetchItems = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        'http://192.168.1.10:3000/articulos'
      );

      const data = await response.json();

      const mappedData: MedicalItem[] =
        data.map((item: any) => ({

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





  const insights = useMemo(() => {

    const categoryCount:
      Record<string, number> = {};

    const lowStockItems:
      MedicalItem[] = [];

    const expiringItems:
      MedicalItem[] = [];

    const today = new Date();

    const thirtyDaysFromNow =
      new Date();

    thirtyDaysFromNow.setDate(
      today.getDate() + 30
    );





    items.forEach((item) => {

      categoryCount[item.category] =
        (categoryCount[item.category] || 0) + 1;





      if (
        item.quantity <= item.minStock
      ) {

        lowStockItems.push(item);

      }





      if (item.expiryDate) {

        const expiryDate =
          new Date(item.expiryDate);

        if (
          expiryDate <= thirtyDaysFromNow &&
          expiryDate >= today
        ) {

          expiringItems.push(item);

        }

      }

    });





    const mostUsedCategory =
      Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])[0];





    return {

      mostUsedCategory:
        mostUsedCategory
          ? mostUsedCategory[0]
          : 'N/A',

      mostUsedCount:
        mostUsedCategory
          ? mostUsedCategory[1]
          : 0,

      lowStockItems:
        lowStockItems.slice(0, 5),

      expiringItems:
        expiringItems.slice(0, 5),

      categoryDistribution:
        categoryCount,

    };

  }, [items]);





  const getCategoryLabel =
    (category: string) => {

      const labels:
        Record<string, string> = {

        medicamentos:
          'Medicamentos',

        equipos:
          'Equipos Médicos',

        consumibles:
          'Consumibles',

        instrumental:
          'Instrumental',

        diagnostico:
          'Diagnóstico',

        proteccion:
          'Protección Personal',

      };

      return labels[category] || category;

    };





  if (loading) {

    return (

      <View style={styles.loadingContainer}>

        <Text style={styles.loadingText}>
          Cargando insights...
        </Text>

      </View>

    );

  }





  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <View style={styles.header}>

        <Text style={styles.title}>
          Novedades e Insights
        </Text>

        <Text style={styles.subtitle}>
          Análisis avanzado del inventario
        </Text>

      </View>





      <View style={styles.content}>





        <View style={styles.insightCard}>

          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  '#dbeafe'
              }
            ]}
          >

            <Ionicons
              name="trending-up"
              size={24}
              color="#2563eb"
            />

          </View>

          <Text style={styles.cardTitle}>
            Categoría Más Usada
          </Text>

          <Text style={styles.cardValue}>

            {getCategoryLabel(
              insights.mostUsedCategory
            )}

          </Text>

          <Text style={styles.cardSubtext}>

            {insights.mostUsedCount}
            {' '}artículos

          </Text>

        </View>





        <View style={styles.insightCard}>

          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  '#e0e7ff'
              }
            ]}
          >

            <Ionicons
              name="pie-chart"
              size={24}
              color="#6366f1"
            />

          </View>

          <Text style={styles.cardTitle}>
            Distribución por Categoría
          </Text>





          <View style={styles.distributionList}>

            {Object.entries(
              insights.categoryDistribution
            )

              .sort((a, b) => b[1] - a[1])

              .slice(0, 5)

              .map(([category, count]) => (

                <View
                  key={category}
                  style={styles.distributionRow}
                >

                  <Text
                    style={
                      styles.distributionLabel
                    }
                  >

                    {getCategoryLabel(
                      category
                    )}

                  </Text>

                  <Text
                    style={
                      styles.distributionValue
                    }
                  >

                    {count}

                  </Text>

                </View>

              ))}

          </View>

        </View>





        <View style={styles.insightCard}>

          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  '#fef3c7'
              }
            ]}
          >

            <Ionicons
              name="alert-circle"
              size={24}
              color="#f59e0b"
            />

          </View>

          <Text style={styles.cardTitle}>
            Stock Bajo
          </Text>





          {insights.lowStockItems.length === 0 ? (

            <Text style={styles.emptyText}>
              No hay artículos con stock bajo
            </Text>

          ) : (

            <View style={styles.itemsList}>

              {insights.lowStockItems.map(
                (item) => (

                  <View
                    key={item.id}
                    style={styles.itemRow}
                  >

                    <View style={styles.itemInfo}>

                      <Text
                        style={styles.itemName}
                      >

                        {item.name}

                      </Text>

                      <Text
                        style={
                          styles.itemLocation
                        }
                      >

                        {item.location}

                      </Text>

                    </View>

                    <Text
                      style={[
                        styles.itemQuantity,
                        {
                          color: '#f59e0b'
                        }
                      ]}
                    >

                      {item.quantity}
                      {' '}
                      {item.unit}

                    </Text>

                  </View>

                )
              )}

            </View>

          )}

        </View>





        <View style={styles.insightCard}>

          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  '#fee2e2'
              }
            ]}
          >

            <Ionicons
              name="time"
              size={24}
              color="#ef4444"
            />

          </View>

          <Text style={styles.cardTitle}>
            Próximos a Vencer
          </Text>





          {insights.expiringItems.length === 0 ? (

            <Text style={styles.emptyText}>
              No hay artículos próximos a vencer
            </Text>

          ) : (

            <View style={styles.itemsList}>

              {insights.expiringItems.map(
                (item) => (

                  <View
                    key={item.id}
                    style={styles.itemRow}
                  >

                    <View style={styles.itemInfo}>

                      <Text
                        style={styles.itemName}
                      >

                        {item.name}

                      </Text>

                      <Text
                        style={
                          styles.itemLocation
                        }
                      >

                        {item.location}

                      </Text>

                    </View>

                    <Text
                      style={[
                        styles.itemQuantity,
                        {
                          color: '#ef4444'
                        }
                      ]}
                    >

                      {new Date(
                        item.expiryDate
                      ).toLocaleDateString(
                        'es-ES'
                      )}

                    </Text>

                  </View>

                )
              )}

            </View>

          )}

        </View>

      </View>

    </ScrollView>

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
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
  },

  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },

  content: {
    padding: 16,
  },

  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },

  cardSubtext: {
    fontSize: 13,
    color: '#6b7280',
  },

  distributionList: {
    marginTop: 8,
  },

  distributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },

  distributionLabel: {
    fontSize: 14,
    color: '#374151',
  },

  distributionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },

  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },

  itemsList: {
    marginTop: 8,
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },

  itemInfo: {
    flex: 1,
  },

  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },

  itemLocation: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },

  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },

});