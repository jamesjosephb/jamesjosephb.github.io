/**
 * Copy for /work/trailhead/ that is easier to edit as data than as MDX: screenshot captions, feature groups and the
 * technologies table. Source: professional-portfolio/handoff/trailhead/brief.md (checked against the game's repo).
 */

type Caption = { alt: string; caption: string };

export const gallery: Record<string, Caption> = {
  truck: {
    alt: 'The truck parked at the trailhead in late-afternoon light',
    caption: 'The truck at the trailhead. Body, glass, suspension, wheels and lights are all generated in code.',
  },
  silverhorn: {
    alt: 'Silverhorn Lake: a glacial valley between granite walls at sunrise',
    caption: 'Silverhorn Lake: a glacial valley with granite walls, river mist and the glacier between the horns.',
  },
  arch: {
    alt: 'Lantern Arch at sunset above a red-rock canyon',
    caption: 'Lantern Arch at sunset: slickrock, the canyon rim and the arch at the end of the trail.',
  },
  storm: {
    alt: 'The truck at night in a thunderstorm with its headlights and roof light bar on',
    caption: 'A thunderstorm at 22:30, with the headlights and roof light bar on.',
  },
  ridge: {
    alt: 'Explore mode: the truck descending a rocky ridge trail with the GPS unit on screen',
    caption:
      'Explore mode: descending a rocky ridge trail in low range, with the GPS unit showing the next turn and the distance to go. The autopilot is driving.',
  },
  overlook: {
    alt: 'Explore mode: the truck on a high point looking out over lakes and mountains',
    caption:
      'Explore mode: the start of a GPS route on a high point, looking out over lakes and the open world. The autopilot is driving.',
  },
  menu: {
    alt: 'The Explore page of the main menu with a map of the whole open world',
    caption:
      'The Explore page of the main menu, with a map of the whole 6 × 6 km world: 71 km of trails, 11 camps, and the three timed maps inside it.',
  },
  lightning: {
    alt: 'A lightning strike on a canyon tower in a rainstorm',
    caption:
      'A lightning strike on the canyon tower below Lantern Arch, the flash lighting the whole canyon. The strike is triggered by a test option.',
  },
  // The one image in the gallery that is not a screenshot: a phone photo of the screen, and its caption says so.
  night: {
    alt: 'The game’s white off-road truck with its lights on, on a mountain trail under the Milky Way',
    caption: 'The truck under the night sky. This one is a phone photo of my screen, not a screenshot.',
  },
};

/** "The real truck": photos of James's own truck (cropped, with the plate and stickers blurred). */
export const realTruck: Record<string, Caption> = {
  rock: {
    alt: 'A white 4Runner with its front wheel up on a granite ledge at sunset.',
    caption: 'Front wheel up on a rock ledge.',
  },
  log: {
    alt: 'Close view of a white 4Runner’s front wheel beside a fallen log in a pine forest.',
    caption: 'Easing over a fallen log on a forest trail.',
  },
  view: {
    alt: 'A white 4Runner with a roof box parked on a grassy ridge above a wide valley, with snow-capped mountains in the distance.',
    caption: 'The view from the top.',
  },
};

type Group = { title: string; items: { b: string; t: string }[] };

