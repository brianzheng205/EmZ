import Link from "next/link";

export default function Anniversary() {
  return (
    <div>
      <h1>Anniversaries</h1>
      <div>
        <Link href="/specialOccasions/anniversary/2024">
          <p>2024</p>
        </Link>
      </div>
    </div>
  );
}
