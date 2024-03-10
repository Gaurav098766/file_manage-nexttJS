// 'use client'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import {Doc} from "../../convex/_generated/dataModel"
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
  
import { MoreVertical, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useToast } from "@/components/ui/use-toast"

  
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

  export const FileCard = ({file}: {file:Doc<"files">})=>{
    return (
        <Card>
        <CardHeader className="relative">
          <CardTitle>
            {file.name}
          </CardTitle>
          <div className="absolute top-2 right-2">
            <FileCardAction file={file}/>
          </div>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <Button>Button</Button>
        </CardFooter>
      </Card>
      
    )
  }