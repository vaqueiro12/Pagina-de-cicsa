/* =========================================================
   ESTADO Y PERSISTENCIA (localStorage — pendiente conectar
   a PostgreSQL más adelante; estas son las únicas funciones
   que habría que reemplazar por llamadas a tu API/backend)
========================================================= */

const LS_COURSES = 'cicsa_courses_v2';
const LS_WORKERS = 'cicsa_workers_v2';
const LS_SESSION = 'cicsa_session_v1';
const LS_ROSTER = 'cicsa_roster_v1';
const LS_RESET_REQUESTS = 'cicsa_reset_requests_v1';
const LS_ADMINS = 'cicsa_admins_v1';
const LS_COURSES_MIGRATION = 'cicsa_courses_migration_v1';
const FIRE_COURSE_MIGRATION = 'prevencion_incendios_contenido_v2';

const APPROVAL_THRESHOLD = 70; // RF-035: calificación mínima aprobatoria (%)

/* ---------- Trabajadores predeterminados ---------- */
const defaultRoster = [
  { name:"Carlos Méndez", area:"Operaciones Offshore", password:"123456", active:true, lastLogin:null },
  { name:"José Ramírez", area:"Mantenimiento", password:"123456", active:true, lastLogin:null },
  { name:"Miguel Hernández", area:"Seguridad Industrial", password:"123456", active:true, lastLogin:null },
  { name:"Daniel Torres", area:"Logística y Almacén", password:"123456", active:true, lastLogin:null },
];

/* ---------- Administrador predeterminado ---------- */
const defaultAdmins = [
  { name:"Alexis Vaqueiro", password:"123456", active:true },
];

/* ---------- Puestos ---------- */
const PUESTOS = [
  "Operaciones Offshore","Mantenimiento","Seguridad Industrial",
  "Logística y Almacén","Recursos Humanos","Administración","Otro",
];

/* ---------- Cursos: cada uno con módulos -> secciones, examen
   final propio y a quién está asignado (RF-009 a RF-016) ---------- */
const defaultCourses = [
  {
    title:"Inducción a CICSA",
    desc:"Historia de la empresa, valores, organigrama y políticas internas.",
    hours:2,
    assignment:{ type:'todos', area:null, workers:[] },
    modules:[
      { title:"Historia y Misión", sections:[
        { title:"Fundación de CICSA", content:"CICSA fue fundada en Ciudad del Carmen y desde entonces ofrece servicios a la industria offshore de la región." },
        { title:"Valores Corporativos", content:"Seguridad, excelencia y compromiso guían cada actividad de la empresa." },
        { title:"Estructura Organizacional", content:"Conoce las áreas y jerarquías principales de CICSA." },
      ]},
      { title:"Políticas Internas", sections:[
        { title:"Manual del Empleado", content:"Normas y políticas generales que aplican a todo el personal." },
        { title:"Código de Ética", content:"Principios de conducta esperados dentro y fuera de las instalaciones." },
        { title:"Preguntas Frecuentes", content:"Respuestas a las dudas más comunes de nuevo ingreso." },
      ]},
    ],
    quiz:[
      { q:"¿Dónde está ubicada la sede principal de CICSA?", options:["Ciudad del Carmen","Monterrey","Guadalajara"], correct:0 },
      { q:"¿Cuál es un valor corporativo de CICSA?", options:["Lujo","Seguridad","Diversión"], correct:1 },
    ],
  },
  {
    title:"Seguridad industrial",
    desc:"Identificación de riesgos, uso de equipo de protección y señalización.",
    hours:4,
    assignment:{ type:'todos', area:null, workers:[] },
    modules:[
      { title:"Identificación de Riesgos", sections:[
        { title:"Tipos de Riesgos", content:"Físicos, químicos, biológicos y ergonómicos presentes en la operación." },
        { title:"Señalización de Seguridad", content:"Significado de las señales y colores de seguridad." },
        { title:"Evaluación de Riesgos", content:"Cómo identificar peligros en tu área de trabajo." },
      ]},
      { title:"Equipo de Protección Personal", sections:[
        { title:"Tipos de EPP", content:"Cascos, guantes, lentes y arneses según la actividad." },
        { title:"Uso Correcto", content:"Cómo colocarse y ajustar cada equipo de protección." },
        { title:"Inspección y Mantenimiento", content:"Revisión periódica del estado del equipo." },
      ]},
    ],
    quiz:[
      { q:"¿Qué significa EPP?", options:["Equipo de Protección Personal","Estación de Paso Peatonal","Ninguna de las anteriores"], correct:0 },
      { q:"Al ver una señal de riesgo, debes:", options:["Ignorarla si tienes prisa","Detenerte y seguir el protocolo","Quitarla si estorba"], correct:1 },
    ],
  },
  {
    title:"Trabajo en espacios confinados",
    desc:"Procedimientos de ingreso, ventilación y rescate en espacios reducidos.",
    hours:3,
    assignment:{ type:'todos', area:null, workers:[] },
    modules:[
      { title:"Reconocimiento de Espacios Confinados", sections:[
        { title:"Definición", content:"Un espacio confinado tiene acceso limitado y no está diseñado para ocupación continua." },
        { title:"Características", content:"Ventilación deficiente y posibles atmósferas peligrosas." },
        { title:"Ejemplos", content:"Tanques, silos y tuberías dentro de la instalación." },
      ]},
      { title:"Procedimientos de Seguridad", sections:[
        { title:"Medición de Atmósfera", content:"Verificación de niveles de oxígeno y gases antes de ingresar." },
        { title:"Vigía de Seguridad", content:"Función y responsabilidades del vigía durante el trabajo." },
        { title:"Plan de Rescate", content:"Procedimientos de emergencia en caso de incidente." },
      ]},
    ],
    quiz:[
      { q:"Antes de entrar a un espacio confinado se debe:", options:["Medir la atmósfera interna","Entrar directamente","Avisar después de entrar"], correct:0 },
      { q:"¿Quién debe vigilar el exterior durante el trabajo?", options:["Nadie, no es necesario","Un vigía asignado","El mismo trabajador que entra"], correct:1 },
    ],
  },
  {
    title:"Prevención y control de incendios",
    desc:"Programa integral para reconocer riesgos, prevenir incendios, responder ante una emergencia y utilizar correctamente los equipos contra incendio.",
    hours:6,
    image:"imagenes/cursos/incendios.jpg",
    assignment:{ type:'todos', area:null, workers:[] },
    modules:[
      { title:"Fundamentos del fuego", sections:[
        { title:"El triángulo y el tetraedro del fuego", content:"Para que exista fuego se necesitan combustible, oxígeno y calor. La reacción en cadena mantiene la combustión; por eso el tetraedro del fuego agrega este cuarto elemento. Eliminar cualquiera de ellos ayuda a controlar el incendio." },
        { title:"Clases de fuego", content:"Clase A: sólidos como madera, papel y cartón. Clase B: líquidos inflamables como gasolina, diésel y solventes. Clase C: equipos eléctricos energizados. Clase D: metales combustibles. Identificar la clase determina el agente extintor adecuado." },
        { title:"Transferencia y propagación del calor", content:"El fuego se propaga por conducción a través de materiales, por radiación hacia objetos cercanos y por convección cuando los gases calientes ascienden. Reconocer estas rutas permite anticipar puntos de propagación." },
        { title:"Productos de la combustión", content:"El humo, los gases tóxicos y la reducción de oxígeno pueden ser más peligrosos que las llamas. Nunca ingreses a una zona con humo sin autorización, equipo y procedimiento de emergencia." },
      ]},
      { title:"Prevención de incendios", sections:[
        { title:"Orden, limpieza y control de fuentes de ignición", content:"Mantén las áreas limpias, retira residuos combustibles, controla trabajos en caliente y evita fumar fuera de las zonas autorizadas. Reporta de inmediato chispas, fugas, calentamientos anormales u olores a quemado." },
        { title:"Seguridad eléctrica", content:"No sobrecargues contactos, no uses cables dañados y desconecta equipos cuando el procedimiento lo indique. Las reparaciones y tableros eléctricos deben ser atendidos por personal autorizado." },
        { title:"Almacenamiento de sustancias inflamables", content:"Conserva químicos y combustibles en recipientes autorizados, etiquetados y cerrados. Mantén separación de fuentes de calor y revisa que exista ventilación adecuada." },
        { title:"Inspección de equipos y rutas", content:"Verifica que extintores, gabinetes, alarmas, salidas y rutas de evacuación estén visibles, señalizados, accesibles y sin obstrucciones." },
      ]},
      { title:"Respuesta y evacuación", sections:[
        { title:"Activación de la emergencia", content:"Al descubrir humo o fuego, conserva la calma, activa la alarma y avisa al supervisor indicando el lugar exacto. No pongas en riesgo tu integridad para recuperar objetos." },
        { title:"Evacuación segura", content:"Dirígete por la ruta señalada al punto de reunión, camina sin correr, no uses elevadores y ayuda a las personas que lo necesiten sin separarte del grupo." },
        { title:"Comunicación y reporte", content:"Proporciona información clara: ubicación, tamaño aproximado, materiales involucrados y personas expuestas. No regreses al área hasta recibir autorización oficial." },
        { title:"Punto de reunión y conteo", content:"Permanece en el punto de reunión para el conteo de personal y reporta si alguien falta. Sigue las instrucciones de la brigada y de los servicios de emergencia." },
      ]},
      { title:"Extintores y control inicial", sections:[
        { title:"Selección del extintor", content:"Elige el extintor según la clase de fuego y las instrucciones de la etiqueta. Nunca uses agua en un incendio eléctrico energizado o de líquidos inflamables." },
        { title:"Técnica PASS", content:"P: Pull, retira el pasador. A: Aim, apunta a la base. S: Squeeze, presiona la palanca. S: Sweep, barre de lado a lado. Mantén una salida segura a tu espalda." },
        { title:"Condiciones para intervenir", content:"Solo intenta controlar un fuego pequeño y en etapa inicial, si tienes capacitación, visibilidad, el equipo correcto y una ruta de escape libre. Si crece o genera mucho humo, evacúa." },
        { title:"Después de usar un extintor", content:"Aléjate con precaución, informa al responsable y solicita la recarga o reemplazo del equipo. Un extintor parcialmente utilizado debe retirarse de servicio." },
      ]},
    ],
    quiz:[
      { q:"¿Qué tres elementos forman el triángulo del fuego?", options:["Combustible, oxígeno y calor","Humo, agua y aire","Gasolina, madera y viento"], correct:0 },
      { q:"Un fuego originado en líquidos inflamables (gasolina, solventes) es de clase:", options:["Clase A","Clase B","Clase C"], correct:1 },
      { q:"Al usar un extintor con la técnica PASS, debes apuntar hacia:", options:["La parte alta de las llamas","El humo","La base del fuego"], correct:2 },
      { q:"Si descubres un incendio, lo primero que debes hacer es:", options:["Intentar apagarlo siempre","Activar la alarma o avisar, y evacuar","Abrir puertas y ventanas"], correct:1 },
      { q:"¿Qué debes hacer si el fuego crece o hay demasiado humo?", options:["Continuar hasta terminar el extintor","Evacuar y esperar a la brigada","Abrir todas las puertas"], correct:1 },
      { q:"¿Cuál es una condición indispensable antes de usar un extintor?", options:["Tener una salida segura a la espalda","Estar solo en el área","Acercarse sin revisar el equipo"], correct:0 },
      { q:"¿Dónde debe permanecer el personal durante el conteo?", options:["En el punto de reunión","Dentro del edificio","En el estacionamiento sin avisar"], correct:0 },
      { q:"Después de descargar parcialmente un extintor se debe:", options:["Devolverlo sin reportarlo","Solicitar su recarga o reemplazo","Guardarlo en cualquier lugar"], correct:1 },
    ],
  },
];