export const features: Group[] = [
  {
    title: 'World and terrain',
    items: [
      { b: 'Deterministic generated levels.', t: 'Each level script shapes a heightfield and writes surface, trail, moisture and forest data for it.' },
      { b: 'Roads built the way mountain roads are:', t: 'grade-limited, crowned or cambered, with cut and fill banks, widened hairpins, water bars and rock steps.' },
      { b: 'Terrain in chunks with four levels of detail,', t: 'displaced in a shader so the finest level is exactly the collision surface.' },
      { b: 'Nine surface types', t: 'from rock to snow, where one id drives the look, the grip and the sound.' },
    ],
  },
  {
    title: 'Explore mode (in progress)',
    items: [
      { b: 'A 6 × 6 km world streamed from 1 km tiles', t: 'on worker threads, with collision built only around the truck.' },
      { b: 'Biomes as data:', t: 'desert, montane, alpine and glacial, blended per pixel, with fog and colour following the biome.' },
      { b: 'A generated trail network', t: 'with an automated report that checks grades, run-ups and ford depths.' },
      { b: 'GPS routing', t: 'over the trail graph, with Fastest, Easiest and Scenic profiles and a dash unit on the HUD.' },
    ],
  },
  {
    title: 'Vehicle physics',
    items: [
      { b: 'A custom vehicle model', t: 'on one rigid body: per-wheel suspension, a brush tire model and loose ground that digs in.' },
      { b: 'A simulated drivetrain', t: 'with high and low range, and rear and front lockers on one key.' },
      { b: 'A readable rollover margin', t: 'on the HUD, and slopes too loose to crawl that need speed on the way in.' },
      { b: 'Deep water', t: 'that can flood the engine, with a bow wave that grows with speed (newest work).' },
      { b: 'Rewind:', t: 'hold a button to take the truck back through the last 15 seconds.' },
    ],
  },
  {
    title: 'The truck and its effects',
    items: [
      { b: 'Built in code:', t: 'body, glass, lamps, chassis, suspension and wheels are generated meshes.' },
      { b: 'A lighting rig', t: 'of low beams with a projector cut-off, a roof bar, ditch lights and rock lights.' },
      { b: 'Terrain feedback:', t: 'wheels sink, ruts form in mud, sand and snow, and loose rocks roll.' },
      { b: 'Cosmetic damage', t: 'with armour: dents, scratches, cracked lamps, undone by rewind.' },
    ],
  },
  {
    title: 'Sky, weather and light',
    items: [
      { b: 'A sky shader', t: 'with ray-marched clouds whose shadows on the ground match the clouds you see.' },
      { b: 'A day and night cycle', t: 'with real sun and moon paths, moon phases, stars and the Milky Way.' },
      { b: 'Weather that builds and clears:', t: 'rain, hail, lightning, thunder delayed by distance, and wet grip.' },
      { b: 'Wetness everywhere:', t: 'terrain, rock, foliage and paint darken and gloss, and puddles fill.' },
    ],
  },
  {
    title: 'Audio',
    items: [
      { b: 'A real-time engine synthesiser', t: 'running on a worker thread, with no samples.' },
      { b: 'Every other sound synthesised', t: 'at load, from tires and impacts to birds, wind and thunder, then cached.' },
      { b: 'Sparse generative music,', t: 'silent while driving except near the summit.' },
    ],
  },
  {
    title: 'Camera',
    items: [
      { b: 'A chase camera', t: 'that adapts to speed and slope, plus scout, hood and orbit views.' },
      { b: 'A rear-view mirror', t: 'rendered through a second viewport.' },
      { b: 'A summit reveal', t: 'that searches for a postcard framing with a clear view of the truck and the scenery.' },
      { b: 'Photo mode', t: 'with field of view, exposure, depth of field and time of day.' },
    ],
  },
  {
    title: 'Game flow and UI',
    items: [
      { b: 'A driving HUD:', t: 'inclinometers, wheel contact, a compass strip, gear, range and locker state, medal pace.' },
      { b: 'A topographic trail map', t: 'rendered on the GPU from the terrain data.' },
      { b: 'Checkpoints, splits and medals,', t: 'per-level challenges, and pace notes before hazards.' },
      { b: 'Menus over a live level,', t: 'with a conditions picker and settings that apply as you change them.' },
    ],
  },
  {
    title: 'Tooling and tests',
    items: [
      { b: 'An autopilot', t: 'that drives any route, including GPS routes, and reports JSON.' },
      { b: 'A regression harness', t: 'with a quick gate per feature and a full gate per milestone: smoke runs, drives, world-hash checks, image diffs.' },
      { b: 'A vehicle test bench', t: 'with scripted experiments and a keyboard bot.' },
      { b: 'Screenshot and UI-tour automation,', t: 'GPU benchmarks and audio analysis.' },
    ],
  },
];

export const technologies = [
  { k: 'Engine', v: 'Godot 4.7, Forward+ renderer on Vulkan' },
  { k: 'Language', v: 'GDScript only, statically typed throughout. No C#, native extensions or plugins.' },
  { k: 'Shaders', v: 'Godot Shading Language: terrain, rock, foliage, water, sky, weather, vehicle, particles, post-processing and UI' },
  { k: 'Physics', v: 'Jolt Physics at 120 Hz with a custom suspension, tire and drivetrain model; Godot’s built-in vehicle is not used' },
  { k: 'Assets', v: 'None imported. Meshes are built in code, textures are generated images, sounds are synthesised.' },
  { k: 'Rendering', v: 'Multimesh instancing, hand-built terrain levels of detail, tile streaming, soft shadows, colour grading' },
  { k: 'Concurrency', v: 'Worker threads for world generation, tile streaming, and texture and sound baking' },
  { k: 'Tooling', v: 'PowerShell runners, Git with one worktree per module and one branch per milestone' },
  { k: 'AI coding agent', v: 'Claude Code, working to a gated roadmap' },
  { k: 'Platform', v: 'Windows desktop; keyboard and mouse, or a gamepad' },
];
