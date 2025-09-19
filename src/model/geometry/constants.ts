/**
 * Different amounts a cube can be rotated by
 */
export const enum RotationAmount {
  /** No rotation - keep it as-is */
  None = 0,
  /** Rotate once clockwise */
  Clockwise = 1,
  /** Rotate once counter-clockwise */
  CounterClockwise = 3,
  /** Rotate twice clockwise */
  Halfway = 2,
  /** Rotate twice counter-clockwise */
  HalfwayReverse = 2,
  /** Rotate three times clockwise */
  ThreeQuarter = 3,
  /** Rotate three times counter-clockwise */
  ThreeQuarterReverse = 1,
}
