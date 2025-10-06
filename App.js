import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Image, // Importamos 'Image'
  StyleSheet, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Animated
} from 'react-native';

// --- Sistema de Diseño (Theme) ---
const theme = {
  colors: {
    background: '#0F172A',
    surface: '#1F2937',
    text: '#E5E7EB',
    subtext: '#94A3B8',
    primary: '#22D3EE',
    accent: '#38BDF8',
    white: '#FFFFFF',
    star: '#FBBF24',
    success: '#22C55E',
    highlight: 'rgba(34, 211, 238, 0.15)',
    danger: '#EF4444',
  },
  spacing: { sm: 8, md: 16, lg: 24 },
  typography: {
    h1: { fontSize: 32, fontWeight: '900', color: '#E5E7EB' },
    h2: { fontSize: 24, fontWeight: '700', color: '#E5E7EB' },
    h3: { fontSize: 18, fontWeight: '600', color: '#E5E7EB' },
    body: { fontSize: 16, color: '#E5E7EB' },
    caption: { fontSize: 12, color: '#94A3B8' },
  },
  borderRadius: { md: 12, lg: 20 },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
};

// --- Datos demo ---
const userProfile = { nombre: 'Son Goku', carrera: 'Ingeniería en Software', semestre: '6to', horasServicio: 120, horasRequeridas: 480 };
const campusLocations = [
  { id: 1, nombre: 'Biblioteca Central Informática', categoria: 'Estudio', descripcion: 'Biblioteca especializada en tecnología y programación', horario: '7:00 AM - 9:00 PM', rating: 4.8, servicios: ['WiFi', 'Computadoras', 'Área silenciosa'], icon: '📚' },
  { id: 2, nombre: 'Lab de Redes', categoria: 'Laboratorio', descripcion: 'Laboratorio con equipos Cisco para networking', horario: '8:00 AM - 6:00 PM', rating: 4.5, servicios: ['Equipos Cisco', 'Simuladores'], icon: '🔬' },
  { id: 3, nombre: 'Cafetería FI "El comal++"', categoria: 'Comida', descripcion: 'Cafetería estudiantil con precios accesibles', horario: '7:30 AM - 4:00 PM', rating: 4.2, servicios: ['WiFi', 'Precios estudiante'], icon: '☕' }
];
const proyectosServicio = [
  { id: 1, titulo: 'Desarrollo Web para ONG', organizacion: 'Fundación Educativa Querétaro', descripcion: 'Crear sitio web con React para organización educativa', modalidad: 'Híbrido', horas: 150, tecnologias: ['React', 'Node.js', 'MongoDB'], status: 'Disponible' },
  { id: 2, titulo: 'Sistema Hospitalario', organizacion: 'Hospital General', descripcion: 'Sistema de inventario médico', modalidad: 'Presencial', horas: 200, tecnologias: ['Java', 'Spring', 'PostgreSQL'], status: 'Disponible' }
];
const eventos = [
  { id: 1, titulo: 'Hackathon FI 2025', fecha: '2025-09-15', hora: '9:00 AM', lugar: 'Aula Magna', descripcion: '48 horas de programación intensiva' },
  { id: 2, titulo: 'Conferencia IA', fecha: '2025-09-20', hora: '4:00 PM', lugar: 'Aula Magna', descripcion: 'Experto de Google hablará sobre IA' }
];

// --- Componente de Alerta Personalizada ---
const CustomAlert = ({ visible, title, message, onClose }) => (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.alertBackdrop}>
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <TouchableOpacity style={styles.alertButton} onPress={onClose}>
            <Text style={styles.alertButtonText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
);

// --- Componente de Pantalla de Carga (ACTUALIZADO para imagen local) ---
const LoadingScreen = () => {
    const opacity = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.7, duration: 1000, useNativeDriver: true }), // Menos opaco para el bucle
            ])
        ).start();
    }, [opacity]);

    return (
        <View style={styles.loadingContainer}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
            <Animated.Image
                source={require('./assets/logo.png')} // Carga tu imagen local desde 'assets'
                style={[styles.loadingLogoImage, { opacity }]} // Aplicamos estilo y animación
            />
        </View>
    );
};


