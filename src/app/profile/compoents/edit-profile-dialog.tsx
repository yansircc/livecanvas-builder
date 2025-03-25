"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fileToBase64 } from "@/utils/file-to-base64";
import { Upload, User } from "lucide-react";
import type { Session } from "next-auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { uploadAvatar } from "../actions/avatar";
import { updateUserProfile } from "../actions/profile";
import type { ProfileFormData } from "../actions/project";
import { MAX_BACKGROUND_LENGTH } from "../constants";

interface EditProfileDialogProps {
  session: Session | null;
}

export function EditProfileDialog({ session }: EditProfileDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    name: session?.user?.name || "",
    image: session?.user?.image || "",
    backgroundInfo: session?.user?.backgroundInfo || "",
  });

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("请上传一个图片文件");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("图片大小应该小于5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);

      // Upload to Vercel Blob and automatically delete old avatar
      const imageUrl = await uploadAvatar(
        base64,
        file.name,
        session?.user?.id || "",
        formData.image
      );
      setFormData((prev) => ({ ...prev, image: imageUrl }));
      toast.success("头像上传成功");
    } catch (error) {
      console.error("头像上传失败:", error);
      toast.error("头像上传失败");
    } finally {
      setIsUploading(false);
    }
  };

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateUserProfile({
        name: formData.get("name") as string,
        image: formData.get("image") as string,
        backgroundInfo: formData.get("backgroundInfo") as string,
      });

      if (result.success) {
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>编辑资料</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>编辑个人资料</DialogTitle>
            <DialogDescription>更新您的个人信息和背景资料。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Name field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                姓名
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            {/* Email field (read-only) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                邮箱
              </Label>
              <div className="col-span-3">
                <Input
                  id="email"
                  value={session?.user?.email || ""}
                  className="bg-zinc-50 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400"
                  readOnly
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  邮箱地址不能被修改
                </p>
              </div>
            </div>

            {/* Avatar upload */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="avatar" className="mt-2 text-right">
                头像
              </Label>
              <div className="col-span-3">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    {formData.image ? (
                      <Image
                        src={formData.image}
                        alt="User avatar"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-8 w-8 text-zinc-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="avatar-upload"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-1.5 font-medium text-sm text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {isUploading ? "上传中..." : "上传头像"}
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                    />
                    <input type="hidden" name="image" value={formData.image} />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      支持JPG、PNG格式，最大5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Background info */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="backgroundInfo" className="mt-2 text-right">
                背景信息
              </Label>
              <div className="col-span-3">
                <div className="relative">
                  <Textarea
                    id="backgroundInfo"
                    name="backgroundInfo"
                    value={formData.backgroundInfo || ""}
                    onChange={handleInputChange}
                    className="min-h-[120px] resize-y"
                    placeholder="添加您的背景信息，以便AI更好地理解您的需求"
                    rows={10}
                    maxLength={MAX_BACKGROUND_LENGTH}
                  />
                  <div className="mt-1 flex justify-between">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      此信息将用于AI生成时的上下文，帮助AI更好地理解您的需求
                    </p>
                    <span
                      className={`text-xs ${
                        (formData.backgroundInfo?.length || 0) >
                        MAX_BACKGROUND_LENGTH * 0.9
                          ? "text-amber-500"
                          : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {formData.backgroundInfo?.length || 0}/
                      {MAX_BACKGROUND_LENGTH}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "保存中..." : "保存更改"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
