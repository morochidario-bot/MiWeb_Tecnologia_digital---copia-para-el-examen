document.addEventListener('DOMContentLoaded', () => {
    const userDisplayName = document.getElementById('user-display-name');
    const userTrigger = document.getElementById('user-trigger');
    const btnPanel = document.getElementById('btn-panel-admin');
    const accountsList = document.getElementById('accounts-list');
    const linkAñadir = document.getElementById('link-añadir-cuenta');

    fetch('/verificar-sesion')
        .then(response => response.json())
        .then(data => {
            if (data.logueado) {
                console.log("Sesión activa:", data.correo);

                // --- 1. NOMBRE CORTO (Sin el @gmail.com) ---
                // Si el correo es natasha@gmail.com, mostrará solo "Natasha"
                const nombreCorto = data.correo.split('@')[0];
                if (userDisplayName) {
                    userDisplayName.innerText = nombreCorto.charAt(0).toUpperCase() + nombreCorto.slice(1);
                }

                if (userTrigger) {
                    userTrigger.setAttribute('href', 'javascript:void(0)');
                    userTrigger.style.cursor = 'default';
                }

                // --- 2. MOSTRAR AÑADIR CUENTA ---
                // Si quieres que siempre aparezca, cámbialo a 'block'
                if (linkAñadir) linkAñadir.style.display = 'block'; 

                if (data.rol === 'admin' && btnPanel) btnPanel.style.display = 'inline-block';

                if (accountsList) {
                    accountsList.innerHTML = `
                        <li style="list-style: none; color: white; padding: 10px 0; display: flex; align-items: center; font-family: sans-serif;">
                            <span style="color: #2ecc71; margin-right: 10px;">●</span> 
                            ${data.correo} (Actual)
                        </li>`;
                }
            } else {
                if (userDisplayName) userDisplayName.innerText = "Iniciar Sesión";
                if (userTrigger) {
                    userTrigger.setAttribute('href', 'Iniciar S.html');
                    userTrigger.style.cursor = 'pointer';
                }
                if (btnPanel) btnPanel.style.display = 'none';
                if (linkAñadir) linkAñadir.style.display = 'block';
            }
        })
        .catch(err => console.error('Error:', err));
});

// El cierre de sesión (se queda igual porque ya funciona xd)
document.addEventListener('mousedown', (e) => {
    const logoutBtn = e.target.closest('#btn-logout');
    if (logoutBtn) {
        e.preventDefault();
        window.location.href = '/logout';
    }
});