import React, { useEffect, useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StatusBar,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  addDoc,
} from 'firebase/firestore';

import { auth, db } from './firebaseConfig';
import { colors, globalStyles } from './styles/globalStyles';

// Padding para que NO se meta debajo de la barra de notificaciones (Android)
const ANDROID_TOP = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

// ================== DATOS FALLBACK LOCALES ==================

const DEFAULT_CAMPUS = [
  {
    id: 'l1',
    nombre: 'Biblioteca FI Juriquilla',
    categoria: 'Estudio',
    descripcion: 'Espacio tranquilo con mesas, enchufes y WiFi.',
    horario: 'Lunes a viernes, 8:00–20:00',
    rating: 4.8,
    servicios: ['WiFi', 'Enchufes', 'Silencio'],
    emoji: '📚',
    direccion: 'FI Juriquilla, edificio principal',
    lat: 20.7042,
    lng: -100.447,
    accesibleRampa: true,
    banosAccesibles: true,
  },
  {
    id: 'l2',
    nombre: 'Cafetería FI',
    categoria: 'Comida',
    descripcion: 'Comida rápida, café y snacks.',
    horario: 'Lunes a viernes, 7:30–18:00',
    rating: 4.3,
    servicios: ['Comida económica', 'Bebidas', 'Mesas'],
    emoji: '☕',
    direccion: 'FI Juriquilla, planta baja',
    lat: 20.7044,
    lng: -100.446,
    accesibleRampa: true,
    banosAccesibles: false,
  },
];

const DEFAULT_PROYECTOS_SERVICIO = [
  {
    id: 'p1',
    titulo: 'Apoyo en laboratorio de cómputo',
    organizacion: 'FI – Laboratorios',
    descripcion: 'Control de equipos, registros y apoyo a usuarios.',
    modalidad: 'Presencial',
    horas: 120,
    tecnologias: ['Soporte básico', 'Inventarios'],
    requisitos: ['Ser alumno activo', 'Responsable'],
    carrera: ['Sistemas', 'Computación'],
    causa: 'Educación',
    horarioFlexible: false,
    accesible: true,
  },
  {
    id: 'p2',
    titulo: 'Difusión científica en redes',
    organizacion: 'Divulgación UAQ',
    descripcion: 'Crear contenido y difundir eventos científicos.',
    modalidad: 'Híbrida',
    horas: 100,
    tecnologias: ['Redes sociales', 'Diseño básico'],
    requisitos: ['Gusto por la divulgación'],
    carrera: ['Cualquiera'],
    causa: 'Divulgación',
    horarioFlexible: true,
    accesible: true,
  },
];

const DEFAULT_EVENTOS = [
  {
    id: 'e1',
    titulo: 'Feria de Servicio Social UAQ',
    descripcion: 'Conoce opciones de servicio social y prácticas.',
    fecha: '2025-03-15',
    campus: 'Juriquilla',
    tipo: 'Académico',
  },
  {
    id: 'e2',
    titulo: 'Torneo de fútbol inter-facultades',
    descripcion: 'Evento deportivo entre facultades UAQ.',
    fecha: '2025-04-10',
    campus: 'Centro',
    tipo: 'Deportivo',
  },
];

// ========= Utilidad para URLs de Google Drive =========
// Si pegas algo como:
// https://drive.google.com/file/d/ID_DEL_ARCHIVO/view?usp=sharing
// lo convierte a:
// https://drive.google.com/uc?export=view&id=ID_DEL_ARCHIVO
function normalizeImageUrl(url) {
  if (!url) return '';
  const DRIVE_PATTERN = /https?:\/\/drive\.google\.com\/file\/d\/([^/]+)/;
  const match = url.match(DRIVE_PATTERN);
  if (match && match[1]) {
    const id = match[1];
    return `https://drive.google.com/uc?export=view&id=${id}`;
  }
  return url;
}

// ================== TAB BAR ==================

