import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "minigolf" },
    { name: "description", content: "Welcome to Minigolf!" },
  ];
};

export default function Index() {
  return (
    <div className="bg-gradient-to-b from-blue-200 to-blue-100 h-[calc(100dvh)]">
      <p className="text-center">minigolf</p>
    </div>
  );
}
