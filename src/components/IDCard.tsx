import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CreditCard,
  Car,
  Globe,
  GraduationCap,
  Briefcase,
  FileText,
  MapPin,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import type { FoundIDRecord, LostIDRecord } from "../lib/storage";

type Props = {
  data: LostIDRecord | FoundIDRecord;
  type?: "lost" | "found";
  onClick?: () => void;
};

const idTypeIcons = {
  national_id: CreditCard,
  drivers_license: Car,
  passport: Globe,
  student_id: GraduationCap,
  work_id: Briefcase,
  other: FileText,
} as const;

const idTypeLabels: Record<string, string> = {
  national_id: "National ID",
  drivers_license: "Driver's License",
  passport: "Passport",
  student_id: "Student ID",
  work_id: "Work ID",
  other: "Other",
};

const statusColors: Record<string, string> = {
  searching: "bg-yellow-500 text-black",
  matched: "bg-green-500 text-white",
  recovered: "bg-blue-500 text-white",
  unclaimed: "bg-gray-500 text-white",
  returned: "bg-green-500 text-white",
};

export default function IDCard({ data, type = "lost", onClick }: Props) {
  const idType = (data as any).id_type as keyof typeof idTypeIcons;
  const Icon = idTypeIcons[idType] || FileText;
  const isLost = type === "lost";

  const title = isLost
    ? (data as LostIDRecord).owner_name
    : (data as FoundIDRecord).name_on_id;

  const location = isLost
    ? (data as LostIDRecord).last_seen_location
    : (data as FoundIDRecord).found_location;

  const status = (data as any).status as string;
  const borderColor = isLost ? "#f43f5e" : "#10b981";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card
        style={{
          backgroundColor: "#2a2a3e",
          border: "1px solid #3a3a5e",
          borderTop: `3px solid ${borderColor}`,
          borderRadius: "12px",
        }}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3 items-center">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "#1a1a2e" }}
              >
                <Icon className="h-5 w-5" style={{ color: borderColor }} />
              </div>
              <div>
                <div className="font-semibold" style={{ color: "white" }}>
                  {title}
                </div>
                <div className="text-sm" style={{ color: "#9ca3af" }}>
                  {idTypeLabels[idType]}
                </div>
              </div>
            </div>

            <Badge className={statusColors[status] ?? "bg-gray-500 text-white"}>
              {status}
            </Badge>
          </div>

          <div className="flex flex-col gap-2">
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: "#9ca3af" }}
            >
              <MapPin className="h-4 w-4" />
              <span className="truncate">{location || "-"}</span>
            </div>

            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: "#9ca3af" }}
            >
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date((data as any).created_date), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
