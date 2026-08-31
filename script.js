// Lista de colores suaves predefinidos para los empleados
const coloresSuaves = [
    "#d4efdf", // Verde muy suave
    "#d6eaf8", // Azul muy suave
    "#fcf3cf", // Amarillo muy suave
    "#ebdef0", // Morado muy suave
    "#f9ebea", // Rojo/Rosa muy suave
    "#e8f8f5", // Turquesa muy suave
    "#fef9e7"  // Naranja muy suave
];

// Cargar empleados guardados o empezar con 3 por defecto
let empleados = JSON.parse(localStorage.getItem("samain_empleados")) || ["Empleado 1", "Empleado 2", "Empleado 3"];

const tbody = document.getElementById("tabla-horarios");

// Generar la tabla en pantalla
function cargarTabla() {
    tbody.innerHTML = "";
    
    empleados.forEach((emp, index) => {
        let tr = document.createElement("tr");
        let colorFondo = coloresSuaves[index % coloresSuaves.length];
        tr.style.backgroundColor = colorFondo;
        
        // Columna del nombre del empleado
        let tdNombre = document.createElement("td");
        tdNombre.innerHTML = `<input type="text" class="empleado-input" value="${emp}" data-id="emp-${index}" oninput="actualizarNombre(this, ${index})">`;
        tr.appendChild(tdNombre);

        // Columnas de los 7 días de la semana
        for (let dia = 1; dia <= 7; dia++) {
            let tdDia = document.createElement("td");
            let key = `emp-${index}-dia-${dia}`;
            let valorGuardado = localStorage.getItem(key) || "";
            tdDia.innerHTML = `<input type="text" placeholder="9-17" value="${valorGuardado}" data-key="${key}" oninput="guardarDato(this)">`;
            tr.appendChild(tdDia);
        }

        // Botón para borrar esta fila de empleado (con la clase no-print para ocultarlo en el PDF)
        let tdAccion = document.createElement("td");
        tdAccion.className = "no-print";
        tdAccion.innerHTML = `<button class="btn-delete" onclick="eliminarEmpleado(${index})">X</button>`;
        tr.appendChild(tdAccion);
        
        tbody.appendChild(tr);
    });
}

// Actualizar nombre del empleado
function actualizarNombre(input, index) {
    empleados[index] = input.value;
    localStorage.setItem("samain_empleados", JSON.stringify(empleados));
}

// Añadir un nuevo empleado
function agregarEmpleado() {
    let nuevoNombre = `Empleado ${empleados.length + 1}`;
    empleados.push(nuevoNombre);
    localStorage.setItem("samain_empleados", JSON.stringify(empleados));
    cargarTabla();
}

// Eliminar un empleado y limpiar sus turnos asociados
function eliminarEmpleado(index) {
    if (confirm(`¿Seguro que quieres eliminar a ${empleados[index]} y sus turnos?`)) {
        for (let dia = 1; dia <= 7; dia++) {
            localStorage.removeItem(`emp-${index}-dia-${dia}`);
        }
        empleados.splice(index, 1);
        localStorage.setItem("samain_empleados", JSON.stringify(empleados));
        cargarTabla();
    }
}

// Guardar automáticamente lo que escriba en los turnos
function guardarDato(elemento) {
    let key = elemento.getAttribute("data-key");
    let valor = elemento.value;
    localStorage.setItem(key, valor);
}

// Botón de limpiar todo
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

// Ejecutar al abrir la página
cargarTabla();
