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
  canvasWidth = 800; // Breite des Canvas (Sichtfensters)
  canvasHeight = 800; // Höhe des Canvas (Sichtfensters)
  canvas: any;
  backgroundImage = new Image();

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
      // Berechne die vergangene Zeit seit dem letzten Frame
      const elapsed = now - then;
  
      // Wenn die vergangene Zeit größer als das gewünschte Intervall für die FPS ist,
      // führe das Spiel-Update und die Zeichnung aus
      if (elapsed > this.fpsInterval) {
        then = now - (elapsed % this.fpsInterval); // Aktualisiere den letzten Zeitpunkt
  
        // Führe das Spiel-Update aus (z.B. Bewegungen, Kollisionen, Socket-Kommunikation)
        this.updateGame(elapsed);
  
        // Zeichne das Spiel
        this.drawGame();
      }
  
      // Fordere den nächsten Frame an
      this.animationFrameId = requestAnimationFrame(animate);
  
      // Überprüfe, ob es Zeit ist, die FPS zu begrenzen
      if (now - startTime >= 1000 / desiredFPS) {
        // Setze den Startzeitpunkt für den nächsten Frame
        startTime = now - (now - startTime) % (1000 / desiredFPS);
      }
    };
  
    // Starte die Animation
    this.animationFrameId = requestAnimationFrame(animate);
  }

  // Funktion zum Aktualisieren des Spiels (Spieldaten, Bewegungen, etc.)
  private updateGame(elapsed: number): void {
    // Hier erfolgt die Aktualisierungslogik, z.B. Spielerbewegungen, Kollisionen, etc.

    // Handle Socket-Nachrichten vom Server (wenn erforderlich)
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
  }
  @HostListener('document:keydown', ['$event'])
  handleKeydownEvent(event: KeyboardEvent): void {
    if (event.key === ' ' || event.code === 'Space') {
      // Wenn die Leertaste gedrückt wird, rufe die "shoot"-Funktion auf
      this.shoot();
    } else {
      // Kamera-Steuerung mit WASD-Tasten
      const speed = 4; // Anpassen Sie die Geschwindigkeit nach Bedarf

      switch (event.key) {
        case 'w':
          this.cameraY -= speed;
          break;
        case 'a':
          this.cameraX -= speed;
          break;
        case 's':
          this.cameraY += speed;
          break;
        case 'd':
          this.cameraX += speed;
          break;
      }
    }
  }
}



