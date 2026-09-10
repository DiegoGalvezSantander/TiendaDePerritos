const productos = [
    { id: 1, codigo: "PROD001", nombre: "Rascador Premium", precio: 39990, imagen: "IMG/ProductosGato/SuperRascadorGato.png", descripcion: "Rascador resistente para gatos.", stock: 15, stockCritico: 5, categoria: "Rascadores y Gimnasios" },
    { id: 2, codigo: "PROD002", nombre: "Cerdito Oink", precio: 3990, imagen: "IMG/ProductosPerro/CerditoOinkOink.png", descripcion: "Juguete divertido para perros.", stock: 30, stockCritico: 5, categoria: "Juguetes" },
    { id: 3, codigo: "PROD003", nombre: "Arnés para Gato", precio: 9990, imagen: "IMG/ProductosGato/ArnesAjustableGato.png", descripcion: "Arnés ajustable y cómodo.", stock: 10, stockCritico: 3, categoria: "Correas, Collares y Arneses" },
    { id: 4, codigo: "PROD004", nombre: "Sobre Pedigree", precio: 800, imagen: "IMG/ProductosPerro/SobreCarnePedigreeAdulto.png", descripcion: "Alimento húmedo para perros.", stock: 50, stockCritico: 10, categoria: "Alimento Húmedo" }
];

const usuariosGuardados = [];
const ordenes = [];

const regiones = [
    { id: 1, nombre: "Región Metropolitana" },
    { id: 2, nombre: "Región de Valparaíso" },
    { id: 3, nombre: "Región del Biobío" },
    { id: 4, nombre: "Región de Coquimbo" },
    { id: 5, nombre: "Región de O'Higgins" }
];

const comunas = {
    1: ["Santiago", "Providencia", "Las Condes", "Ñuñoa", "La Florida", "Maipú"],
    2: ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana"],
    3: ["Concepción", "Talcahuano", "Chillán", "Los Ángeles"],
    4: ["La Serena", "Coquimbo", "Ovalle"],
    5: ["Rancagua", "San Fernando", "Santa Cruz"]
};

function cambiarRol(rol) {
    document.querySelectorAll('.menu-admin').forEach(el => {
        const rolesPermitidos = el.getAttribute('data-rol').split(',');
        el.style.display = rolesPermitidos.includes(rol) ? 'block' : 'none';
    });
    if (rol === 'Vendedor') {
        document.getElementById('tab-btn-usuarios').style.display = 'none';
        document.getElementById('tab-btn-productos').style.display = 'block';
        document.getElementById('tab-btn-ordenes').style.display = 'block';
        mostrarTab('productos');
    } else if (rol === 'Cliente') {
        alert('Los clientes solo pueden acceder a la tienda pública.');
        window.location.href = 'index.html';
    } else {
        document.getElementById('tab-btn-usuarios').style.display = 'block';
        document.getElementById('tab-btn-productos').style.display = 'block';
        document.getElementById('tab-btn-ordenes').style.display = 'block';
    }
}

function obtenerCarrito() {
    return JSON.parse(localStorage.getItem('carrito')) || [];
}

function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();
    document.querySelectorAll('.carrito-contador').forEach(el => {
        el.textContent = carrito.length;
    });
}

function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) { alert("❌ Producto no encontrado"); return; }
    let carrito = obtenerCarrito();
    const existente = carrito.find(item => item.id === id);
    const cantidadActual = existente ? existente.cantidad : 0;
    if (cantidadActual + 1 > producto.stock) {
        alert("❌ No hay suficiente stock. Disponible: " + producto.stock);
        return;
    }
    if (existente) { existente.cantidad++; }
    else { carrito.push({ ...producto, cantidad: 1 }); }
    guardarCarrito(carrito);
    alert("✅ " + producto.nombre + " agregado al carrito");
}

function eliminarDelCarrito(id) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(item => item.id !== id);
    guardarCarrito(carrito);
    if (document.getElementById('carrito-lista')) mostrarCarrito();
}

