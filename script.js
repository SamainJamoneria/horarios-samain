const coloresSuaves = [
    "#d4efdf", "#d6eaf8", "#fcf3cf", "#ebdef0", "#f9ebea", 
    "#e8f8f5", "#fef9e7", "#fae5d3", "#fadbd8", "#eaeded"
];

let semanas = JSON.parse(localStorage.getItem("samain_semanas")) || [
    {
        id: "semana_principal",
        titulo: "Horario Semanal - Samaín",
        exportarTotal: false,
        empleados: [
            { nombre: "Empleado 1", exportar: true, exportarHoras: false },
            { nombre: "Empleado 2", exportar: true, exportarHoras: false },
            { nombre: "Empleado 3", exportar: true, exportarHoras: false }
        ]
    }
];

semanas = semanas.map(sem => {
    if (!sem.id) sem.id = "sem_" + Math.random().toString(36).substring(2, 9);
    if (!sem.titulo) sem.titulo = "Horario Semanal - Samaín";
    if (sem.exportarTotal === undefined) sem.exportarTotal = false;
    sem.empleados = sem.empleados.map(emp => {
        if (typeof emp === "string") return { nombre: emp, exportar: true, exportarHoras: false };
        if (emp.exportarHoras === undefined) emp.exportarHoras = false;
        return emp;
    });
    return sem;
});

const contenedorSemanas = document.getElementById("semanas-contenedor");

function calcularHorasLinea(texto) {
    if (!texto) return 0;
    let t = texto.trim().toLowerCase();
    if (t === "libre" || t === "v" || t === "" || t.includes("libranza")) return 0;

    let regex = /(\d{1,2})[:\.]?(\d{2})?\s*(?:-|a)\s*(\d{1,2})[:\.]?(\d{2})?/;
    let match = t.match(regex);
    if (match) {
        let hInicio = parseInt(match[1], 10);
        let mInicio = match[2] ? parseInt(match[2], 10) : 0;
        let hFin = parseInt(match[3], 10);
        let mFin = match[4] ? parseInt(match[4], 10) : 0;

        let totalMinInicio = hInicio * 60 + mInicio;
        let totalMinFin = hFin * 60 + mFin;

        if (totalMinFin < totalMinInicio) totalMinFin += 24 * 60;
        let diffMin = totalMinFin - totalMinInicio;
        return diffMin > 0 ? diffMin / 60 : 0;
    }
    return 0;
}

function calcularHorasTexto(textoCompleto) {
    if (!textoCompleto) return 0;
    let lineas = textoCompleto.split(/\r?\n/);
    let totalSuma = 0;
    lineas.forEach(linea => { totalSuma += calcularHorasLinea(linea); });
    return totalSuma;
}

function guardarDatos() {
    localStorage.setItem("samain_semanas", JSON.stringify(semanas));
}

