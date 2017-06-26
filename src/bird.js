import * as PIXI from 'pixi.js';
import { forEach } from 'lodash';

function spriteFrame(opts) {
  return ({
    frame: { x: opts.x, y: opts.y, w: opts.w, h: opts.h },
    rotated: false,
    trimmed: false,
    spriteSourceSize: { x: 0, y: 0, w: opts.w, h: opts.h },
    sourceSize: { w: opts.w, h: opts.h },
  });
}

export default class Bird {

  constructor(renderer, gridSize) {
    this.gridSize = gridSize;
    this.renderer = renderer;
    this.scale = gridSize * 6;
    this.center = { x: this.scale * 3.5, y: this.scale };
    this.setupSpeedAndAltitude();
    this.bearing = Math.random() * 2 * Math.PI;
    this.graphics = new PIXI.Graphics();
    this.atlas = { frames: {}, meta: {} };
    this.buildSpriteSheet();
    // this.container = new PIXI.Container(); // for debugging, prefer ParticleContainer
    this.container = new PIXI.particles.ParticleContainer(100, { rotation: true, scale: true });
    this.container.birdRef = this;
    this.container.pivot.set(this.center.x, this.center.y);
    this.drawBird();
    this.setRotationAndVector();
    this.setScaleFromAltitude();
  }

  setupSpeedAndAltitude() {
    this.minSpeed = 0.2;
    this.minAltitude = 1.5;
    this.speedForAltitude = 0.7;
    this.maxAltitude = 4;
    this.maxSpeed = this.minSpeed + (this.maxAltitude - this.minAltitude) * this.speedForAltitude;
    this.altitude = this.minAltitude + Math.random(this.maxAltitude - this.minAltitude);
    this.speed = this.minSpeed + (this.maxAltitude - this.altitude) * this.speedForAltitude;
    console.log(`maxSpeed: ${this.maxSpeed}, speed: ${this.speed}`);
  }

  setRotationAndVector() {
    this.vx = this.speed * Math.cos(this.bearing);
    this.vy = this.speed * Math.sin(this.bearing); // rotation in Pixi is clockwise
    this.container.rotation = this.bearing + Math.PI / 2; // 0 points left, model points up
  }

  setScaleFromAltitude() {
    const newScale = 6 * this.altitude / this.scale;
    this.container.scale.set(newScale, newScale);
  }

  buildSpriteSheet() {
    if ('fullBirdSpriteSheet' in PIXI.utils.TextureCache) {
      // Don't build the spritesheet more than once
      return;
    }
    const scale = this.scale;
    const gr = new PIXI.Graphics();

    // body
    this.atlas.frames.birdBody = spriteFrame({ x: 0, y: 0, w: scale * 0.6, h: scale * 1.2 });
    gr.beginFill(0x999999);
    // gr.drawEllipse(20, 20, 15, 10);
    gr.drawEllipse(...this.paramsForEllipse('birdBody'));
    gr.endFill();

    // wing
    this.atlas.frames.birdWing = spriteFrame({ x: gr.width + 2, y: 0, w: 2.4 * scale, h: scale * 0.8 });
    gr.beginFill(0xaaaaaa);
    gr.drawEllipse(...this.paramsForEllipse('birdWing'));
    gr.endFill();

    // feather
    this.atlas.frames.birdFeather = spriteFrame({
      x: this.atlas.frames.birdWing.frame.x,
      y: this.atlas.frames.birdWing.frame.h + 2,
      w: 0.8 * scale,
      h: 0.2 * scale,
    });
    gr.beginFill(0x999999);
    gr.drawEllipse(...this.paramsForEllipse('birdFeather'));
    gr.endFill();

    // shoulder
    this.atlas.frames.birdShoulder = spriteFrame({
      x: gr.width + 2,
      y: 0,
      w: 1.8 * scale,
      h: 0.6 * scale,
    });
    gr.beginFill(0x999999);
    gr.drawEllipse(...this.paramsForEllipse('birdShoulder'));
    gr.endFill();

    // tail
    gr.beginFill(0xaaaaaa);
    // gr.lineStyle(1, 0xaaaaaa, 1);
    const edge = gr.width;
    // NOTE: trying to put the arc center at y: 0 will break pixi at runtime
    gr.arc(edge + 2 + scale * 0.5, 2, scale, (Math.PI / 2) - 0.45, (Math.PI / 2) + 0.45);
    gr.lineTo(edge + 2 + scale * 0.5, 2);
    gr.closePath();
    gr.endFill();
    // FIXME: kinda eyeballing the atlas entry for this one, use math instead
    this.atlas.frames.birdTail = spriteFrame({
      x: edge + 4,
      y: 0,
      w: gr.width - edge - 4,
      h: scale + 4 });

    // background box
    this.atlas.frames.birdBackBox = spriteFrame({ x: 0, y: gr.height + 2, w: this.center.x * 2, h: this.center.y * 2 });
    gr.beginFill(0xffffff);
    gr.drawRect(...this.paramsForRect('birdBackBox'));
    gr.endFill();

    const texture = this.renderer.generateTexture(gr);
    this.texture = texture;

    // add an atlas entry for the full sprite sheet
    this.atlas.frames.fullBirdSpriteSheet = spriteFrame({ x: 0, y: 0, w: this.texture.width, h: this.texture.height });

    this.spriteSheet = new PIXI.Spritesheet(this.texture, this.atlas);
    this.spriteSheet.parse(() => true); // this loads the spritesheet into the TextureCache
  }

