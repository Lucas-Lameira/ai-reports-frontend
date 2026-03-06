import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:5000/api/v1/reports",
  timeout: 60000,
});

export default http;