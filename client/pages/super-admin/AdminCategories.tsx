import React, { useEffect, useState } from "react";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle2,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api";
import { AdminLayout } from "./AdminLayout";
import { useAdminTheme } from "./AdminThemeContext";

export function AdminCategoriesPage() {
  const { isDark } = useAdminTheme();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    adminApi.getCategories()
      .then((res) => {
        if (res.results) setCategories(res.results);
        else if (Array.isArray(res)) setCategories(res);
        else if (res.data) setCategories(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCat(null);
    setName("");
    setDescription("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setEditingCat(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCat) {
        await adminApi.updateCategory(editingCat.id, { name, description });
      } else {
        await adminApi.createCategory({ name, description });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (cat: any) => {
    if (!window.confirm(`Are you sure you want to delete the category "${cat.name}"?`)) return;
    try {
      await adminApi.deleteCategory(cat.id);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || "Failed to delete category");
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const cardBg = isDark ? "bg-[#0e1424] border-slate-800" : "bg-white border-slate-200";

  return (
    <AdminLayout
      title="Job Industry & Category Management"
      subtitle="Define, organize, and manage standard industry categories for job postings."
      actions={
        <Button onClick={handleOpenCreate} size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Create Category
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Search Toolbar */}
        <div className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between gap-4 ${cardBg}`}>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`h-11 w-full rounded-xl pl-10 pr-4 text-xs outline-none transition border ${
                isDark ? "bg-slate-900 border-slate-700 text-white focus:border-blue-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500"
              }`}
            />
          </div>
          <span className="text-xs font-bold text-slate-400">Total: {filteredCategories.length} Categories</span>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading categories...</div>
        ) : filteredCategories.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${cardBg}`}>
            <Layers className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-extrabold text-sm">No categories found</h3>
            <p className="text-xs text-slate-500 mt-1">Create your first category using the button above.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((c) => (
              <div
                key={c.id}
                className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between transition hover:shadow-lg ${cardBg}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950 font-bold text-blue-600 dark:text-blue-400 text-sm">
                      <Layers className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 font-semibold">{c.slug}</span>
                  </div>

                  <h3 className="mt-4 font-extrabold text-base">{c.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {c.description || "No description provided."}
                  </p>
                </div>

                <div className={`mt-6 pt-4 border-t ${isDark ? "border-slate-800" : "border-slate-100"} flex items-center justify-between`}>
                  <span className="text-xs font-bold text-slate-400">
                    {c.jobs_count !== undefined ? `${c.jobs_count} Jobs` : "Active"}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(c)}
                      className="rounded-xl text-xs p-2 text-slate-400 hover:text-blue-500"
                      title="Edit Category"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteCategory(c)}
                      className="rounded-xl text-xs p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                      title="Delete Category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CREATE / EDIT CATEGORY MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
            <form onSubmit={handleSaveCategory} className={`w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-4 ${isDark ? "bg-[#0e1424] border-slate-700" : "bg-white border-slate-200"}`}>
              <h3 className="text-lg font-extrabold">{editingCat ? "Edit Category" : "Create Job Category"}</h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Software & Engineering"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`h-11 w-full rounded-xl px-4 text-xs outline-none border ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of roles in this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full rounded-xl p-3 text-xs outline-none border ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-xs">
                  {saving ? "Saving..." : editingCat ? "Update Category" : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