  paramsForEllipse(key) {
    const val = this.atlas.frames[key].frame;
    const xRad = val.w / 2;
    const yRad = val.h / 2;
    return [val.x + xRad, val.y + yRad, xRad, yRad];
  }

  paramsForRect(key) {
    const val = this.atlas.frames[key].frame;
    return [val.x, val.y, val.w, val.h];
  }

  frameRect(key) {
    const val = this.atlas.frames[key].frame;
    return new PIXI.Rectangle(val.x, val.y, val.w, val.h);
  }

  getSprite(key) {
    return new PIXI.Sprite(PIXI.utils.TextureCache[key]);
  }

  drawBird() {
    // const scale = this.scale;
    // const backBox = this.getSprite('birdBackBox');
    // this.container.addChild(backBox);

    this.drawBody();
    this.drawShoulders();
    this.drawWing();
    this.drawWing(-1);
  }

  drawBody() {
    const body = this.getSprite('birdBody');
    body.x = this.center.x - body.width / 2;
    body.y = this.center.y - body.height / 2;
    const tail = this.getSprite('birdTail');
    tail.x = this.center.x - tail.width / 2;
    tail.y = this.center.y - body.height * 0.1;
    this.container.addChild(tail);
    this.container.addChild(body);
  }

  drawShoulders() {
    const scale = this.scale;
    const lShoulder = this.getSprite('birdShoulder');
    lShoulder.anchor.x = 0.5;
    lShoulder.anchor.y = 0.5;
    lShoulder.x = this.center.x - lShoulder.width / 2;
    lShoulder.y = this.center.y - 0.2 * scale;
    const rShoulder = this.getSprite('birdShoulder');
    rShoulder.anchor.x = 0.5;
    rShoulder.anchor.y = 0.5;
    rShoulder.x = this.center.x + rShoulder.width / 2;
    rShoulder.y = this.center.y - 0.2 * scale;
    this.container.addChild(lShoulder);
    this.container.addChild(rShoulder);
  }

  drawWing(side = 1) {
    const sideName = side === 1 ? 'Left' : 'Right';
    const wing = this.getSprite('birdWing');
    this[`wing${sideName}`] = wing;
    wing.anchor.x = 0.5;
    wing.anchor.y = 0.5;
    wing.x = this.center.x - side * (wing.width / 2 + this.scale / 6);
    wing.y = this.center.y;
    wing.rotation = side * Math.PI * 0.04;

    this[`feathers${sideName}`] = [
      { x: 0.25, y: 0.30, r: side * Math.PI * 0.04 },
      { x: 0.15, y: 0.10, r: 0 },
      { x: 0.0, y: -0.10, r: -side * Math.PI * 0.04 },
    ];

    forEach(this[`feathers${sideName}`], (f) => {
      f.sprite = this.getSprite('birdFeather');
      f.sprite.anchor.x = 0.5;
      f.sprite.anchor.y = 0.5;
      f.sprite.x = this.center.x - side * (wing.width + this.scale * f.x);
      f.sprite.y = this.center.y - this.scale * f.y;
      f.sprite.rotation = f.r;
      this.container.addChild(f.sprite);
    });

    this.container.addChild(wing);
  }

