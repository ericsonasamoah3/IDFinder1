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
import { Upload, ArrowLeft, Loader2, X, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { toast } from "sonner";
import { createFoundID, listLostIDs } from "../lib/storage";
import type { IDType } from "../lib/storage";

type FormState = {
  name_on_id: string;
  id_type: IDType | "";
  id_number_hint: string;
  found_location: string;
  finder_name: string;
  finder_contact: string;
  description: string;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export default function ReportFound() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>("");

  const [formData, setFormData] = useState<FormState>({
    name_on_id: "",
    id_type: "",
    id_number_hint: "",
    found_location: "",
    finder_name: "",
    finder_contact: "",
    description: "",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Store as base64 data URL so it persists in localStorage
      const dataUrl = await fileToDataUrl(file);
      setPhotoUrl(dataUrl);
      toast.success("Photo added!");
    } catch {
      toast.error("Failed to read photo");
    } finally {
      setUploading(false);
      // allow re-selecting same file
      e.target.value = "";
    }
  };

  const reportMutation = useMutation({
    mutationFn: async (data: FormState) => {
      if (!data.id_type) {
        throw new Error("ID type is required");
      }

      // Save found report locally
      const newReport = createFoundID({
        ...data,
        id_type: data.id_type,
        photo_url: photoUrl,
      });

      // Local “match” check against lost IDs
      const lostIDs = await listLostIDs();
      const matches = lostIDs.filter(
        (lost) =>
          lost.status === "searching" &&
          lost.id_type === data.id_type &&
          lost.owner_name.toLowerCase().includes(data.name_on_id.toLowerCase()),
      );

      return { newReport, matchesCount: matches.length };
    },
    onSuccess: ({ matchesCount }) => {
      queryClient.invalidateQueries({ queryKey: ["foundIDs"] });

      if (matchesCount > 0) {
        toast.success(
          `Found ID reported! ${matchesCount} possible match(es) exist in Lost IDs.`,
        );
      } else {
        toast.success("Found ID reported!");
      }

      navigate(createPageUrl("Home"));
    },
    onError: () => {
      toast.error("Failed to report found ID. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={createPageUrl("Home")}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <CheckCircle className="h-7 w-7" />
              Report Found ID
            </CardTitle>
            <p className="text-emerald-50 mt-2">
              Help someone recover their lost ID
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>ID Photo (Optional)</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                  {photoUrl ? (
                    <div className="relative">
                      <img
                        src={photoUrl}
                        alt="ID Preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setPhotoUrl("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="photo" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm text-slate-600 mb-2">
                        {uploading ? "Uploading..." : "Click to upload photo"}
                      </p>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name_on_id">Name on ID *</Label>
                <Input
                  id="name_on_id"
                  required
                  value={formData.name_on_id}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, name_on_id: e.target.value })
                  }
                  placeholder="As shown on the ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_type">ID Type *</Label>
                <Select
                  value={formData.id_type}
                  onValueChange={(value: string) =>
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
                <Label htmlFor="id_number_hint">Last 4 Digits Visible</Label>
                <Input
                  id="id_number_hint"
                  value={formData.id_number_hint}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, id_number_hint: e.target.value })
                  }
                  placeholder="Help verify the owner"
                  maxLength={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="found_location">Where You Found It *</Label>
                <Input
                  id="found_location"
                  required
                  value={formData.found_location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, found_location: e.target.value })
                  }
                  placeholder="e.g., City Library, Bus Station"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="finder_name">Your Name *</Label>
                <Input
                  id="finder_name"
                  required
                  value={formData.finder_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, finder_name: e.target.value })
                  }
                  placeholder="So the owner can thank you"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="finder_contact">Your Contact Info *</Label>
                <Input
                  id="finder_contact"
                  required
                  value={formData.finder_contact}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, finder_contact: e.target.value })
                  }
                  placeholder="Phone or email"
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
                  placeholder="Any other details..."
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={reportMutation.isPending}
              >
                {reportMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Reporting...
                  </>
                ) : (
                  "Report Found ID"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
