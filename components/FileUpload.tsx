"use client";
import { Inbox, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { useDropzone } from "react-dropzone";
import { useState } from "react";
import { uploadToS3 } from "./s3";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-hot-toast";

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.size > 20 * 1024 * 1024) {
        toast.error("file too large");
        return;
      }

      try {
        setUploading(true);
        const data = await uploadToS3(file);
        console.log("data from s3 --- ", data);
        if (!data?.file_key || !data.file_name) {
          toast.error("something went wrong, no file_key or file name");
          return;
        }

        mutate(data, {
          onSuccess: ({ chat_id }) => {
            console.log("dog", typeof chat_id);
            toast.success("chat created");
            router.push(`/chat/${chat_id}`);
          },
        });
      } catch (error) {
        console.log("file upload error -- ", error);
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading || isPending ? (
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Im thinking really hard
            </p>
          </>
        ) : (
          <>
            <p>Drop PDF here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
