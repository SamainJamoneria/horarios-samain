let semanas = [];
let celdasActivasPorSemana = {}; // Guarda la última celda enfocada por cada semana

const PALETA_COLORES_SUAVES = [
    '#f8d7da', // Rojo suave
    '#fff3cd', // Amarillo suave
    '#d4edda', // Verde suave
    '#f5e6d3', // Marrón suave
    '#e2e2e2', // Negro suave / Gris oscuro muy suave
    '#fce8e6', // Naranja suave
    '#e8f4f8', // Azul grisáceo suave
    '#fbe5f2', // Rosa suave
    '#e2f0d9'  // Lima suave
];

function obtenerColorEmpleado(nombreEmpleado) {
    if (!nombreEmpleado) nombreEmpleado = '';
    let nombreTrim = nombreEmpleado.trim().toLowerCase();

    let mapaColores = new Map();
    let colorIndex = 0;

    semanas.forEach(sem => {
        sem.empleados.forEach(emp => {
            let n = emp.nombre ? emp.nombre.trim().toLowerCase() : '';
            if (n && !mapaColores.has(n)) {
                mapaColores.set(n, PALETA_COLORES_SUAVES[colorIndex % PALETA_COLORES_SUAVES.length]);
                colorIndex++;
            }
        });
    });

    if (mapaColores.has(nombreTrim)) {
        return mapaColores.get(nombreTrim);
    }

    let colorAsignado = PALETA_COLORES_SUAVES[mapaColores.size % PALETA_COLORES_SUAVES.length];
    return colorAsignado;
}

window.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    if (semanas.length === 0) {
        agregarSemanaPorDefecto();
    } else {
        renderizar();
    }
});

function registrarCeldaActiva(semId, empId, dia, textareaElem) {
    celdasActivasPorSemana[semId] = { empId, dia, textarea: textareaElem };
}

function aplicarAtajoSemana(semId, textoTurno) {
    let activa = celdasActivasPorSemana[semId];
    if (!activa || !activa.textarea) {
        alert("Haz clic primero en la celda del día donde quieras aplicar el atajo.");
        return;
    }

    activa.textarea.value = textoTurno;
    actualizarTurno(semId, activa.empId, activa.dia, textoTurno);
}

function guardarDatos() {
    localStorage.setItem('horarios_semanas_v2', JSON.stringify(semanas));
}

function cargarDatos() {
    const guardado = localStorage.getItem('horarios_semanas_v2');
    if (guardado) {
        try {
            semanas = JSON.parse(guardado);
        } catch(e) {
            semanas = [];
        }
    }
}

function agregarSemanaPorDefecto() {
    semanas.push({
        id: 'sem_' + Date.now(),
        titulo: 'Nuevo Horario Semanal',
        editandoTitulo: false,
        colapsado: false,
        mostrarTotalPdf: false,
        empleados: [
            { id: 'emp_1', nombre: 'Empleado 1', dias: { Lunes: '9-17', Martes: '9-17', Miércoles: '9-17', Jueves: '9-17', Viernes: '9-17', Sábado: '9-17', Domingo: '9-17' }, ocultoPdf: false },
            { id: 'emp_2', nombre: 'Empleado 2', dias: { Lunes: '9-17', Martes: '9-17', Miércoles: '9-17', Jueves: '9-17', Viernes: '9-17', Sábado: '9-17', Domingo: '9-17' }, ocultoPdf: false },
            { id: 'emp_3', nombre: 'Empleado 3', dias: { Lunes: '9-17', Martes: '9-17', Miércoles: '9-17', Jueves: '9-17', Viernes: '9-17', Sábado: '9-17', Domingo: '9-17' }, ocultoPdf: false }
        ]
    });
    guardarDatos();
    renderizar();
}

function agregarSemana() {
    semanas.push({
        id: 'sem_' + Date.now(),
        titulo: 'Nueva Semana',
        editandoTitulo: false,
        colapsado: false,
        mostrarTotalPdf: false,
        empleados: [
            { id: 'emp_1', nombre: 'Empleado 1', dias: { Lunes: '', Martes: '', Miércoles: '', Jueves: '', Viernes: '', Sábado: '', Domingo: '' }, ocultoPdf: false }
        ]
    });
    guardarDatos();
    renderizar();
}

