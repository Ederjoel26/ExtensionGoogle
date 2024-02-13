const login = document.getElementById("login");
const loged = document.getElementById("loged");
const idGroupCookie = obtenerMensajeDeCookies();

if(idGroupCookie === null){
    login.style.display = "block";
    loged.style.display = "none";

    const idGroup = generateRandomId();
    
    console.log(idGroup);
    
    generateQRCode(idGroup);
    
    const hubConnection = new signalR.HubConnectionBuilder()
        .withUrl('https://savecontact.bsite.net/ExtensionHub')
        .build();
    
    hubConnection.start().then(() => {
        console.log('Conectado al hub de SignalR');
        hubConnection.invoke('JoinGroup', idGroup)
            .then(() => {
                console.log(`Unido al grupo: ${idGroup}`);
            })
            .catch(error => {
                console.error(`Error al unirse al grupo: ${error}`);
            });
    }).catch(err => {
        console.error('Error al conectar al hub de SignalR:', err);
    });
    
    hubConnection.on('ReceiveMessage', (user, message) => {
        agregarMensajeACookies(message);
        login.style.display = "none";
        loged.style.display = "block";
    });
}else{
    login.style.display = "none";
    loged.style.display = "block";
}


function generateRandomId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const timestamp = new Date().getTime();
    const randomSuffix = Array.from({ length: 6 }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
    const randomId = `group_${timestamp}_${randomSuffix}`;
    return randomId;
}

function agregarMensajeACookies(mensaje) {
    const cookiesActuales = document.cookie;
    const nuevaCookie = `idGroup=${encodeURIComponent(mensaje)}; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    document.cookie = cookiesActuales + ';' + nuevaCookie;
}

function obtenerMensajeDeCookies() {
    const cookies = document.cookie;
    const cookiesArray = cookies.split(';');
    for (const cookie of cookiesArray) {
        const [nombre, valor] = cookie.trim().split('=');
        if (nombre === 'idGroup') {
            return decodeURIComponent(valor);
        }
    }
    return null;
}

function generateQRCode(text) {
  const qr = new QRious({
    element: document.getElementById('qrcode'),
    value: text,
    size: 250, 
  });
}