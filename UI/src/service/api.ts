import axios from 'axios';

const api = axios.create({
  baseURL: 'https://pdvapiservice.thankfulocean-9b8c28e9.eastus.azurecontainerapps.io',
});

export default api;
