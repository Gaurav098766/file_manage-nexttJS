// 'use client'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import {Doc, Id} from "../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
  
import { FileTextIcon, GanttChartIcon, ImageIcon, MoreVertical, Trash2Icon } from "lucide-react"
import { ReactNode, useState } from "react"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

  
export const FileCardAction = ({file}: {file:Doc<"files">}) =>{
  const {toast} = useToast()
  const deleteFile = useMutation(api.files.deleteFile)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  return (
        <>
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your file
                and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async()=>{
                  deleteFile({
                    fileId:file._id
                  });
                  toast({
                    variant: "default",
                    title: "File Deleted",
                    description: "Your file was successfully deleted",
                  })
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <DropdownMenu>
            <DropdownMenuTrigger><MoreVertical/></DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem
                    onClick={()=>{setIsConfirmOpen(true);}} 
                    className="flex gap-1 text-red-600 items-center cursor-pointer">
                    <Trash2Icon className="w-4 h-4"/>Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        </>
    )
}

function getImageUrl(fileId: Id<"_storage">):string {
  return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
}

  export const FileCard = ({file}: {file:Doc<"files">})=>{
    
    const iconType = {
      "image": <ImageIcon/>,
      "pdf": <FileTextIcon/>,
      "csv": <GanttChartIcon/>,
    } as Record<Doc<"files">["type"], ReactNode>;
    

    return (
        <Card>
        <CardHeader className="relative">
          <CardTitle className="flex gap-2">
            <div>{iconType[file.type]}</div>
            {file.name}
          </CardTitle>
          <div className="absolute top-2 right-2">
            <FileCardAction file={file}/>
          </div>
        </CardHeader>
        <CardContent>
          {
            file.type === "image" && (
              <Image
                alt={file.name}
                width="200"
                height="100" 
                src={getImageUrl(file.fileId)}                // src={file.url}
              />
          )}

            {file.type === "csv" && <GanttChartIcon className="w-20 h-20"/>}
            {file.type === "pdf" && <FileTextIcon className="w-20 h-20"/>}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={()=>{
            window.open(getImageUrl(file.fileId), "_blank")
          }}>Download</Button>
        </CardFooter>
      </Card>
      
    )
  }