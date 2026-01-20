// src/pages/Home.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import IDCard from "../components/IDCard";
import { listLostIDs, listFoundIDs } from "../lib/storage";

import type { LostIDRecord, FoundIDRecord } from "../lib/storage";

console.log("MODE:", import.meta.env.MODE);
console.log("BASE:", import.meta.env.VITE_IDFINDER_API_BASE);

export default function Home() {
  const [activeTab, setActiveTab] = useState<"lost" | "found">("lost");

  const { data: lostIDs = [], isLoading: loadingLost } = useQuery<
    LostIDRecord[]
  >({
    queryKey: ["lostIDs"],
    queryFn: async () => listLostIDs(),
  });

  const { data: foundIDs = [], isLoading: loadingFound } = useQuery<
    FoundIDRecord[]
  >({
    queryKey: ["foundIDs"],
    queryFn: async () => listFoundIDs(),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Search className="h-8 w-8 text-indigo-600" />
                ID Finder
              </h1>
              <p className="text-slate-600 mt-1">
                Report lost IDs or help return found ones
              </p>
            </div>
            <div className="flex gap-3">
              <Link to={createPageUrl("ReportLost")}>
                <Button className="bg-rose-600 hover:bg-rose-700 shadow-md">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Report Lost ID
                </Button>
              </Link>
              <Link to={createPageUrl("ReportFound")}>
                <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  Report Found ID
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={(v: string) => setActiveTab(v as "lost" | "found")}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-white shadow-sm">
            <TabsTrigger
              value="lost"
              className="data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700"
            >
              Lost IDs ({lostIDs.length})
            </TabsTrigger>
            <TabsTrigger
              value="found"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              Found IDs ({foundIDs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lost" className="mt-0">
            {loadingLost ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-48 bg-white rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : lostIDs.length === 0 ? (
              <div className="text-center py-16">
                <AlertCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No Lost IDs Reported
                </h3>
                <p className="text-slate-600 mb-6">
                  Be the first to report a lost ID
                </p>
                <Link to={createPageUrl("ReportLost")}>
                  <Button className="bg-rose-600 hover:bg-rose-700">
                    Report Lost ID
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lostIDs.map((id) => (
                  <IDCard key={id.id} data={id} type="lost" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="found" className="mt-0">
            {loadingFound ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-48 bg-white rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : foundIDs.length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No Found IDs
                </h3>
                <p className="text-slate-600 mb-6">
                  Help someone by reporting a found ID
                </p>
                <Link to={createPageUrl("ReportFound")}>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Report Found ID
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {foundIDs.map((id) => (
                  <IDCard key={id.id} data={id} type="found" />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
