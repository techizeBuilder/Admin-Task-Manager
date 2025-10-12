import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FormPublishModal({ open, onClose, formId, draftSchema }) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: draftSchema?.title || "",
    description: draftSchema?.description || "",
    start_at: "",
    end_at: "",
    visibility: "ORG", // PUBLIC/PRIVATE/ORG
    scope: "INTERNAL", // INTERNAL/EXTERNAL
    external_submission_enabled: false,
    release_notes: "",
  });
  const [externalLink, setExternalLink] = useState("");

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const onPublish = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/forms/${formId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          start_at: form.start_at || null,
          end_at: form.end_at || null,
          visibility: form.visibility,
          scope: form.scope,
          external_submission_enabled: form.external_submission_enabled,
          release_notes: form.release_notes,
          schema_json: draftSchema, // full schema JSON
        }),
      });
      if (!res.ok) throw new Error("Publish failed");
      const data = await res.json();
      if (data?.external_link) setExternalLink(data.external_link);
      alert("Form published.");
      onClose?.(true);
    } catch (e) {
      console.error(e);
      alert("Publish failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-md w-full max-w-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Publish Form</h2>
          <Button variant="ghost" onClick={() => onClose?.(false)}>Close</Button>
        </div>

        <div className="space-y-3">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <Textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input type="datetime-local" value={form.start_at} onChange={(e) => update("start_at", e.target.value)} />
            <Input type="datetime-local" value={form.end_at} onChange={(e) => update("end_at", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select value={form.visibility} onValueChange={(v) => update("visibility", v)}>
              <SelectTrigger><SelectValue placeholder="Visibility" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ORG">Organization</SelectItem>
                <SelectItem value="PUBLIC">Public</SelectItem>
                <SelectItem value="PRIVATE">Private</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.scope} onValueChange={(v) => update("scope", v)}>
              <SelectTrigger><SelectValue placeholder="Scope" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="INTERNAL">Internal</SelectItem>
                <SelectItem value="EXTERNAL">External</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.external_submission_enabled}
              onChange={(e) => update("external_submission_enabled", e.target.checked)}
            />
            Enable external submission link
          </label>
          <Textarea
            placeholder="Release notes"
            value={form.release_notes}
            onChange={(e) => update("release_notes", e.target.value)}
            rows={2}
          />
        </div>

        {externalLink && (
          <div className="mt-3 text-sm">
            External link: <a className="text-blue-600 underline" href={externalLink} target="_blank" rel="noreferrer">{externalLink}</a>
          </div>
        )}

        <div className="mt-4 flex justify-between gap-2">
          <Button variant="outline" onClick={() => onClose?.(false)}>Cancel</Button>
          <Button className='bg-blue-500 text-white' onClick={onPublish} disabled={submitting}>{submitting ? "Publishing…" : "Publish"}</Button>
        </div>
      </div>
    </div>
  );
}