/* =========================================================
   VIDEOS - Almacenados en localStorage o carpeta servidor
========================================================= */
const VIDEO_FOLDER = 'videos/';

function getStorageVideo(videoRef){
  if(!videoRef || !videoRef.startsWith('data:video_storage/')) return videoRef;
  const videoId = videoRef.replace('data:video_storage/', '');
  try {
    const videos = JSON.parse(localStorage.getItem(LS_VIDEOS) || '{}');
    return videos[videoId] || videoRef;
  } catch(e){ return videoRef; }
}

function getVideoHtmlForEditor(videoValue){
  if(!videoValue) return '<div class="no-course-image small">Sin video</div>';
  const actualSrc = getStorageVideo(videoValue);
  return `<video class="editor-video" controls src="${escapeAttribute(actualSrc)}"></video>`;
}


/* =========================================================
   FUNCIONES DE LECTURA/ESCRITURA (localStorage)
========================================================= */
function loadCourses(){
  const raw = localStorage.getItem(LS_COURSES);
  if(raw){ try { return JSON.parse(raw); } catch(e){} }
  saveCourses(defaultCourses);
  return JSON.parse(JSON.stringify(defaultCourses));
}
function saveCourses(c){ localStorage.setItem(LS_COURSES, JSON.stringify(c)); }

/* Cursos nuevos del catálogo base se agregan a instalaciones ya
   existentes sin borrar los cambios ni el avance de nadie. */
function mergeNewDefaultCourses(){
  let applied = [];
  const rawMigration = localStorage.getItem(LS_COURSES_MIGRATION);
  if(rawMigration){ try { applied = JSON.parse(rawMigration); } catch(e){ applied = []; } }
  let changed = false;
  defaultCourses.forEach(dc => {
    if(applied.includes(dc.title)) return;
    if(courses.some(c => c.title === dc.title)){ applied.push(dc.title); changed = true; return; }
    const newIndex = courses.length;
    courses.push(JSON.parse(JSON.stringify(dc)));
    Object.keys(workers).forEach(n => {
      if(workers[n].statuses) workers[n].statuses.push({ status:'pendiente', score:null, lastResult:null, attempts:0 });
    });
    applied.push(dc.title);
    changed = true;
  });
  const fireCourse = courses.find(c => c.title === 'Prevención y control de incendios');
  if(fireCourse && !applied.includes(FIRE_COURSE_MIGRATION) && (fireCourse.modules||[]).length < 4){
    const source = defaultCourses.find(c => c.title === fireCourse.title);
    fireCourse.desc = source.desc;
    fireCourse.hours = source.hours;
    fireCourse.modules = JSON.parse(JSON.stringify(source.modules));
    fireCourse.quiz = JSON.parse(JSON.stringify(source.quiz));
    if(!fireCourse.image) fireCourse.image = source.image;
    applied.push(FIRE_COURSE_MIGRATION);
    changed = true;
  }
  if(changed){
    saveCourses(courses);
    saveWorkers(workers);
    localStorage.setItem(LS_COURSES_MIGRATION, JSON.stringify(applied));
  }
}

function loadWorkers(){
  const raw = localStorage.getItem(LS_WORKERS);
  if(raw){ try { return JSON.parse(raw); } catch(e){} }
  return {};
}
function saveWorkers(w){ localStorage.setItem(LS_WORKERS, JSON.stringify(w)); }

function loadRoster(){
  const raw = localStorage.getItem(LS_ROSTER);
  if(raw){ try { return JSON.parse(raw); } catch(e){} }
  saveRoster(defaultRoster);
  return JSON.parse(JSON.stringify(defaultRoster));
}
function saveRoster(r){ localStorage.setItem(LS_ROSTER, JSON.stringify(r)); }

function loadAdmins(){
  const raw = localStorage.getItem(LS_ADMINS);
  if(raw){ try { return JSON.parse(raw); } catch(e){} }
  localStorage.setItem(LS_ADMINS, JSON.stringify(defaultAdmins));
  return JSON.parse(JSON.stringify(defaultAdmins));
}
function saveAdmins(a){ localStorage.setItem(LS_ADMINS, JSON.stringify(a)); }

function loadResetRequests(){
  const raw = localStorage.getItem(LS_RESET_REQUESTS);
  if(raw){ try { return JSON.parse(raw); } catch(e){} }
  return [];
}
function saveResetRequests(r){ localStorage.setItem(LS_RESET_REQUESTS, JSON.stringify(r)); }

/* =========================================================
   VARIABLES GLOBALES
========================================================= */
let courses = loadCourses();
let workers = loadWorkers();
let roster = loadRoster();
let admins = loadAdmins();
let resetRequests = loadResetRequests();
roster.forEach(r => { if(r.lastLogin === undefined) r.lastLogin = null; });
saveRoster(roster);
mergeNewDefaultCourses();
let session = null;
let selectedRole = 'trabajador';
let passwordChangeTarget = null;
let pendingQuizCourseIndex = null;
let quizAnswers = [];
let editingCourseIndex = null;
let editingModules = null;
let editingQuizCourseIndex = null;
let editingQuiz = null;

