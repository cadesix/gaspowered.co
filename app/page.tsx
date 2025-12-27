import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <div className="relative h-64 w-64 bg-gray-200 rounded-lg">
          <Image
            src="/img/gastank.png"
            alt="Gas"
            fill
            className="object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
