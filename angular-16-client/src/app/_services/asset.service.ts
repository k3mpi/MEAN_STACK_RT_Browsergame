import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  constructor(private http: HttpClient) {}

  // Methode zum Laden der Tilemap
  loadTilemap(): Observable<Blob> {
    return this.http.get('assets/tilemap.png', { responseType: 'blob' });
  }

  // Methode zum Extrahieren eines einzelnen Tiles aus der Tilemap basierend auf dem Tile-Typ
  getTileByType(tileType: string, tileSize: number): Observable<Blob> {
    // Annahme: tileType ist der Typ des gewünschten Tiles (z.B. "ship", "bullet", "explosion_1", usw.)

    // Hier könntest du eine Zuordnung von Tile-Typen zu ihren Koordinaten definieren
    const tileCoordinates: { [key: string]: { x: number; y: number } } = {
      ship: { x: 0, y: 0 },
      bullet: { x: 0, y: 16 },
      explosion_1: { x: 0, y: 32 },
      // Füge weitere Tile-Typen hinzu, wie benötigt
    };

    const coordinates = tileCoordinates[tileType];
    
    if (!coordinates) {
      return new Observable<Blob>(observer => {
        observer.error('Tile type not found.');
      });
    }

    return new Observable<Blob>(observer => {
      this.loadTilemap().subscribe(blob => {
        const img = new Image();
        img.src = URL.createObjectURL(blob);

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = tileSize;
          canvas.height = tileSize;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, coordinates.x, coordinates.y, tileSize, tileSize, 0, 0, tileSize, tileSize);

            canvas.toBlob(tileBlob => {
              if (tileBlob) {
                observer.next(tileBlob);
                observer.complete();
              } else {
                observer.error('Failed to extract tile.');
              }
            }, 'image/png');
          } else {
            observer.error('Failed to get 2D context.');
          }
        };
      });
    });
  }
}
