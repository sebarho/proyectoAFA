/// DIrectiva para que el editor detecte las funciones de api.js
/// <reference path="./api.js" /> 

import * as api from "./api.js";

export const gameData = {
    inits : {
        player: 'Pancho',
        scene: 'quincho'
    },
    
    characters: {
        'Pancho': {
            name: 'Pancho', alias: 'Pancho', description: "Pancho: El Anfitrión.",
            inventories: [],
            x: 100, y: 150, width: 130, height: 220,
            image: 'assets/images/characters/Pancho.png'
        },
        'Sebastian': { 
            name: 'Sebastián', alias: 'Seba', description: "Seba: El Apasionado por lo Retro.", 
            inventories: [], 
            x: 250, y: 150, width: 130, height: 200, 
            image: 'assets/images/characters/Seba.png'
        },
        'Juan': { name: 'Juan', alias: 'Juan', description: "Juan: El Jugador.", x: 350, y: 230, width: 26, height: 80, skinColor: '#E0AC69', shirtColor: '#8B0000', pantsColor: '#222', hairColor: '#252525' },
        'JuanMa': { 
            name: 'Juan Manuel', alias: 'JuanMa', description: "JuanMa: El DJ.", 
            inventories: [], 
            x: 450, y: 150, width: 60, height: 90, skinColor: '#FFDAB9', shirtColor: '#1E90FF', pantsColor: '#555', hairColor: '#4A4A4A',
            onGrab: "Eso se lo dejo al Rata"
        },
        'Bocha': { name: 'Darío', alias: 'El Bocha', description: "El Bocha: El Ausente.", 
            inventories: [], 
            x: 400, y: 150, width: 130, height: 200, 
            image: 'assets/images/characters/Bocha.png' },
        'Ale': { 
            name: 'Alejandro', alias: 'Ale', description: "Ale: El Analista Político.", 
            inventories: [], 
            x: 600, y: 150, width: 130, height: 220, 
            image: 'assets/images/characters/Ale.png'
        },
        'Federico': {
            name: 'Federico', alias: 'Fede', description: "Fede: El Proveedor.",
            inventories: [], 
            x: 480, y: 225, width: 24, height: 82, skinColor: '#F5DEB3', shirtColor: '#DC143C', pantsColor: '#333', hairColor: '#654321'
        },
        'Rata': {
            name: 'El Rata', alias: 'Rata', description: "Rata: El Asador Designado.",
            inventories: [], 
            x: 680, y: 150, width: 130, height: 200, 
            image: 'assets/images/characters/Rata.png'
        },
        'Pelu': { 
            name: 'Sebastián', alias: 'El Pelu', description: "El Pelu: El Revolucionario.", 
            inventories: [], 
            x: 200, y: 235, width: 26, height: 78, skinColor: '#F5DEB3', shirtColor: '#FFD700', pantsColor: '#222', hairColor: '#1C1C1C'
        },
        'Locura': {
            name: 'Martín', alias: 'El Locura', description: "El Locura: El Picador Serial.",
            inventories: [], 
            x: 300, y: 210, width: 26, height: 86, skinColor: '#FFE4C4', shirtColor: '#B0C4DE', pantsColor: '#36454F', hairColor: '#F5F5DC'
        },
        'Pol': { 
            name: 'Pablo', alias: 'Pol', description: "Pol: El Ahorrativo.", 
            inventories: [], 
            x: 50, y: 230, width: 24, height: 80, skinColor: '#F5DEB3', shirtColor: '#808000', pantsColor: '#708090', hairColor: '#A0522D'
        },
        'Muñeco': { 
            name: 'Agustín', alias: 'El Muñeco', description: "El Muñeco: El Deportista.", 
            inventories: ['encendedor'], 
            x: 550, y: 150, width: 130, height: 180, 
            image: 'assets/images/characters/El Muñeco.png'
        },
        'Juanjo': { 
            name: 'Juanjo', alias: 'J', description: "Vive en Italia. Se conecta por videollamada. Alto, morocho, pelo enrulado.", 
            inventories: [], 
            x: -1000, y: -1000, width: 28, height: 95, skinColor: '#E0AC69', shirtColor: '#556B2F', pantsColor: '#463321', hairColor: '#4F2A15'
        }
    },

    objects: {
        'parrilla': { name: 'Parrilla', x: 650, y: 220, width: 100, height: 100, description: "La parrilla. El altar de El AFA. Todavía está apagada.", hasCarbon: false, isLit: false },
        'mesa': { name: 'Mesa', x: 175, y: 290, width: 350, height: 60, description: "Una mesa. Ideal para apoyar los codos y criticar." },
        'salida_patio': { name: 'Salida al Patio', x: 780, y: 150, width: 20, height: 160, description: "Hacia el verde césped.", exits: "patio" },
        'salida_cocina': { name: 'Entrada a la Cocina', x: 0, y: 150, width: 20, height: 160, description: "A la cocina, donde nacen las ensaladas.", exits: "cocina" },
        'pileta': { name: 'Pileta', x: 400, y: 250, width: 300, height: 100, color: '#0000FF', description: "Una pileta. Ideal para refrescarse." },
        'entrada_quincho': { name: 'Entrada al Quincho', x: 0, y: 150, width: 20, height: 160, description: "De vuelta a la acción.", exits: "quincho" },
        'heladera': { name: 'Heladera', x: 100, y: 120, width: 120, height: 190, description: "Una heladera de donde suelen salir cosas maravillosas.", isStuck: true, isOpen: false, image: 'assets/images/objects/heladera_cerrada.png', imageOpen: 'assets/images/objects/heladera_abierta.png' },
        'mesada': { name: 'Mesada', x: 250, y: 250, width: 400, height: 60, description: "La mesada. Llena de cosas a medio preparar." },
        'salida_quincho': { name: 'Salida al Quincho', x: 780, y: 150, width: 20, height: 160, description: "Volver con los muchachos.", exits: "quincho" }
    },

    items: {
        'vaso_fernet': { name: 'Vaso de fernet', x: 180, y: 280, width: 15, height: 20, color: '#2A1A10', description: "Un vaso de fernet. Vacío. Un clásico.", canBePickedUp: true },
        'botella_fernet': { name: 'Botella de Fernet', x: 200, y: 250, width: 20, height: 50, color: '#1A0A00', description: "Fernet Branca. El elixir de los dioses cordobeses.", canBePickedUp: true },
        'coca_cola': { name: 'Botella de Coca-Cola', x: 230, y: 250, width: 20, height: 45, color: '#A00000', description: "Una Coca-Cola. La compañera inseparable del fernet.", canBePickedUp: true },
        'vino_tinto': { name: 'Vino Tinto', x: 280, y: 250, width: 20, height: 48, color: '#7B1113', description: "Un vino tinto. Para paladares sofisticados.", canBePickedUp: true },
        'vino_blanco': { name: 'Vino Blanco', x: 310, y: 250, width: 20, height: 48, color: '#F1E5AC', description: "Un vino blanco. Refrescante.", canBePickedUp: true },
        'papas_fritas': { name: 'Papas Fritas', x: 380, y: 280, width: 40, height: 20, color: '#FFD700', description: "Un bowl con papas fritas. Imposible comer solo una.", canBePickedUp: true },
        'mani': { name: 'Maní', x: 430, y: 280, width: 40, height: 20, color: '#D2B48C', description: "Un bowl con maní. El clásico de la picada.", canBePickedUp: true },
        'encendedor': { name: 'Encendedor', x: -100, y: -100, width: 15, height: 25, color: '#FFD700', description: "Un encendedor. Siempre útil.", canBePickedUp: true, isHidden: true },
        'pala_jardin': { name: 'Pala de Jardín', x: 350, y: 300, width: 25, height: 60, color: '#8B4513', description: "Una pala de jardín. Parece resistente.", canBePickedUp: true },
        'bolsa_carbon': { name: 'Bolsa de Carbón', x: 380, y: 300, width: 40, height: 50, color: '#3D2B1F', description: "Una bolsa de carbón. Indispensable.", canBePickedUp: true },
        'carne': { name: 'Carne', x: 125, y: 200, width: 70, height: 40, color: '#800000', description: "El corazón de El AFA. Unos buenos cortes de vacío y tira de asado.", canBePickedUp: true, isHidden: true }
    },

    scenes: {
        'quincho': {
            name: 'Quincho',
            background: { wall: '#A0522D', floor: '#5C4033' },
            objects: [
                'parrilla',
                'mesa',
                'salida_patio',
                'salida_cocina'
            ],
            items: [
                'vaso_fernet',
                'botella_fernet',
                'coca_cola',
                'vino_tinto',
                'vino_blanco',
                'papas_fritas',
                'mani',
                'encendedor'
            ],
            characters: ['Pancho', 'Sebastian', 'Bocha', 'Ale', 'Rata', 'Muñeco']
        },
        'patio': {
            name: 'Patio',
            background: { wall: '#87CEEB', floor: '#228B22' },
            objects: [
                'pileta',
                'entrada_quincho'
            ],
            items: [
                'pala_jardin',
                'bolsa_carbon'
            ],
            characters: []
        },
        'cocina': {
            name: 'Cocina',
            background: { wall: '#F5F5DC', floor: '#D2B48C' },
            objects: ['heladera','mesada','salida_quincho'],
            items: [
                'carne'
            ],
            characters: []
        }
    },

    dialogueMatrix: {
        'Sebastian': {
            start: [
                {
                    player: "Che, Seba, ¿todo bien?",
                    npc: "Todo tranquilo. Pensando en que estaría bueno escuchar un poco de Christopher Cross.",
                    leadsTo: "end"
                },
                {
                    player: "Seba, ¿te acordás del 'Summer Breeze' de Seals and Crofts?",
                    npc: "¡Uff, qué temazo! Me transporta a una ruta en California en un descapotable. Aunque... ¿fue en bici?",
                    leadsTo: "seba_music_1"
                },
                {
                    player: "¿Viste la nueva Atari 2600+ que van a lanzar?",
                    npc: "¡Obvio! Ya la tengo preordenada. Me llega en dos meses. ¡No veo la hora de viciar al Pitfall!",
                    leadsTo: "seba_retro_1"
                },
                {
                    player: "¿Qué onda con las chicas, Seba?",
                    npc: "Uhh, chicas! Espantémoslas con un tema de America. Dale, poné 'A Horse with No Name'.",
                    leadsTo: "end"
                }
            ],
            seba_music_1: [
                {
                    player: "Jaja, ¿ok?... ¿Y qué me decís de los Beach Boys?",
                    npc: "¡Palabras mayores! Brian Wilson es un genio. Bah. Era. 'Pet Sounds' es una obra de arte. No como la basura que escuchan ahora.",
                    leadsTo: "end"
                },
                {
                    player: "A mí me gusta más Chicago. 'If You Leave Me Now' es un clásico.",
                    npc: "Sí, es un buen tema. Pero me quedo con la onda más folk de Eagles...",
                    leadsTo: "end"
                }
            ],
            seba_retro_1: [
                {
                    player: "¡Qué groso! ¿Y a qué otro juego tenes?",
                    npc: "Oh.. 'River Raid', 'Defender', 'Space Invaders'... ¡Los tengo todos! Pero nunca los juego en realidad.",
                    leadsTo: "end"
                },
                {
                    player: "Yo nunca fui bueno para el Pitfall. Me caía siempre a los pozos.",
                    npc: "Es que hay que tener timing. Como en la vida, pequeño saltamontes.",
                    leadsTo: "end"
                }
            ]
        },
        'Pancho': {
            start: [
                {
                    player: "Pancho, ¿cómo va la organización?",
                    npc: "Acá andamos. Todavía no hay nada definido.",
                    leadsTo: "end"
                },
                {
                    player: "Che, Pancho, ¿dónde hacemos el asado al final?",
                    npc: "Y... esa es la pregunta del millón. Fede quiere ir a una quinta, pero es un bardo. ¿Vos qué decís?",
                    leadsTo: "pancho_asado_1"
                },
                {
                    player: "¿Necesitás ayuda con algo?",
                    npc: "Por ahora, no. Andá a ver si el Rata ya se dignó a prender el fuego.",
                    leadsTo: "end"
                }
            ],
            pancho_asado_1: [
                {
                    player: "Hagámoslo acá. Es más cómodo.",
                    npc: "Sí, pero después tengo que limpiar todo yo. Y mi vieja me rompe las bolas.",
                    leadsTo: "pancho_asado_2"
                },
                {
                    player: "La quinta de Fede puede estar buena. Más espacio.",
                    npc: "Sí, pero queda en la loma del orto. Y seguro que nos cobra hasta el aire que respiramos.",
                    leadsTo: "end"
                }
            ],
            pancho_asado_2: [
                {
                    player: "Dale, yo te ayudo a limpiar. No seas ortiva.",
                    npc: "Mmm... no sé si creerte. La última vez me dejaste solo con toda la mugre.",
                    leadsTo: "end"
                },
                {
                    player: "Bueno, entonces que cada uno lave su plato. Y listo.",
                    npc: "¡Esa me gustó más! Trato hecho. Lo hacemos acá.",
                    setsAfaLocation: 'quincho_pancho',
                    leadsTo: "end"
                }
            ]
        },
        'Ale': {
            start: [
                {
                    player: "Ale, ¿todo bien?",
                    npc: "Todo en orden. Analizando la coyuntura.",
                    leadsTo: "end"
                },
                {
                    player: "Che, Ale, ¿viste el último discurso del presidente?",
                    npc: "Sí, lo estuve desmenuzando. Un análisis de texto impecable. Pero con algunas falacias argumentativas.",
                    leadsTo: "ale_politica_1"
                },
                {
                    player: "¿Qué opinás de la situación del país?",
                    npc: "Compleja. Hay que hacer un análisis estructural y no quedarse en la superficie. Pero tengo algunas ideas.",
                    leadsTo: "ale_economia_1"
                }
            ],
            ale_politica_1: [
                {
                    player: "A mí me pareció un embole. No dijo nada nuevo.",
                    npc: "Es que tenés que leer entre líneas. El lenguaje no verbal, las pausas, los énfasis... Todo comunica.",
                    leadsTo: "end"
                },
                {
                    player: "¿Y cuáles son esas falacias?",
                    npc: "Por ejemplo, la falacia ad hominem. Atacó a la persona y no al argumento. Un clásico de la política berreta.",
                    leadsTo: "end"
                }
            ],
            ale_economia_1: [
                {
                    player: "A ver, tirá una idea.",
                    npc: "Hay que fomentar la inversión productiva y no la especulación financiera. Y terminar con el déficit fiscal.",
                    leadsTo: "end"
                },
                {
                    player: "Suena fácil, pero ¿cómo lo hacés?",
                    npc: "Con un plan económico consistente y un gran acuerdo nacional. Pero para eso, se necesita voluntad política. Y eso es lo que falta.",
                    leadsTo: "end"
                }
            ]
        },
        'Pelu': {
            start: [
                {
                    player: "Pelu, ¿todo bien?",
                    npc: "Todo tranquilo. Esperando la revolución.",
                    leadsTo: "end"
                },
                {
                    player: "Che, Pelu, ¿viste lo que aumentó el bondi?",
                    npc: "¡Una locura! Nos están ajustando por todos lados. Esto no da para más.",
                    leadsTo: "pelu_politica_1"
                },
                {
                    player: "¿Qué te parece si hacemos una colecta para los que menos tienen?",
                    npc: "Me parece bien, pero no es la solución. La solución es cambiar el sistema de raíz.",
                    leadsTo: "end"
                }
            ],
            pelu_politica_1: [
                {
                    player: "Y bueno, pero algo hay que hacer. No nos podemos quedar de brazos cruzados.",
                    npc: "Obvio que no. Hay que organizarse y salir a la calle. A ver si así nos escuchan.",
                    leadsTo: "end"
                },
                {
                    player: "No sé si es para tanto. Tampoco estamos tan mal.",
                    npc: "¿Que no estamos tan mal? Andá a decírselo a los que no llegan a fin de mes. O a los que se quedaron sin laburo.",
                    leadsTo: "end"
                }
            ]
        },
        'JuanMa': {
            start: [
                {
                    player: "JuanMa, ¿todo bien?",
                    npc: "Todo joya. ¿Listo para un poco de rock and roll?",
                    leadsTo: "end"
                },
                {
                    player: "Che, JuanMa, ¿ponés un poco de La Renga?",
                    npc: "¡Obvio! ¿Qué tema querés? ¿'El revelde'? ¿'La balada del diablo y la muerte'?",
                    leadsTo: "juanma_music_1"
                },
                {
                    player: "¿Me dejás poner música a mí?",
                    npc: "Ni en pedo. La última vez que te dejé, pusiste a Arjona. Casi me muero.",
                    leadsTo: "end"
                }
            ],
            juanma_music_1: [
                {
                    player: "Poné 'El final es en donde partí'.",
                    npc: "¡Uff, qué temazo! Ahí va. Subí el volumen.",
                    leadsTo: "end"
                },
                {
                    player: "No, mejor poné algo de los Redondos.",
                    npc: "¡También! ¿Qué querés? ¿'Jijiji'? ¿'Un poco de amor francés'?",
                    leadsTo: "end"
                }
            ]
        },
        'Rata': {
            start: [
                {
                    player: "Rata, ¿necesitás algo?",
                    npc: "Por ahora, no. Andá a buscar el carbón, que sin eso no hay asado.",
                    leadsTo: "end"
                },
                {
                    player: "Che, Rata, ¿cómo viene ese fuego?",
                    npc: "Todavía no lo prendí. Estoy esperando que me traigan el carbón. Y el fernet.",
                    leadsTo: "rata_asado_1"
                },
                {
                    player: "¿Te doy una mano con la parrilla?",
                    npc: "No, gracias. De la parrilla me encargo yo. Vos andá a cortar el pasto, si querés.",
                    leadsTo: "end"
                }
            ],
            rata_asado_1: [
                {
                    player: "Ahí te traigo el carbón.",
                    npc: "Dale, pero que sea del bueno. No como el que trajo Pol la otra vez, que era pura tierra.",
                    leadsTo: "end"
                },
                {
                    player: "¿Y el fernet?",
                    npc: "¡Y el fernet! ¿Qué te pensás, que el fuego se prende solo? Necesito combustible.",
                    leadsTo: "end"
                }
            ]
        },
        'Pol': {
            start: [
                {
                    player: "Pol, ¿todo bien?",
                    npc: "Todo en orden. Cuidando los pesos.",
                    leadsTo: "end"
                },
                {
                    player: "Che, Pol, ¿cuánto pusiste para el asado?",
                    npc: "Lo justo y necesario. No como otros que derrochan.",
                    leadsTo: "pol_plata_1"
                },
                {
                    player: "¿Viste el reloj que tenés? ¡Está buenísimo!",
                    npc: "Ah, ¿te gusta? Lo conseguí en oferta. No vas a encontrar otro igual a este precio.",
                    leadsTo: "end"
                }
            ],
            pol_plata_1: [
                {
                    player: "Dale, Pol, no seas rata. Poné un poco más.",
                    npc: "No es ser rata, es ser inteligente. El que guarda, siempre tiene.",
                    leadsTo: "end"
                },
                {
                    player: "Pero si no ponés, no comés.",
                    npc: "Yo como, pero con moderación. No como otros que se comen hasta los codos.",
                    leadsTo: "end"
                }
            ]
        },
        'Juan': {
            start: [
                {
                    player: "Juan, ¿todo bien?",
                    npc: "Todo tranquilo. Esperando el asado.",
                    leadsTo: "end"
                },
                {
                    player: "Che, Juan, ¿jugamos un truco?",
                    npc: "¡De una! Pero no me robes las señas, ¿eh?",
                    leadsTo: "juan_truco_1"
                },
                {
                    player: "¿Viste el partido de ayer?",
                    npc: "¡Uff, qué partidazo! Lo vi con el Muñeco. Casi nos infartamos.",
                    leadsTo: "end"
                }
            ],
            juan_truco_1: [
                {
                    player: "Yo no robo señas. Vos sos el que cuenta las cartas.",
                    npc: "Jaja, puede ser. Pero es parte del juego. Si no, no tiene gracia.",
                    leadsTo: "end"
                },
                {
                    player: "Dale, armemos un campeonato. El que pierde, paga el próximo asado.",
                    npc: "¡Me gusta esa idea! Pero que no juegue Pol, que si no, no lo paga más.",
                    leadsTo: "end"
                }
            ]
        },
        'Federico': {
            start: [
                {
                    player: "Fede, ¿todo bien?",
                    npc: "Todo en orden. Acá, viendo si hacemos el asado en una quinta.",
                    leadsTo: "end"
                },
                {
                    player: "Che, Fede, ¿conseguiste la carne?",
                    npc: "Sí, ya la tengo. La mejor de la zona. Pero no sé dónde la vamos a hacer.",
                    leadsTo: "fede_asado_1"
                },
                {
                    player: "¿Y si hacemos una vaquita para comprar una pileta para el quincho?",
                    npc: "¡Estaría buenísimo! Pero con lo que sale, tenemos que vender un riñón cada uno.",
                    leadsTo: "end"
                }
            ],
            fede_asado_1: [
                {
                    player: "Hagámoslo acá, en el quincho de Pancho.",
                    npc: "Sí, es lo más cómodo. Pero hay que convencerlo a Pancho. Ya sabés cómo se pone con la limpieza.",
                    leadsTo: "end"
                },
                {
                    player: "Busquemos una quinta por Pilar. Allá hay buenas opciones.",
                    npc: "Dale, me fijo. Pero que no sea muy lejos, que si no, el Bocha se nos duerme en el camino.",
                    leadsTo: "end"
                }
            ]
        },
        'Locura': {
            start: [
                {
                    player: "Locura, ¿todo bien?",
                    npc: "Todo tranquilo. Cortando un poco de salame.",
                    leadsTo: "end"
                },
                {
                    player: "Che, Locura, ¿cómo viene esa picada?",
                    npc: "¡A full! Tengo un salame de Tandil que es una manteca. Y un queso de oveja que te caes de culo.",
                    leadsTo: "locura_picada_1"
                },
                {
                    player: "¿Necesitás ayuda para cortar?",
                    npc: "No, gracias. El arte de la picada es un trabajo solitario. Pero podés ir abriendo un vinito.",
                    leadsTo: "end"
                }
            ],
            locura_picada_1: [
                {
                    player: "¡Qué bueno! ¿Y las aceitunas?",
                    npc: "¡Obvio! Traje unas griegas que son un manjar. Y unas rellenas con morrón que son una bomba.",
                    leadsTo: "end"
                },
                {
                    player: "No te olvides del pan. La otra vez nos quedamos cortos.",
                    npc: "¡Jamás! Traje tres kilos de pan de campo. Para que sobre y no para que falte.",
                    leadsTo: "end"
                }
            ]
        },
        'Muñeco': {
            start: [
                {
                    player: "Muñeco, ¿todo bien?",
                    npc: "Todo en orden. Estirando un poco.",
                    leadsTo: "end"
                },
                {
                    player: "Che, Muñeco, ¿jugamos un fútbol-tenis?",
                    npc: "¡De una! Pero no me vengas con la excusa de que te duele la rodilla, ¿eh?",
                    leadsTo: "muneco_deporte_1"
                },
                {
                    player: "¿Tenés fuego?",
                    npc: "Sí, acá tengo mi encendedor. Pero te lo presto solo para prender el fuego, ¿eh? Nada de llevártelo.",
                    leadsTo: "muneco_fuego_1"
                }
            ],
            muneco_deporte_1: [
                {
                    player: "No, esta vez estoy bien. Te voy a ganar.",
                    npc: "Jaja, eso lo veremos. El que pierde, paga las cervezas.",
                    leadsTo: "end"
                },
                {
                    player: "Dale, pero que se sume el Bocha. Así es más divertido.",
                    npc: "¡Uf, el Bocha! Se va a quedar dormido en la mitad del partido. Pero bueno, que venga.",
                    leadsTo: "end"
                }
            ],
            muneco_fuego_1: [
                {
                    player: "Dale, gracias. Es solo para eso.",
                    npc: "Más te vale. Que después no lo encuentro más.",
                    givesItem: 'encendedor',
                    leadsTo: "end"
                },
                {
                    player: "No, mejor no. No quiero que me lo cobres después.",
                    npc: "Jaja, ¡qué rata! No te lo iba a cobrar. Pero bueno, como quieras.",
                    leadsTo: "end"
                }
            ]
        },
        'Bocha': {
            start: [
                {
                    player: "Bocha, ¿todo bien?",
                    npc: "Zzzzz...",
                    leadsTo: "end"
                },
                {
                    player: "Che, Bocha, ¿te dormiste?",
                    npc: "No, estaba meditando. Pensando en la inmortalidad del cangrejo.",
                    leadsTo: "bocha_sueno_1"
                },
                {
                    player: "¿Querés un fernet?",
                    npc: "¡Obvio! Pero que no esté muy fuerte, que si no, me duermo de nuevo.",
                    leadsTo: "end"
                }
            ],
            bocha_sueno_1: [
                {
                    player: "Jaja, ¡qué personaje! ¿Y a qué conclusión llegaste?",
                    npc: "A que el cangrejo es inmortal hasta que se lo come alguien. O hasta que se aburre de vivir.",
                    leadsTo: "end"
                },
                {
                    player: "Dale, Bocha, despertate que en un rato comemos.",
                    npc: "¡Ufa! Con lo bien que estaba soñando. Soñé que era millonario y no tenía que trabajar más.",
                    leadsTo: "end"
                }
            ]
        },
        'default': {
            start: [
                {
                    player: "¿Qué onda? ¿Todo bien?",
                    npc: "Todo tranquilo, por suerte. ¿Y vos?",
                    leadsTo: "end"
                },
                {
                    player: "¿Necesitás algo?",
                    npc: "No, gracias. Andá a ver si la picada ya está lista.",
                    leadsTo: "end"
                }
            ]
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
////
////                          A C T I O N    S C R I P T S
////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

export const storyScripts = {
    'default': () =>{
        /// SCRIPT POR DEFECTO PARA MANEJAR TODAS LAS FUNCIONES GENERICAS DESDE AQUI
        const as = api.gameState().actionState;
        
        switch (as.verb) {
            case "MIRAR": {
                api.say(api.runScript("generic_description"));
                break;
            }
            case "AGARRAR": {
                api.getItem(as.item.key)
                // say("No puedo agarrar eso.");
                break;
            }
            case "USAR": {
                api.say(api.runScript("generic_nopuedo"));
                break;
            }
            case "TOCAR_BULTO": {
                api.say(api.gameState().currentPlayer + ": A ver que hay por aca...")
                api.say(as.target.key + ": PARA !!!!   BALINARDO !!!!");
                break;
            }
            case "IR": {
                if (gameData.objects[as.target.key].exits !=null) {
                    api.actorChangeScene(api.gameState().currentPlayer, gameData.objects[as.target.key].exits);
                    break;
                }
            }
            case "HABLAR": {
                const characterKey = as.target.key;
                const nodeID ='start';
                api.startDialogue(characterKey, nodeID);
                break;
            }
            default :
                api.say("Eso no tiene sentido");
                break;
        }
    },
    'usar_pala_jardin_en_heladera': () => {
        const heladera = gameData.objects.heladera;
        if (heladera.isStuck) {
            heladera.isStuck = false;
            heladera.isOpen = true;
            gameData.scenes.cocina.items.carne.isHidden = false;
            return "Con un '¡clack!' metálico, la puerta de la heladera se abrió. ¡Ahí está la carne!";
        } else {
            return "No parece necesario usar la pala aquí.";
        }
    },
    'usar_bolsa_carbon_en_parrilla':() => {
        const parrilla = gameData.scenes.quincho.objects.parrilla;
        parrilla.hasCarbon = true;
        return "EL carbon ya esta puesto";
    },
    'usar_encendedor_en_parrilla': () => {
        const parrilla = gameData.objects.parrilla;
        if (parrilla.hasCarbon && !parrilla.isLit) {
            parrilla.isLit = true;
            return "¡Listo! Fuego prendido.";
        } else if (!parrilla.hasCarbon) {
            return "Primero hay que poner el carbón.";
        } else if (parrilla.isLit) {
            return "El fuego ya está prendido.";
        } else {
            return "No funciona.";
        }
    },
    'usar_carne_en_parrilla': () => {
        const parrilla = gameData.objects.parrilla;
        if (api.gameState().currentPlayer === 'Rata') {
            if (parrilla.isLit && api.gameState().inventories[api.gameState().currentPlayer].includes('carne')) {
                return "¡A la parrilla! En un rato comemos.";
            } else if (!parrilla.isLit) {
                return "Primero hay que prender el fuego.";
            } else {
                return "Falta la carne.";
            }
        } else {
            return "De la parrilla se encarga el Rata.";
        }
    },

    'pancho_mirar_parrilla': () => {
        console.log("Ejecutando script: pancho_mirar_parrilla");
        const parrilla = api.gameData.objects.parrilla;
        if (parrilla.isLit) {
            return "La parrilla está encendida y lista para usar.";
        } else {
            return "La parrilla está apagada. Parece que no hay fuego.";
        }
    },

    'generic_nopuedo': () => {
        console.log("ejecutando script: generic_nopuedo");
        return"Mmmm.... No puedo hacer eso.";
    },

    'generic_description': () => {
        if (api.gameState().actionState.item.key != null) {
            return gameData.items[api.gameState().actionState.item.key].description;
        } else {
            switch (api.gameState().actionState.target.type) {
                case 'object':
                    return gameData.objects[api.gameState().actionState.target.key].description;
                case 'character':
                    return gameData.characters[api.gameState().actionState.target.key].description;
                default:
                    return "No puedo describir eso.";
            }
        }
    },

    'pancho_agarrar_mesa':() => {
        console.log("Ejecutando script: pancho_agarrar_mesa");
        return api.runActionScript("generic_nopuedo");
    },

    'pancho_mirar_mesa': () => {
        console.log("Ejecutando script: pancho_mirar_mesa");
        api.say(api.runScript("generic_description"));
        api.say("... es increible...");
        api.say("Las comilonas en familia que hemos hecho!");
    },

    'pancho_mirar_parrilla': () => {
        console.log("Ejecutando script: pancho_mirar_parrilla");
        api.say(api.runScript("generic_description"));
        api.say("Me emociono...");
        api.say("Gracias seba por este hermoso quincho!");
    },

    'rata_mirar_parrilla': () => {
        console.log("Ejecutando script: pancho_mirar_parrilla");
        api.say(api.runActionScript("generic_description"));
        api.say("Si no fuera por mi...");
        api.say("...estos pibes no comen. (Ratapedia 20:41)");
    }

};