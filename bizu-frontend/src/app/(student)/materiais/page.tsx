"use client";

import PageHeader from "@/components/PageHeader";
import { Search, Filter, FileText, Download, Play, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, Suspense } from "react";
import { apiFetch } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { Skeleton } from "@/components/ui/skeleton";
import MaterialViewerModal from "@/components/MaterialViewerModal";

function MaterialsContent() {
    const searchParams = useSearchParams();
    const moduleId = searchParams.get("moduleId");

    const [materials, setMaterials] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal state
    const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewMaterial = (material: any) => {
        setSelectedMaterial(material);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const fetchMaterials = async () => {
            setIsLoading(true);
            try {
                const endpoint = moduleId
                    ? `/student/materials/module/${moduleId}`
                    : "/student/materials";
                const res = await apiFetch(endpoint);
                if (res.ok) {
                    const data = await res.json();
                    setMaterials(data);
                }
            } catch (error) {
                console.error("Failed to fetch materials", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMaterials();
    }, [moduleId]);

    const filteredMaterials = materials.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <PageHeader
                title="Materiais de Estudo"
                description="Acesse apostilas, mapas mentais e resumos para potencializar seus estudos."
                badge="BIBLIOTECA"
            />

            <div className="flex flex-col md:flex-row gap-4 mb-12">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar materiais pelo título ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 rounded-2xl bg-card border-none shadow-sm focus-visible:ring-primary"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-6 h-12 bg-card rounded-2xl border shadow-sm hover:bg-muted transition-colors font-medium text-slate-600">
                    <Filter className="w-4 h-4" />
                    Filtrar Tipo
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-16 w-full rounded-2xl bg-muted/20" />
                    ))}
                </div>
            ) : filteredMaterials.length === 0 ? (
                <div className="text-center py-24 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-600">Nenhum material encontrado</h3>
                    <p className="text-sm text-slate-400">Tente buscar por termos diferentes ou confira seus cursos.</p>
                </div>
            ) : (
                <div className="bg-card rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-slate-50 bg-slate-50/30">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Material</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Módulo</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Curso</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredMaterials.map((material) => (
                                    <tr key={material.id} className="group hover:bg-slate-50/50 transition-all duration-200">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105",
                                                    material.fileType === 'PDF' || material.fileType === 'DOC' ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                                                )}>
                                                    {material.fileType === 'PDF' || material.fileType === 'DOC' ? <FileText size={22} /> : <Play size={22} />}
                                                </div>
                                                <div className="max-w-md">
                                                    <h4 className="font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors">{material.title}</h4>
                                                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{material.description || "Material de apoio para aula"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-semibold text-slate-600 truncate max-w-[200px]">
                                                    {material.moduleTitle || "Módulo Geral"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100/50">
                                                {material.courseTitle || "Independente"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleViewMaterial(material)}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                                                >
                                                    <Eye size={14} /> Visualizar
                                                </button>
                                                <a
                                                    href={material.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-slate-50 text-slate-300 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all"
                                                >
                                                    <Download size={18} />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Material Viewer Modal */}
            <MaterialViewerModal
                material={selectedMaterial}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

export default function MaterialsPage() {
    return (
        <Suspense fallback={<div className="container mx-auto px-4 py-24 text-center">Carregando biblioteca...</div>}>
            <MaterialsContent />
        </Suspense>
    );
}