/* =========================================================
   ESCAPAR HTML (seguridad)
========================================================= */
function escapeHTML(value){
  return String(value)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function escapeAttribute(value){
  return String(value).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
}

/* =========================================================
   LOGIN / ROL
========================================================= */
function selectRole(role){
  selectedRole = role;
  document.getElementById('roleOptTrabajador').classList.toggle('selected', role==='trabajador');
  document.getElementById('roleOptAdmin').classList.toggle('selected', role==='admin');
  document.getElementById('loginNameWrap').classList.toggle('hidden', role!=='trabajador');
  document.getElementById('loginPasswordWrap').classList.toggle('hidden', role!=='trabajador');
  document.getElementById('forgotBtn').classList.toggle('hidden', role!=='trabajador');
  document.getElementById('loginAdminNameWrap').classList.toggle('hidden', role!=='admin');
  document.getElementById('loginAdminPasswordWrap').classList.toggle('hidden', role!=='admin');
  if(role==='trabajador') populateLoginRosterSelect();
}

function populateLoginRosterSelect(){
  const dl = document.getElementById('rosterNamesList');
  dl.innerHTML = roster.filter(r=>r.active!==false).map(r => `<option value="${escapeHTML(r.name)}">`).join('');
  onLoginNameInput();
}

function onLoginNameInput(){
  const val = document.getElementById('loginNameInput').value.trim();
  const entry = roster.find(r => r.name.toLowerCase() === val.toLowerCase());
  const areaWrap = document.getElementById('loginAreaWrap');
  const warn = document.getElementById('loginNameWarning');
  if(entry){
    document.getElementById('loginAreaDisplay').value = entry.area;
    areaWrap.classList.remove('hidden');
    warn.classList.add('hidden');
  } else {
    areaWrap.classList.add('hidden');
    warn.classList.toggle('hidden', val.length===0);
  }
}

function doLogin(){
  let name;
  if(selectedRole === 'trabajador'){
    const typed = document.getElementById('loginNameInput').value.trim();
    const entry = roster.find(r => r.name.toLowerCase() === typed.toLowerCase());
    if(!entry){ alert('Ese nombre no está registrado. Pide al administrador que te registre.'); return; }
    if(entry.active === false){ alert('Tu cuenta está desactivada. Solicita al administrador que la active.'); return; }
    const password = document.getElementById('loginPassword').value;
    if(password !== entry.password){ alert('Contraseña incorrecta.'); return; }
    name = entry.name;
    entry.lastLogin = new Date().toISOString();
    saveRoster(roster);
  } else {
    const adminName = document.getElementById('loginAdminName').value.trim();
    const adminPassword = document.getElementById('loginAdminPassword').value;
    const admin = admins.find(a => a.name.toLowerCase() === adminName.toLowerCase());
    if(!admin){ alert('Administrador no autorizado.'); return; }
    if(admin.active === false){ alert('La cuenta administrativa está desactivada.'); return; }
    if(adminPassword !== admin.password){ alert('Contraseña de administrador incorrecta.'); return; }
    name = admin.name;
  }
  session = { name, role: selectedRole };
  localStorage.setItem(LS_SESSION, JSON.stringify(session));
  if(selectedRole === 'trabajador') ensureWorkerRecord(name);
  enterApp();
}

function requestPasswordReset(){
  if(selectedRole !== 'trabajador'){ alert('Esta opción está disponible para trabajadores.'); return; }
  const name = document.getElementById('loginNameInput').value.trim();
  if(!name){ alert('Escribe tu nombre antes de solicitar el restablecimiento.'); return; }
  const entry = roster.find(r => r.name.toLowerCase() === name.toLowerCase());
  if(!entry){ alert('El trabajador no está registrado. Solicita al administrador que te registre.'); return; }
  if(entry.active === false){ alert('Tu cuenta está desactivada. Contacta al administrador.'); return; }
  if(resetRequests.some(r => r.name===entry.name && r.status==='pendiente')){ alert('Ya existe una solicitud pendiente para este trabajador.'); return; }
  resetRequests.push({ name:entry.name, createdAt:new Date().toISOString(), status:'pendiente' });
  saveResetRequests(resetRequests);
  alert('Solicitud enviada. El administrador deberá autorizar el cambio de contraseña.');
  if(session && session.role==='admin') renderResetRequests();
}

function logout(){
  localStorage.removeItem(LS_SESSION);
  session = null;
  document.getElementById('app').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginAdminName').value = '';
  document.getElementById('loginAdminPassword').value = '';
  document.getElementById('loginNameInput').value = '';
  document.getElementById('loginPassword').value = '';
  selectRole('trabajador');
  onLoginNameInput();
}

/* =========================================================
   REGISTRO DE TRABAJADOR (progreso por curso)
========================================================= */
function ensureWorkerRecord(name){
  if(!workers[name]){
    workers[name] = {
      statuses: courses.map(() => ({ status:'pendiente', score:null, lastResult:null, attempts:0 })),
      certificates: [],
    };
    saveWorkers(workers);
  }
  while(workers[name].statuses.length < courses.length){
    workers[name].statuses.push({ status:'pendiente', score:null, lastResult:null, attempts:0 });
  }
  if(!workers[name].certificates) workers[name].certificates = [];
  if(!workers[name].courseProgress) workers[name].courseProgress = {};
  saveWorkers(workers);
}

function enterApp(){
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('whoName').textContent = session.name;
  const badge = document.getElementById('whoBadge');
  badge.textContent = session.role === 'admin' ? 'Administrador' : 'Trabajador';
  badge.className = 'who-badge ' + session.role;
  const isAdmin = session.role === 'admin';
  document.getElementById('navAdmin').classList.toggle('hidden', !isAdmin);
  document.getElementById('navTrabajador').classList.toggle('hidden', isAdmin);
  document.getElementById('navPerfil').classList.toggle('hidden', isAdmin);
  showView(isAdmin ? 'admin' : 'trabajador');
  renderAll();
}

/* auto-login si ya había sesión guardada */
(function tryAutoLogin(){
  const raw = localStorage.getItem(LS_SESSION);
  if(!raw) return;
  try{
    session = JSON.parse(raw);
    if(session.role === 'trabajador'){
      const u = roster.find(r => r.name === session.name);
      if(!u || u.active===false){ logout(); return; }
      ensureWorkerRecord(session.name);
    } else if(session.role === 'admin'){
      const a = admins.find(x => x.name === session.name);
      if(!a || a.active===false){ logout(); return; }
    } else { logout(); return; }
    enterApp();
  }catch(e){ localStorage.removeItem(LS_SESSION); }
})();

populateLoginRosterSelect();
populatePuestoSelect();
populateAssignAreaSelect();

/* =========================================================
   NAVEGACIÓN
========================================================= */
async function showView(view){
  if(session && session.role==='admin' && (view==='trabajador' || view==='perfil' || view==='curso')){
    view='admin';
  }
  document.getElementById('viewTrabajador').classList.toggle('hidden', view!=='trabajador');
  document.getElementById('viewCurso').classList.toggle('hidden', view!=='curso');
  document.getElementById('viewPerfil').classList.toggle('hidden', view!=='perfil');
  document.getElementById('viewAdmin').classList.toggle('hidden', view!=='admin');
  document.getElementById('navTrabajador').classList.toggle('active', view==='trabajador' || view==='curso');
  document.getElementById('navPerfil').classList.toggle('active', view==='perfil');
  document.getElementById('navAdmin').classList.toggle('active', view==='admin');

  if(view==='admin'){
    if(!session || session.role!=='admin'){ alert('No tienes permisos para acceder al panel administrativo.'); showView('trabajador'); return; }
    renderAdmin();
  }
  if(view==='trabajador') renderModules();
  if(view==='curso') await renderCourseViewer();
  if(view==='perfil') renderMyProfile();
}

/* =========================================================
   ASIGNACIÓN DE CURSOS (RF-016: asignar a todos / grupo / persona)
========================================================= */
function isCourseAssignedToMe(course){
  if(!session) return false;
  const a = course.assignment || { type:'todos' };
  if(a.type === 'todos') return true;
  if(a.type === 'area'){
    const entry = roster.find(r => r.name === session.name);
    return !!entry && entry.area === a.area;
  }
  if(a.type === 'individual'){
    return (a.workers||[]).includes(session.name);
  }
  return true;
}

function assignmentLabel(course){
  const a = course.assignment || { type:'todos' };
  if(a.type==='todos') return 'Todos';
  if(a.type==='area') return 'Puesto: ' + (a.area||'—');
  if(a.type==='individual') return (a.workers||[]).length + ' trabajador(es)';
  return 'Todos';
}

/* =========================================================
   VISTA TRABAJADOR: TARJETAS DE CURSO
========================================================= */
function myStatuses(){
  ensureWorkerRecord(session.name);
  return workers[session.name].statuses;
}

/* Avance real del curso: porcentaje de módulos vistos en el visor */
function courseProgressPct(i){
  const st = myStatuses()[i];
  if(st.status==='completado') return 100;
  const total = (courses[i].modules||[]).length;
  if(total===0) return 0;
  const cp = (workers[session.name].courseProgress||{})[i];
  const viewed = cp ? (cp.viewed||[]).filter(mi => mi < total).length : 0;
  return Math.round((viewed/total)*100);
}

function cardHTML(m,i){
  const st = myStatuses()[i];
  const num = String(i+1).padStart(2,'0');
  const progressPct = courseProgressPct(i);
  let btnLabel = 'Iniciar curso';
  if(st.status==='progreso') btnLabel = 'Continuar curso';
  if(st.status==='completado') btnLabel = '✓ Aprobado — repasar';
  const statusClass = st.status==='completado' ? 'completado' : (st.lastResult==='reprobado' ? 'reprobado' : st.status);
  const statusLabel = st.status==='completado' ? 'Completado' : (st.status==='progreso' ? (st.lastResult==='reprobado' ? 'No aprobado aún' : 'En progreso') : 'Pendiente');
  const scoreLine = st.score!==null ? `<div class="module-score">Última calificación: <b>${st.score}%</b></div>` : '';

  return `
    <div class="module-card">
      ${m.image ? `<div class="module-image"><img src="${escapeAttribute(m.image)}" alt="Imagen de ${escapeAttribute(m.title)}"></div>` : ''}
      <div class="module-top">
        <span class="module-index">${num}</span>
        <span class="status-badge status-${statusClass}">${statusLabel}</span>
      </div>
      <div class="module-title">${escapeHTML(m.title)}</div>
      <div class="module-desc">${escapeHTML(m.desc)}</div>
      <div class="module-meta">⏱ <span class="hrs">${m.hours} h</span> · ${(m.modules||[]).length} módulo(s)${m.video ? ' · 🎥 Video' : ''}</div>
      <div class="module-bar"><div style="width:${progressPct}%"></div></div>
      ${scoreLine}
      <button class="module-btn ${st.status==='completado' ? 'done' : ''}" onclick="handleModuleClick(${i})">${btnLabel}</button>
    </div>`;
}

function handleModuleClick(i){
  const st = myStatuses()[i];
  if(st.status === 'pendiente'){
    st.status = 'progreso';
    saveWorkers(workers);
  }
  openCourseViewer(i);
}

function renderModules(){
  const mine = courses
    .map((c,i)=>({c,i}))
    .filter(x => isCourseAssignedToMe(x.c));
  const grid = document.getElementById('modulesGrid');
  if(mine.length===0){
    grid.innerHTML = `<div style="color:var(--muted);padding:20px;">Todavía no tienes cursos asignados.</div>`;
    return;
  }
  grid.innerHTML = mine.map(x => cardHTML(x.c, x.i)).join('');
}

/* =========================================================
   RESUMEN (anillo de progreso)
========================================================= */
function renderSummary(){
  const mine = courses.map((c,i)=>({c,i})).filter(x=>isCourseAssignedToMe(x.c));
  const totalHours = mine.reduce((a,x)=>a+x.c.hours,0);
  const st = myStatuses();
  const doneHours = mine.reduce((a,x)=> a + (st[x.i].status==='completado' ? x.c.hours : 0), 0);
  const doneCount = mine.filter(x=>st[x.i].status==='completado').length;
  const pct = totalHours ? Math.round((doneHours/totalHours)*100) : 0;

  document.getElementById('hoursDone').textContent = doneHours;
  document.getElementById('hoursTotal').textContent = totalHours;
  document.getElementById('modsDone').textContent = `${doneCount}/${mine.length}`;
  document.getElementById('ringPct').textContent = pct + '%';
  const circumference = 465;
  document.getElementById('ringFg').style.strokeDashoffset = circumference - (circumference*pct/100);
}

/* =========================================================
   CONTENIDO DEL CURSO (módulos -> secciones)
========================================================= */
function openCourseContent(i){
  const course = courses[i];
  const card = document.getElementById('courseContentCard');
  let html = `<h3>${escapeHTML(course.title)}</h3>${course.image ? `<img class="course-content-image" src="${escapeAttribute(course.image)}" alt="Imagen de ${escapeAttribute(course.title)}">` : ''}${course.video ? `<video class="course-content-video" controls preload="metadata" src="${escapeAttribute(getStorageVideo(course.video))}"></video>` : ''}<div class="modal-sub">${escapeHTML(course.desc)}</div>`;
  (course.modules||[]).forEach((mod, mi) => {
    html += `<div class="course-module">
      <div class="course-module-head" onclick="toggleCourseModule(${mi})">
        <span>${mi+1}. ${escapeHTML(mod.title)}</span>
        <span id="courseModuleArrow${mi}">▾</span>
      </div>
      <div id="courseModuleBody${mi}">
        ${mod.image ? `<img class="course-module-image" src="${escapeAttribute(mod.image)}" alt="Imagen del módulo">` : ''}
        ${mod.video ? `<video class="course-module-video" controls preload="metadata" src="${escapeAttribute(getStorageVideo(mod.video))}"></video>` : ''}`;
    (mod.sections||[]).forEach(sec => {
      html += `<div class="course-section">
        <div class="course-section-title">${escapeHTML(sec.title)}</div>
        ${sec.image ? `<img class="course-section-image" src="${escapeAttribute(sec.image)}" alt="Imagen de ${escapeAttribute(sec.title)}">` : ''}
        ${sec.video ? `<video class="course-section-video" controls preload="metadata" src="${escapeAttribute(getStorageVideo(sec.video))}"></video>` : ''}
        <div class="course-section-content">${escapeHTML(sec.content)}</div>
      </div>`;
    });
    html += `</div></div>`;
  });
  if(session && session.role==='admin'){
    html += `<div class="admin-preview-quiz">
      <div class="eyebrow">Examen final · vista previa</div>
      <h4>Así se mostrarán las preguntas al trabajador</h4>
      ${(course.quiz||[]).map((q,qi) => `<div class="admin-preview-question"><b>${qi+1}. ${escapeHTML(q.q)}</b><span>${q.options.length} opciones de respuesta</span></div>`).join('') || '<p class="modal-sub">Este curso todavía no tiene preguntas.</p>'}
    </div>`;
  }
  html += `<div class="modal-actions">
    <button class="btn btn-ghost btn-sm" onclick="closeCourseContent()">Cerrar vista previa</button>
    ${session && session.role!=='admin' ? `<button class="btn btn-primary btn-sm" onclick="closeCourseContent(); openQuiz(${i});">Presentar examen final</button>` : ''}
  </div>`;
  card.innerHTML = html;
  document.getElementById('courseContentOverlay').classList.remove('hidden');
}
function closeCourseContent(){
  document.getElementById('courseContentOverlay').classList.add('hidden');
}
function toggleCourseModule(mi){
  const body = document.getElementById('courseModuleBody'+mi);
  const arrow = document.getElementById('courseModuleArrow'+mi);
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  arrow.textContent = open ? '▸' : '▾';
}

/* =========================================================
   VISOR DEL CURSO (vista a pantalla completa del trabajador):
   muestra el avance del curso, los módulos y lo que sigue
========================================================= */
let viewerCourseIndex = null;
let viewerModule = 0;

function getCourseProgress(name, i){
  const w = workers[name];
  if(!w.courseProgress) w.courseProgress = {};
  if(!w.courseProgress[i]) w.courseProgress[i] = { viewed: [], current: 0 };
  return w.courseProgress[i];
}

function openCourseViewer(i){
  viewerCourseIndex = i;
  const mods = courses[i].modules || [];
  const cp = getCourseProgress(session.name, i);
  viewerModule = Math.min(cp.current || 0, Math.max(mods.length - 1, 0));
  showView('curso');
}

function closeCourseViewer(){
  viewerCourseIndex = null;
  showView('trabajador');
  renderSummary();
}

function viewerViewedCount(course, i){
  const total = (course.modules||[]).length;
  return getCourseProgress(session.name, i).viewed.filter(mi => mi < total).length;
}

function viewerProgressPct(course, i){
  if(myStatuses()[i].status === 'completado') return 100;
  const total = (course.modules||[]).length;
  return total === 0 ? 0 : Math.round((viewerViewedCount(course,i)/total)*100);
}

async function renderCourseViewer(){
  if(viewerCourseIndex === null) return;
  const course = courses[viewerCourseIndex];
  const mods = course.modules || [];
  const cp = getCourseProgress(session.name, viewerCourseIndex);
  const st = myStatuses()[viewerCourseIndex];
  const pct = viewerProgressPct(course, viewerCourseIndex);

  document.getElementById('playerTitle').textContent = course.title;
  document.getElementById('playerDesc').textContent = course.desc || '';

  if(course.video){
    document.getElementById('playerMedia').innerHTML = course.video
      ? `<video class="course-content-video" controls preload="metadata" src="${escapeAttribute(getStorageVideo(course.video))}"></video>`
      : '';
  } else {
    document.getElementById('playerMedia').innerHTML = '';
  }

  document.getElementById('playerMeta').innerHTML = `⏱ <span class="hrs">${course.hours} h</span> · ${mods.length} módulo(s) · Examen mínimo: ${APPROVAL_THRESHOLD}%`;
  document.getElementById('playerPct').textContent = pct + '%';
  document.getElementById('playerBar').style.width = pct + '%';
  document.getElementById('playerProgressSub').textContent = mods.length > 0
    ? `Estás en el módulo ${viewerModule+1} de ${mods.length} · ${viewerViewedCount(course,viewerCourseIndex)} visto(s)`
    : 'Este curso aún no tiene módulos';
  const scoreLine = document.getElementById('playerScore');
  if(st.score !== null){
    scoreLine.classList.remove('hidden');
    scoreLine.innerHTML = `Última calificación: <b>${st.score}%</b>${st.status==='completado' ? ' · ✅ Curso aprobado' : ''}`;
  } else {
    scoreLine.classList.add('hidden');
  }

  document.getElementById('playerModuleList').innerHTML = mods.map((mod, mi) => {
    const viewed = cp.viewed.includes(mi);
    const current = mi === viewerModule;
    const ico = viewed ? '✓' : (current ? '▶' : (mi+1));
    const state = viewed ? 'Visto' : (current ? 'Viendo ahora' : 'Pendiente');
    return `<div class="player-mod-item ${current?'current':''} ${viewed?'viewed':''}" onclick="goToViewerModule(${mi})">
      <span class="ico">${ico}</span>
      <span><span class="t">${escapeHTML(mod.title)}</span><div class="s">${(mod.sections||[]).length} secciones · ${state}</span></span>
    </div>`;
  }).join('') || `<div style="font-size:13px;color:var(--muted);padding:6px 4px;">Sin módulos por ahora.</div>`;

  document.getElementById('playerQuizHint').textContent = (mods.length > 0 && viewerViewedCount(course,viewerCourseIndex) < mods.length)
    ? `Recomendación: revisa los ${mods.length} módulos antes del examen.`
    : 'Listo: ya puedes presentar tu examen final.';

  const box = document.getElementById('playerContent');
  if(mods.length === 0){
    box.innerHTML = `<div class="player-section"><h4>Contenido en preparación</h4><p>Este curso todavía no tiene módulos. Si el examen ya está configurado, puedes presentarlo desde el panel lateral.</p></div>`;
    return;
  }
  const mod = mods[viewerModule];
  const viewed = cp.viewed.includes(viewerModule);
  const isLast = viewerModule === mods.length - 1;

  let html = `
    <div class="player-mod-kicker">Módulo ${viewerModule+1} de ${mods.length}</div>
    <div class="player-mod-head">
      <h2>${escapeHTML(mod.title)}</h2>
      ${viewed ? '<span class="status-badge status-completado">✓ Visto</span>' : '<span class="status-badge status-progreso">En lectura</span>'}
    </div>
    ${mod.image ? `<img class="course-module-image" src="${escapeAttribute(mod.image)}" alt="Imagen del módulo">` : ''}`;

  if(mod.video){
    html += mod.video ? `<video class="course-module-video" controls preload="metadata" src="${escapeAttribute(getStorageVideo(mod.video))}"></video>` : '';
  }

  for(let si = 0; si < (mod.sections||[]).length; si++){
    const sec = mod.sections[si];
    let secVideoHtml = '';
    if(sec.video){
      secVideoHtml = sec.video ? `<video class="course-section-video" controls preload="metadata" src="${escapeAttribute(getStorageVideo(sec.video))}"></video>` : '';
    }
    html += `<div class="player-section">
      <h4>${si+1}. ${escapeHTML(sec.title)}</h4>
      ${sec.image ? `<img class="course-section-image" src="${escapeAttribute(sec.image)}" alt="Imagen de ${escapeAttribute(sec.title)}">` : ''}
      ${secVideoHtml}
      <p>${escapeHTML(sec.content)}</p>
    </div>`;
  }

  if(!isLast){
    const next = mods[viewerModule+1];
    html += `<div class="player-next">
      <div class="eyebrow">A continuación</div>
      <h3>Módulo ${viewerModule+2}: ${escapeHTML(next.title)}</h3>
      <ul>${(next.sections||[]).map(s => `<li>${escapeHTML(s.title)}</li>`).join('') || '<li>Contenido en preparación</li>'}</ul>
      <button class="btn btn-ghost btn-sm" onclick="goToViewerModule(${viewerModule+1})">Adelantar el siguiente módulo →</button>
    </div>`;
  } else {
    html += `<div class="player-next">
      <div class="eyebrow">A continuación</div>
      <h3>Examen final de "${escapeHTML(course.title)}"</h3>
      <ul>
        <li>${(course.quiz||[]).length} pregunta(s) · calificación mínima ${APPROVAL_THRESHOLD}%</li>
        <li>Al aprobar, el curso se completa y se genera tu constancia</li>
      </ul>
      <button class="btn btn-ghost btn-sm" onclick="openQuiz(${viewerCourseIndex})">Ir al examen final →</button>
    </div>`;
  }

  const primaryAction = !viewed
    ? `<button class="btn btn-primary btn-sm" onclick="markViewerModuleViewed()">✓ Marcar como visto ${isLast ? 'y terminar' : 'y continuar'} →</button>`
    : (!isLast
        ? `<button class="btn btn-primary btn-sm" onclick="goToViewerModule(${viewerModule+1})">Siguiente módulo →</button>`
        : `<button class="btn btn-primary btn-sm" onclick="openQuiz(${viewerCourseIndex})">📝 Presentar examen final</button>`);
  html += `<div class="player-actions">${primaryAction}</div>`;

  box.innerHTML = html;
}
async function goToViewerModule(mi){
  viewerModule = mi;
  getCourseProgress(session.name, viewerCourseIndex).current = mi;
  saveWorkers(workers);
  await renderCourseViewer();
  window.scrollTo({ top:0, behavior:'smooth' });
}

async function markViewerModuleViewed(){
  const mods = courses[viewerCourseIndex].modules || [];
  const cp = getCourseProgress(session.name, viewerCourseIndex);
  if(!cp.viewed.includes(viewerModule)) cp.viewed.push(viewerModule);
  const st = myStatuses()[viewerCourseIndex];
  if(st.status !== 'completado') st.status = 'progreso';
  if(viewerModule < mods.length - 1){ cp.current = viewerModule + 1; viewerModule++; }
  saveWorkers(workers);
  await renderCourseViewer();
  window.scrollTo({ top:0, behavior:'smooth' });
}

/* =========================================================
   EXAMEN FINAL DEL CURSO (RF-030 a RF-036)
========================================================= */
function openQuiz(courseIndex){
  pendingQuizCourseIndex = courseIndex;
  quizAnswers = new Array(courses[courseIndex].quiz.length).fill(null);
  renderQuizStep();
  document.getElementById('quizOverlay').classList.remove('hidden');
}
function closeQuiz(){
  document.getElementById('quizOverlay').classList.add('hidden');
  pendingQuizCourseIndex = null;
}
function renderQuizStep(){
  const course = courses[pendingQuizCourseIndex];
  const card = document.getElementById('quizCard');
  const answered = quizAnswers.filter(a => a !== null).length;
  let html = `<div class="quiz-card-head">
      <div><div class="quiz-kicker">Evaluación final · CICSA</div><h3>${escapeHTML(course.title)}</h3><div class="modal-sub">Responde con atención. Necesitas ${APPROVAL_THRESHOLD}% para aprobar.</div></div>
      <div class="quiz-progress">${answered}/${course.quiz.length}</div>
    </div>
    <div class="quiz-instructions"><span>ⓘ</span><span><strong>Indicaciones:</strong> selecciona una respuesta por pregunta. Puedes revisar tus selecciones antes de enviar el examen.</span></div>`;
  course.quiz.forEach((q, qi) => {
    html += `<div class="quiz-q"><p>${qi+1}. ${escapeHTML(q.q)}</p>`;
    q.options.forEach((opt, oi) => {
      const sel = quizAnswers[qi]===oi ? 'selected' : '';
      html += `<label class="quiz-opt ${sel}" onclick="selectAnswer(${qi},${oi})">
        <input type="radio" name="q${qi}" ${quizAnswers[qi]===oi?'checked':''}> ${escapeHTML(opt)}
      </label>`;
    });
    html += `</div>`;
  });
  html += `<div class="modal-actions">
    <span class="quiz-submit-note">${answered < course.quiz.length ? `Faltan ${course.quiz.length - answered} por responder` : 'Todas las preguntas respondidas'}</span>
    <button class="btn btn-ghost btn-sm" onclick="closeQuiz()">Cancelar</button>
    <button class="btn btn-primary btn-sm" onclick="submitQuiz()">Enviar examen</button>
  </div>`;
  card.innerHTML = html;
}
function selectAnswer(qi, oi){ quizAnswers[qi] = oi; renderQuizStep(); }

async function closeQuizAndRefresh(){
  closeQuiz();
  renderAll();
  if(viewerCourseIndex!==null) await renderCourseViewer();
}
function submitQuiz(){
  if(quizAnswers.some(a => a===null)){ alert('Responde todas las preguntas antes de enviar.'); return; }
  const course = courses[pendingQuizCourseIndex];
  let correct = 0;
  course.quiz.forEach((q,qi) => { if(quizAnswers[qi]===q.correct) correct++; });
  const score = Math.round((correct/course.quiz.length)*100);
  const pass = score >= APPROVAL_THRESHOLD;

  const st = myStatuses()[pendingQuizCourseIndex];
  st.score = score;
  st.attempts = (st.attempts||0) + 1;
  st.lastResult = pass ? 'aprobado' : 'reprobado';
  st.status = pass ? 'completado' : 'progreso';

  if(pass){
    const workerEntry = roster.find(r => r.name===session.name);
    workers[session.name].certificates.push({
      courseIndex: pendingQuizCourseIndex,
      courseTitle: course.title,
      hours: course.hours,
      date: new Date().toISOString(),
      name: session.name,
      area: workerEntry ? workerEntry.area : '',
    });
  }
  saveWorkers(workers);

  const card = document.getElementById('quizCard');
  card.innerHTML = `
    <h3>Resultado</h3>
    <div class="quiz-result ${pass?'pass':'fail'}">
      <div class="score">${score}%</div>
      <p>${pass ? '✅ Aprobado. El curso se marcó como completado y se generó tu constancia.' : '❌ No alcanzaste el mínimo aprobatorio. Puedes revisar el contenido y volver a intentarlo.'}</p>
    </div>
    <div class="modal-actions">
      ${!pass ? `<button class="btn btn-ghost btn-sm" onclick="openQuiz(${pendingQuizCourseIndex})">Reintentar</button>` : ''}
      <button class="btn btn-primary btn-sm" onclick="closeQuiz(); renderAll(); if(viewerCourseIndex!==null) renderCourseViewer();">Cerrar</button>
    </div>`;
}

/* =========================================================
   PERFIL DEL TRABAJADOR (propio o visto por el admin)
========================================================= */
function buildProfileHTML(name){
  ensureWorkerRecord(name);
  const rosterEntry = roster.find(r => r.name===name);
  const w = workers[name];
  const activity = getWorkerActivity(rosterEntry || {active:true,lastLogin:null});
  const mine = courses.map((c,i)=>({c,i})).filter(x => {
    const a = x.c.assignment || {type:'todos'};
    if(a.type==='todos') return true;
    if(a.type==='area') return rosterEntry && rosterEntry.area===a.area;
    if(a.type==='individual') return (a.workers||[]).includes(name);
    return true;
  });

  const totalHours = mine.reduce((a,x)=>a+x.c.hours,0);
  const doneHours = mine.reduce((a,x)=> a + (w.statuses[x.i].status==='completado' ? x.c.hours : 0), 0);
  const completados = mine.filter(x=>w.statuses[x.i].status==='completado').length;
  const enProgreso = mine.filter(x=>w.statuses[x.i].status==='progreso' && w.statuses[x.i].lastResult!=='reprobado').length;
  const reprobados = mine.filter(x=>w.statuses[x.i].lastResult==='reprobado' && w.statuses[x.i].status!=='completado').length;
  const pendientes = mine.filter(x=>w.statuses[x.i].status==='pendiente').length;

  let html = `
    <div class="worker-profile-head">
      <div><span class="eyebrow">${session && session.role==='admin' ? 'FICHA DEL TRABAJADOR' : 'MI PERFIL'}</span><h3>${escapeHTML(name)}</h3><p>${escapeHTML(rosterEntry ? rosterEntry.area : '—')}</p></div>
      <div class="profile-activity"><b>${escapeHTML(activity.label)}</b><span>Último acceso: ${escapeHTML(formatLastLogin(rosterEntry || {}))}</span></div>
    </div>
    <div class="profile-grid">
      <div class="profile-stat"><div class="v">${doneHours}/${totalHours}</div><div class="k">Horas completadas</div></div>
      <div class="profile-stat"><div class="v">${completados}</div><div class="k">Cursos completados</div></div>
      <div class="profile-stat"><div class="v">${enProgreso}</div><div class="k">En progreso</div></div>
      <div class="profile-stat"><div class="v">${reprobados}</div><div class="k">No aprobados (aún)</div></div>
    </div>
    <div class="table-wrap" style="margin-bottom:26px;">
      <table>
        <thead><tr><th>Curso</th><th>Estado</th><th>Última calificación</th></tr></thead>
        <tbody>
          ${mine.map(x => {
            const s = w.statuses[x.i];
            const label = s.status==='completado' ? 'Completado' : s.status==='pendiente' ? 'Sin iniciar' : (s.lastResult==='reprobado' ? 'No aprobado aún' : 'En progreso');
            const color = s.status==='completado' ? 'var(--blue)' : (s.lastResult==='reprobado' ? 'var(--red)' : s.status==='progreso' ? 'var(--orange)' : 'var(--muted)');
            const bg = s.status==='completado' ? 'rgba(11,76,140,0.1)' : (s.lastResult==='reprobado' ? 'rgba(226,59,46,.1)' : s.status==='progreso' ? 'rgba(242,135,46,.14)' : 'var(--bg-alt)');
            return `<tr><td><b>${escapeHTML(x.c.title)}</b></td><td><span class="mini-badge" style="color:${color};background:${bg};">${label}</span></td><td>${s.score!==null ? s.score+'%' : '—'}</td></tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    <h3 style="font-size:16px;color:var(--blue);margin-bottom:10px;">Constancias obtenidas</h3>
    ${w.certificates.length===0
      ? `<p style="color:var(--muted);font-size:13.5px;">Todavía no hay constancias generadas.</p>`
      : `<div class="cert-mini-grid">${w.certificates.map((cert,ci) => `
          <div class="cert-mini">
            <div class="t">${escapeHTML(cert.courseTitle)}</div>
            <div class="d">${new Date(cert.date).toLocaleDateString('es-MX',{day:'2-digit',month:'long',year:'numeric'})} · ${cert.hours} h</div>
            <button class="btn btn-ghost btn-sm" style="margin-top:10px;" onclick="printCertificate('${escapeAttribute(name)}', ${ci})">Ver / Imprimir</button>
          </div>`).join('')}</div>`
    }
  `;
  return html;
}

function renderMyProfile(){
  if(!session) return;
  document.getElementById('profileContent').innerHTML = buildProfileHTML(session.name);
}

function openWorkerProfileModal(name){
  if(!session || session.role!=='admin'){ alert('Solo el administrador puede ver el perfil de un trabajador.'); return; }
  const card = document.getElementById('profileModalCard');
  card.innerHTML = `<h3>Perfil de ${escapeHTML(name)}</h3><div class="modal-sub">Avance, cursos y constancias de este trabajador.</div>
    ${buildProfileHTML(name)}
    <div class="modal-actions"><button class="btn btn-ghost btn-sm" onclick="closeWorkerProfileModal()">Cerrar</button></div>`;
  document.getElementById('profileOverlay').classList.remove('hidden');
}
function closeWorkerProfileModal(){ document.getElementById('profileOverlay').classList.add('hidden'); }

/* =========================================================
   CONSTANCIA — llenar plantilla e imprimir
========================================================= */
function printCertificate(name, certIndex){
  const cert = workers[name].certificates[certIndex];
  if(!cert) return;
  document.getElementById('certName').textContent = name;
  document.getElementById('certCourse').textContent = cert.courseTitle;
  document.getElementById('certHours').textContent = cert.hours;
  document.getElementById('certArea').textContent = cert.area || '—';
  document.getElementById('certDate').textContent = new Date(cert.date).toLocaleDateString('es-MX',{day:'2-digit',month:'long',year:'numeric'});
  window.print();
}

/* =========================================================
   ADMIN — CURSOS (crear, asignar, editar contenido, eliminar)
========================================================= */

function populatePuestoSelect(){
  const sel = document.getElementById('newWorkerArea');
  if(sel) sel.innerHTML = PUESTOS.map(p => `<option value="${escapeHTML(p)}">${escapeHTML(p)}</option>`).join('');
}
function populateAssignAreaSelect(){
  const sel = document.getElementById('newCourseAssignArea');
  if(sel) sel.innerHTML = PUESTOS.map(p => `<option value="${escapeHTML(p)}">${escapeHTML(p)}</option>`).join('');
}
function onAssignTypeChange(){
  const type = document.getElementById('newCourseAssignType').value;
  document.getElementById('assignAreaWrap').classList.toggle('hidden', type!=='area');
  document.getElementById('assignWorkersWrap').classList.toggle('hidden', type!=='individual');
  if(type==='individual') renderAssignWorkersList();
}
function renderAssignWorkersList(){
  const list = document.getElementById('assignWorkersList');
  if(roster.length===0){ list.innerHTML = `<span style="color:var(--muted);font-size:13px;">No hay trabajadores registrados.</span>`; return; }
  list.innerHTML = roster.map(r => `
    <label><input type="checkbox" value="${escapeAttribute(r.name)}"> ${escapeHTML(r.name)} — ${escapeHTML(r.area)}</label>
  `).join('');
}

function previewNewCourseImage(event){
  const file = event.target.files?.[0];
  const preview = document.getElementById('newModImagePreview');
  if(!preview) return;
  if(!file){ preview.classList.add('hidden'); preview.innerHTML=''; return; }
  if(!file.type.startsWith('image/')){ alert('Selecciona una imagen válida.'); event.target.value=''; return; }
  const reader = new FileReader();
  reader.onload = e => {
    preview.innerHTML = `<img src="${e.target.result}" alt="Vista previa del curso">`;
    preview.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function resizeImageFile(file, maxWidth=1200, maxHeight=700, quality=0.82){
  return new Promise((resolve,reject)=>{
    if(!file) return resolve('');
    if(!file.type.startsWith('image/')) return reject(new Error('El archivo no es una imagen.'));
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth/img.width, maxHeight/img.height);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width*scale));
        canvas.height = Math.max(1, Math.round(img.height*scale));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL('image/jpeg',quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function addModule(){
  if(!session || session.role!=='admin'){ alert('Solo el administrador puede agregar cursos.'); return; }
  const title = document.getElementById('newModTitle').value.trim();
  const hours = parseInt(document.getElementById('newModHours').value) || 1;
  const desc = document.getElementById('newModDesc').value.trim() || 'Sin descripción.';
  if(!title){ alert('Escribe un título para el curso.'); return; }

  let image = '';
  let video = '';
  const imageInput = document.getElementById('newModImage');
  if(imageInput?.files?.[0]){
    try { image = await resizeImageFile(imageInput.files[0]); }
    catch(e){ alert('No se pudo cargar la imagen del curso.'); return; }
  }
  const videoInput = document.getElementById('newModVideo');
  if(videoInput?.files?.[0]){
    try { video = await readVideoFile(videoInput.files[0]); }
    catch(e){ alert(e.message || 'No se pudo cargar el video del curso.'); return; }
  }

  const assignType = document.getElementById('newCourseAssignType').value;
  let assignment = { type:'todos', area:null, workers:[] };
  if(assignType==='area'){
    assignment = { type:'area', area: document.getElementById('newCourseAssignArea').value, workers:[] };
  } else if(assignType==='individual'){
    const checked = Array.from(document.getElementById('assignWorkersList').querySelectorAll('input:checked')).map(el=>el.value);
    if(checked.length===0){ alert('Selecciona al menos un trabajador para este curso.'); return; }
    assignment = { type:'individual', area:null, workers: checked };
  }

  courses.push({
    title, desc, hours, assignment, image, video,
    modules:[
      { title:"Módulo 1", sections:[
        { title:"Sección 1", content:"Edita este contenido desde el botón ✏️." },
        { title:"Sección 2", content:"Edita este contenido desde el botón ✏️." },
        { title:"Sección 3", content:"Edita este contenido desde el botón ✏️." },
      ]},
    ],
    quiz:[
      { q:"Pregunta de ejemplo 1 (edítala en el código)", options:["Opción A","Opción B","Opción C"], correct:0 },
      { q:"Pregunta de ejemplo 2 (edítala en el código)", options:["Opción A","Opción B","Opción C"], correct:0 },
    ],
  });
  saveCourses(courses);
  Object.keys(workers).forEach(n => workers[n].statuses.push({ status:'pendiente', score:null, lastResult:null, attempts:0 }));
  saveWorkers(workers);

  document.getElementById('newModTitle').value = '';
  document.getElementById('newModDesc').value = '';
  if(document.getElementById('newModImage')) document.getElementById('newModImage').value = '';
  if(document.getElementById('newModVideo')) document.getElementById('newModVideo').value = '';
  if(document.getElementById('newModImagePreview')) document.getElementById('newModImagePreview').classList.add('hidden');
  renderAdmin();
}

function deleteModule(i){
  if(!session || session.role!=='admin'){ alert('Solo el administrador puede eliminar cursos.'); return; }
  if(!confirm('¿Eliminar este curso? Esto también borra el avance registrado en él.')) return;
  courses.splice(i,1);
  saveCourses(courses);
  Object.keys(workers).forEach(n => workers[n].statuses.splice(i,1));
  saveWorkers(workers);
  renderAdmin();
}

/* ---------- Editor de módulos/secciones (RF-013, RF-014) ---------- */
function openCourseEditor(i){
  if(!session || session.role!=='admin'){ alert('Solo el administrador puede editar el contenido.'); return; }
  editingCourseIndex = i;
  editingModules = JSON.parse(JSON.stringify(courses[i].modules || []));
  renderCourseEditor();
  document.getElementById('courseEditorOverlay').classList.remove('hidden');
}
function closeCourseEditor(){
  document.getElementById('courseEditorOverlay').classList.add('hidden');
  editingCourseIndex = null; editingModules = null;
}
function renderCourseEditor(){
  const card = document.getElementById('courseEditorCard');
  const course = courses[editingCourseIndex];
  let html = `<h3>Editar contenido: ${escapeHTML(course.title)}</h3>
    <div class="modal-sub">Cambia la imagen del curso y agrega imágenes o videos a cada módulo y sección.</div>
    <div class="field course-image-editor">
      <label>Imagen principal del curso</label>
      ${course.image ? `<img class="course-editor-image" src="${escapeAttribute(course.image)}" alt="Imagen actual">` : `<div class="no-course-image">Este curso todavía no tiene imagen.</div>`}
      <input id="courseImageInput" type="file" accept="image/*" onchange="previewCourseEditorImage(event)">
      <div id="courseImagePreview" class="course-image-preview hidden"></div>
      ${course.image ? `<button class="btn btn-ghost btn-sm" onclick="removeCourseImage()">🗑 Quitar imagen</button>` : ''}
    </div>`;
  editingModules.forEach((mod, mi) => {
    html += `<div class="editor-module">
      <div class="editor-module-head">
        <input type="text" value="${escapeAttribute(mod.title)}" oninput="updateModuleTitle(${mi}, this.value)" placeholder="Título del módulo">
        <button class="icon-btn" title="Eliminar módulo" onclick="removeEditorModule(${mi})">🗑</button>
      </div>
      <div class="editor-media-field">
        <label>Imagen del módulo</label>
        ${mod.image ? `<img class="editor-module-image" src="${escapeAttribute(mod.image)}" alt="Imagen del módulo">` : `<div class="no-course-image small">Sin imagen de módulo</div>`}
        <input type="file" accept="image/*" onchange="setModuleImage(event,${mi})">
        ${mod.image ? `<button class="btn btn-ghost btn-sm" onclick="removeModuleImage(${mi})">🗑 Quitar imagen</button>` : ''}
        <label style="margin-top:6px;">Video del módulo (opcional, máx. ${MAX_VIDEO_MB} MB)</label>
        ${mod.video ? getVideoHtmlForEditor(mod.video) : `<div class="no-course-image small">Sin video de módulo</div>`}
        <input type="file" accept="video/*" onchange="setModuleVideo(event,${mi})">
        ${mod.video ? `<button class="btn btn-ghost btn-sm" onclick="removeModuleVideo(${mi})">🗑 Quitar video</button>` : ''}
      </div>`;
    (mod.sections||[]).forEach((sec, si) => {
      html += `<div class="editor-section">
        <div class="editor-section-fields">
          <input type="text" value="${escapeAttribute(sec.title)}" oninput="updateSectionTitle(${mi},${si}, this.value)" placeholder="Título de sección">
          <textarea oninput="updateSectionContent(${mi},${si}, this.value)" placeholder="Contenido">${escapeHTML(sec.content)}</textarea>
          ${sec.image ? `<img class="editor-section-image" src="${escapeAttribute(sec.image)}" alt="Imagen de sección">` : `<div class="no-course-image small">Sin imagen de sección</div>`}
          <input type="file" accept="image/*" onchange="setSectionImage(event,${mi},${si})">
          ${sec.image ? `<button class="btn btn-ghost btn-sm" onclick="removeSectionImage(${mi},${si})">🗑 Quitar imagen</button>` : ''}
          ${sec.video ? getVideoHtmlForEditor(sec.video) : ''}
          <input type="file" accept="video/*" title="Anexar video a la sección" onchange="setSectionVideo(event,${mi},${si})">
          ${sec.video ? `<button class="btn btn-ghost btn-sm" onclick="removeSectionVideo(${mi},${si})">🗑 Quitar video</button>` : ''}
        </div>
        <button class="icon-btn" title="Eliminar sección" onclick="removeEditorSection(${mi},${si})">✕</button>
      </div>`;
    });
    html += `<button class="btn btn-ghost btn-sm" onclick="addEditorSection(${mi})">+ Sección</button></div>`;
  });
  html += `<button class="btn btn-ghost btn-sm" style="margin-bottom:14px;" onclick="addEditorModule()">+ Agregar módulo</button>
    <div class="modal-actions">
      <button class="btn btn-ghost btn-sm" onclick="closeCourseEditor()">Cancelar</button>
      <button class="btn btn-primary btn-sm" onclick="saveCourseEditor()">Guardar contenido</button>
    </div>`;
  card.innerHTML = html;
}

async function setModuleImage(event, mi){
  const file=event.target.files?.[0]; if(!file) return;
  try { editingModules[mi].image=await resizeImageFile(file); renderCourseEditor(); }
  catch(e){ alert('No se pudo cargar la imagen del módulo.'); }
}
function removeModuleImage(mi){ editingModules[mi].image=''; renderCourseEditor(); }
async function setSectionImage(event, mi, si){
  const file=event.target.files?.[0]; if(!file) return;
  try { editingModules[mi].sections[si].image=await resizeImageFile(file); renderCourseEditor(); }
  catch(e){ alert('No se pudo cargar la imagen de la sección.'); }
}
function removeSectionImage(mi,si){ editingModules[mi].sections[si].image=''; renderCourseEditor(); }

/* ---------- Video en módulos y secciones ---------- */
const MAX_VIDEO_MB = 25;
const LS_VIDEOS = 'cicsa_videos_v1';

function saveVideoToStorage(videoData){
  let videos = {};
  try { videos = JSON.parse(localStorage.getItem(LS_VIDEOS) || '{}'); }
  catch(e){}
  const videoId = 'vid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  videos[videoId] = videoData;
  localStorage.setItem(LS_VIDEOS, JSON.stringify(videos));
  return 'data:video_storage/' + videoId;
}

async function readVideoFile(file){
  return new Promise((resolve,reject)=>{
    if(!file) return resolve('');
    if(!file.type.startsWith('video/')) return reject(new Error('El archivo no es un video.'));
    if(file.size > MAX_VIDEO_MB*1024*1024) return reject(new Error(`El video supera ${MAX_VIDEO_MB} MB; súbelo más ligero o recórtalo.`));

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      const videoRef = saveVideoToStorage(base64Data);
      resolve(videoRef);
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo de video.'));
    reader.readAsDataURL(file);
  });
}
async function setModuleVideo(event, mi){
  const file=event.target.files?.[0]; if(!file) return;
  try { editingModules[mi].video=await readVideoFile(file); renderCourseEditor(); }
  catch(e){ alert(e.message || 'No se pudo cargar el video del módulo.'); }
}
function removeModuleVideo(mi){ editingModules[mi].video=''; renderCourseEditor(); }
async function setSectionVideo(event, mi, si){
  const file=event.target.files?.[0]; if(!file) return;
  try { editingModules[mi].sections[si].video=await readVideoFile(file); renderCourseEditor(); }
  catch(e){ alert(e.message || 'No se pudo cargar el video de la sección.'); }
}
function removeSectionVideo(mi,si){ editingModules[mi].sections[si].video=''; renderCourseEditor(); }

function previewCourseEditorImage(event){
  const file = event.target.files?.[0];
  const preview = document.getElementById('courseImagePreview');
  if(!preview) return;
  if(!file) return;
  resizeImageFile(file).then(data=>{
    preview.innerHTML = `<img src="${data}" alt="Nueva imagen">`;
    preview.dataset.image = data;
    preview.classList.remove('hidden');
  }).catch(()=>alert('No se pudo cargar la imagen.'));
}
function removeCourseImage(){
  courses[editingCourseIndex].image = '';
  renderCourseEditor();
}
function updateModuleTitle(mi,val){ editingModules[mi].title = val; }
function updateSectionTitle(mi,si,val){ editingModules[mi].sections[si].title = val; }
function updateSectionContent(mi,si,val){ editingModules[mi].sections[si].content = val; }
function addEditorSection(mi){
  if(editingModules[mi].sections.length>=5){ alert('Máximo 5 secciones por módulo.'); return; }
  editingModules[mi].sections.push({ title:'Nueva sección', content:'', image:'', video:'' });
  renderCourseEditor();
}
function removeEditorSection(mi,si){
  if(editingModules[mi].sections.length<=1){ alert('Debe quedar al menos 1 sección.'); return; }
  editingModules[mi].sections.splice(si,1);
  renderCourseEditor();
}
function addEditorModule(){
  editingModules.push({ title:'Nuevo módulo', image:'', sections:[
    { title:'Sección 1', content:'', image:'' }, { title:'Sección 2', content:'', image:'' }, { title:'Sección 3', content:'', image:'' },
  ]});
  renderCourseEditor();
}
function removeEditorModule(mi){
  if(!confirm('¿Eliminar este módulo y todas sus secciones?')) return;
  editingModules.splice(mi,1);
  renderCourseEditor();
}
async function saveCourseEditor(){
  if(!session || session.role!=='admin'){ alert('Solo el administrador puede guardar cambios.'); return; }
  courses[editingCourseIndex].modules = editingModules;
  const input = document.getElementById('courseImageInput');
  const preview = document.getElementById('courseImagePreview');
  if(input?.files?.[0]){
    try {
      courses[editingCourseIndex].image = await resizeImageFile(input.files[0]);
    } catch(e) {
      alert('No se pudo guardar la imagen del curso.');
      return;
    }
  } else if(preview?.dataset?.image){
    courses[editingCourseIndex].image = preview.dataset.image;
  }
  saveCourses(courses);
  closeCourseEditor();
  renderAdmin();
  alert('Contenido actualizado.');
}

/* =========================================================
   ADMIN — TRABAJADORES (RF-001, RF-005)
========================================================= */
function addRosterWorker(){
  if(!session || session.role!=='admin'){ alert('Solo el administrador puede agregar trabajadores.'); return; }
  const name = document.getElementById('newWorkerName').value.trim();
  const area = document.getElementById('newWorkerArea').value;
  const password = document.getElementById('newWorkerPassword').value.trim();
  if(!name){ alert('Escribe el nombre del trabajador.'); return; }
  if(!password){ alert('Asigna una contraseña para este trabajador.'); return; }
  if(roster.some(r => r.name.toLowerCase()===name.toLowerCase())){ alert('Ese nombre ya está en la lista.'); return; }
  roster.push({ name, area, password, active:true, lastLogin:null });
  saveRoster(roster);
  ensureWorkerRecord(name);
  document.getElementById('newWorkerName').value = '';
  document.getElementById('newWorkerPassword').value = '';
  renderRosterTable();
  renderWorkersTable();
  populateLoginRosterSelect();
}

function toggleWorkerStatus(name){
  if(!session || session.role!=='admin'){ alert('Solo el administrador puede modificar cuentas.'); return; }
  const entry = roster.find(r => r.name===name);
  if(!entry) return;
  entry.active = entry.active===false ? true : false;
  saveRoster(roster);
  renderRosterTable();
  populateLoginRosterSelect();
  renderWorkersTable();
}

function toggleWorkerPassword(name){
  if(!session || session.role!=='admin'){ alert('Solo el administrador puede consultar contraseñas.'); return; }
  const entry = roster.find(r => r.name===name);
  if(!entry) return;
  const span = document.getElementById(`password-${encodeURIComponent(name)}`);
  const button = document.getElementById(`eye-${encodeURIComponent(name)}`);
  if(!span) return;
  if(span.textContent.trim()==='••••••'){
    span.textContent = entry.password;
    if(button){ button.textContent='🙈'; button.title='Ocultar contraseña'; }
  } else {
    span.textContent = '••••••';
    if(button){ button.textContent='👁️'; button.title='Ver contraseña'; }
  }
}

function changeRosterPassword(name){
  if(!session || session.role!=='admin'){ alert('No tienes permisos para realizar esta acción.'); return; }
  const entry = roster.find(r => r.name===name);
  if(!entry) return;
  passwordChangeTarget = name;
  document.getElementById('passwordModalTitle').textContent = `Contraseña · ${name}`;
  const cur = document.getElementById('currentPasswordModal');
  cur.value = entry.password; cur.type = 'password';
  const nw = document.getElementById('newPasswordModal');
  nw.value = ''; nw.type = 'password';
  document.getElementById('toggleCurrentPasswordBtn').textContent = '👁️';
  document.getElementById('toggleNewPasswordBtn').textContent = '👁️';
  document.getElementById('passwordOverlay').classList.remove('hidden');
  setTimeout(() => nw.focus(), 50);
}
function toggleCurrentPassword(){
  if(!session || session.role!=='admin') return;
  const input = document.getElementById('currentPasswordModal');
  const button = document.getElementById('toggleCurrentPasswordBtn');
  const show = input.type==='password';
  input.type = show ? 'text' : 'password';
  button.textContent = show ? '🙈' : '👁️';
}
function toggleNewPassword(){
  if(!session || session.role!=='admin') return;
  const input = document.getElementById('newPasswordModal');
  const button = document.getElementById('toggleNewPasswordBtn');
  const show = input.type==='password';
  input.type = show ? 'text' : 'password';
  button.textContent = show ? '🙈' : '👁️';
}
function closePasswordModal(){
  passwordChangeTarget = null;
  document.getElementById('passwordOverlay').classList.add('hidden');
  document.getElementById('currentPasswordModal').value = '';
  document.getElementById('newPasswordModal').value = '';
  document.getElementById('currentPasswordModal').type = 'password';
  document.getElementById('newPasswordModal').type = 'password';
  document.getElementById('toggleCurrentPasswordBtn').textContent = '👁️';
  document.getElementById('toggleNewPasswordBtn').textContent = '👁️';
}
function savePasswordModal(){
  if(!session || session.role!=='admin'){ alert('No tienes permisos para cambiar contraseñas.'); return; }
  if(!passwordChangeTarget) return;
  const nueva = document.getElementById('newPasswordModal').value.trim();
  if(!nueva){ alert('Escribe una nueva contraseña.'); return; }
  const entry = roster.find(r => r.name===passwordChangeTarget);
  if(!entry){ closePasswordModal(); return; }
  entry.password = nueva;
  saveRoster(roster);
  resetRequests = resetRequests.map(r => (r.name===passwordChangeTarget && r.status==='pendiente') ? {...r, status:'atendida'} : r);
  saveResetRequests(resetRequests);
  renderRosterTable();
  renderResetRequests();
  closePasswordModal();
  alert('Contraseña actualizada correctamente.');
}

/* =========================================================
   TABLAS DEL PANEL ADMIN
========================================================= */
function renderResetRequests(){
  const tbody = document.getElementById('resetRequestsTable');
  if(!tbody) return;
  if(resetRequests.length===0){
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:16px;">No hay solicitudes.</td></tr>`;
    return;
  }
  tbody.innerHTML = resetRequests.slice().reverse().map(r => {
    const fecha = new Date(r.createdAt).toLocaleString('es-MX');
    const safeName = escapeAttribute(r.name);
    const action = r.status==='pendiente'
      ? `<button class="btn btn-blue btn-sm" onclick="changeRosterPassword('${safeName}')">🔑 Restablecer</button>`
      : `<span class="mini-badge" style="color:var(--green);background:rgba(46,139,87,.1);">Atendida</span>`;
    return `<tr><td><b>${escapeHTML(r.name)}</b></td><td>${fecha}</td><td>${r.status==='pendiente'?'Pendiente':'Atendida'}</td><td>${action}</td></tr>`;
  }).join('');
}

