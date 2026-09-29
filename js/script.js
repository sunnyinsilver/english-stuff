// ============================================
// CONFIGURACIÓN QUE EL ALUMNO PUEDE EDITAR A MANO
// ============================================

// Cotización del dólar blue: es un valor FIJO, no se actualiza solo.
// Hay que venir de vez en cuando a cambiar este número a mano si quieren
// que el precio en dólares del sitio esté más actualizado.
const COTIZACION_DOLAR_BLUE = 1200; // <-- TAREA: actualizá este número

// Número de WhatsApp donde van a llegar los pedidos (con código de país, sin + ni espacios).
// Ejemplo Argentina: 54 9 + código de área sin el 0 + número sin el 15.
const NUMERO_WHATSAPP = "5493765000000"; // <-- TAREA: reemplazá por un número real o ficticio


// ============================================
// MENÚ ACTIVO SEGÚN LA PÁGINA ACTUAL
// (funciona igual en las 7 páginas del sitio)
// ============================================
const enlacesNav = document.querySelectorAll("nav a");
const paginaActual = window.location.pathname.split("/").pop();

enlacesNav.forEach(link => {
    if (link.getAttribute("href") === paginaActual) {
        link.classList.add("activo");
    }
});


// ============================================
// FUNCIONES DEL CARRITO (se usan en varias páginas)
// El carrito se guarda en localStorage: por eso los productos
// agregados en productos.html siguen estando al entrar a carrito.html.
// Cada producto guardado tiene: { nombre, precioArs, cantidad }
// El precio en dólares NUNCA se guarda: se calcula siempre al mostrarlo,
// dividiendo precioArs por COTIZACION_DOLAR_BLUE.
// ============================================

function leerCarrito() {
    const datos = localStorage.getItem("carrito");
    return datos ? JSON.parse(datos) : [];
}

function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorNav();
}

function actualizarContadorNav(conAnimacion = false) {
    const contador = document.getElementById("contador-nav");
    if (!contador) return;

    const carrito = leerCarrito();
    const totalItems = carrito.reduce((suma, item) => suma + item.cantidad, 0);
    contador.textContent = totalItems > 0 ? `(${totalItems})` : "";

    if (conAnimacion) {
        contador.classList.remove("bump"); // por si quedó de una animación anterior
        void contador.offsetWidth; // truco para poder repetir la animación seguida
        contador.classList.add("bump");
    }
}

actualizarContadorNav();


// ============================================
// MODALES DE AVISO (reemplazan a los alert() del navegador)
// Funcionan en cualquier página: buscan un modal por su id, lo muestran
// o lo ocultan cambiando su "display". El botón "Aceptar / OK" de cada
// modal ya viene conectado para cerrarlo solo.
// ============================================

function mostrarModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) modal.style.display = "flex";
}

// Conecta el botón "Aceptar / OK" de todos los modales presentes en la página
document.querySelectorAll(".modal-overlay").forEach(modal => {
    const boton = modal.querySelector(".modal-cerrar");
    if (boton) {
        boton.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }
});


// ============================================
// FAQ (acordeón) — página info.html
// Si la página no tiene ninguna pregunta (querySelectorAll vacío),
// este bloque simplemente no hace nada, sin generar errores.
// ============================================
document.querySelectorAll(".acordeon-faq").forEach(boton => {
    boton.addEventListener("click", () => {
        const panel = boton.nextElementSibling;
        panel.style.display = panel.style.display === "block" ? "none" : "block";
    });
});


// ============================================
// PÁGINA productos.html: buscador + selector de cantidad + agregar al carrito
// ============================================
const tarjetasProducto = document.querySelectorAll(".tarjeta-producto");

