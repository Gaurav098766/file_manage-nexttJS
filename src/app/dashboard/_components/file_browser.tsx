"use client";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import UploadButton from "./upload-button";
import { FileCard } from "./file-card";
import Image from "next/image";
import { Grid2X2Icon, Loader2, Table2Icon } from "lucide-react";
import { SearchBar } from "./search-bar";
import { useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./file-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Doc } from "../../../../convex/_generated/dataModel";
import { Label } from "@/components/ui/label";

function PlaceHolder() {
  return (
    <div className="flex flex-col gap-8 items-center w-full mt-24">
      <Image
        alt="an image of picture"
        width="300"
        height="300"
        src="/empty.svg"
      />
      <div className="text-2xl">
        You have no files, go ahead and upload one.
      </div>
      <UploadButton />
    </div>
  );
}

export default function FileBrowserPage({
  title,
  favoritesOnly,
  deleteOnly,
}: {
  title: string;
  favoritesOnly?: boolean;
  deleteOnly?: boolean;
}) {
  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<Doc<"files">["type"] | "all">("all");

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const favorites = useQuery(
    api.files.getAllFavorites,
    orgId ? { orgId } : "skip"
  );

  const files = useQuery(
    api.files.getFiles,
    orgId
      ? {
          orgId,
          type: type === "all" ? undefined : type,
          query,
          favorites: favoritesOnly,
          deleteOnly,
        }
      : "skip"
  );

  const isLoading = files === undefined;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold ">{title}</h1>
        <SearchBar query={query} setQuery={setQuery} />
        <UploadButton />
      </div>

      <Tabs defaultValue="grid">
        <div className="flex justify-between items-center">
          <TabsList className="mb-2">
            <TabsTrigger value="grid" className="flex gap-2">
              <Grid2X2Icon />
              Grid
            </TabsTrigger>
            <TabsTrigger value="table" className="flex gap-2">
              <Table2Icon />
              Table
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2 items-center">
            <Label htmlFor="type-Select">Type Filter</Label>
            <Select
              value={type}
              onValueChange={(newType) => {
                setType(newType as any);
              }}
            >
              <SelectTrigger id="type-Select" className="w-[180px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {isLoading && (
          <div className="flex flex-col gap-8 items-center w-full mt-24">
            <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
            <div className="text-2xl">Loading your files....</div>
          </div>
        )}
        <TabsContent value="grid">
          <div className="grid grid-cols-3 gap-4">
            {files?.map((file) => {
              return (
                <FileCard
                  favorites={favorites ?? []}
                  key={file._id}
                  file={file}
                />
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="table">
          <DataTable columns={columns} data={files} />
        </TabsContent>
      </Tabs>
      {files?.length === 0 && <PlaceHolder />}
    </div>
  );
}
