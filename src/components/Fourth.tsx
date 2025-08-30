// components/Fourth.tsx
import Image from "next/image";
import React from "react";

function Fourth() {
  return (
    <div className="px-[13%] bg-blue-200">
      <div className="flex flex-col md:flex-row gap-8 md:gap-20 items-center justify-center px-6 md:px-[10%] min-h-screen">
        {/* Image - show first on small, last on md+ (same order behavior as your Hero) */}
        <div className="w-full md:w-auto flex justify-center order-first md:order-last">
          <Image
            src="/images/Why.png"
            alt="Why Testify illustration"
            width={700}
            height={500}
            sizes="(max-width: 768px) 80vw, 700px"
            className="rounded-3xl shadow-2xl object-contain"
          />
        </div>

        {/* Text - show after image on small, before image on md+ */}
        <div className="flex flex-col gap-4 md:gap-5 text-center md:text-left order-last md:order-first">
          <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl text-blue-800 font-bold">
            Why Testify?
          </h1>

          <p className="py-4 text-gray-600 text-base   max-w-2xl">
            Testify brings testing, training and progress tracking into one simple platform.
            Admins, teachers, and students can create and publish custom tests in minutes.
            Learners get instant scoring, detailed analytics, and a global leaderboard to track
            improvement and compete with peers. Whether you’re preparing for an exam or building
            practice material for your class, Testify makes it easy, fair and motivating.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Fourth;
