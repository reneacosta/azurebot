'use strict';

module.exports.setup = function(app) {
    var builder = require('botbuilder');
    var teams = require('botbuilder-teams');
    var config = require('config');
    var botConfig = config.get('bot');
    var fs = require('fs');
    var util = require('util');
    
    var connector = new builder.ChatConnector({
         //It is a bad idea to store secrets in config files. We try to read the settings from
         //the environment variables first, and fallback to the config file.
         //See node config module on how to create config files correctly per NODE environment
        appId: process.env.MICROSOFT_APP_ID || botConfig.microsoftAppId,
        appPassword: process.env.MICROSOFT_APP_PASSWORD || botConfig.microsoftAppPassword
    });
    
    // Create a connector to handle the conversations
    //var connector = new teams.TeamsChatConnector({
        // It is a bad idea to store secrets in config files. We try to read the settings from
        // the environment variables first, and fallback to the config file.
        // See node config module on how to create config files correctly per NODE environment
      //  appId: process.env.MICROSOFT_APP_ID || botConfig.microsoftAppId,
       // appPassword: process.env.MICROSOFT_APP_PASSWORD || botConfig.microsoftAppPassword
   // });
    
    // Define a simple bot with the above connector that echoes what it received
    //var bot = new builder.UniversalBot(connector, function(session) {
        // Message might contain @mentions which we would like to strip off in the response
      //  var text = teams.TeamsMessage.getTextWithoutMentions(session.message);
       // session.send('You said: %s', text);
    //});
  
  
    var bot = new builder.UniversalBot(connector, function (session) {
      session.send( ( typeof session.message.user.name == "undefined" ? "Visitante " : session.message.user.name) + ' una Disculpa, aun estamos en desarrollo del bot.', session.message.text);
        //session.send( ( typeof session.message.user.name == "undefined" ? "Visitante " : session.message.user.name) + ' una Disculpa, esa frase no esta aun programada \'%s\'. Teclee \'Frases a Usar\' y de ENTER para saber que temas preguntar al bot.', session.message.text);
        session.send('Para mayor informacion o dudas, contacte a Soporte Office365 por Skype Empresarial o comunicarse con Rene Acosta al (662)-213 22 13 ext. 1280');
      sendInline(session, '././assets/Instala1.gif', 'image/gif', 'paso1.gif');
      //sendInline(session, 'https://cdn.glitch.com/d8d465ed-0624-4f03-85da-62804e17124b%2FInstala1.gif?1520890754932', 'image/gif', 'paso1.gif');
    });
 
  
  //var recognizer = new builder.LuisRecognizer(botConfig.LUIS_MODEL_URL);
  var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
  bot.recognizer(recognizer);
 
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
  
  function sendInternetUrl(session, url, contentType, attachmentFileName) {
    var msg = new builder.Message(session)
        .addAttachment({
            contentUrl: url,
            contentType: contentType,
            name: attachmentFileName
        });

    session.send(msg);
}
  
  
  function sendInline(session, filePath, contentType, attachmentFileName) {
    fs.readFile(filePath, function (err, data) {
        if (err) {
            return session.send('Error en origen de Archivo.');
        }

        var base64 = Buffer.from(data).toString('base64');

        var msg = new builder.Message(session)
            .addAttachment({
                contentUrl: util.format('data:%s;base64,%s', contentType, base64),
                contentType: contentType,
                name: attachmentFileName
            });

        session.send(msg);
    });
}

    // Setup an endpoint on the router for the bot to listen.
    // NOTE: This endpoint cannot be changed and must be api/messages
    app.post('/api/messages', connector.listen());

    // Export the connector for any downstream integration - e.g. registering a messaging extension
  module.exports.connector = connector;
 
  bot.dialog('pasosParac', [
    function (session) {
        //var url = 'https://raw.githubusercontent.com/reneacosta/OneRepo/master/Instala1.gif';
        //sendInternetUrl(session, url, 'image/gif', 'Instala1.gif');
        //sendInline(session, 'https://cdn.glitch.com/d8d465ed-0624-4f03-85da-62804e17124b%2FInstala1.gif?1520890754932', 'image/gif', 'paso1.gif');
        sendInline(session, './assets/Instala1.gif', 'image/gif', 'paso1.gif');
        builder.Prompts.confirm(session, "Realizaste bien los pasos del video anterior");
    },
    function (session, results) {
        if (results.response) {
            var url = 'https://raw.githubusercontent.com/reneacosta/OneRepo/master/Instala2.gif';
            sendInternetUrl(session, url, 'image/gif', 'Instala2.gif');

            builder.Prompts.confirm(session, "Instalaste el certificado sin problemas?");
        }else{
            session.endDialogWithResult({ response: "problemavideo1" });    
        }

    },
    function (session, results) {
        if (results.response) {
            builder.Prompts.confirm(session, "Tienes alguna otra duda? teclea ('si' o 'no')");
        }else{
            session.endDialogWithResult({ response: "problemavideo2" });    
        }
    },
    function (session, results) {
        if (results.response) {
            session.endDialogWithResult({ response: "si" });    
        }else{
            session.endDialogWithResult({ response: "fin" });    
        }
    }
]);


bot.dialog('pasosChrome', [
    function (session, args, next) {
        builder.Prompts.confirm(session, "Tiene tu Computadora Instalado el Explorador Chrome?  (solo responde si o no)");
    },
    function (session, results, next) {
        if (results.response) {
            builder.Prompts.confirm(session, "Deseas Instalar el Certificado?");
        } else {
            session.endDialogWithResult({ response: "fchrome" });
        }
    },
    function (session, results,next) {
        if (results.response) {
            // Save company name if we asked for it.
            session.endDialogWithResult({ response: "certificado" });
        }
        else {
            next()
        }
        //session.endDialogWithResult({ response: session.dialogData.profile });
    },
    function (session, results, next) {
        builder.Prompts.confirm(session, "Tienes algun problema con la Instalacion? (responde si o no)");
    },
    function (session, results) {
        if (results.response) {
            // Save company name if we asked for it.
            session.endDialogWithResult({ response: "problema" });
        }
        else {
            session.endDialogWithResult({ response: "nodefinido" });    
        }
        
    },    
]);



bot.dialog('Instalacion', [
    function (session, args) {
        var certioPrg = builder.EntityRecognizer.findEntity(args.intent.entities, 'Accion');
        if (certioPrg.entity === "certificado") {
            //session.endDialog('Preparando Archivos para \'%s\'...', "la Instalcion de Certificado");
            session.beginDialog("pasosParac",session) 
        }
        else {
            session.endDialog('Preparando Ayuda para \'%s\'...', certioPrg.entity);
            session.beginDialog("pasosChrome",session) 
        } //fin de certificado
    },
    function (session, results) {
        if (results.response === "problemavideo1" || results.response === "problemavideo2" ){
            session.endDialog('Ok para este problema ponte en contacto con Soporte Office365  %s!', ( typeof session.message.user.name == "undefined" ? "Visitante " : session.message.user.name) );
        }
        if (results.response === "problema"){
            session.endDialog('Para estos problemas ponte en contacto con Soporte Office365  %s!', ( typeof session.message.user.name == "undefined" ? "Visitante " : session.message.user.name) );
        }
        if (results.response === "certificado"){
            session.endDialog('Escribe la frase "Como instalar  el certificado?" asi poder entenderte  %s!', ( typeof session.message.user.name == "undefined" ? "Visitante " : session.message.user.name) );
        }
        if (results.response === "fchrome"){
            session.endDialog('Ahora Escribe "Ayuda con Chrome" asi mostrarte la ayuda correspondiente %s!', ( typeof session.message.user.name == "undefined" ? "Visitante " : session.message.user.name) );
        }                
        if (results.response === "fin"){
            session.endDialog('Fue un placer atenderte %s!', ( typeof session.message.user.name == "undefined" ? "Visitante " : session.message.user.name) );
        }
        if (results.response === "si"){
            session.endDialog('Cual es tu duda o que otra cosa Puedo Ayudarte? %s!', ( typeof session.message.user.name == "undefined" ? "Visitante " : session.message.user.name));
        }
        if (results.response === "nodefinido"){
            session.endDialog('Intenta de nuevo, Quiza no pude comprender alguna de tus respuestas %s!', ( typeof session.message.user.name == "undefined" ? "Visitante " : session.message.user.name));
        }
    }
]).triggerAction({
    matches: 'Instalacion'
});

bot.dialog('Ayuda', function (session, args) {

   // var printEnty = builder.EntityRecognizer.findEntity(args.intent.entities, 'Parteprg');
    //var tripoPEnty = builder.EntityRecognizer.findEntity(args.intent.entities, 'tipoproblema');
    var elolaEnty = builder.EntityRecognizer.findEntity(args.intent.entities, 'adjetivo');
    //session.send("ayuda??? " + printEnty.entity  + " --" + tripoPEnty + " adjetivo= " + elolaEnty.resolution.values[0] )
    session.send("ayuda??? " + " adjetivo= " + elolaEnty.resolution.values[0] )
    

    
/*     if (tripoPEnty) {
        session.endDialog('Preparandot Ayuda para \'%s\'...', tripoPEnty.entity);
    }    

    if (printEnty) {
        session.endDialog('Preparandop Ayuda para \'%s\'...', printEnty.entity);

    }         */
}).triggerAction({
    matches: 'Ayuda'
});



bot.dialog('Problemas', function (session) {
    session.endDialog('Hola! cual es el problema:  \'con la XX?? \', \'o con la Ye ?\'  \'o con los articulos??\'');
}).triggerAction({
    matches: 'Problemas'
});


bot.dialog('Greeter', function (session) {
    session.endDialog('Hola! que tal, para que tu experiencia sea mejor intenta preguntar todo sobre los temas asociados a:  \'Tengo problemas con la Impresion o Captura\', \'como instalar el certificado ?\' o \'no puedo encontrar los articulos\'');
}).triggerAction({
    matches: 'Greet'
});

bot.dialog('Quefrases', function (session) {
    session.send('Los temas principales de este Bot son:  \'temas relacionados a Requisiciones\', \'puede ser problemas o errores del programa\' o \'o preguntar algo sobre el funcionamiento del programa\'');
    session.endDialog('Las preguntas pueden ser directas por ejemplo:  \'como puedo capturar? o imprimir?\', \'Ayuda con relacion a Busquedas\' o \'Como Instalar el Certificado? o cuales son los pasos de Instalacion?\'');
}).triggerAction({
    matches: 'Quefrases'
});
  

  
  
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

