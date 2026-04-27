// app/(dashboard)/page.tsx

"use client";

import { FileText, Calendar, Trophy, Briefcase } from "lucide-react";

export default function HomePage() {
  const stats = [
    { title: "Reports Generated", value: 50, icon: FileText },
    { title: "Matches Played", value: 15, icon: Calendar },
    { title: "Leagues", value: 12, icon: Trophy },
    { title: "Jobs", value: 10, icon: Briefcase },
  ];

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-center">Home</h1>

      <div className="grid grid-cols-2 gap-6 mt-8">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="p-6 rounded-2xl shadow bg-white flex flex-col items-center"
            >
              <Icon size={30} className="mb-3 text-gray-700" />
              <h2 className="text-2xl font-bold">{item.value}</h2>
              <p className="text-gray-500">{item.title}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}