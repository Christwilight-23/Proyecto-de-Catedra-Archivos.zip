import { Picker } from '@react-native-picker/picker';
import React, {
  useEffect,
  useState
} from 'react';

import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { MedicalItem } from '../types/MedicalItem';

export default function InventoryScreen() {

  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  const [items, setItems] = useState<MedicalItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('all');

  const [sortFilter, setSortFilter] = useState('none');

  const [showAddModal, setShowAddModal] = useState(false);

  const [editingItem, setEditingItem] =
    useState<MedicalItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'medicamentos',
    quantity: '',
    unit: '',
    location: '',
    expiryDate: '',
    minStock: '',
    supplier: '',
  });





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
        category: item.categoria || 'Sin categoría',
        quantity: item.cantidad,
        unit: item.unidad_medida,
        location: item.ubicacion,
        expiryDate: item.fecha_vencimiento,
        minStock: item.min_stock,
        supplier: item.proveedor || 'Sin proveedor',
      }));

      setItems(mappedData);

    } catch (error) {

      console.log(error);

      Alert.alert(
        'Error',
        'No se pudieron cargar los artículos'
      );

    } finally {

      setLoading(false);

    }

  };





  const handleAddItem = async () => {

    try {

      const response = await fetch(
        'http://192.168.1.10:3000/articulos',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            nombre: formData.name,
            categoria: formData.category,
            cantidad: Number(formData.quantity),
            unidad_medida: formData.unit,
            ubicacion: formData.location,
            fecha_vencimiento: formData.expiryDate,
            min_stock: Number(formData.minStock),
            proveedor: formData.supplier,
          }),
        }
      );

      if (response.ok) {

        Alert.alert(
          'Éxito',
          'Artículo agregado'
        );

        fetchItems();

      }

    } catch (error) {

      console.log(error);

    }

  };





  const handleUpdateItem = async () => {

    if (!editingItem) return;

    try {

      const response = await fetch(
        `http://192.168.1.10:3000/articulos/${editingItem.id}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            nombre: formData.name,
            categoria: formData.category,
            cantidad: Number(formData.quantity),
            unidad_medida: formData.unit,
            ubicacion: formData.location,
            fecha_vencimiento: formData.expiryDate,
            min_stock: Number(formData.minStock),
            proveedor: formData.supplier,
          }),
        }
      );

      if (response.ok) {

        Alert.alert(
          'Éxito',
          'Artículo actualizado'
        );

        fetchItems();

      }

    } catch (error) {

      console.log(error);

    }

  };





  const handleDelete = async (id: string) => {

    Alert.alert(
      'Eliminar',
      '¿Deseas eliminar este artículo?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },

        {
          text: 'Eliminar',
          style: 'destructive',

          onPress: async () => {

            try {

              const response = await fetch(
                `http://192.168.1.10:3000/articulos/${id}`,
                {
                  method: 'DELETE',
                }
              );

              if (response.ok) {

                Alert.alert(
                  'Éxito',
                  'Artículo eliminado'
                );

                fetchItems();

              }

            } catch (error) {

              console.log(error);

            }

          },
        },
      ]
    );

  };





  useEffect(() => {

    fetchItems();

  }, []);





  const filteredItems = items
    .filter((item) => {

      const matchesSearch =
        item.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' ||
        item.category === categoryFilter;

      return matchesSearch && matchesCategory;

    })

    .sort((a, b) => {

      if (
        sortFilter === 'fifo' ||
        sortFilter === 'expiring-soon'
      ) {

        return (
          new Date(a.expiryDate).getTime() -
          new Date(b.expiryDate).getTime()
        );

      }

      if (sortFilter === 'expiring-late') {

        return (
          new Date(b.expiryDate).getTime() -
          new Date(a.expiryDate).getTime()
        );

      }

      if (sortFilter === 'low-stock') {

        return a.quantity - b.quantity;

      }

      return 0;

    });





  if (loading) {

    return (
      <View style={styles.container}>
        <Text style={{ padding: 20 }}>
          Cargando...
        </Text>
      </View>
    );

  }





  return (
    <View style={styles.container}>

      <View style={styles.header}>

        <Text style={styles.title}>
          Inventario
        </Text>

      </View>





      <View style={styles.filters}>

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />





        <View style={styles.pickerContainer}>

          <Picker
            selectedValue={categoryFilter}
            onValueChange={(value) =>
              setCategoryFilter(value)
            }
          >
            <Picker.Item label="Todas" value="all" />
            <Picker.Item label="Medicamentos" value="medicamentos" />
            <Picker.Item label="Equipos" value="equipos" />
          </Picker>

        </View>





        <View style={styles.pickerContainer}>

          <Picker
            selectedValue={sortFilter}
            onValueChange={(value) =>
              setSortFilter(value)
            }
          >

            <Picker.Item
              label="Sin orden"
              value="none"
            />

            <Picker.Item
              label="FIFO"
              value="fifo"
            />

            <Picker.Item
              label="Próximos a vencer"
              value="expiring-soon"
            />

            <Picker.Item
              label="Vencimiento lejano"
              value="expiring-late"
            />

            <Picker.Item
              label="Stock bajo"
              value="low-stock"
            />

          </Picker>

        </View>





        {isAdmin && (

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {

              setEditingItem(null);

              setFormData({
                name: '',
                category: '',
                quantity: '',
                unit: '',
                location: '',
                expiryDate: '',
                minStock: '',
                supplier: '',
              });

              setShowAddModal(true);

            }}
          >

            <Text style={styles.addButtonText}>
              Agregar
            </Text>

          </TouchableOpacity>

        )}

      </View>





      <ScrollView style={styles.list}>

        {filteredItems.map((item) => (

          <View
            key={item.id}
            style={styles.itemCard}
          >

            <Text style={styles.itemName}>
              {item.name}
            </Text>

            <Text style={styles.itemInfo}>
              Categoría: {item.category}
            </Text>

            <Text style={styles.itemInfo}>
              Cantidad: {item.quantity} {item.unit}
            </Text>

            <Text style={styles.itemInfo}>
              Ubicación: {item.location}
            </Text>

            <Text style={styles.itemInfo}>
              Stock mínimo: {item.minStock}
            </Text>

            <Text style={styles.itemInfo}>
              Proveedor: {item.supplier}
            </Text>

            <Text style={styles.itemInfo}>
              Vence: {item.expiryDate}
            </Text>





            {isAdmin && (

              <View style={styles.itemActions}>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {

                    setEditingItem(item);

                    setFormData({
                      name: item.name,
                      category: item.category,
                      quantity: item.quantity.toString(),
                      unit: item.unit,
                      location: item.location,
                      expiryDate: item.expiryDate,
                      minStock: item.minStock.toString(),
                      supplier: item.supplier,
                    });

                    setShowAddModal(true);

                  }}
                >

                  <Text>
                    Editar
                  </Text>

                </TouchableOpacity>





                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    handleDelete(item.id)
                  }
                >

                  <Text>
                    Eliminar
                  </Text>

                </TouchableOpacity>

              </View>

            )}

          </View>

        ))}

      </ScrollView>





      <Modal
        visible={showAddModal}
        animationType="slide"
      >

        <ScrollView
          style={{ flex: 1, padding: 20 }}
        >

          <Text style={styles.title}>
            {editingItem
              ? 'Editar'
              : 'Agregar'}
          </Text>





          <TextInput
            placeholder="Nombre"
            style={styles.searchInput}
            value={formData.name}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                name: text
              })
            }
          />





          <TextInput
            placeholder="Categoría"
            style={styles.searchInput}
            value={formData.category}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                category: text
              })
            }
          />





          <TextInput
            placeholder="Cantidad"
            keyboardType="numeric"
            style={styles.searchInput}
            value={formData.quantity}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                quantity: text
              })
            }
          />





          <TextInput
            placeholder="Unidad"
            style={styles.searchInput}
            value={formData.unit}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                unit: text
              })
            }
          />





          <TextInput
            placeholder="Ubicación"
            style={styles.searchInput}
            value={formData.location}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                location: text
              })
            }
          />





          <TextInput
            placeholder="Fecha vencimiento"
            style={styles.searchInput}
            value={formData.expiryDate}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                expiryDate: text
              })
            }
          />





          <TextInput
            placeholder="Stock mínimo"
            keyboardType="numeric"
            style={styles.searchInput}
            value={formData.minStock}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                minStock: text
              })
            }
          />





          <TextInput
            placeholder="Proveedor"
            style={styles.searchInput}
            value={formData.supplier}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                supplier: text
              })
            }
          />





          <TouchableOpacity
            style={styles.addButton}
            onPress={async () => {

              if (editingItem) {

                await handleUpdateItem();

              } else {

                await handleAddItem();

              }

              setShowAddModal(false);

            }}
          >

            <Text style={styles.addButtonText}>
              Guardar
            </Text>

          </TouchableOpacity>





          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              setShowAddModal(false)
            }
          >

            <Text>
              Cancelar
            </Text>

          </TouchableOpacity>

        </ScrollView>

      </Modal>

    </View>
  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  header: {
    padding: 20,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  filters: {
    padding: 16,
  },

  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },

  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
  },

  addButton: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },

  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  list: {
    flex: 1,
    padding: 16,
  },

  itemCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  itemInfo: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },

  itemActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },

  actionButton: {
    padding: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },

});