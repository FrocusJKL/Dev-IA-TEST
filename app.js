// Clave con la que guardamos las sesiones en localStorage.
const CLAVE = "diarioDeEstudio.sesiones";

// Elementos de la página.
const formulario = document.getElementById("formulario");
const campoFecha = document.getElementById("fecha");
const campoTema = document.getElementById("tema");
const campoMinutos = document.getElementById("minutos");
const listaSesiones = document.getElementById("lista-sesiones");
const sinSesiones = document.getElementById("sin-sesiones");
const rachaNumero = document.getElementById("racha-numero");
const rachaTexto = document.getElementById("racha-texto");
const mejorRachaNumero = document.getElementById("mejor-racha-numero");
const minutosSemana = document.getElementById("minutos-semana");

// ---------------------------------------------------------------------------
// Fechas (siempre en la hora local del usuario, nunca en UTC)
// ---------------------------------------------------------------------------

// Devuelve una fecha como "AAAA-MM-DD" usando el año, mes y día locales.
function fechaLocalISO(fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

// Convierte "AAAA-MM-DD" en un Date local. Usamos las 12:00 para que los
// cambios de hora (verano/invierno) no muevan la fecha al día anterior.
function textoAFecha(texto) {
  const [anio, mes, dia] = texto.split("-").map(Number);
  return new Date(anio, mes - 1, dia, 12);
}

// Devuelve el día anterior a una fecha "AAAA-MM-DD".
function diaAnterior(texto) {
  const fecha = textoAFecha(texto);
  fecha.setDate(fecha.getDate() - 1);
  return fechaLocalISO(fecha);
}

// Muestra una fecha "AAAA-MM-DD" en formato español, por ejemplo: "lun, 20 oct 2026".
function formatearFecha(texto) {
  return textoAFecha(texto).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Guardado y lectura en localStorage
// ---------------------------------------------------------------------------

function cargarSesiones() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE));
    if (!Array.isArray(datos)) return [];

    // Nos quedamos solo con sesiones que tengan los datos necesarios.
    return datos.filter(
      (sesion) =>
        sesion &&
        typeof sesion.fecha === "string" &&
        typeof sesion.tema === "string" &&
        typeof sesion.minutos === "number"
    );
  } catch (error) {
    console.warn("No se pudieron leer las sesiones guardadas.", error);
    return [];
  }
}

function guardarSesiones() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(sesiones));
  } catch (error) {
    console.warn("No se pudieron guardar las sesiones.", error);
  }
}

// ---------------------------------------------------------------------------
// Racha
// ---------------------------------------------------------------------------

// Cuenta los días consecutivos con al menos una sesión, terminando en hoy.
// Si hoy aún no hay sesión pero ayer sí, la racha sigue viva.
function calcularRacha() {
  const diasConSesion = new Set(sesiones.map((sesion) => sesion.fecha));
  const hoy = fechaLocalISO();

  let dia = hoy;

  if (!diasConSesion.has(hoy)) {
    const ayer = diaAnterior(hoy);
    if (!diasConSesion.has(ayer)) return 0;
    dia = ayer;
  }

  let racha = 0;
  while (diasConSesion.has(dia)) {
    racha++;
    dia = diaAnterior(dia);
  }

  return racha;
}

// Mayor racha del historial: la mayor cantidad de días consecutivos con sesión,
// contando solo hoy y días anteriores. Una racha ya rota también cuenta.
function calcularMejorRacha() {
  const hoy = fechaLocalISO();

  // Días únicos con sesión, sin fechas futuras. Ordenados así van de más
  // antiguo a más reciente. Varias sesiones el mismo día cuentan como un día.
  const diasOrdenados = [...new Set(sesiones.map((sesion) => sesion.fecha))]
    .filter((fecha) => fecha <= hoy)
    .sort();

  let mejor = 0;
  let corrida = 0;
  let diaAnteriorDelRecorrido = null;

  for (const dia of diasOrdenados) {
    // El día sigue la racha solo si es el inmediatamente posterior al anterior.
    corrida = diaAnteriorDelRecorrido === diaAnterior(dia) ? corrida + 1 : 1;
    if (corrida > mejor) mejor = corrida;
    diaAnteriorDelRecorrido = dia;
  }

  return mejor;
}

