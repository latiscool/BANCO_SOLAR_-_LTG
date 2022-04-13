CREATE DATABASE bancosolar;

CREATE TABLE usuarios (
id SERIAL,
nombre VARCHAR(50),
balance FLOAT CHECK (balance >= 0),
 PRIMARY KEY(id)
);


CREATE TABLE transferencias (
  id SERIAL,
   emisor INT, 
   receptor INT, 
   monto FLOAT,
   fecha TIMESTAMP, 
   PRIMARY KEY(id),
   FOREIGN KEY (emisor) REFERENCES usuarios(id), 
   FOREIGN KEY (receptor) REFERENCES usuarios(id)
);


----INSERTANDO REGISTROS DE FORMA MANUAL PARA PRUEBAS
-- INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES (1, 2, 10000, CURRENT_TIMESTAMP)
-- ;


---- ******PASOS PARA LLEGAR A LA QUERY DESEADA DE OBTEMER TABLA TRANSFERENCIAS
----MUESTRA EN LA TABLAS LOS ID  de los emisores y Receptores
SELECT fecha, transferencias.emisor, transferencias.receptor,  transferencias.monto
FROM transferencias, usuarios
WHERE transferencias.emisor=usuarios.id 
;

---- En transferencias.emisor y transferencias.receptor se cambian  ¿por
---- SELECT por nombre y con la condicion que sea la id igual que emisor y del receptor

SELECT fecha,(SELECT nombre FROM usuarios WHERE id=transferencias.emisor), (SELECT nombre FROM usuarios WHERE id= transferencias.receptor),  transferencias.monto
FROM transferencias, usuarios
WHERE transferencias.emisor=usuarios.id 
;

-- SELECT*FROM transferencias;
-- SELECT*FROM usuarios;
