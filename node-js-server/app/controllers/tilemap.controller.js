exports.createMap = (req, res) => {
  const tilemapSize = 256;
  const tilemap = [];

  // Erstelle ein leeres 2D-Array
  for (let i = 0; i < tilemapSize; i++) {
    tilemap.push(Array(tilemapSize).fill(0));
  }
  // Erstelle ein leeres 2D-Array
  for (let i = 0; i < tilemapSize; i++) {
  const row = [];
  for (let j = 0; j < tilemapSize; j++) {
    // Generiere zufällig 0 oder 1
    const randomValue = Math.random() < 0.5 ? 0 : 1;
    row.push(randomValue);
  }
  tilemap.push(row);
}

  // Erstelle den mittleren Kreis
  const centerX = Math.floor(tilemapSize / 2);
  const centerY = Math.floor(tilemapSize / 2);
  const middleCircleRadius = Math.floor(Math.random() * (64 - 18 + 1)) + 18;

  for (let x = centerX - middleCircleRadius; x <= centerX + middleCircleRadius; x++) {
    for (let y = centerY - middleCircleRadius; y <= centerY + middleCircleRadius; y++) {
      if ((x - centerX) ** 2 + (y - centerY) ** 2 <= middleCircleRadius ** 2) {
        tilemap[y][x] = 1;
      }
    }
  }

  // Erstelle weitere Kreise
  const numCircles = Math.floor(Math.random() * 10) + 1;

for (let i = 0; i < numCircles; i++) {
  const circleRadius = Math.floor(Math.random() * (middleCircleRadius - 4)) + 4;
  const circleX = Math.floor(Math.random() * (tilemapSize - 2 * circleRadius)) + circleRadius;
  const circleY = Math.floor(Math.random() * (tilemapSize - 2 * circleRadius)) + circleRadius;

  for (let x = circleX - circleRadius; x <= circleX + circleRadius; x++) {
    for (let y = circleY - circleRadius; y <= circleY + circleRadius; y++) {
      if ((x - circleX) ** 2 + (y - circleY) ** 2 <= circleRadius ** 2) {
        tilemap[y][x] = 1;
      }
    }
  }
}

  // Überprüfe, ob 1 in der Tilemap vorkommt und gib dies in der Konsole aus
  const hasOnes = tilemap.some(row => row.includes(1));
  console.log(`Tilemap enthält 1er: ${hasOnes}`);

  res.status(200).send(tilemap);
};
