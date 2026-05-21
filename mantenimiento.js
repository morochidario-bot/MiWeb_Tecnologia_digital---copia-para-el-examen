document.addEventListener("DOMContentLoaded", async () => {
    const inputNombre = document.getElementById("pos-nombre");
    const datalist = document.getElementById("lista-clientes");
    
    // Almacén local para guardar los clientes que vienen del servidor
    let listaClientes = [];

    // 1. Llamamos a la API en app.js para traer los clientes existentes
    try {
        const respuesta = await fetch('/api/clientes-autocompletar');
        if (respuesta.ok) {
            listaClientes = await respuesta.json();
            
            // Llenamos el <datalist> con los nombres para que Chrome/Brave los sugieran
            listaClientes.forEach(cliente => {
                if (cliente.Nombre) {
                    const option = document.createElement("option");
                    option.value = cliente.Nombre;
                    datalist.appendChild(option);
                }
            });
        }
    } catch (error) {
        console.error("Error cargando los clientes para el autocompletado:", error);
    }

    // 2. Monitoreamos cuando el usuario escribe o selecciona un nombre
    inputNombre.addEventListener("input", (e) => {
        const nombreIngresado = e.target.value.trim();

        // Buscamos si el nombre coincide exactamente con alguien de la base de datos
        const clienteEncontrado = listaClientes.find(
            cliente => cliente.Nombre.toLowerCase() === nombreIngresado.toLowerCase()
        );

        if (clienteEncontrado) {
            // ¡Inyección instantánea de los datos del cliente!
            document.getElementById("pos-cedula").value = clienteEncontrado.Cedula || '';
            document.getElementById("pos-direccion").value = clienteEncontrado.Direccion || '';
            document.getElementById("pos-celular").value = clienteEncontrado.Celular || '';
        }
    });
});