function renderRosterTable(){
  const tbody = document.getElementById('rosterTable');
  if(!tbody) return;
  if(roster.length===0){
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:16px;">Aún no hay trabajadores registrados.</td></tr>`;
    return;
  }
  tbody.innerHTML = roster.map(r => {
    const encodedName = encodeURIComponent(r.name);
    const safeName = escapeAttribute(r.name);
    return `
      <tr>
        <td><b>${escapeHTML(r.name)}</b></td>
        <td>${escapeHTML(r.area)}</td>
        <td><span class="mini-badge" style="color:${r.active===false?'var(--red)':'var(--green)'};background:${r.active===false?'rgba(226,59,46,.1)':'rgba(46,139,87,.1)'};">${r.active===false?'Desactivado':'Activo'}</span></td>
        <td class="mono">
          <span id="password-${encodedName}">••••••</span>
          <button id="eye-${encodedName}" class="icon-btn" title="Ver contraseña" onclick="toggleWorkerPassword('${safeName}')">👁️</button>
          <button class="icon-btn" title="Cambiar contraseña" onclick="changeRosterPassword('${safeName}')">✏️</button>
        </td>
        <td><button class="btn btn-ghost btn-sm" onclick="openWorkerProfileModal('${safeName}')">👤 Ver</button></td>
        <td><button class="icon-btn" title="${r.active===false?'Activar cuenta':'Desactivar cuenta'}" onclick="toggleWorkerStatus('${safeName}')">${r.active===false?'🟢':'🔴'}</button></td>
      </tr>`;
  }).join('');
}

