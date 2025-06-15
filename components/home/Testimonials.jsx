"use client";

import { useState, useEffect } from "react";
import { testimonials } from "@/lib/homepage-data";

const Testimonials = () => {
  const [isPaused, setIsPaused] = useState(false);

  // Show testimonials in two rows for infinite scroll animation
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600">
              Thousands
            </span>{" "}
            of Users
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
            See how LockIn's AI-powered scheduling has transformed productivity
            for professionals across different industries.
          </p>
        </div>

        {/* Infinite Carousel */}
        <div className="relative">
          <div className="flex space-x-4 sm:space-x-6 animate-scroll">
            {duplicatedTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${index}`}
                className="flex-shrink-0 w-80 sm:w-96 bg-gray-50 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                style={{
                  animationPlayState: isPaused ? "paused" : "running",
                }}
              >
                {/* User Data - Top */}
                <div className="flex items-center mb-4">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm mr-3 sm:mr-4`}
                  >
                    {testimonial.image}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                      {testimonial.name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {testimonial.role}
                      {testimonial.company && (
                        <>
                          <span className="mx-1">at</span>
                          <span className="font-medium">
                            {testimonial.company}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Testimonial Text - Center */}
                <div className="flex-1 flex items-center justify-center">
                  <blockquote className="text-gray-700 leading-relaxed text-center text-sm sm:text-base">
                    "{testimonial.content}"
                  </blockquote>
                </div>

                {/* Rating - Bottom Center */}
                <div className="flex items-center justify-center mt-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          <div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-blue-600">
              2,500+
            </div>
            <div className="text-sm sm:text-base text-blue-500">Happy Users</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-blue-600">
              50,000+
            </div>
            <div className="text-sm sm:text-base text-blue-500">Tasks Scheduled</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-blue-600">
              4.9/5
            </div>
            <div className="text-sm sm:text-base text-blue-500">Average Rating</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-blue-600">
              40%
            </div>
            <div className="text-sm sm:text-base text-blue-500">Productivity Increase</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
