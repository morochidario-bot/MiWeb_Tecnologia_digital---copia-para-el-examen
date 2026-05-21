// 1. CARGAR DATOS DE LA BASE DE DATOS
function cargarDatos() {
    fetch('/datos-panel')
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('tabla-datos');
            tbody.innerHTML = '';
            
            data.forEach(item => {
                const esEntregado = item.estado === 'Entregado';
                const claseSaldo = item.Saldo > 0 ? 'saldo-rojo' : 'saldo-verde';
                
                let claseEstado = 'estado-revision';
                if(item.estado === 'Reparado') claseEstado = 'estado-reparado';
                if(item.estado === 'Entregado') claseEstado = 'estado-entregado';

                tbody.innerHTML += `
                    <tr class="${claseEstado}">
                        <td>
                            <button class="btn btn-print" onclick="imprimirPDF('${item.N_serie}')">
                                📄 PDF
                            </button>
                        </td>
                        <td><strong>${item.N_serie}</strong></td>
                        <td>
                            <b>${item.cliente}</b><br>
                            <small>📱 ${item.Celular || 'N/A'}</small>
                        </td>
                        <td>
                            ${item.equipo}<br>
                            <small>${item.marca || ''} ${item.modelo || ''}</small>
                        </td>
                        <td>${item.Falla_del_equipo}</td>

                        <!-- NUEVA COLUMNA: TOTAL (Presupuesto inicial) -->
                        <td style="color: #666;">
                            <b>$${parseFloat(item.Total).toFixed(2)}</b>
                        </td>

                        <td class="${claseSaldo}">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <b>$${parseFloat(item.Saldo).toFixed(2)}</b>
                                <button onclick="editarSaldo('${item.N_serie}', ${item.Saldo})" 
                                        style="border:none; background:none; cursor:pointer; font-size: 14px;" 
                                        title="Registrar Abono">
                                    📝
                                </button>
                            </div>
                        </td>
                        <td>
                            <select onchange="actualizarEstado('${item.N_serie}', this.value)">
                                <option value="En revisión" ${item.estado === 'En revisión' ? 'selected' : ''}>En revisión</option>
                                <option value="Reparado" ${item.estado === 'Reparado' ? 'selected' : ''}>Reparado</option>
                                <option value="Entregado" ${item.estado === 'Entregado' ? 'selected' : ''}>Entregado</option>
                            </select>
                        </td>
                        <td>
                            <button 
                                class="btn btn-delete" 
                                onclick="eliminarOrden('${item.N_serie}')" 
                                ${esEntregado ? '' : 'disabled'}
                            >
                                🗑️ Borrar
                            </button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(err => console.error("Error al cargar datos:", err));
}

// 2. ACTUALIZAR ESTADO
function actualizarEstado(n_serie, nuevoEstado) {
    fetch('/actualizar-estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n_serie: n_serie, nuevo_estado: nuevoEstado })
    })
    .then(res => res.text())
    .then(msg => {
        console.log("Servidor:", msg);
        cargarDatos(); 
    })
    .catch(err => alert("Error al actualizar estado"));
}

// 3. EDITAR SALDO (ABONO AUTOMÁTICO)
function editarSaldo(n_serie, saldoActual) {
    const abonoExtra = prompt(`Saldo pendiente actual: $${saldoActual.toFixed(2)}\n\n¿Cuánto dinero está abonando el cliente?`);
    
    if (abonoExtra !== null && !isNaN(abonoExtra) && abonoExtra.trim() !== "") {
        const montoAbonado = parseFloat(abonoExtra);
        
        if (montoAbonado > saldoActual) {
            alert(`❌ Error: No puedes abonar $${montoAbonado} porque la deuda es de solo $${saldoActual}.`);
            return;
        }

        const nuevoSaldo = saldoActual - montoAbonado;

        fetch('/actualizar-saldo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                n_serie: n_serie, 
                saldo: nuevoSaldo 
            })
        })
        .then(res => {
            if (res.ok) {
                alert(`✅ Abono de $${montoAbonado.toFixed(2)} registrado.\nNuevo saldo pendiente: $${nuevoSaldo.toFixed(2)}`);
                cargarDatos();
            } else {
                alert("Error al procesar el abono en el servidor.");
            }
        })
        .catch(err => console.error("Error:", err));
    }
}

// 4. ELIMINAR ORDEN
function eliminarOrden(n_serie) {
    if (confirm(`¿Estás seguro de eliminar permanentemente la orden ${n_serie}?`)) {
        fetch(`/eliminar-orden/${n_serie}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    alert("Orden eliminada correctamente.");
                    cargarDatos();
                } else {
                    alert("No se pudo eliminar.");
                }
            })
            .catch(err => console.error("Error:", err));
    }
}

// 5. GENERAR E IMPRIMIR PDF
function imprimirPDF(n_serie) {
    fetch(`/datos-orden/${n_serie}`)
        .then(res => res.json())
        .then(data => {
            const ventana = window.open('', '_blank');
            ventana.document.write(`
                <html>
                <head>
                    <title>Orden de Trabajo - ${data.N_serie}</title>
                    <style>
                        @media print {
                            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        }
                        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                        .contenedor-orden {
                            position: relative;
                            width: 21cm;
                            height: 29.7cm;
                            margin: auto;
                            background-image: url('orden.jpg');
                            background-size: contain;
                            background-repeat: no-repeat;
                        }
                        .dato {
                            position: absolute;
                            font-size: 14px;
                            color: #000;
                            font-weight: bold;
                            text-transform: uppercase;
                        }
                        .nombre { top: 158px; left: 85px; }
                        .cedula { top: 156px; left: 390px; }
                        .direccion { top: 176px; left: 85px; }
                        .celular { top: 174px; left: 390px; }
                        .equipo { top: 211px; left: 85px; }
                        .falla { top: 211px; left: 430px; width: 330px; white-space: normal; line-height: 1.1; }
                        .marca { top: 230px; left: 85px; }
                        .modelo { top: 247px; left: 85px; }
                        .serie_equipo { top: 265px; left: 85px; }
                        .accesorios { top: 283px; left: 115px; width: 650px; white-space: normal; }
                        .abono { top: 318px; left: 100px; }
                        .saldo { top: 318px; left: 345px; color: blue; }
                        .total { top: 318px; left: 580px; }
                    </style>
                </head>
                <body>
                    <div class="contenedor-orden">
                        <div class="dato nombre">${data.Nombre}</div>
                        <div class="dato cedula">${data.Cedula}</div>
                        <div class="dato direccion">${data.Direccion}</div>
                        <div class="dato celular">${data.Celular}</div>
                        <div class="dato equipo">${data.equipo}</div>
                        <div class="dato falla">${data.Falla_del_equipo}</div>
                        <div class="dato marca">${data.marca}</div>
                        <div class="dato modelo">${data.modelo}</div>
                        <div class="dato serie_equipo">${data.N_serie}</div>
                        <div class="dato accesorios">${data.accesorios || 'NINGUNO'}</div>
                        <div class="dato abono">$${parseFloat(data.Abono).toFixed(2)}</div>
                        <div class="dato saldo">$${parseFloat(data.Saldo).toFixed(2)}</div>
                        <div class="dato total">$${parseFloat(data.Total).toFixed(2)}</div>
                    </div>
                    <script>
                        window.onload = function() {
                            setTimeout(() => { window.print(); }, 500);
                        };
                    <\/script>
                </body>
                </html>
            `);
            ventana.document.close();
        })
        .catch(err => alert("Error al generar el PDF"));
}

document.addEventListener('DOMContentLoaded', cargarDatos);