import * as PIXI from 'pixi.js';
import { sample } from 'lodash';

import Player from './player';

export default class WorldGrid extends PIXI.Container {
  constructor(renderer, gridSize) {
    super();
    this.gridSize = gridSize;
    this.renderer = renderer;
    this.cellWidth = renderer.view.width / gridSize;
    this.cellHeight = renderer.view.height / gridSize;
    this.buildGridLines(renderer, gridSize);
    this.greebles(2048);
    this.yourGuy = new Player(renderer, gridSize);
    this.yourGuy.x = this.cellWidth / 2 * gridSize;
    this.yourGuy.y = (this.cellHeight / 2 - 1) * gridSize;
    this.scrollBoxSetup();
    this.addChild(this.yourGuy);
  }

  scrollBoxSetup = () => {
    this.halfViewport = { x: this.renderer.view.width / 2, y: this.renderer.view.height / 2 };
    this.scrollMargin = { x: this.halfViewport.x / 5, y: this.halfViewport.y / 5 };
    this.halfScrollBox = {
      x: this.halfViewport.x - this.scrollMargin.x,
      y: this.halfViewport.y - this.scrollMargin.y,
    };
    this.scrollBoxCenter = { x: this.yourGuy.x, y: this.yourGuy.y };
    this.setScrollBox();
  }

  setScrollBox = (reCenter = [0, 0]) => {
    if (reCenter[0] !== 0) {
      this.scrollBoxCenter.x += reCenter[0] * (this.halfScrollBox.x);
    }
    if (reCenter[1] !== 0) {
      this.scrollBoxCenter.y += reCenter[1] * (this.halfScrollBox.y);
    }
    this.scrollBox = [
      [this.scrollBoxCenter.x - this.halfScrollBox.x,
        this.scrollBoxCenter.y - this.halfScrollBox.y],
      [this.scrollBoxCenter.x + this.halfScrollBox.x,
        this.scrollBoxCenter.y + this.halfScrollBox.y],
    ];
    // this.drawScrollBox();
  }

  drawScrollBox = () => {
    const gr = new PIXI.Graphics();
    gr.lineStyle(1, 0x000000, 0.2);
    gr.drawRect(this.scrollBox[0][0],
                this.scrollBox[0][1],
                this.scrollBox[1][0] - this.scrollBox[0][0],
                this.scrollBox[1][1] - this.scrollBox[0][1]);
    this.addChild(gr);
  }

  buildGridLines = (renderer, spacing) => {
    this.gridContainer = new PIXI.Container();
    const grid = new PIXI.Graphics();
    const alpha = 0.3;

    for (let i = spacing; i <= renderer.view.height * 3; i += spacing) {
      grid.lineStyle(1, this.gridLineColor(i / spacing), alpha);
      grid.moveTo(0, i);
      grid.lineTo(renderer.view.width * 3, i);
    }

    for (let i = spacing; i <= renderer.view.width * 3; i += spacing) {
      grid.lineStyle(1, this.gridLineColor(i / spacing), alpha);
      grid.moveTo(i, 0);
      grid.lineTo(i, renderer.view.height * 3);
    }

    this.gridSprite = new PIXI.Sprite(renderer.generateTexture(grid));
    this.gridContainer.addChild(this.gridSprite);
    this.gridContainer.x = -renderer.view.width;
    this.gridContainer.y = -renderer.view.height;
    this.addChild(this.gridContainer);
  }

  gridLineColor = (count) => (count % 5 === 0 ? 0x666666 : 0x999999);

  greebles = (num) => {
    // temporary, inefficient ( prefer spritesheet + particalContainer )
    const greebleChars = ['*', '+', '~', '\u2022', '\u25aa'];
    const greebStyle = { fontFamily: 'monospace', fontSize: this.gridSize - 4, fill: '#000' };
    const greebleStrs = Array(num).fill().map(() => sample(greebleChars));
    this.greebles = greebleStrs.map((str) => {
      const txt = new PIXI.Text(str, greebStyle);
      txt.alpha = 0.5;
      txt.x = Math.trunc((Math.random() * 3 - 1) * this.cellWidth) * this.gridSize + (this.gridSize - txt.width) / 2;
      txt.y = Math.trunc((Math.random() * 3 - 1) * this.cellHeight) * this.gridSize + (this.gridSize - txt.height) / 2;
      this.addChild(txt);
      return txt;
    });
  }

  animate = () => {
    this.scroll();
    this.yourGuy.animate();
  }

  scroll = () => {
    if (this.scrollDistanceRemaining) {
      this.scrollX();
      this.scrollY();
      if (this.scrollDistanceRemaining[0] === 0 && this.scrollDistanceRemaining[1] === 0) {
        this.endScroll();
      }
    } else {
      this.beginScroll(this.findScrollDir());
    }
  }

  scrollX = () => {
    if (this.scrollDistanceRemaining[0] !== 0) {
      if (Math.abs(this.scrollDistanceRemaining[0]) >= Math.abs(this.scrollRate[0])) {
        this.x -= this.scrollRate[0];
        this.scrollDistanceRemaining[0] -= this.scrollRate[0];
      } else {
        this.x -= this.scrollDistanceRemaining[0];
        this.scrollDistanceRemaining[0] = 0;
      }
    }
  }

  scrollY = () => {
    if (this.scrollDistanceRemaining[1] !== 0) {
      if (Math.abs(this.scrollDistanceRemaining[1]) >= Math.abs(this.scrollRate[1])) {
        this.y -= this.scrollRate[1];
        this.scrollDistanceRemaining[1] -= this.scrollRate[1];
      } else {
        this.y -= this.scrollDistanceRemaining[1];
        this.scrollDistanceRemaining[1] = 0;
      }
    }
  }

  scrollFrames = 45;

  beginScroll = ([xDir, yDir]) => {
    if (xDir === 0 && yDir === 0) { return; }
    if (this.scrollDistanceRemaining) {
      // corner cases; works without adding anything here, but diagonal scroll would look cool
    } else {
      this.setScrollBox([xDir, yDir]);
      this.scrollDistanceRemaining = [xDir * this.halfScrollBox.x, yDir * this.halfScrollBox.y];
      this.scrollRate = this.scrollDistanceRemaining.map((px) => Math.trunc(px / this.scrollFrames));
      this.gridContainer.x += Math.round(this.scrollDistanceRemaining[0] / this.gridSize) * this.gridSize;
      this.gridContainer.y += Math.round(this.scrollDistanceRemaining[1] / this.gridSize) * this.gridSize;
    }
  }

  endScroll = () => {
    delete this.scrollDistanceRemaining;
    delete this.scrollRate;
  }

  findScrollDir = () => {
    const ret = [0, 0];

    if (this.yourGuy.x >= this.scrollBox[1][0]) {
      ret[0] = 1;
    } else if (this.yourGuy.x <= this.scrollBox[0][0]) {
      ret[0] = -1;
    }

    if (this.yourGuy.y >= this.scrollBox[1][1]) {
      ret[1] = 1;
    } else if (this.yourGuy.y <= this.scrollBox[0][1]) {
      ret[1] = -1;
    }

    return ret;
  }
}
