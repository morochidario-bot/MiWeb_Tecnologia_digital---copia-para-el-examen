document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('contenedor-productos');

    const cargarProductos = async () => {
        try {
            const response = await fetch('/obtener-productos');
            const productos = await response.json();

            if (productos.length === 0) {
                contenedor.innerHTML = `<p style="color: gray; text-align: center; width: 100%;">No hay productos en el catálogo aún.</p>`;
                return;
            }

            contenedor.innerHTML = ''; 

            productos.forEach(p => {
                const card = document.createElement('div');
                // Estilo directo a la tarjeta para que no crezca
                card.style.cssText = "width: 280px; background: #161616; border: 1px solid #333; border-radius: 12px; overflow: hidden; margin: 15px; display: inline-block; vertical-align: top; text-align: center;";

                card.innerHTML = `
                    <div style="width: 100%; height: 200px; overflow: hidden; background: #000;">
                        <img src="${p.imagen_url}" 
                             style="width: 100% !important; height: 100% !important; object-fit: cover !important; display: block;">
                    </div>
                    <div style="padding: 15px;">
                        <span style="color: #777; font-size: 12px; text-transform: uppercase;">${p.marca || 'Genérico'}</span>
                        <h3 style="color: #3498db; margin: 5px 0; font-size: 18px;">${p.nombre_equipo}</h3>
                        <p style="color: #2ecc71; font-weight: bold; font-size: 20px; margin: 10px 0;">$${parseFloat(p.precio).toFixed(2)}</p>
                        <p style="color: #bbb; font-size: 13px;">Stock: ${p.stock}</p>
                        <button style="width: 100%; padding: 10px; background: #3498db; border: none; color: white; border-radius: 5px; cursor: pointer; margin-top: 10px;">Comprar</button>
                    </div>
                `;
                contenedor.appendChild(card);
            });

        } catch (error) {
            console.error("Error:", error);
            contenedor.innerHTML = `<p style="color: red;">Error al conectar con el servidor.</p>`;
        }
    };

    cargarProductos();
});