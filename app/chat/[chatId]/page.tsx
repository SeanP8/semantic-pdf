import ChatComponent from "@/components/ChatComponent";
import ChatSidBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

type Props = {
  params: {
    chatId: string;
  };
};
const ChatPage = async ({ params: { chatId } }: Props) => {
  console.log("chat id page -- ", chatId);
  const _chats = await db
    .select()
    .from(chats)
    .where(sql`${chats.id} = ${chatId}`);
  console.log("_chats -- ", _chats);
  // if (!_chats) {
  //   return redirect("/");
  // }
  // if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
  //   return redirect("/");
  // }

  const currentChat = _chats;
  console.log("current chat --- ", currentChat[0].pdfUrl);
  return (
    <div className="flex h-screen max-h-screen ">
      <div className="flex w-full max-h-screen overflow-scroll">
        <div className="flex-[1]">
          <ChatSidBar chats={_chats} chatId={parseInt(chatId)} />
        </div>
        <div className="max-h-screen p-4 overflow-scroll flex-[5]">
          <PDFViewer pdf_url={currentChat[0].pdfUrl || ""} />
        </div>
        <div className="flex-[3] border-1-4 border-1-slate-200">
          <ChatComponent chatId={currentChat[0].id} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
