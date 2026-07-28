import Header from "@/components/Header";
import MobileBottomBar from "@/components/public/MobileBottomBar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="pb-16 md:pb-0">
        {children}
      </main>
      <MobileBottomBar />
    </>
  );
}
