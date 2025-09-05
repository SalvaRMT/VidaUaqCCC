import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, StyleSheet } from 'react-native';

const VidaUAQApp = () => {
  const [activeTab, setActiveTab] = useState('campus');
  const [searchText, setSearchText] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const userProfile = {
    nombre: 'Son Goku',
    carrera: 'Ingeniería en Software',
    semestre: '6to',
    horasServicio: 120,
    horasRequeridas: 480
  };
  
  const campusLocations = [
    {
      id: 1,
      nombre: 'Biblioteca Central Informática',
      categoria: 'Estudio',
      descripcion: 'Biblioteca especializada en tecnología y programación',
      horario: '7:00 AM - 9:00 PM',
      rating: 4.8,
      servicios: ['WiFi', 'Computadoras', 'Área silenciosa']
    },
    {
      id: 2,
      nombre: 'Lab de Redes',
      categoria: 'Laboratorio',
      descripcion: 'Laboratorio con equipos Cisco para networking',
      horario: '8:00 AM - 6:00 PM',
      rating: 4.5,
      servicios: ['Equipos Cisco', 'Simuladores']
    },
    {
      id: 3,
      nombre: 'Cafetería FI "El comal++"',
      categoria: 'Comida',
      descripcion: 'Cafetería estudiantil con precios accesibles',
      horario: '7:30 AM - 4:00 PM',
      rating: 4.2,
      servicios: ['WiFi', 'Precios estudiante']
    }
  ];

  const proyectosServicio = [
    {
      id: 1,
      titulo: 'Desarrollo Web para ONG',
      organizacion: 'Fundación Educativa Querétaro',
      descripcion: 'Crear sitio web con React para organización educativa',
      modalidad: 'Híbrido',
      horas: 150,
      tecnologias: ['React', 'Node.js', 'MongoDB'],
      status: 'Disponible'
    },
    {
      id: 2,
      titulo: 'Sistema Hospitalario',
      organizacion: 'Hospital General',
      descripcion: 'Sistema de inventario médico',
      modalidad: 'Presencial',
      horas: 200,
      tecnologias: ['Java', 'Spring', 'PostgreSQL'],
      status: 'Disponible'
    }
  ];

  const eventos = [
    {
      id: 1,
      titulo: 'Hackathon FI 2025',
      fecha: '2025-09-15',
      hora: '9:00 AM',
      lugar: 'Aula Magna',
      descripcion: '48 horas de programación intensiva'
    },
    {
      id: 2,
      titulo: 'Conferencia IA',
      fecha: '2025-09-20',
      hora: '4:00 PM',
      lugar: 'Aula Magna',
      descripcion: 'Experto de Google hablará sobre IA'
    }
  ];

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const renderStars = (rating) => {
    return Array.from({length: 5}, (_, i) => (
      <Text key={i} style={[styles.star, { color: i < rating ? "#ffeaa7" : "#ddd" }]}>
        ★
      </Text>
    ));
  };

  const getIcon = (categoria) => {
    switch(categoria) {
      case 'Estudio': return '📚';
      case 'Comida': return '☕';
      case 'Laboratorio': return '🔬';
      default: return '📍';
    }
  };

  const CampusTab = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏛️ Explora tu Campus</Text>
        <Text style={styles.subtitle}>Facultad de Informática - Juriquilla</Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar lugares..."
          placeholderTextColor="#636e72"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {campusLocations.map(location => (
        <TouchableOpacity key={location.id} style={styles.card} onPress={() => setSelectedLocation(location)}>
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <Text style={styles.categoryIcon}>{getIcon(location.categoria)}</Text>
              <Text style={styles.cardTitle}>{location.nombre}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleFavorite(location.id)}>
              <Text style={[styles.heartIcon, { color: favorites.includes(location.id) ? "#d63031" : "#636e72" }]}>
                {favorites.includes(location.id) ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.description}>{location.descripcion}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.rating}>
              {renderStars(location.rating)}
              <Text style={styles.ratingText}>{location.rating}</Text>
            </View>
            <View style={styles.schedule}>
              <Text style={styles.clockIcon}>🕐</Text>
              <Text style={styles.scheduleText}>{location.horario}</Text>
            </View>
          </View>
          
          <View style={styles.services}>
            {location.servicios.map(servicio => (
              <View key={servicio} style={styles.serviceTag}>
                <Text style={styles.serviceText}>{servicio}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const ServicioTab = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎓 Servicio Social</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {userProfile.horasServicio}/{userProfile.horasRequeridas} horas
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(userProfile.horasServicio/userProfile.horasRequeridas)*100}%` }]} />
          </View>
        </View>
      </View>

      {proyectosServicio.map(proyecto => (
        <View key={proyecto.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{proyecto.titulo}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{proyecto.status}</Text>
            </View>
          </View>
          
          <Text style={styles.organization}>🏢 {proyecto.organizacion}</Text>
          <Text style={styles.description}>{proyecto.descripcion}</Text>
          
          <View style={styles.metaRow}>
            <Text style={styles.modalidad}>{proyecto.modalidad}</Text>
            <Text style={styles.horas}>{proyecto.horas}h</Text>
          </View>
          
          <View style={styles.techTags}>
            {proyecto.tecnologias.map(tech => (
              <View key={tech} style={styles.techTag}>
                <Text style={styles.techText}>{tech}</Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.applyText}>Postularse</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const EventosTab = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📅 Eventos del Campus</Text>
      </View>

      {eventos.map(evento => (
        <View key={evento.id} style={styles.eventCard}>
          <View style={styles.eventDate}>
            <Text style={styles.eventMonth}>SEP</Text>
            <Text style={styles.eventDay}>{new Date(evento.fecha).getDate()}</Text>
          </View>
          
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{evento.titulo}</Text>
            <View style={styles.eventMeta}>
              <Text style={styles.clockIcon}>🕐</Text>
              <Text style={styles.eventTime}>{evento.hora}</Text>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.eventLocation}>{evento.lugar}</Text>
            </View>
            <Text style={styles.eventDesc}>{evento.descripcion}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const PerfilTab = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 Mi Perfil</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JP</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userProfile.nombre}</Text>
            <Text style={styles.profileCareer}>{userProfile.carrera}</Text>
            <Text style={styles.profileSemester}>{userProfile.semestre} semestre</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statNumber}>{userProfile.horasServicio}</Text>
            <Text style={styles.statLabel}>Horas completadas</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>⏰</Text>
            <Text style={styles.statNumber}>{userProfile.horasRequeridas - userProfile.horasServicio}</Text>
            <Text style={styles.statLabel}>Horas restantes</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>❤️</Text>
            <Text style={styles.statNumber}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.app}>
      <View style={styles.content}>
        {activeTab === 'campus' && <CampusTab />}
        {activeTab === 'servicio' && <ServicioTab />}
        {activeTab === 'eventos' && <EventosTab />}
        {activeTab === 'perfil' && <PerfilTab />}
      </View>

      <View style={styles.tabBar}>
        {[
          { key: 'campus', icon: '🏛️', label: 'Campus' },
          { key: 'servicio', icon: '🎓', label: 'Servicio' },
          { key: 'eventos', icon: '📅', label: 'Eventos' },
          { key: 'perfil', icon: '👤', label: 'Perfil' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabIcon, activeTab === tab.key && styles.activeTabIcon]}>
              {tab.icon}
            </Text>
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={!!selectedLocation} animationType="slide" transparent>
        {selectedLocation && (
          <View style={styles.modal}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedLocation(null)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedLocation.nombre}</Text>
              <Text style={styles.modalDesc}>{selectedLocation.descripcion}</Text>
              <Text style={styles.modalSchedule}>🕒 {selectedLocation.horario}</Text>
              <TouchableOpacity style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Ver en mapa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#2d3436' },
  content: { flex: 1 },
  container: { flex: 1, backgroundColor: '#2d3436' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#1e272e' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#74b9ff', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#636e72' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e272e', margin: 15, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#40505f' },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#ddd' },
  card: { backgroundColor: '#1e272e', margin: 15, marginTop: 0, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#40505f' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  categoryIcon: { fontSize: 18, marginRight: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#ddd' },
  heartIcon: { fontSize: 20 },
  description: { fontSize: 14, color: '#636e72', marginBottom: 10 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rating: { flexDirection: 'row', alignItems: 'center' },
  star: { fontSize: 14, marginRight: 2 },
  ratingText: { color: '#ddd', marginLeft: 5, fontSize: 14 },
  schedule: { flexDirection: 'row', alignItems: 'center' },
  clockIcon: { fontSize: 14, marginRight: 4 },
  scheduleText: { color: '#636e72', fontSize: 12 },
  services: { flexDirection: 'row', flexWrap: 'wrap' },
  serviceTag: { backgroundColor: '#40505f', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 6, marginBottom: 4 },
  serviceText: { color: '#74b9ff', fontSize: 12 },
  progressContainer: { marginTop: 10 },
  progressText: { color: '#74b9ff', fontSize: 16, fontWeight: '600', marginBottom: 5 },
  progressBar: { height: 8, backgroundColor: '#40505f', borderRadius: 4 },
  progressFill: { height: '100%', backgroundColor: '#00b894', borderRadius: 4 },
  organization: { fontSize: 14, color: '#74b9ff', marginBottom: 8 },
  statusBadge: { backgroundColor: '#00b894', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  modalidad: { color: '#74b9ff', fontSize: 14 },
  horas: { color: '#636e72', fontSize: 14 },
  techTags: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
  techTag: { backgroundColor: '#40505f', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, marginRight: 6, marginBottom: 4 },
  techText: { color: '#74b9ff', fontSize: 11 },
  applyButton: { backgroundColor: '#74b9ff', padding: 12, borderRadius: 8, alignItems: 'center' },
  applyText: { color: '#fff', fontWeight: 'bold' },
  eventCard: { backgroundColor: '#1e272e', margin: 15, marginTop: 0, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#40505f', flexDirection: 'row' },
  eventDate: { backgroundColor: '#74b9ff', width: 50, height: 50, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  eventMonth: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  eventDay: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#ddd', marginBottom: 5 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  eventTime: { color: '#636e72', marginLeft: 4, marginRight: 10, fontSize: 12 },
  locationIcon: { fontSize: 14, marginRight: 4 },
  eventLocation: { color: '#636e72', fontSize: 12 },
  eventDesc: { fontSize: 14, color: '#636e72' },
  profileCard: { backgroundColor: '#1e272e', margin: 15, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#40505f' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#40505f', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  avatarText: { color: '#74b9ff', fontSize: 18, fontWeight: 'bold' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#ddd', marginBottom: 3 },
  profileCareer: { fontSize: 14, color: '#74b9ff', marginBottom: 2 },
  profileSemester: { fontSize: 12, color: '#636e72' },
  stats: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statIcon: { fontSize: 24, marginBottom: 5 },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#ddd', marginBottom: 2 },
  statLabel: { fontSize: 10, color: '#636e72', textAlign: 'center' },
  tabBar: { flexDirection: 'row', backgroundColor: '#1e272e', paddingBottom: 25, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#40505f' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  tabIcon: { fontSize: 22, marginBottom: 4 },
  activeTabIcon: { color: '#74b9ff' },
  tabText: { fontSize: 11, color: '#636e72' },
  activeTabText: { color: '#74b9ff', fontWeight: '600' },
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1e272e', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  closeBtn: { position: 'absolute', top: 15, right: 15, width: 30, height: 30, borderRadius: 15, backgroundColor: '#40505f', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  closeText: { color: '#ddd', fontSize: 16, fontWeight: 'bold' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#ddd', marginBottom: 10, marginTop: 15 },
  modalDesc: { fontSize: 14, color: '#636e72', marginBottom: 10 },
  modalSchedule: { fontSize: 14, color: '#74b9ff', marginBottom: 15 },
  modalButton: { backgroundColor: '#74b9ff', padding: 15, borderRadius: 10, alignItems: 'center' },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default VidaUAQApp;