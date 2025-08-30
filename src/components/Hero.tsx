import Image from 'next/image'
import React from 'react'
import Button from './button'

function Hero() {
  return (
    <div className=" flex flex-col md:flex-row gap-8 md:gap-20 items-center justify-center px-6 md:px-[10%] min-h-screen">
      {/* Image - show first on small, last on md+ */}
      <div className="w-full md:w-auto flex justify-center order-first md:order-last">
        <Image
          src="/images/Testify.png"
          alt="Hero Image"
          width={700}
          height={500}
          sizes="(max-width: 768px) 80vw, 700px"
          className="rounded-3xl shadow-2xl object-contain"
        />
      </div>

      {/* Text - show after image on small, before image on md+ */}
      <div className="flex flex-col gap-4 md:gap-5 text-center md:text-left order-last md:order-first">
        <h1 className="font-extrabold text-4xl sm:text-5xl md:text-7xl text-blue-700 leading-tight">
          Test.<br /> Train.<br /> Triumph.
        </h1>

        <h2 className="font-medium text-sm sm:text-base md:text-xl">
          Create or attempt tests, track progress, and climb the global leaderboard.
        </h2>

        <div className="flex justify-center md:justify-start">
          <a href="/sign-in">
            <Button type="submit" className="w-max mt-4">
              Get Started for free
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Hero
