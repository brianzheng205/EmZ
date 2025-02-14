import { ReactNode } from "react";

interface VideoPageProps {
  videoSrc: string;
  title: string;
  children?: ReactNode;
}

export default function VideoPage({
  videoSrc,
  title,
  children,
}: VideoPageProps) {
  return (
    <div className="relative">
      <video
        autoPlay
        loop
        playsInline
        className="fixed bottom-0 left-0 w-full h-[calc(100vh-64px)] object-cover -z-10"
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="flex flex-col gap-[100vh] text-white w-full">
        <div className="flex flex-col justify-center items-center h-[calc(100vh-128px)]">
          <h1 className="text-[15rem] text-center font-bold [text-shadow:-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,2px_2px_0_#000]">
            {title}
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
