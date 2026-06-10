// Arreglo global para almacenar los objetos con los datos de los aparatos
let registroConsumos = []; 

// Coste fijo del Kilovatio-hora empleado para la estimación económica
const PRECIO_KWH_ESTANDAR = 0.19; 

// Captura de elementos del DOM para la escucha de eventos e inserción de datos
const formConsumo = document.getElementById('form-consumo');
const cuerpoTabla = document.getElementById('cuerpo-tabla');
const btnExportar = document.getElementById('btn-exportar');

// Captura los datos del formulario, realiza los cálculos de consumo y los guarda
formConsumo.addEventListener('submit', function(evento) {
    evento.preventDefault(); 

    const nombreAparato = document.getElementById('aparato').value.trim();
    const horasUso = parseFloat(document.getElementById('horas').value);
    const vatiosInput = parseFloat(document.getElementById('consumo').value);

    // Validación para impedir el registro de valores nulos, vacíos o negativos
    if (!nombreAparato || isNaN(horasUso) || isNaN(vatiosInput) || horasUso <= 0 || vatiosInput <= 0 || horasUso > 24) {
        alert("Por favor, introduce valores correctos y mayores a cero.");
        return;
    }

    // Cálculos energéticos: Conversión de Vatios a kW y proyección a coste mensual (30 días)
    const potenciaKW = vatiosInput / 1000; 
    const kwhDia = potenciaKW * horasUso; 
    const gastoMensual = kwhDia * 30 * PRECIO_KWH_ESTANDAR; 

    // Evaluación del rango de consumo para asignar la clase CSS e imagen del semáforo
    let clasificacion = "";
    let imagenRuta = "";
    let claseCSS = "";

    // CONFIGURACIÓN CON TUS DOS NUEVOS ICONOS .PNG
    if (kwhDia < 2) {
        clasificacion = "Bajo";
        imagenRuta = "img/bajo.png";   // Primer icono personalizado
        claseCSS = "consumo-bajo";
    } else if (kwhDia >= 2 && kwhDia <= 8) {
        clasificacion = "Medio";
        imagenRuta = "img/alto.png";   // Segundo icono asignado al rango intermedio
        claseCSS = "consumo-medio";
    } else {
        clasificacion = "Alto";
        imagenRuta = "img/alto.png";   // Segundo icono personalizado
        claseCSS = "consumo-alto";
    }

    // Inserción del nuevo registro calculado dentro de la lista de control
    registroConsumos.push({
        aparato: nombreAparato,
        horas: horasUso,
        vatios: vatiosInput,
        gasto: gastoMensual,
        clase: clasificacion,
        img: imagenRuta,
        css: claseCSS
    });

    formConsumo.reset();
    renderizarTabla();
});

// Limpia el contenedor de la tabla y genera las filas dinámicamente con innerHTML
function renderizarTabla() {
    cuerpoTabla.innerHTML = ""; 

    registroConsumos.forEach(item => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><strong>${item.aparato}</strong></td>
            <td>${item.horas.toFixed(1)} h/día</td>
            <td>${item.vatios.toFixed(0)} W</td>
            <td>${item.gasto.toFixed(2)} €/mes</td>
            <td class="${item.css}">
                <img src="${item.img}" alt="${item.clase}" class="indicador-estado" style="width:14px; height:14px; margin-right:8px; vertical-align:middle;">
                ${item.clase}
            </td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

// Estructura las filas almacenadas en formato de texto plano y procesa la descarga del archivo CSV
btnExportar.addEventListener('click', function() {
    if (registroConsumos.length === 0) {
        alert("La tabla está vacía. Registra algún aparato antes de exportar.");
        return;
    }

    let contenidoCSV = "Aparato;Horas/Dia;Consumo (W);Gasto Mensual Estimado (Euros);Clasificacion\n";
    
    registroConsumos.forEach(item => {
        contenidoCSV += `"${item.aparato}";${item.horas.toFixed(1)};${item.vatios.toFixed(0)};${item.gasto.toFixed(2)};"${item.clase}"\n`;
    });

    // Generación del objeto binario y disparo de la descarga automática del navegador
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Reporte_Consumo_Electrico.csv';
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});