import * as PIXI from 'pixi.js';
import { forEach } from 'lodash';

class Tuft {
  constructor(renderer, cloud) {
    this.cloud = cloud;
    this.widthInCells = Math.trunc(Math.random() * (cloud.widthInCells * 0.4)) +
      Math.trunc(cloud.widthInCells * 0.4);
    this.heightInCells = Math.trunc(Math.random() * (cloud.heightInCells * 0.4)) +
      Math.trunc(cloud.heightInCells * 0.4);
    this.graphics = new PIXI.Graphics();

    // this.graphics.lineStyle(1, 0xffffff, 0.5);
    this.graphics.beginFill(0xffffff, 0.2);
    this.graphics.drawEllipse(0, 0,
                              cloud.gridSize * this.widthInCells / 2,
                              cloud.gridSize * this.heightInCells / 2);
    this.graphics.endFill();
    this.texture = renderer.generateTexture(this.graphics);
    this.sprite = new PIXI.Sprite(this.texture);
    this.sprite.x = Math.trunc(Math.random() * (cloud.widthInCells - this.widthInCells)) * cloud.gridSize;
    this.sprite.y = Math.trunc(Math.random() * (cloud.heightInCells - this.heightInCells)) * cloud.gridSize;
    this.vx = Math.random() * 0.2 - 0.1;
    this.vy = Math.random() * 0.2 - 0.1;
  }

  drift() {
    if (this.sprite.x <= 0 || this.sprite.x + this.sprite.width >= this.cloud.width) {
      this.vx = -this.vx;
    }
    if (this.sprite.y <= 0 || this.sprite.y + this.sprite.height >= this.cloud.height) {
      this.vy = -this.vy;
    }
    this.sprite.x += this.vx; // Math.trunc(this.xFloat);
    this.sprite.y += this.vy; // Math.trunc(this.yFloat);
  }
}

export default class Cloud {
  constructor(renderer, gridSize) {
    this.renderer = renderer;
    this.gridSize = gridSize;
    this.minWidth = 36;
    this.minHeight = 16;
    this.widthInCells = Math.trunc(Math.random() * 18) + this.minWidth;
    this.heightInCells = Math.trunc(Math.random() * 8) + this.minHeight;
    this.width = this.widthInCells * gridSize;
    this.height = this.heightInCells * gridSize;
    this.container = new PIXI.particles.ParticleContainer();
    this.setNumTufts();
    this.tufts = [];
    this.vx = Math.random() * 0.2 - 0.1;
    this.vy = Math.random() * 0.2 - 0.1;
    for (let i = 0; i < this.numTufts; i += 1) {
      const tuft = new Tuft(renderer, this);
      this.tufts.push(tuft);
      this.container.addChild(tuft.sprite);
    }
  }

  get x() {
    return this.container.x;
  }

  set x(val) {
    this.container.x = val;
  }

  get y() {
    return this.container.y;
  }

  set y(val) {
    this.container.y = val;
  }

  areaInCells() {
    return this.widthInCells * this.heightInCells;
  }

  minAreaInCells() {
    return this.minWidth * this.minHeight;
  }

  setNumTufts() {
    const bigitude = this.areaInCells() / this.minAreaInCells();
    this.numTufts = Math.trunc(Math.random() * bigitude + bigitude) + 4;
  }

  drift() {
    forEach(this.tufts, (tuft) => tuft.drift());
    if (Math.random() < 0.001) {
      this.vx += Math.random() * 0.01 - 0.005;
      this.vy += Math.random() * 0.01 - 0.005;
    }
    if (this.container.x <= 0 || this.container.x + this.container.width >= this.renderer.view.width) {
      this.vx = -this.vx;
    }
    if (this.container.y <= 0 || this.container.y + this.container.height >= this.renderer.view.height) {
      this.vy = -this.vy;
    }
    this.container.x += this.vx;
    this.container.y += this.vy;
  }
}
