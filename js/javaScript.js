const productosBase = [
    { id: 1, codigo: "PROD001", nombre: "Rascador Premium", precio: 39990, imagen: "IMG/ProductosGato/SuperRascadorGato.png", descripcion: "Rascador resistente para gatos.", stock: 15, stockCritico: 5, categoria: "Rascadores y Gimnasios" },
    { id: 2, codigo: "PROD002", nombre: "Cerdito Oink", precio: 3990, imagen: "IMG/ProductosPerro/CerditoOinkOink.png", descripcion: "Juguete divertido para perros.", stock: 30, stockCritico: 5, categoria: "Juguetes" },
    { id: 3, codigo: "PROD003", nombre: "Arnés para Gato", precio: 9990, imagen: "IMG/ProductosGato/ArnesAjustableGato.png", descripcion: "Arnés ajustable y cómodo.", stock: 10, stockCritico: 3, categoria: "Correas, Collares y Arneses" },
    { id: 4, codigo: "PROD004", nombre: "Sobre Pedigree", precio: 800, imagen: "IMG/ProductosPerro/SobreCarnePedigreeAdulto.png", descripcion: "Alimento húmedo para perros.", stock: 50, stockCritico: 10, categoria: "Alimento Húmedo" }
];

let productos = JSON.parse(localStorage.getItem('productos')) || productosBase;
const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios')) || [];
const ordenes = JSON.parse(localStorage.getItem('ordenes')) || [];

if (!localStorage.getItem('usuarios') || usuariosGuardados.length === 0) {
    usuariosGuardados.push({
        rut: "111111111",
        nombre: "Admin",
        apellidos: "Sistema",
        email: "admin@duoc.cl",
        password: "1234",
        region: "1",
        comuna: "Santiago",
        direccion: "Casa Matriz 1",
        tipo: "Administrador"
    });
    localStorage.setItem('usuarios', JSON.stringify(usuariosGuardados));
}

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

function guardarProductos() {
    localStorage.setItem('productos', JSON.stringify(productos));
}
function guardarUsuarios() {
    localStorage.setItem('usuarios', JSON.stringify(usuariosGuardados));
}
function guardarOrdenes() {
    localStorage.setItem('ordenes', JSON.stringify(ordenes));
}
function obtenerSesion() {
    return JSON.parse(localStorage.getItem('sesion')) || null;
}
function cerrarSesion() {
    localStorage.removeItem('sesion');
    window.location.href = 'IniciarSesion.html';
}

function protegerAdmin() {
    if (!document.getElementById('rol-selector')) return;
    const sesion = obtenerSesion();
    if (!sesion || (sesion.rol !== 'Administrador' && sesion.rol !== 'Vendedor')) {
        alert('⛔ Debes iniciar sesión como Administrador o Vendedor.');
        window.location.href = 'IniciarSesion.html';
        return;
    }
    const select = document.getElementById('rol-selector');
    select.value = sesion.rol;
    select.disabled = true;
    cambiarRol(sesion.rol);
}

