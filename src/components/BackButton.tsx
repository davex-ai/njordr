"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => (window.history.length > 1 ? router.back() : router.push("/products"))}
      className="btn !px-4 !py-1.5">
      ← Back
    </button>
  );
}
