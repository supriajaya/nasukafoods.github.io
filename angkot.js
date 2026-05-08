<script>import * as THREE from "https://esm.sh/three";

// Konfigurasi & Variabel Global Game
const minTileIndex = -7, maxTileIndex = 7, tileSize = 42, zoomLevel = 3.05;
let roadsPassed = 0, lastRoadIndex = -1, isGameOver = false, gameInitialized = false;
const metadata = [];
const movesQueue = [];
const clock = new THREE.Clock();
const moveClock = new THREE.Clock(false);
let position = { currentRow: 0, currentTile: 0 };

// Inisialisasi Three.js
const scene = new THREE.Scene();
const map = new THREE.Group();
scene.add(map);

const textureLoader = new THREE.TextureLoader();
const playerTex = textureLoader.load('https://nasukafoods.site/image/orangnyebrang.jpg');
const carRightTex = textureLoader.load('https://nasukafoods.site/image/angkotkanan.jpg');
const carLeftTex = textureLoader.load('https://nasukafoods.site/image/angkotkiri.jpg');

const player = new THREE.Group();
const playerSpriteMaterial = new THREE.SpriteMaterial({ map: playerTex });
const playerBody = new THREE.Sprite(playerSpriteMaterial);
playerBody.scale.set(32, 32, 1);
playerBody.position.z = 16;
player.add(playerBody);
scene.add(player);

const camera = new THREE.OrthographicCamera(window.innerWidth/-zoomLevel, window.innerWidth/zoomLevel, window.innerHeight/zoomLevel, window.innerHeight/-zoomLevel, 1, 1000);
camera.position.set(0, -200, 200);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ 
    canvas: document.querySelector("canvas.game"), 
    antialias: true, 
    alpha: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
scene.add(new THREE.AmbientLight(0xffffff, 0.9));

// Fungsi Pembantu Objek
function Car(idx, dir) {
    const c = new THREE.Group(); c.position.x = idx * tileSize;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dir ? carRightTex : carLeftTex, transparent: true }));
    s.scale.set(70, 45, 1); s.position.z = 18; c.add(s); return c;
}
function Grass(idx) {
    const g = new THREE.Group(); g.position.y = idx * tileSize;
    g.add(new THREE.Mesh(new THREE.BoxGeometry(tileSize * 30, tileSize, 3), new THREE.MeshLambertMaterial({ color: 0xbaf455 })));
    return g;
}
function Road(idx) {
    const r = new THREE.Group(); r.position.y = idx * tileSize;
    r.add(new THREE.Mesh(new THREE.PlaneGeometry(tileSize * 30, tileSize), new THREE.MeshLambertMaterial({ color: 0x454a59 })));
    return r;
}

function addRows() {
    for (let i = 0; i < 20; i++) {
        const type = Math.random() > 0.4 ? "car" : "forest";
        const rowIndex = metadata.length + 1;
        let row; const rowData = { type, vehicles: [] };
        if (type === "forest") { row = Grass(rowIndex); } 
        else {
            row = Road(rowIndex); rowData.direction = Math.random() > 0.5; rowData.speed = 120 + Math.random() * 120;
            for (let v = 0; v < 2; v++) {
                const vehicle = Car(Math.floor(Math.random() * (maxTileIndex - minTileIndex)) + minTileIndex, rowData.direction);
                row.add(vehicle); rowData.vehicles.push({ ref: vehicle });
            }
        }
        map.add(row); metadata.push(rowData);
    }
}

// Global Functions untuk dipanggil dari UI
window.initializeMap = () => {
    metadata.length = 0; while(map.children.length > 0) map.remove(map.children[0]);
    for (let i = -10; i <= 0; i++) map.add(Grass(i));
    position.currentRow = 0; position.currentTile = 0; player.position.set(0,0,0);
    roadsPassed = 0; lastRoadIndex = -1; isGameOver = false; movesQueue.length = 0;
    addRows(); 
    window.updateUI();
};

window.queueMove = (dir) => {
    if (isGameOver) return;
    if (dir === "left") playerBody.scale.x = -32;
    if (dir === "right") playerBody.scale.x = 32;
    if (dir === "forward") movesQueue.push(dir);
    if (dir === "backward" && position.currentRow > 0) movesQueue.push(dir);
    if (dir === "left" && position.currentTile > minTileIndex) movesQueue.push(dir);
    if (dir === "right" && position.currentTile < maxTileIndex) movesQueue.push(dir);
};

function stepCompleted() {
    const dir = movesQueue.shift(); const prevRow = position.currentRow;
    if (dir === "forward") position.currentRow++;
    if (dir === "backward") position.currentRow--;
    if (dir === "left") position.currentTile--;
    if (dir === "right") position.currentTile++;
    
    const prd = metadata[prevRow - 1]; 
    if (prd && prd.type === "car" && prevRow > lastRoadIndex) {
        roadsPassed++; lastRoadIndex = prevRow;
        // Panggil fungsi global untuk update database (ada di script utama)
        if(window.addGemsFromGame) window.addGemsFromGame(10); 
    }
    if (position.currentRow > metadata.length - 15) addRows();
}

window.animateAngkot = () => {
    requestAnimationFrame(window.animateAngkot);
    if (isGameOver || !window.gameActive) { 
        if(window.gameActive) renderer.render(scene, camera); 
        return; 
    }
    
    const delta = clock.getDelta();
    metadata.forEach(row => {
        if (row.type === "car") {
            row.vehicles.forEach(v => {
                if (row.direction) { v.ref.position.x += row.speed * delta; if (v.ref.position.x > 400) v.ref.position.x = -400; } 
                else { v.ref.position.x -= row.speed * delta; if (v.ref.position.x < -400) v.ref.position.x = 400; }
            });
        }
    });

    if (movesQueue.length > 0) {
        if (!moveClock.running) moveClock.start();
        const progress = Math.min(1, moveClock.getElapsedTime() / 0.15);
        const startX = position.currentTile * tileSize, startY = position.currentRow * tileSize;
        let endX = startX, endY = startY;
        if (movesQueue[0] === "forward") endY += tileSize;
        if (movesQueue[0] === "backward") endY -= tileSize;
        if (movesQueue[0] === "left") endX -= tileSize;
        if (movesQueue[0] === "right") endX += tileSize;
        player.position.x = THREE.MathUtils.lerp(startX, endX, progress);
        player.position.y = THREE.MathUtils.lerp(startY, endY, progress);
        playerBody.position.z = 16 + Math.sin(progress * Math.PI) * 20;
        if (progress >= 1) { stepCompleted(); moveClock.stop(); }
    }
    
    camera.position.y = player.position.y - 200; 
    camera.lookAt(0, player.position.y, 0);
    
    const cr = metadata[position.currentRow - 1];
    if (cr && cr.type === "car") {
        cr.vehicles.forEach(v => { 
            if (Math.abs(v.ref.position.x - player.position.x) < 35) { 
                isGameOver = true; 
                document.getElementById("result-container").style.visibility = "visible"; 
            } 
        });
    }
    renderer.render(scene, camera);
};

// Start animation loop
window.animateAngkot();
</script>
