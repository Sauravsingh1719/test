"use client";
import { FaTrophy, FaChartBar } from "react-icons/fa";
import { FiClipboard } from "react-icons/fi";
import { MdTranslate } from "react-icons/md";
import Button from "./button";
import Image from "next/image";

export default function TestifyPass() {
  return (
    <div className="px-[10%] bg-blue-200">
    <div className=" bg-blue-200 flex flex-col md:flex-row items-center justify-between gap-10 px-6 md:px-16 py-12">
      {/* First div (for image later) */}
      <div className="flex-1 flex items-center justify-center">
        {/* Add your image here later */}
        <div className=" rounded-xl shadow-md flex items-center justify-center">
          <Image
                    src="/images/Join.png"
                    alt="Hero Image"
                    width={500}
                    height={500}
                    sizes="(max-width: 768px) 80vw, 700px"
                    className="rounded-3xl shadow-2xl object-contain"
                  />
        </div>
      </div>

      {/* Second div */}
      <div className="flex-1">
        <section className="flex flex-col items-center md:items-start justify-center py-6 px-4 text-center md:text-left ">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Enroll in Test Series with{" "}
            <span className="text-blue-600">Testify</span>
          </h2>
          <p className="text-gray-600 w-auto mb-8">
            Get unlimited access to the most relevant Mock Tests, on Testify's
            Structured Online Test Series platform.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mb-8">
            <div className="flex flex-col items-center bg-yellow-50 p-4 rounded-xl shadow-sm">
              <FaTrophy className="text-yellow-500 text-3xl mb-2" />
              <p className="font-semibold">All India Rank</p>
            </div>

            <div className="flex flex-col items-center bg-purple-50 p-4 rounded-xl shadow-sm">
              <FiClipboard className="text-purple-500 text-3xl mb-2" />
              <p className="font-semibold">Latest Exam Patterns</p>
            </div>

            <div className="flex flex-col items-center bg-orange-50 p-4 rounded-xl shadow-sm">
              <FaChartBar className="text-orange-500 text-3xl mb-2" />
              <p className="font-semibold">In-depth Performance Analysis</p>
            </div>

            <div className="flex flex-col items-center bg-green-50 p-4 rounded-xl shadow-sm">
              <MdTranslate className="text-green-500 text-3xl mb-2" />
              <p className="font-semibold">Multi-lingual Mock Tests</p>
            </div>
          </div>

          <a href="/sign-in">
            <Button>Explore Testify</Button>
          </a>
        </section>
      </div>
    </div>
    </div>
  );
}
