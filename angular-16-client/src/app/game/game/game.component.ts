import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { UserService } from 'src/app/_services/user.service';
import { SocketService } from 'src/app/_services/socket.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  user: any;
  players: any[] = [];
  canvas: any;
  ctx: any;

  private animationFrameId!: number;
  private fpsInterval: number = 1000 / 30; // 30 FPS

  constructor(private userService: UserService, private socketService: SocketService) { }

  ngOnInit(): void {
    // ... (bereits vorhandener Code)

    // Starte die Game-Loop
    this.socketService.connectSocket(); // Verbindung zum Socket.IO-Server herstellen
    

    this.user = { username: 'John' }; // Beispielbenutzer
    this.startGameLoop();
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
    const animate = (now: number) => {
      // Berechne die vergangene Zeit seit dem letzten Frame
      const elapsed = now - then;

      // Führe das Spiel-Update aus (z.B. Bewegungen, Kollisionen, Socket-Kommunikation)
      this.updateGame(elapsed);

      // Zeichne das Spiel
      this.drawGame();

      then = now;

      // Fordere den nächsten Frame an
      this.animationFrameId = requestAnimationFrame(animate);

      // Überprüfe, ob es Zeit ist, die FPS zu begrenzen
      if (now - startTime >= this.fpsInterval) {
        // Setze den Startzeitpunkt für den nächsten Frame
        startTime = now - (now - startTime) % this.fpsInterval;
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

  // Funktion zum Zeichnen des Spiels (vereinfacht)
  private drawGame(): void {
    // Hier erfolgt die Zeichenlogik, z.B. Spieler und Raketen zeichnen
    // Verwende this.ctx, um auf den 2D-Kontext des Canvas zuzugreifen
  }
  @HostListener('document:keydown', ['$event'])
  handleKeydownEvent(event: KeyboardEvent): void {
    if (event.key === ' ' || event.code === 'Space') {
      // Wenn die Leertaste gedrückt wird, rufen Sie die "shoot"-Funktion auf
      this.shoot();
    }
  }
}



