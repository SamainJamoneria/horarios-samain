// Lista de empleados por defecto
const empleados = ["Empleado 1", "Empleado 2", "Empleado 3", "Empleado 4", "Empleado 5"];

const tbody = document.getElementById("tabla-horarios");

// Generar la tabla en pantalla
function cargarTabla() {
    tbody.innerHTML = "";
    empleados.forEach((emp, index) => {
        let tr = document.createElement("tr");
        
        // Columna del nombre del empleado
        let tdNombre = document.createElement("td");
        tdNombre.innerHTML = `<input type="text" class="empleado-input" value="${emp}" data-id="${index}-nombre">`;
        tr.appendChild(tdNombre);

        // Columnas de los 7 días de la semana
        for (let dia = 1; dia <= 7; dia++) {
            let tdDia = document.createElement("td");
            let key = `emp-${index}-dia-${dia}`;
            let valorGuardado = localStorage.getItem(key) || "";
            tdDia.innerHTML = `<input type="text" placeholder="Ej: 09:00-17:00" value="${valorGuardado}" data-key="${key}" oninput="guardarDato(this)">`;
            tr.appendChild(tdDia);
        }
        
        tbody.appendChild(tr);
    });
}

// Guardar automáticamente lo que escriba
function guardarDato(elemento) {
    let key = elemento.getAttribute("data-key");
    let valor = elemento.value;
    localStorage.setItem(key, valor);
}

// Botón de limpiar todo
function limpiarHorario() {
    if (confirm("¿Seguro que quieres borrar todos los horarios de la pantalla?")) {
        localStorage.clear();
        cargarTabla();
    }
}

// Ejecutar al abrir la página
cargarTabla();
