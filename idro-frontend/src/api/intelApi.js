import axios from "axios";

const BASE_URL = "http://localhost:8085/api/intel";

export const fetchIntelStream = () =>
    axios.get(`${BASE_URL}/stream`);

export const fetchMarkers = () =>
    axios.get(`${BASE_URL}/markers`);

export const fetchGdacsStream = () =>
    axios.get(`${BASE_URL}/gdacs`);

export const fetchUsgsStream = () =>
    axios.get(`${BASE_URL}/usgs`);
