import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/inicio" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          SISE Lite
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/inicio" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            Inicio
          </Link>
          <Link href="/materias" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            Materias
          </Link>
          <Link href="/admin" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            Admin
          </Link>
          <Link href="/perfil" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            Perfil
          </Link>
        </div>
      </nav>
    </header>
  );
}
