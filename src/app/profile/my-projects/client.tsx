"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { Project } from "@/types/project";
import { Edit, Eye, MoreHorizontal, Search, Trash } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { deleteProject, updateProject } from "../actions/project";
import { EditProjectDialog } from "./edit-project-dialog";

interface MyProjectsClientProps {
  initialProjects: Project[];
  userId: string;
}

export default function MyProjectsClient({
  initialProjects,
  userId,
}: MyProjectsClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Filter projects based on search query
  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false)
  );

  // Handle project deletion
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("确定要删除这个项目吗？")) return;

    try {
      if (!userId) {
        toast.error("请先登录");
        return;
      }

      const result = await deleteProject(projectId, userId);
      if (result.success) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        toast.success("项目删除成功");
      } else {
        toast.error(result.error || "删除项目失败");
      }
    } catch (error) {
      console.error("删除项目失败:", error);
      toast.error("删除项目失败");
    }
  };

  // Handle project update after editing
  const handleProjectUpdate = async (updatedProject: Project) => {
    try {
      if (!userId) {
        toast.error("请先登录");
        return;
      }

      const result = await updateProject(updatedProject.id, userId, {
        title: updatedProject.title,
        description: updatedProject.description,
        tags: updatedProject.tags,
        isPublished: updatedProject.isPublished,
      });

      if (result.success) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === updatedProject.id ? { ...p, ...updatedProject } : p
          )
        );
        setEditingProject(null);
        toast.success("项目更新成功");
      } else {
        toast.error(result.error || "更新项目失败");
      }
    } catch (error) {
      console.error("更新项目失败:", error);
      toast.error("更新项目失败");
    }
  };

  // View project in gallery
  const handleViewProject = (projectId: string) => {
    window.open(`/gallery?project=${projectId}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div>
        <div className="relative max-w-md">
          <Input
            placeholder="搜索项目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-zinc-200 bg-white pr-10 dark:border-zinc-700 dark:bg-zinc-800"
          />
          <Search className="-translate-y-1/2 absolute top-1/2 right-3 h-4 w-4 text-zinc-400" />
        </div>
      </div>

      {/* Projects list */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-300 border-dashed bg-zinc-50 py-12 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Search className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
          </div>
          <h3 className="mt-4 font-medium text-lg text-zinc-900 dark:text-zinc-100">
            没有找到项目
          </h3>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            {searchQuery ? "尝试不同的搜索词" : "创建你的第一个项目以开始"}
          </p>
          <Button
            className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
          >
            创建新项目
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="overflow-hidden border-zinc-200 dark:border-zinc-800"
            >
              <div className="relative aspect-video w-full">
                <Image
                  src={
                    project.thumbnail ||
                    "https://images.unsplash.com/photo-1618788372246-79faff0c3742?q=80&w=2070&auto=format&fit=crop"
                  }
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="line-clamp-1 font-medium text-zinc-900 dark:text-zinc-100">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem
                        onClick={() => handleViewProject(project.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        查看
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEditingProject(project)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      project.isPublished
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    }`}
                  >
                    {project.isPublished ? "已发布" : "草稿"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit project dialog */}
      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSave={handleProjectUpdate}
        />
      )}
    </div>
  );
}
