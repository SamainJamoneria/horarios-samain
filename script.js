const coloresSuaves = [
    "#d4efdf", // Verde muy suave
    "#d6eaf8", // Azul muy suave
    "#fcf3cf", // Amarillo muy suave
    "#ebdef0", // Morado muy suave
    "#f9ebea", // Rojo/Rosa muy suave
    "#e8f8f5", // Turquesa muy suave
    "#fef9e7", // Naranja muy suave
    "#fae5d3", // Marrón muy suave
    "#fadbd8", // Rojo muy suave
    "#eaeded"  // Negro/Gris muy suave
];

let empleados = JSON.parse(localStorage.getItem("samain_empleados")) || [
    { nombre: "Empleado 1", exportar: true, exportarHoras: false },
    { nombre: "Empleado 2", exportar: true, exportarHoras: false },
    { nombre: "Empleado 3", exportar: true, exportarHoras: false }
];

empleados = empleados.map(emp => {
    if (typeof emp === "string") {
        return { nombre: emp, exportar: true, exportarHoras: false };
    }
    if (emp.exportarHoras === undefined) {
        emp.exportarHoras = false;
    }
    return emp;
});

const tbody = document.getElementById("tabla-horarios");

function calcularHorasTexto(texto) {
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

        if (totalMinFin < totalMinInicio) {
            totalMinFin += 24 * 60;
        }
        let diffMin = totalMinFin - totalMinInicio;
        return diffMin > 0 ? diffMin / 60 : 0;
    }
    return 0;
}

function cargarTabla() {
    tbody.innerHTML = "";
    let mostrarColTotal = document.getElementById("chk-exportar-total").checked;

    empleados.forEach((emp, index) => {
        let tr = document.createElement("tr");
        let colorFondo = coloresSuaves[index % coloresSuaves.length];
        tr.style.backgroundColor = colorFondo;

        if (!emp.exportar) {
            tr.classList.add("fila-oculta-pdf");
        }

        let totalHorasSemanales = 0;
        for (let dia = 1; dia <= 7; dia++) {
            let key = `emp-${index}-dia-${dia}`;
            let val = localStorage.getItem(key) || "";
            totalHorasSemanales += calcularHorasTexto(val);
        }

        let tdNombre = document.createElement("td");
        let divCell = document.createElement("div");
        divCell.className = "empleado-cell";

        let inputNombre = document.createElement("input");
        inputNombre.type = "text";
        inputNombre.className = "empleado-input";
        inputNombre.value = emp.nombre;
        inputNombre.oninput = function() { actualizarNombre(this, index); };

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
        btnOjoHoras.title = emp.exportarHoras ? "Horas visibles en PDF (haz clic para ocultar)" : "Horas ocultas en PDF (haz clic para mostrar)";
        btnOjoHoras.onclick = function() { toggleExportarHorasEmpleado(index); };

        divHoras.appendChild(spanHoras);
        divHoras.appendChild(btnOjoHoras);

        divCell.appendChild(inputNombre);
        divCell.appendChild(divHoras);
        tdNombre.appendChild(divCell);
        tr.appendChild(tdNombre);

        for (let dia = 1; dia <= 7; dia++) {
            let tdDia = document.createElement("td");
            let key = `emp-${index}-dia-${dia}`;
            let valorGuardado = localStorage.getItem(key) || "";
            let inputDia = document.createElement("input");
            inputDia.type = "text";
            inputDia.placeholder = "9-17";
            inputDia.value = valorGuardado;
            inputDia.setAttribute("data-key", key);
            inputDia.oninput = function() {
                guardarDato(this);
                actualizarTotalFila(index);
            };
            tdDia.appendChild(inputDia);
            tr.appendChild(tdDia);
        }

        let tdTotalCol = document.createElement("td");
        tdTotalCol.className = "col-total-horas";
        tdTotalCol.style.display = mostrarColTotal ? "" : "none";
        tdTotalCol.style.fontWeight = "bold";
        tdTotalCol.innerText = `${totalHorasSemanales.toFixed(1).replace('.0','')}h`;
        tr.appendChild(tdTotalCol);

        let tdAccion = document.createElement("td");
        tdAccion.className = "no-print";
        tdAccion.style.whiteSpace = "nowrap";

        let iconoOjo = emp.exportar ? "👁️" : "🔒";
        let btnOjo = document.createElement("button");
        btnOjo.className = "btn-eye";
        btnOjo.innerHTML = iconoOjo;
        btnOjo.title = emp.exportar ? "Empleado visible en PDF (haz clic para ocultar)" : "Empleado oculto en PDF (haz clic para mostrar)";
        btnOjo.onclick = function() { toggleExportarEmpleado(index); };

        let btnDel = document.createElement("button");
        btnDel.className = "btn-delete";
        btnDel.innerHTML = "❌";
        btnDel.onclick = function() { eliminarEmpleado(index); };

        tdAccion.appendChild(btnOjo);
        tdAccion.appendChild(btnDel);
        tr.appendChild(tdAccion);

        tbody.appendChild(tr);
    });
}

function actualizarTotalFila(index) {
    let suma = 0;
    for (let dia = 1; dia <= 7; dia++) {
        let key = `emp-${index}-dia-${dia}`;
        let val = localStorage.getItem(key) || "";
        suma += calcularHorasTexto(val);
    }
    let filas = tbody.querySelectorAll("tr");
    if (filas[index]) {
        let span = filas[index].querySelector(".total-horas");
        if (span) span.innerText = `${suma.toFixed(1).replace('.0','')}h`;
        let tdTotalCol = filas[index].querySelector(".col-total-horas");
        if (tdTotalCol) tdTotalCol.innerText = `${suma.toFixed(1).replace('.0','')}h`;
    }
}

function actualizarNombre(input, index) {
    empleados[index].nombre = input.value;
    localStorage.setItem("samain_empleados", JSON.stringify(empleados));
}

function toggleExportarEmpleado(index) {
    empleados[index].exportar = !empleados[index].exportar;
    localStorage.setItem("samain_empleados", JSON.stringify(empleados));
    cargarTabla();
}

function toggleExportarHorasEmpleado(index) {
    empleados[index].exportarHoras = !empleados[index].exportarHoras;
    localStorage.setItem("samain_empleados", JSON.stringify(empleados));
    cargarTabla();
}

function agregarEmpleado() {
    let nuevoNombre = `Empleado ${empleados.length + 1}`;
    empleados.push({ nombre: nuevoNombre, exportar: true, exportarHoras: false });
    localStorage.setItem("samain_empleados", JSON.stringify(empleados));
    cargarTabla();
}

function eliminarEmpleado(index) {
    if (confirm(`¿Seguro que quieres eliminar a ${empleados[index].nombre} y sus turnos?`)) {
        for (let dia = 1; dia <= 7; dia++) {
            localStorage.removeItem(`emp-${index}-dia-${dia}`);
        }
        empleados.splice(index, 1);
        localStorage.setItem("samain_empleados", JSON.stringify(empleados));
        cargarTabla();
    }
}

function guardarDato(elemento) {
    let key = elemento.getAttribute("data-key");
    let valor = elemento.value;
    localStorage.setItem(key, valor);
}

function limpiarHorario() {
    if (confirm("¿Seguro que quieres borrar todos los turnos de la pantalla?")) {
        Object.keys(localStorage).forEach(key => {
            if (key.includes("-dia-")) {
                localStorage.removeItem(key);
            }
        });
        cargarTabla();
    }
}

cargarTabla();
