import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  constructor(private socket: Socket) { }

  // Connect to the Socket.IO server
  connectSocket(): void {
    this.socket.connect();
  }

  // Disconnect from the Socket.IO server
  disconnectSocket(): void {
    this.socket.disconnect();
  }

  // Define Socket.IO events and actions here
  // For example:
  emitMovePlayer(data: any): void {
    this.socket.emit('movePlayer', data);
  }

  emitShoot(data: string): void {
    this.socket.emit('shoot', data);
    console.log("emit shoot");
  }
  handleShootResponse(): void {
    // Verarbeiten Sie die Antwort hier im Service
    this.socket.fromEvent<string>('shootResponse')
      .subscribe((response) => {
        console.log("Rdddeceived shoot response:", response);
        // Hier können Sie die Antwort weiter verarbeiten, z.B. in einem BehaviorSubject speichern
      });
  }

  // Methode zum Abhören von Servernachrichten
  onServerMessage(callback: (data: any) => void) {
    this.socket.fromEvent('serverMessage').subscribe(data => {
      callback(data);
    });
  }
}