function renderAdminModulesTable(){
  const tbody = document.getElementById('adminModulesTable');
  if(!tbody) return;
  if(!courses.length){
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:16px;">Aún no hay cursos registrados.</td></tr>`;
    return;
  }
  tbody.innerHTML = courses.map((m,i) => {
    const quizCount = Array.isArray(m.quiz) ? m.quiz.length : 0;
    return `
    <tr>
      <td>${String(i+1).padStart(2,'0')}</td>
      <td><b>${escapeHTML(m.title)}</b><br><span style="color:var(--muted);font-size:12px;">${escapeHTML(m.desc)}</span></td>
      <td>${m.hours} h</td>
      <td><span class="assign-tag">${escapeHTML(assignmentLabel(m))}</span></td>
      <td><button class="btn btn-ghost btn-sm" onclick="openCourseEditor(${i})">✏️ Editar</button></td>
      <td><span class="mini-badge" style="color:${quizCount ? 'var(--green)' : 'var(--muted)'};background:${quizCount ? 'rgba(46,139,87,.1)' : 'var(--bg-alt)'};">${quizCount ? quizCount + ' pregunta(s)' : 'Sin examen'}</span></td>
      <td><button class="icon-btn" title="Eliminar" onclick="deleteModule(${i})">🗑</button></td>
    </tr>`;
  }).join('');
}

