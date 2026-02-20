export const GAME_CONFIG = {
  canvas: { width: 640, height: 480 },
  shooterBaseWidth: 46,
  shooterBaseHeight: 14,
  barrelLength: 28,
  shooterSpeed: 18,
  ballRadius: 5,
  fieldMargin: 24,
  wallLineWidth: 2,
  wallGap: 8,
  maxShots: 10,
  minAimDeg: 5,
  speedMin: 2,
  speedMax: 9,
  speedStep: 0.5,
  defaultSpeed: 7,
  brickPadding: 2,
  brickHeight: 8,
  brickOffsetY: 40,
  pattern: [
    "00111111011111111011111110111111100",
    "00111111011111111011111110111111100",
    "00111111011111111011111110111111100",
    "00111111011111111011000110110001100",
    "00110001011000011011000110110001100",
    "00110001011000011011000110110001100",
    "00110001011000011011000110110001100",
    "00110001011000011011000110110001100",
    "00110001011000011011111110111111100",
    "00111111011000011011111110111111100",
    "00111111011000011011111110111111100",
    "00111111011111111011111000111110000",
    "00110000011111111011111000111110000",
    "00110000011111111011101100111011000",
    "00110000011111111011101100111011000",
    "00110000011111111011100110111001100",
    "00110000011111111011100110111001100",
    "00110000011111111011100010111000100"
  ]
};

export function deriveField(config = GAME_CONFIG) {
  const innerMargin = config.fieldMargin + config.wallLineWidth + config.wallGap;
  const rowCount = config.pattern.length;
  const colCount = config.pattern[0].length;
  const playWidth = config.canvas.width - 2 * innerMargin;
  const brickWidth = Math.floor((playWidth - (colCount - 1) * config.brickPadding) / colCount);
  const bricksTotalWidth = colCount * brickWidth + (colCount - 1) * config.brickPadding;
  const brickOffsetX = innerMargin + (playWidth - bricksTotalWidth) / 2;

  return {
    innerMargin,
    rowCount,
    colCount,
    playWidth,
    brickWidth,
    bricksTotalWidth,
    brickOffsetX
  };
}
