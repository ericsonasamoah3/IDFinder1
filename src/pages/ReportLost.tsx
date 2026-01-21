import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { toast } from "sonner";
import { createLostID, listFoundIDs } from "../lib/storage";
import type { IDType } from "../lib/storage";

type FormState = {
  owner_name: string;
  owner_email: string;
  id_type: IDType | "";
  id_number_hint: string;
  last_seen_location: string;
  description: string;
};

export default function ReportLost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormState>({
    owner_name: "",
    owner_email: "",
    id_type: "",
    id_number_hint: "",
    last_seen_location: "",
    description: "",
  });

  const reportMutation = useMutation({
    mutationFn: async (data: FormState) => {
      if (!data.id_type) {
        throw new Error("ID type is required");
      }

      // Save lost report locally
      const newReport = createLostID({
        owner_name: data.owner_name,
        owner_email: data.owner_email,
        id_type: data.id_type,
        id_number_hint: data.id_number_hint,
        last_seen_location: data.last_seen_location,
        description: data.description,
      });

      // Local “match” check against found IDs (no email sending in frontend-only app)
      const foundIDs = await listFoundIDs();
      const matches = foundIDs.filter(
        (found) =>
          found.status === "unclaimed" &&
          found.id_type === data.id_type &&
          found.name_on_id
            .toLowerCase()
            .includes(data.owner_name.toLowerCase()),
      );

      return { newReport, matchesCount: matches.length };
    },
    onSuccess: ({ matchesCount }) => {
      queryClient.invalidateQueries({ queryKey: ["lostIDs"] });

      if (matchesCount > 0) {
        toast.success(
          `Lost ID reported! We found ${matchesCount} possible match(es) in Found IDs.`,
        );
      } else {
        toast.success(
          "Lost ID reported successfully! We'll notify you if we find a match (local only).",
        );
      }

      navigate(createPageUrl("Home"));
    },
    onError: () => {
      toast.error("Failed to report lost ID. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={createPageUrl("Home")}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-danger text-white">
            <CardTitle className="d-flex align-items-center gap-2">
              <AlertCircle />
              Report Lost ID
            </CardTitle>
            <p className="mb-0 opacity-75">
              Fill in the details so we can help you find your ID
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="owner_name">Your Full Name *</Label>
                <Input
                  id="owner_name"
                  required
                  value={formData.owner_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, owner_name: e.target.value })
                  }
                  placeholder="As shown on your ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner_email">Your Email *</Label>
                <Input
                  id="owner_email"
                  type="email"
                  required
                  value={formData.owner_email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, owner_email: e.target.value })
                  }
                  placeholder="We'll notify you here if found"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_type">ID Type *</Label>
                <Select
                  value={formData.id_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, id_type: value as IDType })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national_id">National ID</SelectItem>
                    <SelectItem value="drivers_license">
                      Driver&apos;s License
                    </SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="student_id">Student ID</SelectItem>
                    <SelectItem value="work_id">Work ID</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_number_hint">
                  Last 4 Digits of ID Number
                </Label>
                <Input
                  id="id_number_hint"
                  value={formData.id_number_hint}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, id_number_hint: e.target.value })
                  }
                  placeholder="For verification purposes"
                  maxLength={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_seen_location">Last Seen Location *</Label>
                <Input
                  id="last_seen_location"
                  required
                  value={formData.last_seen_location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      last_seen_location: e.target.value,
                    })
                  }
                  placeholder="e.g., Central Park, Starbucks Downtown"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional Details</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Any other details that might help..."
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700"
                disabled={reportMutation.isPending}
              >
                {reportMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Reporting...
                  </>
                ) : (
                  "Report Lost ID"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
