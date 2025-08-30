"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import SkeletonCard from "./SkeletonLoading";

function Third() {
  const [stats, setStats] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchStats() {
    try {
      const res = await axios.get("/api/stats");
      if (res.data.success) {
        setStats(res.data.data);
        setError(null);
      } else {
        setError("Failed to fetch stats");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching stats");
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  if (error) {
    return <div className="text-red-500 font-semibold">{error}</div>;
  }

  if (!stats) {
    return (
      <div className="px-6 md:px-[20%] py-10">
        <SkeletonCard />
      </div>
    );
  }

  const items = [
    { label: "Total Aspirants", value: stats.totalStudents ?? 0 },
    { label: "Total Teachers", value: stats.totalTeachers ?? 0 },
    { label: "Total Tests", value: stats.totalTests ?? 0 },
  ];

  return (
    <section className="bg-blue-200 px-6 md:px-[20%] py-10 md:pt-[10%]">
      <div>
        <h1 className="text-3xl sm:text-4xl md:text-7xl text-blue-800 font-bold mb-8 md:mb-[10%] text-center md:text-left">
          One Destination of all Aspirants
        </h1>
      </div>

      {/* container: column on small, row on md+ */}
      <div
        className="
          relative
          flex flex-col md:flex-row
          items-stretch md:items-center
          gap-4 md:gap-0
          mx-0 md:mx-[10%]
          rounded-3xl shadow-2xl bg-blue-50 p-4 md:p-5
          justify-center
        "
      >
        {items.map((it, idx) => (
          <React.Fragment key={it.label}>
            <div
              // make each stat full-width on small, auto on md
              className={`
                relative z-10
                w-full md:w-auto
                flex items-center justify-center
                p-4 md:px-6 md:py-4
                rounded-2xl
                transition-colors transition-transform
                duration-300 ease-out delay-75
                hover:bg-blue-300 hover:scale-102 hover:shadow-lg
                focus:outline-none focus:ring-2 focus:ring-blue-400
                motion-reduce:transition-none
              `}
              tabIndex={0}
              role="button"
              aria-pressed="false"
            >
              <h1 className="text-lg sm:text-xl md:text-2xl text-blue-800 font-bold flex items-center gap-3">
                <span>{it.label}:</span>
                <span className="ml-2">{it.value}</span>
              </h1>
            </div>

            {/* separator: vertical on md+, horizontal on small */}
            {idx < items.length - 1 && (
              <>
                {/* vertical (only visible on md+) */}
                <div
                  className="hidden md:block w-px h-20 mx-4 bg-slate-300 dark:bg-slate-700"
                  role="separator"
                  aria-orientation="vertical"
                />
                {/* horizontal (only visible on small) */}
                <div
                  className="block md:hidden w-full h-px my-2 bg-slate-300 dark:bg-slate-700"
                  role="separator"
                  aria-orientation="horizontal"
                />
              </>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

export default Third;