function renderAdminCoursePreview(){
  const grid = document.getElementById('adminCoursePreviewGrid');
  if(!grid) return;
  if(!courses.length){
    grid.innerHTML = `<div style="color:var(--muted);padding:20px;">Aún no hay cursos registrados.</div>`;
    return;
  }
  grid.innerHTML = courses.map((course,i) => {
    const modules = (course.modules||[]).length;
    const questions = Array.isArray(course.quiz) ? course.quiz.length : 0;
    const media = course.image
      ? `<img src="${escapeAttribute(course.image)}" alt="Imagen de ${escapeAttribute(course.title)}">`
      : `<div class="preview-placeholder">📚</div>`;
    return `<article class="admin-course-preview-card">
      <div class="preview-media">${media}</div>
      <div class="admin-course-preview-body">
        <h4>${escapeHTML(course.title)}</h4>
        <p>${escapeHTML(course.desc || 'Sin descripción.')}</p>
        <div class="admin-course-preview-meta">⏱ ${course.hours} h · ${modules} módulo(s) · ${questions} pregunta(s)</div>
        <button class="btn btn-blue btn-sm" onclick="openAdminCoursePreview(${i})">👁 Ver como trabajador</button>
      </div>
    </article>`;
  }).join('');
}

function openAdminCoursePreview(index){
  if(!session || session.role!=='admin'){
    alert('Solo el administrador puede abrir esta vista previa.');
    return;
  }
  openCourseContent(index);
}