function eliminarSemana(semId) {
    if (confirm("¿Estás seguro de eliminar toda esta semana?")) {
        semanas = semanas.filter(s => s.id !== semId);
        delete celdasActivasPorSemana[semId];
        guardarDatos();
        renderizar();
    }
}

function limpiarSemana(semId) {
    if (confirm("¿Borrar todos los datos de esta semana?")) {
        let sem = semanas.find(s => s.id === semId);
        if (sem) {
            sem.empleados.forEach(emp => {
                for (let d in emp.dias) {
                    emp.dias[d] = '';
                }
            });
            guardarDatos();
            renderizar();
        }
    }
}

function toggleEditarTitulo(semId) {
    let sem = semanas.find(s => s.id === semId);
    if (sem) {
        sem.editandoTitulo = !sem.editandoTitulo;
        guardarDatos();
        renderizar();
    }
}

function actualizarTituloSemana(semId, nuevoValor) {
    let sem = semanas.find(s => s.id === semId);
    if (sem) {
        sem.titulo = nuevoValor;
        guardarDatos();
    }
}

function toggleColapsarSemana(semId) {
    let sem = semanas.find(s => s.id === semId);
    if (sem) {
        sem.colapsado = !sem.colapsado;
        if (sem.colapsado) {
            sem.editandoTitulo = false;
        }
        guardarDatos();
        renderizar();
    }
}

function agregarEmpleado(semId) {
    let sem = semanas.find(s => s.id === semId);
    if (sem) {
        let nuevoNum = sem.empleados.length + 1;
        sem.empleados.push({
            id: 'emp_' + Date.now(),
            nombre: `Empleado ${nuevoNum}`,
            dias: { Lunes: '', Martes: '', Miércoles: '', Jueves: '', Viernes: '', Sábado: '', Domingo: '' },
            ocultoPdf: false
        });
        guardarDatos();
        renderizar();
    }
}

function eliminarEmpleado(semId, empId) {
    let sem = semanas.find(s => s.id === semId);
    if (sem) {
        sem.empleados = sem.empleados.filter(e => e.id !== empId);
        guardarDatos();
        renderizar();
    }
}

function actualizarNombreEmpleado(semId, empId, nuevoNombre, inputElement) {
    let sem = semanas.find(s => s.id === semId);
    if (sem) {
        let emp = sem.empleados.find(e => e.id === empId);
        if (emp) {
            emp.nombre = nuevoNombre;
            guardarDatos();
            let fila = inputElement.closest('tr');
            if (fila) {
                fila.style.backgroundColor = obtenerColorEmpleado(nuevoNombre);
            }
        }
    }
}

function actualizarTurno(semId, empId, dia, valor) {
    let sem = semanas.find(s => s.id === semId);
    if (sem) {
        let emp = sem.empleados.find(e => e.id === empId);
        if (emp) {
            emp.dias[dia] = valor;
            guardarDatos();
            actualizarHorasUI(semId, empId);
        }
    }
}

function toggleOcultoPdf(semId, empId) {
    let sem = semanas.find(s => s.id === semId);
    if (sem) {
        let emp = sem.empleados.find(e => e.id === empId);
        if (emp) {
            emp.ocultoPdf = !emp.ocultoPdf;
            guardarDatos();
            renderizar();
        }
    }
}

function toggleMostrarTotalPdf(semId) {
    let sem = semanas.find(s => s.id === semId);
    if (sem) {
        sem.mostrarTotalPdf = !sem.mostrarTotalPdf;
        guardarDatos();
    }
}

function calcularHorasTotales(emp) {
    let totalMinutos = 0;
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    diasSemana.forEach(dia => {
        let texto = emp.dias[dia];
        if (!texto) return;
        
        let lineas = texto.split('\n');
        lineas.forEach(linea => {
            linea = linea.trim();
            if (!linea) return;
            
            let match = linea.match(/(\d{1,2})[:h.]?(\d{2})?\s*(?:a|hasta|-)\s*(\d{1,2})[:h.]?(\d{2})?/i);
            if (match) {
                let h1 = parseInt(match[1], 10);
                let m1 = match[2] ? parseInt(match[2], 10) : 0;
                let h2 = parseInt(match[3], 10);
                let m2 = match[4] ? parseInt(match[4], 10) : 0;
                
                let minutosInicio = h1 * 60 + m1;
                let minutosFin = h2 * 60 + m2;
                
                if (minutosFin < minutosInicio) {
                    minutosFin += 24 * 60;
                }
                totalMinutos += (minutosFin - minutosInicio);
            }
        });
    });
    
    let horas = (totalMinutos / 60).toFixed(1);
    if (horas.endsWith('.0')) {
        horas = parseInt(horas, 10);
    }
    return horas;
}

