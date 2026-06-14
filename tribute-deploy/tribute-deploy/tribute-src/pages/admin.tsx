import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListTributes,
  useGetTributeStats,
  useListRsvps,
  useGetRsvpStats,
  useCreateTribute,
  useUpdateTribute,
  useDeleteTribute,
  getListTributesQueryKey,
  getGetTributeStatsQueryKey,
} from "@workspace/api-client-react";
import { Download, Users, MessageSquare, UserCheck, Monitor, Lock, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/pages/home";
import { useToast } from "@/hooks/use-toast";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "pastor60";
const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface TributeFormData {
  authorName: string;
  relationship: string;
  message: string;
}

const emptyForm: TributeFormData = { authorName: "", relationship: "", message: "" };

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number | undefined }) {
  return (
    <div className="bg-white border border-slate-200 p-6 text-center shadow-sm">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#8B2332]/10 text-[#8B2332] mb-3">
        <Icon size={18} />
      </div>
      <div className="text-3xl font-serif font-bold text-[#8B2332] mb-1">{value ?? "—"}</div>
      <div className="text-sm text-slate-500 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function TributeFormFields({
  data,
  onChange,
}: {
  data: TributeFormData;
  onChange: (d: TributeFormData) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <input
        className="border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#8B2332]"
        placeholder="Name"
        value={data.authorName}
        onChange={e => onChange({ ...data, authorName: e.target.value })}
      />
      <input
        className="border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#8B2332]"
        placeholder="Relationship (e.g. Son, Colleague)"
        value={data.relationship}
        onChange={e => onChange({ ...data, relationship: e.target.value })}
      />
      <textarea
        className="border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#8B2332] resize-none"
        placeholder="Message"
        rows={2}
        value={data.message}
        onChange={e => onChange({ ...data, message: e.target.value })}
      />
    </div>
  );
}

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  function attempt() {
    if (value === ADMIN_PASSWORD) {
      onUnlock();
    } else {
      setError(true);
      setValue("");
    }
  }

  return (
    <div className="min-h-screen bg-[#5C1726] flex items-center justify-center px-6">
      <div className="bg-white p-10 text-center shadow-lg max-w-sm w-full">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#8B2332]/10 text-[#8B2332] mb-4">
          <Lock size={20} />
        </div>
        <h1 className="text-2xl font-serif text-slate-800 mb-1">Admin Access</h1>
        <p className="text-sm text-slate-500 mb-6">Enter the admin password to continue</p>
        <input
          type="password"
          value={value}
          onChange={e => { setValue(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && attempt()}
          placeholder="Password"
          className={`w-full border px-4 py-2 text-sm mb-2 outline-none focus:ring-1 focus:ring-[#8B2332] ${error ? "border-red-400" : "border-slate-300"}`}
          autoFocus
        />
        {error && <p className="text-xs text-red-500 mb-3">Incorrect password</p>}
        <Button onClick={attempt} className="w-full bg-[#8B2332] hover:bg-[#6d1b27] text-white mt-2">
          Enter
        </Button>
      </div>
    </div>
  );
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(
    sessionStorage.getItem("admin_unlocked") === "1"
  );

  function unlock() {
    sessionStorage.setItem("admin_unlocked", "1");
    setUnlocked(true);
  }

  if (!unlocked) return <PasswordGate onUnlock={unlock} />;
  return <AdminDashboard />;
}

function AdminDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: rsvps, isLoading: rsvpLoading } = useListRsvps();
  const { data: rsvpStats } = useGetRsvpStats();
  const { data: tributes, isLoading: tributeLoading } = useListTributes();
  const { data: tributeStats } = useGetTributeStats();

  const createMutation = useCreateTribute({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTributesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTributeStatsQueryKey() });
        setShowAddForm(false);
        setAddForm(emptyForm);
        toast({ title: "Testimony added" });
      },
    },
  });

  const updateMutation = useUpdateTribute({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTributesQueryKey() });
        setEditingId(null);
        toast({ title: "Testimony updated" });
      },
    },
  });

  const deleteMutation = useDeleteTribute({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTributesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTributeStatsQueryKey() });
        toast({ title: "Testimony removed" });
      },
    },
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<TributeFormData>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<TributeFormData>(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  function startEdit(t: { id: number; authorName: string; relationship: string; message: string }) {
    setEditingId(t.id);
    setEditForm({ authorName: t.authorName, relationship: t.relationship, message: t.message });
    setConfirmDeleteId(null);
  }

  function saveEdit() {
    if (!editingId) return;
    if (!editForm.authorName || !editForm.relationship || !editForm.message) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    updateMutation.mutate({ id: editingId, data: editForm });
  }

  function submitAdd() {
    if (!addForm.authorName || !addForm.relationship || !addForm.message) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    createMutation.mutate({ data: addForm });
  }

  function download(path: string, filename: string) {
    const a = document.createElement("a");
    a.href = `${BASE}${path}`;
    a.download = filename;
    a.click();
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#8B2332] mb-2">Admin</p>
          <h1 className="text-4xl font-serif text-foreground">Dashboard</h1>
        </div>

        {/* Stats */}
        <section className="mb-12">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total RSVPs" value={rsvpStats?.total} />
            <StatCard icon={UserCheck} label="In Person" value={rsvpStats?.inPerson} />
            <StatCard icon={Monitor} label="Virtual" value={rsvpStats?.virtual} />
            <StatCard icon={MessageSquare} label="Testimonies" value={tributeStats?.totalCount} />
          </div>
        </section>

        {/* Downloads */}
        <section className="mb-12">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">Export Data</h2>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => download("/api/rsvp/export", "rsvps.csv")}
              className="bg-[#8B2332] hover:bg-[#6d1b27] text-white gap-2"
            >
              <Download size={16} />
              Download RSVPs
            </Button>
            <Button
              onClick={() => download("/api/tributes/export", "testimonies.csv")}
              variant="outline"
              className="border-[#8B2332] text-[#8B2332] hover:bg-[#8B2332]/5 gap-2"
            >
              <Download size={16} />
              Download Testimonies
            </Button>
          </div>
        </section>

        {/* RSVPs Table */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">RSVPs</h2>
            <span className="text-sm text-slate-400">{rsvps?.length ?? 0} entries</span>
          </div>
          <div className="overflow-x-auto border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-[#8B2332] text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Phone</th>
                  <th className="px-4 py-3 text-left font-medium">Attendance</th>
                  <th className="px-4 py-3 text-left font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {rsvpLoading && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Loading...</td></tr>
                )}
                {!rsvpLoading && (!rsvps || rsvps.length === 0) && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No RSVPs yet</td></tr>
                )}
                {rsvps?.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-4 py-3 font-medium text-slate-800">{r.fullName}</td>
                    <td className="px-4 py-3 text-slate-600">{r.phone}</td>
                    <td className="px-4 py-3 text-slate-600">{r.attendance}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Testimonies — full CRUD */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Testimonies</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">{tributes?.length ?? 0} entries</span>
              <Button
                size="sm"
                onClick={() => { setShowAddForm(v => !v); setAddForm(emptyForm); }}
                className="bg-[#8B2332] hover:bg-[#6d1b27] text-white gap-1"
              >
                <Plus size={14} />
                Add Testimony
              </Button>
            </div>
          </div>

          {/* Add form */}
          {showAddForm && (
            <div className="border border-[#8B2332]/30 bg-[#8B2332]/5 p-4 mb-4">
              <p className="text-sm font-medium text-[#8B2332] mb-3 uppercase tracking-wide">New Testimony</p>
              <TributeFormFields data={addForm} onChange={setAddForm} />
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={submitAdd}
                  disabled={createMutation.isPending}
                  className="bg-[#8B2332] hover:bg-[#6d1b27] text-white gap-1"
                >
                  <Check size={14} />
                  {createMutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAddForm(false)}
                  className="gap-1 text-slate-500"
                >
                  <X size={14} />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-[#8B2332] text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Relationship</th>
                  <th className="px-4 py-3 text-left font-medium">Message</th>
                  <th className="px-4 py-3 text-left font-medium">Submitted</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tributeLoading && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Loading...</td></tr>
                )}
                {!tributeLoading && (!tributes || tributes.length === 0) && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No testimonies yet</td></tr>
                )}
                {tributes?.map((t, i) => (
                  editingId === t.id ? (
                    // Edit row
                    <tr key={t.id} className="bg-amber-50 border-y border-amber-200">
                      <td colSpan={4} className="px-4 py-3">
                        <TributeFormFields data={editForm} onChange={setEditForm} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={saveEdit}
                            disabled={updateMutation.isPending}
                            className="p-1.5 rounded text-green-700 hover:bg-green-100 disabled:opacity-50"
                            title="Save"
                          >
                            <Check size={15} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded text-slate-500 hover:bg-slate-100"
                            title="Cancel"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // Normal row
                    <tr key={t.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{t.authorName}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{t.relationship}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs">
                        <span className="line-clamp-2">{t.message}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        {confirmDeleteId === t.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-red-600 mr-1">Delete?</span>
                            <button
                              onClick={() => {
                                deleteMutation.mutate({ id: t.id });
                                setConfirmDeleteId(null);
                              }}
                              className="p-1.5 rounded text-red-600 hover:bg-red-100"
                              title="Confirm delete"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="p-1.5 rounded text-slate-500 hover:bg-slate-100"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEdit(t)}
                              className="p-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-[#8B2332]"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => { setConfirmDeleteId(t.id); setEditingId(null); }}
                              className="p-1.5 rounded text-slate-500 hover:bg-red-50 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
