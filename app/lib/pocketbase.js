//app/lib/pocketbase.js
import PocketBase from 'pocketbase';

const API_URL = 'http://192.168.1.8:8090';

const pb = new PocketBase(API_URL);

export default pb;