function actualizarHorasUI(semId, empId) {
    let sem = semanas.find(s => s.id === semId);
    if (!sem) return;
    let emp = sem.empleados.find(e => e.id === empId);
    if (!emp) return;
    
    let spanHoras = document.getElementById(`horas_${semId}_${empId}`);
    if (spanHoras) {
        spanHoras.innerText = calcularHorasTotales(emp) + 'h';
    }
}

function exportarPDFSemana(semId) {
    let sem = semanas.find(s => s.id === semId);
    if (!sem) return;

    let bloque = document.getElementById(`bloque_${semId}`);
    if (!bloque) return;

    let tituloOriginalPagina = document.title;
    let nombreSemanaActual = sem.titulo ? sem.titulo.trim() : 'Horario';
    
    if (sem.mostrarTotalPdf) {
        document.title = nombreSemanaActual + ' - Total horas';
    } else {
        document.title = nombreSemanaActual;
    }

    bloque.classList.add('imprimiendo-activo');
    if (sem.mostrarTotalPdf) {
        document.body.classList.add('exportar-total-activo');
        bloque.querySelectorAll('.horas-container').forEach(el => el.classList.add('horas-exportables-activo'));
    }

    window.print();

    setTimeout(() => {
        bloque.classList.remove('imprimiendo-activo');
        document.body.classList.remove('exportar-total-activo');
        bloque.querySelectorAll('.horas-container').forEach(el => el.classList.remove('horas-exportables-activo'));
        document.title = tituloOriginalPagina;
    }, 500);
}

function dispararImportarPDF(semId) {
    let input = document.getElementById(`file_pdf_${semId}`);
    if (input) input.click();
}

async function importarPDFSemana(semId, event) {
    let archivo = event.target.files[0];
    if (!archivo) return;

    try {
        let lectorArray = await archivo.arrayBuffer();
        let pdfDoc = await pdfjsLib.getDocument({ data: lectorArray }).promise;
        let textoCompletoItems = [];

        for (let i = 1; i <= pdfDoc.numPages; i++) {
            let pagina = await pdfDoc.getPage(i);
            let contenido = await pagina.getTextContent();
            contenido.items.forEach(item => {
                if (item.str.trim() !== '') {
                    textoCompletoItems.push(item.str.trim());
                }
            });
        }

        let sem = semanas.find(s => s.id === semId);
        if (!sem) return;

        if (textoCompletoItems.length > 0) {
            alert("PDF leído correctamente. Se han extraído los datos de texto.");
        }

        renderizar();
    } catch (error) {
        console.error(error);
        alert("Hubo un error al leer el archivo PDF.");
    } finally {
        event.target.value = '';
    }
}

