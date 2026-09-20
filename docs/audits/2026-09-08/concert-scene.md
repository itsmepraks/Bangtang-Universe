# Concert entrance: stadium rendering

The landing scene now uses Three.js/WebGL, loaded only when the concert entrance mounts. It contains a raised stage and thrust, three animated LED screens, speaker arrays and lighting trusses, stepped audience tiers, instanced crowd silhouettes, shader-animated light sticks, close foreground ARMY Bombs, soft light cones, and drifting haze. Stage performers are distant illustrative silhouettes, not captured BTS performances.

Visual references: [BANGTANTV's official Permission to Dance Live Play spot](https://www.youtube.com/watch?v=Tr-jVgphiHA) and [audience seating views](https://aviewfrommyseat.com/venue/SoFi%2BStadium/537/). These informed venue scale, screen placement, crowd contrast, and lighting; no concert video was downloaded or republished in the scene.

The existing audio flow remains opt-in. Streamed previews now have a subtle, locally generated stereo reverb tail; the dry signal continues to drive beat detection. The YouTube chant remains on its original audio path.

Motion stops while hidden or paused. Reduced-motion mode renders a still WebGL scene. Pixel density is capped, bloom is disabled on narrow screens and sustained slow frames, and GPU resources are disposed on exit. The earlier perspective renderer remains as a fallback for unavailable/lost WebGL contexts. The additional renderer bundle is approximately 147 KB gzip and is not loaded by archive-only navigation.

Validation: production build, lint, and 19 tests. New tests cover pause/resume without rebuilding GPU resources, reduced motion, spotlight updates, context-loss fallback, initialization failure, and bounded stereo reverb. Browser checks cover wide and mobile layouts, WebGL initialization without console errors, audio start/skip/mute, spotlight selection, and entry into the archive. Audio playback reached the Mikrokosmos preview; acoustic quality still benefits from listening on the user's own speakers/headphones.

## Front-stage follow-up

The seven performers now stand in a shallow arc on the front platform. Their pools and follow-spots use shared stage coordinates. The central LED wall displays Bangtan Universe and the lineup by default, then the featured member’s name on selection; the side walls retain the BTS symbol. Name textures upload only when selection changes, including while paused. The lightweight fallback also displays the name and brings its performers forward.


## Performance art and atmosphere follow-up

Replaced the brick figures with generated TinyTAN-inspired performance artwork in coordinated black stagewear. The seven illustrated characters are textured, segmented surfaces within the 3D arena (2.5D artwork, not fully rigged 3D character models). Their movement uses the existing paused/reduced-motion-aware scene clock; bass increases movement and lighting intensity.

References inspected: [BANGTANTV Run BTS, Yet To Come in Busan](https://www.youtube.com/watch?v=Cb70gcTVvYI), [TinyTAN Magic Door poster](https://f.ptcdn.info/459/070/000/qeqnjlfqqXQMxEJJ5lC-o.jpg). Reference observations: grounded performance stances, black layered stagewear and silver accents, differentiated faces and hair, blue/white lighting contrast and haze. The artwork is a stylized interpretation, not a reproduction of one concert's exact costumes or choreography.

The local sprite atlas is decoded and keyed once, reused by all seven performers, both side-screen portraits, and the canvas fallback. It loads only with the landing scene. Side screens alternate portrait crops; individual name projections remain limited to the chant intro. Updated the main wall with the BTS emblem, animated LED graphics, added floor lights and a single GPU confetti draw, softened balcony rails, and added stage-edge light chases. Mobile framing now includes the side screens without moving the camera away from the members.

Validation: production build and ESLint passed; 22 tests passed, including matte removal and sprite ordering. Browser checks confirmed 60 fps in the sampled mobile scene, seven visible characters, both side screens within the mobile frame, no console errors, and a frozen scene clock while paused. Music playback returned the rear screen to its group state after the intro.

## Restrained performance and audio rhythm

Supersedes the earlier jump experiment: removed all root bouncing, squash/stretch, whole-body sway, and expanding contact shadows. Feet and stage positions stay fixed. The illustrated mesh now has per-pose shoulder, elbow, wrist, and fingertip landmarks, with weighted joint rotations limited to under four degrees. Microphone arms move less than two degrees; free hands use slow, staggered phrase gestures. Mouth motion uses a restrained audio-envelope response, and stays closed for the lowered-microphone pose. These remain 2.5D illustrated performers, not full 3D skeletal models or phoneme-synchronized singing.

Streamed-song bass onsets now carry a persistent event number and timestamp into the renderer. An adaptive interval estimate uses recent detected onsets; light pulses decay from the actual event time so lower rendering frame rates do not miss one-frame audio events. The same rhythm drives moving fixtures, the LED backdrop, stage-edge bulbs, floor pools, and crowd light intensity. Unanalysable audio and silence hold a steady wash instead of running an unrelated metronome. The chant retains its existing scheduled cues. Broad chorus flashes are softer. Ambient confetti and audience movement remain independent of musical timing.

Validation: production build and ESLint passed; 27 tests passed, including restrained joint limits, smooth motion, muted vocal response, persistent beat events, interval estimation, silence, and existing pause/reduced-motion lifecycle coverage.

Browser playback verified detected beat pulses during Mikrokosmos, the group projection after the intro, and approximately 60 fps in sampled desktop and 390px mobile views. Pausing held both the performer pose and lighting phase fixed; resuming continued them. Desktop viewport and initial muted state were restored after verification.

## Visible gestures and steady lighting correction

Removed the chorus/chant full-screen overlays and all direct beat-to-brightness modulation on the crowd, screens, performers, floor pools, and foreground light sticks. Detected beat position is eased over 650ms to guide fixture sweeps and LED motion; fixture brightness stays nearly constant. This supersedes the beat-pulse lighting above.

The earlier arm rotations were too small at the camera scale and the side-screen portraits only moved their mouths. Free-arm rotations now reach roughly 8–13 degrees, with slower microphone adjustments and a small head nod. Stage and screen share the same pose rig and clock; no body jumping or scaling. A shared-rig regression test covers screen member changes, moving poses, and paused poses. These are still deformed illustrated surfaces, not independent 3D limbs.

Validation: browser frames show different hand positions on the stage and the side screens, playback with steady illumination, and 60 fps in the sampled desktop view. Build and lint pass; 28 tests pass.

## In-app black-frame correction

Reproduced a blank WebGL canvas in the in-app browser while the HTML heading and controls stayed visible, with no JavaScript errors. Enabled drawing-buffer preservation so the last completed concert frame survives between renders and while paused. In subsequent in-app captures the scene remained visible, including paused and streamed-song playback checks.

Buffer resizing now ignores duplicate dimensions and transient zero-size containers, updates canvas dimensions and DPR once, and sizes the composer in physical pixels without duplicate allocations. All frames use the same composer/output path, even with bloom disabled. Sustained slow frames can trigger a single reduction in bloom and rendering resolution at any point in the session, including after a long smooth intro; resizing and the replacement draw happen in the same render call. This avoids repeated quality toggles and retains the existing pause/reduced-motion lifecycle.

Validation: build, lint, and 31 tests pass. New tests cover duplicate/zero-size notifications, display-density changes, matching effect buffers, and a late-session slowdown that reduces quality once. In-app captures confirmed retained frames with music and while paused; sampled FPS varied with browser load, so this is not a claim of locked 60 fps. Left the final concert preview open with sound muted.
