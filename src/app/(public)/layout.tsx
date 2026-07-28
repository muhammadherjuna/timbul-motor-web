import Header from "@/components/Header";
import Footer from "@/components/public/Footer";
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
      <Footer />
      <MobileBottomBar />
    </>
  );
}
