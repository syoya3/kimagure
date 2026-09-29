import { Camera, MathUtils, Vector3 } from "three";

const centre = new Vector3(), screen = new Vector3(), safe = new Vector3();
// Keep the runner inside the central 64% of the viewport even after a large
// manual pan, on portrait screens, or while the camera eases out of dialogue.
export function keepPlayerInFrame(camera: Camera, lookAt: Vector3, player: Vector3) {
  camera.updateMatrixWorld(true);
  centre.copy(player).y += 1.2;
  screen.copy(centre).project(camera);
  safe.set(MathUtils.clamp(screen.x, -.64, .64), MathUtils.clamp(screen.y, -.58, .58), screen.z).unproject(camera);
  safe.sub(centre).negate();
  camera.position.add(safe);
  lookAt.add(safe);
  camera.lookAt(lookAt);
  camera.updateMatrixWorld(true);
}