const VidaUAQApp = () => {
  // App Loading
  const [isLoading, setIsLoading] = useState(true);

  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPassword2, setAuthPassword2] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: '', message: '' });

  // App UI
  const [activeTab, setActiveTab] = useState('campus');
  const [searchText, setSearchText] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [favorites, setFavorites] = useState([2]);

  // Simula la carga inicial de la app
  useEffect(() => {
    setTimeout(() => {
        setIsLoading(false);
    }, 2000); // Muestra el logo por 2 segundos
  }, []);

  const showAlert = (title, message) => {
    setAlertInfo({ title, message });
    setAlertVisible(true);
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text key={i} style={{ color: i < Math.round(rating) ? theme.colors.star : '#475569', fontSize: 16 }}>★</Text>
    ));
  };

  const handleAuthSubmit = () => {
    if (!authEmail || !authPassword || (authMode === 'signup' && (!authName || !authPassword2))) {
      showAlert('Campos incompletos', 'Por favor, rellena todos los campos para continuar.');
      return;
    }
    if (authMode === 'signup' && authPassword !== authPassword2) {
      showAlert('Error de Contraseña', 'Las contraseñas no coinciden. Inténtalo de nuevo.');
      return;
    }

    if (authMode === 'signup') {
      setSignupSuccess(true);
      setAuthPassword('');
      setAuthPassword2('');
      setAuthName('');
      return;
    }

    setIsAuthenticated(true);
    setActiveTab('campus');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthMode('login');
    setAuthPassword('');
    setAuthPassword2('');
    setAuthName('');
    setActiveTab('campus');
    setSearchText('');
    setSelectedLocation(null);
    setFavorites([2]);
  };

  // --- Pantalla de Login/Crear cuenta ---
  const LoginScreen = () => (
    <SafeAreaView style={styles.loginContainer}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'center' }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: theme.spacing.lg }}
          keyboardShouldPersistTaps="always"
        >
          <View style={{ padding: theme.spacing.lg }}>
            <Text style={styles.loginLogo}>UAQ</Text>
            <Text style={styles.loginTitle}>Vida Universitaria</Text>
            <Text style={styles.loginSubtitle}>
              {authMode === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta institucional'}
            </Text>

            {authMode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre completo</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Tu nombre"
                  placeholderTextColor={theme.colors.subtext}
                  value={authName}
                  onChangeText={setAuthName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Correo Institucional</Text>
              <TextInput
                style={styles.textInput}
                placeholder="alguien@uaq.edu.mx"
                placeholderTextColor={theme.colors.subtext}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={authEmail}
                onChangeText={setAuthEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.subtext}
                secureTextEntry
                value={authPassword}
                onChangeText={setAuthPassword}
              />
            </View>

            {authMode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirmar contraseña</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.subtext}
                  secureTextEntry
                  value={authPassword2}
                  onChangeText={setAuthPassword2}
                />
              </View>
            )}

            <TouchableOpacity style={styles.loginButton} onPress={handleAuthSubmit}>
              <Text style={styles.loginButtonText}>{authMode === 'login' ? 'Ingresar' : 'Crear cuenta'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchAuthContainer}
              onPress={() => setAuthMode(prev => (prev === 'login' ? 'signup' : 'login'))}
            >
              <Text style={styles.switchAuthText}>
                {authMode === 'login' ? '¿No tienes cuenta? Crear cuenta' : '¿Ya tienes cuenta? Inicia sesión'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={signupSuccess} transparent animationType="fade">
        <View style={styles.successBackdrop}>
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>✅ Cuenta creada</Text>
            <Text style={styles.successMsg}>
              Tu cuenta se creó con éxito. Pulsa “Volver al inicio” para iniciar sesión.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => {
                setSignupSuccess(false);
                setAuthMode('login');
              }}
            >
              <Text style={styles.successBtnText}>Volver al inicio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Usamos la alerta personalizada */}
      <CustomAlert 
        visible={alertVisible}
        title={alertInfo.title}
        message={alertInfo.message}
        onClose={() => setAlertVisible(false)}
      />

    </SafeAreaView>
  );

  // --- RENDERIZADO PRINCIPAL ---
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <LoginScreen />;

  // --- Tabs (sin cambios) ---
    const CampusTab = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.headerName}>🏛 Explora tu Campus</Text>
        <Text style={styles.headerSubtitle}>Facultad de Informática - Juriquilla</Text>
      </View>
      <View style={styles.searchContainer}>
        <Text style={{ fontSize: 20, marginRight: theme.spacing.sm }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar lugares..."
          placeholderTextColor={theme.colors.subtext}
          value={searchText}
          onChangeText={setSearchText}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>
      {campusLocations
        .filter(loc => loc.nombre.toLowerCase().includes(searchText.toLowerCase()))
        .map(location => (
          <TouchableOpacity key={location.id} style={styles.card} onPress={() => setSelectedLocation(location)}>
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 24, marginRight: theme.spacing.sm }}>{location.icon}</Text>
                <Text style={styles.cardTitle}>{location.nombre}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(location.id)}>
                <Text style={{ fontSize: 28 }}>{favorites.includes(location.id) ? '❤' : '🤍'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.description}>{location.descripcion}</Text>
            <View style={styles.metaRow}>
              <View style={styles.ratingContainer}>
                {renderStars(location.rating)}
                <Text style={styles.ratingText}>{location.rating}</Text>
              </View>
              <Text style={styles.scheduleText}>🕒 {location.horario}</Text>
            </View>
            <View style={styles.tagContainer}>
              {location.servicios.map(servicio => (
                <View key={servicio} style={styles.tag}>
                  <Text style={styles.tagText}>{servicio}</Text>
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
        <Text style={styles.headerName}>🎓 Servicio Social</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Progreso de Horas</Text>
        <View style={styles.progressBar}>
          <View
             style={[
                styles.progressFill,
                    { width: `${(userProfile.horasServicio / userProfile.horasRequeridas) * 100}%` }
                    ]}
/>
        </View>
        <Text style={styles.progressLabel}>
          {userProfile.horasServicio} de {userProfile.horasRequeridas} horas completadas
        </Text>
      </View>
      {proyectosServicio.map(proyecto => (
        <View key={proyecto.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{proyecto.titulo}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{proyecto.status}</Text>
            </View>
          </View>
          <Text style={styles.description}>🏢 {proyecto.organizacion}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.scheduleText}>{proyecto.modalidad}</Text>
            <Text style={styles.scheduleText}>{proyecto.horas} horas</Text>
          </View>
          <View style={styles.tagContainer}>
            {proyecto.tecnologias.map(tech => (
              <View key={tech} style={styles.tag}>
                <Text style={styles.tagText}>{tech}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Postularse</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const EventosTab = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerName}>📅 Eventos del Campus</Text>
      </View>
      {eventos.map(evento => {
        const date = new Date(evento.fecha + 'T00:00:00');
        const day = date.getDate();
        const month = date.toLocaleString('es-MX', { month: 'short' }).replace('.', '');
        return (
          <View key={evento.id} style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.eventDate}>
                <Text style={styles.eventDay}>{day}</Text>
                <Text style={styles.eventMonth}>{month}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{evento.titulo}</Text>
                <Text style={styles.description}>{evento.lugar} - {evento.hora}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  const PerfilTab = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerName}>👤 Mi Perfil</Text>
      </View>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userProfile.nombre.split(' ').map(n => n[0]).join('')}</Text>
        </View>
        <Text style={styles.profileName}>{userProfile.nombre}</Text>
        <Text style={styles.profileCareer}>{userProfile.carrera}</Text>
        <Text style={styles.profileSemester}>{userProfile.semestre} semestre</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProfile.horasServicio}</Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProfile.horasRequeridas - userProfile.horasServicio}</Text>
            <Text style={styles.statLabel}>Restantes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const TabBar = () => {
    const tabs = [
      { key: 'campus', icon: '🏛', label: 'Campus' },
      { key: 'servicio', icon: '🎓', label: 'Servicio' },
      { key: 'eventos', icon: '📅', label: 'Eventos' },
      { key: 'perfil', icon: '👤', label: 'Perfil' }
    ];
    return (
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBar}>
          {tabs.map(tab => (
            <TouchableOpacity key={tab.key} style={styles.tabItem} onPress={() => setActiveTab(tab.key)}>
              {activeTab === tab.key && <View style={styles.activeTabPill} />}
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  // App autenticada
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      {activeTab === 'campus' && <CampusTab />}
      {activeTab === 'servicio' && <ServicioTab />}
      {activeTab === 'eventos' && <EventosTab />}
      {activeTab === 'perfil' && <PerfilTab />}
      <TabBar />

      <Modal visible={!!selectedLocation} animationType="slide" transparent>
        {selectedLocation && (
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedLocation(null)}>
                <Text style={{ fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedLocation.nombre}</Text>
              <Text style={styles.description}>{selectedLocation.descripcion}</Text>
              <Text style={[styles.scheduleText, { marginVertical: theme.spacing.md }]}>🕒 {selectedLocation.horario}</Text>
              <TouchableOpacity style={styles.applyButton}><Text style={styles.applyButtonText}>Ver en mapa</Text></TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  // LOADING
  loadingContainer: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' },
  // Nuevo estilo para la imagen del logo en la pantalla de carga
  loadingLogoImage: {
    width: 250, // Ajusta el tamaño según sea necesario
    height: 250, // Ajusta el tamaño según sea necesario
    resizeMode: 'contain', // Asegura que la imagen se adapte sin cortarse
  },
  
  // LOGIN
  loginContainer: { flex: 1, backgroundColor: theme.colors.background },
  loginLogo: { ...theme.typography.h1, fontSize: 48, color: theme.colors.primary, textAlign: 'center', fontWeight: '900' },
  loginTitle: { ...theme.typography.h2, textAlign: 'center', marginTop: theme.spacing.sm },
  loginSubtitle: { ...theme.typography.body, color: theme.colors.subtext, textAlign: 'center', marginBottom: theme.spacing.lg * 2 },
  inputGroup: { marginBottom: theme.spacing.md },
  inputLabel: { ...theme.typography.caption, color: theme.colors.subtext, marginBottom: theme.spacing.sm },
  textInput: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, ...theme.typography.body, color: theme.colors.text },
  loginButton: { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, alignItems: 'center', marginTop: theme.spacing.md },
  loginButtonText: { color: theme.colors.background, fontWeight: 'bold', fontSize: 16 },
  switchAuthContainer: { alignItems: 'center', marginTop: theme.spacing.md },
  switchAuthText: { ...theme.typography.body, color: theme.colors.accent },

  // Éxito de registro
  successBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  successCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, marginHorizontal: theme.spacing.lg, alignItems: 'center', width: '85%' },
  successTitle: { ...theme.typography.h2, marginBottom: theme.spacing.sm, textAlign: 'center' },
  successMsg: { ...theme.typography.body, color: theme.colors.subtext, textAlign: 'center' },
  successBtn: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginTop: theme.spacing.lg, width: '100%', alignItems: 'center' },
  successBtnText: { color: theme.colors.background, fontWeight: 'bold' },
  
  // Custom Alert
  alertBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  alertCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, marginHorizontal: theme.spacing.lg, width: '85%', ...theme.shadow },
  alertTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.sm },
  alertMessage: { ...theme.typography.body, color: theme.colors.subtext, lineHeight: 22 },
  alertButton: { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, alignItems: 'center', marginTop: theme.spacing.lg },
  alertButtonText: { color: theme.colors.background, fontWeight: 'bold', fontSize: 16 },

  // APP (el resto de los estilos permanece igual)
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: theme.spacing.md },
  headerName: { ...theme.typography.h1 },
  headerSubtitle: { ...theme.typography.body, color: theme.colors.subtext, marginTop: -4 },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, marginHorizontal: theme.spacing.md, paddingHorizontal: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.sm, ...theme.shadow },
  searchInput: { flex: 1, ...theme.typography.body, paddingVertical: theme.spacing.md, color: theme.colors.text },

  card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.md, ...theme.shadow },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
  cardTitle: { ...theme.typography.h3, flexShrink: 1 },
  description: { ...theme.typography.body, color: theme.colors.subtext, marginVertical: theme.spacing.sm },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.sm },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { ...theme.typography.body, color: theme.colors.subtext, marginLeft: theme.spacing.sm },
  scheduleText: { ...theme.typography.caption, color: theme.colors.subtext },

  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: theme.spacing.md },
  tag: { backgroundColor: theme.colors.highlight, borderRadius: 6, paddingHorizontal: theme.spacing.sm, paddingVertical: 4, marginRight: theme.spacing.sm, marginBottom: theme.spacing.sm },
  tagText: { ...theme.typography.caption, color: theme.colors.primary, fontWeight: '600' },

  progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, marginTop: theme.spacing.md },
  progressFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 4 },
  progressLabel: { ...theme.typography.caption, alignSelf: 'flex-end', marginTop: theme.spacing.sm },

  statusBadge: { backgroundColor: theme.colors.success, borderRadius: 50, paddingHorizontal: theme.spacing.sm, paddingVertical: 4 },
  statusBadgeText: { color: theme.colors.white, ...theme.typography.caption, fontWeight: 'bold' },

  applyButton: { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, alignItems: 'center', marginTop: theme.spacing.md },
  applyButtonText: { color: theme.colors.background, fontWeight: 'bold' },

  eventDate: { alignItems: 'center', marginRight: theme.spacing.md, backgroundColor: theme.colors.highlight, padding: theme.spacing.sm, borderRadius: theme.borderRadius.md },
  eventDay: { ...theme.typography.h1, color: theme.colors.primary },
  eventMonth: { ...theme.typography.caption, textTransform: 'uppercase', color: theme.colors.primary, fontWeight: '600' },

  profileCard: { backgroundColor: theme.colors.surface, marginHorizontal: theme.spacing.md, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, alignItems: 'center', ...theme.shadow },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.md },
  avatarText: { ...theme.typography.h1, color: theme.colors.background },
  profileName: { ...theme.typography.h2 },
  profileCareer: { ...theme.typography.body, color: theme.colors.primary, marginVertical: theme.spacing.sm / 2 },
  profileSemester: { ...theme.typography.caption },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderColor: '#1E293B', marginTop: theme.spacing.md, paddingTop: theme.spacing.md, width: '100%' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { ...theme.typography.h2, color: theme.colors.text },
  statLabel: { ...theme.typography.caption, color: theme.colors.subtext },

  logoutButton: { backgroundColor: theme.colors.danger, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, alignItems: 'center', marginTop: theme.spacing.lg, width: '100%' },
  logoutButtonText: { color: theme.colors.white, fontWeight: 'bold' },

  tabBarContainer: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md, backgroundColor: theme.colors.background },
  tabBar: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: 50, padding: theme.spacing.sm, ...theme.shadow },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.sm, position: 'relative' },
  tabIcon: { fontSize: 24 },
  tabLabel: { ...theme.typography.caption, marginTop: 4 },
  activeTabLabel: { color: theme.colors.primary, fontWeight: '700' },
  activeTabPill: { position: 'absolute', backgroundColor: theme.colors.highlight, borderRadius: 30, width: '90%', height: '100%', zIndex: -1 },

  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.borderRadius.lg, borderTopRightRadius: theme.borderRadius.lg, padding: theme.spacing.lg },
  modalTitle: { ...theme.typography.h2, marginBottom: theme.spacing.sm },
  closeButton: { position: 'absolute', top: theme.spacing.md, right: theme.spacing.md, backgroundColor: theme.colors.background, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }
});

export default VidaUAQApp;