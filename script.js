document.addEventListener('DOMContentLoaded', function() {
    // Mode selection elements
    const qrModeBtn = document.getElementById('qr-mode-btn');
    const barcodeModeBtn = document.getElementById('barcode-mode-btn');
    const qrSection = document.getElementById('qr-section');
    const barcodeSection = document.getElementById('barcode-section');

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
    
    // Error messages
    const errorMessage = document.getElementById('error-message');
    const barcodeErrorMessage = document.getElementById('barcode-error-message');

    let currentQRCode = null;
    let currentBarcode = null;

    // Initialize mode selection
    setupModeSelection();
    setupQRCodeGenerator();
    setupBarcodeGenerator();

    function setupModeSelection() {
        qrModeBtn.addEventListener('click', () => {
            setActiveMode('qr');
        });
        
        barcodeModeBtn.addEventListener('click', () => {
            setActiveMode('barcode');
        });
    }

    function setActiveMode(mode) {
        qrSection.classList.add('hidden');
        barcodeSection.classList.add('hidden');
        
        qrModeBtn.classList.remove('active');
        barcodeModeBtn.classList.remove('active');

        switch(mode) {
            case 'qr':
                qrSection.classList.remove('hidden');
                qrModeBtn.classList.add('active');
                break;
            case 'barcode':
                barcodeSection.classList.remove('hidden');
                barcodeModeBtn.classList.add('active');
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