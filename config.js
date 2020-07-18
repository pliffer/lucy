// Exibe uma página 404 caso a rota não seja encontrada
exports.not_found = false;

exports.fileupload = true;

// Compactação gzip no retorno da resposta
exports.compression = true;

// Logs de desenvolvedor
exports.morgan = true;

// Sessão do usuário armazenado em cookies
exports.session = true;

// Possuirá socket io?
exports.socket = true;

exports.webSocket = false;

// Habilitar cors (cross origin source)
exports.cors = true;

// EXibir conteúdo estático
exports.assets = 'assets';

exports.views = 'views';
exports.template_engine = 'pug';

// Responsável por transformar o conteúdo do post em algo usável
exports.body_parser = true;

exports.database = false;

exports.ignoreCordovaJs = true;

exports.state = 'development';