// Importar la librería
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Token del bot de Telegram
const token = 'tu_token_de_telegram';

// Crear una instancia del bot de Telegram
const bot = new TelegramBot(token, { polling: true });

/**
 * Maneja el comando /start para iniciar la conversación con el bot.
 * @param {object} msg - El objeto del mensaje recibido.
 */
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hola, soy FantasyAssistant_bot. Para más información utilice el comando /help.');
});

/**
 * Maneja el comando /resultados para mostrar los resultados de los partidos de fútbol del día.
 * @param {object} msg - El objeto del mensaje recibido.
 */
bot.onText(/\/resultados/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    // Realizar la consulta a la API de resultados
    const response = await axios.get('https://api.football-data.org/v4/matches', {
      headers: {
        'X-Auth-Token': 'tu_token_de_API', // Token de la API
      },
    });
    // Procesar la respuesta de la API y construir el mensaje de resultados
    const resultados = response.data.matches;
    const mensajeResultados = resultados.map((partido) => {
      const equipoLocal = partido.homeTeam.name;
      const equipoVisitante = partido.awayTeam.name;
      const resultadoLocal = partido.score.fullTime.home !== null ? partido.score.fullTime.home : '??';
      const resultadoVisitante = partido.score.fullTime.away !== null ? partido.score.fullTime.away : '??';
      return `${equipoLocal} ${resultadoLocal} - ${resultadoVisitante} ${equipoVisitante}`;
    }).join('\n');
    // Mostrar el mensaje de resultados al usuario
    bot.sendMessage(chatId, `Resultados de los partidos de fútbol:\n${mensajeResultados}`);
  } catch (error) {
    console.error('Error al obtener resultados:', error);
    bot.sendMessage(chatId, 'Lo siento, ha ocurrido un error al obtener los resultados.');
  }
});

/**
 * Maneja el comando /help para mostrar la lista de comandos disponibles.
 * @param {object} msg - El objeto del mensaje recibido.
 */
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  // Mostrar una lista de comandos disponibles
  const ayudaMensaje = `
    Hola, este bot contiene datos sobre fútbol, debajo encontraras información sobre las diferentes consultas.
    - Lista de comandos disponibles:
    /start - Inicia una conversación con el bot.
    /help - Muestra la lista de comandos disponibles y su explicación.
    /resultados - Muestra los resultados de los partidos de fútbol del día de hoy.
    /borrar - Borra los dos últimos mensajes en la conversación con el bot.
    /ligas - Muestra la lista de ligas disponibles a las que se puede pedir información.
    /tabla [código de liga] - Muestra la tabla de posiciones de una liga específica.
    /equipos [código de competición] - Muestra la lista de equipos disponibles para una competición específica.
    /goleadores [código de liga] - Muestra los 10 jugadores con más goles en una liga específica.
    /competiciones - Muestra la lista de competiciones disponibles.
  `;
  bot.sendMessage(chatId, ayudaMensaje);
});

/**
 * Maneja el comando /borrar para borrar los dos últimos mensajes en la conversación con el bot.
 * @param {object} msg - El objeto del mensaje recibido.
 */
bot.onText(/\/borrar/, (msg) => {
  const chatId = msg.chat.id;
  // Utilizar el método deleteMessage para borrar los dos últimos mensajes en la conversación
  for (let i = 0; i < 2; i++) {
    bot.deleteMessage(chatId, msg.message_id - i);
  }
});

/**
 * Maneja el comando /ligas para mostrar la lista de ligas disponibles.
 * @param {object} msg - El objeto del mensaje recibido.
 */
bot.onText(/\/ligas/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    // Realizar la consulta a la API para obtener la lista de todas las ligas disponibles
    const response = await axios.get('https://api.football-data.org/v4/competitions', {
      headers: {
        'X-Auth-Token': 'tu_token_de_API', // Token de la API
      },
    });
    // Procesar la respuesta de la API y construir el mensaje de ligas
    const ligas = response.data.competitions;
    const mensajeLigas = ligas.map((liga) => {
      return `${liga.name} (${liga.code}) - Emblema: ${liga.emblem}`;
    }).join('\n');
    // Mostrar el mensaje de ligas al usuario
    bot.sendMessage(chatId, `Lista de ligas disponibles:\n${mensajeLigas}`);
  } catch (error) {
    console.error('Error al obtener la lista de ligas:', error);
    bot.sendMessage(chatId, 'Lo siento, ha ocurrido un error al obtener la lista de ligas.');
  }
});

/**
 * Maneja el comando /tabla [código de liga] para mostrar la tabla de posiciones de una liga específica.
 * @param {object} msg - El objeto del mensaje recibido.
 * @param {array} match - El arreglo de coincidencias del comando.
 */