function vaciarCarrito() {
    if (confirm("¿Vaciar carrito?")) {
        guardarCarrito([]);
        if (document.getElementById('carrito-lista')) mostrarCarrito();
    }
}

function cambiarCantidad(id, delta) {
    let carrito = obtenerCarrito();
    const item = carrito.find(i => i.id === id);
    if (!item) return;
    const producto = productos.find(p => p.id === id);
    const nueva = (item.cantidad || 1) + delta;
    if (nueva <= 0) { carrito = carrito.filter(i => i.id !== id); }
    else if (nueva > producto.stock) { alert("❌ Stock insuficiente"); return; }
    else { item.cantidad = nueva; }
    guardarCarrito(carrito);
    mostrarCarrito();
}

function mostrarCarrito() {
    const contenedor = document.getElementById('carrito-lista');
    if (!contenedor) return;
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
        contenedor.innerHTML = `<div class="carrito-vacio"><p style="font-size:48px;">🛒</p><p>Tu carrito está vacío</p><a href="productos.html" style="color:#4e6b50;font-weight:700;">Ir a comprar →</a></div>`;
        document.getElementById('total-monto').textContent = '0';
        return;
    }
    let html = '';
    let total = 0;
    carrito.forEach(item => {
        const cant = item.cantidad || 1;
        const sub = item.precio * cant;
        total += sub;
        html += `
            <div class="carrito-item">
                <div class="info">
                    <img src="${item.imagen}" alt="${item.nombre}">
                    <div><h3>${item.nombre}</h3><p>$${item.precio.toLocaleString()} c/u</p></div>
                </div>
                <div class="acciones">
                    <div class="cantidad">
                        <button onclick="cambiarCantidad(${item.id}, -1)">−</button>
                        <span>${cant}</span>
                        <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
                    </div>
                    <div class="precio">$${sub.toLocaleString()}</div>
                    <button class="eliminar" onclick="eliminarDelCarrito(${item.id})">✕</button>
                </div>
            </div>`;
    });
    contenedor.innerHTML = html;
    document.getElementById('total-monto').textContent = total.toLocaleString();
}

function finalizarCompra() {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
        alert("❌ Tu carrito está vacío.");
        return;
    }
    let total = 0;
    carrito.forEach(item => {
        total += item.precio * (item.cantidad || 1);
    });
    const nuevaOrden = {
        id: ordenes.length + 1,
        fecha: new Date().toLocaleDateString('es-CL'),
        cliente: "Cliente Demo",
        total: total,
        productos: JSON.parse(JSON.stringify(carrito))
    };
    ordenes.push(nuevaOrden);
    guardarOrdenesLocalStorage();
    guardarCarrito([]);
    alert("✅ ¡Compra exitosa!\n\nOrden #" + nuevaOrden.id + "\nTotal: $" + total.toLocaleString());
    mostrarCarrito();
}

function guardarOrdenesLocalStorage() {
    localStorage.setItem('ordenes', JSON.stringify(ordenes));
}

function cargarOrdenesLocalStorage() {
    const guardadas = JSON.parse(localStorage.getItem('ordenes')) || [];
    ordenes.length = 0;
    guardadas.forEach(o => ordenes.push(o));
}

function verDetalleOrden(id) {
    const orden = ordenes.find(o => o.id === id);
    if (!orden) return;
    let detalle = `📋 Orden #${orden.id}\n`;
    detalle += `📅 Fecha: ${orden.fecha}\n`;
    detalle += `👤 Cliente: ${orden.cliente}\n`;
    detalle += `💰 Total: $${orden.total.toLocaleString()}\n\n`;
    detalle += `🛒 Productos:\n`;
    orden.productos.forEach(p => {
        detalle += `- ${p.nombre} x${p.cantidad} = $${(p.precio * p.cantidad).toLocaleString()}\n`;
    });
    alert(detalle);
}