  animate(tick) {
    // move
    this.container.x += this.vx;
    this.container.y += this.vy;
    // do other stuff
    this.handleEndOfWorld();
    this.bank(tick);
    this.soar(tick);
    this.flutter(tick);
  }

  handleEndOfWorld() {
    const buf = 2;
    const margin = this.container.width;
    const viewWidth = this.renderer.view.width;
    const viewHeight = this.renderer.view.height;

    if (this.container.x > viewWidth + margin + buf) {
      this.container.x = -margin;
    } else if (this.container.x < -margin - buf) {
      this.container.x = viewWidth + margin;
    }
    if (this.container.y > viewHeight + margin + buf) {
      this.container.y = -margin;
    } else if (this.container.y < -margin - buf) {
      this.container.y = viewHeight + margin;
    }
  }

  bank(tick) {
    if (this.bearing >= 2 * Math.PI) {
      this.bearing -= 2 * Math.PI;
    }
    const bankChance = 0.01;
    if (this.bankUntil) {
      if (tick > this.bankUntil) {
        delete this.bankUntil;
      } else {
        this.bearing += this.bankRate * (this.speed / this.maxSpeed);
        this.setRotationAndVector();
      }
    } else if (Math.random() < bankChance) {
      this.bankUntil = tick + Math.random() * 300 + 60;
      this.bankRate = this.randomSign((Math.random() + 1) * Math.PI / 1024);
    }
  }

  soar(tick) {
    const soaringChance = 0.005;
    if (this.soaringUntil) {
      if (this.soaringUntil > tick) {
        if (this.altitude >= this.maxAltitude && this.soaringRate > 0) {
          this.unSoar();
        } else if (this.altitude <= this.minAltitude && this.soaringRate < 0) {
          this.unSoar();
        } else {
          this.altitude += this.soaringRate;
          this.speed -= this.soaringRate * this.speedForAltitude;
          this.setRotationAndVector();
          this.setScaleFromAltitude();
        }
      } else {
        this.unSoar();
      }
    } else if (Math.random() < soaringChance) {
      // start soaring
      const duration = Math.trunc(Math.random() * 5 * 60) + 30;
      this.soaringRate = (Math.random() - 0.5) * 0.005;
      if (this.soaringRate < 0) {
        this.soaringUntil = tick + Math.trunc(duration / 2.5);
        this.soaringRate *= 2.5; // dive faster than rise
      } else {
        this.soaringUntil = tick + duration;
      }
    }
  }

  unSoar() {
    delete this.soaringUntil;
    delete this.soaringRate;
  }

  flutter(tick) {
    forEach(this.feathersLeft, (f) => this.flutterFeather(f, tick));
    forEach(this.feathersRight, (f) => this.flutterFeather(f, tick));
  }

  flutterFeather(feather, tick) {
    const flutterChance = 0.05;
    if (feather.endFlutterTick && tick > feather.endFlutterTick) {
      feather.sprite.rotation = feather.r;
      delete feather.endFlutterTick;
    } else if (Math.random() < flutterChance) {
      feather.endFlutterTick = tick + Math.trunc(Math.random() * 6) + 6;
      const offset = this.randomSign(Math.random() * Math.PI * 0.02 + 0.01);
      feather.sprite.rotation = feather.r + offset;
    }
//    if (tick % 120 === 0) {
//      feather.sprite.rotation = feather.r;
//    }
  }

  randomSign(val = 1) {
    return Math.random() < 0.5 ? -val : val;
  }
}
