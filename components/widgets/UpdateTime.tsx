'use client';

import { useState, useSyncExternalStore } from 'react';
import { formatVNDateTime } from '@/lib/api';

/**
 * Component hiển thị thời gian cập nhật - tự động lấy thời gian hiện tại
 * Dùng useSyncExternalStore để tránh hydration mismatch
 */
function getTimeSnapshot() {
  return formatVNDateTime();
}

function getServerSnapshot() {
  return ''; // Server không render thời gian (tránh hydration mismatch)
}

function subscribe(callback: () => void) {
  // Không cần subscribe vì thời gian chỉ cần hiển thị 1 lần khi mount
  return () => {};
}

export function UpdateTime() {
  const timeStr = useSyncExternalStore(subscribe, getTimeSnapshot, getServerSnapshot);

  if (!timeStr) return null;

  return (
    <p className="text-sm text-muted-foreground italic mb-6">
      Nguồn: giavang.org - Cập nhật lúc {timeStr}
    </p>
  );
}
