import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Special Occasions</h1>
      <div>
        <Link href="/specialOccasions/anniversary">
          <p>Anniversaries</p>
        </Link>
      </div>
    </div>
  );
}
