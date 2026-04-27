"use client";

import { useState } from "react";

type League = {
  id: number;
  name: string;
  leagueId: string;
  season: string;
  matches: number;
  status: "Ongoing" | "Completed";
};

export default function LeaguesPage() {
  const leagues: League[] = [
    { id: 1, name: "A-League Men", leagueId: "ALM001", season: "2025/26", matches: 120, status: "Ongoing" },
    { id: 2, name: "A-League Women", leagueId: "ALW002", season: "2025/26", matches: 90, status: "Ongoing" },
    { id: 3, name: "National Premier League NSW", leagueId: "NPL003", season: "2025", matches: 150, status: "Completed" },
    { id: 4, name: "NPL Victoria", leagueId: "NPL004", season: "2025", matches: 140, status: "Completed" },
    { id: 5, name: "Queensland Premier League", leagueId: "QPL005", season: "2025", matches: 110, status: "Ongoing" },
    { id: 6, name: "South Australia NPL", leagueId: "SANPL006", season: "2025", matches: 100, status: "Completed" },
    { id: 7, name: "Western Australia NPL", leagueId: "WANPL007", season: "2025", matches: 105, status: "Ongoing" },
    { id: 8, name: "Tasmania NPL", leagueId: "TAS008", season: "2025", matches: 80, status: "Completed" },
    { id: 9, name: "Northern NSW NPL", leagueId: "NNSW009", season: "2025", matches: 95, status: "Ongoing" },
    { id: 10, name: "Capital Football NPL", leagueId: "ACT010", season: "2025", matches: 85, status: "Completed" },

    { id: 11, name: "Youth League Australia", leagueId: "YTH011", season: "2025/26", matches: 60, status: "Ongoing" },
    { id: 12, name: "State League NSW", leagueId: "SLNSW012", season: "2025", matches: 130, status: "Completed" },
    { id: 13, name: "State League VIC", leagueId: "SLVIC013", season: "2025", matches: 125, status: "Completed" },
    { id: 14, name: "Brisbane Premier League", leagueId: "BPL014", season: "2025", matches: 115, status: "Ongoing" },
    { id: 15, name: "Perth Amateur League", leagueId: "PAL015", season: "2025", matches: 95, status: "Completed" },
    { id: 16, name: "Sydney Amateur League", leagueId: "SAL016", season: "2025", matches: 140, status: "Ongoing" },
    { id: 17, name: "Melbourne Amateur League", leagueId: "MAL017", season: "2025", matches: 135, status: "Completed" },
    { id: 18, name: "Darwin Premier League", leagueId: "DPL018", season: "2025", matches: 75, status: "Ongoing" },
    { id: 19, name: "Canberra Premier League", leagueId: "CPL019", season: "2025", matches: 85, status: "Completed" },
    { id: 20, name: "Hobart League", leagueId: "HL020", season: "2025", matches: 70, status: "Ongoing" },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const leaguesPerPage = 10;

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
                        : "bg-yellow-100 text-yellow-700"
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
