import * as PIXI from 'pixi.js';

const gridContainer = (renderer, spacing = 10) => {
  // Create the grid

  const container = new PIXI.particles.ParticleContainer();
  const grid = new PIXI.Graphics();
  const alpha = 0.3;

  for (let i = spacing; i <= renderer.view.height; i += spacing) {
    const color = (i / spacing) % 5 === 0 ? 0x666666 : 0x999999;
    grid.lineStyle(1, color, alpha);
    grid.moveTo(0, i);
    grid.lineTo(renderer.view.width, i);
  }

  for (let i = spacing; i <= renderer.view.width; i += spacing) {
    const color = (i / spacing) % 5 === 0 ? 0x666666 : 0x999999;
    grid.lineStyle(1, color, alpha);
    grid.moveTo(i, 0);
    grid.lineTo(i, renderer.view.height);
  }

  container.addChild(new PIXI.Sprite(renderer.generateTexture(grid)));
  return container;
};

export default gridContainer;
