require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs'); // Necesario para crear carpetas
const app = express();

// --- ASEGURAR CARPETA UPLOADS ---
const dir = './uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname));

// --- CONFIGURACIÓN PARA QUE LAS IMÁGENES SE VEAN EN EL NAVEGADOR ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de Sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'clave_secreta_tecnologia_digital',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// --- CONFIGURACIÓN DE CONEXIÓN A RAILWAY ---
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '360789010',
    database: process.env.DB_DATABASE || 'tecnologia_digital', // Corregido espacio por guion bajo por seguridad
    port: process.env.DB_PORT || 3306
});

db.connect((err) => {
    if (err) {
        console.error('Error de conexión a MySQL:', err.message);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// --- CONFIGURACIÓN DE MULTER ---
const storage = multer.diskStorage({
    destination: 'uploads/', 
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- RUTA RAIZ ---
app.get('/', (req, res) => {
    res.redirect('/index.html');
});

// RUTA: VERIFICAR SESIÓN
app.get('/verificar-sesion', (req, res) => {
    if (req.session && req.session.userEmail) {
        res.json({
            logueado: true,
            correo: req.session.userEmail,
            rol: req.session.rol
        });
    } else {
        res.json({ logueado: false });
    }
});

// LOGIN Y REGISTRO DE USUARIOS
app.post('/registrar', (req, res) => {
    const { nombre, correo, telefono, password, codigo_admin } = req.body;
    let rolFinal = 'cliente';
    if (codigo_admin === 'TecnoDigital2026') { 
        rolFinal = 'admin';
    }

    const query = 'INSERT INTO usuarios (nombre, correo, telefono, password, rol) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [nombre, correo, telefono, password, rolFinal], (err, result) => {
        if (err) return res.status(500).send('Error al registrar: ' + err.sqlMessage);
        
        let mensaje = rolFinal === 'admin' ? '¡Bienvenido Jefe! Cuenta de administrador creada.' : '¡Usuario registrado con éxito!';
        res.send(`<script>alert('${mensaje}'); window.location.href = '/Iniciar S.html';</script>`);
    });
});

app.post('/login', (req, res) => {
    const { correo, password } = req.body;
    const query = 'SELECT * FROM usuarios WHERE correo = ? AND password = ?';
    db.query(query, [correo, password], (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        if (results.length > 0) {
            const usuario = results[0];
            req.session.userEmail = usuario.correo;
            req.session.rol = usuario.rol;
            usuario.rol === 'admin' ? res.redirect('/panel.html') : res.redirect('/index.html');
        } else {
            res.redirect('/Iniciar S.html?error=1');
        }
    });
});

// MIDDLEWARE DE PROTECCIÓN PARA EL PANEL
app.get('/panel.html', (req, res, next) => {
    if (req.session && req.session.rol === 'admin') {
        next();
    } else {
        res.send("<h1>Acceso Denegado</h1><p>Solo los administradores pueden ver esto.</p>");
    }
});

// REGISTRO DE MANTENIMIENTO
app.post('/registrar-mantenimiento', (req, res) => {
    const { nombre, direccion, cedula, celular, equipo, marca, modelo, n_serie, falla, total, abono, accesorios } = req.body;
    const saldo = parseFloat(total || 0) - parseFloat(abono || 0);

    const sqlCliente = "INSERT IGNORE INTO datos_clientes (Nombre, Direccion, Cedula, Celular) VALUES (?, ?, ?, ?)";
    db.query(sqlCliente, [nombre, direccion, cedula, celular], (err) => {
        if (err) return res.status(500).send("Error en el servidor");

        const sqlEquipo = `INSERT INTO datos_equipos (cedula_cliente, equipo, marca, modelo, N_serie, accesorios, Falla_del_equipo, Abono, Saldo, Total, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'En revisión')`;
        db.query(sqlEquipo, [cedula, equipo, marca, modelo, n_serie, accesorios, falla, abono, saldo, total], (err) => {
            if (err) return res.status(500).send("Error al registrar equipo: " + err.sqlMessage);
            res.send(`<script>alert('Registro completado.'); window.location.href = '/index.html';</script>`);
        });
    });
});

// CRUD DE ORDENES Y PRODUCTOS
app.get('/datos-panel', (req, res) => {
    const sql = `SELECT e.N_serie, c.Nombre AS cliente, c.Celular, e.equipo, e.marca, e.modelo, e.Falla_del_equipo, e.Total, e.Abono, e.Saldo, e.estado FROM datos_clientes c INNER JOIN datos_equipos e ON c.Cedula = e.cedula_cliente ORDER BY e.N_serie DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send("Error");
        res.json(results);
    });
});

app.post('/actualizar-estado', (req, res) => {
    const { n_serie, nuevo_estado } = req.body;
    db.query("UPDATE datos_equipos SET estado = ? WHERE N_serie = ?", [nuevo_estado, n_serie], (err) => {
        if (err) return res.status(500).send("Error");
        res.send("Actualizado");
    });
});

app.post('/guardar-producto', upload.single('imagen'), (req, res) => {
    const { nombre_equipo, descripcion, precio, stock, marca } = req.body;
    if (!req.file) return res.status(400).send("Sube una imagen.");
    const imagen_url = `/uploads/${req.file.filename}`;
    const query = "INSERT INTO productos (nombre_equipo, descripcion, precio, stock, marca, imagen_url) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(query, [nombre_equipo, descripcion, precio, stock, marca, imagen_url], (err) => {
        if (err) return res.status(500).send("Error al guardar.");
        res.send("¡Producto guardado!");
    });
});

app.get('/obtener-productos', (req, res) => {
    db.query("SELECT * FROM productos", (err, results) => {
        if (err) return res.status(500).send("Error");
        res.json(results);
    });
});

// LOGOUT
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/index.html');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});