import axios from 'axios';

const haciendaApi = axios.create({
  baseURL: 'https://api.hacienda.go.cr/fe/ae',
});

export default haciendaApi;