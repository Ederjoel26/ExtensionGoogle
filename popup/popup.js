const login = document.getElementById("login");
const loged = document.getElementById("logged");
const inputUserName = document.getElementById("username");
const inputPassword = document.getElementById("password");
const btnReInicio = document.getElementById("reInicio");
const btnLogin = document.getElementById("loginButton");
let labelLine = document.getElementById("lineName");
let labelContactsAdded = document.getElementById("contactsAdded");
const linkExtension = "https://apiextension.gamblingproject.org/";
let valorCookie = "";

const ejecutar = () => {
    obtenerDatosDesdeStorage(async (datos) => {
        try {
            if (datos !== valorCookie) {
                labelLine.innerText = await obtenerDatosUserLine();
                login.style.display = "none";
                loged.style.display = "block";
                return;
            }
            login.style.display = "block";
            loged.style.display = "none";
            const response = await fetch(`${linkExtension}api/User/LoginExtension?UserName=${inputUserName.value}&Password=${inputPassword.value}`);
            let data = "";
            if(!response.ok){
                data = await response.text();
                if(data === "User no exists"){
                    window.alert("El usuario ingresado no existe.");
                }else if(data === "Incorrect password"){
                    window.alert("La contraseña es incorrecta.");
                }else if(data === "User is not active"){
                    window.alert("El usuario está dado de baja.");
                }else if(data === "Line not found"){
                    window.alert("La linea a la que esta registrado no existe.");
                }
                return;
            }
            data = await response.json();
            guardarDatosEnStorage(data.keyGroup);
            guardarDatosUserLine(data.lineName);
            guardarDatosOperator(inputUserName.value);
            ocultarLogin();
        } catch (error) {
            console.error('Error en la ejecución:', error);
        } finally {

        }
    });
} 

ocultarLogin();

btnLogin.addEventListener('click', () => {
    ejecutar();
});

btnReInicio.addEventListener('click', () => {
    obtenerDatosDesdeStorage( async datos => {
        labelLine.innerText = await obtenerDatosUserLine();
        labelContactsAdded.innerText = await contactosAgregadosOperador(await obtenerDatosOperator());
        valorCookie = datos;
        ocultarLogin();
    });
});

async function contactosAgregadosOperador(nombreOperador) {
    try {
        console.log(nombreOperador);
        const monthName = obtenerMesActual();
        const response = await fetch(`${linkExtension}api/Contact/GetContactsOperatorPerMonth/MonthName?MonthName=${monthName}`);
        const data = await response.json();
        const operador = data.find(d => d.userName === nombreOperador);
        if (!operador) {
            return 0;
        }
        const contador = operador.contactsCount.reduce((total, element) => total + element.contacts, 0);
        return contador;
    } catch (error) {
        console.error("Error en la función contactosAgregadosOperador:", error);
        return 0;
    }
}

// Función para obtener el nombre del mes actual
function obtenerMesActual() {
    const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    const fechaActual = new Date();
    const nombreMes = meses[fechaActual.getMonth()];
    return nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
}


function ObtenerMesActual(){
    var fechaActual = new Date();
    var meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    var nombreMes = meses[fechaActual.getMonth()];
    nombreMes = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
    return nombreMes;
}

function ocultarLogin() {
    obtenerDatosDesdeStorage(async (datos) => {
        if (datos !== valorCookie) {
            login.style.display = "none";
            loged.style.display = "block";
            labelLine.innerText = await obtenerDatosUserLine();
            labelContactsAdded.innerText = await contactosAgregadosOperador(await obtenerDatosOperator());
            return;
        }
        login.style.display = "block";
        loged.style.display = "none";
    });
}

// Guardar datos en chrome.storage
function guardarDatosEnStorage(datos) {
    chrome.storage.local.set({ 'idGroup': datos }, function () {
        console.log('Datos guardados en chrome.storage');
    });
}

// Obtener datos desde chrome.storage
function obtenerDatosDesdeStorage(callback) {
    chrome.storage.local.get('idGroup', function (result) {
        var datos = result.idGroup || '';
        console.log('Datos obtenidos desde chrome.storage:', datos);
        callback(datos);
    });
}

function guardarDatosUserLine(datos) {
    chrome.storage.local.set({ 'UserLine': datos }, function () {
        console.log('Datos guardados en chrome.storage');
    });
}
  
async function obtenerDatosUserLine() {
    return new Promise((resolve) => {
        chrome.storage.local.get('UserLine', function (result) {
            var datos = result.UserLine || '';
            console.log('Datos obtenidos desde chrome.storage UserLine:', datos);
            resolve(datos);
        });
    });
}

function guardarDatosOperator(datos) {
    chrome.storage.local.set({ 'Operator': datos }, function () {
        console.log('Datos guardados en chrome.storage');
    });
}
  
async function obtenerDatosOperator() {
    return new Promise((resolve) => {
        chrome.storage.local.get('Operator', function (result) {
            var datos = result.Operator || '';
            console.log('Datos obtenidos desde chrome.storage Operator:', datos);
            resolve(datos);
        });
    });
}