function computeWorkerSummary(name){
  ensureWorkerRecord(name);
  const rosterEntry = roster.find(r => r.name===name);
  const mine = courses.map((c,i)=>({c,i})).filter(x => {
    const a = x.c.assignment || {type:'todos'};
    if(a.type==='todos') return true;
    if(a.type==='area') return rosterEntry && rosterEntry.area===a.area;
    if(a.type==='individual') return (a.workers||[]).includes(name);
    return true;
  });
  const st = workers[name].statuses;
  const totalHours = mine.reduce((a,x)=>a+x.c.hours,0);
  const doneHours = mine.reduce((a,x)=> a + (st[x.i] && st[x.i].status==='completado' ? x.c.hours : 0), 0);
  const doneCount = mine.filter(x=>st[x.i] && st[x.i].status==='completado').length;
  const anyProgress = mine.some(x=>st[x.i] && st[x.i].status!=='pendiente');
  let estado = 'pendiente';
  if(doneCount===mine.length && mine.length>0) estado = 'completado';
  else if(anyProgress) estado = 'progreso';
  const pct = totalHours ? Math.round((doneHours/totalHours)*100) : 0;
  return { doneCount, totalMods: mine.length, doneHours, totalHours, pct, estado };
}

function renderWorkersTable(){
  const estadoFilter = document.getElementById('filterEstado');
  const nameFilter = document.getElementById('filterNombre');
  const tbody = document.getElementById('adminWorkersTable');
  if(!estadoFilter || !nameFilter || !tbody) return;
  const estado = estadoFilter.value;
  const nameQ = nameFilter.value.toLowerCase();
  const names = roster.map(r => r.name).filter(n => workers[n]);

  const rows = names
    .map(name => ({ name, s: computeWorkerSummary(name) }))
    .filter(r => estado==='todos' || r.s.estado===estado)
    .filter(r => r.name.toLowerCase().includes(nameQ));

  if(rows.length===0){
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:20px;">Sin registros que coincidan.</td></tr>`;
    return;
  }
  const estadoColor = { completado:'var(--blue)', progreso:'var(--orange)', pendiente:'var(--muted)' };
  const estadoBg = { completado:'rgba(11,76,140,0.1)', progreso:'rgba(242,135,46,0.14)', pendiente:'var(--bg-alt)' };
  const estadoLabel = { completado:'Completado', progreso:'En progreso', pendiente:'Sin iniciar' };

  tbody.innerHTML = rows.map(({name,s}) => `
    <tr>
      <td><b>${escapeHTML(name)}</b></td>
      <td><div class="progress-mini"><div style="width:${s.pct}%"></div></div>${s.pct}%</td>
      <td>${s.doneCount}/${s.totalMods}</td>
      <td>${s.doneHours}/${s.totalHours} h</td>
      <td><span class="mini-badge" style="color:${estadoColor[s.estado]};background:${estadoBg[s.estado]};">${estadoLabel[s.estado]}</span></td>
      <td><button class="btn btn-ghost btn-sm" onclick="openWorkerProfileModal('${escapeAttribute(name)}')">👤 Ver</button></td>
    </tr>`).join('');
}

