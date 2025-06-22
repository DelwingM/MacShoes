document.addEventListener('DOMContentLoaded', () => {
    // Verificar si ya se inicializó
    if (window.pagoInicializado) return;
    window.pagoInicializado = true;

    const formatearPrecio = (valor) => {
        return '$' + parseInt(valor).toLocaleString('es-CO');
    };

    // Cargar carrito
    const carrito = JSON.parse(localStorage.getItem('carritoParaPagar')) || [];
    const listaProductos = document.getElementById('lista-productos');
    const subtotalElement = document.getElementById('subtotal');
    const impuestosElement = document.getElementById('impuestos');
    const totalPagarElement = document.getElementById('total-pagar');
    const terminarPagoBtn = document.getElementById('terminar-pago');

    // Verificar si hay productos
    if (carrito.length === 0) {
        if (listaProductos) {
            listaProductos.innerHTML = `
                <div class="alert alert-warning">
                    No hay productos en el carrito. <a href="index.html">Volver a la tienda</a>
                </div>
            `;
        }
        return;
    }

    // Mostrar productos y calcular totales
    let subtotal = 0;

    // Limpiar lista antes de agregar productos
    if (listaProductos) listaProductos.innerHTML = '';

    carrito.forEach(producto => {
        const precioTotal = producto.precio * producto.cantidad;
        subtotal += precioTotal;

        if (listaProductos) {
            const item = document.createElement('div');
            item.className = 'd-flex justify-content-between mb-3 border-bottom pb-2';
            item.innerHTML = `
                <div>
                    <h6 class="mb-1">${producto.nombre}</h6>
                    <small class="text-muted">${producto.cantidad} × ${formatearPrecio(producto.precio)}</small>
                </div>
                <span class="precio">${formatearPrecio(precioTotal)}</span>
            `;
            listaProductos.appendChild(item);
        }
    });

    // Calcular totales
    const impuestos = subtotal * 0.19;
    const total = subtotal + impuestos;

    if (subtotalElement) subtotalElement.textContent = formatearPrecio(subtotal);
    if (impuestosElement) impuestosElement.textContent = formatearPrecio(impuestos);
    if (totalPagarElement) totalPagarElement.textContent = formatearPrecio(total);

    // Generar número de pedido
    const numeroPedidoElement = document.getElementById('numero-pedido');
    if (numeroPedidoElement) {
        numeroPedidoElement.textContent = 'MS-' + Math.floor(100000 + Math.random() * 900000);
    }

    // Configurar botón de pago
    if (terminarPagoBtn) {
        terminarPagoBtn.addEventListener('click', function() {
            const boton = this;
            boton.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Procesando pago...
            `;
            boton.disabled = true;

            setTimeout(() => {
                localStorage.removeItem('carrito');
                localStorage.removeItem('carritoParaPagar');

                // Mostrar modal de confirmación
                const modalElement = document.getElementById('confirmacionModal');
                if (modalElement) {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();

                    // Redirigir al cerrar el modal
                    document.getElementById('volver-inicio').addEventListener('click', () => {
                        window.location.href = 'index.html';
                    });
                }
            }, 2000);
        });
    }
});