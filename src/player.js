import * as PIXI from 'pixi.js';

/**
 *  Creates the Renderer
 *
 *  @returns {PIXIRenderer}
 */
const player = (renderer, gridSize) => {
  // Create the grid

  const playerContainer = new PIXI.particles.ParticleContainer();
  const playerGraphic = new PIXI.Graphics();

  playerGraphic.lineStyle(1, 0x999999, 1);
  playerGraphic.beginFill(0xcccccc);
  playerGraphic.drawEllipse(0, 0, gridSize / 2, gridSize / 2);
  playerGraphic.endFill();

  playerContainer.addChild(new PIXI.Sprite(renderer.generateTexture(playerGraphic)));
  return playerContainer;
};

export default player;
