import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import React, {
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

  const [errors, setErrors] = useState<any>({});

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


  const validateForm = () => {

  let newErrors: any = {};

  if (!formData.name.trim()) {
    newErrors.name = 'El nombre es obligatorio';
  }

  if (!formData.category.trim()) {
    newErrors.category = 'La categoría es obligatoria';
  }

  if (!formData.quantity.trim()) {
    newErrors.quantity = 'La cantidad es obligatoria';
  }

  if (!formData.unit.trim()) {
    newErrors.unit = 'La unidad es obligatoria';
  }

  if (!formData.location.trim()) {
    newErrors.location = 'La ubicación es obligatoria';
  }

  if (!formData.supplier.trim()) {
    newErrors.supplier = 'El proveedor es obligatorio';
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;

};

const renderInput = (
  label: string,
  value: string,
  onChangeText: (text: string) => void,
  error?: string,
  keyboardType: any = 'default'
) => (

  <View style={styles.inputGroup}>

    <Text style={styles.inputLabel}>
      {label}
    </Text>

    <TextInput
      style={[
        styles.input,
        error && styles.inputError
      ]}
      placeholder={label}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholderTextColor="#9ca3af"
    />

    {error && (

      <Text style={styles.errorText}>
        {error}
      </Text>

    )}

  </View>

);



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




useFocusEffect(
  React.useCallback(() => {

    fetchItems();

  }, [])
);





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
              Vence:{' '}
              {item.expiryDate
              ? new Date(item.expiryDate)
              .toLocaleDateString('es-ES')
              : 'Sin fecha'}
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
    style={styles.modalContainer}
    showsVerticalScrollIndicator={false}
  >

    <Text style={styles.modalTitle}>
      {editingItem
        ? 'Editar Artículo'
        : 'Agregar Artículo'}
    </Text>





    {renderInput(
      'Nombre del artículo',
      formData.name,
      (text) =>
        setFormData({
          ...formData,
          name: text
        }),
      errors.name
    )}






    {renderInput(
      'Categoría',
      formData.category,
      (text) =>
        setFormData({
          ...formData,
          category: text
        }),
      errors.category
    )}

    <View style={styles.credentialsBox}>

            <Text style={styles.credentialsTitle}>
              Categorías disponibles:
            </Text>

            <Text style={styles.credentialText}>
              • Medicamentos
            </Text>

            <Text style={styles.credentialText}>
              • Protección
            </Text>

            <Text style={styles.credentialText}>
              • Insumos
            </Text>

            <Text style={styles.credentialText}>
              • Limpieza
            </Text>

          </View>




    {renderInput(
      'Cantidad',
      formData.quantity,
      (text) =>
        setFormData({
          ...formData,
          quantity: text
        }),
      errors.quantity,
      'numeric'
    )}






    {renderInput(
      'Unidad',
      formData.unit,
      (text) =>
        setFormData({
          ...formData,
          unit: text
        }),
      errors.unit
    )}






    {renderInput(
      'Ubicación',
      formData.location,
      (text) =>
        setFormData({
          ...formData,
          location: text
        }),
      errors.location
    )}






    {renderInput(
      'Fecha vencimiento (YYYY-MM-DD)',
      formData.expiryDate,
      (text) =>
        setFormData({
          ...formData,
          expiryDate: text
        }),
      undefined
    )}






    {renderInput(
      'Stock mínimo',
      formData.minStock,
      (text) =>
        setFormData({
          ...formData,
          minStock: text
        }),
      undefined,
      'numeric'
    )}






    {renderInput(
      'Proveedor',
      formData.supplier,
      (text) =>
        setFormData({
          ...formData,
          supplier: text
        }),
      errors.supplier
    )}

  <View style={styles.credentialsBox}>

            <Text style={styles.credentialsTitle}>
              Proveedores disponibles:
            </Text>

            <Text style={styles.credentialText}>
              • FarmaDistribuidora S.A.
            </Text>

            <Text style={styles.credentialText}>
              • Medical Supplies
            </Text>

            </View>




    <TouchableOpacity
      style={styles.saveButton}
      onPress={async () => {

        if (!validateForm()) {
          return;
        }

        if (editingItem) {

          await handleUpdateItem();

        } else {

          await handleAddItem();

        }

        setShowAddModal(false);

      }}
    >

      <Text style={styles.saveButtonText}>
        Guardar
      </Text>

    </TouchableOpacity>






    <TouchableOpacity
      style={styles.cancelButton}
      onPress={() =>
        setShowAddModal(false)
      }
    >

      <Text style={styles.cancelButtonText}>
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

  modalContainer: {
  flex: 1,
  backgroundColor: '#f5f5f5',
  padding: 20,
},

modalTitle: {
  fontSize: 26,
  fontWeight: 'bold',
  color: '#1f2937',
  marginBottom: 24,
  marginTop: 20,
},

inputGroup: {
  marginBottom: 18,
},

inputLabel: {
  fontSize: 14,
  fontWeight: '600',
  color: '#374151',
  marginBottom: 8,
},

input: {
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#d1d5db',
  borderRadius: 12,
  padding: 14,
  fontSize: 16,
  color: '#111827',
},

inputError: {
  borderColor: '#ef4444',
},

errorText: {
  color: '#ef4444',
  fontSize: 12,
  marginTop: 6,
},

saveButton: {
  backgroundColor: '#2563eb',
  padding: 16,
  borderRadius: 12,
  alignItems: 'center',
  marginTop: 10,
},

saveButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},

cancelButton: {
  backgroundColor: '#e5e7eb',
  padding: 16,
  borderRadius: 12,
  alignItems: 'center',
  marginTop: 12,
  marginBottom: 40,
},

cancelButtonText: {
  color: '#374151',
  fontSize: 16,
  fontWeight: '600',
},

  credentialsBox: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  credentialsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  credentialText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
});