if (tarjetasProducto.length > 0) {

    // --- Mostrar el precio en dólares calculado automáticamente ---
    tarjetasProducto.forEach(tarjeta => {
        const precioArs = parseFloat(tarjeta.dataset.precioArs);
        const precioUsd = (precioArs / COTIZACION_DOLAR_BLUE).toFixed(2);
        const spanUsd = tarjeta.querySelector(".precio-usd-auto");
        if (spanUsd) {
            spanUsd.textContent = `/ U$D ${precioUsd} (blue)`;
        }
    });

    // --- Buscador: oculta las tarjetas cuyo nombre no coincide con lo escrito ---
    const inputBuscar = document.getElementById("input-buscar");
    const mensajeSinResultados = document.getElementById("sin-resultados");

    if (inputBuscar) {
        inputBuscar.addEventListener("input", () => {
            const texto = inputBuscar.value.trim().toLowerCase();
            let algunoVisible = false;

            tarjetasProducto.forEach(tarjeta => {
                const nombre = tarjeta.dataset.nombre.toLowerCase();
                const coincide = nombre.includes(texto);
                tarjeta.style.display = coincide ? "" : "none";
                if (coincide) algunoVisible = true;
            });

            mensajeSinResultados.style.display = algunoVisible ? "none" : "block";
        });
    }

    // --- Selector de cantidad y botón "Agregar al carrito" ---
    tarjetasProducto.forEach(tarjeta => {
        const inputCantidad = tarjeta.querySelector(".input-cantidad");
        const botonesCantidad = tarjeta.querySelectorAll(".btn-cantidad");
        const botonAgregar = tarjeta.querySelector(".boton-agregar");
        const textoOriginalBoton = botonAgregar.textContent;

        botonesCantidad.forEach(boton => {
            boton.addEventListener("click", () => {
                let valorActual = parseInt(inputCantidad.value) || 1;
                if (boton.dataset.accion === "sumar") {
                    valorActual++;
                } else if (valorActual > 1) {
                    valorActual--;
                }
                inputCantidad.value = valorActual;
            });
        });

        inputCantidad.addEventListener("change", () => {
            if (parseInt(inputCantidad.value) < 1 || isNaN(parseInt(inputCantidad.value))) {
                inputCantidad.value = 1;
            }
        });

        botonAgregar.addEventListener("click", () => {
            const nombre = tarjeta.dataset.nombre;
            const precioArs = parseFloat(tarjeta.dataset.precioArs);
            const cantidad = parseInt(inputCantidad.value) || 1;

            const carrito = leerCarrito();
            const itemExistente = carrito.find(item => item.nombre === nombre);
            if (itemExistente) {
                itemExistente.cantidad += cantidad;
            } else {
                carrito.push({ nombre, precioArs, cantidad });
            }

            guardarCarrito(carrito);
            actualizarContadorNav(true); // true = con animación de "bump"

            botonAgregar.classList.add("agregado");
            botonAgregar.textContent = "¡Agregado! / Added!";
            setTimeout(() => {
                botonAgregar.classList.remove("agregado");
                botonAgregar.textContent = textoOriginalBoton;
            }, 1000);
        });
    });
}


// ============================================
// PÁGINA carrito.html: tabla, cantidad, quitar, total, moneda,
// WhatsApp, checkout y confirmación del pedido
// ============================================
const cuerpoCarrito = document.getElementById("cuerpo-carrito");

