import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-[300px]">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center">
          <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
        </div>
        <p className="max-w-xl mt-1 text-lg text-slate-600">
          Join millions of students, researchers and professionals to instantly
          answer questions and understand with AI
        </p>
      </div>
      <div className="w-full mt-4 ">
        <FileUpload />
      </div>
      <div className="pt-8">
        <h2 className="max-w-xl mt-1 text-lg text-slate-600">
          We're going viral
        </h2>
      </div>
    </main>
  );
}
