import { useEffect, useRef } from "react";

import { resizeCanvas } from "../../../utils";

const MOVEMENT_SPEED = 5;

export default function CharacterCanvas(props: {
  onStartConvo: () => void;
  isOverlayVisible: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let { width, height } = canvas.parentElement!.getBoundingClientRect();

    canvas.width = width;
    canvas.height = height;

    // brian
    const brianImages = {
      w: new Image(),
      a: new Image(),
      s: new Image(),
      d: new Image(),
    };
    brianImages.w.src = "/specialOccasions/2025/brianbday/brian_w_idle.png";
    brianImages.a.src = "/specialOccasions/2025/brianbday/brian_a_idle.png";
    brianImages.s.src = "/specialOccasions/2025/brianbday/brian_s_idle.png";
    brianImages.d.src = "/specialOccasions/2025/brianbday/brian_d_idle.png";

    const brian = {
      x: 200,
      y: 200,
      width: 46,
      height: 100,
      img: brianImages.d,
    };

    // emily
    const emily = {
      x: width * 0.8,
      y: height * 0.6,
      width: 54,
      height: 100,
      img: new Image(),
    };
    emily.img.src = "/specialOccasions/2025/brianbday/emily_s_idle.png";

    // chat bubble
    const chatBubble = {
      x: emily.x + emily.width,
      y: emily.y - 20,
      width: 50,
      height: 50,
      img: new Image(),
    };
    chatBubble.img.src = "/specialOccasions/2025/brianbday/chat.png";

    const handleResize = () => {
      const { scaleX, scaleY } = resizeCanvas(canvas);

      brian.x *= scaleX;
      brian.y *= scaleY;
      emily.x *= scaleX;
      emily.y *= scaleY;
    };

    const heldKeys = new Set<string>();

    const checkProximity = () => {
      const buffer = 20;
      const areCharactersOverlapping =
        brian.x + brian.width > emily.x - buffer &&
        brian.x < emily.x + emily.width + buffer &&
        brian.y + brian.height > emily.y - buffer &&
        brian.y < emily.y + emily.height + buffer;
      return areCharactersOverlapping;
    };

    const draw = (areCharactersOverlapping: boolean) => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(emily.img, emily.x, emily.y, emily.width, emily.height);
      ctx.drawImage(brian.img, brian.x, brian.y, brian.width, brian.height);
      // If hovering, draw text bubble to the right of emily
      if (areCharactersOverlapping) {
        ctx.drawImage(
          chatBubble.img,
          chatBubble.x,
          chatBubble.y,
          chatBubble.width,
          chatBubble.height
        );
      }
    };

    const update = () => {
      if (props.isOverlayVisible) return; // Prevent movement if overlay is visible

      let dx = 0;
      let dy = 0;

      heldKeys.forEach((key) => {
        if (key === "w") {
          dy -= MOVEMENT_SPEED;
          brian.img = brianImages.w;
        }
        if (key === "a") {
          dx -= MOVEMENT_SPEED;
          brian.img = brianImages.a;
        }
        if (key === "s") {
          dy += MOVEMENT_SPEED;
          brian.img = brianImages.s;
        }
        if (key === "d") {
          dx += MOVEMENT_SPEED;
          brian.img = brianImages.d;
        }
      });

      // Normalize diagonal movemeant
      if (dx !== 0 && dy !== 0) {
        dx *= Math.SQRT1_2;
        dy *= Math.SQRT1_2;
      }

      brian.x = Math.max(0, Math.min(canvas.width - brian.width, brian.x + dx));
      brian.y = Math.max(
        0,
        Math.min(canvas.height - brian.height, brian.y + dy)
      );

      const areCharactersOverlapping = checkProximity();
      draw(areCharactersOverlapping);
    };

    const loop = () => {
      update();
      requestAnimationFrame(loop);
    };

    const handleKeyDown = (e: KeyboardEvent) =>
      heldKeys.add(e.key.toLowerCase());
    const handleKeyUp = (e: KeyboardEvent) =>
      heldKeys.delete(e.key.toLowerCase());

    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault();
      if (!checkProximity()) return;

      const { offsetX, offsetY } = e;
      if (
        offsetX >= chatBubble.x &&
        offsetX <= chatBubble.x + chatBubble.width &&
        offsetY >= chatBubble.y &&
        offsetY <= chatBubble.y + chatBubble.height
      ) {
        props.onStartConvo(); // Trigger the callback
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("contextmenu", handleRightClick);
    requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("contextmenu", handleRightClick);
    };
  }, [props.isOverlayVisible]); // Add dependency for overlay visibility

  return (
    <canvas
      ref={canvasRef}
      id="characterCanvas"
      style={{
        width: "100% !important",
        height: "100% !important",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );
}
