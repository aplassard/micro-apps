import Link from "next/link";

const APPS = [
  { href: "/apps/outfit", name: "Baby Outfit", desc: "Weather → outfit & packing list" },
  // add new apps here as you build them
];

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Micro Apps</h1>
      <ul className="grid gap-4">
        {APPS.map(app => (
          <li key={app.href} className="border rounded-xl p-4 hover:bg-gray-50">
            <Link href={app.href} className="block">
              <div className="font-medium">{app.name}</div>
              <div className="text-sm text-gray-600">{app.desc}</div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
