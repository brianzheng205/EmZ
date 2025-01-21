"use client";

import { motion } from "framer-motion";

import { useState } from "react";

import VideoPage from "../../../components/VideoPage";
import ShadowedText from "../../../components/ShadowedText";

export default function EmBirthday() {
  const [clickCount, setClickCount] = useState(0);
  const [shake, setShake] = useState(false);

  const handleEggClick = () => {
    setClickCount((prev) => prev + 1);
    setShake(true);
    setTimeout(() => setShake(false), 500); // Reset shake after animation
  };

  return (
    <VideoPage videoSrc="/videos/DigimonOpening.mp4" title="21st Birthday">
      <div className="flex flex-col gap-8 mb-28">
        <ShadowedText>Dear bao bei,</ShadowedText>
        <ShadowedText>
          🎂 Happy 21st Birthday 🎂!!! It's time to get wasted 🍻!!! I just
          realized it's ur 21st birthday and it's also the 21st 🤯. Hopefully
          Wagyu House will be open and an Uber will take us there so that we can
          get wasted!!!!! and eat A5 Wagyu ig. Now people are gonna look at u
          weird in public cause ur a whole adult who can drink alcohol and i'm
          just a kid who can't. While you were 20, you did so many amazing and
          fun things. You finished some of ur hardest classes (and some of ur
          easiest ones as well 😒). You earned so much bank over the summer and
          got a return offer (pls pay for Wagyu House 🤑). You traveled
          everywhere and got to see ZB1. You're also about to have your first
          ever bday party (where we'll get wasted!!!). I've had so much fun
          staying with you this month and can't wait for us to be together
          forever ❤️. Although the countdown till together forever is still
          technically ♾️, I now have Cap One offer with the possibility to
          transfer to Boston (or NYC 👀) next year or even the year after that
          so the unofficial countdown is 1.5 years (an ♾️% decrease from before
          😁!!). Even though I'll be leaving next week, I'll be back soon (just
          like how Agumon and Gabumon will totally be back for Tai and Matt).
          Now if you haven't figured it out by now because of the very subtle
          background video (that is hopefully playing correctly) and the
          terrible Digimon reference, I got you a Digivice! But you might be
          wondering, how can I possibly fight anyone with my Digimon if I'm the
          only one with a Digivce. Surprise twist: I got one for me too!! I hope
          you like it and will battle me many more times in the future.
        </ShadowedText>
        <ShadowedText>Love,</ShadowedText>
        <ShadowedText>BZ</ShadowedText>
      </div>

      <div className="flex flex-col items-center gap-4 mb-64">
        <ShadowedText>
          {clickCount >= 20
            ? "Your Botamon has hatched! 🎉"
            : "Click the egg to hatch it!"}
        </ShadowedText>

        {clickCount < 20 ? (
          <>
            <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(clickCount / 20) * 100}%` }}
              />
            </div>
            <motion.div
              animate={{ rotate: shake ? [-5, 5, -5, 5, 0] : 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="/images/botamon-egg.png"
                alt="Botamon Egg"
                className="w-64 h-64 cursor-pointer"
                onClick={handleEggClick}
              />
            </motion.div>
          </>
        ) : (
          <img
            src="/images/botamon.png"
            alt="Botamon"
            className="w-64 h-64 cursor-pointer transition-all duration-300 ease-in-out hover:scale-110 active:scale-90"
            onClick={handleEggClick}
          />
        )}
      </div>
    </VideoPage>
  );
}