function mostrarProductos() {
    const contenedor = document.getElementById('productos-lista');
    if (!contenedor) return;
    contenedor.innerHTML = productos.map(p => `
        <div class="producto" style="cursor:pointer;" onclick="window.location.href='detalle${p.id}.html'">
            <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
            <h3>${p.nombre}</h3>
            <p class="precio">$${p.precio.toLocaleString()}</p>
            <button class="boton-agregar" onclick="event.stopPropagation(); agregarAlCarrito(${p.id})">🛒 Añadir al carrito</button>
            <span class="boton-detalle">Ver detalle →</span>
        </div>
    `).join('');
}

function validarEmail(email) {
    if (!email || email.length > 100) return false;
    const dominios = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
    return dominios.some(d => email.includes(d));
}

function validarRut(rut) {
    rut = rut.replace(/[.-]/g, '').trim();
    if (!/^[0-9]{7,9}[0-9Kk]$/.test(rut)) return false;
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1).toUpperCase();
    let suma = 0, mult = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * mult;
        mult = mult < 7 ? mult + 1 : 2;
    }
    const dvE = 11 - (suma % 11);
    const dvC = dvE === 11 ? '0' : dvE === 10 ? 'K' : dvE.toString();
    return dv === dvC;
}

function validarLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    if (!validarEmail(email)) { alert('❌ Email inválido (máx 100 caracteres).'); return false; }
    if (pass.length < 4 || pass.length > 10) { alert('❌ Contraseña: 4-10 caracteres.'); return false; }
    alert('✅ Inicio de sesión exitoso');
    return true;
}

function validarRegistro(e) {
    e.preventDefault();
    const rut = document.getElementById('reg-rut').value.trim();
    const nombre = document.getElementById('reg-nombre').value.trim();
    const apellidos = document.getElementById('reg-apellidos').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();
    const region = document.getElementById('reg-region').value;
    const comuna = document.getElementById('reg-comuna').value;
    const direccion = document.getElementById('reg-direccion').value.trim();

    if (!validarRut(rut)) { alert('❌ RUT inválido.'); return false; }
    if (!nombre || nombre.length > 50) { alert('❌ Nombre requerido (máx 50).'); return false; }
    if (!apellidos || apellidos.length > 100) { alert('❌ Apellidos requeridos (máx 100).'); return false; }
    if (!validarEmail(email)) { alert('❌ Email inválido (máx 100).'); return false; }
    if (pass.length < 4 || pass.length > 10) { alert('❌ Contraseña: 4-10 caracteres.'); return false; }
    if (!region) { alert('❌ Selecciona una región.'); return false; }
    if (!comuna) { alert('❌ Selecciona una comuna.'); return false; }
    if (!direccion || direccion.length > 300) { alert('❌ Dirección requerida (máx 300).'); return false; }

    const nuevoUsuario = {
        rut: rut, nombre: nombre, apellidos: apellidos, email: email,
        password: pass, region: region, comuna: comuna, direccion: direccion, tipo: "Cliente"
    };

    usuariosGuardados.push(nuevoUsuario);
    guardarUsuariosLocalStorage();
    alert('✅ Registro exitoso. ¡Bienvenido ' + nombre + '!');
    document.getElementById('registro-form').reset();
    return true;
}

function guardarUsuariosLocalStorage() {
    localStorage.setItem('usuarios', JSON.stringify(usuariosGuardados));
}

function cargarUsuariosLocalStorage() {
    const guardados = JSON.parse(localStorage.getItem('usuarios')) || [];
    usuariosGuardados.length = 0;
    guardados.forEach(u => usuariosGuardados.push(u));
}

function validarContacto(e) {
    e.preventDefault();
    const nombre = document.getElementById('contact-nombre').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const comentario = document.getElementById('contact-comentario').value.trim();
    if (!nombre || nombre.length > 100) { alert('❌ Nombre requerido (máx 100).'); return false; }
    if (!validarEmail(email)) { alert('❌ Email inválido (máx 100).'); return false; }
    if (!comentario || comentario.length > 500) { alert('❌ Comentario requerido (máx 500).'); return false; }
    alert('✅ Mensaje enviado');
    return true;
}

