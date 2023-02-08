import Link from "next/link";

const path = [
  { uid: 21, name: " Home", id: 1, path: "/" },
  { uid: 31, name: "Approve", id: 2, path: "/approve/Approve" },
  { uid: 41, name: "Distribute", id: 3, path: "/distribute/Distribute" },
  { uid: 51, name: "Payment", id: 4, path: "/bacalhau" },
];
export default function Header() {
  return (
    <header>
      <nav>
        <ul>
          {path.map((value) => {
            return (
              <li key={value.uid}>
                <Link href={value.path}>{value.name}</Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
