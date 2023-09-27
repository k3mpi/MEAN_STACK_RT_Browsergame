import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { UserService } from 'src/app/_services/user.service';
import { MapService } from 'src/app/game_services/map.service';
import { SocketService } from 'src/app/_services/socket.service';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  user: any;
  map!: number[][]; // Hier wird die Tilemap gespeichert
  tileSize = 16; // Größe eines Tiles in Pixeln
  cameraX = 0; // X-Position der Kamera
  cameraY = 0; // Y-Position der Kamera
  canvasWidth = 1200; // Breite des Canvas (Sichtfensters)
  canvasHeight = 800; // Höhe des Canvas (Sichtfensters)
  canvas: any;
  backgroundImage = new Image();

  shipX = this.canvasWidth / 2; // X-Position des Raumschiffs (in der Mitte des Canvas)
  shipY = this.canvasHeight / 2; // Y-Position des Raumschiffs (in der Mitte des Canvas)
  shipAngle = 0; // Startwinkel des Raumschiffs (in Grad)
  shipSpeed = 0; // Anfangsgeschwindigkeit des Raumschiffs
  shipMaxSpeed = 5; // Maximale Geschwindigkeit des Raumschiffs

  private shipVelocityX = 0; // Velocity in X direction
  private shipVelocityY = 0; // Velocity in Y direction
  private shipAcceleration = 0.1; // Acceleration factor
  private shipFriction = 0.02; // Friction factor
  private shipRotationSpeed = 5; // Rotation speed (in degrees per frame)


  private animationFrameId!: number;
  private fpsInterval: number = 1000 / 30; // 30 FPS

  @ViewChild('gameCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D | undefined;

  constructor(private userService: UserService, private socketService: SocketService, private mapService: MapService, private renderer: Renderer2) { }


  ngOnInit(): void {
    
 
    // ... (bereits vorhandener Code)

    // Starte die Game-Loop
    this.socketService.connectSocket(); // Verbindung zum Socket.IO-Server herstellen
    this.backgroundImage.src = 'assets/background.jpg';
    this.mapService.getCreateMap().subscribe(
      (data: any) => {
        this.map = data; // Assuming that the response is the map data you need
        console.log(this.map);
        console.log("map");
  
        this.user = { username: 'John' }; // Beispielbenutzer
        this.startGameLoop();
      },
      (error: any) => {
        console.error('Error loading map data', error);
      }
    );
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
  
    this.user = { username: 'John' }; // Beispielbenutzer
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.canvasRef.nativeElement.width = this.canvasWidth; // Neue Breite setzen
    this.canvasRef.nativeElement.height = this.canvasHeight; // Neue Höhe setzen
  
    this.startGameLoop();;
  }

  ngOnDestroy(): void {
    // Beende die Game-Loop und die Socket.IO-Verbindung, wenn die Komponente zerstört wird
    cancelAnimationFrame(this.animationFrameId);
    this.socketService.disconnectSocket(); // Verbindung zum Socket.IO-Server trennen
  }

  // Aktion "movePlayer" ausführen
  movePlayer(direction: string): void {
    const mockMoveData = { direction, playerId: this.user.id }; // Mock-Daten für Spielerbewegungen
    this.socketService.emitMovePlayer(mockMoveData); // Aktion an den Server senden
  }

  // Aktion "shoot" ausführen
  shoot(): void {
    const mockShootData = { shooterId: this.user.id, targetId: 'somePlayerId' }; // Mock-Daten für Schüsse
    this.socketService.emitShoot("rakete"); // Aktion an den Server senden
    console.log("jo");
  }

  // Game-Loop starten
  private startGameLoop(): void {
    let then = performance.now();
    let startTime = then;
    const desiredFPS = 30; // Gewünschte FPS
  
    const animate = (now: number) => {
      // Calculate time since the last frame
      const elapsed = now - then;

      // If enough time has passed, perform game update and draw
      if (elapsed > this.fpsInterval) {
        then = now - (elapsed % this.fpsInterval);

        // Perform game update (movement, collision, etc.)
        this.updateGame(elapsed);

        // Draw the game
        this.drawGame();
      }

      // Request the next frame
      this.animationFrameId = requestAnimationFrame(animate);

      // Limit FPS
      if (now - startTime >= 1000 / desiredFPS) {
        startTime = now - (now - startTime) % (1000 / desiredFPS);
      }
    };

    // Start the animation
    this.animationFrameId = requestAnimationFrame(animate);
  }


  // Funktion zum Aktualisieren des Spiels (Spieldaten, Bewegungen, etc.)
  private updateGame(elapsed: number): void {
 // Apply friction to slow down the ship
 this.shipVelocityX *= 1 - this.shipFriction;
 this.shipVelocityY *= 1 - this.shipFriction;

 // Update the ship's position based on velocity
 this.shipX += this.shipVelocityX;
 this.shipY += this.shipVelocityY;

 // Update the camera position based on the ship's movement
 this.cameraX = this.shipX - this.canvasWidth / 2;
 this.cameraY = this.shipY - this.canvasHeight / 2;

 // Ensure the camera stays within the boundaries of the map
 this.cameraX = Math.max(0, Math.min(this.cameraX, this.map[0].length * this.tileSize - this.canvasWidth));
 this.cameraY = Math.max(0, Math.min(this.cameraY, this.map.length * this.tileSize - this.canvasHeight));

    this.socketService.onServerMessage(() => {
      // Hier kannst du Server-Nachrichten verarbeiten
    });
  }
  drawBackground() {
    if (!this.ctx || !this.map) return;
    
    // Berechne die Position des Hintergrundbildes basierend auf der Kameraposition und einem Parallax-Faktor
    const parallaxFactor = 0.1; // Anpassen, um die Parallax-Geschwindigkeit zu steuern
    const backgroundX = -(this.cameraX * parallaxFactor);
    const backgroundY = -(this.cameraY * parallaxFactor);
    
    // Berechne die Größe des Hintergrundbildes basierend auf dem Zoom-Faktor
    const zoomFactor = 3; // Anpassen, um den Zoom zu steuern
    const backgroundWidth = this.canvasWidth * zoomFactor;
    const backgroundHeight = this.canvasHeight * zoomFactor;
  
    // Zeichne das Hintergrundbild unter Berücksichtigung der berechneten Position und Größe
    this.ctx.drawImage(this.backgroundImage, backgroundX, backgroundY, backgroundWidth, backgroundHeight);
  }
  
  drawTilemap() {
    console.log("draw tilemap");
    if (!this.ctx || !this.map) return;
  
    const numRows = this.map.length;
    const numCols = this.map[0].length;
  
    // Berechne den Bereich der sichtbaren Tiles
    const startRow = Math.max(0, Math.floor(this.cameraY / this.tileSize) - 5);
    const endRow = Math.min(numRows, Math.ceil((this.cameraY + this.canvasHeight) / this.tileSize) + 5);
    const startCol = Math.max(0, Math.floor(this.cameraX / this.tileSize) - 5);
    const endCol = Math.min(numCols, Math.ceil((this.cameraX + this.canvasWidth) / this.tileSize) + 5);
  
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const tileValue = this.map[row][col];
        const tileX = col * this.tileSize - this.cameraX;
        const tileY = row * this.tileSize - this.cameraY;
  
        if (tileValue === 1) {
          // Lade das Tile aus deiner tilemap.png oder einem anderen Asset
          const tileImage = new Image();
          tileImage.src = 'assets/tilemap.png'; // Passe den Pfad entsprechend an
          this.ctx.drawImage(tileImage, 96, 0, this.tileSize, this.tileSize, tileX, tileY, this.tileSize, this.tileSize);
        } else {
          // Zeichne ein schwarzes Rechteck für den Wert 0
       
          //this.ctx.fillStyle = 'black';
          //this.ctx.fillRect(tileX, tileY, this.tileSize, this.tileSize);
        }
      }
    }
  }

  // Funktion zum Zeichnen des Spiels (vereinfacht)
  private drawGame(): void {
    if (!this.ctx || !this.map) return;
    // Hier erfolgt die Zeichenlogik, z.B. Spieler und Raketen zeichnen
    // Verwende this.ctx, um auf den 2D-Kontext des Canvas zuzugreifen

    // Zeichne den Hintergrund
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.drawBackground();


    this.drawTilemap();

      // Zeichne das Raumschiff
 // Zeichne das Raumschiff
const shipImage = new Image();
shipImage.src = 'assets/tilemap.png'; // Passe den Pfad entsprechend an
const shipSize = 16; // Größe des Raumschiffs
this.ctx.save();
this.ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2); // Canvas-Mittelpunkt
this.ctx.rotate((this.shipAngle * Math.PI) / 180); // Winkel in Radian umwandeln und drehen
this.ctx.drawImage(shipImage, 0, 0, shipSize, shipSize, -shipSize / 2, -shipSize / 2, shipSize, shipSize);
this.ctx.restore();
  }
  
 // Event handler for keydown events
 @HostListener('document:keydown', ['$event'])
 handleKeydownEvent(event: KeyboardEvent): void {
   // Umwandlung des Winkels in Radian
   const shipAngleRad = (this.shipAngle * Math.PI) / 180;

   let shipSpeedX = 0; // Geschwindigkeit in X-Richtung
   let shipSpeedY = 0; // Geschwindigkeit in Y-Richtung

   const acceleration = this.shipAcceleration; // Read acceleration from class property
   const maxSpeed = this.shipMaxSpeed; // Read maxSpeed from class property
   const rotationSpeed = this.shipRotationSpeed; // Read rotationSpeed from class property

   switch (event.key) {
     case 'w':
       // Beschleunigen in die aktuelle Richtung
       shipSpeedX += Math.cos(shipAngleRad) * acceleration;
       shipSpeedY += Math.sin(shipAngleRad) * acceleration;
       break;
     case 's':
       // Bremsen oder rückwärts fahren
       shipSpeedX -= Math.cos(shipAngleRad) * acceleration;
       shipSpeedY -= Math.sin(shipAngleRad) * acceleration;
       break;
     case 'a':
       // Drehung nach links
       this.shipAngle -= rotationSpeed;
       break;
     case 'd':
       // Drehung nach rechts
       this.shipAngle += rotationSpeed;
       break;
     default:
       break;
   }

   // Normalize the ship's angle to be within 0 to 360 degrees
   this.shipAngle = (this.shipAngle + 360) % 360;

   // Begrenzen Sie die Geschwindigkeit des Raumschiffs
   const currentSpeed = Math.sqrt(shipSpeedX * shipSpeedX + shipSpeedY * shipSpeedY);
   if (currentSpeed > maxSpeed) {
     const ratio = maxSpeed / currentSpeed;
     shipSpeedX *= ratio;
     shipSpeedY *= ratio;
   }

   // Aktualisieren der Position des Raumschiffs basierend auf der aktuellen Geschwindigkeit
   this.shipVelocityX += shipSpeedX;
   this.shipVelocityY += shipSpeedY;
 }

 // Event handler for keyup events (optional)
 @HostListener('document:keyup', ['$event'])
 handleKeyupEvent(event: KeyboardEvent): void {
   // You can handle key release events here if needed.
 }
}