function validarAdminProducto(e) {
    e.preventDefault();
    const idEditar = document.getElementById('prod-id-editar').value;
    const codigo = document.getElementById('prod-codigo').value.trim();
    const nombre = document.getElementById('prod-nombre').value.trim();
    const precio = document.getElementById('prod-precio').value.trim();
    const stock = document.getElementById('prod-stock').value.trim();
    const stockCritico = document.getElementById('prod-stock-critico').value.trim();
    const categoria = document.getElementById('prod-categoria').value;
    const imagen = document.getElementById('prod-imagen').value.trim() || "IMG/ProductosGato/SuperRascadorGato.png";

    if (!codigo || codigo.length < 3) { alert('❌ Código requerido (mín 3).'); return false; }
    if (!nombre || nombre.length > 100) { alert('❌ Nombre requerido (máx 100).'); return false; }
    if (!precio || parseFloat(precio) < 0) { alert('❌ Precio requerido (mín 0).'); return false; }
    if (stock === '' || parseInt(stock) < 0 || !Number.isInteger(parseFloat(stock))) { alert('❌ Stock entero ≥ 0.'); return false; }

    if (stockCritico && parseInt(stockCritico) > 0) {
        if (parseInt(stock) <= parseInt(stockCritico)) {
            alert('⚠️ ¡Alerta! Stock (' + stock + ') ≤ Stock crítico (' + stockCritico + ').');
        }
    }

    if (idEditar) {
        const producto = productos.find(p => p.id === parseInt(idEditar));
        if (producto) {
            producto.codigo = codigo;
            producto.nombre = nombre;
            producto.precio = parseFloat(precio);
            producto.stock = parseInt(stock);
            producto.stockCritico = parseInt(stockCritico) || 0;
            producto.categoria = categoria;
            producto.imagen = imagen;
            producto.descripcion = document.getElementById('prod-descripcion').value.trim() || "Sin descripción";
            alert('✅ Producto actualizado correctamente');
        }
    } else {
        const nuevoProducto = {
            id: productos.length + 1, codigo: codigo, nombre: nombre,
            precio: parseFloat(precio), imagen: imagen,
            descripcion: document.getElementById('prod-descripcion').value.trim() || "Sin descripción",
            stock: parseInt(stock), stockCritico: parseInt(stockCritico) || 0, categoria: categoria
        };
        productos.push(nuevoProducto);
        alert('✅ Producto guardado correctamente');
    }

    actualizarListaProductosAdmin();
    cancelarEdicion();
    return true;
}

