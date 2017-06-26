import * as PIXI from 'pixi.js';
import { forEach } from 'lodash';

import gridContainer from './gridContainer';
import player from './player';
import Cloud from './cloud';
import Bird from './bird';

// FIXME: no globals
const gridSize = 10;
let stage;
let yourGuy;
const birds = [];
let birdsContainer;
const gameWorldSizeInCells = [100, 100];
const gameWorldSize = gameWorldSizeInCells.map((cells) => gridSize * cells);
const clouds = [];
let tick = 0;

const redraw = (time, renderer) => {
  tick += 1;
  requestAnimationFrame((t) => redraw(t, renderer));

  forEach(clouds, (cloud) => cloud.drift());
  forEach(birds, (bird) => bird.animate(tick));
  birdsContainer.children.sort((a, b) => a.birdRef.altitude - b.birdRef.altitude);

  renderer.render(stage);
};

const setup = () => {
  const renderer = PIXI.autoDetectRenderer(gameWorldSize[0], gameWorldSize[1], {
    antialias: false,
    transparent: false,
    resolution: 1,
  });

  renderer.view.className = 'stage';
  document.getElementById('renderer').appendChild(renderer.view);
  renderer.backgroundColor = 0xeeeeee;

  stage = new PIXI.Container();

  stage.addChild(gridContainer(renderer, gridSize));

  yourGuy = player(renderer, gridSize);
  yourGuy.x = 50 * gridSize;
  yourGuy.y = 49 * gridSize;
  stage.addChild(yourGuy);

  // birdsContainer = new PIXI.particles.ParticleContainer(1024, { rotation: true, scale: true });
  birdsContainer = new PIXI.Container();
  const numBirds = Math.trunc(Math.random() * 3) + 1;
  for (let i = 0; i < numBirds; i += 1) {
    const bird = new Bird(renderer, gridSize);
    birds.push(bird);
    bird.container.x = gameWorldSize[0] * Math.random();
    bird.container.y = gameWorldSize[1] * Math.random();
    birdsContainer.addChild(bird.container);
  }
  stage.addChild(birdsContainer);

  const numClouds = Math.trunc(Math.random() * 9) + 5;
  for (let i = 0; i < numClouds; i += 1) {
    const newCloud = new Cloud(renderer, gridSize);
    clouds.push(newCloud);
    newCloud.x = Math.trunc(Math.random() * gameWorldSize[0] - newCloud.width);
    newCloud.y = Math.trunc(Math.random() * gameWorldSize[1] - newCloud.height);
    stage.addChild(newCloud.container);
  }

  // initial render
  redraw(-1, renderer);
};

window.addEventListener('load', () => {
  // External asset file loading would work like this:
  // const resources = [];
  // PIXI.loader
  //  .add(resources)
  //  .load(setup);
  //  .on("progress", loader => console.log(`${loader.progress}% completed`))

  setup();
});
