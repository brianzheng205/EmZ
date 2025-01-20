const styles = {
  text: "text-3xl font-bold [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]",
};

export default function Anniversary() {
  return (
    <div>
      <video
        autoPlay
        loop
        playsInline
        className="fixed bottom-0 left-0 w-full h-[calc(100vh-64px)] object-cover -z-10"
      >
        <source
          src="/specialOccasions/2024/anniversary/YourName.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      <div className="flex flex-col gap-[100vh] text-white">
        <div className="flex flex-col justify-center items-center h-[calc(100vh-128px)]">
          <h1 className="text-[15rem] text-center font-bold [text-shadow:-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,2px_2px_0_#000]">
            2024 Anniversary
          </h1>
        </div>
        <div className="flex flex-col gap-8">
          <p className={styles.text}>Dear bao bei,</p>
          <p className={styles.text}>
            Happy 3 Years ❤️❤️❤️❤️❤️❤️!!!! It seems that every year you get
            further and further—from 100 to 937 to 7000 miles away. I sometimes
            think that the universe wants to keep us apart, but I always have
            hope that it has a plan for us. Whether that means getting a job
            together this year or me going to school for another year (or
            working at the nearest McDonald's to you!!), I'm confident that our
            time is near (I don't mean that we're dying). I've been dying (jk I
            lied, I'm dying) from hw in the last few days, but the thought of
            you has kept me from going completely insane (I went a lil insane
            🙊). At least one of us is having fun 😪. I've been thinking a lot
            about Epic and what I'm going to do and I've realized that all I
            care about is being with you (even if that means doing my master's
            😭). You mean so much to me and I love you so much. You make these
            stupid classes somewhat bearable. I can't wait for you to come back
            from Korea so I can finally destress, and I can't wait for us to
            have a countdown for being together forever ❤️. Even if that
            countdown is a couple hundred of days, it'll be nothing compared to
            ♾️. For now, enjoy studying (more like not studying 🙄) in Singapore
            and traveling and keep giving me a 12 (or 13) hour look into the
            future!!
          </p>
          <p className={styles.text}>Love,</p>
          <p className={styles.text}>I Love You</p>
          <p className={styles.text}>
            Update: Just got good news that you def totally got the job!!
            Congrats 🥳. I knew they would love you. Staying in school for one
            more year seems much more attractive now 👀. My mom also kept trying
            to say that I should just go to school for one more year to wait and
            see where you end up 🙈. But we will know real soon so I might as
            well apply to be in Boston this year 🙈.
          </p>
        </div>
        <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)]">
          <img
            src="/specialOccasions/2024/anniversary/sleepy.png"
            className="max-w-[90%] cursor-pointer transition-all duration-300 ease-in-out hover:scale-110 active:scale-90"
          />
        </div>
      </div>
    </div>
  );
}
