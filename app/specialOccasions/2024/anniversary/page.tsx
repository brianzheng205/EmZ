import { Box } from "@mui/material";

import VideoPage from "@/components/pages/VideoPage";
import ShadowedText from "@/components/ShadowedText";

export const generateMetadata = () => ({
  title: "2024 Anniversary",
  description: "Page for 2024 anniversary",
});

export default function Anniversary() {
  return (
    <VideoPage
      videoSrc="/specialOccasions/2024/anniversary/YourName.mp4"
      title="2024 Anniversary"
    >
      <Box display="flex" flexDirection="column" gap={2}>
        <ShadowedText>Dear bao bei,</ShadowedText>
        <ShadowedText>
          Happy 3 Years ❤️❤️❤️❤️❤️❤️!!!! It seems that every year you get
          further and further—from 100 to 937 to 7000 miles away. I sometimes
          think that the universe wants to keep us apart, but I always have hope
          that it has a plan for us. Whether that means getting a job together
          this year or me going to school for another year (or working at the
          nearest McDonald's to you!!), I'm confident that our time is near (I
          don't mean that we're dying). I've been dying (jk I lied, I'm dying)
          from hw in the last few days, but the thought of you has kept me from
          going completely insane (I went a lil insane 🙊). At least one of us
          is having fun 😪. I've been thinking a lot about Epic and what I'm
          going to do and I've realized that all I care about is being with you
          (even if that means doing my master's 😭). You mean so much to me and
          I love you so much. You make these stupid classes somewhat bearable. I
          can't wait for you to come back from Korea so I can finally destress,
          and I can't wait for us to have a countdown for being together forever
          ❤️. Even if that countdown is a couple hundred of days, it'll be
          nothing compared to ♾️. For now, enjoy studying (more like not
          studying 🙄) in Singapore and traveling and keep giving me a 12 (or
          13) hour look into the future!!
        </ShadowedText>
        <ShadowedText>Love,</ShadowedText>
        <ShadowedText>I Love You</ShadowedText>
        <ShadowedText>
          Update: Just got good news that you def totally got the job!! Congrats
          🥳. I knew they would love you. Staying in school for one more year
          seems much more attractive now 👀. My mom also kept trying to say that
          I should just go to school for one more year to wait and see where you
          end up 🙈. But we will know real soon so I might as well apply to be
          in Boston this year 🙈.
        </ShadowedText>
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="calc(100vh - 64px)"
      >
        <Box
          component="img"
          src="/specialOccasions/2024/anniversary/sleepy.png"
          sx={{
            maxWidth: "90%",
            cursor: "pointer",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              transform: "scale(1.1)",
            },
            "&:active": {
              transform: "scale(0.9)",
            },
          }}
        />
      </Box>
    </VideoPage>
  );
}