bot.onText(/\/tabla (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const leagueCode = match[1]; // Capturar el código de la liga proporcionado
  try {
    // Realizar la consulta a la API para obtener la tabla de posiciones de una liga específica
    const response = await axios.get(`https://api.football-data.org/v4/competitions/${leagueCode}/standings`, {
      headers: {
        'X-Auth-Token': 'tu_token_de_API', // Token de la API
      },
    });
    // Procesar la respuesta de la API y construir el mensaje de tabla de posiciones
    const grupos = response.data.standings;
    let mensajeTabla = '';
    grupos.forEach((grupo, index) => {
      const tablaPosiciones = grupo.table;
      mensajeTabla += `Tabla de posiciones del grupo ${String.fromCharCode(65 + index)}:\n`;
      mensajeTabla += tablaPosiciones.map((equipo) => {
        return `${equipo.position}. ${equipo.team.name} - Pts: ${equipo.points}, PJ: ${equipo.playedGames}, DG: ${equipo.goalDifference}`;
      }).join('\n');
      mensajeTabla += '\n\n';
    });
    // Mostrar el mensaje de la tabla al usuario
    bot.sendMessage(chatId, mensajeTabla);
  } catch (error) {
    console.error('Error al obtener la tabla de posiciones:', error);
    bot.sendMessage(chatId, 'Lo siento, ha ocurrido un error al obtener la tabla de posiciones.');
  }
});
/**
 * Maneja el comando /equipos [código de la competición] para mostrar la lista de equipos disponibles para una competición específica.
 * @param {object} msg - El objeto del mensaje recibido.
 * @param {array} match - El arreglo de coincidencias del comando.
 */
bot.onText(/\/equipos (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const competitionId = match[1]; // Capturar el código de la competición proporcionado
  try {
    // Realizar la consulta a la API para obtener la lista de equipos de una competición específica
    const response = await axios.get(`https://api.football-data.org/v4/competitions/${competitionId}/teams`, {
      headers: {
        'X-Auth-Token': 'tu_token_de_API', // Token de la API
      },
    });
    // Procesar la respuesta de la API y construir el mensaje de equipos
    const equipos = response.data.teams;
    const mensajeEquipos = equipos.map((equipo) => {
      return `${equipo.name}`;
    }).join('\n');
    // Mostrar el mensaje de equipos al usuario
    bot.sendMessage(chatId, `Equipos disponibles para la competición ${competitionId}:\n${mensajeEquipos}`);
  } catch (error) {
    console.error('Error al obtener la lista de equipos:', error);
    bot.sendMessage(chatId, 'Lo siento, ha ocurrido un error al obtener la lista de equipos.');
  }
});

/**
 * Maneja el comando /goleadores [código de liga] para mostrar los 10 jugadores con más goles en una liga específica.
 * @param {object} msg - El objeto del mensaje recibido.
 * @param {array} match - El arreglo de coincidencias del comando.
 */
bot.onText(/\/goleadores (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const leagueCode = match[1]; // Capturar el código de la liga proporcionado
  try {
    // Realizar la consulta a la API para obtener los máximos goleadores de la liga específica
    const response = await axios.get(`https://api.football-data.org/v4/competitions/${leagueCode}/scorers`, {
      headers: {
        'X-Auth-Token': 'tu_token_de_API', // Token de la API
      },
    });
    // Procesar la respuesta de la API y construir el mensaje de goleadores
    const goleadores = response.data.scorers;
    let mensajeGoleadores = `Los 10 jugadores con más goles en la liga ${leagueCode} son:\n`;
    for (let i = 0; i < Math.min(10, goleadores.length); i++) {
      const jugador = goleadores[i];
      const goles = jugador.numberOfGoals !== undefined ? jugador.numberOfGoals : '?'; // Verificar si el número de goles está definido
      mensajeGoleadores += `${i + 1}. ${jugador.player.name} - ${goles} goles\n`;
    }
    // Mostrar el mensaje de goleadores al usuario
    bot.sendMessage(chatId, mensajeGoleadores);
  } catch (error) {
    console.error('Error al obtener los máximos goleadores:', error);
    bot.sendMessage(chatId, 'Lo siento, ha ocurrido un error al obtener los máximos goleadores.');
  }
});
/**
 * Maneja el comando /competiciones para mostrar la lista de competiciones disponibles.
 * @param {object} msg - El objeto del mensaje recibido.
 */
bot.onText(/\/competiciones/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    // Realizar la consulta a la API para obtener la lista de todas las competiciones disponibles
    const response = await axios.get('https://api.football-data.org/v4/competitions', {
      headers: {
        'X-Auth-Token': 'tu_token_de_API', // Token de la API
      },
    });
    // Procesar la respuesta de la API y construir el mensaje de competiciones
    const competiciones = response.data.competitions;
    const mensajeCompeticiones = competiciones.map((competicion) => {
      return `${competicion.name} (${competicion.area.name}) - Código: ${competicion.code}`;
    }).join('\n');
    // Mostrar el mensaje de competiciones al usuario
    bot.sendMessage(chatId, `Lista de competiciones disponibles:\n${mensajeCompeticiones}`);
  } catch (error) {
    console.error('Error al obtener la lista de competiciones:', error);
    bot.sendMessage(chatId, 'Lo siento, ha ocurrido un error al obtener la lista de competiciones.');
  }
});