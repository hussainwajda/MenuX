"use client";

import Link from "next/link";

export function ForbiddenView() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
        <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">403</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Permission Denied</h1>
        <p className="text-sm text-gray-600 mt-3">
          You do not have permission to access this section. Contact your owner/admin to request access.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex mt-6 rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-semibold"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