function BottomTabBar({ currentTab, onTabChange }) {
  const tabs = [
    { id: 'Campus', label: 'Campus', icon: '📍' },
    { id: 'Servicio', label: 'Servicio', icon: '🤝' },
    { id: 'Eventos', label: 'Eventos', icon: '📅' },
    { id: 'Perfil', label: 'Perfil', icon: '👤' },
  ];

  return (
    <View style={globalStyles.bottomTabBar} accessible accessibilityRole="tablist">
      {tabs.map(tab => {
        const active = tab.id === currentTab;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[
              globalStyles.bottomTabItem,
              { backgroundColor: active ? colors.primaryDark : 'transparent' },
            ]}
            onPress={() => onTabChange(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
          >
            <Text style={globalStyles.bottomTabIcon}>{tab.icon}</Text>
            <Text
              style={[
                globalStyles.bottomTabLabel,
                active && globalStyles.bottomTabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ================== LOGIN / REGISTRO ==================

function LoginScreen({ onAuthenticated }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [role, setRole] = useState('alumno'); // alumno | maestro
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    setErrorMsg('');

    if (!email || !password || (isRegister && !nombre)) {
      setErrorMsg('Llena todos los campos requeridos.');
      return;
    }

    try {
      setLoading(true);

      if (isRegister) {
        // === REGISTRO ===
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;

        const userData = {
          uid,
          email,
          nombre,
          role,
          horasServicio: 0,
          horasRequeridas: 480,
          createdAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', uid), userData);
        onAuthenticated(userData);
      } else {
        // === LOGIN ===
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;

        const userRef = doc(db, 'users', uid);
        const snap = await getDoc(userRef);

        let userData;
        if (snap.exists()) {
          userData = snap.data();
        } else {
          userData = {
            uid,
            email: cred.user.email,
            nombre: cred.user.email,
            role: 'alumno',
            horasServicio: 0,
            horasRequeridas: 480,
            createdAt: new Date().toISOString(),
          };
          await setDoc(userRef, userData);
        }

        onAuthenticated(userData);
      }
    } catch (err) {
      console.log('Código de error auth:', err.code);
      console.log('Mensaje completo:', err.message);

      if (err.code === 'auth/user-not-found') {
        setErrorMsg('No existe una cuenta con ese correo.');
      } else if (err.code === 'auth/invalid-credential') {
        setErrorMsg('Correo o contraseña incorrectos.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('El correo no tiene un formato válido.');
      } else if (err.code === 'auth/api-key-not-valid') {
        setErrorMsg('Hay un problema con la configuración de Firebase (apiKey).');
      } else {
        setErrorMsg('Error de autenticación: ' + (err.message || ''));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        globalStyles.safeArea,
        { justifyContent: 'center', padding: 20, paddingTop: ANDROID_TOP },
      ]}
    >
      <StatusBar barStyle="light-content" />
      <Text
        style={[globalStyles.screenTitle, { textAlign: 'center', marginBottom: 4 }]}
      >
        Vida UAQ
      </Text>
      <Text
        style={[
          globalStyles.screenSubtitle,
          { textAlign: 'center', marginBottom: 20 },
        ]}
      >
        {isRegister
          ? 'Registra tu cuenta con correo UAQ'
          : 'Inicia sesión con tu correo UAQ'}
      </Text>

      {isRegister && (
        <TextInput
          placeholder="Nombre completo"
          placeholderTextColor={colors.textMuted}
          style={globalStyles.input}
          value={nombre}
          onChangeText={setNombre}
        />
      )}

      <TextInput
        placeholder="Correo institucional"
        placeholderTextColor={colors.textMuted}
        style={globalStyles.input}
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Contraseña"
        placeholderTextColor={colors.textMuted}
        style={globalStyles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {isRegister && (
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <TouchableOpacity
            style={[
              globalStyles.pill,
              { borderColor: role === 'alumno' ? colors.primary : colors.border },
            ]}
            onPress={() => setRole('alumno')}
          >
            <Text
              style={[
                globalStyles.pillText,
                role === 'alumno' && globalStyles.pillTextActive,
              ]}
            >
              🎓 Alumno
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              globalStyles.pill,
              { borderColor: role === 'maestro' ? colors.primary : colors.border },
            ]}
            onPress={() => setRole('maestro')}
          >
            <Text
              style={[
                globalStyles.pillText,
                role === 'maestro' && globalStyles.pillTextActive,
              ]}
            >
              👨‍🏫 Maestro
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {errorMsg ? <Text style={globalStyles.errorText}>{errorMsg}</Text> : null}

      <TouchableOpacity
        style={globalStyles.primaryButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={globalStyles.primaryButtonText}>
          {loading
            ? 'Procesando...'
            : isRegister
            ? 'Crear cuenta'
            : 'Iniciar sesión'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={globalStyles.outlineButton}
        onPress={() => {
          setIsRegister(!isRegister);
          setErrorMsg('');
        }}
      >
        <Text style={globalStyles.outlineButtonText}>
          {isRegister
            ? '¿Ya tienes cuenta? Inicia sesión'
            : '¿Aún no tienes cuenta? Regístrate'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ================== CAMPUS (MAPA + LISTA + CREAR UBICACIÓN) ==================

function CampusTab({ user }) {
  const isMaestro = user?.role === 'maestro';
  const [lugares, setLugares] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedLugar, setSelectedLugar] = useState(null);

  // form maestro
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoDescripcion, setNuevoDescripcion] = useState('');
  const [nuevoCategoria, setNuevoCategoria] = useState('');
  const [nuevoHorario, setNuevoHorario] = useState('');
  const [nuevoDireccion, setNuevoDireccion] = useState('');
  const [nuevoImageUrl, setNuevoImageUrl] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const qCampus = query(collection(db, 'campus'), orderBy('nombre'));
    const unsub = onSnapshot(
      qCampus,
      snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setLugares(data);
      },
      err => console.error('Error cargando campus', err),
    );
    return unsub;
  }, []);

  const data = lugares.length ? lugares : DEFAULT_CAMPUS;

  const filtered = data.filter(item => {
    const t = searchText.trim().toLowerCase();
    if (!t) return true;
    return (
      item.nombre?.toLowerCase().includes(t) ||
      item.categoria?.toLowerCase().includes(t) ||
      item.descripcion?.toLowerCase().includes(t)
    );
  });

  const openInMaps = direccion => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      direccion,
    )}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('No se pudo abrir Google Maps'),
    );
  };

  const crearLugar = async () => {
    if (!nuevoNombre.trim()) {
      Alert.alert('Nombre requerido');
      return;
    }
    try {
      setGuardando(true);

      const rawUrl = nuevoImageUrl.trim();
      const imageUrl = normalizeImageUrl(rawUrl);

      await addDoc(collection(db, 'campus'), {
        nombre: nuevoNombre.trim(),
        descripcion: nuevoDescripcion.trim(),
        categoria: nuevoCategoria.trim() || 'General',
        horario: nuevoHorario.trim(),
        direccion: nuevoDireccion.trim(),
        imageUrl: imageUrl || '',
        createdBy: user?.uid || null,
        createdAt: Date.now(),
      });

      setNuevoNombre('');
      setNuevoDescripcion('');
      setNuevoCategoria('');
      setNuevoHorario('');
      setNuevoDireccion('');
      setNuevoImageUrl('');
    } catch (e) {
      console.error(e);
      Alert.alert('No se pudo crear la ubicación');
    } finally {
      setGuardando(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => setSelectedLugar(item)}>
      <View style={globalStyles.card}>
        <View style={globalStyles.cardHeaderRow}>
          <Text style={globalStyles.cardTitle}>
            {item.emoji || '📍'} {item.nombre}
          </Text>
          {typeof item.rating === 'number' && (
            <View style={globalStyles.badge}>
              <Text style={globalStyles.badgeText}>⭐ {item.rating}</Text>
            </View>
          )}
        </View>

        <Text style={globalStyles.infoText}>{item.descripcion}</Text>

        <View style={globalStyles.cardChipRow}>
          {item.categoria && (
            <View style={globalStyles.chip}>
              <Text style={globalStyles.chipText}>{item.categoria}</Text>
            </View>
          )}
          {item.horario && (
            <View style={globalStyles.chip}>
              <Text style={globalStyles.chipText}>{item.horario}</Text>
            </View>
          )}
          {item.accesibleRampa && (
            <View style={globalStyles.chip}>
              <Text style={globalStyles.chipText}>♿ Rampas</Text>
            </View>
          )}
          {item.banosAccesibles && (
            <View style={globalStyles.chip}>
              <Text style={globalStyles.chipText}>🚻 Baños accesibles</Text>
            </View>
          )}
        </View>

        {Array.isArray(item.servicios) && item.servicios.length > 0 && (
          <Text style={globalStyles.infoText}>
            Servicios: {item.servicios.join(' • ')}
          </Text>
        )}

        {item.direccion && (
          <TouchableOpacity
            style={globalStyles.outlineButton}
            onPress={() => openInMaps(item.direccion)}
          >
            <Text style={globalStyles.outlineButtonText}>
              Abrir en Google Maps
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        style={globalStyles.screenContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={globalStyles.screenTitle}>Explora tu campus</Text>
        <Text style={globalStyles.screenSubtitle}>
          Busca espacios por nombre, categoría o descripción y ábrelos en Maps.
        </Text>

        <TextInput
          placeholder="Buscar (biblioteca, cafetería, laboratorio...)"
          placeholderTextColor={colors.textMuted}
          style={globalStyles.input}
          value={searchText}
          onChangeText={setSearchText}
        />

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
        />

        {isMaestro && (
          <View style={[globalStyles.card, { marginTop: 12 }]}>
            <Text style={globalStyles.cardTitle}>Crear ubicación</Text>
            <TextInput
              placeholder="Nombre del lugar"
              placeholderTextColor={colors.textMuted}
              style={globalStyles.input}
              value={nuevoNombre}
              onChangeText={setNuevoNombre}
            />
            <TextInput
              placeholder="Descripción"
              placeholderTextColor={colors.textMuted}
              style={[globalStyles.input, { height: 80 }]}
              multiline
              value={nuevoDescripcion}
              onChangeText={setNuevoDescripcion}
            />
            <TextInput
              placeholder="Categoría (Estudio, Comida...)"
              placeholderTextColor={colors.textMuted}
              style={globalStyles.input}
              value={nuevoCategoria}
              onChangeText={setNuevoCategoria}
            />
            <TextInput
              placeholder="Horario"
              placeholderTextColor={colors.textMuted}
              style={globalStyles.input}
              value={nuevoHorario}
              onChangeText={setNuevoHorario}
            />
            <TextInput
              placeholder="Dirección breve"
              placeholderTextColor={colors.textMuted}
              style={globalStyles.input}
              value={nuevoDireccion}
              onChangeText={setNuevoDireccion}
            />
            <TextInput
              placeholder="URL pública de la foto (Drive, Imgur...)"
              placeholderTextColor={colors.textMuted}
              style={globalStyles.input}
              value={nuevoImageUrl}
              onChangeText={setNuevoImageUrl}
              autoCapitalize="none"
            />

            {nuevoImageUrl ? (
              <Image
                source={{ uri: normalizeImageUrl(nuevoImageUrl) }}
                style={globalStyles.modalImage}
                resizeMode="cover"
              />
            ) : null}

            <TouchableOpacity
              style={globalStyles.primaryButton}
              onPress={crearLugar}
              disabled={guardando}
            >
              <Text style={globalStyles.primaryButtonText}>
                {guardando ? 'Guardando...' : 'Guardar ubicación'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {selectedLugar && (
        <Modal
          transparent
          animationType="fade"
          visible
          onRequestClose={() => setSelectedLugar(null)}
        >
          <View style={globalStyles.modalOverlay}>
            <View style={globalStyles.modalCard}>
              <Text style={globalStyles.cardTitle}>{selectedLugar.nombre}</Text>
              {selectedLugar.imageUrl ? (
                <Image
                  source={{ uri: normalizeImageUrl(selectedLugar.imageUrl) }}
                  style={globalStyles.modalImage}
                  resizeMode="cover"
                />
              ) : null}
              <Text style={globalStyles.modalDescription}>
                {selectedLugar.descripcion}
              </Text>
              <TouchableOpacity
                style={globalStyles.outlineButton}
                onPress={() => setSelectedLugar(null)}
              >
                <Text style={globalStyles.outlineButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

// ================== CHAT SIMPLE POR PROYECTO ==================

function ChatScreen({ proyecto, user, onBack }) {
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);

  useEffect(() => {
    if (!proyecto) return;

    // SIN orderBy para no pedir índice. Ordenamos en cliente.
    const qMensajes = query(
      collection(db, 'mensajes'),
      where('proyectoId', '==', proyecto.id),
    );
    const unsub = onSnapshot(
      qMensajes,
      snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        setMensajes(data);
      },
      err => console.error('Error en chat', err),
    );
    return unsub;
  }, [proyecto]);

  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;
    try {
      await addDoc(collection(db, 'mensajes'), {
        proyectoId: proyecto.id,
        uid: user.uid,
        nombre: user.nombre,
        texto: mensaje.trim(),
        createdAt: Date.now(),
      });
      setMensaje('');
    } catch (e) {
      console.error(e);
      Alert.alert('No se pudo enviar el mensaje');
    }
  };

  const renderItem = ({ item }) => {
    const own = item.uid === user.uid;
    return (
      <View
        style={{
          alignSelf: own ? 'flex-end' : 'flex-start',
          backgroundColor: own ? colors.primary : colors.backgroundAlt,
          borderRadius: 16,
          padding: 8,
          marginVertical: 2,
          maxWidth: '80%',
        }}
      >
        <Text style={{ fontSize: 11, color: colors.textMuted }}>
          {own ? 'Tú' : item.nombre}
        </Text>
        <Text style={{ color: colors.text, fontSize: 13 }}>{item.texto}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[globalStyles.safeArea, { paddingTop: ANDROID_TOP }]}
    >
      <StatusBar barStyle="light-content" />
      <View style={[globalStyles.screenContainer, { paddingBottom: 0 }]}>
        <View style={globalStyles.cardHeaderRow}>
          <TouchableOpacity onPress={onBack}>
            <Text style={{ color: colors.primary }}>← Volver</Text>
          </TouchableOpacity>
          <Text style={[globalStyles.screenTitle, { fontSize: 18 }]}>
            Chat: {proyecto.titulo}
          </Text>
        </View>

        <FlatList
          data={mensajes}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.cardBackground,
          }}
        >
          <TextInput
            placeholder="Escribe un mensaje..."
            placeholderTextColor={colors.textMuted}
            style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
            value={mensaje}
            onChangeText={setMensaje}
          />
          <TouchableOpacity
            style={[globalStyles.primaryButton, { marginTop: 0, marginLeft: 8 }]}
            onPress={enviarMensaje}
          >
            <Text style={globalStyles.primaryButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ================== SERVICIO SOCIAL ==================

function ServicioTab({ user, onOpenChat }) {
  const isMaestro = user?.role === 'maestro';

  const [proyectos, setProyectos] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [horasDocs, setHorasDocs] = useState([]);
  const [horasGestion, setHorasGestion] = useState([]);

  const [filtroModalidad, setFiltroModalidad] = useState('Todos');
  const [filtroCausa, setFiltroCausa] = useState('Todos');

  // Form maestro: crear proyecto
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoHoras, setNuevoHoras] = useState('');
  const [nuevoModalidad, setNuevoModalidad] = useState('Presencial');

  // Form alumno: registro de horas
  const [horasRegistrar, setHorasRegistrar] = useState('');
  const [horasComentario, setHorasComentario] = useState('');
  const [proyectoParaHoras, setProyectoParaHoras] = useState(null);

  // Maestro: ver postulados
  const [modalPostuladosProyecto, setModalPostuladosProyecto] = useState(null);

  // === Suscripciones a Firestore ===
  useEffect(() => {
    const qProy = query(collection(db, 'proyectosServicio'), orderBy('titulo'));
    const unsub1 = onSnapshot(
      qProy,
      snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProyectos(data);
      },
      err => console.error('Error proyectos servicio', err),
    );

    if (!user?.uid) return () => unsub1();

    const qPost = isMaestro
      ? query(collection(db, 'postulaciones'))
      : query(collection(db, 'postulaciones'), where('uid', '==', user.uid));

    const unsub2 = onSnapshot(
      qPost,
      snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPostulaciones(data);
      },
      err => console.error('Error postulaciones', err),
    );

    const qHoras = query(
      collection(db, 'horasServicio'),
      where('uid', '==', user.uid),
    );
    const unsub3 = onSnapshot(
      qHoras,
      snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setHorasDocs(data);
      },
      err => console.error('Error horas servicio', err),
    );

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [user?.uid, user?.role]);

  // Horas para que el maestro las gestione (todas donde él es responsable)
  useEffect(() => {
    if (!user?.uid || !isMaestro) return;

    const qHorasMaestro = query(
      collection(db, 'horasServicio'),
      where('responsableUid', '==', user.uid),
    );
    const unsub = onSnapshot(
      qHorasMaestro,
      snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setHorasGestion(data);
      },
      err => console.error('Error horas maestro', err),
    );
    return unsub;
  }, [user?.uid, isMaestro]);

  const data = proyectos.length ? proyectos : DEFAULT_PROYECTOS_SERVICIO;

  // Map para estado de la postulación del alumno
  const statusByProyecto = useMemo(() => {
    if (isMaestro) return new Map();
    const map = new Map();
    postulaciones.forEach(p => {
      map.set(p.proyectoId, p.status);
    });
    return map;
  }, [postulaciones, isMaestro]);

  // Map para postulados que ve el maestro
  const postulacionesPorProyecto = useMemo(() => {
    if (!isMaestro) return {};
    const map = {};
    postulaciones.forEach(p => {
      if (!map[p.proyectoId]) map[p.proyectoId] = [];
      map[p.proyectoId].push(p);
    });
    return map;
  }, [postulaciones, isMaestro]);

  const horasAprobadas = useMemo(
    () =>
      horasDocs
        .filter(h => h.status === 'Aprobada')
        .reduce((acc, h) => acc + (h.horas || 0), 0),
    [horasDocs],
  );

  const proyectosFiltrados = data.filter(p => {
    if (filtroModalidad !== 'Todos' && p.modalidad !== filtroModalidad) {
      return false;
    }
    if (
      filtroCausa !== 'Todos' &&
      p.causa &&
      p.causa.toLowerCase() !== filtroCausa.toLowerCase()
    ) {
      return false;
    }
    return true;
  });

  const togglePostulacion = async proyecto => {
    if (isMaestro) return; // seguridad extra

    const status = statusByProyecto.get(proyecto.id);
    const docPost = postulaciones.find(
      p => p.proyectoId === proyecto.id && p.uid === user.uid,
    );

    try {
      if (!status) {
        // Crear nueva postulación
        await addDoc(collection(db, 'postulaciones'), {
          uid: user.uid,
          proyectoId: proyecto.id,
          status: 'Enviada',
          createdAt: Date.now(),
          studentName: user.nombre,
          studentEmail: user.email,
          responsableUid: proyecto.responsableUid || proyecto.createdBy || null,
        });
      } else if (status === 'Enviada') {
        // Cancelar
        if (!docPost) return;
        Alert.alert(
          'Cancelar postulación',
          '¿Seguro que quieres cancelar tu postulación?',
          [
            { text: 'No' },
            {
              text: 'Sí',
              onPress: async () => {
                await setDoc(
                  doc(db, 'postulaciones', docPost.id),
                  { status: 'Cancelada' },
                  { merge: true },
                );
              },
            },
          ],
        );
      } else {
        // Solo mostrar el estado
        Alert.alert('Postulación', `Tu postulación está en estado: ${status}.`);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error al actualizar postulación.');
    }
  };

  const registrarHoras = async () => {
    if (!proyectoParaHoras || !horasRegistrar.trim()) return;
    const h = Number(horasRegistrar);
    if (Number.isNaN(h) || h <= 0) {
      Alert.alert('Horas no válidas');
      return;
    }
    try {
      await addDoc(collection(db, 'horasServicio'), {
        uid: user.uid,
        proyectoId: proyectoParaHoras.id,
        proyectoTitulo: proyectoParaHoras.titulo,
        horas: h,
        comentario: horasComentario.trim(),
        status: 'Pendiente',
        createdAt: Date.now(),
        responsableUid: proyectoParaHoras.responsableUid || null,
        studentName: user.nombre,
        studentEmail: user.email,
      });
      setHorasRegistrar('');
      setHorasComentario('');
      setProyectoParaHoras(null);
    } catch (e) {
      console.error(e);
      Alert.alert('Error al registrar horas');
    }
  };

  const crearProyecto = async () => {
    if (!nuevoTitulo.trim()) {
      Alert.alert('Título requerido');
      return;
    }
    const horasNum = Number(nuevoHoras) || 0;
    try {
      await addDoc(collection(db, 'proyectosServicio'), {
        titulo: nuevoTitulo.trim(),
        horas: horasNum,
        modalidad: nuevoModalidad,
        organizacion: 'Organización UAQ',
        descripcion: 'Descripción pendiente',
        fechaCreacion: Date.now(),
        responsableUid: user.uid,
      });
      setNuevoTitulo('');
      setNuevoHoras('');
      setNuevoModalidad('Presencial');
    } catch (e) {
      console.error(e);
      Alert.alert('No se pudo crear el proyecto');
    }
  };

  const actualizarEstadoHoras = async (registro, nuevoEstado) => {
    try {
      await setDoc(
        doc(db, 'horasServicio', registro.id),
        { status: nuevoEstado },
        { merge: true },
      );
    } catch (e) {
      console.error(e);
      Alert.alert('No se pudo actualizar el estado de las horas');
    }
  };

  const progreso =
    user?.horasRequeridas && user.horasRequeridas > 0
      ? Math.min(1, horasAprobadas / user.horasRequeridas)
      : 0;

  const renderItem = ({ item }) => {
    const status = statusByProyecto.get(item.id);
    const postulados = postulacionesPorProyecto[item.id] || [];

    let botonTexto = 'Postularse';
    if (status === 'Enviada') botonTexto = 'Cancelar postulación';
    else if (status && status !== 'Enviada')
      botonTexto = 'Ver estado de tu postulación';

    return (
      <View style={globalStyles.card}>
        <View style={globalStyles.cardHeaderRow}>
          <Text style={globalStyles.cardTitle}>{item.titulo}</Text>
          <View style={globalStyles.badge}>
            <Text style={globalStyles.badgeText}>{item.modalidad || 'N/D'}</Text>
          </View>
        </View>
        <Text style={globalStyles.infoText}>{item.descripcion}</Text>
        <Text style={globalStyles.infoText}>
          Organización: {item.organizacion}
        </Text>
        <Text style={globalStyles.infoText}>
          Horas aproximadas: {item.horas || 'N/D'}
        </Text>

        <View style={globalStyles.cardChipRow}>
          {item.causa && (
            <View style={globalStyles.chip}>
              <Text style={globalStyles.chipText}>{item.causa}</Text>
            </View>
          )}
          {item.horarioFlexible && (
            <View style={globalStyles.chip}>
              <Text style={globalStyles.chipText}>Horario flexible</Text>
            </View>
          )}
          {item.accesible && (
            <View style={globalStyles.chip}>
              <Text style={globalStyles.chipText}>♿ Accesible</Text>
            </View>
          )}
        </View>

        {!isMaestro && status && (
          <Text style={[globalStyles.infoText, { marginTop: 4 }]}>
            Estado de tu postulación: {status}
          </Text>
        )}

        {isMaestro && (
          <Text style={[globalStyles.infoText, { marginTop: 4 }]}>
            Postulaciones recibidas: {postulados.length}
          </Text>
        )}

        {!isMaestro && (
          <>
            <TouchableOpacity
              style={globalStyles.primaryButton}
              onPress={() => togglePostulacion(item)}
            >
              <Text style={globalStyles.primaryButtonText}>{botonTexto}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={globalStyles.outlineButton}
              onPress={() => setProyectoParaHoras(item)}
            >
              <Text style={globalStyles.outlineButtonText}>Registrar horas</Text>
            </TouchableOpacity>
          </>
        )}

        {isMaestro && (
          <TouchableOpacity
            style={globalStyles.outlineButton}
            onPress={() => setModalPostuladosProyecto(item)}
          >
            <Text style={globalStyles.outlineButtonText}>Ver postulantes</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={globalStyles.outlineButton}
          onPress={() => onOpenChat(item)}
        >
          <Text style={globalStyles.outlineButtonText}>
            {isMaestro ? 'Ver chat del proyecto' : 'Abrir chat'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={globalStyles.screenContainer}
        contentContainerStyle={{ paddingBottom: proyectoParaHoras ? 220 : 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={globalStyles.screenTitle}>Servicio social</Text>
        <Text style={globalStyles.screenSubtitle}>
          Encuentra proyectos, postúlate y registra tu avance.
        </Text>

        {/* Progreso del alumno */}
        {!isMaestro && (
          <View style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>Progreso de horas</Text>
            <Text style={globalStyles.infoText}>
              Horas aprobadas: {horasAprobadas} / {user?.horasRequeridas || 480}
            </Text>
            <View style={globalStyles.progressBarContainer}>
              <View
                style={[
                  globalStyles.progressBarFill,
                  { width: `${progreso * 100}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* Filtros simples */}
        <View style={[globalStyles.card, { marginBottom: 12 }]}>
          <Text style={globalStyles.cardTitle}>Filtros</Text>
          <View style={[globalStyles.cardChipRow, { marginTop: 8 }]}>
            {['Todos', 'Presencial', 'Híbrida', 'Virtual'].map(m => (
              <TouchableOpacity
                key={m}
                style={[
                  globalStyles.pill,
                  {
                    borderColor:
                      filtroModalidad === m ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setFiltroModalidad(m)}
              >
                <Text
                  style={[
                    globalStyles.pillText,
                    filtroModalidad === m && globalStyles.pillTextActive,
                  ]}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FlatList
          data={proyectosFiltrados}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
        />

        {/* Maestro: crear proyecto */}
        {isMaestro && (
          <View style={[globalStyles.card, { marginTop: 12 }]}>
            <Text style={globalStyles.cardTitle}>Crear proyecto</Text>
            <TextInput
              placeholder="Título del proyecto"
              placeholderTextColor={colors.textMuted}
              style={globalStyles.input}
              value={nuevoTitulo}
              onChangeText={setNuevoTitulo}
            />
            <TextInput
              placeholder="Horas estimadas"
              placeholderTextColor={colors.textMuted}
              style={globalStyles.input}
              keyboardType="numeric"
              value={nuevoHoras}
              onChangeText={setNuevoHoras}
            />
            <TextInput
              placeholder="Modalidad (Presencial / Híbrida / Virtual)"
              placeholderTextColor={colors.textMuted}
              style={globalStyles.input}
              value={nuevoModalidad}
              onChangeText={setNuevoModalidad}
            />
            <TouchableOpacity
              style={globalStyles.primaryButton}
              onPress={crearProyecto}
            >
              <Text style={globalStyles.primaryButtonText}>
                Guardar proyecto
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Maestro: gestión de horas */}
        {isMaestro && horasGestion.length > 0 && (
          <View style={[globalStyles.card, { marginTop: 12 }]}>
            <Text style={globalStyles.cardTitle}>Horas por revisar</Text>
            {horasGestion.map(h => (
              <View
                key={h.id}
                style={{
                  marginTop: 8,
                  paddingTop: 6,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                }}
              >
                <Text style={globalStyles.infoText}>
                  Alumno: {h.studentName || h.uid}
                </Text>
                <Text style={globalStyles.infoText}>
                  Proyecto: {h.proyectoTitulo || h.proyectoId}
                </Text>
                <Text style={globalStyles.infoText}>Horas: {h.horas}</Text>
                <Text style={globalStyles.infoText}>Estado: {h.status}</Text>

                {h.status === 'Pendiente' && (
                  <View
                    style={{
                      flexDirection: 'row',
                      marginTop: 6,
                      justifyContent: 'space-between',
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        globalStyles.primaryButton,
                        { flex: 1, marginRight: 6 },
                      ]}
                      onPress={() => actualizarEstadoHoras(h, 'Aprobada')}
                    >
                      <Text style={globalStyles.primaryButtonText}>
                        Aprobar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        globalStyles.outlineButton,
                        { flex: 1, marginLeft: 6 },
                      ]}
                      onPress={() => actualizarEstadoHoras(h, 'Rechazada')}
                    >
                      <Text style={globalStyles.outlineButtonText}>
                        Rechazar
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom sheet de registro de horas (alumno) */}
      {proyectoParaHoras && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.backgroundAlt,
            padding: 16,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Text style={globalStyles.cardTitle}>
            Registrar horas en {proyectoParaHoras.titulo}
          </Text>
          <TextInput
            placeholder="Horas realizadas"
            placeholderTextColor={colors.textMuted}
            style={globalStyles.input}
            keyboardType="numeric"
            value={horasRegistrar}
            onChangeText={setHorasRegistrar}
          />
          <TextInput
            placeholder="Descripción breve de la actividad"
            placeholderTextColor={colors.textMuted}
            style={[globalStyles.input, { height: 80 }]}
            value={horasComentario}
            onChangeText={setHorasComentario}
            multiline
          />
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <TouchableOpacity
              style={[globalStyles.outlineButton, { flex: 1, marginRight: 8 }]}
              onPress={() => setProyectoParaHoras(null)}
            >
              <Text style={globalStyles.outlineButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[globalStyles.primaryButton, { flex: 1, marginLeft: 8 }]}
              onPress={registrarHoras}
            >
              <Text style={globalStyles.primaryButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal de postulantes para el maestro */}
      {isMaestro && modalPostuladosProyecto && (
        <Modal
          transparent
          animationType="fade"
          visible
          onRequestClose={() => setModalPostuladosProyecto(null)}
        >
          <View style={globalStyles.modalOverlay}>
            <View style={globalStyles.modalCard}>
              <Text style={globalStyles.cardTitle}>
                Postulantes: {modalPostuladosProyecto.titulo}
              </Text>
              {(
                postulacionesPorProyecto[modalPostuladosProyecto.id] || []
              ).length === 0 ? (
                <Text style={globalStyles.infoText}>
                  Aún no hay postulantes.
                </Text>
              ) : (
                (postulacionesPorProyecto[modalPostuladosProyecto.id] || []).map(
                  p => (
                    <View
                      key={p.id}
                      style={{
                        marginTop: 8,
                        paddingTop: 6,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                      }}
                    >
                      <Text style={globalStyles.infoText}>
                        {p.studentName || p.uid}
                      </Text>
                      <Text style={globalStyles.infoText}>
                        Correo: {p.studentEmail}
                      </Text>
                      <Text style={globalStyles.infoText}>
                        Estado: {p.status}
                      </Text>
                    </View>
                  ),
                )
              )}

              <TouchableOpacity
                style={[globalStyles.primaryButton, { marginTop: 16 }]}
                onPress={() => {
                  onOpenChat(modalPostuladosProyecto);
                  setModalPostuladosProyecto(null);
                }}
              >
                <Text style={globalStyles.primaryButtonText}>
                  Abrir chat del proyecto
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={globalStyles.outlineButton}
                onPress={() => setModalPostuladosProyecto(null)}
              >
                <Text style={globalStyles.outlineButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// ================== EVENTOS ==================

function EventosTab({ user }) {
  const isMaestro = user?.role === 'maestro';
  const [eventos, setEventos] = useState([]);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [campus, setCampus] = useState('');
  const [tipo, setTipo] = useState('Académico');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const qEventos = query(collection(db, 'eventos'), orderBy('fecha'));
    const unsub = onSnapshot(
      qEventos,
      snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setEventos(data);
      },
      err => console.error('Error eventos', err),
    );
    return unsub;
  }, []);

  const data = eventos.length ? eventos : DEFAULT_EVENTOS;

  const crearEvento = async () => {
    if (!titulo.trim() || !fecha.trim()) {
      Alert.alert('Título y fecha son obligatorios');
      return;
    }
    try {
      await addDoc(collection(db, 'eventos'), {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        fecha: fecha.trim(),
        campus: campus.trim() || 'Sin campus',
        tipo: tipo.trim() || 'General',
        createdBy: user.uid,
        createdAt: Date.now(),
      });
      setTitulo('');
      setDescripcion('');
      setFecha('');
      setCampus('');
      setTipo('Académico');
    } catch (e) {
      console.error(e);
      Alert.alert('No se pudo crear el evento');
    }
  };

  const renderItem = ({ item }) => (
    <View style={globalStyles.card}>
      <View style={globalStyles.cardHeaderRow}>
        <Text style={globalStyles.cardTitle}>{item.titulo}</Text>
        {item.tipo && (
          <View style={globalStyles.badge}>
            <Text style={globalStyles.badgeText}>{item.tipo}</Text>
          </View>
        )}
      </View>
      <Text style={globalStyles.infoText}>{item.descripcion}</Text>
      <View style={globalStyles.cardChipRow}>
        {item.fecha && (
          <View style={globalStyles.chip}>
            <Text style={globalStyles.chipText}>📅 {item.fecha}</Text>
          </View>
        )}
        {item.campus && (
          <View style={globalStyles.chip}>
            <Text style={globalStyles.chipText}>📍 {item.campus}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const handleChangeFecha = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const iso = selectedDate.toISOString().slice(0, 10);
      setFecha(iso);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        style={globalStyles.screenContainer}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={globalStyles.screenTitle}>Eventos UAQ</Text>
        <Text style={globalStyles.screenSubtitle}>
          Actividades académicas, culturales y deportivas.
        </Text>

        <FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
        />

        {isMaestro && (
          <View style={[globalStyles.card, { marginTop: 12 }]}>
            <Text style={globalStyles.cardTitle}>Crear evento</Text>
            <TextInput
              placeholder="Título del evento"
              placeholderTextColor={colors.textMuted}
              style={globalStyles.input}
              value={titulo}
              onChangeText={setTitulo}
            />
            <TextInput
              placeholder="Descripción"
              placeholderTextColor={colors.textMuted}
              style={globalStyles.input}
              value={descripcion}
              onChangeText={setDescripcion}
            />

            <TouchableOpacity
              style={globalStyles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                style={{
                  color: fecha ? colors.text : colors.textMuted,
                  fontSize: 14,
                }}
              >
                {fecha || 'Fecha (toca para elegir)'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={fecha ? new Date(fecha) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={handleChangeFecha}
              />
            )}

            <TextInput
              placeholder="Campus (Centro, Juriquilla, Aeropuerto...)"
              placeholderTextColor={colors.textMuted}
              style={globalStyles.input}
              value={campus}
              onChangeText={setCampus}
            />
            <TextInput
              placeholder="Tipo (Académico, Cultural, Deportivo...)"
              placeholderTextColor={colors.textMuted}
              style={globalStyles.input}
              value={tipo}
              onChangeText={setTipo}
            />
            <TouchableOpacity
              style={globalStyles.primaryButton}
              onPress={crearEvento}
            >
              <Text style={globalStyles.primaryButtonText}>Guardar evento</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ================== PERFIL ==================

function PerfilTab({ user, horasAprobadas }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
      Alert.alert('Error al cerrar sesión');
    }
  };

  const req = user?.horasRequeridas || 480;
  const progreso = Math.min(1, req ? horasAprobadas / req : 0);

  return (
    <ScrollView
      style={globalStyles.screenContainer}
      contentContainerStyle={{ paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={globalStyles.screenTitle}>Perfil</Text>
      <Text style={globalStyles.screenSubtitle}>
        Datos básicos y resumen de tu actividad.
      </Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>{user?.nombre || 'Usuario'}</Text>
        <Text style={globalStyles.infoText}>{user?.email}</Text>
        <View style={[globalStyles.cardChipRow, { marginTop: 10 }]}>
          <View style={globalStyles.chip}>
            <Text style={globalStyles.chipText}>
              Rol: {user?.role || 'alumno'}
            </Text>
          </View>
        </View>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Servicio social</Text>
        <Text style={globalStyles.infoText}>
          Horas aprobadas: {horasAprobadas} / {req}
        </Text>
        <View style={globalStyles.progressBarContainer}>
          <View
            style={[
              globalStyles.progressBarFill,
              { width: `${progreso * 100}%` },
            ]}
          />
        </View>
      </View>

      <TouchableOpacity
        style={globalStyles.outlineButton}
        onPress={handleLogout}
      >
        <Text style={globalStyles.outlineButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ================== APP ROOT ==================

export default function App() {
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('Campus');
  const [initializing, setInitializing] = useState(true);

  const [horasDocs, setHorasDocs] = useState([]);
  const [chatProyecto, setChatProyecto] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async fbUser => {
      try {
        if (fbUser) {
          const snap = await getDoc(doc(db, 'users', fbUser.uid));
          const data = snap.exists()
            ? snap.data()
            : {
                uid: fbUser.uid,
                email: fbUser.email,
                nombre: fbUser.email,
                role: 'alumno',
                horasServicio: 0,
                horasRequeridas: 480,
              };
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('Error cargando perfil', e);
      } finally {
        setInitializing(false);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    const qHoras = query(
      collection(db, 'horasServicio'),
      where('uid', '==', user.uid),
    );
    const unsub = onSnapshot(
      qHoras,
      snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setHorasDocs(data);
      },
      err => console.error('Error horas perfil', err),
    );
    return unsub;
  }, [user?.uid]);

  const horasAprobadas = useMemo(
    () =>
      horasDocs
        .filter(h => h.status === 'Aprobada')
        .reduce((acc, h) => acc + (h.horas || 0), 0),
    [horasDocs],
  );

  if (initializing) {
    return (
      <SafeAreaView
        style={[
          globalStyles.safeArea,
          {
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: ANDROID_TOP,
          },
        ]}
      >
        <StatusBar barStyle="light-content" />
        <Text style={globalStyles.screenTitle}>Cargando...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return <LoginScreen onAuthenticated={setUser} />;
  }

  if (chatProyecto) {
    return (
      <ChatScreen
        proyecto={chatProyecto}
        user={user}
        onBack={() => setChatProyecto(null)}
      />
    );
  }

  return (
    <SafeAreaView
      style={[globalStyles.safeArea, { paddingTop: ANDROID_TOP }]}
    >
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1 }}>
        {currentTab === 'Campus' && <CampusTab user={user} />}
        {currentTab === 'Servicio' && (
          <ServicioTab user={user} onOpenChat={setChatProyecto} />
        )}
        {currentTab === 'Eventos' && <EventosTab user={user} />}
        {currentTab === 'Perfil' && (
          <PerfilTab user={user} horasAprobadas={horasAprobadas} />
        )}
      </View>
      <BottomTabBar currentTab={currentTab} onTabChange={setCurrentTab} />
    </SafeAreaView>
  );
}
