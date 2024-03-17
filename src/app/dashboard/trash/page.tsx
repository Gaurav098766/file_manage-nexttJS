"use client";

import FileBrowserPage from "../_components/file_browser";

export default function TrashPage() {
  return (
    <div>
      <FileBrowserPage title="Your Favorites" deleteOnly />
    </div>
  );
}
