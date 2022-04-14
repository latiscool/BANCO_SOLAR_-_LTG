const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'bancosolar',
  password: 'postgresql',
  port: 5432,
});

const guardarUsuarios = async (datos) => {
  const consulta = {
    text: 'INSERT INTO usuarios(nombre,balance) values ($1, $2) RETURNING *;',
    values: datos,
  };
  try {
    const result = await pool.query(consulta);
    return result;
  } catch (err) {
    console.log('Error: ', err);
    return err;
  }
};

const getUsuarios = async () => {
  const query = {
    text: 'SELECT * FROM usuarios;',
  };
  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (error) {
    console.log('Error: ' + error);
    return error;
  }
};

const editUsuario = async (datos, id) => {
  const values = Object.values(datos);
  const query = {
    text: `UPDATE usuarios SET nombre = $1 , balance=$2 WHERE id =${id}  RETURNING *;`,
    values,
  };

  try {
    const res = pool.query(query);
    return res;
  } catch (error) {
    console.log('Error: ', error);
  }
};

const eliminarUsuario = async (id) => {
  const query = {
    text: `DELETE FROM usuarios WHERE id =${id} RETURNING *;`,
  };
  try {
    const res = await pool.query(query);
    console.log('Regisrtro Eliminado con exito');
    return res.rows;
  } catch (error) {
    console.log('Error: ', error);
    return error;
  }
};

const postTransferencias = async (datos) => {
  const data = Object.values(datos); //Indices   0         1        2
  //console.log('data', data); //Arreglo con ['emisor','receptor','monto']
  //console.log('data0', data[0]); //Capta el emisor

  const cta1Res = {
    name: 'Emisor descontar Saldo cuenta1',
    text: `UPDATE usuarios SET balance=balance - $1 WHERE id=(SELECT id FROM usuarios WHERE nombre= $2)  RETURNING *; ;`,
    values: [Number(data[2]), data[0]],
  };

  const cta2Add = {
    name: 'Receptor Adiciona Saldo cuenta2',
    text: `UPDATE usuarios SET balance=balance + $1 WHERE id=(SELECT id FROM usuarios WHERE nombre= $2)  RETURNING *; ;`,
    values: [Number(data[2]), data[1]],
  };

  const doTrans = {
    name: 'Registro trans de cta 1 a cta2',
    text: `INSERT INTO transferencias (emisor, receptor, monto, fecha)
     VALUES (
    (SELECT id FROM usuarios WHERE nombre= $1),
    (SELECT id FROM usuarios WHERE nombre= $2), 
    $3, 
    CURRENT_TIMESTAMP
    ) RETURNING *;`,
    values: [data[0], data[1], Number(data[2])],
  };

  try {
    await pool.query('BEGIN');
    await pool.query(cta1Res);
    await pool.query(cta2Add);
    await pool.query(doTrans);
    console.log('Se ha realizado la tranferencia con exito');
    await pool.query('COMMIT');
    return true;
  } catch (error) {
    console.log('Ups.!! NO SE REALIZO LA TRANSFERENCIA');
    await pool.query('ROLLBACK');
    throw error;
  }
};

const getTransferencias = async () => {
  const query = {
    rowMode: 'array', //se debe entregar en forma de arreglo (, sino entrega undefined)
    text: `SELECT fecha,(SELECT nombre FROM usuarios WHERE id=transferencias.emisor), (SELECT nombre FROM usuarios WHERE id= transferencias.receptor),  transferencias.monto
    FROM transferencias, usuarios
    WHERE transferencias.emisor=usuarios.id 
    ;
    `,
  };

  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (error) {
    console.log('Error: ', error);
    return error;
  }
};

module.exports = {
  guardarUsuarios,
  getUsuarios,
  editUsuario,
  eliminarUsuario,
  postTransferencias,
  getTransferencias,
};
