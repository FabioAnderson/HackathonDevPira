const express = require('express');
const bodyParser = require('body-parser');
const sharp = require('sharp');
const ExifParser = require('exif-parser');
const axios = require('axios');

const app = express();
const port = 3000;

const azureApiKey = '';
const azureEndpoint = '';

// Middleware para parsear o corpo da requisição como JSON
app.use(bodyParser.json({ limit: '10mb' }));


async function verificarGPS(imagemBase64) {

  // Converte a imagem Base64 para um buffer
  const buffer = Buffer.from(imagemBase64, 'base64');

  // Usa sharp para ler os metadados EXIF da imagem
  const parsedImage = sharp(buffer);
  const metadata = await parsedImage.metadata();

  if (metadata.exif) {
    // Parser dos metadados EXIF
    const parser = ExifParser.create(metadata.exif);
    const exifData = parser.parse();

    // Verifica se há informações de GPS
    if (exifData.tags.GPSLatitude && exifData.tags.GPSLongitude) {
      const gpsData = {
        latitude: exifData.tags.GPSLatitude,
        longitude: exifData.tags.GPSLongitude
      };
      return gpsData;
    } else {
      return null
    }
  }

}


async function verificarEspecie(imagemBase64) {
  const url = `${azureEndpoint}/vision/v3.2/analyze`;
  const params = {
    visualFeatures: 'Categories,Tags,Description',  // Atributos que queremos da imagem
    details: 'Celebrities,Landmarks',  // Pode adicionar mais detalhes conforme necessário
  };

  try {
    const response = await axios.post(url, {
      data: imagemBase64
    }, {
      headers: {
        'Ocp-Apim-Subscription-Key': azureApiKey,
        'Content-Type': 'application/json'
      },
      params: params
    });

    return response.data;  // Retorna os dados da análise da imagem
  } catch (error) {
    console.error('Erro ao chamar a API do Azure:', error);
    throw error;  // Lança o erro para ser tratado em outro lugar, se necessário
  }
}


// Rota principal da API
app.post('/upload', async (req, res) => {
  try {
    // A imagem em Base64 é passada no corpo da requisição
    const imagemBase64 = req.body.foto;
    const usuario = req.body.usuario;

    //console.log(imagemBase64)

    if (!imagemBase64) {
      return res.status(400).send({ message: 'Imagem em Base64 não fornecida' });
    }

    let gpsData = await verificarGPS(imagemBase64);

    //console.log(gpsData)

    let animalData = await verificarEspecie(imagemBase64);

    console.log(animalData)


    return res.status(200).send({ message: gpsData })

  } catch (error) {
    console.error('Erro ao processar a imagem:', error);
    return res.status(500).send({ message: 'Erro ao processar a imagem' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