function cambiarRol(rol) {
    document.querySelectorAll('.menu-admin').forEach(el => {
        const rolesPermitidos = el.getAttribute('data-rol').split(',');
        el.style.display = rolesPermitidos.includes(rol) ? 'block' : 'none';
    });

    const btnUsuarios = document.getElementById('tab-btn-usuarios');
    const btnProductos = document.getElementById('tab-btn-productos');
    const btnOrdenes = document.getElementById('tab-btn-ordenes');

    if (rol === 'Vendedor') {
        if (btnUsuarios) btnUsuarios.style.display = 'none';
        if (btnProductos) btnProductos.style.display = 'block';
        if (btnOrdenes) btnOrdenes.style.display = 'block';
        mostrarTab('productos');
    } else if (rol === 'Cliente') {
        alert('Los clientes solo pueden acceder a la tienda pública.');
        window.location.href = 'index.html';
    } else {
        if (btnUsuarios) btnUsuarios.style.display = 'block';
        if (btnProductos) btnProductos.style.display = 'block';
        if (btnOrdenes) btnOrdenes.style.display = 'block';
    }
    actualizarListaProductosAdmin();
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
    const total = carrito.reduce((s, i) => s + (i.cantidad || 1), 0);
    document.querySelectorAll('.carrito-contador').forEach(el => el.textContent = total);
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
    if (existente) existente.cantidad++;
    else carrito.push({ ...producto, cantidad: 1 });
    guardarCarrito(carrito);
    alert("✅ " + producto.nombre + " agregado al carrito");
}
function eliminarDelCarrito(id) {
    let carrito = obtenerCarrito().filter(i => i.id !== id);
    guardarCarrito(carrito);
    if (document.getElementById('carrito-lista')) mostrarCarrito();
}
function cambiarCantidad(id, delta) {
    let carrito = obtenerCarrito();
    const item = carrito.find(i => i.id === id);
    if (!item) return;
    const producto = productos.find(p => p.id === id);
    const nueva = (item.cantidad || 1) + delta;
    if (nueva <= 0) carrito = carrito.filter(i => i.id !== id);
    else if (nueva > producto.stock) { alert("❌ Stock insuficiente"); return; }
    else item.cantidad = nueva;
    guardarCarrito(carrito);
    mostrarCarrito();
}
function mostrarCarrito() {
    const contenedor = document.getElementById('carrito-lista');
    if (!contenedor) return;
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
        contenedor.innerHTML = `<div class="carrito-vacio"><p style="font-size:48px;">🛒</p><p>Tu carrito está vacío</p><a href="productos.html">Ir a comprar →</a></div>`;
        const t = document.getElementById('total-monto');
        if (t) t.textContent = '0';
        return;
    }
    let html = '', total = 0;
    carrito.forEach(item => {
        const cant = item.cantidad || 1;
        const sub = item.precio * cant;
        total += sub;
        html += `<div class="carrito-item">
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
    const tm = document.getElementById('total-monto');
    if (tm) tm.textContent = total.toLocaleString();
}
function finalizarCompra() {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) { alert("❌ Tu carrito está vacío."); return; }
    const sesion = obtenerSesion();
    const total = carrito.reduce((s, i) => s + i.precio * (i.cantidad || 1), 0);
    const nuevaOrden = {
        id: ordenes.length + 1,
        fecha: new Date().toLocaleDateString('es-CL'),
        cliente: sesion ? sesion.nombre : "Cliente Invitado",
        total: total,
        productos: JSON.parse(JSON.stringify(carrito))
    };
    ordenes.push(nuevaOrden);
    guardarOrdenes();
    guardarCarrito([]);
    alert("✅ ¡Compra exitosa!\n\nOrden #" + nuevaOrden.id + "\nTotal: $" + total.toLocaleString());
    mostrarCarrito();
}
function verDetalleOrden(id) {
    const orden = ordenes.find(o => o.id === id);
    if (!orden) return;
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = `
        <div style="background:white;padding:30px;border-radius:16px;max-width:500px;width:90%;max-height:80vh;overflow:auto;">
            <h2 style="color:#334b36;">📋 Orden #${orden.id}</h2>
            <p><strong>Fecha:</strong> ${orden.fecha}</p>
            <p><strong>Cliente:</strong> ${orden.cliente}</p>
            <hr style="margin:15px 0;">
            <h3>Productos:</h3>
            ${orden.productos.map(p => `<p>• ${p.nombre} × ${p.cantidad} = $${(p.precio * p.cantidad).toLocaleString()}</p>`).join('')}
            <hr style="margin:15px 0;">
            <p style="font-size:20px;font-weight:700;color:#334b36;">Total: $${orden.total.toLocaleString()}</p>
            <button onclick="this.closest('div').parentElement.remove()" class="boton boton-principal" style="margin-top:15px;width:100%;">Cerrar</button>
        </div>`;
    document.body.appendChild(modal);
}

function mostrarProductos() {
    const contenedor = document.getElementById('productos-lista');
    if (!contenedor) return;
    contenedor.innerHTML = productos.map(p => `
        <div class="producto" style="cursor:pointer;" onclick="verProducto(${p.id})">
            <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
            <h3>${p.nombre}</h3>
            <p class="precio">$${p.precio.toLocaleString()}</p>
            <button class="boton-agregar" onclick="event.stopPropagation(); agregarAlCarrito(${p.id})">🛒 Añadir al carrito</button>
        </div>
    `).join('');
}

function verProducto(id) {
    if (id >= 1 && id <= 4) {
        window.location.href = `detalle${id}.html`;
    } else {
        alert('Este producto aún no tiene página de detalle.');
    }
}

function validarEmail(email) {
    if (!email || email.length > 100) return false;
    const dominios = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
    return dominios.some(d => email.toLowerCase().endsWith(d));
}

function validarRut(rut) {
    rut = rut.replace(/[.-]/g, '').trim();
    if (!/^[0-9]{6,8}[0-9Kk]$/.test(rut)) return false;
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

function mostrarError(idInput, mensaje) {
    const input = document.getElementById(idInput);
    if (!input) return;
    const prev = input.parentElement.querySelector('.error-inline');
    if (prev) prev.remove();
    const span = document.createElement('span');
    span.className = 'error-inline';
    span.style.cssText = 'color:#c0392b;font-size:12px;display:block;margin-top:4px;';
    span.textContent = mensaje;
    input.parentElement.appendChild(span);
    input.style.borderColor = '#c0392b';
}

function validarLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value.trim();

    if (!validarEmail(email)) { mostrarError('login-email', '❌ Email inválido o no permitido.'); return false; }
    if (pass.length < 4 || pass.length > 10) { mostrarError('login-pass', '❌ Contraseña: 4-10 caracteres.'); return false; }

    const usuario = usuariosGuardados.find(u => u.email === email && u.password === pass);
    if (!usuario) {
        mostrarError('login-email', '❌ Credenciales incorrectas.');
        return false;
    }
    localStorage.setItem('sesion', JSON.stringify({
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.tipo || 'Cliente'
    }));
    alert('✅ Bienvenido ' + usuario.nombre);
    if (usuario.tipo === 'Administrador' || usuario.tipo === 'Vendedor') {
        window.location.href = 'administrador.html';
    } else {
        window.location.href = 'index.html';
    }
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

    if (!validarRut(rut)) { mostrarError('reg-rut', '❌ RUT inválido.'); return false; }
    if (!nombre || nombre.length > 50) { mostrarError('reg-nombre', '❌ Nombre requerido (máx 50).'); return false; }
    if (!apellidos || apellidos.length > 100) { mostrarError('reg-apellidos', '❌ Apellidos (máx 100).'); return false; }
    if (!validarEmail(email)) { mostrarError('reg-email', '❌ Email inválido.'); return false; }
    if (usuariosGuardados.some(u => u.email === email)) { mostrarError('reg-email', '❌ Email ya registrado.'); return false; }
    if (pass.length < 4 || pass.length > 10) { mostrarError('reg-pass', '❌ Contraseña: 4-10.'); return false; }
    if (!region) { mostrarError('reg-region', '❌ Selecciona región.'); return false; }
    if (!comuna) { mostrarError('reg-comuna', '❌ Selecciona comuna.'); return false; }
    if (!direccion || direccion.length > 300) { mostrarError('reg-direccion', '❌ Dirección (máx 300).'); return false; }

    usuariosGuardados.push({
        rut, nombre, apellidos, email, password: pass,
        region, comuna, direccion, tipo: "Cliente"
    });
    guardarUsuarios();
    alert('✅ Registro exitoso. ¡Bienvenido ' + nombre + '!');
    document.getElementById('registro-form').reset();
    window.location.href = 'IniciarSesion.html';
    return true;
}

function validarContacto(e) {
    e.preventDefault();
    const nombre = document.getElementById('contact-nombre').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const comentario = document.getElementById('contact-comentario').value.trim();
    if (!nombre || nombre.length > 100) { mostrarError('contact-nombre', '❌ Nombre (máx 100).'); return false; }
    if (!validarEmail(email)) { mostrarError('contact-email', '❌ Email inválido.'); return false; }
    if (!comentario || comentario.length > 500) { mostrarError('contact-comentario', '❌ Comentario (máx 500).'); return false; }
    alert('✅ Mensaje enviado');
    document.getElementById('contacto-form').reset();
    return true;
}

function validarAdminProducto(e) {
    e.preventDefault();
    const idEditar = document.getElementById('prod-id-editar').value;
    const codigo = document.getElementById('prod-codigo').value.trim();
    const nombre = document.getElementById('prod-nombre').value.trim();
    const descripcion = document.getElementById('prod-descripcion').value.trim();
    const precio = document.getElementById('prod-precio').value.trim();
    const stock = document.getElementById('prod-stock').value.trim();
    const stockCritico = document.getElementById('prod-stock-critico').value.trim();
    const categoria = document.getElementById('prod-categoria').value;
    const imagen = document.getElementById('prod-imagen').value.trim() || "IMG/ProductosGato/SuperRascadorGato.png";

    if (!codigo || codigo.length < 3) { alert('❌ Código (mín 3).'); return false; }
    if (!nombre || nombre.length > 100) { alert('❌ Nombre (máx 100).'); return false; }
    if (descripcion.length > 500) { alert('❌ Descripción (máx 500).'); return false; }
    if (!precio || parseFloat(precio) < 0) { alert('❌ Precio (mín 0).'); return false; }
    if (stock === '' || !/^\d+$/.test(stock)) { alert('❌ Stock entero ≥ 0.'); return false; }
    if (stockCritico && !/^\d+$/.test(stockCritico)) { alert('❌ Stock crítico entero.'); return false; }

    if (stockCritico && parseInt(stock) <= parseInt(stockCritico)) {
        alert('⚠️ Alerta: Stock (' + stock + ') ≤ Stock crítico (' + stockCritico + ').');
    }

    if (idEditar) {
        const p = productos.find(p => p.id === parseInt(idEditar));
        if (p) {
            Object.assign(p, { codigo, nombre, descripcion: descripcion || "Sin descripción",
                precio: parseFloat(precio), stock: parseInt(stock),
                stockCritico: parseInt(stockCritico) || 0, categoria, imagen });
            alert('✅ Producto actualizado');
        }
    } else {
        const nuevoId = Math.max(...productos.map(p => p.id), 0) + 1;
        productos.push({
            id: nuevoId, codigo, nombre,
            precio: parseFloat(precio), imagen,
            descripcion: descripcion || "Sin descripción",
            stock: parseInt(stock), stockCritico: parseInt(stockCritico) || 0, categoria
        });
        alert('✅ Producto guardado');
    }
    guardarProductos();
    actualizarListaProductosAdmin();
    cancelarEdicion();
    return true;
}

function editarProductoAdmin(id) {
    const p = productos.find(p => p.id === id);
    if (!p) return;
    document.getElementById('prod-id-editar').value = p.id;
    document.getElementById('prod-codigo').value = p.codigo || '';
    document.getElementById('prod-nombre').value = p.nombre;
    document.getElementById('prod-descripcion').value = p.descripcion || '';
    document.getElementById('prod-precio').value = p.precio;
    document.getElementById('prod-stock').value = p.stock;
    document.getElementById('prod-stock-critico').value = p.stockCritico || '';
    document.getElementById('prod-categoria').value = p.categoria || 'Alimento Seco';
    document.getElementById('prod-imagen').value = p.imagen || '';
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
    productos = productos.filter(p => p.id !== id);
    guardarProductos();
    actualizarListaProductosAdmin();
    alert('✅ Producto eliminado');
}
function actualizarListaProductosAdmin() {
    const lista = document.getElementById('lista-productos-simulada');
    if (!lista) return;
    const rolEl = document.getElementById('rol-selector');
    const rol = rolEl ? rolEl.value : 'Administrador';
    const puedeEditar = rol === 'Administrador';
    lista.innerHTML = productos.map(p => `
        <li style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #eee;">
            <span>${p.nombre} - $${p.precio.toLocaleString()} (Stock: ${p.stock})${p.stock <= p.stockCritico ? ' ⚠️' : ''}</span>
            <div>
                ${puedeEditar ? `
                    <button onclick="editarProductoAdmin(${p.id})" style="color:#4e6b50;border:none;background:none;cursor:pointer;font-size:16px;margin-right:5px;">✏️</button>
                    <button onclick="eliminarProductoAdmin(${p.id})" style="color:red;border:none;background:none;cursor:pointer;font-size:16px;">✕</button>
                ` : '<span style="color:#777;font-size:12px;">Solo lectura</span>'}
            </div>
        </li>
    `).join('');
}

function validarAdminUsuario(e) {
    e.preventDefault();
    const idEditar = document.getElementById('user-id-editar') ? document.getElementById('user-id-editar').value : '';
    const rut = document.getElementById('user-rut').value.trim();
    const nombre = document.getElementById('user-nombre').value.trim();
    const apellidos = document.getElementById('user-apellidos').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const tipo = document.getElementById('user-tipo').value;
    const region = document.getElementById('user-region').value;
    const comuna = document.getElementById('user-comuna').value;
    const direccion = document.getElementById('user-direccion').value.trim();

    if (!validarRut(rut)) { alert('❌ RUT inválido.'); return false; }
    if (!nombre || nombre.length > 50) { alert('❌ Nombre (máx 50).'); return false; }
    if (!apellidos || apellidos.length > 100) { alert('❌ Apellidos (máx 100).'); return false; }
    if (!validarEmail(email)) { alert('❌ Email inválido.'); return false; }
    if (!region) { alert('❌ Región.'); return false; }
    if (!comuna) { alert('❌ Comuna.'); return false; }
    if (!direccion || direccion.length > 300) { alert('❌ Dirección.'); return false; }

    if (idEditar) {
        const u = usuariosGuardados[parseInt(idEditar)];
        if (u) Object.assign(u, { rut, nombre, apellidos, email, tipo, region, comuna, direccion });
        alert('✅ Usuario actualizado');
    } else {
        usuariosGuardados.push({ rut, nombre, apellidos, email, tipo, region, comuna, direccion });
        alert('✅ Usuario guardado');
    }
    guardarUsuarios();
    actualizarListaUsuariosAdmin();
    document.getElementById('admin-usuario-form').reset();
    document.getElementById('user-id-editar').value = '';
    return true;
}
function editarUsuarioAdmin(index) {
    const u = usuariosGuardados[index];
    if (!u) return;
    document.getElementById('user-id-editar').value = index;
    document.getElementById('user-rut').value = u.rut;
    document.getElementById('user-nombre').value = u.nombre;
    document.getElementById('user-apellidos').value = u.apellidos;
    document.getElementById('user-email').value = u.email;
    document.getElementById('user-tipo').value = u.tipo || 'Cliente';
    document.getElementById('user-region').value = u.region;
    cargarComunas();
    document.getElementById('user-comuna').value = u.comuna;
    document.getElementById('user-direccion').value = u.direccion;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function eliminarUsuarioAdmin(index) {
    if (!confirm('¿Eliminar este usuario?')) return;
    usuariosGuardados.splice(index, 1);
    guardarUsuarios();
    actualizarListaUsuariosAdmin();
    alert('✅ Usuario eliminado');
}
function actualizarListaUsuariosAdmin() {
    const lista = document.getElementById('lista-usuarios-simulada');
    if (!lista) return;
    if (usuariosGuardados.length === 0) {
        lista.innerHTML = '<li style="color:#777;">No hay usuarios registrados.</li>';
        return;
    }
    lista.innerHTML = usuariosGuardados.map((u, i) => `
        <li style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #eee;">
            <span><strong>${u.nombre} ${u.apellidos}</strong> - ${u.email} - Rol: ${u.tipo || 'Cliente'}</span>
            <div>
                <button onclick="editarUsuarioAdmin(${i})" style="color:#4e6b50;border:none;background:none;cursor:pointer;font-size:16px;">✏️</button>
                <button onclick="eliminarUsuarioAdmin(${i})" style="color:red;border:none;background:none;cursor:pointer;font-size:16px;">✕</button>
            </div>
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
            👤 ${o.cliente}<br>
            💰 $${o.total.toLocaleString()}<br>
            🛒 ${o.productos.length} producto(s) — <em>Ver detalle →</em>
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
        const rid = parseInt(par.region.value);
        par.comuna.innerHTML = '<option value="">Selecciona una comuna</option>';
        if (rid && comunas[rid]) {
            comunas[rid].forEach(c => {
                const opt = document.createElement('option');
                opt.value = c; opt.textContent = c;
                par.comuna.appendChild(opt);
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    actualizarContadorCarrito();
    protegerAdmin();

    if (document.getElementById('productos-lista')) mostrarProductos();
    if (document.getElementById('productos-destacados')) {
        const cont = document.getElementById('productos-destacados');
        cont.innerHTML = productos.slice(0, 2).map(p => `
            <div class="producto" style="cursor:pointer;" onclick="verProducto(${p.id})">
                <img src="${p.imagen}" alt="${p.nombre}">
                <h3>${p.nombre}</h3>
                <p class="precio">$${p.precio.toLocaleString()}</p>
                <button class="boton-agregar" onclick="event.stopPropagation(); agregarAlCarrito(${p.id})">🛒 Añadir</button>
            </div>`).join('');
    }
    if (document.getElementById('carrito-lista')) mostrarCarrito();
    if (document.getElementById('lista-productos-simulada')) actualizarListaProductosAdmin();
    if (document.getElementById('lista-usuarios-simulada')) actualizarListaUsuariosAdmin();
    if (document.getElementById('lista-ordenes')) actualizarListaOrdenes();

    const f = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('submit', fn); };
    f('login-form', validarLogin);
    f('registro-form', validarRegistro);
    f('contacto-form', validarContacto);
    f('admin-producto-form', validarAdminProducto);
    f('admin-usuario-form', validarAdminUsuario);

    cargarRegiones();
    ['user-region', 'reg-region'].forEach(id => {
        const sel = document.getElementById(id);
        if (sel) sel.addEventListener('change', cargarComunas);
    });
    cargarComunas();
});