function renderizarApp() {
    contenedorSemanas.innerHTML = "";

    semanas.forEach((sem, sIndex) => {
        let bloqueSemana = document.createElement("div");
        bloqueSemana.className = "semana-bloque";
        bloqueSemana.setAttribute("data-semana-id", sem.id);

        let headerDiv = document.createElement("div");
        headerDiv.className = "semana-header";

        let titleCont = document.createElement("div");
        titleCont.className = "semana-titulo-container";

        let inputTitulo = document.createElement("input");
        inputTitulo.type = "text";
        inputTitulo.className = "semana-titulo-input";
        inputTitulo.value = sem.titulo;
        inputTitulo.disabled = true;
        inputTitulo.oninput = function() {
            sem.titulo = this.value;
            guardarDatos();
        };

        let btnEditTitle = document.createElement("button");
        btnEditTitle.className = "btn-edit-title";
        btnEditTitle.innerHTML = "✏️ Editar";
        btnEditTitle.title = "Editar nombre de la semana";
        btnEditTitle.onclick = function() {
            if (inputTitulo.disabled) {
                inputTitulo.disabled = false;
                inputTitulo.focus();
                btnEditTitle.innerHTML = "💾 Guardar";
            } else {
                inputTitulo.disabled = true;
                btnEditTitle.innerHTML = "✏️ Editar";
                guardarDatos();
            }
        };

        titleCont.appendChild(inputTitulo);
        titleCont.appendChild(btnEditTitle);
        headerDiv.appendChild(titleCont);

        let accionesHeader = document.createElement("div");
        accionesHeader.className = "semana-acciones-header";

        let btnAddEmp = document.createElement("button");
        btnAddEmp.className = "btn-add-emp";
        btnAddEmp.innerHTML = "+ Empleado";
        btnAddEmp.onclick = function() { agregarEmpleado(sIndex); };

        let btnPdfWeek = document.createElement("button");
        btnPdfWeek.className = "btn-pdf-week";
        btnPdfWeek.innerHTML = "🖨️ PDF Semana";
        btnPdfWeek.onclick = function() { prepararPDFSemana(bloqueSemana, sem.titulo); };

        accionesHeader.appendChild(btnAddEmp);
        accionesHeader.appendChild(btnPdfWeek);

        if (semanas.length > 1) {
            let btnDelWeek = document.createElement("button");
            btnDelWeek.className = "btn-del-week";
            btnDelWeek.innerHTML = "🗑️ Eliminar Semana";
            btnDelWeek.onclick = function() { eliminarSemana(sIndex); };
            accionesHeader.appendChild(btnDelWeek);
        }

        headerDiv.appendChild(accionesHeader);
        bloqueSemana.appendChild(headerDiv);

        let tableResponsive = document.createElement("div");
        tableResponsive.className = "table-responsive";

        let table = document.createElement("table");
        let thead = document.createElement("thead");
        thead.innerHTML = `
            <tr>
                <th>Empleado</th>
                <th>Lunes</th>
                <th>Martes</th>
                <th>Miércoles</th>
                <th>Jueves</th>
                <th>Viernes</th>
                <th>Sábado</th>
                <th>Domingo</th>
                <th class="no-print" style="width: 60px;">Acciones</th>
            </tr>
        `;
        table.appendChild(thead);

        let tbody = document.createElement("tbody");

        sem.empleados.forEach((emp, eIndex) => {
            let tr = document.createElement("tr");
            let colorFondo = coloresSuaves[eIndex % coloresSuaves.length];
            tr.style.backgroundColor = colorFondo;

            if (!emp.exportar) {
                tr.classList.add("fila-oculta-pdf");
            }

            let totalHorasSemanales = 0;
            for (let dia = 1; dia <= 7; dia++) {
                let val = localStorage.getItem(`${sem.id}_emp-${eIndex}-dia-${dia}`) || "";
                totalHorasSemanales += calcularHorasTexto(val);
            }

            let tdNombre = document.createElement("td");
            let divCell = document.createElement("div");
            divCell.className = "empleado-cell";

            let inputNombre = document.createElement("input");
            inputNombre.type = "text";
            inputNombre.className = "empleado-input";
            inputNombre.value = emp.nombre;
            inputNombre.oninput = function() {
                emp.nombre = this.value;
                guardarDatos();
            };

            let divHoras = document.createElement("div");
            divHoras.className = "horas-container";
            if (emp.exportarHoras) {
                divHoras.classList.add("horas-exportables-activo");
            }

            let spanHoras = document.createElement("span");
            spanHoras.className = "total-horas";
            spanHoras.innerText = `${totalHorasSemanales.toFixed(1).replace('.0','')}h`;

            let btnOjoHoras = document.createElement("button");
            btnOjoHoras.className = "btn-eye-horas";
            btnOjoHoras.innerHTML = emp.exportarHoras ? "👁️" : "🔒";
            btnOjoHoras.title = emp.exportarHoras ? "Horas visibles en PDF" : "Horas ocultas en PDF";
            btnOjoHoras.onclick = function() {
                emp.exportarHoras = !emp.exportarHoras;
                guardarDatos();
                renderizarApp();
            };

            divHoras.appendChild(spanHoras);
            divHoras.appendChild(btnOjoHoras);
            divCell.appendChild(inputNombre);
            divCell.appendChild(divHoras);
            tdNombre.appendChild(divCell);
            tr.appendChild(tdNombre);

            for (let dia = 1; dia <= 7; dia++) {
                let tdDia = document.createElement("td");
                let key = `${sem.id}_emp-${eIndex}-dia-${dia}`;
                let valorGuardado = localStorage.getItem(key) || "";
                
                let textareaDia = document.createElement("textarea");
                textareaDia.placeholder = "9-17";
                textareaDia.value = valorGuardado;
                textareaDia.setAttribute("data-key", key);
                textareaDia.oninput = function() {
                    localStorage.setItem(key, this.value);
                    actualizarTotalFilaLocal(tr, sIndex, eIndex);
                };

                tdDia.appendChild(textareaDia);
                tr.appendChild(tdDia);
            }

            let tdAccion = document.createElement("td");
            tdAccion.className = "no-print";
            tdAccion.style.whiteSpace = "nowrap";

            let btnOjo = document.createElement("button");
            btnOjo.className = "btn-eye";
            btnOjo.innerHTML = emp.exportar ? "👁️" : "🔒";
            btnOjo.title = emp.exportar ? "Empleado visible en PDF" : "Empleado oculto en PDF";
            btnOjo.onclick = function() {
                emp.exportar = !emp.exportar;
                guardarDatos();
                renderizarApp();
            };

            let btnDel = document.createElement("button");
            btnDel.className = "btn-delete";
            btnDel.innerHTML = "❌";
            btnDel.onclick = function() { eliminarEmpleado(sIndex, eIndex); };

            tdAccion.appendChild(btnOjo);
            tdAccion.appendChild(btnDel);
            tr.appendChild(tdAccion);

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        tableResponsive.appendChild(table);
        bloqueSemana.appendChild(tableResponsive);

        let toggleContainer = document.createElement("div");
        toggleContainer.className = "export-toggle-container no-print";
        let chkId = `chk_total_${sem.id}`;
        toggleContainer.innerHTML = `
            <label>
                <input type="checkbox" id="${chkId}" ${sem.exportarTotal ? "checked" : ""}> 
                Mostrar total de horas en el PDF de esta semana
            </label>
        `;
        toggleContainer.querySelector("input").onchange = function() {
            sem.exportarTotal = this.checked;
            guardarDatos();
        };
        bloqueSemana.appendChild(toggleContainer);

        contenedorSemanas.appendChild(bloqueSemana);
    });
}

function actualizarTotalFilaLocal(trFila, sIndex, eIndex) {
    let suma = 0;
    let semId = semanas[sIndex].id;
    for (let dia = 1; dia <= 7; dia++) {
        let val = localStorage.getItem(`${semId}_emp-${eIndex}-dia-${dia}`) || "";
        suma += calcularHorasTexto(val);
    }
    let span = trFila.querySelector(".total-horas");
    if (span) span.innerText = `${suma.toFixed(1).replace('.0','')}h`;
}

function agregarSemana() {
    let ultimaSemana = semanas[semanas.length - 1];
    let nuevaId = "sem_" + Math.random().toString(36).substring(2, 9);
    
    let nuevosEmpleados = ultimaSemana.empleados.map(emp => ({
        nombre: emp.nombre,
        exportar: emp.exportar,
        exportarHoras: emp.exportarHoras
    }));

    semanas.push({
        id: nuevaId,
        titulo: "Nuevo Horario Semanal - Samaín",
        exportarTotal: false,
        empleados: nuevosEmpleados
    });

    guardarDatos();
    renderizarApp();
}

function eliminarSemana(sIndex) {
    if (confirm(`¿Seguro que quieres eliminar la semana "${semanas[sIndex].titulo}" y todos sus turnos?`)) {
        let semId = semanas[sIndex].id;
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(semId)) {
                localStorage.removeItem(key);
            }
        });
        semanas.splice(sIndex, 1);
        guardarDatos();
        renderizarApp();
    }
}

