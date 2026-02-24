// src/pages/Home.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Search, AlertCircle, LogIn, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import IDCard from "../components/IDCard";
import { listLostIDs, listFoundIDs } from "../lib/storage";
import { useAuth } from "../hooks/useAuth";
import { login, logout } from "../lib/auth";
import type { LostIDRecord, FoundIDRecord } from "../lib/storage";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"lost" | "found">("lost");
  const { user, loading } = useAuth();

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
    <div
      style={{ minHeight: "100vh", backgroundColor: "#1a1a2e", color: "white" }}
    >
      {/* Header */}
      <div style={{ borderBottom: "1px solid #2a2a3e", padding: "20px 40px" }}>
        {/* Top row: title + sign in/out */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Search style={{ color: "#a855f7", width: 32, height: 32 }} />
              <h1
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "white",
                  margin: 0,
                }}
              >
                ID Finder
              </h1>
            </div>
            <p style={{ color: "#9ca3af", marginTop: "4px", fontSize: "14px" }}>
              Report lost IDs or help return found ones
            </p>
          </div>

          {/* Sign in/out top right */}
          {!loading &&
            (user ? (
              <button
                onClick={() => logout()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #4a4a6a",
                  backgroundColor: "transparent",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                <LogOut style={{ width: 16, height: 16 }} />
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => login()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #4a4a6a",
                  backgroundColor: "transparent",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                <LogIn style={{ width: 16, height: 16 }} />
                Sign In
              </button>
            ))}
        </div>

        {/* Bottom row: action buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <Link to={createPageUrl("ReportLost")}>
            <Button className="bg-rose-600 hover:bg-rose-700">
              <AlertCircle className="h-4 w-4 mr-2" />
              Report Lost ID
            </Button>
          </Link>
          <Link to={createPageUrl("ReportFound")}>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Report Found ID
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 40px" }}
      >
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              backgroundColor: "#2a2a3e",
              borderRadius: "8px",
              padding: "4px",
              display: "flex",
              width: "400px",
            }}
          >
            <button
              onClick={() => setActiveTab("lost")}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                backgroundColor:
                  activeTab === "lost" ? "#1a1a2e" : "transparent",
                color: activeTab === "lost" ? "#f43f5e" : "#9ca3af",
                fontSize: "14px",
                fontWeight: activeTab === "lost" ? 600 : 400,
              }}
            >
              Lost IDs ({lostIDs.length})
            </button>
            <button
              onClick={() => setActiveTab("found")}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                backgroundColor:
                  activeTab === "found" ? "#1a1a2e" : "transparent",
                color: activeTab === "found" ? "#10b981" : "#9ca3af",
                fontSize: "14px",
                fontWeight: activeTab === "found" ? 600 : 400,
              }}
            >
              Found IDs ({foundIDs.length})
            </button>
          </div>
        </div>

        {/* Lost IDs */}
        {activeTab === "lost" && (
          <>
            {loadingLost ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "24px",
                }}
              >
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: 192,
                      backgroundColor: "#2a2a3e",
                      borderRadius: "8px",
                    }}
                  />
                ))}
              </div>
            ) : lostIDs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 0" }}>
                <AlertCircle
                  style={{
                    width: 64,
                    height: 64,
                    color: "#4a4a6a",
                    margin: "0 auto 16px",
                  }}
                />
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 500,
                    color: "white",
                    marginBottom: "8px",
                  }}
                >
                  No Lost IDs Reported
                </h3>
                <p style={{ color: "#9ca3af", marginBottom: "24px" }}>
                  Be the first to report a lost ID
                </p>
                <Link to={createPageUrl("ReportLost")}>
                  <Button className="bg-rose-600 hover:bg-rose-700">
                    Report Lost ID
                  </Button>
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "24px",
                }}
              >
                {lostIDs.map((id) => (
                  <IDCard key={id.id} data={id} type="lost" />
                ))}
              </div>
            )}
          </>
        )}

        {/* Found IDs */}
        {activeTab === "found" && (
          <>
            {loadingFound ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "24px",
                }}
              >
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: 192,
                      backgroundColor: "#2a2a3e",
                      borderRadius: "8px",
                    }}
                  />
                ))}
              </div>
            ) : foundIDs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 0" }}>
                <Search
                  style={{
                    width: 64,
                    height: 64,
                    color: "#4a4a6a",
                    margin: "0 auto 16px",
                  }}
                />
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 500,
                    color: "white",
                    marginBottom: "8px",
                  }}
                >
                  No Found IDs
                </h3>
                <p style={{ color: "#9ca3af", marginBottom: "24px" }}>
                  Help someone by reporting a found ID
                </p>
                <Link to={createPageUrl("ReportFound")}>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Report Found ID
                  </Button>
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "24px",
                }}
              >
                {foundIDs.map((id) => (
                  <IDCard key={id.id} data={id} type="found" />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