// ---------------------------------------------------------------------------
// Minutos de la semana
// ---------------------------------------------------------------------------

// Primer día de la semana (lunes) como "AAAA-MM-DD", en hora local.
function inicioDeSemana() {
  const fecha = new Date();
  const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay(); // domingo = 7
  fecha.setDate(fecha.getDate() - (diaSemana - 1));
  return fechaLocalISO(fecha);
}

// Suma los minutos estudiados de la semana en curso (del lunes a hoy),
// sin contar sesiones de fechas futuras. Varias sesiones el mismo día suman todas.
function calcularMinutosSemana() {
  const inicio = inicioDeSemana();
  const hoy = fechaLocalISO();
  let total = 0;
  for (const sesion of sesiones) {
    if (sesion.fecha >= inicio && sesion.fecha <= hoy) total += sesion.minutos;
  }
  return total;
}

// "45 min" si es menos de una hora, si no "3 h 45 min" (o "3 h" si es exacto).
function formatearMinutos(minutos) {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const restantes = minutos % 60;
  return restantes === 0 ? `${horas} h` : `${horas} h ${restantes} min`;
}

// ---------------------------------------------------------------------------
// Mostrar datos en la página
// ---------------------------------------------------------------------------

// De la más reciente a la más antigua. Si dos sesiones son del mismo día,
// aparece primero la que se registró más tarde.
function ordenarSesiones() {
  return [...sesiones].sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
    return String(b.creadoEn || "").localeCompare(String(a.creadoEn || ""));
  });
}

function mostrarRacha() {
  const racha = calcularRacha();
  rachaNumero.textContent = racha;
  mejorRachaNumero.textContent = calcularMejorRacha();
  minutosSemana.textContent = formatearMinutos(calcularMinutosSemana());
  rachaTexto.textContent = racha === 1 ? "día seguido" : "días seguidos";
}

function mostrarSesiones() {
  listaSesiones.innerHTML = "";

  const ordenadas = ordenarSesiones();
  sinSesiones.classList.toggle("oculto", ordenadas.length > 0);

  for (const sesion of ordenadas) {
    const elemento = document.createElement("li");
    elemento.className = "sesion";

    const info = document.createElement("div");

    const tema = document.createElement("p");
    tema.className = "sesion-tema";
    tema.textContent = sesion.tema;

    const fecha = document.createElement("p");
    fecha.className = "sesion-fecha";
    fecha.textContent = formatearFecha(sesion.fecha);

    const minutos = document.createElement("span");
    minutos.className = "sesion-minutos";
    minutos.textContent = `${sesion.minutos} min`;

    info.append(tema, fecha);
    elemento.append(info, minutos);
    listaSesiones.append(elemento);
  }
}

// ---------------------------------------------------------------------------
// Estado y eventos
// ---------------------------------------------------------------------------

let sesiones = cargarSesiones();

// La fecha del formulario empieza en hoy, pero se puede cambiar.
campoFecha.value = fechaLocalISO();

mostrarRacha();
mostrarSesiones();

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const fecha = campoFecha.value;
  const tema = campoTema.value.trim();
  const minutos = Number(campoMinutos.value);

  // El navegador ya valida los campos obligatorios, pero lo comprobamos también.
  if (!fecha || !tema || !Number.isFinite(minutos) || minutos <= 0) {
    formulario.reportValidity();
    return;
  }

  sesiones.push({
    id: Date.now(),
    fecha,
    tema,
    minutos,
    creadoEn: new Date().toISOString(),
  });

  guardarSesiones();
  mostrarRacha();
  mostrarSesiones();

  formulario.reset();
  campoFecha.value = fechaLocalISO();
  campoTema.focus();
});
