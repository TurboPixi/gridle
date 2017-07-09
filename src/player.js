import * as PIXI from 'pixi.js';

import keybind from './keybind';

export default class Player extends PIXI.Container {

  constructor(renderer, gridSize) {
    super();
    this.spriteScale = 6;
    this.gridSize = gridSize;
    this.buildGraphic(this.spriteScale);
    this.texture = renderer.generateTexture(this.graphic);
    this.sprite = new PIXI.Sprite(this.texture);
    this.sprite.scale.x = 1 / this.spriteScale;
    this.sprite.scale.y = 1 / this.spriteScale;
    this.addChild(this.sprite);
    keybind(37, this.moveLeft);
    keybind(38, this.moveUp);
    keybind(39, this.moveRight);
    keybind(40, this.moveDown);
    // keybind(27, () => { debugger; }); // 'esc' to start js debugger
  }

  buildGraphic(scale) {
    this.graphic = new PIXI.Graphics();
    this.graphic.lineStyle(scale * 0.75, 0x999999, 1);
    this.graphic.beginFill(0xe7e7e7);
    this.graphic.drawEllipse(scale * this.gridSize / 2,
                             scale * this.gridSize / 2,
                             scale * (this.gridSize - 1) / 2,
                             scale * (this.gridSize - 1) / 2);
    this.graphic.endFill();
    this.graphic.lineStyle(scale * 1.0, 0xa0a0a0, 0.8);
    this.graphic.drawRect(scale * this.gridSize * 0.4,
                          scale * this.gridSize * 0.3,
                          scale * this.gridSize * 0.3,
                          scale * this.gridSize * 0.3);

  }

  move(xCount, yCount) {
    this.x = this.x + (xCount * this.gridSize);
    this.y = this.y + (yCount * this.gridSize);
  }

  moveLeft = () => this.move(-1, 0);
  moveUp = () => this.move(0, -1);
  moveRight = () => this.move(1, 0);
  moveDown = () => this.move(0, 1);

  animate() {

  }
}
