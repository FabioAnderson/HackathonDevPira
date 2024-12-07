document.getElementById('acessarCameraBtn').addEventListener('click', function() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(function(stream) {
                var video = document.getElementById('videoElement');
                video.srcObject = stream;
            })
            .catch(function(error) {
                console.error('Erro ao acessar a câmera:', error);
            });
    } else {
        console.log('Acesso à câmera não é suportado pelo navegador.');
    }
});

document.getElementById('captureBtn').addEventListener('click', function() {
    var video = document.getElementById('videoElement');
    var canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    var dataURL = canvas.toDataURL('image/jpg');
    var capturedImage = document.getElementById('capturedImage');   

    capturedImage.src = dataURL;


    // Converter a imagem para Base64 e exibir 
    var imagemBase64 = document.getElementById('base64Output'); 
    imagemBase64.textContent = dataURL;

    var dados = {
        'usuario': 'admin',
        'foto': imagemBase64
    };
    
    //adiciono aqui a api
    fetch('https://exemplo.com/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })

    .then(response => response.json())
    .then(data => {
        console.log('Sucesso:', data);
    })
    .catch((error) => {
        console.error('Erro:', error);
    });
});

document.getElementById('saveBtn').addEventListener('click', function() { var capturedImage = document.getElementById('capturedImage');
var link = document.createElement('a');
link.href = capturedImage.src;
link.download = 'img/imagem_capturada.jpg'; // Nome do arquivo salvo
link.click();

});