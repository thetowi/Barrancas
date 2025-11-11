import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";


document.addEventListener('DOMContentLoaded', () => {
  
  // ======== ELEMENTOS PRINCIPALES ========
  const menu = document.getElementById('menu-principal');
  const tablaSection = document.getElementById('tabla-reservas');
  const btnView = document.getElementById('btnView');
  const btnBack = document.getElementById('btnBack');
  const fechaSeleccion = document.getElementById('fechaSeleccion');
  const diaTexto = document.getElementById('diaTexto');
  const btnGenerar = document.getElementById('btnGenerar');
  const horaInicio = document.getElementById('horaInicio');
  const horaFin = document.getElementById('horaFin');
  const tabla = document.getElementById('tabla');
  //LOGIN PRINCIPAL
  const loginContainer = document.getElementById('login-container');
  const loginBtn = document.getElementById('loginBtn');
  const loginUser = document.getElementById('loginUser');
  const loginPass = document.getElementById('loginPass');
  const rememberMe = document.getElementById('rememberMe');
  const loginError = document.getElementById('loginError');
  const USER = "barrancas";
  const PASS = "2025";
  function verificarSesion() {
    if (localStorage.getItem("sesionActiva") === "true") {
      loginContainer.style.display = "none";
    } else {
      loginContainer.style.display = "flex";
    }
  }

  loginBtn.addEventListener("click", () => {
    if (loginUser.value === USER && loginPass.value === PASS) {
      loginContainer.style.display = "none";
      if (rememberMe.checked) localStorage.setItem("sesionActiva", "true");
    } else {
      loginError.style.display = "block";
    }
  });

  // Permite salir (por si querés agregar botón de cerrar sesión)
  window.cerrarSesion = function() {
    localStorage.removeItem("sesionActiva");
    loginContainer.style.display = "flex";
  };

  // Verifica al cargar
  verificarSesion();
  // ======== ELEMENTOS NUEVA RESERVA ========
  const btnNew = document.getElementById('btnNew');
  const formSection = document.getElementById('nueva-reserva');
  const btnBackForm = document.getElementById('btnBackForm');
  const formReserva = document.getElementById('formReserva');

  // ======== CONFIG ========
  const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  let reservas = []; // base de datos temporal
  // ======== SELECTOR DE TURNO (almuerzo/cena) ========
  let turnoActual = 'cena'; // por defecto

  const btnAlmuerzo = document.getElementById('btnAlmuerzo');
  const btnCena = document.getElementById('btnCena');
  const turnoSelect = document.getElementById('resTurno');
  // === BOTONES DE TURNO ===
  const turnoBtns = document.querySelectorAll('.turno-btn');
  const resTurno = document.getElementById('resTurno');
  const selectorHora = document.getElementById('selectorHora');
  const resHora = document.getElementById('resHora');

  const horarios = {
    almuerzo: ["12:30","12:45","13:00","13:15","13:30","13:45","14:00"],
    merienda: ["17:00","17:15","17:30","17:45","18:00","18:15","18:30"],
    cena: ["20:30","20:45","21:00","21:15","21:30","21:45","22:00"]
  };

  turnoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // marcar turno activo
      turnoBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const turno = btn.dataset.turno;
      resTurno.value = turno;

      // generar horarios
      selectorHora.innerHTML = '';
      resHora.value = '';

      horarios[turno].forEach(hora => {
        const b = document.createElement('button');
        b.textContent = hora;
        b.type = 'button';
        b.className = 'hora-btn';
        b.addEventListener('click', () => {
          document.querySelectorAll('.hora-btn').forEach(x => x.classList.remove('active'));
          b.classList.add('active');
          resHora.value = hora;
        });
        selectorHora.appendChild(b);
      });

      selectorHora.style.display = 'flex';
    });
    window.addEventListener('load', () => {
      const btnAlmuerzo = document.querySelector('.turno-btn[data-turno="almuerzo"]');
      if (btnAlmuerzo) {
        btnAlmuerzo.click(); // simula el clic para generar los horarios
      }
    });
  });


  const firebaseConfig = {
    apiKey: "AIzaSyBQflJmUVriD7KlWWehRXMsfh67OO6z8Og",
    authDomain: "reservas-barrancas.firebaseapp.com",
    databaseURL: "https://reservas-barrancas-default-rtdb.firebaseio.com",
    projectId: "reservas-barrancas",
    storageBucket: "reservas-barrancas.firebasestorage.app",
    messagingSenderId: "726809821801",
    appId: "1:726809821801:web:cb0d3bdb0838f7f4b558f8",
    measurementId: "G-RSPBGQ3MLB"
  };


  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  console.log("✅ Firebase Realtime Database conectado correctamente");
  // 🔁 Refresca la tabla visualmente (colores, ocupaciones, totales)
  function refrescarTablaVisual() {
    const filas = tabla.querySelectorAll('tbody tr');

    filas.forEach(fila => {
      const datos = {
        mesa: fila.children[1].querySelector("input").value,
        pax: fila.children[2].querySelector("input").value,
        nombre: fila.children[3].querySelector("input").value,
        tel: fila.children[4].querySelector("input").value,
        comentario: fila.children[5].querySelector("input").value,
        asistio: fila.children[6].querySelector("input").checked,
        pidioMesa: fila.children[7].querySelector("input").checked,
        ocupar: fila.children[9].querySelector("input").checked,
        responsable: fila.children[10].querySelector("select").value
      };
      aplicarEstadoVisualFila(fila, datos); // ← ← ← ESTA LÍNEA
    });

    actualizarTotalPax();
    actualizarTotalPaxAsistidos();
    function mostrarMiniAlertaLocal(input, texto) {
      // Si ya existe una alerta debajo, la quitamos
      const alertaExistente = input.parentElement.querySelector('.mini-alert-local');
      if (alertaExistente) alertaExistente.remove();

      // Crear nueva alerta
      const alerta = document.createElement('div');
      alerta.className = 'mini-alert-local';
      alerta.textContent = texto;
      input.parentElement.appendChild(alerta);

      // Ocultar automáticamente
      setTimeout(() => {
        alerta.classList.add('ocultar');
        setTimeout(() => alerta.remove(), 300); // luego del fade-out
      }, 2500);
    }

    // 🔹 Pintar mesas ocupadas
    // === Pintar y detectar mesas ocupadas ===
    const mesasAsignadas = tabla.querySelectorAll('td:nth-child(2) input');
    const mesasDisponiblesCeldas = tabla.querySelectorAll('td:nth-child(9)');

      mesasAsignadas.forEach(input => {
        input.addEventListener('input', () => {
          const valorMesa = input.value.trim();

          // si está vacío, no hacemos nada
          if (!valorMesa) return;

          // buscar si ya hay otra fila con esa mesa
          const repetidas = Array.from(mesasAsignadas).filter(
            i => i !== input && i.value.trim() === valorMesa
          );

          if (repetidas.length > 0) {
            mostrarMiniAlertaLocal(input, "⛔ Mesa ocupada");
            input.value = ""; // limpia el valor
            return;
          }

          // repintar mesas en rojo (manteniendo comportamiento actual)
          mesasDisponiblesCeldas.forEach(celda => {
            celda.classList.toggle(
              'mesa-ocupada',
              Array.from(mesasAsignadas).some(i => i.value.trim() === celda.textContent.trim())
            );
          });
        });
      });


    const mesasDisponibles = tabla.querySelectorAll('td:nth-child(9)');
    mesasDisponibles.forEach(celda => celda.classList.remove('mesa-ocupada'));
    mesasAsignadas.forEach(input => {
      const valorMesa = input.value.trim();
      mesasDisponibles.forEach(celda => {
        const numeroMesa = celda.textContent.trim();
        if (valorMesa === numeroMesa) {
          celda.classList.add('mesa-ocupada');
        }
      });
    });

    console.log("🔁 Tabla refrescada visualmente");
  }
  if (btnAlmuerzo && btnCena) {
    btnAlmuerzo.addEventListener('click', () => {
      turnoActual = 'almuerzo';
      btnAlmuerzo.classList.add('active');
      btnCena.classList.remove('active');
      renderTabla();
    });

    btnCena.addEventListener('click', () => {
      turnoActual = 'cena';
      btnCena.classList.add('active');
      btnAlmuerzo.classList.remove('active');
      renderTabla();
    });
  }
  // ======== FUNCIONES AUXILIARES ========
  function nombreDia(fecha) {
    const partes = fecha.split('-');
    const d = new Date(partes[0], partes[1] - 1, partes[2]);
    return dias[d.getDay()] || '—';
  }

  function generarHorarios(desde, hasta) {
    const toMins = s => {
      const [h, m] = s.split(':').map(Number);
      return h * 60 + m;
    };
    const toHHMM = mins => {
      const h = String(Math.floor(mins / 60)).padStart(2, '0');
      const m = String(mins % 60).padStart(2, '0');
      return `${h}:${m}`;
    };
    const start = toMins(desde);
    const end = toMins(hasta);
    const slots = [];
    for (let t = start; t <= end; t += 15) slots.push(toHHMM(t));
    return slots;
  }
  // ======== MOSTRAR TABLA ========
  btnView.addEventListener('click', () => {
    menu.style.display = 'none';
    tablaSection.style.display = 'block';
    document.body.classList.add('mode-table');

    const hoyLocal = new Date();
    const yyyy = hoyLocal.getFullYear();
    const mm = String(hoyLocal.getMonth() + 1).padStart(2, '0');
    const dd = String(hoyLocal.getDate()).padStart(2, '0');
    const hoy = `${yyyy}-${mm}-${dd}`;

    fechaSeleccion.value = hoy;
    diaTexto.textContent = nombreDia(hoy);

    renderTabla();
    
    cargarReservas(fechaSeleccion.value, turnoActual).then(() => {
      refrescarTablaVisual();
    });
    window.scrollTo({ top: 0 });
  });

  // ======== VOLVER DESDE TABLA ========
  btnBack.addEventListener('click', () => {
    tablaSection.style.display = 'none';
    menu.style.display = 'block';
    document.body.classList.remove('mode-table');
  });

  // ======== CAMBIO DE FECHA ========
  fechaSeleccion.addEventListener('change', () => {
    const fecha = fechaSeleccion.value;
    diaTexto.textContent = nombreDia(fecha);
    renderTabla(); // 🔹 vuelve a armar la tabla vacía
    cargarReservas(fecha, turnoActual).then(() => refrescarTablaVisual());
  });


  // ======== BOTÓN GENERAR ========
  if (btnGenerar) {
    btnGenerar.addEventListener('click', renderTabla);
  }
    // 💾 Guardar reservas en Realtime Database
  async function guardarReservas(fecha, turno) {
  const filas = tabla.querySelectorAll("tbody tr");
  const reservasData = [];
    try {
      filas.forEach(fila => {
        reservasData.push({
          hora: fila.children[0].textContent,
          mesa: fila.children[1].querySelector("input").value,
          pax: fila.children[2].querySelector("input").value,
          nombre: fila.children[3].querySelector("input").value,
          tel: fila.children[4].querySelector("input").value,
          comentario: fila.children[5].querySelector("input").value,
          asistio: fila.children[6].querySelector("input").checked,
          pidioMesa: fila.children[7].querySelector("input").checked,
          ocupar: fila.children[9].querySelector("input").checked,
          responsable: fila.children[10].querySelector("select").value
        });
      });
      

      await set(ref(db, `reservas/${fecha}/${turno}`), reservasData);
      console.log(`💾 Guardadas reservas para ${fecha} (${turno})`);
      return true; // 🔹 devuelve éxito
    } catch (error) {
      console.error("❌ Error al guardar reservas:", error);
      throw error; // 🔴 lanza error real
    }
  }

  // 📦 Cargar reservas desde Realtime Database
  async function cargarReservas(fecha, turno) {
    const snapshot = await get(child(ref(db), `reservas/${fecha}/${turno}`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const filas = tabla.querySelectorAll("tbody tr");
      data.forEach((r, i) => {
        const f = filas[i];
        if (!f) return;
        f.children[1].querySelector("input").value = r.mesa || "";
        f.children[2].querySelector("input").value = r.pax || "";
        f.children[3].querySelector("input").value = r.nombre || "";
        f.children[4].querySelector("input").value = r.tel || "";
        f.children[5].querySelector("input").value = r.comentario || "";
        f.children[6].querySelector("input").checked = r.asistio || false;
        f.children[7].querySelector("input").checked = r.pidioMesa || false;
        f.children[9].querySelector("input").checked = r.ocupar || false;
        f.children[10].querySelector("select").value = r.responsable || "";
        aplicarEstadoVisualFila(f, r);
      });
      console.log(`📦 Reservas cargadas para ${fecha} (${turno})`);
      actualizarTotalPax();
      actualizarTotalPaxAsistidos();
    } else {
      console.log(`ℹ️ No hay reservas para ${fecha} (${turno})`);
    }
  }

  set(ref(db, "test/conexion"), { ok: true, timestamp: Date.now() })
  .then(() => console.log("✅ Test de escritura OK"))
  .catch(err => console.error("❌ Error en escritura:", err)); 
  function aplicarEstadoVisualFila(fila, r) {
    // asistió → pinta fila + inputs verdes
    fila.classList.toggle('fila-asistio', !!r.asistio);

    // pidio mesa → bloquea input y tooltip
    const inputMesa = fila.querySelector('.mesaInput');
    if (r.pidioMesa) {
      inputMesa.disabled = true;
      inputMesa.classList.add('mesa-bloqueada');
      inputMesa.parentElement.classList.add('mesa-bloqueada-wrap');
    } else {
      inputMesa.disabled = false;
      inputMesa.classList.remove('mesa-bloqueada');
      inputMesa.parentElement.classList.remove('mesa-bloqueada-wrap');
    }

    // ocupar → muestra "Ocupada" en Mesas disponibles
    const celdaMesaDisp = fila.querySelector('td:nth-child(9)');
    if (r.ocupar) {
      celdaMesaDisp.classList.add('mesa-ocupada-visual');
      celdaMesaDisp.setAttribute('data-estado', 'Ocupada');
    } else {
      celdaMesaDisp.classList.remove('mesa-ocupada-visual');
      celdaMesaDisp.removeAttribute('data-estado');
    }

    // coherencia: si la mesa asignada coincide con el número disponible → mesa-ocupada (rojo + tachado)
    const numeroMesa = celdaMesaDisp?.textContent.trim() || '';
    const valorMesa = (inputMesa.value || '').trim();
    if (valorMesa && numeroMesa && valorMesa === numeroMesa) {
      celdaMesaDisp.classList.add('mesa-ocupada');
    } else {
      celdaMesaDisp.classList.remove('mesa-ocupada');
    }
  }
 
  // ======== FUNCIÓN PRINCIPAL: RENDER TABLA ========

  function renderTabla() {
    let asignacion = [];
    
    if (turnoActual === 'almuerzo') {
      asignacion = [
        {hora:"12:30", mesa:11}, {hora:"12:30", mesa:12}, {hora:"12:30", mesa:13}, {hora:"12:30", mesa:14},
        {hora:"12:45", mesa:21}, {hora:"12:45", mesa:22}, {hora:"12:45", mesa:23}, {hora:"12:45", mesa:24},
        {hora:"13:00", mesa:31}, {hora:"13:00", mesa:32}, {hora:"13:00", mesa:33}, {hora:"13:00", mesa:40},
        {hora:"13:15", mesa:41}, {hora:"13:15", mesa:42}, {hora:"13:15", mesa:43}, {hora:"13:15", mesa:44},
        {hora:"13:30", mesa:45}, {hora:"13:30", mesa:46}, {hora:"13:30", mesa:47},
        {hora:"13:45", mesa:50}, {hora:"13:45", mesa:51}, {hora:"13:45", mesa:52},
        {hora:"14:00", mesa:53}, {hora:"14:00", mesa:54}, {hora:"14:00", mesa:55}, {hora:"14:00", mesa:60}
      ];
    } else {
      asignacion = [
        {hora:"20:30", mesa:11}, {hora:"20:30", mesa:12}, {hora:"20:30", mesa:13}, {hora:"20:30", mesa:14},
        {hora:"20:45", mesa:21}, {hora:"20:45", mesa:22}, {hora:"20:45", mesa:23},
        {hora:"21:00", mesa:24}, {hora:"21:00", mesa:31}, {hora:"21:00", mesa:32}, {hora:"21:00", mesa:33},
        {hora:"21:15", mesa:40}, {hora:"21:15", mesa:41}, {hora:"21:15", mesa:42},
        {hora:"21:30", mesa:43}, {hora:"21:30", mesa:44}, {hora:"21:30", mesa:45}, {hora:"21:30", mesa:46},
        {hora:"21:45", mesa:47}, {hora:"21:45", mesa:50}, {hora:"21:45", mesa:51}, {hora:"21:45", mesa:52},
        {hora:"22:00", mesa:53}, {hora:"22:00", mesa:54}, {hora:"22:00", mesa:55}, {hora:"22:00", mesa:60}
      ];
    }
    
    const listaMesasDisponibles = [11,12,13,14,21,22,23,24,31,32,33,40,41,42,43,44,45,46,47,50,51,52,53,54,55,60];
    const paxPorMesa = {
      11: 4, 12: 4, 13: 4, 14: 6,
      21: 2, 22: 2, 23: 2, 24: 2,
      31: 4, 32: 4, 33: 4,
      40: 4, 41: 4, 42: 4,
      43: 2, 44: 2, 45: 6, 46: 2,
      47: 2, 50: 4, 51: 4, 52: 4,
      53: 2, 54: 2, 55: 2, 60: 4
    };

    let html = `
      <thead>
        <tr>
          <th>HORA</th>
          <th>MESA</th>
          <th>PAX</th>
          <th>APELLIDO/NOMBRE</th>
          <th>HAB/TEL</th>
          <th>COMENTARIOS</th>
          <th>ASISTIÓ</th>
          <th>PIDIO MESA</th>
          <th>MESAS DISPONIBLES</th>
          <th>OCUPAR</th>
          <th>RESPONSABLE</th>
        </tr>
      </thead>
      <tbody>
    `;

    asignacion.forEach((r, idx) => {
      html += `
        <tr>
          <td>${r.hora}</td>
          <td><input type="number" min="1" max="60" class="mesaInput"  style="width:60px"></td>
          <td><input type="number" min="0" class="paxInput" style="width:60px"></td>
          <td><input type="text" class="nombre"></td>
          <td><input type="text" class="tel"></td>
          <td><input type="text" class="comentario"></td>
          <td><input type="checkbox" class="chk-asistio"></td>
          <td><input type="checkbox" class="chk-pidio"></td>
          <td title="Capacidad: ${paxPorMesa[listaMesasDisponibles[idx]] || '-'} pax">${listaMesasDisponibles[idx]}</td>
          <td><input type="checkbox" class="chk-ocupar"></td>
          <td>
            <select>
              <option></option>
              <option>Tobías</option>
              <option>Veronica</option>
              <option>Majo</option>
              <option>Rodrigo</option>
              <option>Emanuel</option>
              <option>Mariana</option>
              <option>Caty</option>
              <option>Jose maria</option>
              <option>Matias</option>
              <option>Raquel</option>
            </select>
          </td>
        </tr>
      `;
    });

    html += `
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2">Total pax</td>
          <td id="totalPax">0</td>
          <td colspan="3" style="font-weight: bold; text-align: right;">Total pax asistidos:</td>
          <td id="totalPaxAsistidos" style="font-weight: bold;">0</td>
          <td colspan="4"></td>
        </tr>
      </tfoot>
    `;
    
    tabla.innerHTML = html;

    tabla.addEventListener('input', (e) => {
        if (e.target.classList.contains('paxInput')) {
          actualizarTotalPax();
          actualizarTotalPaxAsistidos();
        }
      });

    tabla.querySelectorAll('.chk-asistio').forEach(chk => {
      chk.addEventListener('change', () => {
        const fila = chk.closest('tr');
        fila.classList.toggle('fila-asistio', chk.checked);
        actualizarTotalPaxAsistidos();
        });
      });
    const btnGuardar = document.getElementById('btnGuardar');
    
    if (btnGuardar) {
      btnGuardar.addEventListener('click', async () => {
        const fecha = fechaSeleccion.value;
        const turno = turnoActual;
        const filas = tabla.querySelectorAll("tbody tr");

        // armamos el array para comparar si hay algo
        const reservasData = [];
        filas.forEach(fila => {
          reservasData.push({
            hora: fila.children[0].textContent,
            mesa: fila.children[1].querySelector("input").value,
             pax: fila.children[2].querySelector("input").value,
            nombre: fila.children[3].querySelector("input").value,
            tel: fila.children[4].querySelector("input").value,
            comentario: fila.children[5].querySelector("input").value,
            asistio: fila.children[6].querySelector("input").checked,
            pidioMesa: fila.children[7].querySelector("input").checked,
            ocupar: fila.children[9].querySelector("input").checked,
            responsable: fila.children[10].querySelector("select").value
          });
        });

      // si no hay nada cargado
      const hayAlgo = reservasData.some(r =>
        r.mesa || r.pax || r.nombre || r.tel || r.comentario || r.asistio || r.pidioMesa || r.ocupar || r.responsable
      );
      if (hayAlgo) {
      await guardarReservas(fecha, turno);
        console.log(`💾 Reservas guardadas para ${fecha} (${turno})`);
      } else {
        console.log("⚠️ No hay datos para guardar");
      }
    
    });

  }
  refrescarTablaVisual();    


    
    // === MARCAR MESA COMO OCUPADA ===
    tabla.querySelectorAll('.chk-ocupar').forEach(chk => {
    chk.addEventListener('change', () => {
      const fila = chk.closest('tr');
      const celdaMesaDisp = fila.querySelector('td:nth-child(9)'); // columna "Mesas disponibles"

      if (chk.checked) {
        celdaMesaDisp.classList.add('mesa-ocupada-visual');
        celdaMesaDisp.setAttribute('data-estado', 'Ocupada');
      } else {
        celdaMesaDisp.classList.remove('mesa-ocupada-visual');
        celdaMesaDisp.removeAttribute('data-estado');
      }
    });
  }); 

  // === Bloquear mesa si el checkbox "pidio mesa" esta marcado ===
  tabla.querySelectorAll('.chk-pidio').forEach(chk => {
    chk.addEventListener('change', () => {
      const fila = chk.closest('tr');
      const inputMesa = fila.querySelector('td:nth-child(2) input');

      if (chk.checked) {
        inputMesa.disabled = true;
        inputMesa.classList.add('mesa-bloqueada');
        inputMesa.parentElement.classList.add('mesa-bloqueada-wrap'); // 🔹 contenedor para tooltip
      } else {
        inputMesa.disabled = false;
        inputMesa.classList.remove('mesa-bloqueada');
        inputMesa.parentElement.classList.remove('mesa-bloqueada-wrap');
      }
    });
  });

  // === Marcar fila en verde solo si se marca "ASISTIÓ" ===
  tabla.querySelectorAll('.chk-asistio').forEach(chk => {
    chk.addEventListener('change', () => {
      const fila = chk.closest('tr');
      if (chk.checked) fila.classList.add('fila-asistio');
      else fila.classList.remove('fila-asistio');
    });
  });

    tabla.addEventListener('input', (e) => {
      // Cualquier cambio relevante refresca la UI y (si querés) guarda
      if (e.target.matches('.mesaInput, .paxInput, .chk-asistio, .chk-pidio, .chk-ocupar, select')) {
        refrescarTablaVisual();
        // opcional: guardarDebounced();  // si querés autoguardado suave
      }
    });


    if (btnAlmuerzo && btnCena) {
      btnAlmuerzo.addEventListener('click', () => {
        turnoActual = 'almuerzo';
        btnAlmuerzo.classList.add('active');
        btnCena.classList.remove('active');
        renderTabla();
        cargarReservas(fechaSeleccion.value, turnoActual).then(() => refrescarTablaVisual());
      });

      btnCena.addEventListener('click', () => {
        turnoActual = 'cena';
        btnCena.classList.add('active');
        btnAlmuerzo.classList.remove('active');
        renderTabla();
        cargarReservas(fechaSeleccion.value, turnoActual).then(() => refrescarTablaVisual());
      });
    }


    // === Suma total de pax ===
      tabla.addEventListener('input', e => {
          if (e.target.classList.contains('paxInput')) {
            actualizarTotalPax();
            actualizarTotalPaxAsistidos();
            guardarReservas(fechaSeleccion.value, turnoActual);
          }
        });

        tabla.addEventListener('change', () => {
          guardarReservas(fechaSeleccion.value, turnoActual);
        });
        actualizarTotalPax();


      }

    function actualizarTotalPaxAsistidos() {
      let totalAsistidos = 0;
      const filas = tabla.querySelectorAll('tbody tr');
      
      filas.forEach(fila => {
        const chk = fila.querySelector('.chk-asistio');
        const pax = parseInt(fila.querySelector('.paxInput')?.value || 0);
        if (chk && chk.checked && !isNaN(pax)) {
          totalAsistidos += pax;
        }
      });

    document.getElementById('totalPaxAsistidos').textContent = totalAsistidos;
  }


    function actualizarTotalPax() {
      let total = 0;
      tabla.querySelectorAll('.paxInput').forEach(inp => {
        total += parseInt(inp.value) || 0;
      });
      document.getElementById('totalPax').textContent = total;
    }
  

  let _tGuardar;
  function guardarDebounced() {
    clearTimeout(_tGuardar);
    _tGuardar = setTimeout(() => {
      guardarReservas(fechaSeleccion.value, turnoActual);
    }, 300); // 300–500 ms va bien
  }


  function esFilaLibre(fila) {
    const mesa = fila.children[1].querySelector("input").value.trim();
    const pax = fila.children[2].querySelector("input").value.trim();
    const nombre = fila.children[3].querySelector("input").value.trim();
    const tel = fila.children[4].querySelector("input").value.trim();
    const comentario = fila.children[5].querySelector("input").value.trim();
    const asistio = fila.children[6].querySelector("input").checked;
    const pidioMesa = fila.children[7].querySelector("input").checked;
    const ocupar = fila.children[9].querySelector("input").checked;
    // Criterio de “libre”: sin datos cargados ni flags marcados
    return !mesa && !pax && !nombre && !tel && !comentario && !asistio && !pidioMesa && !ocupar;
  }

  function mesaDisponibleDeFila(fila) {
    return (fila.querySelector('td:nth-child(9)')?.textContent || '').trim();
  }

  function buscarFilaLibrePorHora(hora, preferMesa) {
    const filas = Array.from(tabla.querySelectorAll('tbody tr'))
      .filter(tr => tr.children[0].textContent.trim() === hora);

    // si pidió mesa específica, priorizamos ese slot
    if (preferMesa) {
      const preferida = filas.find(f => mesaDisponibleDeFila(f) === String(preferMesa).trim() && esFilaLibre(f));
      if (preferida) return preferida;
    }
    // sino, la primera libre
    return filas.find(esFilaLibre) || null;
  }

  // ======== NUEVA RESERVA ========

  // Abrir formulario
  console.log('Buscando #btnNew…', !!btnNew);
  btnNew.addEventListener('click', () => {
    menu.style.display = 'none';
    formSection.style.display = 'block';
    document.body.classList.add('mode-table');

    // 🧹 Limpiar todos los campos del formulario
    formReserva.reset();

    // 📅 Volver a poner la fecha de hoy
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    document.getElementById('resFecha').value = `${yyyy}-${mm}-${dd}`;

    // 🔹 Asegurar que los botones de hora se desmarquen
    document.querySelectorAll('.hora-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('resHora').value = '';

    // 🔹 Resetear turno
    document.getElementById('resTurno').value = '';
  });



  // Volver al menú desde formulario
  btnBackForm.addEventListener('click', () => {
    formSection.style.display = 'none';
    menu.style.display = 'block';
    document.body.classList.remove('mode-table');
  });
  // Tooltip flotante único
  let _miniAlertEl = null;

  function mostrarMiniAlertaLocal(input, texto) {
    // crear elemento si no existe
    if (!_miniAlertEl) {
      _miniAlertEl = document.createElement('div');
      _miniAlertEl.className = 'mini-alert-local';
      document.body.appendChild(_miniAlertEl);
    }
    _miniAlertEl.textContent = texto;
    _miniAlertEl.style.display = 'block';
    _miniAlertEl.classList.remove('ocultar');

    // posicionar relativo al viewport (position: fixed)
    const rect = input.getBoundingClientRect();
    const espacio = 6; // separación bajo el input
    const top = rect.bottom + espacio;      // px desde top de la ventana
    let left = rect.left;                   // px desde left de la ventana

    // evitar que se salga por la derecha
    const maxLeft = window.innerWidth - 12; // margen
    _miniAlertEl.style.left = '0px'; // reset para medir ancho real
    _miniAlertEl.style.top  = '-9999px';
    _miniAlertEl.style.position = 'fixed';
    document.body.offsetHeight; // forzar layout
    const ancho = _miniAlertEl.offsetWidth;
    if (left + ancho > maxLeft) left = Math.max(12, maxLeft - ancho);

    _miniAlertEl.style.top  = `${top}px`;
    _miniAlertEl.style.left = `${left}px`;
    _miniAlertEl.style.zIndex = 999999;

    // auto-ocultar
    clearTimeout(_miniAlertEl._t);
    _miniAlertEl._t = setTimeout(() => {
      _miniAlertEl.classList.add('ocultar');
      setTimeout(() => { _miniAlertEl.style.display = 'none'; }, 300);
    }, 2500);

    // si se hace scroll/resize mientras está visible, la reposicionamos
    const reposicionar = () => {
      if (_miniAlertEl && _miniAlertEl.style.display === 'block') {
        const r = input.getBoundingClientRect();
        let l = r.left;
        const w = _miniAlertEl.offsetWidth;
        if (l + w > window.innerWidth - 12) l = Math.max(12, window.innerWidth - 12 - w);
        _miniAlertEl.style.top  = `${r.bottom + espacio}px`;
        _miniAlertEl.style.left = `${l}px`;
      }
    };
    window.requestAnimationFrame(reposicionar);
    window.addEventListener('scroll', reposicionar, { passive: true, once: true });
    window.addEventListener('resize', reposicionar, { passive: true, once: true });
  }




    const mensajeDiv = document.getElementById('mensajeReserva');

    function mostrarMensaje(texto, tipo = "info") {
      mensajeDiv.textContent = texto;
      mensajeDiv.className = "mensaje-reserva"; // reset clases
      if (tipo === "error") mensajeDiv.classList.add("error");
      mensajeDiv.style.display = "block";
      clearTimeout(mensajeDiv._timeout);
      mensajeDiv._timeout = setTimeout(() => mensajeDiv.style.display = "none", 4000);
    }

    // Guardar nueva reserva
    // ======== GUARDAR NUEVA RESERVA (con animación y guardado real) ========
      formReserva.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
          fecha: document.getElementById('resFecha').value,
          hora: document.getElementById('resHora').value,
          turno: document.getElementById('resTurno').value,
          mesa: document.getElementById('resMesa').value,     // opcional (preferencia)
          pax: document.getElementById('resPax').value,
          nombre: document.getElementById('resNombre').value,
          tel: document.getElementById('resTel').value,
          comentario: document.getElementById('resComent').value
        };

        if (!data.turno) { alert("Seleccioná el turno."); return; }
        if (!data.hora)  { alert("Seleccioná la hora."); return; }

        // 1) Render base + cargar reservas existentes de esa fecha/turno
        renderTabla();
        await cargarReservas(data.fecha, data.turno);

        // 2) Buscar un HUECO LIBRE en esa hora (prioriza mesa si la pediste)
        const filaLibre = buscarFilaLibrePorHora(data.hora, data.mesa);

        if (!filaLibre) {
          mostrarMensaje("⛔ Horario completo, seleccioná otro horario.", "error");
          return;
        }

        // 3) Completar la fila libre
        const inputMesa = filaLibre.children[1].querySelector("input");
        const inputPax  = filaLibre.children[2].querySelector("input");
        const inputNom  = filaLibre.children[3].querySelector("input");
        const inputTel  = filaLibre.children[4].querySelector("input");
        const inputCom  = filaLibre.children[5].querySelector("input");

        // Si NO escribiste mesa, asignamos automáticamente la mesa de la columna "Mesas disponibles"
        inputMesa.value = data.mesa?.trim() || mesaDisponibleDeFila(filaLibre);
        inputPax.value  = data.pax;
        inputNom.value  = data.nombre;
        inputTel.value  = data.tel;
        inputCom.value  = data.comentario;

        // 4) Guardar y refrescar visual
        await guardarReservas(data.fecha, data.turno);
        refrescarTablaVisual();

        // 5) Animación + volver al menú
        const anim = document.getElementById('successAnimation');
        if (anim) {
          anim.classList.add('show');
          setTimeout(() => {
            anim.classList.remove('show');
            formSection.style.display = 'none';
            menu.style.display = 'block';
            document.body.classList.remove('mode-table');
          }, 1600);
        } else {
          // fallback sin animación
          formSection.style.display = 'none';
          menu.style.display = 'block';
          document.body.classList.remove('mode-table');
        }
      });





  // ======== GENERADOR DE BOTONES DE HORA ========
  const cont = document.getElementById('selectorHora');
  if (cont) {
    const horas = ["12:30","12:45","13:00","13:15","13:30","13:45","14:00","20:30","20:45","21:00","21:15","21:30","21:45","22:00"];
    horas.forEach(h => {
      const b = document.createElement('button');
      b.textContent = h;
      b.className = 'hora-btn';
      b.onclick = (ev) => {
        ev.preventDefault();
        document.querySelectorAll('.hora-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        document.getElementById('resHora').value = h;
      };
      cont.appendChild(b);
    });
  }
    // ======= 🌗 MODO OSCURO / CLARO =======
  const modoToggle = document.getElementById('modoToggle');

  // Cargar preferencia guardada (si la hay)
  if (localStorage.getItem('modo') === 'oscuro') {
    document.body.classList.add('modo-oscuro');
    modoToggle.textContent = '☀️';
  }

  // Cambiar modo al hacer clic
  modoToggle.addEventListener('click', () => {
    document.body.classList.toggle('modo-oscuro');
    const esOscuro = document.body.classList.contains('modo-oscuro');
    modoToggle.textContent = esOscuro ? '☀️' : '🌙';
    localStorage.setItem('modo', esOscuro ? 'oscuro' : 'claro');
  });


});