function renderizar() {
    let contenedor = document.getElementById('semanas-contenedor');
    if (!contenedor) return;
    
    let html = '';
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    semanas.forEach(sem => {
        html += `
        <div class="semana-bloque" id="bloque_${sem.id}">
            <div class="semana-header" style="margin-bottom: ${sem.colapsado ? '0' : '8px'};">
                <div class="semana-titulo-container">
                    <button class="btn-toggle-collapse" onclick="toggleColapsarSemana('${sem.id}')" title="Contraer / Expandir">
                        ${sem.colapsado ? '▼' : '▲'}
                    </button>
                    <input type="text" class="semana-titulo-input" value="${sem.titulo}" 
                        oninput="actualizarTituloSemana('${sem.id}', this.value)" 
                        ${sem.editandoTitulo ? '' : 'disabled'}>
                </div>`;

        if (!sem.colapsado) {
            html += `
                <div class="semana-acciones-header">
                    <button class="btn-edit-title" onclick="toggleEditarTitulo('${sem.id}')">${sem.editandoTitulo ? 'Guardar' : 'Editar'}</button>
                    <button class="btn-clear-emp btn-clear-week" onclick="limpiarSemana('${sem.id}')">Borrar Datos</button>
                    <button class="btn-add-emp" onclick="agregarEmpleado('${sem.id}')">+ Empleado</button>
                    <button class="btn-pdf-week" onclick="exportarPDFSemana('${sem.id}')">PDF Semana</button>
                    <button class="btn-pdf-import" onclick="dispararImportarPDF('${sem.id}')" style="background: #4a5568; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">Importar PDF</button>
                    <input type="file" id="file_pdf_${sem.id}" accept="application/pdf" style="display: none;" onchange="importarPDFSemana('${sem.id}', event)">
                    <button class="btn-del-week" onclick="eliminarSemana('${sem.id}')">Eliminar Semana</button>
                </div>`;
        }

        html += `</div>`;

        if (!sem.colapsado) {
            html += `
            <div class="atajos-toolbar no-print" style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 8px; background: #ffd700; padding: 8px; border-radius: 6px; border: 1px solid #e2c000;">
                <span style="font-size: 12px; font-weight: bold; color: #1a202c; width: 100%; margin-bottom: 2px; display: flex; align-items: center; gap: 4px;">⚡ Atajos rápidos:</span>
                <button type="button" onclick="aplicarAtajoSemana('${sem.id}', 'Libre')" style="background: #ffffff; color: #1a202c; border: 1px solid #cbd5e0; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; flex: 1; min-width: 80px;">Libre</button>
                <button type="button" onclick="aplicarAtajoSemana('${sem.id}', '10:00 a 16:00')" style="background: #ffffff; color: #1a202c; border: 1px solid #cbd5e0; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; flex: 2; min-width: 120px;">10:00 a 16:00</button>
                <button type="button" onclick="aplicarAtajoSemana('${sem.id}', '16:00 a 00:00')" style="background: #ffffff; color: #1a202c; border: 1px solid #cbd5e0; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; flex: 2; min-width: 120px;">16:00 a 00:00</button>
            </div>
            <div class="table-responsive">

                <table>
                    <thead>
                        <tr>
                            <th>Empleado</th>
                            ${dias.map(d => `<th>${d}</th>`).join('')}
                            <th class="no-print">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>`;

            sem.empleados.forEach((emp) => {
                let totalH = calcularHorasTotales(emp);
                let claseOculto = emp.ocultoPdf ? 'fila-oculta-pdf' : '';
                let iconoOjo = emp.ocultoPdf ? '🙈' : '👁️';
                let estiloFila = emp.ocultoPdf ? 'opacity: 0.4;' : '';
                let colorSuave = obtenerColorEmpleado(emp.nombre);

                html += `
                        <tr class="${claseOculto}" style="${estiloFila} background-color: ${colorSuave};">
                            <td>
                                <div class="empleado-cell" style="background: transparent;">
                                    <input type="text" class="empleado-input" value="${emp.nombre}" oninput="actualizarNombreEmpleado('${sem.id}', '${emp.id}', this.value, this)" style="background: rgba(255,255,255,0.6);">
                                    <div class="horas-container">
                                        <span class="total-horas" id="horas_${sem.id}_${emp.id}">${totalH}h</span>
                                    </div>
                                </div>
                            </td>`;

                dias.forEach(dia => {
                    let valorDia = emp.dias[dia] || '';
                    html += `
                            <td>
                                <textarea 
                                    oninput="actualizarTurno('${sem.id}', '${emp.id}', '${dia}', this.value)" 
                                    onfocus="registrarCeldaActiva('${sem.id}', '${emp.id}', '${dia}', this)"
                                    style="background: rgba(255,255,255,0.7);"
                                >${valorDia}</textarea>
                            </td>`;
                });

                html += `
                            <td class="no-print" style="display: flex; gap: 4px; justify-content: center; align-items: center; border: none; height: 100%;">
                                <button class="btn-eye" onclick="toggleOcultoPdf('${sem.id}', '${emp.id}')" title="Mostrar/Ocultar en PDF">${iconoOjo}</button>
                                <button class="btn-delete" onclick="eliminarEmpleado('${sem.id}', '${emp.id}')">X</button>
                            </td>
                        </tr>`;
            });

            html += `
                    </tbody>
                </table>
            </div>
            <div class="export-toggle-container no-print">
                <input type="checkbox" id="chk_total_${sem.id}" ${sem.mostrarTotalPdf ? 'checked' : ''} onchange="toggleMostrarTotalPdf('${sem.id}')">
                <label for="chk_total_${sem.id}">Mostrar total de horas en el PDF de esta semana</label>
            </div>`;
        }

        html += `</div>`;
    });

    contenedor.innerHTML = html;
}
