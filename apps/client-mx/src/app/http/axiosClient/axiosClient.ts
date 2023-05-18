import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: 'http://localhost:8081/api/v1', // TODO provide env variable for this
});
