const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(bodyParser.json());

// Usa el middleware cors para habilitar CORS
app.use(cors({
  origin: 'http://localhost:3000', // Cambia esto si tu aplicación React se ejecuta en otro puerto
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

// Array para almacenar los datos de los frames
const frames = [];

// Ruta para recibir imágenes
app.post('/upload', (req, res) => {
  const { frameData } = req.body;

  // Almacena los datos del frame en el array
  frames.push(frameData);

  console.log('Received frame data:', frameData);

  res.status(200).json({ message: 'Image received successfully' });
});

// Ruta para ver los frames almacenados
app.get('/frames', (req, res) => {
  res.json({ frames });
});

// Ruta para servir imágenes decodificadas
app.get('/images/:index', (req, res) => {
  const index = req.params.index;
  if (frames[index]) {
    const imageData = frames[index].split(',')[1]; // Elimina el encabezado "data:image/jpeg;base64,"
    const imageBuffer = Buffer.from(imageData, 'base64');
    res.contentType('image/jpeg');
    res.send(imageBuffer);
  } else {
    res.status(404).send('Image not found');
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
