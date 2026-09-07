<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Turnos y Atajos</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background-color: #f3f4f6;
            color: #1f2937;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
        }
        .container {
            background: #ffffff;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 500px;
        }
        h2 {
            margin-top: 0;
            font-size: 1.25rem;
            color: #111827;
        }
        .atajos-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 16px;
        }
        .atajo-btn {
            background-color: #e5e7eb;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: background-color 0.2s;
        }
        .atajo-btn:hover {
            background-color: #d1d5db;
        }
        .btn-accion {
            background-color: #4f46e5;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
        }
        .btn-accion:hover {
            background-color: #4338ca;
        }
        .eliminar-atajo {
            background: none;
            border: none;
            color: #ef4444;
            cursor: pointer;
            font-weight: bold;
            padding: 0;
            font-size: 0.75rem;
        }
    </style>
</head>
<body>

<div class="container">
    <h2>Atajos Rápidos de Turnos</h2>
    <div id="lista-atajos" class="atajos-container">
        <!-- Los atajos se cargarán dinámicamente aquí -->
    </div>
    <button id="btn-editar-atajos" class="btn-accion" onclick="alternarModoEdicionAtajos()">✏️ Editar Atajos</button>
</div>

<script>
    // Variables de Estado Globales para los atajos y modo edición
    let atajos = [];
    let modoEdicionAtajos = false;

    // Persistencia Local: Cargar atajos desde localStorage o usar valores por defecto
    function cargarAtajos() {
        const guardados = localStorage.getItem('atajos_turnos');
        if (guardados) {
            atajos = JSON.parse(guardados);
        } else {
            atajos = ['Libre', '10:00 a 16:00', '16:00 a 00:00'];
            guardarAtajos();
        }
    }

    // Persistencia Local: Guardar atajos en localStorage
    function guardarAtajos() {
        localStorage.setItem('atajos_turnos', JSON.stringify(atajos));
    }

    // Renderizar la interfaz de los atajos según el modo (normal o edición)
    function renderizarAtajos() {
        const contenedor = document.getElementById('lista-atajos');
        const btnEditar = document.getElementById('btn-editar-atajos');
        
        contenedor.innerHTML = '';

        atajos.forEach((atajo, index) => {
            const btn = document.createElement('button');
            btn.className = 'atajo-btn';
            
            if (!modoEdicionAtajos) {
                btn.innerHTML = `<span>${atajo}</span>`;
                btn.onclick = () => seleccionarAtajo(atajo);
            } else {
                btn.innerHTML = `
                    <span onclick="editarAtajo(${index})" style="cursor:pointer;" title="Editar">${atajo} ✏️</span>
                    <button class="eliminar-atajo" onclick="eliminarAtajo(${index})" title="Eliminar">❌</button>
                `;
            }
            contenedor.appendChild(btn);
        });

        if (modoEdicionAtajos) {
            const btnAgregar = document.createElement('button');
            btn_agregar_clase: btnAgregar.className = 'atajo-btn';
            btnAgregar.style.backgroundColor = '#d1fae5';
            btnAgregar.style.color = '#065f46';
            btnAgregar.innerHTML = '<strong>+ Añadir atajo</strong>';
            btnAgregar.onclick = agregarAtajoNuevo;
            contenedor.appendChild(btnAgregar);

            btnEditar.textContent = '✔️ Guardar Cambios';
            btnEditar.style.backgroundColor = '#10b981';
        } else {
            btnEditar.textContent = '✏️ Editar Atajos';
            btnEditar.style.backgroundColor = '#4f46e5';
        }
    }

    // Alternar entre modo normal y modo edición
    function alternarModoEdicionAtajos() {
        modoEdicionAtajos = !modoEdicionAtajos;
        renderizarAtajos();
    }

    // Funciones CRUD para Atajos
    function agregarAtajoNuevo() {
        const nuevo = prompt('Introduce el nombre del nuevo atajo (ej. 08:00 a 15:00):');
        if (nuevo && nuevo.trim() !== '') {
            atajos.push(nuevo.trim());
            guardarAtajos();
            renderizarAtajos();
        }
    }

    function editarAtajo(index) {
        const actual = atajos[index];
        const modificado = prompt('Modifica el atajo:', actual);
        if (modificado !== null && modificado.trim() !== '') {
            atajos[index] = modificado.trim();
            guardarAtajos();
            renderizarAtajos();
        }
    }

    function eliminarAtajo(index) {
        if (confirm(`¿Seguro que deseas eliminar el atajo "${atajos[index]}"?`)) {
            atajos.splice(index, 1);
            guardarAtajos();
            renderizarAtajos();
        }
    }

    function seleccionarAtajo(atajo) {
        alert(`Turno seleccionado: ${atajo}`);
        // Aquí puedes integrar la lógica de tu aplicación para aplicar el turno seleccionado al día correspondiente
    }

    // Inicializar al cargar la página
    window.onload = function() {
        cargarAtajos();
        renderizarAtajos();
    };
</script>

</body>
</html>
