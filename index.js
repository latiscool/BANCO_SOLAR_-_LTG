const http = require('http');
const fs = require('fs');
const url = require('url');
const open = require('open');
const PORT = 3000;
const host = 'localhost';
const {
  guardarUsuarios,
  getUsuarios,
  editUsuario,
  eliminarUsuario,
  postTransferencias,
  getTransferencias,
} = require('./consultas');

open(`http://${host}:${PORT}/`, function (err) {
  if (err) throw err;
});

const requestListener = async (req, res) => {
  //RUTA RAIZ SERVER
  if (req.url == '/' && req.method === 'GET') {
    fs.readFile('index.html', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end();
      } else {
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
      }
    });
  }
  //RUTA POST - REGISTRAR USUARIOS Y BALANCES
  if (req.url == '/usuario' && req.method == 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', async () => {
      const datos = Object.values(JSON.parse(body));
      const respuesta = await guardarUsuarios(datos);
      res.end(JSON.stringify(respuesta));
    });
  }
  //RUTA GET - VISUALIZAR USUARIOS EN HTML
  if (req.url == '/usuarios' && req.method === 'GET') {
    try {
      const usuarios = await getUsuarios();
      res.statusCode = 201;
      res.end(JSON.stringify(usuarios));
    } catch (error) {
      res.statusCode = 500;
      res.end('Ha ocurrido un error ' + error);
    }
  }

  //RUTA PUT - ACTUALIZAR REGISTRO USUARIOS
  if (req.url.startsWith('/usuario?id') && req.method === 'PUT') {
    let body = '';
    req.on('data', (chunk) => {
      body = chunk.toString();
    });
    req.on('end', async () => {
      const usuarios = JSON.parse(body);
      try {
        let { id } = url.parse(req.url, true).query;
        const respuesta = await editUsuario(usuarios, id);
        res.statusCode = 200;
        res.end(JSON.stringify(respuesta));
      } catch (error) {
        res.statusCode = 500;
        res.end('Ha oucrrido un error: ' + error);
      }
    });
  }

  //RUTA DELETE
  if (req.url.startsWith('/usuario?id') && req.method === 'DELETE') {
    try {
      let { id } = url.parse(req.url, true).query;
      await eliminarUsuario(id);
      res.statusCode = 201;
      res.end('Candidato Eliminado');
    } catch (error) {
      res.statusCode = 500;
      res.end('Ha oucrrido un error: ' + error);
    }
  }

  //// RUTA  POST TRANSFERENCIAS
  if (req.url == '/transferencia' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body = chunk.toString();
    });
    req.on('end', async () => {
      const trans = JSON.parse(body);
      const respuesta = await postTransferencias(trans);
      res.end(JSON.stringify(respuesta));
    });
  }

  //// RUTA GET TRANSFERENCIAS - Visualizar tranferencias en la tabla

  if (req.url == '/transferencias' && req.method === 'GET') {
    try {
      const trans = await getTransferencias();
      res.statusCode = 201;
      res.end(JSON.stringify(trans));
    } catch (error) {
      res.statusCode = 500;
      res.end('Ha ocurrido un error ' + error);
    }
  }

  //FIN SERVER
};

//ARMANDO SERVER

const server = http.createServer(requestListener);

//LEVANTANDO SERVER

server.listen(PORT, host, () => {
  console.log('Servidor se esta ejcutando');
});
