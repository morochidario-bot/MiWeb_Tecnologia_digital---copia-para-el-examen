document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistema Multi-Cuenta Tecnología Digital listo... 🚀");

    // 1. GESTIÓN DE SESIÓN Y MULTI-CUENTAS
    const userDisplayName = document.getElementById('user-display-name');
    const accountsList = document.getElementById('accounts-list');
    
    const usuarioActual = localStorage.getItem('usuarioLogueado');
    const todasLasCuentas = JSON.parse(localStorage.getItem('cuentasActivas')) || [];

    if (usuarioActual && userDisplayName) {
       
        userDisplayName.innerText = usuarioActual;

        if (accountsList) {
            accountsList.innerHTML = ''; 
            
            todasLasCuentas.forEach(cuenta => {
                const esActual = cuenta === usuarioActual;
                const item = document.createElement('li');
                item.className = 'account-item';
                item.style.cursor = 'pointer';
                item.innerHTML = `
                    <span class="status-dot" style="background-color: ${esActual ? '#25D366' : '#555'}"></span>
                    <span class="acc-name">${cuenta} ${esActual ? '(Actual)' : ''}</span>
                `;
                
                item.onclick = () => {
                    localStorage.setItem('usuarioLogueado', cuenta);
                    window.location.reload();
                };
                
                accountsList.appendChild(item);
            });
        }
    }

    // 2. CONTROL DEL MENÚ (DROPDOWN)
    const userTrigger = document.getElementById('user-trigger');
    const dropdown = document.getElementById('account-dropdown');

    if (userTrigger && dropdown) {
        userTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        window.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });
    }

    // 3. CALCULADORA DE MANTENIMIENTo
    const inputAbono = document.getElementById('pos-abono');
    const inputTotal = document.getElementById('pos-total');
    const inputSaldo = document.getElementById('pos-saldo');

    if (inputAbono && inputTotal && inputSaldo) {
        const calcularSaldo = () => {
            const total = parseFloat(inputTotal.value) || 0;
            const abono = parseFloat(inputAbono.value) || 0;
            inputSaldo.value = (total - abono).toFixed(2);
        };

        inputAbono.addEventListener('input', calcularSaldo);
        inputTotal.addEventListener('input', calcularSaldo);
    }

    // 4. CERRAR SESIÓN (LIMPIAR TODO)
    const btnLogout = document.getElementById('btn-logout-all');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear(); 
            window.location.href = 'index.html';
        });
    }
});
// MAGIA PARA DESBLOQUEAR LA SECCIÓN DE LA LONA AL DAR CLIC EN EL BOTÓN
document.addEventListener("DOMContentLoaded", () => {
    const btnMasInfo = document.querySelector(".btn-cotizar");
    const seccionBanner = document.getElementById("servicios-tecnicos");

    if (btnMasInfo && seccionBanner) {
        btnMasInfo.addEventListener("click", (e) => {
            e.preventDefault(); // Evita el salto brusco del navegador
            
            // 1. Le ponemos la clase que cambia el display:none por display:flex y mete el sombreado
            seccionBanner.classList.add("mostrar");
            
            // 2. Hace el salto de página deslizándose suavecito hacia la sección
            seccionBanner.scrollIntoView({ behavior: "smooth" });
        });
    }
});