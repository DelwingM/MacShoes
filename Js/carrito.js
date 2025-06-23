document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const elements = {
        listaCarrito: document.getElementById('lista-carrito'),
        totalElement: document.getElementById('total'),
        contadorCarrito: document.getElementById('contador-carrito'),
        botonVaciar: document.getElementById('vaciar-carrito'),
        botonPagar: document.getElementById('pagar-carrito'),
        buscador: document.getElementById('buscador'),
        filtroCategoria: document.getElementById('filtro-categoria'),
        contenedorProductos: document.getElementById('contenedor-productos')
    };

    // Variables de estado
    let productosOriginales = [];
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let visitasProductos = JSON.parse(localStorage.getItem('visitasProductos')) || {};

    // Inicialización
    /*inicializarProductos();
    actualizarCarrito();*/
    // Inicialización básica del carrito en todas las páginas
    actualizarCarrito();

    // Solo inicializar productos si estamos en la página de productos (index.html)
    if (elements.contenedorProductos) {
        inicializarProductos();
        setupEventListeners();
    } else {
        // Configurar solo los listeners del carrito para otras páginas
        if (elements.botonVaciar) elements.botonVaciar.addEventListener('click', vaciarCarrito);
        if (elements.botonPagar) elements.botonPagar.addEventListener('click', procesarPago);
    }



    // Configuración de event listeners
    setupEventListeners();

    // Funciones principales
    function inicializarProductos() {
        try {
            productosOriginales = Array.from(document.querySelectorAll('.producto'));

            productosOriginales.forEach(producto => {
                const productoId = producto.getAttribute('data-id');
                // Configurar evento de click para registrar visita
                producto.addEventListener('click', (e) => {
                    // Solo registrar visita si no se hizo click en un botón de agregar al carrito
                    if (!e.target.closest('.agregar-carrito')) {
                        registrarVisita(productoId);
                    }
                });
            });

            configurarEventosAgregarCarrito();
            actualizarContadoresVisitas(); // Actualizar todos los contadores al inicio
        } catch (error) {
            console.error('Error al inicializar productos:', error);
        }
    }

    function setupEventListeners() {
        if (elements.buscador) {
            elements.buscador.addEventListener('input', filtrarProductos);
        }
        if (elements.filtroCategoria) {
            elements.filtroCategoria.addEventListener('change', filtrarProductos);
        }
        if (elements.botonVaciar) {
            elements.botonVaciar.addEventListener('click', vaciarCarrito);
        }
        if (elements.botonPagar) {
            elements.botonPagar.addEventListener('click', procesarPago);
        }
    }

    function configurarEventosAgregarCarrito() {
        try {
            // Eliminar event listeners anteriores para evitar duplicados
            document.querySelectorAll('.agregar-carrito').forEach(boton => {
                boton.replaceWith(boton.cloneNode(true));
            });

            // Configurar nuevos listeners
            document.querySelectorAll('.agregar-carrito').forEach(boton => {
                boton.addEventListener('click', function(e) {
                    e.preventDefault();
                    agregarAlCarrito(e);
                });
            });
        } catch (error) {
            console.error('Error configurando eventos del carrito:', error);
        }
    }

    function agregarAlCarrito(e) {
        try {
            const producto = e.target.closest('.producto') ||
                e.target.parentElement.closest('.producto');

            if (!producto) {
                console.error('No se encontró el elemento producto');
                return;
            }

            // Obtener datos del producto
            const id = producto.getAttribute('data-id');
            if (!id) {
                console.error('Producto no tiene data-id');
                return;
            }

            const nombreElement = producto.querySelector('.card-title');
            const precioElement = producto.querySelector('.precio');

            if (!nombreElement || !precioElement) {
                console.error('Elementos nombre o precio no encontrados en el producto');
                return;
            }

            const nombre = nombreElement.textContent;
            const precioTexto = precioElement.textContent;
            const precio = parseFloat(precioTexto.replace(/[^0-9-]+/g, ''));

            if (isNaN(precio)) {
                console.error('Precio no válido:', precioTexto);
                return;
            }

            // Buscar producto en carrito
            const productoEnCarrito = carrito.find(item => item.id === id);

            // Animación del botón (si existe)
            const boton = e.target.closest('.agregar-carrito');
            if (boton) {
                boton.innerHTML = '<i class="fas fa-check"></i> Agregado';
                boton.classList.add('disabled');
                setTimeout(() => {
                    boton.innerHTML = '<i class="fas fa-cart-plus"></i> comprar';
                    boton.classList.remove('disabled');
                }, 1000);
            }

            // Actualizar carrito
            if (productoEnCarrito) {
                productoEnCarrito.cantidad++;
            } else {
                carrito.push({
                    id,
                    nombre,
                    precio,
                    cantidad: 1
                });
            }

            guardarCarrito();
            actualizarCarrito();
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
        }
    }

    function filtrarProductos() {
        try {
            if (!elements.contenedorProductos) return;

            const textoBusqueda = elements.buscador ? elements.buscador.value.toLowerCase() : '';
            const categoriaSeleccionada = elements.filtroCategoria ? elements.filtroCategoria.value : 'todas';
            elements.contenedorProductos.innerHTML = '';

            const productosFiltrados = {
                hombres: [],
                mujeres: []
            };

            // Filtrar productos
            productosOriginales.forEach(producto => {
                const nombreElement = producto.querySelector('.card-title');
                if (!nombreElement) return;

                const nombre = nombreElement.textContent.toLowerCase();
                const categoria = producto.getAttribute('data-categoria');
                const genero = producto.getAttribute('data-genero');

                const coincideBusqueda = textoBusqueda === '' || nombre.includes(textoBusqueda);
                const coincideCategoria = categoriaSeleccionada === 'todas' || categoria === categoriaSeleccionada;

                if (coincideBusqueda && coincideCategoria) {
                    const productoClonado = producto.cloneNode(true);
                    if (genero === 'hombre') {
                        productosFiltrados.hombres.push(productoClonado);
                    } else if (genero === 'mujer') {
                        productosFiltrados.mujeres.push(productoClonado);
                    }
                }
            });

            // Mostrar secciones
            mostrarSeccion('Hombres', productosFiltrados.hombres);
            mostrarSeccion('Mujeres', productosFiltrados.mujeres);

            // Configurar eventos para los nuevos productos filtrados
            configurarEventosAgregarCarrito();

            // Configurar eventos de click para visitas en los productos filtrados
            document.querySelectorAll('.producto').forEach(producto => {
                const productoId = producto.getAttribute('data-id');
                producto.addEventListener('click', (e) => {
                    if (!e.target.closest('.agregar-carrito')) {
                        registrarVisita(productoId);
                    }
                });
            });

            // Mostrar mensaje si no hay resultados
            if (productosFiltrados.hombres.length === 0 && productosFiltrados.mujeres.length === 0 &&
                (textoBusqueda !== '' || categoriaSeleccionada !== 'todas')) {
                mostrarMensajeNoResultados();
            }
        } catch (error) {
            console.error('Error filtrando productos:', error);
        }
    }

    function mostrarSeccion(titulo, productos) {
        try {
            if (!elements.contenedorProductos) return;

            if (productos.length > 0 ||
                ((!elements.buscador || elements.buscador.value === '') &&
                    (!elements.filtroCategoria || elements.filtroCategoria.value === 'todas'))) {
                const tituloSeccion = document.createElement('div');
                tituloSeccion.className = 'col-12' + (titulo === 'Mujeres' ? ' mt-4' : '');
                tituloSeccion.innerHTML = `<h2 class="mb-3">${titulo}</h2>`;
                elements.contenedorProductos.appendChild(tituloSeccion);

                productos.forEach(producto => {
                    const col = document.createElement('div');
                    col.className = 'col-md-3 mb-4';

                    // Actualizar contador antes de agregar
                    const productoId = producto.getAttribute('data-id');
                    if (productoId) {
                        const contador = producto.querySelector('.contador-visitas');
                        if (contador) {
                            contador.textContent = visitasProductos[productoId] || 0;
                        }
                    }

                    col.appendChild(producto);
                    elements.contenedorProductos.appendChild(col);
                });
            }
        } catch (error) {
            console.error('Error mostrando sección:', error);
        }
    }

    function mostrarMensajeNoResultados() {
        try {
            if (!elements.contenedorProductos) return;

            const noResults = document.createElement('div');
            noResults.className = 'col-12 text-center py-5';
            noResults.innerHTML = '<p class="text-muted">No se encontraron productos</p>';
            elements.contenedorProductos.appendChild(noResults);
        } catch (error) {
            console.error('Error mostrando mensaje de no resultados:', error);
        }
    }

    function actualizarCarrito() {
        try {
            if (!elements.listaCarrito || !elements.totalElement || !elements.contadorCarrito) {
                console.error('Elementos del carrito no encontrados');
                return;
            }

            elements.listaCarrito.innerHTML = '';
            let total = 0;
            let totalItems = 0;

            const formatearPrecio = (valor) => {
                return '$' + valor.toLocaleString('es-CO');
            };

            carrito.forEach((producto, index) => {
                const precioTotal = producto.precio * producto.cantidad;
                total += precioTotal;
                totalItems += producto.cantidad;

                const item = document.createElement('div');
                item.className = 'item-carrito';
                item.innerHTML = `
                    <span>${producto.nombre} x${producto.cantidad}</span>
                    <div>
                        <span class="text-muted precio">${formatearPrecio(precioTotal)}</span>
                        <button class="btn btn-sm btn-outline-danger ms-2 eliminar-item" data-index="${index}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                elements.listaCarrito.appendChild(item);
            });

            elements.totalElement.textContent = formatearPrecio(total);
            elements.contadorCarrito.textContent = totalItems;

            // Configurar eventos para eliminar
            document.querySelectorAll('.eliminar-item').forEach(boton => {
                boton.addEventListener('click', eliminarDelCarrito);
            });
        } catch (error) {
            console.error('Error actualizando carrito:', error);
        }
    }

    function eliminarDelCarrito(e) {
        try {
            const index = e.target.closest('button').getAttribute('data-index');
            carrito.splice(index, 1);
            guardarCarrito();
            actualizarCarrito();
        } catch (error) {
            console.error('Error eliminando del carrito:', error);
        }
    }

    function vaciarCarrito() {
        try {
            carrito = [];
            guardarCarrito();
            actualizarCarrito();
        } catch (error) {
            console.error('Error vaciando carrito:', error);
        }
    }

    function procesarPago() {
        try {
            if (carrito.length === 0) {
                mostrarAlerta('El Carrito está vacío', 'Agrega productos antes de pagar', 'warning');
                return;
            }

            // Crear copia segura del carrito
            const carritoParaPagar = carrito.map(item => ({
                id: item.id,
                nombre: item.nombre,
                precio: Number(item.precio),
                cantidad: Number(item.cantidad)
            }));

            // Guardar en localStorage y redirigir
            localStorage.setItem('carritoParaPagar', JSON.stringify(carritoParaPagar));
            window.location.href = 'pagar.html';
        } catch (error) {
            console.error('Error procesando pago:', error);
        }
    }

    function mostrarAlerta(titulo, mensaje, tipo) {
        try {
            const alerta = document.createElement('div');
            alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
            alerta.innerHTML = `
                <strong>${titulo}</strong> ${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(alerta);

            setTimeout(() => {
                alerta.classList.remove('show');
                setTimeout(() => alerta.remove(), 150);
            }, 3000);
        } catch (error) {
            console.error('Error mostrando alerta:', error);
        }
    }

    function guardarCarrito() {
        try {
            localStorage.setItem('carrito', JSON.stringify(carrito));
        } catch (error) {
            console.error('Error guardando carrito:', error);
        }
    }

    function registrarVisita(productoId) {
        if (!productoId) return;

        // Incrementar y guardar
        visitasProductos[productoId] = (visitasProductos[productoId] || 0) + 1;
        localStorage.setItem('visitasProductos', JSON.stringify(visitasProductos));

        // Actualizar todos los contadores del producto
        actualizarContadorVisitas(productoId);
    }

    function actualizarContadorVisitas(productoId) {
        try {
            // Buscar en productos originales y clonados
            const contadores = document.querySelectorAll(`.producto[data-id="${productoId}"] .contador-visitas`);
            contadores.forEach(contador => {
                contador.textContent = visitasProductos[productoId] || 0;
            });
        } catch (error) {
            console.error('Error actualizando contador de visitas:', error);
        }
    }

    function actualizarContadoresVisitas() {
        try {
            // Actualizar todos los contadores de visitas al inicio
            Object.keys(visitasProductos).forEach(productoId => {
                actualizarContadorVisitas(productoId);
            });
        } catch (error) {
            console.error('Error actualizando contadores de visitas:', error);
        }
    }
});