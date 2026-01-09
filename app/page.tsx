import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-8">
        <div className="relative h-64 w-64">
          <Image
            src="/img/logo.png"
            alt="Gas"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
