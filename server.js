const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'inventario_medico',
});

db.connect((err) => {
  if (err) {
    console.log('Error MySQL:', err);
    return;
  }

  console.log('MySQL conectado');
});



app.post('/auth/login', (req, res) => {

  const { email, password } = req.body;

  console.log(email);
  console.log(password);

  const sql = `
    SELECT *
    FROM usuarios
    WHERE email = ?
    AND password = ?
    AND activo = 1
  `;

  db.query(
    sql,
    [email, password],
    (err, results) => {

      if (err) {

        console.log(err);

        return res.status(500).json({
          success: false,
          error: 'Error del servidor',
        });
      }

      console.log(results);

      if (results.length === 0) {

        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas',
        });
      }

      const usuario = results[0];

      res.json({
        success: true,

        user: {
          id: usuario.id,
          name: usuario.nombre,
          email: usuario.email,
          role: usuario.rol,
        }
      });
    }
  );
});
app.get('/articulos', (req, res) => {

  const sql = `
    SELECT 
      a.id,
      a.nombre,
      a.cantidad,
      a.unidad_medida,
      a.ubicacion,
      a.fecha_vencimiento,
      a.min_stock,
      c.nombre AS categoria,
      p.nombre AS proveedor
    FROM articulos a
    LEFT JOIN categorias c
      ON a.categoria_id = c.id
    LEFT JOIN proveedores p
      ON a.proveedor_id = p.id
    ORDER BY a.id DESC
  `;

  db.query(sql, (err, results) => {

    if (err) {
      console.log(err);

      return res.status(500).json({
        error: 'Error al obtener artículos',
      });
    }

    res.json(results);
  });
});

app.post('/articulos', (req, res) => {

  const {
    nombre,
    categoria,
    cantidad,
    unidad_medida,
    ubicacion,
    fecha_vencimiento,
    min_stock,
    proveedor,
  } = req.body;

  const buscarCategoria = `
    SELECT id
    FROM categorias
    WHERE nombre = ?
    LIMIT 1
  `;

  db.query(
    buscarCategoria,
    [categoria],
    (err, categoriaResult) => {

      if (err) {
        console.log(err);

        return res.status(500).json({
          error: 'Error categoría',
        });
      }

      let categoriaId = null;

      if (categoriaResult.length > 0) {
        categoriaId = categoriaResult[0].id;
      }

      const buscarProveedor = `
        SELECT id
        FROM proveedores
        WHERE nombre = ?
        LIMIT 1
      `;

      db.query(
        buscarProveedor,
        [proveedor],
        (err2, proveedorResult) => {

          if (err2) {
            console.log(err2);

            return res.status(500).json({
              error: 'Error proveedor',
            });
          }

          let proveedorId = null;

          if (proveedorResult.length > 0) {
            proveedorId = proveedorResult[0].id;
          }

          const sql = `
            INSERT INTO articulos (
              nombre,
              categoria_id,
              cantidad,
              unidad_medida,
              ubicacion,
              fecha_vencimiento,
              min_stock,
              proveedor_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

          db.query(
            sql,
            [
              nombre,
              categoriaId,
              cantidad,
              unidad_medida,
              ubicacion,
              fecha_vencimiento,
              min_stock,
              proveedorId,
            ],
            (err3, result) => {

              if (err3) {
                console.log(err3);

                return res.status(500).json({
                  error: 'Error insertando',
                });
              }

              res.json({
                message: 'Artículo agregado',
                id: result.insertId,
              });
            }
          );
        }
      );
    }
  );
});


app.put('/articulos/:id', (req, res) => {

  const { id } = req.params;

  const {
    nombre,
    categoria,
    cantidad,
    unidad_medida,
    ubicacion,
    fecha_vencimiento,
    min_stock,
    proveedor,
  } = req.body;

  const buscarCategoria = `
    SELECT id
    FROM categorias
    WHERE nombre = ?
    LIMIT 1
  `;

  db.query(
    buscarCategoria,
    [categoria],
    (err, categoriaResult) => {

      if (err) {
        console.log(err);

        return res.status(500).json({
          error: 'Error categoría',
        });
      }

      let categoriaId = null;

      if (categoriaResult.length > 0) {
        categoriaId = categoriaResult[0].id;
      }

      const buscarProveedor = `
        SELECT id
        FROM proveedores
        WHERE nombre = ?
        LIMIT 1
      `;

      db.query(
        buscarProveedor,
        [proveedor],
        (err2, proveedorResult) => {

          if (err2) {
            console.log(err2);

            return res.status(500).json({
              error: 'Error proveedor',
            });
          }

          let proveedorId = null;

          if (proveedorResult.length > 0) {
            proveedorId = proveedorResult[0].id;
          }

          const sql = `
            UPDATE articulos
            SET
              nombre = ?,
              categoria_id = ?,
              cantidad = ?,
              unidad_medida = ?,
              ubicacion = ?,
              fecha_vencimiento = ?,
              min_stock = ?,
              proveedor_id = ?
            WHERE id = ?
          `;

          db.query(
            sql,
            [
              nombre,
              categoriaId,
              cantidad,
              unidad_medida,
              ubicacion,
              fecha_vencimiento,
              min_stock,
              proveedorId,
              id,
            ],
            (err3) => {

              if (err3) {
                console.log(err3);

                return res.status(500).json({
                  error: 'Error actualizando',
                });
              }

              res.json({
                message: 'Artículo actualizado',
              });
            }
          );
        }
      );
    }
  );
});

app.delete('/articulos/:id', (req, res) => {

  const { id } = req.params;

  const sql = `
    DELETE FROM articulos
    WHERE id = ?
  `;

  db.query(
    sql,
    [id],
    (err) => {

      if (err) {
        console.log(err);

        return res.status(500).json({
          error: 'Error eliminando',
        });
      }

      res.json({
        message: 'Artículo eliminado',
      });
    }
  );
});

app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});