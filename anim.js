const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Simulación de 3 cuadros de animación (colores distintos)
const animationFrames = ['red', 'orange', 'purple'];
let currentFrame = 0;
let frameCounter = 0;

// Personaje
const character = { x: 60, y: 60, radius: 10 };

// Zonas caminables con portales hacia vecinos
const zones = [
    {
        id: 'A',
        x: 50, y: 50, width: 200, height: 150,
        neighbors: [
            { id: 'B', portal: { x: 250, y: 125 } }
        ]
    },
    {
        id: 'B',
        x: 300, y: 50, width: 200, height: 150,
        neighbors: [
            { id: 'A', portal: { x: 300, y: 125 } },
            { id: 'C', portal: { x: 500, y: 125 } }
        ]
    },
    {
        id: 'C',
        x: 550, y: 50, width: 200, height: 150,
        neighbors: [
            { id: 'B', portal: { x: 550, y: 125 } }
        ]
    }
];

// Path actual (lista de puntos)
let path = [];
const speed = 2;

// Dibuja todo
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Zonas caminables
    ctx.fillStyle = '#cce';
    zones.forEach(z => ctx.fillRect(z.x, z.y, z.width, z.height));

    // Portales
    ctx.fillStyle = '#88f';
    zones.forEach(z => {
        z.neighbors.forEach(n => {
            ctx.beginPath();
            ctx.arc(n.portal.x, n.portal.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    });

    // Personaje con animación
    ctx.fillStyle = animationFrames[currentFrame];
    ctx.beginPath();
    ctx.arc(character.x, character.y, character.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Detecta en qué zona está un punto
function getZoneAt(x, y) {
    return zones.find(z =>
        x > z.x && x < z.x + z.width &&
        y > z.y && y < z.y + z.height
    );
}

// Encuentra el camino entre zonas usando BFS
function findZonePath(startId, endId) {
    const visited = new Set();
    const queue = [[startId]];
    while (queue.length > 0) {
        const route = queue.shift();
        const last = route[route.length - 1];
        if (last === endId) return route;
        visited.add(last);
        const zone = zones.find(z => z.id === last);
        zone.neighbors.forEach(n => {
            if (!visited.has(n.id)) queue.push([...route, n.id]);
        });
    }
    return null;
}

// Genera puntos intermedios usando portales
function generatePath(startZone, zonePath, targetX, targetY) {
    const points = [];

    for (let i = 0; i < zonePath.length - 1; i++) {
        const current = zones.find(z => z.id === zonePath[i]);
        const nextId = zonePath[i + 1];
        const neighbor = current.neighbors.find(n => n.id === nextId);
        if (neighbor) {
            points.push({ x: neighbor.portal.x, y: neighbor.portal.y });
        }
    }

    points.push({ x: targetX, y: targetY });
    return points;
}

// Movimiento paso a paso
function moveCharacter() {
    if (path.length === 0) return;

    const target = path[0];
    const dx = target.x - character.x;
    const dy = target.y - character.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < speed) {
        character.x = target.x;
        character.y = target.y;
        path.shift();
    } else {
        character.x += (dx / dist) * speed;
        character.y += (dy / dist) * speed;
    }

    // Animación de cuadro
    frameCounter++;
    if (frameCounter % 10 === 0) {
        currentFrame = (currentFrame + 1) % animationFrames.length;
    }
}

// Loop principal
function gameLoop() {
    moveCharacter();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();

// Click para mover
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const currentZone = getZoneAt(character.x, character.y);
    const targetZone = getZoneAt(x, y);

    if (!currentZone || !targetZone) return;

    const zonePath = findZonePath(currentZone.id, targetZone.id);
    if (!zonePath) return;

    path = generatePath(currentZone, zonePath, x, y);
});