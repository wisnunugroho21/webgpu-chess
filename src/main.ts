import { Engine, LightType, RenderFlags, Quat, createCube, createPlane } from 'nugie-renderer';

const engine = await Engine.create(document.getElementById('canvas') as HTMLCanvasElement);
const { renderer, world } = engine;

// assets: create meshes and materials once, up front
const cubeMesh = renderer.meshes.create('cube', createCube());
const planeMesh = renderer.meshes.create('plane', createPlane());
const floorMat = renderer.materials.createPBR({ baseColor: [0.35, 0.4, 0.45, 1], roughness: 0.9, metallic: 0 });
const playerMat = renderer.materials.createPBR({ baseColor: [0.9, 0.35, 0.2, 1], roughness: 0.4, metallic: 0 });

// entities
engine.spawnObject({ mesh: planeMesh, material: floorMat, scale: [40, 1, 40],
  flags: RenderFlags.Static | RenderFlags.ReceiveShadow });   // bounds default to the mesh's own
const player = engine.spawnObject({ mesh: cubeMesh, material: playerMat, position: [0, 0.5, 0] });
engine.spawnLight({ type: LightType.Directional, rotation: [-0.5, 0.2, 0.1, 0.84], intensity: 3, castShadow: true });

renderer.setEnvironment(renderer.ibl.fromSky(), 0.8);   // image-based lighting + skybox
await renderer.warmup();                                // compile pipelines now, not mid-game

// camera: the engine creates one (engine.camera is its entity index); tilt it down once
const tilt = Quat.fromAxisAngle(Quat.create(), 1, 0, 0, -0.5);
world.transforms.setRotation(engine.camera, tilt[0], tilt[1], tilt[2], tilt[3]);

// input is yours
const keys = new Set<string>();
window.addEventListener('keydown', (e) => keys.add(e.code));
window.addEventListener('keyup', (e) => keys.delete(e.code));
const pos = { x: 0, z: 0 };

engine.start((_time, dt) => {            // runs first every frame; the engine then updates systems and draws
  if (keys.has('KeyW')) pos.z -= 6 * dt;
  if (keys.has('KeyS')) pos.z += 6 * dt;
  if (keys.has('KeyA')) pos.x -= 6 * dt;
  if (keys.has('KeyD')) pos.x += 6 * dt;
  world.transforms.setPosition(player, pos.x, 0.5, pos.z);
  world.transforms.setPosition(engine.camera, pos.x, 7, pos.z + 11);   // simple follow camera
});
