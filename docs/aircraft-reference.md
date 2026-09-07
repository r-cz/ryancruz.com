# Aircraft source and web adaptation

The scene uses [Southwest Airlines Boeing 737](https://skfb.ly/6SnOs) by **Daniel Skomorovsky**, licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). Ryan supplied the model as `737.fbx` and provided its attribution. Credit, source and license links appear in the portfolio footer and `public/models/ATTRIBUTION.txt`.

The 6.4 MB FBX contains 422 meshes and 163,312 triangles. Its Southwest livery is colored geometry. The web adaptation removes 319 enclosed cabin meshes (77,316 triangles) and two source scene objects, retaining the exterior. The remaining meshes are normalized to an 11-unit length, nose toward -X, wheels at Y=0. Materials are converted to PBR. Three external engine fan bitmap references (`hub.png`, `hub2.png`, `blade.png`) were not included with the supplied file; those small surfaces use dark metal instead.

The final `public/models/southwest-737.glb` is about 320 KB with 67,175 triangles, compressed with meshoptimizer. Floating-point quantization preserves the model's small details and nested transforms. The runtime uses Three.js's GLTFLoader and bundled Meshopt decoder, with no remote model or texture requests. The model loads independently of the terminal, and load failure leaves the portfolio usable.

To regenerate with the supplied source file:

```sh
bun scripts/convert-aircraft.ts /path/to/737.fbx /tmp/737-exterior.glb
bunx gltfpack -i /tmp/737-exterior.glb -o public/models/southwest-737.glb -cc -vpf
```

The original FBX is not required for normal builds. The conversion script is tailored to this model; `__DEFAULT` meshes in this source are its enclosed cabin fittings. Changes to the source model should be inspected before using that removal rule.
