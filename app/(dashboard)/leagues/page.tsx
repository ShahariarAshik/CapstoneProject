"use client";

import { useState, useEffect } from "react";

type League = {
  id: number;
  name: string;
  leagueId: string;
  season: string;
  matches: number | string;
  status: "Ongoing" | "Completed" | "No Data";
};

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const leaguesPerPage = 10;

  // Fetch API
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/leagues/get-leagues")
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.leagues.map((item: any, index: number) => ({
          id: index + 1,
          name: item.league_name,
          leagueId: item.id,
          season: "No Data",
          matches: "No Data",
          status: "No Data",
        }));
        setLeagues(mapped);
      })
      .catch((err) => console.error("API error:", err));
  }, []);

  const indexOfLast = currentPage * leaguesPerPage;
  const indexOfFirst = indexOfLast - leaguesPerPage;
  const currentLeagues = leagues.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(leagues.length / leaguesPerPage);

  return (
    <div>
      {/* Title */}
      <h1 className="text-2xl font-bold mb-6">League Details</h1>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-sm text-gray-600">
            <tr>
              <th className="p-4">#</th>
              <th className="p-4">League Name</th>
              <th className="p-4">League ID</th>
              <th className="p-4">Season</th>
              <th className="p-4">Matches</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentLeagues.map((league) => (
              <tr key={league.id} className="border-t hover:bg-gray-50">
                <td className="p-4">{league.id}</td>
                <td className="p-4">{league.name}</td>
                <td className="p-4">{league.leagueId}</td>
                <td className="p-4">{league.season}</td>
                <td className="p-4">{league.matches}</td>

                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      league.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : league.status === "Ongoing"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {league.status}
                  </span>
                </td>

                <td className="p-4">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">
                    Generate Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-2">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === index + 1
                ? "bg-gray-900 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}