if (cuerpoCarrito) {

    const tabla = document.getElementById("tabla-carrito");
    const mensajeVacio = document.getElementById("carrito-vacio");
    const totalSpan = document.getElementById("total-carrito");
    const botonVaciar = document.getElementById("vaciar-carrito");
    const botonWhatsapp = document.getElementById("boton-whatsapp");
    const botonFinalizar = document.getElementById("boton-finalizar");
    const radiosMoneda = document.querySelectorAll('input[name="moneda"]');

    function formatearPrecio(numero) {
        return numero.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }

    function monedaSeleccionada() {
        const radioMarcado = document.querySelector('input[name="moneda"]:checked');
        return radioMarcado ? radioMarcado.value : "ars";
    }

    // Calcula el precio unitario de un item según la moneda elegida
    function precioSegunMoneda(item, moneda) {
        return moneda === "ars" ? item.precioArs : item.precioArs / COTIZACION_DOLAR_BLUE;
    }

    function calcularTotalCarrito(moneda) {
        const carrito = leerCarrito();
        return carrito.reduce((suma, item) => suma + precioSegunMoneda(item, moneda) * item.cantidad, 0);
    }

    function renderizarCarrito() {
        const carrito = leerCarrito();
        const moneda = monedaSeleccionada();
        cuerpoCarrito.innerHTML = "";

        if (carrito.length === 0) {
            tabla.style.display = "none";
            mensajeVacio.style.display = "block";
            totalSpan.textContent = "0";
            return;
        }

        tabla.style.display = "table";
        mensajeVacio.style.display = "none";

        const simbolo = moneda === "ars" ? "$" : "U$D";
        let total = 0;

        carrito.forEach((item, indice) => {
            const precioUnitario = precioSegunMoneda(item, moneda);
            const subtotal = precioUnitario * item.cantidad;
            total += subtotal;

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${item.nombre}</td>
                <td>${simbolo} ${formatearPrecio(precioUnitario)}</td>
                <td><input type="number" class="cantidad-carrito" min="1" value="${item.cantidad}" data-indice="${indice}"></td>
                <td>${simbolo} ${formatearPrecio(subtotal)}</td>
                <td><button class="item-quitar-carrito" data-indice="${indice}">Quitar / Remove</button></td>
            `;
            cuerpoCarrito.appendChild(fila);
        });

        totalSpan.textContent = `${simbolo} ${formatearPrecio(total)}`;

        document.querySelectorAll(".cantidad-carrito").forEach(input => {
            input.addEventListener("change", () => {
                const carritoActual = leerCarrito();
                const indice = parseInt(input.dataset.indice);
                let nuevaCantidad = parseInt(input.value);
                if (isNaN(nuevaCantidad) || nuevaCantidad < 1) nuevaCantidad = 1;
                carritoActual[indice].cantidad = nuevaCantidad;
                guardarCarrito(carritoActual);
                renderizarCarrito();
            });
        });

        document.querySelectorAll(".item-quitar-carrito").forEach(boton => {
            boton.addEventListener("click", () => {
                const carritoActual = leerCarrito();
                const indice = parseInt(boton.dataset.indice);
                carritoActual.splice(indice, 1);
                guardarCarrito(carritoActual);
                renderizarCarrito();
            });
        });
    }

    radiosMoneda.forEach(radio => radio.addEventListener("change", renderizarCarrito));

    botonVaciar.addEventListener("click", () => {
        if (leerCarrito().length === 0) {
            mostrarModal("modal-vaciar-vacio");
            return;
        }
        guardarCarrito([]);
        renderizarCarrito();
    });

    renderizarCarrito();


    // --- Botón "Enviar pedido por WhatsApp" ---
    // Arma un mensaje de texto con el detalle del carrito y abre WhatsApp con ese texto ya escrito.
    botonWhatsapp.addEventListener("click", () => {
        const carrito = leerCarrito();
        if (carrito.length === 0) {
            mostrarModal("modal-whatsapp-vacio");
            return;
        }

        const moneda = monedaSeleccionada();
        const simbolo = moneda === "ars" ? "$" : "U$D";

        let mensaje = "¡Hola! Quiero hacer este pedido:\n\n";
        carrito.forEach(item => {
            const precioUnitario = precioSegunMoneda(item, moneda);
            mensaje += `• ${item.cantidad}x ${item.nombre} — ${simbolo} ${formatearPrecio(precioUnitario * item.cantidad)}\n`;
        });
        mensaje += `\nTotal: ${simbolo} ${formatearPrecio(calcularTotalCarrito(moneda))}`;

        const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
    });


    // --- Botón "Finalizar compra": muestra el formulario de checkout ---
    const seccionCarrito = document.getElementById("carrito");
    const seccionCheckout = document.getElementById("checkout");
    const seccionConfirmacion = document.getElementById("confirmacion");

    botonFinalizar.addEventListener("click", () => {
        const carrito = leerCarrito();
        if (carrito.length === 0) {
            mostrarModal("modal-checkout-vacio");
            return;
        }
        seccionCarrito.style.display = "none";
        seccionCheckout.style.display = "block";
    });


    // --- Mostrar/ocultar los datos de transferencia según la forma de pago elegida ---
    const radiosFormaPago = document.querySelectorAll('input[name="forma-pago"]');
    const datosTransferencia = document.getElementById("datos-transferencia");

    radiosFormaPago.forEach(radio => {
        radio.addEventListener("change", () => {
            datosTransferencia.style.display = radio.value === "transferencia" && radio.checked ? "block" : "none";
        });
    });


    // --- Mostrar el nombre del archivo elegido como comprobante ---
    const inputComprobante = document.getElementById("checkout-comprobante");
    const nombreComprobanteTexto = document.getElementById("nombre-comprobante");

    inputComprobante.addEventListener("change", () => {
        if (inputComprobante.files.length > 0) {
            nombreComprobanteTexto.textContent = `Archivo adjuntado: ${inputComprobante.files[0].name}`;
        } else {
            nombreComprobanteTexto.textContent = "";
        }
    });


    // --- Enviar el formulario: arma y muestra el ticket de confirmación ---
    const formularioCheckout = document.getElementById("formulario-checkout");

    formularioCheckout.addEventListener("submit", (evento) => {
        evento.preventDefault(); // evita que la página se recargue al enviar el formulario

        const nombreCliente = document.getElementById("checkout-nombre").value;
        const direccionCliente = document.getElementById("checkout-direccion").value;
        const contactoCliente = document.getElementById("checkout-contacto").value;
        const formaPago = document.querySelector('input[name="forma-pago"]:checked').value;
        const moneda = monedaSeleccionada();
        const simbolo = moneda === "ars" ? "$" : "U$D";
        const carrito = leerCarrito();

        // Generamos un número de pedido de ejemplo (no es un número real de ningún sistema)
        const numeroPedido = Math.floor(10000 + Math.random() * 90000);
        const fechaHoy = new Date().toLocaleString("es-AR");

        document.getElementById("conf-numero").textContent = numeroPedido;
        document.getElementById("conf-fecha").textContent = fechaHoy;
        document.getElementById("conf-nombre").textContent = nombreCliente;
        document.getElementById("conf-direccion").textContent = direccionCliente;
        document.getElementById("conf-contacto").textContent = contactoCliente;
        document.getElementById("conf-pago").textContent = formaPago === "efectivo" ? "Efectivo / Cash" : "Transferencia / Bank transfer";

        // Si pagó por transferencia y adjuntó un archivo, lo mostramos; si no, ocultamos esa línea
        const lineaComprobante = document.getElementById("conf-comprobante-linea");
        if (formaPago === "transferencia" && inputComprobante.files.length > 0) {
            document.getElementById("conf-comprobante").textContent = inputComprobante.files[0].name;
            lineaComprobante.style.display = "block";
        } else {
            lineaComprobante.style.display = "none";
        }

        // Armamos la lista de productos del ticket
        const listaItems = document.getElementById("conf-items");
        listaItems.innerHTML = "";
        carrito.forEach(item => {
            const precioUnitario = precioSegunMoneda(item, moneda);
            const li = document.createElement("li");
            li.innerHTML = `<span>${item.cantidad}x ${item.nombre}</span><span>${simbolo} ${formatearPrecio(precioUnitario * item.cantidad)}</span>`;
            listaItems.appendChild(li);
        });

        document.getElementById("conf-total").textContent = `${simbolo} ${formatearPrecio(calcularTotalCarrito(moneda))}`;

        seccionCheckout.style.display = "none";
        seccionConfirmacion.style.display = "block";

        // Al confirmar el pedido, vaciamos el carrito (ya quedó registrado en el ticket)
        guardarCarrito([]);
    });


    // --- Botón "Descargar comprobante": convierte el ticket en una imagen y la descarga ---
    // Usamos la librería html2canvas (cargada desde un CDN en carrito.html) que "fotografía"
    // cualquier elemento HTML y lo convierte en una imagen de alta calidad.
    document.getElementById("boton-descargar-comprobante").addEventListener("click", () => {
        const ticket = document.getElementById("ticket-confirmacion");
        const numeroPedido = document.getElementById("conf-numero").textContent;

        html2canvas(ticket, {
            scale: 3, // triplica la resolución para que la imagen se vea nítida
            backgroundColor: "#ffffff"
        }).then(canvas => {
            const enlace = document.createElement("a");
            enlace.download = `comprobante-pedido-${numeroPedido}.png`;
            enlace.href = canvas.toDataURL("image/png");
            enlace.click();
        });
    });


    document.getElementById("boton-nuevo-pedido").addEventListener("click", () => {
        seccionConfirmacion.style.display = "none";
        seccionCarrito.style.display = "block";
        formularioCheckout.reset();
        datosTransferencia.style.display = "none";
        nombreComprobanteTexto.textContent = "";
        renderizarCarrito();
    });
}
