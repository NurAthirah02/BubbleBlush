//app/lib/pocketbase.js
import PocketBase from 'pocketbase';
import { Platform } from 'react-native';

const API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8091' : 'http://127.0.0.1:8091';

const pb = new PocketBase(API_URL);

export default pb;
