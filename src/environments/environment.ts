// Configurazione per sviluppo locale.
// In produzione (ng build --configuration production) viene usato environment.production.ts
export const environment = {
  production: false,
  // Indirizzo del NAS — cambia con l'IP del tuo Unraid se diverso
  apiUrl: 'http://192.168.1.177:8080',
};
