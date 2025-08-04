document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const qrInput = document.getElementById('qr-input');
    const qrCodeElement = document.getElementById('qr-code');
    const errorMessage = document.getElementById('error-message');
    
    let currentQRCode = null;

    generateBtn.addEventListener('click', generateQRCode);
    downloadBtn.addEventListener('click', downloadQRCode);
    qrInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateQRCode();
        }
    });

    function generateQRCode() {
        const input = qrInput.value.trim();
        errorMessage.classList.add('hidden');
        downloadBtn.classList.add('hidden');

        if (!input) {
            showError('Please enter some text or URL');
            return;
        }

        // Clear previous QR code
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
            
            // Show download button after generation
            setTimeout(() => {
                downloadBtn.classList.remove('hidden');
            }, 300);
        } catch (error) {
            console.error('QR Code generation error:', error);
            showError('Failed to generate QR code. Please try again.');
        }
    }

    function downloadQRCode() {
        if (!currentQRCode) return;
        
        try {
            const canvas = qrCodeElement.querySelector('canvas');
            if (!canvas) {
                showError('No QR code available to download');
                return;
            }
            
            // Create download link
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download error:', error);
            showError('Failed to download QR code');
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
});