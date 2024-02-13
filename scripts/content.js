const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

document.addEventListener('click', function() {
    const chat = document.querySelector('div[tabindex="0"]');
    if (!chat) return;
    const contactNotRegistered = document.querySelector('._3W2ap span.ggj6brxn');
    if(!contactNotRegistered) return;
    console.log(contactNotRegistered.innerHTML);
    if(!isPhoneNumber(contactNotRegistered.innerHTML)) return;
    const headerChat = document.querySelector("._1VwoK ._1sPvB");
    const divExists = document.querySelector('div[id="AddContact"]');
    if (divExists) return;
    const divAddContact = document.createElement('div');
    divAddContact.id = "AddContact";
    divAddContact.style.height = "20px";
    divAddContact.style.width = '20px';
    const imageUrl = chrome.runtime.getURL('../images/contacto.png');
    divAddContact.style.backgroundImage = `url('${imageUrl}')`;
    divAddContact.style.backgroundSize = 'cover'; 
    divAddContact.style.backgroundRepeat = 'no-repeat';
    divAddContact.style.cursor = "pointer";
    divAddContact.addEventListener('click', async () => {
      await Swal.fire({
        title: "Agregar contacto",
        html: `<div style="display: flex; flex-direction: column; margin-bottom: 10px;">
                <input type="text" id="swal-input1" placeholder="Ingresa el nombre" class="swal2-input">
              </div>
              `,
        focusConfirm: false,
        confirmButtonColor: "#0b9b84",
        confirmButtonText: "Guardar contacto",
        preConfirm: () => {
          const name =  document.getElementById("swal-input1").value;
          
          if(name == "") return;

          const contactData = {
            Name: name,
            Number: contactNotRegistered.innerHTML,
            Date: new Date(),
            isRegistered: false,
            idGroup: obtenerMensajeDeCookies()
          }
          
          const hubConnection = new signalR.HubConnectionBuilder()
            .withUrl('https://savecontact.bsite.net/ExtensionHub')
            .build();
        
            hubConnection.start().then(() => {
                console.log('Conectado al hub de SignalR');
                hubConnection.invoke('JoinGroup', "Eder Joel")
                    .then(() => {
                        console.log(`Unido al grupo: Eder Joel`);
                        if(contactData.idGroup === null) {
                          Toast.fire({
                            icon: "error",
                            title: "No estás logueado"
                          });
                          return;
                        }
                        hubConnection.invoke('SendMessage', "Eder Joel", JSON.stringify(contactData));
                        Toast.fire({
                          icon: "success",
                          title: "Contacto agregado"
                        });
                        console.log('success');
                    })
                    .catch(error => {
                        console.error(`Error al unirse al grupo: ${error}`);
                    });
            }).catch(err => {
                console.error('Error al conectar al hub de SignalR:', err);
            });
        }
      });
      
    });
    headerChat.appendChild(divAddContact);
});

function isPhoneNumber(str) {
  const regex = /^\+\d{1,3}\s?\d{1,2}\s?\d{1,2}\s?(\d\s?-*\s?){4,}$/;
  return regex.test(str);
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