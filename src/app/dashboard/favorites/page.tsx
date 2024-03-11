"use client";
import { useQuery } from "convex/react";
import FileBrowserPage from "../_components/file_browser";

export default function FavoritesPage() {
  return (
    <div>
      <FileBrowserPage title="Your Favorites" favorites />
    </div>
  );
}
