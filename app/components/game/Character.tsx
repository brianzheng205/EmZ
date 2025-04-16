"use client";

import Image from "next/image";

import { useEffect, useState, Dispatch, SetStateAction } from "react";

import * as R from "ramda";

import brian_w_idle from "/public/specialOccasions/2025/brianbday/brian_w_idle.png";
import brian_d_idle from "/public/specialOccasions/2025/brianbday/brian_d_idle.png";
import brian_s_idle from "/public/specialOccasions/2025/brianbday/brian_s_idle.png";
import brian_a_idle from "/public/specialOccasions/2025/brianbday/brian_a_idle.png";

function isMovementKey(key: string) {
  return ["w", "a", "s", "d"].includes(key);
}

export default function Character(props: {
  height: number;
  width: number;
  movementSpeed: number;
  setIsHovering: Dispatch<SetStateAction<boolean>>;
}) {
  const [heldKeys, setHeldKeys] = useState<string[]>([]);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [brianSrc, setBrianSrc] = useState(brian_s_idle);

  const getDeltas = (heldKeys: string[]) => {
    let deltaX = 0;
    let deltaY = 0;

    R.forEach((key: string) => {
      if (key === "w") deltaY -= props.movementSpeed;
      else if (key === "a") deltaX -= props.movementSpeed;
      else if (key === "s") deltaY += props.movementSpeed;
      else if (key === "d") deltaX += props.movementSpeed;
    }, heldKeys);

    if (deltaX !== 0 && deltaY !== 0) {
      deltaX *= Math.SQRT1_2;
      deltaY *= Math.SQRT1_2;
    }

    return { deltaX, deltaY };
  };

  const checkProximity = () => {
    const emilyRect = document.querySelector(".emily")?.getBoundingClientRect();
    const brianRect = document.querySelector(".brian")?.getBoundingClientRect();
    return (
      R.isNotNil(emilyRect) &&
      R.isNotNil(brianRect) &&
      brianRect.top > emilyRect.top - props.height &&
      brianRect.top + props.height < emilyRect.bottom + 50 &&
      brianRect.left + props.width > emilyRect.left - 10 &&
      brianRect.left < emilyRect.right + 10
    );
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isMovementKey(event.key)) return;

      setHeldKeys((prev) =>
        prev.includes(event.key) ? prev : [...prev, event.key]
      );
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!isMovementKey(event.key)) return;

      setHeldKeys((prev) => prev.filter((key) => key !== event.key));
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Handle character movement and animation
  useEffect(() => {
    let animationFrameId: number;

    const handleMovement = () => {
      const { deltaX, deltaY } = getDeltas(heldKeys);

      setPosition((prev) => ({
        top: R.clamp(
          0,
          window.innerHeight - props.height - 70,
          prev.top + deltaY
        ),
        left: R.clamp(0, window.innerWidth - props.width, prev.left + deltaX),
      }));
      props.setIsHovering(checkProximity());
      animationFrameId = requestAnimationFrame(handleMovement);
    };

    const handleBrianSrc = () => {
      if (heldKeys.length === 0) return;

      const { deltaX, deltaY } = getDeltas(heldKeys);

      if (deltaX > 0) setBrianSrc(brian_d_idle);
      else if (deltaX < 0) setBrianSrc(brian_a_idle);
      else if (deltaY < 0) setBrianSrc(brian_w_idle);
      else if (deltaY > 0) setBrianSrc(brian_s_idle);
    };

    handleMovement();
    handleBrianSrc();

    return () => cancelAnimationFrame(animationFrameId);
  }, [heldKeys]);

  return (
    <Image
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 0,
      }}
      className="brian"
      src={brianSrc}
      alt="Brian"
      height={props.height}
    />
  );
}
