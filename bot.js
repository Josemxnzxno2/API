// Importar la librería
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Token del bot de Telegram
const token = '6318204120:AAEkicRP61AtRR5TN8dTkv5zD3or6jYOroA';

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
        'X-Auth-Token': '647c058b5ac34db8883bdc8394f0eba5', // Token de la API
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
  Saludos, este asistente contiene datos acerca del deporte del fútbol. A continuación, hallarás detalles sobre diversas solicitudes:

  Relación de órdenes disponibles:
  /start - Inicia una interacción con el asistente.
  /help - Despliega el catálogo de órdenes disponibles y sus explicaciones.
  /resultados - Exhibe los desenlaces de los encuentros futbolísticos de la jornada.
  /borrar - Elimina los dos mensajes previos en la charla con el asistente.
  /ligas - Muestra la enumeración de ligas a las que es posible solicitar datos.
  /tabla [código de liga] - Presenta la clasificación de una liga específica.
  /equipos [código de competición] - Muestra el conjunto de equipos disponibles para una competición particular.
  /goleadores [código de liga] - Expone los 10 jugadores con mayor cantidad de goles en una liga específica.
  /competiciones - Despliega el listado de competiciones disponibles.  
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
        'X-Auth-Token': '647c058b5ac34db8883bdc8394f0eba5', // Token de la API
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
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Verificar si el mensaje no es un comando
  if (!messageText.startsWith('/')) {
    // Mensaje de ayuda para el usuario sobre los comandos disponibles
    const ayudaMensaje = `
      ¡Hola! Parece que has enviado un mensaje que no es un comando. Aquí tienes algunos comandos que puedes utilizar:
      
      /start - Iniciar una interacción con el asistente.
      /help - Desplegar la lista de comandos disponibles y sus explicaciones.
      /resultados - Exhibir los resultados de los partidos de fútbol de la jornada.
      /borrar - Eliminar los dos últimos mensajes en la conversación con el asistente.
      /ligas - Mostrar la lista de ligas disponibles.
      /tabla [código de liga] - Presentar la clasificación de una liga específica.
      /equipos [código de competición] - Mostrar el conjunto de equipos disponibles para una competición particular.
      /goleadores [código de liga] - Exponer los 10 jugadores con más goles en una liga específica.
      /competiciones - Desplegar el listado de competiciones disponibles.
    `;

    // Enviar el mensaje de ayuda al usuario
    bot.sendMessage(chatId, ayudaMensaje);
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
        'X-Auth-Token': '647c058b5ac34db8883bdc8394f0eba5', // Token de la API
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
        'X-Auth-Token': '647c058b5ac34db8883bdc8394f0eba5', // Token de la API
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
        'X-Auth-Token': '647c058b5ac34db8883bdc8394f0eba5', // Token de la API
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
        'X-Auth-Token': '647c058b5ac34db8883bdc8394f0eba5', // Token de la API
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
