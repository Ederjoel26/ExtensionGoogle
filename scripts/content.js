const Toast = Swal.mixin({
  toast: true,
  position: "center",
  showConfirmButton: false,
  timer: 1000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

document.addEventListener("click", function () {
  const chat = document.querySelector('div[tabindex="0"]');
  if (!chat) return;
  const chatSelected = document.querySelector("._ak7p");
  if (!chatSelected) return;
  const contactNotRegistered = chatSelected.querySelector("._ak8q");
  if (!contactNotRegistered) return;
  let textoContacto = null;
  try {
    textoContacto = contactNotRegistered
      .querySelector("._aou8 span")
      .innerHTML.trim();
  } catch (ex) {
    return;
  }
  if (!isPhoneNumber(textoContacto)) return;
  const headerContaier = document.querySelector("._ami8");
  if (!headerContaier) return;
  const headerChat = headerContaier.querySelector("._ajv2");
  if (!headerChat) return;
  const divExists = document.querySelector('div[id="AddContact"]');
  if (divExists) return;
  const divAddContact = document.createElement("div");
  divAddContact.id = "AddContact";
  divAddContact.style.height = "20px";
  divAddContact.style.width = "20px";
  const imageUrl = chrome.runtime.getURL("../images/contacto.png");
  divAddContact.style.backgroundImage = `url('${imageUrl}')`;
  divAddContact.style.backgroundSize = "cover";
  divAddContact.style.backgroundRepeat = "no-repeat";
  divAddContact.style.cursor = "pointer";
  divAddContact.addEventListener("click", async () => {
    await Swal.fire({
      title: "Agregar contacto",
      input: "text",
      inputPlaceholder: "Ingresa el nombre",
      focusConfirm: true,
      confirmButtonColor: "#0b9b84",
      showCancelButton: true,
      confirmButtonText: "Guardar contacto",
      preConfirm: async (name) => {
        if (!name) return;
        const datos = await obtenerDatosDesdeStorage();
        console.log(datos);
        const userLine = await obtenerDatosUserLine();
        console.log(userLine);
        const operator = await obtenerDatosOperator();
        console.log(operator);
        const contactData = {
          _id: "",
          Name: name,
          PhoneNumber: textoContacto,
          Date: new Date().toLocaleString("es-AR", {
            timeZone: "America/Argentina/Buenos_Aires",
          }),
          IsRegistered: false,
          IdGroup: datos,
          OperatorUser: operator,
          UserLine: userLine,
        };

        console.log(contactData);
        const hubConnection = new signalR.HubConnectionBuilder()
          .withUrl("https://apiextension.gamblingproject.org/ExtensionHub")
          .build();

        hubConnection
          .start()
          .then(() => {
            hubConnection
              .invoke("JoinGroup", contactData.IdGroup)
              .then(() => {
                console.log(`Unido al grupo: ${contactData.IdGroup}`);
                if (contactData.IdGroup === "") {
                  Toast.fire({
                    icon: "error",
                    title: "No estás logueado",
                  });
                  return;
                }
                console.log(contactData);
                hubConnection.invoke(
                  "SendMessage",
                  contactData.IdGroup,
                  JSON.stringify(contactData)
                );
                const apiUrl =
                  "https://apiextension.gamblingproject.org/api/Contact/CreateContact";
                const requestOptions = {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(contactData),
                };
                fetch(apiUrl, requestOptions)
                  .then((response) => {
                    return response.json();
                  })
                  .then((data) => {
                    console.log("Usuario creado exitosamente:", data);
                    Toast.fire({
                      icon: "success",
                      title: "Contacto agregado",
                    });
                  })
                  .catch((error) => {
                    console.error("Error al crear el usuario:", error.message);
                    Toast.fire({
                      icon: "error",
                      title: "Usuario creado anteriormente",
                    });
                  });
              })
              .catch((error) => {
                console.error(`Error al unirse al grupo: ${error}`);
              });
          })
          .catch((err) => {
            console.error("Error al conectar al hub de SignalR:", err);
          });
      },
    });
  });
  headerChat.appendChild(divAddContact);
});

function isPhoneNumber(str) {
  const regex = /^\+\d{1,3}\s?\d{1,2}\s?\d{1,2}\s?(\d\s?-*\s?){4,}$/;
  return regex.test(str);
}

function guardarDatosEnStorage(datos) {
  chrome.storage.local.set({ idGroup: datos }, function () {
    console.log("Datos guardados en chrome.storage");
  });
}

function obtenerDatosDesdeStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.get("idGroup", function (result) {
      var datos = result.idGroup || "";
      console.log("Datos obtenidos desde chrome.storage:", datos);
      resolve(datos);
    });
  });
}

function guardarDatosUserLine(datos) {
  chrome.storage.local.set({ UserLine: datos }, function () {
    console.log("Datos guardados en chrome.storage");
  });
}

async function obtenerDatosUserLine() {
  return new Promise((resolve) => {
    chrome.storage.local.get("UserLine", function (result) {
      var datos = result.UserLine || "";
      console.log("Datos obtenidos desde chrome.storage:", datos);
      resolve(datos);
    });
  });
}

async function obtenerDatosDesdeStorageAsync() {
  return new Promise((resolve) => {
    chrome.storage.local.get("idGroup", function (result) {
      var datos = result.idGroup || "";
      console.log("Datos obtenidos desde chrome.storage:", datos);
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