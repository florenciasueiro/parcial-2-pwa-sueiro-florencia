  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries


  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getFirestore, onSnapshot, collection, query, where} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";


  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDdEh1N-NEO-d0FZm7c2Yik42H5y2btoXI",
    authDomain: "rick-y-morty-app-260db.firebaseapp.com",
    projectId: "rick-y-morty-app-260db",
    storageBucket: "rick-y-morty-app-260db.appspot.com",
    messagingSenderId: "315719299171",
    appId: "1:315719299171:web:8438ce5ee30f093edf0856",
    measurementId: "G-39R3Z687V0"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);



if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js")
    .then((registration) => {
      console.log("Service worker registrado");
    })
    .catch((error) => {
      console.log("Service worker no registrado");
    });
}

const application = new Vue({
  el: '#app',
  data: {
    instalacionPendiente: true,
    eventoDeInstalacion: null,
    estadoModal: false,
    nombre_usuario: '',
    characters: [],
    historial: [],
    personajeActual: null,
    errorMessage: '',
  },
  methods: {
    instalarAplicacion() {
      if (this.eventoDeInstalacion != null) {
        this.eventoDeInstalacion.prompt()
          .then(({ outcome }) => {
            if (outcome === "accepted") {
              this.instalacionPendiente = false;
            } else {
              console.log("no se instaló");
            }
          });
      } else {
        console.log("no se puede instalar");
      }
    },
    guardarListaLocal() {
      localStorage.setItem("characters", JSON.stringify(this.characters));
    },
    guardarHistorialLocal(character) {
      this.historial.push(character);
      localStorage.setItem("historial", JSON.stringify(this.historial));
    },
    obtenerCharacterLocal(url) {
      const character = this.historial.find(char => char.url === url);
      return character || null;
    },
    obtenerListaLocal() {
      const characters = localStorage.getItem("characters");
      const historial = localStorage.getItem("historial");
      if (characters) {
        this.characters = JSON.parse(characters);
      }
      if (historial) {
        this.historial = JSON.parse(historial);
      }
    },
    mostrarModal() {
      this.estadoModal = true;
    },
    ocultarModal() {
      this.estadoModal = false;
    },
    verCharacter(character) {
      console.log("historial: ", this.historial)
      this.personajeActual = character;
      this.guardarHistorialLocal(character)
    },
    showError(errorMessage) {
      console.error('Error:', errorMessage);
      this.errorMessage = errorMessage;
    },
  },
  async mounted() {
    this.obtenerListaLocal();

    const response = await fetch("https://rickandmortyapi.com/api/character/?status=alive");
    const data = await response.json();
    this.characters = data.results;
    this.guardarListaLocal();
    console.log(this.characters);

    window.addEventListener("beforeinstallprompt", (event) => {
      this.eventoDeInstalacion = event;
      this.instalacionPendiente = true;
    });

    if (this.eventoDeInstalacion == null) {
      this.instalacionPendiente = false;
    }

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.nombre_usuario = user.email || '';
        console.log('Correo electrónico del usuario:', this.nombre_usuario);
      } else {
        // No hay usuario autenticado
      }
    });

    self.addEventListener('fetch', (event) => {
      if (event.request.url === 'https://rickandmortyapi.com/api/character/?status=alive') {
        event.respondWith(
          caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(error => {
              this.showError('Error de red. Verifica tu conexión a internet.');
              throw error;
            });
          })
        );

        event.waitUntil(
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                command: 'api-data-preloaded',
                url: 'https://rickandmortyapi.com/api/character/?status=alive'
              });
            });
          })
        );
        return;
      }
    });
  },
});
