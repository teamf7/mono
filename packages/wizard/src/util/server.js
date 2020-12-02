export const isDebug = process.env.NODE_ENV === 'development';

// если true - всегда запросы к текущему серверу
const sameServer = true;

const servers = {
  151: 'http://172.30.48.151',
  localhost: 'http://localhost',
};
const toServer = isDebug ? '' : '151';

export default !sameServer ? (toServer ? servers[toServer] : '') : '';
