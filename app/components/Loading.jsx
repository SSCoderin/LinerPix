import { DotLottieReact } from "@lottiefiles/dotlottie-react";
export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="h-[100] w-[100] flex items-center justify-center">
        <DotLottieReact
          src="https://lottie.host/5ed52507-2676-4ff4-9e33-05e28fd3d8d9/6pkJT9kmtw.lottie"
          loop
          autoplay
        />
      </div>
    </div>
  );
}
