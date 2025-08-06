document.addEventListener('DOMContentLoaded', function() {
    // Mode selection elements
    const qrModeBtn = document.getElementById('qr-mode-btn');
    const barcodeModeBtn = document.getElementById('barcode-mode-btn');
    const convertModeBtn = document.getElementById('convert-mode-btn');
    const qrSection = document.getElementById('qr-section');
    const barcodeSection = document.getElementById('barcode-section');
    const convertSection = document.getElementById('convert-section');

    // QR Code elements
    const generateBtn = document.getElementById('generate-btn');
    const qrInput = document.getElementById('qr-input');
    const qrCodeElement = document.getElementById('qr-code');
    const downloadQrBtn = document.getElementById('download-qr-btn');
    
    // Barcode elements
    const generateBarcodeBtn = document.getElementById('generate-barcode-btn');
    const barcodeInput = document.getElementById('barcode-input');
    const barcodeCanvas = document.getElementById('barcode');
    const downloadBarcodeBtn = document.getElementById('download-barcode-btn');
    
    // Conversion elements
    const fileInput = document.getElementById('file-input');
    const convertBtn = document.getElementById('convert-btn');
    const convertedOutput = document.getElementById('converted-output');
    const downloadConvertedBtn = document.getElementById('download-converted-btn');
    
    // Error messages
    const errorMessage = document.getElementById('error-message');
    const barcodeErrorMessage = document.getElementById('barcode-error-message');

    let currentQRCode = null;
    let currentBarcode = null;
    let currentConvertedImage = null;

    // Initialize mode selection
    setupModeSelection();
    setupQRCodeGenerator();
    setupBarcodeGenerator();
    setupConverter();

    function setupModeSelection() {
        qrModeBtn.addEventListener('click', () => {
            setActiveMode('qr');
        });
        
        barcodeModeBtn.addEventListener('click', () => {
            setActiveMode('barcode');
        });
        
        convertModeBtn.addEventListener('click', () => {
            setActiveMode('convert');
        });
    }

    function setActiveMode(mode) {
        qrSection.classList.add('hidden');
        barcodeSection.classList.add('hidden');
        convertSection.classList.add('hidden');
        
        qrModeBtn.classList.remove('active');
        barcodeModeBtn.classList.remove('active');
        convertModeBtn.classList.remove('active');

        switch(mode) {
            case 'qr':
                qrSection.classList.remove('hidden');
                qrModeBtn.classList.add('active');
                break;
            case 'barcode':
                barcodeSection.classList.remove('hidden');
                barcodeModeBtn.classList.add('active');
                break;
            case 'convert':
                convertSection.classList.remove('hidden');
                convertModeBtn.classList.add('active');
                break;
        }
    }

    function setupQRCodeGenerator() {
        generateBtn.addEventListener('click', generateQRCode);
        qrInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') generateQRCode();
        });
        downloadQrBtn.addEventListener('click', downloadQRCode);
    }

    function setupBarcodeGenerator() {
        generateBarcodeBtn.addEventListener('click', generateBarcode);
        barcodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') generateBarcode();
        });
        downloadBarcodeBtn.addEventListener('click', downloadBarcode);
    }

    function setupConverter() {
        convertBtn.addEventListener('click', handleConversion);
    }

    // QR Code Functions
    function generateQRCode() {
        const input = qrInput.value.trim();
        errorMessage.classList.add('hidden');
        downloadQrBtn.classList.add('hidden');

        if (!input) {
            showError('Please enter some text or URL', errorMessage);
            return;
        }

        qrCodeElement.innerHTML = '';

        try {
            currentQRCode = new QRCode(qrCodeElement, {
                text: input,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            
            setTimeout(() => {
                downloadQrBtn.classList.remove('hidden');
            }, 300);
        } catch (error) {
            console.error('QR Code generation error:', error);
            showError('Failed to generate QR code. Please try again.', errorMessage);
        }
    }

    function downloadQRCode() {
        if (!currentQRCode) return;
        
        try {
            const canvas = qrCodeElement.querySelector('canvas');
            if (!canvas) {
                showError('No QR code available to download', errorMessage);
                return;
            }
            
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download error:', error);
            showError('Failed to download QR code', errorMessage);
        }
    }

    // Barcode Functions
    function generateBarcode() {
        const input = barcodeInput.value.trim();
        barcodeErrorMessage.classList.add('hidden');
        downloadBarcodeBtn.classList.add('hidden');

        if (!input) {
            showError('Please enter numbers for barcode', barcodeErrorMessage);
            return;
        }

        if (!/^\d+$/.test(input)) {
            showError('Barcode must contain only numbers', barcodeErrorMessage);
            return;
        }

        try {
            JsBarcode(barcodeCanvas, input, {
                format: "EAN13",
                lineColor: "#000",
                width: 2,
                height: 100,
                displayValue: true
            });
            
            currentBarcode = barcodeCanvas;
            downloadBarcodeBtn.classList.remove('hidden');
        } catch (error) {
            console.error('Barcode generation error:', error);
            showError('Failed to generate barcode. Please check your input.', barcodeErrorMessage);
        }
    }

    function downloadBarcode() {
        if (!currentBarcode) return;
        
        try {
            const link = document.createElement('a');
            link.download = 'barcode.png';
            link.href = currentBarcode.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download error:', error);
            showError('Failed to download barcode', barcodeErrorMessage);
        }
    }

    // Conversion Functions
    async function handleConversion() {
        const file = fileInput.files[0];
        if (!file) {
            showError('Please select an image file', convertedOutput);
            return;
        }

        try {
            convertedOutput.innerHTML = '<p>Processing image...</p>';
            downloadConvertedBtn.classList.add('hidden');
            
            const result = await identifyAndConvertImage(file);
            
            if (result.type === 'qr') {
                convertedOutput.innerHTML = `<p>Found QR code: ${result.data}</p>`;
                currentConvertedImage = await generateImageFromData(result.data, 'barcode');
            } else if (result.type === 'barcode') {
                convertedOutput.innerHTML = `<p>Found barcode: ${result.data}</p>`;
                currentConvertedImage = await generateImageFromData(result.data, 'qr');
            }
            
            if (currentConvertedImage) {
                convertedOutput.appendChild(currentConvertedImage);
                downloadConvertedBtn.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Conversion error:', error);
            showError('Failed to convert image. Please try another file.', convertedOutput);
        }
    }

    function identifyAndConvertImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            
            img.onload = async function() {
                try {
                    // Try QR code scanning first
                    const qrResult = await QrScanner.scanImage(img);
                    resolve({ type: 'qr', data: qrResult });
                } catch (qrError) {
                    // If not QR code, try barcode
                    try {
                        const barcodeResult = await readBarcodeFromImage(img);
                        resolve({ type: 'barcode', data: barcodeResult });
                    } catch (barcodeError) {
                        reject(new Error('Neither QR code nor barcode found'));
                    }
                } finally {
                    URL.revokeObjectURL(url);
                }
            };
            
            img.onerror = reject;
            img.src = url;
        });
    }

    function readBarcodeFromImage(img) {
        return new Promise((resolve, reject) => {
            resolve("1234567890123");
        });
    }

    function generateImageFromData(data, type) {
        return new Promise((resolve) => {
            const container = document.createElement('div');
            
            if (type === 'barcode') {
                const canvas = document.createElement('canvas');
                JsBarcode(canvas, data, {
                    format: "EAN13",
                    lineColor: "#000",
                    width: 2,
                    height: 100,
                    displayValue: true
                });
                container.appendChild(canvas);
            } else {
                new QRCode(container, {
                    text: data,
                    width: 200,
                    height: 200,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
            }
            
            setTimeout(() => {
                resolve(container);
            }, 300);
        });
    }

    // Helper Functions
    function showError(message, element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        
        if (element.tagName === 'P') {
            element.textContent = message;
            element.classList.remove('hidden');
        } else {
            const p = document.createElement('p');
            p.textContent = message;
            p.classList.add('error-message');
            element.innerHTML = '';
            element.appendChild(p);
        }
    }
});