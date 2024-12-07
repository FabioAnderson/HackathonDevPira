const express = require('express');
const bodyParser = require('body-parser');
const sharp = require('sharp');
const ExifParser = require('exif-parser');
const axios = require('axios');
const async = require('async');
const fs = require('fs');
const https = require('https');
const path = require("path");
const createReadStream = require('fs').createReadStream
const sleep = require('util').promisify(setTimeout);
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;
const punycode = require('punycode/');


const key = "";
const endpoint = "";

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
  const parsedImage = sharp(imagemBase64);
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
  // const url = `${azureEndpoint}/vision/v3.2/analyze`;
  // const params = {
  //   visualFeatures: 'Categories,Tags,Description',  // Atributos que queremos da imagem
  //   details: 'Celebrities,Landmarks',  // Pode adicionar mais detalhes conforme necessário
  // };

  // try {
  //   const response = await axios.post(url, {
  //     data: imagemBase64
  //   }, {
  //     headers: {
  //       'Ocp-Apim-Subscription-Key': azureApiKey,
  //       'Content-Type': 'application/json'
  //     },
  //     params: params
  //   });

  //   return response.data;  // Retorna os dados da análise da imagem
  // } catch (error) {
  //   console.error('Erro ao chamar a API do Azure:', error);
  //   throw error;  // Lança o erro para ser tratado em outro lugar, se necessário
  // }

  const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } }), endpoint);
  /**
   * END - Authenticate
   */


  function computerVision(imagemBase64) {
    async.series([
      async function () {

        /**
         * DETECT TAGS  
         * Detects tags for an image, which returns:
         *     all objects in image and confidence score.
         * 
         * const buffer = Buffer.from(imagemBase64, 'base64');
         */

        const buffer = Buffer.from(imagemBase64, 'base64');

        // Image of different kind of dog.
        const tagsURL = 'https://github.com/Azure-Samples/cognitive-services-sample-data-files/blob/master/ComputerVision/Images/house.jpg';

        // Analyze URL image
        console.log('Analyzing tags in image...', tagsURL.split('/').pop());
        const tags = (await computerVisionClient.analyzeImage(tagsURL, { visualFeatures: ['Tags'] })).tags;
        console.log(`Tags: ${formatTags(tags)}`);

        // Format tags for display
        function formatTags(tags) {
          return tags.map(tag => (`${tag.name} (${tag.confidence.toFixed(2)})`)).join(', ');
        }
        /**
         * END - Detect Tags
         */
        console.log();

      },
      function () {
        return new Promise((resolve) => {
          resolve();
        })
      }
    ], (err) => {
      throw (err);
    });
  }

  computerVision();

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