function agregarEmpleado(sIndex) {
    let sem = semanas[sIndex];
    sem.empleados.push({ nombre: `Empleado ${sem.empleados.length + 1}`, exportar: true, exportarHoras: false });
    guardarDatos();
    renderizarApp();
}

function eliminarEmpleado(sIndex, eIndex) {
    let sem = semanas[sIndex];
    if (confirm(`¿Seguro que quieres eliminar a ${sem.empleados[eIndex].nombre}?`)) {
        for (let dia = 1; dia <= 7; dia++) {
            localStorage.removeItem(`${sem.id}_emp-${eIndex}-dia-${dia}`);
        }
        sem.empleados.splice(eIndex, 1);
        guardarDatos();
        renderizarApp();
    }
}

function prepararPDFSemana(bloqueSemanaElemento, tituloSemana) {
    document.querySelectorAll(".semana-bloque").forEach(b => b.classList.remove("imprimiendo-activo"));
    bloqueSemanaElemento.classList.add("imprimiendo-activo");

    let chk = bloqueSemanaElemento.querySelector("input[type='checkbox']");
    if (chk && chk.checked) {
        document.body.classList.add("exportar-total-activo");
    } else {
        document.body.classList.remove("exportar-total-activo");
    }

    document.title = tituloSemana;
    window.print();
}

function limpiarTodo() {
    if (confirm("¿Seguro que quieres borrar absolutamente todas las semanas y turnos guardados?")) {
        localStorage.clear();
        location.reload();
    }
}

renderizarApp();