function editarProductoAdmin(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    document.getElementById('prod-id-editar').value = producto.id;
    document.getElementById('prod-codigo').value = producto.codigo || '';
    document.getElementById('prod-nombre').value = producto.nombre;
    document.getElementById('prod-descripcion').value = producto.descripcion || '';
    document.getElementById('prod-precio').value = producto.precio;
    document.getElementById('prod-stock').value = producto.stock;
    document.getElementById('prod-stock-critico').value = producto.stockCritico || '';
    document.getElementById('prod-categoria').value = producto.categoria || 'Alimento Seco';
    document.getElementById('prod-imagen').value = producto.imagen || '';
    document.getElementById('titulo-producto').textContent = '✏️ Editando Producto';
    document.getElementById('btn-guardar-producto').textContent = 'Actualizar Producto';
    document.getElementById('btn-cancelar-edicion').style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicion() {
    document.getElementById('admin-producto-form').reset();
    document.getElementById('prod-id-editar').value = '';
    document.getElementById('titulo-producto').textContent = 'Gestión de Productos';
    document.getElementById('btn-guardar-producto').textContent = 'Guardar Producto';
    document.getElementById('btn-cancelar-edicion').style.display = 'none';
}

function eliminarProductoAdmin(id) {
    if (!confirm("¿Eliminar este producto?")) return;
    const index = productos.findIndex(p => p.id === id);
    if (index > -1) {
        productos.splice(index, 1);
        actualizarListaProductosAdmin();
        alert('✅ Producto eliminado');
    }
}

function actualizarListaProductosAdmin() {
    const lista = document.getElementById('lista-productos-simulada');
    if (!lista) return;
    lista.innerHTML = productos.map(p => `
        <li style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #eee;">
            <span>${p.nombre} - $${p.precio.toLocaleString()} (Stock: ${p.stock})${p.stock <= p.stockCritico ? ' ⚠️' : ''}</span>
            <div>
                <button onclick="editarProductoAdmin(${p.id})" style="color:#4e6b50;border:none;background:none;cursor:pointer;font-size:16px;margin-right:5px;">✏️</button>
                <button onclick="eliminarProductoAdmin(${p.id})" style="color:red;border:none;background:none;cursor:pointer;font-size:16px;">✕</button>
            </div>
        </li>
    `).join('');
}

function validarAdminUsuario(e) {
    e.preventDefault();
    const rut = document.getElementById('user-rut').value.trim();
    const nombre = document.getElementById('user-nombre').value.trim();
    const apellidos = document.getElementById('user-apellidos').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const tipo = document.getElementById('user-tipo').value;
    const region = document.getElementById('user-region').value;
    const comuna = document.getElementById('user-comuna').value;
    const direccion = document.getElementById('user-direccion').value.trim();

    if (!validarRut(rut)) { alert('❌ RUT inválido.'); return false; }
    if (!nombre || nombre.length > 50) { alert('❌ Nombre requerido (máx 50).'); return false; }
    if (!apellidos || apellidos.length > 100) { alert('❌ Apellidos requeridos (máx 100).'); return false; }
    if (!validarEmail(email)) { alert('❌ Email inválido (máx 100).'); return false; }
    if (!region) { alert('❌ Selecciona una región.'); return false; }
    if (!comuna) { alert('❌ Selecciona una comuna.'); return false; }
    if (!direccion || direccion.length > 300) { alert('❌ Dirección requerida (máx 300).'); return false; }

    const nuevoUsuario = {
        rut: rut, nombre: nombre, apellidos: apellidos, email: email,
        tipo: tipo, region: region, comuna: comuna, direccion: direccion
    };
    usuariosGuardados.push(nuevoUsuario);
    guardarUsuariosLocalStorage();
    actualizarListaUsuariosAdmin();
    alert('✅ Usuario guardado correctamente');
    document.getElementById('admin-usuario-form').reset();
    return true;
}

function actualizarListaUsuariosAdmin() {
    const lista = document.getElementById('lista-usuarios-simulada');
    if (!lista) return;
    if (usuariosGuardados.length === 0) {
        lista.innerHTML = '<li style="color:#777;">No hay usuarios registrados aún.</li>';
        return;
    }
    lista.innerHTML = usuariosGuardados.map(u => `
        <li style="padding:8px 0;border-bottom:1px solid #eee;">
            <strong>${u.nombre} ${u.apellidos}</strong> - RUT: ${u.rut} - ${u.email} - Rol: ${u.tipo || 'Cliente'}
        </li>
    `).join('');
}

function actualizarListaOrdenes() {
    const contenedor = document.getElementById('lista-ordenes');
    if (!contenedor) return;
    if (ordenes.length === 0) {
        contenedor.innerHTML = '<p style="color:#777;">No hay órdenes registradas.</p>';
        return;
    }
    contenedor.innerHTML = ordenes.map(o => `
        <div onclick="verDetalleOrden(${o.id})" style="background:white;padding:15px;border-radius:12px;border:1px solid #ddd;margin-bottom:10px;cursor:pointer;">
            <strong>📋 Orden #${o.id}</strong> - ${o.fecha}<br>
            👤 Cliente: ${o.cliente}<br>
            💰 Total: $${o.total.toLocaleString()}<br>
            🛒 Productos: ${o.productos.length}
        </div>
    `).join('');
}

function cargarRegiones() {
    const selects = [document.getElementById('user-region'), document.getElementById('reg-region')];
    selects.forEach(select => {
        if (!select) return;
        select.innerHTML = '<option value="">Selecciona una región</option>';
        regiones.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.id;
            opt.textContent = r.nombre;
            select.appendChild(opt);
        });
    });
}

