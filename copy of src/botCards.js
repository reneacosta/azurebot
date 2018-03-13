'use strict';

module.exports.setup = function(app) {
    var builder = require('botbuilder');
    var teams = require('botbuilder-teams');
    var config = require('config');
    var botConfig = config.get('bot');
    
    //var connector = new builder.ChatConnector({
        // It is a bad idea to store secrets in config files. We try to read the settings from
        // the environment variables first, and fallback to the config file.
        // See node config module on how to create config files correctly per NODE environment
        //appId: process.env.MICROSOFT_APP_ID || botConfig.microsoftAppId,
        //appPassword: process.env.MICROSOFT_APP_PASSWORD || botConfig.microsoftAppPassword
    //});
    
    // Create a connector to handle the conversations
    var connector = new teams.TeamsChatConnector({
        // It is a bad idea to store secrets in config files. We try to read the settings from
        // the environment variables first, and fallback to the config file.
        // See node config module on how to create config files correctly per NODE environment
        appId: process.env.MICROSOFT_APP_ID || botConfig.microsoftAppId,
        appPassword: process.env.MICROSOFT_APP_PASSWORD || botConfig.microsoftAppPassword
    });
    
    // Define a simple bot with the above connector that echoes what it received
    //var bot = new builder.UniversalBot(connector, function(session) {
        // Message might contain @mentions which we would like to strip off in the response
      //  var text = teams.TeamsMessage.getTextWithoutMentions(session.message);
       // session.send('You said: %s', text);
    //});
  
    var bot = new builder.UniversalBot(connector);  
      bot.dialog('/', function (session) {
        var cards = getCardsAttachments();
            var reply = new builder.Message(session)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(cards);

        var cartas2 = getNuevoProcess();
            var replica2 = new builder.Message(session)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(cartas2);
        
        
        session.send('Hola ' + ( typeof session.message.user.name == "undefined" ? "Visitante " : session.message.user.name));
        session.send('Usuarios como tu pueden apoyarse en esta nueva herramienta');
        session.send('De momento mi servicio es muy limitado');
        session.send('Asi que acontinuacion te dire las opciones que estan a tu disposicion para el programa Requisiciones');
        

        // attach the card to the reply message
        session.send(reply);   
        //session.send(replica2);   
    });
  
  bot.on('conversationUpdate', function (activity) {
    // when user joins conversation, send instructions
    if (activity.membersAdded) {
        activity.membersAdded.forEach(function (identity) {
            if (identity.id === activity.address.bot.id) {
                var reply = new builder.Message()
                    .address(activity.address)
                    .text("Holaas soy " +  ( typeof activity.address.user.name == "undefined" ? "RequisBot " : activity.address.user.name) +" Bienvenido!!  Desde hoy sere tu nuevo Asistente para Requisiciones");
                bot.send(reply);
            }
        });
    }
  });

    // Setup an endpoint on the router for the bot to listen.
    // NOTE: This endpoint cannot be changed and must be api/messages
    app.post('/api/messages', connector.listen());

    // Export the connector for any downstream integration - e.g. registering a messaging extension
  module.exports.connector = connector;

 

  
  
  function getNuevoProcess(session) {
    return [
        new builder.HeroCard(session)
            .title('Dudas sobre Articulos??')
            .subtitle('Aqui te ayudara el bot a buscar por ti')
            .text('En caso que tengas duda sobre en que partida estan los articulos, el bot puede ayudarte a buscar en el catalogo.')
            .images([
                builder.CardImage.create(session, 'https://cdn.glitch.com/d8d465ed-0624-4f03-85da-62804e17124b%2Fpregunta.gif?1519940462113')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://ayudareqs.azurewebsites.net', 'Buscar Articulo')
            ]),

        new builder.HeroCard(session)
            .title('Crear Requisicion desde el Bot')
            .subtitle('Esta opcion te permite automatizar y dictarle al bot tu requisicion')
            .text('Aqui el bot puede solicitar por ti la Requisicion de algun Formato definido que tu especifiques o tambien puede hacer  la requisicion por ti al dictarle o escribirle los articulos y el bot hara la requisicion por ti.')
            .images([
                builder.CardImage.create(session, 'https://cdn.glitch.com/d8d465ed-0624-4f03-85da-62804e17124b%2Fdictado.gif?1519940458331')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://ayudareqs.azurewebsites.net', 'Iniciar Requisicion')
            ]),
    ];
  }  
  
  function getCardsAttachments(session) {
    return [
        new builder.HeroCard(session)
            .title('Paso 1 Instalacion')
            .subtitle('Proceso para instalar Certificado en la Computadora')
            .text('En este paso es importante señalar que el programa de Requisiciones solo opera en Google Chrome.')
            .images([
                builder.CardImage.create(session, 'https://raw.githubusercontent.com/reneacosta/OneRepo/master/MAC2011.gif')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://ayudareqs.azurewebsites.net', 'Iniciar Ayuda')
            ]),

        new builder.HeroCard(session)
            .title('Paso 2 Iniciar Sesion')
            .subtitle('Este punto tarda unos instantes en realizarse')
            .text('Este es un proceso donde se inicializa al usuario por primera vez en el cual se configuran sus datos y contraseña.')
            .images([
                builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/azure/documentdb/media/documentdb-introduction/json-database-resources1.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://ayudareqs.azurewebsites.net', 'Iniciar Ayuda')
            ]),

        new builder.HeroCard(session)
            .title('Captura de Requisicion')
            .subtitle('Ejemplo de muestra de como es una Captura en el programa ')
            .text('Aqui mostraremos los pasos sencillos para realizar una captura y enviarla al Sistema.')
            .images([
                builder.CardImage.create(session, 'https://msdnshared.blob.core.windows.net/media/2016/09/fsharp-functions2.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://ayudareqs.azurewebsites.net', 'Ver Ejemplo')
            ]),

        new builder.HeroCard(session)
            .title('Visualizacion e Impresion')
            .subtitle('Visualizar la Requisicion capturada y mandar a impersion')
            .text('La impresion y la visualizacion  estan en la misma pantalla y los podemos acceder con facilidad asi puedan encontrarlas y almacenarlas si se necesario.')
            .images([
                builder.CardImage.create(session, 'https://msdnshared.blob.core.windows.net/media/2017/03/Azure-Cognitive-Services-e1489079006258.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://ayudareqs.azurewebsites.net', 'Ver Ejemplo')
            ])
    ];
  }

};