function exportCSV(){
  if(!session || session.role!=='admin'){ alert('Solo el administrador puede exportar información.'); return; }
  const rows = [['Trabajador','Puesto','Último acceso','Actividad','Avance %','Cursos completados','Horas hechas','Horas totales','Estado']];
  roster.forEach(r => {
    if(!workers[r.name]) return;
    const s = computeWorkerSummary(r.name);
    const activity = getWorkerActivity(r);
    rows.push([r.name, r.area, formatLastLogin(r), activity.text, s.pct, s.doneCount, s.doneHours, s.totalHours, s.estado]);
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'seguimiento_capacitacion_cicsa.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function getWorkerActivity(worker){
  if(worker.active===false){
    return { type:'desactivado', label:'Desactivado', text:'Cuenta desactivada', color:'var(--red)' };
  }
  if(!worker.lastLogin){
    return { type:'nunca', label:'Nunca ha ingresado', text:'Nunca ha ingresado', color:'var(--muted)' };
  }
  const last = new Date(worker.lastLogin);
  const diffMs = Math.max(0, Date.now() - last.getTime());
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffHours / 24);
  if(diffHours <= 48){
    let text = diffHours < 1 ? 'Hace menos de 1 hora' : (diffHours < 24 ? `Hace ${diffHours} hora(s)` : 'Hace 1 día');
    return { type:'reciente', label:'Activo recientemente', text, color:'var(--green)' };
  }
  const text = diffDays === 1 ? 'Hace 1 día' : `Hace ${diffDays} días`;
  return { type:'dias', label:'Sin actividad reciente', text, color:'var(--orange)' };
}

function formatLastLogin(worker){
  if(!worker.lastLogin) return 'Nunca';
  return new Date(worker.lastLogin).toLocaleString('es-MX', {
    day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'
  });
}

function renderAdminDashboard(){
  const total = roster.length;
  const recent = roster.filter(r=>getWorkerActivity(r).type==='reciente').length;
  const inactive = roster.filter(r=>getWorkerActivity(r).type==='dias').length;
  const disabled = roster.filter(r=>r.active===false).length;
  const el = id => document.getElementById(id);
  if(el('adminTotalWorkers')) el('adminTotalWorkers').textContent = total;
  if(el('adminActiveWorkers')) el('adminActiveWorkers').textContent = recent;
  if(el('adminInactiveWorkers')) el('adminInactiveWorkers').textContent = inactive;
  if(el('adminDisabledWorkers')) el('adminDisabledWorkers').textContent = disabled;
  renderActivityTable();
}

function renderActivityTable(){
  const tbody = document.getElementById('adminActivityTable');
  if(!tbody) return;
  const filter = document.getElementById('filterActividad')?.value || 'todos';
  const query = (document.getElementById('filterActividadNombre')?.value || '').trim().toLowerCase();
  const rows = roster.filter(r=>{
    const a = getWorkerActivity(r);
    if(filter!=='todos' && a.type!==filter) return false;
    if(query && !r.name.toLowerCase().includes(query) && !String(r.area||'').toLowerCase().includes(query)) return false;
    return true;
  });
  if(!rows.length){
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:20px;">No hay trabajadores que coincidan.</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(r=>{
    const a = getWorkerActivity(r);
    const safeName = escapeAttribute(r.name);
    const bg = a.type==='reciente' ? 'rgba(46,139,87,.1)' : a.type==='dias' ? 'rgba(242,135,46,.12)' : a.type==='desactivado' ? 'rgba(226,59,46,.1)' : 'var(--bg-alt)';
    return `<tr>
      <td><b>${escapeHTML(r.name)}</b></td>
      <td>${escapeHTML(r.area||'—')}</td>
      <td>${formatLastLogin(r)}</td>
      <td>${escapeHTML(a.text)}</td>
      <td><span class="mini-badge" style="color:${a.color};background:${bg};">${a.label}</span></td>
      <td><button class="btn btn-ghost btn-sm" onclick="openWorkerProfileModal('${safeName}')">👤 Ver avance</button></td>
    </tr>`;
  }).join('');
}

function renderQuizAdminTable(){
  const tbody = document.getElementById('adminQuizTable');
  if(!tbody) return;
  if(!courses.length){
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:20px;">No hay cursos registrados.</td></tr>`;
    return;
  }
  tbody.innerHTML = courses.map((course,i)=>{
    const count = Array.isArray(course.quiz) ? course.quiz.length : 0;
    const label = count ? '📝 Editar examen' : '➕ Anexar examen';
    return `<tr>
      <td><b>${escapeHTML(course.title)}</b></td>
      <td>${count}</td>
      <td>${APPROVAL_THRESHOLD}%</td>
      <td><button class="btn btn-blue btn-sm" onclick="openQuizEditor(${i})">${label}</button></td>
    </tr>`;
  }).join('');
}

function openQuizEditor(courseIndex){
  if(!session || session.role!=='admin'){ alert('Solo el administrador puede editar exámenes.'); return; }
  editingQuizCourseIndex = courseIndex;
  editingQuiz = JSON.parse(JSON.stringify(courses[courseIndex].quiz || []));
  renderQuizEditor();
  document.getElementById('quizEditorOverlay').classList.remove('hidden');
}

function closeQuizEditor(){
  document.getElementById('quizEditorOverlay').classList.add('hidden');
  editingQuizCourseIndex = null;
  editingQuiz = null;
}

function renderQuizEditor(){
  const card = document.getElementById('quizEditorCard');
  if(!card || editingQuizCourseIndex===null) return;
  const course = courses[editingQuizCourseIndex];
  let html = `<h3>${editingQuiz.length ? 'Editar examen' : 'Anexar examen'}: ${escapeHTML(course.title)}</h3>
    <div class="modal-sub">Agrega preguntas, modifica respuestas y marca con ● la respuesta correcta.</div>`;
  if(!editingQuiz.length){
    html += `<div class="empty-editor"><b>Este curso todavía no tiene examen.</b><span>Agrega la primera pregunta para anexarlo.</span></div>`;
  }
  editingQuiz.forEach((q,qi)=>{
    const options = Array.isArray(q.options) ? q.options : [];
    html += `<div class="quiz-editor-question">
      <div class="editor-question-header"><strong>Pregunta ${qi+1}</strong><button class="icon-btn" title="Eliminar pregunta" onclick="removeQuizQuestion(${qi})">🗑</button></div>
      <div class="field"><label>Pregunta</label><input type="text" value="${escapeAttribute(q.q||'')}" oninput="updateQuizQuestion(${qi},this.value)" placeholder="Escribe la pregunta"></div>
      <label class="editor-label">Respuestas</label>`;
    options.forEach((opt,oi)=>{
      html += `<div class="quiz-answer-row">
        <input class="correct-radio" type="radio" name="correctAnswer${qi}" ${q.correct===oi?'checked':''} onchange="setQuizCorrectAnswer(${qi},${oi})" title="Marcar como correcta">
        <input type="text" value="${escapeAttribute(opt)}" oninput="updateQuizOption(${qi},${oi},this.value)" placeholder="Respuesta ${oi+1}">
        <button class="icon-btn" onclick="removeQuizOption(${qi},${oi})" title="Eliminar respuesta">✕</button>
      </div>`;
    });
    html += `<button class="btn btn-ghost btn-sm" onclick="addQuizOption(${qi})">+ Agregar respuesta</button></div>`;
  });
  html += `<button class="btn btn-ghost btn-sm" style="margin-bottom:14px;" onclick="addQuizQuestion()">+ Agregar pregunta</button>
    <div class="modal-actions"><button class="btn btn-ghost btn-sm" onclick="closeQuizEditor()">Cancelar</button><button class="btn btn-primary btn-sm" onclick="saveQuizEditor()">Guardar examen</button></div>`;
  card.innerHTML = html;
}

function updateQuizQuestion(index,value){ editingQuiz[index].q=value; }
function updateQuizOption(qi,oi,value){ editingQuiz[qi].options[oi]=value; }
function setQuizCorrectAnswer(qi,oi){ editingQuiz[qi].correct=oi; }
function addQuizOption(qi){ editingQuiz[qi].options.push(`Nueva respuesta ${editingQuiz[qi].options.length+1}`); renderQuizEditor(); }
function removeQuizOption(qi,oi){
  const q=editingQuiz[qi];
  if(q.options.length<=2){ alert('Cada pregunta debe tener al menos 2 respuestas.'); return; }
  q.options.splice(oi,1);
  if(q.correct===oi) q.correct=0;
  else if(q.correct>oi) q.correct--;
  renderQuizEditor();
}
function addQuizQuestion(){
  editingQuiz.push({q:'Nueva pregunta',options:['Respuesta A','Respuesta B','Respuesta C'],correct:0});
  renderQuizEditor();
}
function removeQuizQuestion(qi){
  if(!confirm('¿Eliminar esta pregunta del examen?')) return;
  editingQuiz.splice(qi,1);
  renderQuizEditor();
}
function saveQuizEditor(){
  if(!session || session.role!=='admin'){ alert('Solo el administrador puede guardar cambios.'); return; }
  if(!editingQuiz.length){ alert('El examen debe tener al menos una pregunta.'); return; }
  for(let i=0;i<editingQuiz.length;i++){
    const q=editingQuiz[i];
    if(!String(q.q||'').trim()){ alert(`La pregunta ${i+1} no tiene texto.`); return; }
    if(!Array.isArray(q.options) || q.options.length<2){ alert(`La pregunta ${i+1} necesita al menos 2 respuestas.`); return; }
    if(q.options.some(o=>!String(o||'').trim())){ alert(`Completa todas las respuestas de la pregunta ${i+1}.`); return; }
    if(typeof q.correct!=='number' || q.correct<0 || q.correct>=q.options.length){ alert(`Selecciona una respuesta correcta para la pregunta ${i+1}.`); return; }
  }
  courses[editingQuizCourseIndex].quiz=JSON.parse(JSON.stringify(editingQuiz));
  saveCourses(courses);
  closeQuizEditor();
  renderAdmin();
  alert('Examen actualizado correctamente.');
}

function renderAdmin(){
  renderAdminDashboard();
  renderRosterTable();
  renderResetRequests();
  renderAdminModulesTable();
  renderAdminCoursePreview();
  renderWorkersTable();
  renderQuizAdminTable();
}

/* =========================================================
   RENDER GENERAL
========================================================= */
function renderAll(){
  if(!session) return;
  renderModules();
  renderSummary();
  if(session.role==='admin') renderAdmin();
}
