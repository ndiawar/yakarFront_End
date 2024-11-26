import axios from 'axios';

// Configuration globale d'Axios
axios.defaults.baseURL = 'http://localhost:5001/api/';  // URL de base
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';
axios.defaults.withCredentials = false;  // Désactiver l'envoi de cookies pour l'instant

// Intercepteur pour gérer les erreurs globalement
// axios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error('Erreur API:', error.response || error.message);
//     return Promise.reject(error);
//   }
// );
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.warn('Ressource non trouvée (404).');
        // Vous pouvez rediriger ou effectuer une autre action ici si nécessaire
      } else {
        console.error('Erreur API:', error.response?.data || error.message);
      }
    } else {
      console.error('Erreur inattendue:', error);
    }
    return Promise.reject(error); // Propager l'erreur pour des cas spécifiques
  }
);


export default axios; // Exporte l'instance configurée d'Axios
