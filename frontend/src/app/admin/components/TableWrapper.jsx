// components/TableWrapper.jsx
'use client';

export default function TableWrapper({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded p-6 mt-6">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
