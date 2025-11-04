// components/FormWrapper.jsx
'use client';

export default function FormWrapper({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded p-6 flex flex-col gap-4">
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
}
