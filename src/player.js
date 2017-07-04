import * as PIXI from 'pixi.js';

import keybind from './keybind';

export default class Player extends PIXI.Container {

  constructor(renderer, gridSize) {
    super();
    this.gridSize = gridSize;
    this.buildGraphic();
    this.texture = renderer.generateTexture(this.graphic);
    this.sprite = new PIXI.Sprite(this.texture);
    this.addChild(this.sprite);
    keybind(37, this.moveLeft);
    keybind(38, this.moveUp);
    keybind(39, this.moveRight);
    keybind(40, this.moveDown);
    keybind(81, () => { debugger; });
  }

  buildGraphic() {
    this.graphic = new PIXI.Graphics();
    this.graphic.lineStyle(1, 0x999999, 1);
    this.graphic.beginFill(0xe7e7e7);
    this.graphic.drawEllipse(0, 0, this.gridSize / 2 - 1, this.gridSize / 2 - 1);
    this.graphic.endFill();
  }

  move(xCount, yCount) {
    this.x = this.x + (xCount * this.gridSize);
    this.y = this.y + (yCount * this.gridSize);
    console.log([this.x, this.y]);
  }

  moveLeft = () => this.move(-1, 0);
  moveUp = () => this.move(0, -1);
  moveRight = () => this.move(1, 0);
  moveDown = () => this.move(0, 1);

  animate() {
  }
}
