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

  // ======== ELEMENTOS NUEVA RESERVA ========
  const btnNew = document.getElementById('btnNew');
  const formSection = document.getElementById('nueva-reserva');
  const btnBackForm = document.getElementById('btnBackForm');
  const formReserva = document.getElementById('formReserva');

  // ======== CONFIG ========
  const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  let reservas = []; // base de datos temporal

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
    diaTexto.textContent = nombreDia(fechaSeleccion.value);
  });

  // ======== BOTÓN GENERAR ========
  if (btnGenerar) {
    btnGenerar.addEventListener('click', renderTabla);
  }

  // ======== FUNCIÓN PRINCIPAL: RENDER TABLA ========
  // ======== FUNCIÓN PRINCIPAL: GENERAR TABLA DE RESERVAS ========
// ======== FUNCIÓN PRINCIPAL: GENERAR TABLA DE RESERVAS ========
  function renderTabla() {
  const asignacion = [
    {hora:"20:30", mesa:11}, {hora:"20:30", mesa:12}, {hora:"20:30", mesa:13}, {hora:"20:30", mesa:14},
    {hora:"20:45", mesa:21}, {hora:"20:45", mesa:22}, {hora:"20:45", mesa:23},
    {hora:"21:00", mesa:24}, {hora:"21:00", mesa:31}, {hora:"21:00", mesa:32}, {hora:"21:00", mesa:33},
    {hora:"21:15", mesa:40}, {hora:"21:15", mesa:41}, {hora:"21:15", mesa:42},
    {hora:"21:30", mesa:43}, {hora:"21:30", mesa:44}, {hora:"21:30", mesa:45}, {hora:"21:30", mesa:46},
    {hora:"21:45", mesa:47}, {hora:"21:45", mesa:50}, {hora:"21:45", mesa:51}, {hora:"21:45", mesa:52},
    {hora:"22:00", mesa:53}, {hora:"22:00", mesa:54}, {hora:"22:00", mesa:55}, {hora:"22:00", mesa:60}
  ];

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
        <td><input type="number" min="1" max="60" style="width:60px"></td>
        <td><input type="number" min="0" class="paxInput" style="width:60px"></td>
        <td><input type="text"></td>
        <td><input type="text"></td>
        <td><input type="text"></td>
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

  // === Pintar en rojo la mesa ocupada ===
  const mesasAsignadas = tabla.querySelectorAll('td:nth-child(2) input'); // Columna "Mesa"
  const mesasDisponiblesCeldas = tabla.querySelectorAll('td:nth-child(9)'); // ✅ ahora es la 9° columna

  mesasAsignadas.forEach(input => {
    input.addEventListener('input', () => {
      const valorMesa = input.value.trim();
      mesasDisponiblesCeldas.forEach(celda => {
        const numeroMesa = celda.textContent.trim();
        if (valorMesa === numeroMesa) celda.classList.add('mesa-ocupada');
        else if (valorMesa === '') celda.classList.remove('mesa-ocupada');
      });
    });
  });

  // === Suma total de pax ===
  tabla.addEventListener('input', e => {
    if (e.target.classList.contains('paxInput')) actualizarTotalPax();
  });

  actualizarTotalPax();

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
}








  // ======== NUEVA RESERVA ========

  // Abrir formulario
  btnNew.addEventListener('click', () => {
  menu.style.display = 'none';
  formSection.style.display = 'block';
  document.body.classList.add('mode-table');

  // 📅 Por defecto: establecer fecha de hoy
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  document.getElementById('resFecha').value = `${yyyy}-${mm}-${dd}`;
  });


  // Volver al menú desde formulario
  btnBackForm.addEventListener('click', () => {
    formSection.style.display = 'none';
    menu.style.display = 'block';
    document.body.classList.remove('mode-table');
  });

  // Guardar nueva reserva
  formReserva.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = {
      fecha: document.getElementById('resFecha').value,
      hora: document.getElementById('resHora').value,
      turno: document.getElementById('resTurno').value,
      mesa: document.getElementById('resMesa').value,
      pax: document.getElementById('resPax').value,
      nombre: document.getElementById('resNombre').value,
      tel: document.getElementById('resTel').value,
      coment: document.getElementById('resComent').value
    };
    

    reservas.push(data);
    console.log("✅ Reserva guardada:", data);

    // Mostrar animación de éxito
    mostrarAnimacion();

    function mostrarAnimacion() {
      const anim = document.getElementById('successAnimation');
      anim.classList.add('show');

      // ⏳ Espera antes de volver al menú
      setTimeout(() => {
        anim.classList.remove('show');
        formSection.style.display = 'none';
        menu.style.display = 'block';
        document.body.classList.remove('mode-table');
      }, 1600);
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
});