function cargarComunas() {
    const pares = [
        { region: document.getElementById('user-region'), comuna: document.getElementById('user-comuna') },
        { region: document.getElementById('reg-region'), comuna: document.getElementById('reg-comuna') }
    ];
    pares.forEach(par => {
        if (!par.region || !par.comuna) return;
        const regionId = parseInt(par.region.value);
        par.comuna.innerHTML = '<option value="">Selecciona una comuna</option>';
        if (regionId && comunas[regionId]) {
            comunas[regionId].forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                opt.textContent = c;
                par.comuna.appendChild(opt);
            });
        }
    });
}

function configurarValidacionTiempoReal() {
    const campos = [
        { id: 'login-email', validar: v => validarEmail(v) },
        { id: 'login-pass', validar: v => v.length >= 4 && v.length <= 10 },
        { id: 'reg-rut', validar: v => validarRut(v) },
        { id: 'reg-nombre', validar: v => v.length > 0 && v.length <= 50 },
        { id: 'reg-apellidos', validar: v => v.length > 0 && v.length <= 100 },
        { id: 'reg-email', validar: v => validarEmail(v) },
        { id: 'reg-pass', validar: v => v.length >= 4 && v.length <= 10 },
        { id: 'reg-direccion', validar: v => v.length > 0 && v.length <= 300 },
        { id: 'contact-nombre', validar: v => v.length > 0 && v.length <= 100 },
        { id: 'contact-email', validar: v => validarEmail(v) },
        { id: 'contact-comentario', validar: v => v.length > 0 && v.length <= 500 }
    ];
    campos.forEach(campo => {
        const input = document.getElementById(campo.id);
        if (!input) return;
        input.addEventListener('input', function() {
            if (this.value.length === 0) { this.style.borderColor = '#e0ddd5'; return; }
            this.style.borderColor = campo.validar(this.value) ? '#4e6b50' : '#c0392b';
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    cargarUsuariosLocalStorage();
    cargarOrdenesLocalStorage();
    actualizarContadorCarrito();

    if (document.getElementById('productos-lista')) mostrarProductos();
    if (document.getElementById('carrito-lista')) mostrarCarrito();
    if (document.getElementById('lista-productos-simulada')) actualizarListaProductosAdmin();
    if (document.getElementById('lista-usuarios-simulada')) actualizarListaUsuariosAdmin();
    if (document.getElementById('lista-ordenes')) actualizarListaOrdenes();

    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', validarLogin);

    const registroForm = document.getElementById('registro-form');
    if (registroForm) registroForm.addEventListener('submit', validarRegistro);

    const contactoForm = document.getElementById('contacto-form');
    if (contactoForm) contactoForm.addEventListener('submit', validarContacto);

    const adminProductoForm = document.getElementById('admin-producto-form');
    if (adminProductoForm) adminProductoForm.addEventListener('submit', validarAdminProducto);

    const adminUsuarioForm = document.getElementById('admin-usuario-form');
    if (adminUsuarioForm) adminUsuarioForm.addEventListener('submit', validarAdminUsuario);

    cargarRegiones();
    ['user-region', 'reg-region'].forEach(id => {
        const sel = document.getElementById(id);
        if (sel) sel.addEventListener('change', cargarComunas);
    });
    cargarComunas();

    const vaciarBtn = document.getElementById('vaciar-carrito');
    if (vaciarBtn) vaciarBtn.addEventListener('click', vaciarCarrito);

    const destacadosContainer = document.getElementById('productos-destacados');
    if (destacadosContainer) {
        const destacados = productos.slice(0, 2);
        destacadosContainer.innerHTML = destacados.map(p => `
            <div class="producto" style="cursor:pointer;" onclick="window.location.href='detalle${p.id}.html'">
                <img src="${p.imagen}" alt="${p.nombre}">
                <h3>${p.nombre}</h3>
                <p class="precio">$${p.precio.toLocaleString()}</p>
                <button class="boton-agregar" onclick="event.stopPropagation(); agregarAlCarrito(${p.id})">🛒 Añadir</button>
            </div>
        `).join('');
    }

    configurarValidacionTiempoReal();
});